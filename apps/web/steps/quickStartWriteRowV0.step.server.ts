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
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type FolderDocumentRow = {
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

type PersistedStepReportRow = {
  question_id: string;
  question: string;
  answer: string;
  status: QuickStartRowStatus;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown | null;
  citations: QuickStartLockedCitation[];
};

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

function toPersistedStepReportRow(args: { row: QuickStartRow; citations: QuickStartLockedCitation[] }): PersistedStepReportRow {
  return {
    question_id: args.row.question_id,
    question: args.row.question,
    answer: args.row.answer,
    status: args.row.status,
    notes: args.row.notes,
    provenance_json: args.row.provenance_json,
    payload_schema_version: args.row.payload_schema_version,
    payload_json: args.row.payload_json,
    citations: args.citations.map((citation) => ({
      id: citation.id,
      document_id: citation.document_id,
      page_number: citation.page_number,
      snippet: citation.snippet,
      snippet_hash: citation.snippet_hash,
      polygons_json: citation.polygons_json,
    })),
  };
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

function docsReadyNeedsReviewRow(args: {
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
    status: "needs_review" as const,
    citation_ids: [] as string[],
    notes: null as string | null,
    provenance_json: {
      checklist: [
        "Confirm the correct PDFs are uploaded for this folder.",
        "Review and edit this row before exporting deliverables.",
        "Re-run the workflow after retrieval+locking is implemented.",
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
    SELECT id, folder_id, state, question_set_version, trace_id, questions_total, questions_done
    FROM runs
    WHERE id = ${args.step.run_id}
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
    SELECT upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE folder_id = ${run.folder_id}
  `;
  const hasDocs = documents.some(
    (doc) => doc.upload_completed_at !== null && doc.parse_status === "parsed" && doc.ocr_status === "done",
  );
  const baseRow = hasDocs
    ? docsReadyNeedsReviewRow({
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
      });
  let rowCitations: QuickStartLockedCitation[] = [];

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
  let persistedStepReportRow = toPersistedStepReportRow({ row: rowWithPayload, citations: rowCitations });

  try {
    const res = await attemptWrite(rowWithPayload, rowCitations);
    wrote = res.inserted;
    rowStatus = res.status;
    finalReasonCode = res.reason_code;
    persistedStepReportRow = toPersistedStepReportRow({ row: rowWithPayload, citations: rowCitations });
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

    const transition = await transitionRunState({
      runId: args.step.run_id,
      to: "failed",
      errorJson: {
        code: "ROW_WRITE_FAILED",
        message: "Failed to persist report row.",
        trace_id: traceId,
        retryable: false,
        details: {
          question_id: input.question_id,
          step_key: args.step.step_key,
        },
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
      output: {
        ok: false,
        run_id: args.step.run_id,
        trace_id: traceId,
        question_id: input.question_id,
        wrote: false,
        row_status: "citation_failed",
        reason_code: "ROW_WRITE_FAILED",
        duration_ms: durationMs,
      },
      metrics: { duration_ms: durationMs, wrote: 0 },
    };
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
      report_row: persistedStepReportRow,
      duration_ms: durationMs,
    },
    metrics: { duration_ms: durationMs, wrote: wrote ? 1 : 0 },
  };
}
