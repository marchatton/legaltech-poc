import "server-only";

import { z } from "zod";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0KindSchema,
  ListPayloadV0Schema,
  emptyListPayloadV0,
} from "@orbital-poc/core";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { parseDemoMatterMetadata } from "../lib/demoMatterMetadata";
import { loadSeedSnapshot, type ResolvedSeedSnapshot } from "../lib/fixtureSeed.server";
import { newId } from "../lib/ids";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import { completeRunIfReady, transitionRunState } from "../lib/runLifecycle.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
  question_id: z.string().min(1),
});

type RunRow = {
  id: string;
  folder_id: string;
  folder_name: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type FolderDocumentRow = {
  id: string;
  filename: string;
  upload_completed_at: Date | null;
  parse_status: string;
  ocr_status: string;
};

type QuickStartRowStatus = "needs_review" | "reviewed" | "missing_input" | "citation_failed";

type QuickStartRow = {
  folder_id: string;
  question_set_version: string;
  question_id: string;
  question: string;
  answer: string;
  status: QuickStartRowStatus;
  citation_ids: string[];
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown | null;
};

type QuickStartLockedCitation = {
  id: string;
  document_id: string;
  page_number: number;
  snippet: string;
  snippet_hash: string;
  polygons_json: unknown;
};

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }): QuickStartRow {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Not found in provided documents.",
    status: "missing_input" as const,
    citation_ids: [] as string[],
    notes: null as string | null,
    provenance_json: {
      missing_docs_checklist: [
        {
          label: "Upload the referenced document(s)",
          confidence: 1,
          signals: [
            {
              type: "phrase",
              value: args.question,
              source: "system",
            },
          ],
        },
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function citationFailedRow(args: {
  folderId: string;
  questionSetVersion: string;
  questionId: string;
  question: string;
}): QuickStartRow {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce citations.",
    status: "citation_failed" as const,
    citation_ids: [] as string[],
    notes: null as string | null,
    provenance_json: {
      reason_code: "NO_CITATIONS",
      checklist: [
        "Confirm the correct PDFs are uploaded for this folder.",
        "Re-run the workflow after retrieval+locking is implemented.",
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function attachListPayloadIfNeeded<
  T extends {
    payload_schema_version: string | null;
    payload_json: unknown | null;
  },
>(
  row: T,
  question: { response_kind: string; artefact_kind?: string; payload_schema_version?: string },
): T {
  if (question.response_kind !== "list_payload") return row;
  if (row.payload_schema_version !== null || row.payload_json !== null) return row;

  if (question.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported payload_schema_version for list_payload: ${String(question.payload_schema_version ?? "null")}`,
    );
  }

  const kind = ListPayloadV0KindSchema.parse(question.artefact_kind);
  const payload = emptyListPayloadV0(kind);
  ListPayloadV0Schema.parse(payload);

  return {
    ...row,
    payload_schema_version: LIST_PAYLOAD_V0_SCHEMA_VERSION,
    payload_json: payload,
  } as T;
}

function normalizeFilename(filename: string): string {
  return filename.trim().toLowerCase();
}

function asNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function collectPayloadCitationIds(args: {
  payloadSchemaVersion: string | null;
  payloadJson: unknown | null;
}): string[] {
  if (args.payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) return [];
  const parsed = ListPayloadV0Schema.safeParse(args.payloadJson);
  if (!parsed.success) return [];
  const ids = parsed.data.items.flatMap((item) => item.citation_ids);
  return Array.from(new Set(ids));
}

function remapPayloadCitationIds(args: {
  payloadSchemaVersion: string | null;
  payloadJson: unknown | null;
  citationIdMap: ReadonlyMap<string, string>;
}): unknown | null {
  if (args.payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) return args.payloadJson ?? null;
  const parsed = ListPayloadV0Schema.safeParse(args.payloadJson);
  if (!parsed.success) return args.payloadJson ?? null;

  return {
    ...parsed.data,
    items: parsed.data.items.map((item) => ({
      ...item,
      citation_ids: item.citation_ids.flatMap((citationId) => {
        const mapped = args.citationIdMap.get(citationId);
        return mapped ? [mapped] : [];
      }),
    })),
  };
}

function resolveDemoSeedSnapshot(folderName: string): ResolvedSeedSnapshot | null {
  const metadata = parseDemoMatterMetadata(folderName);
  if (!metadata) return null;
  try {
    return loadSeedSnapshot(metadata.packId);
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("wdk.quick_start.write_row_v0.seed_snapshot_failed", {
      pack_id: metadata.packId,
      message: err instanceof Error ? err.message : String(err),
    });
    return null;
  }
}

function seededRowFromSnapshot(args: {
  snapshot: ResolvedSeedSnapshot;
  folderId: string;
  questionSetVersion: string;
  question: {
    question_id: string;
    question: string;
  };
  docIdByFilename: ReadonlyMap<string, string>;
}): { row: QuickStartRow; citations: QuickStartLockedCitation[] } | null {
  const sourceRow = args.snapshot.rows.find((row) => row.question_id === args.question.question_id);
  if (!sourceRow) return null;

  const payloadSchemaVersion = asNullableString(
    (sourceRow as {
      payload_schema_version?: unknown;
    }).payload_schema_version,
  );
  const payloadJson =
    (sourceRow as {
      payload_json?: unknown;
    }).payload_json ?? null;
  const sourceCitationIds = Array.from(
    new Set([
      ...sourceRow.citation_ids,
      ...collectPayloadCitationIds({
        payloadSchemaVersion,
        payloadJson,
      }),
    ]),
  );

  const citationIdMap = new Map<string, string>();
  const citations: QuickStartLockedCitation[] = [];
  for (const sourceCitationId of sourceCitationIds) {
    const sourceCitation = args.snapshot.citations?.[sourceCitationId];
    if (!sourceCitation) continue;

    const mappedId = newId("cit");
    citationIdMap.set(sourceCitationId, mappedId);

    const mappedDocumentId =
      args.docIdByFilename.get(normalizeFilename(sourceCitation.document_filename)) ?? sourceCitation.document_id;

    citations.push({
      id: mappedId,
      document_id: mappedDocumentId,
      page_number: sourceCitation.page_number,
      snippet: sourceCitation.snippet,
      snippet_hash: sourceCitation.snippet_hash,
      polygons_json: sourceCitation.polygons,
    });
  }

  return {
    row: {
      folder_id: args.folderId,
      question_set_version: args.questionSetVersion,
      question_id: args.question.question_id,
      question: args.question.question,
      answer: sourceRow.answer,
      status: sourceRow.status,
      citation_ids: sourceRow.citation_ids.flatMap((citationId) => {
        const mapped = citationIdMap.get(citationId);
        return mapped ? [mapped] : [];
      }),
      notes: typeof sourceRow.notes === "string" ? sourceRow.notes : null,
      provenance_json:
        (sourceRow as {
          provenance_json?: unknown;
        }).provenance_json ?? {},
      payload_schema_version: payloadSchemaVersion,
      payload_json: remapPayloadCitationIds({
        payloadSchemaVersion,
        payloadJson,
        citationIdMap,
      }),
    },
    citations,
  };
}

export async function quickStartWriteRowV0Step(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);
  const s = withDb(args.db);
  if (!args.db) await ensureSchema();

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.write_row_v0.started", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    trace_id: input.trace_id ?? null,
    question_id: input.question_id,
  });

  const startedAt = Date.now();

  const runs = await s<RunRow[]>`
    SELECT r.id, r.folder_id, f.name AS folder_name, r.state, r.question_set_version, r.trace_id, r.questions_total, r.questions_done
    FROM runs r
    JOIN folders f ON f.id = r.folder_id
    WHERE r.id = ${args.step.run_id}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return { output: { ok: true, skipped: true, reason: "RUN_NOT_FOUND" }, metrics: { duration_ms: 0, wrote: 0 } };
  }

  if (run.state !== "running") {
    return {
      output: { ok: true, skipped: true, reason: "RUN_NOT_RUNNING", state: run.state },
      metrics: { duration_ms: 0, wrote: 0 },
    };
  }

  const { version: currentQuestionSetVersion, questionSet } = await loadQuestionSetV1();
  if (currentQuestionSetVersion !== run.question_set_version) {
    const transition = await transitionRunState({
      runId: args.step.run_id,
      to: "failed",
      errorJson: {
        code: "QUESTION_SET_MISMATCH",
        message: "Pinned question_set_version does not match current question set.",
      },
      db: s,
    });
    if (!transition.ok && transition.reason !== "TERMINAL_IMMUTABLE") {
      // eslint-disable-next-line no-console
      console.warn("run.transition_failed", {
        run_id: args.step.run_id,
        to: "failed",
        reason: transition.reason,
        current_state: transition.currentState,
      });
    }

    const durationMs = Date.now() - startedAt;
    return {
      output: { ok: false, run_id: args.step.run_id, code: "QUESTION_SET_MISMATCH", duration_ms: durationMs },
      metrics: { duration_ms: durationMs, wrote: 0 },
    };
  }

  let q: (typeof questionSet.questions)[number] | null = null;
  for (const candidate of questionSet.questions) {
    if (candidate.question_id === input.question_id) {
      q = candidate;
      break;
    }
  }

  if (!q) {
    const transition = await transitionRunState({
      runId: args.step.run_id,
      to: "failed",
      errorJson: {
        code: "QUESTION_NOT_FOUND",
        message: "Question not found in current question set.",
        details: { question_id: input.question_id },
      },
      db: s,
    });
    if (!transition.ok && transition.reason !== "TERMINAL_IMMUTABLE") {
      // eslint-disable-next-line no-console
      console.warn("run.transition_failed", {
        run_id: args.step.run_id,
        to: "failed",
        reason: transition.reason,
        current_state: transition.currentState,
      });
    }

    const durationMs = Date.now() - startedAt;
    return {
      output: { ok: false, run_id: args.step.run_id, code: "QUESTION_NOT_FOUND", duration_ms: durationMs },
      metrics: { duration_ms: durationMs, wrote: 0 },
    };
  }

  const documents = await s<FolderDocumentRow[]>`
    SELECT id, filename, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE folder_id = ${run.folder_id}
  `;
  const hasDocs = documents.some(
    (doc) => doc.upload_completed_at !== null && doc.parse_status === "parsed" && doc.ocr_status === "done",
  );
  const docIdByFilename = new Map<string, string>();
  for (const doc of documents) {
    const key = normalizeFilename(doc.filename);
    if (!key || docIdByFilename.has(key)) continue;
    docIdByFilename.set(key, doc.id);
  }

  const demoSeedSnapshot = hasDocs ? resolveDemoSeedSnapshot(run.folder_name) : null;
  const seeded =
    hasDocs && demoSeedSnapshot
      ? seededRowFromSnapshot({
          snapshot: demoSeedSnapshot,
          folderId: run.folder_id,
          questionSetVersion: run.question_set_version,
          question: {
            question_id: q.question_id,
            question: q.question,
          },
          docIdByFilename,
        })
      : null;

  const baseRow =
    seeded?.row ??
    (hasDocs
    ? citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      })
    : missingInputRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      }));
  let rowCitations = seeded?.citations ?? [];

  let rowWithPayload: QuickStartRow = baseRow;
  try {
    rowWithPayload = attachListPayloadIfNeeded(baseRow, q);
  } catch {
    rowWithPayload = citationFailedRow({
      folderId: run.folder_id,
      questionSetVersion: run.question_set_version,
      questionId: q.question_id,
      question: q.question,
    });
    rowCitations = [];
    rowWithPayload.provenance_json = {
      reason_code: "VALIDATION_ERROR",
      checklist: ["Question set payload metadata is invalid for this row."],
    };
  }

  const reasonCode =
    rowWithPayload.status === "citation_failed"
      ? String((rowWithPayload.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
      : null;

  const traceId = run.trace_id ?? input.trace_id ?? newId("trc");

  async function attemptWrite(
    row: QuickStartRow,
    citations: QuickStartLockedCitation[],
  ): Promise<{ inserted: boolean; status: QuickStartRowStatus; reason_code: string | null }> {
    const rowReasonCode =
      row.status === "citation_failed"
        ? String((row.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    const inserted = await s.begin(
      async function (tx) {
        const t = tx as unknown as typeof sql;

        const payload = row.payload_json ?? null;
        const payloadJson = payload === null ? null : t.json(payload as JsonArg);

        const insertedRows = await t<{ id: string }[]>`
          INSERT INTO report_rows (
            id,
            run_id,
            folder_id,
            question_set_version,
            question_id,
            question,
            answer,
            status,
            notes,
            provenance_json,
            payload_schema_version,
            payload_json,
            created_at,
            updated_at
          )
          VALUES (
            ${newId("row")},
            ${args.step.run_id},
            ${row.folder_id},
            ${row.question_set_version},
            ${row.question_id},
            ${row.question},
            ${row.answer},
            ${row.status},
            ${row.notes},
            ${t.json(row.provenance_json as JsonArg)},
            ${row.payload_schema_version},
            ${payloadJson},
            now(),
            now()
          )
          ON CONFLICT (run_id, question_id) DO NOTHING
          RETURNING id
        `;

        const insertedRow = insertedRows[0];
        if (!insertedRow) return false;

        for (const citation of citations) {
          await t`
            INSERT INTO citations (
              id,
              report_row_id,
              document_id,
              page_number,
              snippet,
              snippet_hash,
              polygons_json,
              locked_at,
              created_at
            )
            VALUES (
              ${citation.id},
              ${insertedRow.id},
              ${citation.document_id},
              ${citation.page_number},
              ${citation.snippet},
              ${citation.snippet_hash},
              ${t.json(citation.polygons_json as JsonArg)},
              now(),
              now()
            )
          `;
        }

        const reasonKey = rowReasonCode ?? "VALIDATION_ERROR";

        await t`
          UPDATE runs
          SET questions_done = LEAST(questions_total, questions_done + 1),
              failure_counts_json = CASE
                WHEN ${row.status} = 'citation_failed' THEN jsonb_set(
                  failure_counts_json,
                  ARRAY[${reasonKey}]::text[],
                  to_jsonb(COALESCE((failure_counts_json->>${reasonKey})::int, 0) + 1),
                  true
                )
                ELSE failure_counts_json
              END,
              updated_at = now()
          WHERE id = ${args.step.run_id}
        `;

        return true;
      },
    );

    return { inserted, status: row.status, reason_code: rowReasonCode };
  }

  let wrote = false;
  let rowStatus = rowWithPayload.status;
  let finalReasonCode = reasonCode;

  try {
    const res = await attemptWrite(rowWithPayload, rowCitations);
    wrote = res.inserted;
    rowStatus = res.status;
    finalReasonCode = res.reason_code;
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("wdk.quick_start.write_row_v0.write_failed", {
      orchestration: "wdk",
      worker_id: args.workerId,
      step_id: args.step.id,
      run_id: args.step.run_id,
      step_key: args.step.step_key,
      question_id: input.question_id,
      trace_id: traceId,
      message: err instanceof Error ? err.message : String(err),
    });

    const fallback = citationFailedRow({
      folderId: run.folder_id,
      questionSetVersion: run.question_set_version,
      questionId: q.question_id,
      question: q.question,
    });
    fallback.provenance_json = {
      reason_code: "VALIDATION_ERROR",
      checklist: [
        "Retry the run (step idempotency should avoid duplicates).",
        "Inspect server logs using the run_id and trace_id for correlation.",
      ],
    };
    let fallbackWithPayload: typeof fallback = fallback;
    try {
      fallbackWithPayload = attachListPayloadIfNeeded(fallback, q);
    } catch {
      // Keep the fallback row writable even if question metadata is malformed.
    }

    const fallbackRes = await attemptWrite(fallbackWithPayload, []);
    wrote = fallbackRes.inserted;
    rowStatus = fallbackRes.status;
    finalReasonCode = fallbackRes.reason_code;
  }

  const completion = await completeRunIfReady({ runId: args.step.run_id, clearError: true, db: s });
  if (completion.completed) {
    // eslint-disable-next-line no-console
    console.info("run.completed", { run_id: args.step.run_id, trace_id: run.trace_id ?? null });
  }

  const durationMs = Date.now() - startedAt;

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.write_row_v0.completed", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    duration_ms: durationMs,
    trace_id: traceId,
    question_id: input.question_id,
    wrote,
    row_status: rowStatus,
    reason_code: finalReasonCode,
  });

  return {
    output: {
      ok: true,
      run_id: args.step.run_id,
      trace_id: traceId,
      question_id: input.question_id,
      wrote,
      row_status: rowStatus,
      reason_code: finalReasonCode,
      duration_ms: durationMs,
    },
    metrics: { duration_ms: durationMs, wrote: wrote ? 1 : 0 },
  };
}
