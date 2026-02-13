import "server-only";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0KindSchema,
  ListPayloadV0Schema,
  emptyListPayloadV0,
} from "@orbital-poc/core";

import { ensureSchema, sql } from "./db.server";
import { newId } from "./ids";
import { loadQuestionSetV1 } from "./questionSet.server";
import { completeRunIfReady, transitionRunState } from "./runLifecycle.server";
import { safeErrMessage } from "./safeErrMessage";

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type FailureCounts = Record<string, number>;

type JsonArg = Parameters<typeof sql.json>[0];

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Not found in provided documents.",
    status: "missing_input" as const,
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

function citationFailedRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce citations.",
    status: "citation_failed" as const,
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

function attachListPayloadIfNeeded<T extends { payload_schema_version: string | null; payload_json: unknown | null }>(
  row: T,
  question: { response_kind: string; artefact_kind?: string; payload_schema_version?: string },
): T {
  if (question.response_kind !== "list_payload") return row;

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

function asReasonCode(val: unknown): string | null {
  if (!val || typeof val !== "object" || Array.isArray(val)) return null;
  const rec = val as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const verify = rec.verify;
  if (verify && typeof verify === "object" && !Array.isArray(verify)) {
    const s = (verify as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  const verification = rec.verification;
  if (verification && typeof verification === "object" && !Array.isArray(verification)) {
    const s = (verification as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return null;
}

async function recomputeRunProgress(args: { runId: string }): Promise<{ questionsDone: number; failureCounts: FailureCounts }> {
  const done = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM report_rows
    WHERE run_id = ${args.runId}
  `;
  const questionsDone = done[0]?.n ?? 0;

  // Keep failure taxonomy deterministic across retries by deriving from stored rows.
  const failed = await sql<Array<{ provenance_json: unknown }>>`
    SELECT provenance_json
    FROM report_rows
    WHERE run_id = ${args.runId}
      AND status = 'citation_failed'
  `;
  const counts: FailureCounts = {};
  for (const r of failed) {
    const reasonCode = asReasonCode(r.provenance_json) ?? "VALIDATION_ERROR";
    counts[reasonCode] = (counts[reasonCode] ?? 0) + 1;
  }

  return { questionsDone, failureCounts: counts };
}

export async function processQuickStartRun(runId: string): Promise<void> {
  await ensureSchema();

  const runs = await sql<RunRow[]>`
    SELECT id, folder_id, state, question_set_version, trace_id, questions_total, questions_done
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) return;
  if (run.state !== "running") return;

  const { version: currentQuestionSetVersion, questionSet } = await loadQuestionSetV1();
  if (currentQuestionSetVersion !== run.question_set_version) {
    await transitionRunState({
      runId,
      to: "failed",
      errorJson: {
        code: "QUESTION_SET_MISMATCH",
        message: "Pinned question_set_version does not match current question set.",
      },
      db: sql,
    });
    return;
  }

  const docCounts = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM documents
    WHERE folder_id = ${run.folder_id}
      AND upload_completed_at IS NOT NULL
      AND parse_status = 'parsed'
      AND ocr_status = 'done'
  `;
  const hasDocs = (docCounts[0]?.n ?? 0) > 0;

  const existing = await sql<Array<{ question_id: string }>>`
    SELECT question_id
    FROM report_rows
    WHERE run_id = ${runId}
  `;
  const existingQids = new Set(existing.map((r) => r.question_id));

  // If we resumed a running run (server restart, retries), make progress reflect
  // already-written rows immediately so polling UIs stay consistent.
  if (existingQids.size > 0) {
    const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
    await sql`
      UPDATE runs
      SET questions_done = ${questionsDone},
          failure_counts_json = ${sql.json(failureCounts)},
          updated_at = now()
      WHERE id = ${runId}
    `;
  }

  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${run.question_set_version}:question:${q.question_id}:write_row`;
    const stepId = newId("stp");
    const rowId = newId("row");
    const traceId = run.trace_id ?? newId("trc");

    // If the row already exists (retries, restarts), skip all side effects.
    if (existingQids.has(q.question_id)) continue;

    const row = hasDocs
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
        });
    let rowWithPayload: typeof row = row;
    try {
      rowWithPayload = attachListPayloadIfNeeded(row, q);
    } catch {
      // If the question set metadata is malformed, fail safely without crashing the run.
      rowWithPayload = citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });
      rowWithPayload.provenance_json = {
        reason_code: "VALIDATION_ERROR",
        checklist: ["Question set payload metadata is invalid for this row."],
      };
    }

    const reasonCode =
      rowWithPayload.status === "citation_failed"
        ? String((rowWithPayload.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    let wrote = false;
    try {
      wrote = await sql.begin(async (tx) => {
        const t = tx as unknown as typeof sql;

        // Step idempotency: deterministic step_key prevents duplicate row writes on retries.
        const steps = await t<{ id: string }[]>`
          INSERT INTO run_steps (
            id,
            run_id,
            step_type,
            state,
            attempt,
            step_key,
            trace_id,
            question_id,
            metrics_json,
            error_json,
            created_at,
            updated_at
          )
          VALUES (
            ${stepId},
            ${runId},
            'write_row',
            'succeeded',
            1,
            ${stepKey},
            ${traceId},
            ${q.question_id},
            ${t.json({ row_status: rowWithPayload.status })},
            NULL,
            now(),
            now()
          )
          ON CONFLICT (run_id, step_key) DO NOTHING
          RETURNING id
        `;
        if (!steps[0]) return false;

        const payload = rowWithPayload.payload_json ?? null;
        const payloadJson = payload === null ? null : t.json(payload as JsonArg);

        const inserted = await t<{ id: string }[]>`
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
            ${rowId},
            ${runId},
            ${rowWithPayload.folder_id},
            ${rowWithPayload.question_set_version},
            ${rowWithPayload.question_id},
            ${rowWithPayload.question},
            ${rowWithPayload.answer},
            ${rowWithPayload.status},
            ${rowWithPayload.notes},
            ${t.json(rowWithPayload.provenance_json)},
            ${rowWithPayload.payload_schema_version},
            ${payloadJson},
            now(),
            now()
          )
          ON CONFLICT (run_id, question_id) DO NOTHING
          RETURNING id
        `;

        if (!inserted[0]) return false;

        const reasonKey = reasonCode ?? "VALIDATION_ERROR";
        await t`
          UPDATE runs
          SET questions_done = LEAST(questions_total, questions_done + 1),
              failure_counts_json = CASE
                WHEN ${rowWithPayload.status} = 'citation_failed' THEN jsonb_set(
                  failure_counts_json,
                  ARRAY[${reasonKey}]::text[],
                  to_jsonb(COALESCE((failure_counts_json->>${reasonKey})::int, 0) + 1),
                  true
                )
                ELSE failure_counts_json
              END,
              updated_at = now()
          WHERE id = ${runId}
        `;

        return true;
      });
    } catch (err) {
      // Row-level failure should not crash the run. Best-effort: emit a terminal
      // citation_failed row with a safe reason_code, then continue.
      // eslint-disable-next-line no-console
      console.error("run.step failed", {
        run_id: runId,
        trace_id: traceId,
        step_key: stepKey,
        question_id: q.question_id,
        message: safeErrMessage(err),
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

      try {
        wrote = await sql.begin(async (tx) => {
          const t = tx as unknown as typeof sql;

          await t`
            INSERT INTO run_steps (
              id,
              run_id,
              step_type,
              state,
              attempt,
              step_key,
              trace_id,
              question_id,
              metrics_json,
              error_json,
              created_at,
              updated_at
            )
            VALUES (
              ${newId("stp")},
              ${runId},
              'write_row',
              'succeeded',
              1,
              ${stepKey},
              ${traceId},
              ${q.question_id},
              ${t.json({ row_status: "citation_failed", reason_code: "VALIDATION_ERROR" })},
              NULL,
              now(),
              now()
            )
            ON CONFLICT (run_id, step_key) DO NOTHING
          `;

          const payload = fallbackWithPayload.payload_json ?? null;
          const payloadJson = payload === null ? null : t.json(payload as JsonArg);

          const inserted = await t<{ id: string }[]>`
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
              ${runId},
              ${fallbackWithPayload.folder_id},
              ${fallbackWithPayload.question_set_version},
              ${fallbackWithPayload.question_id},
              ${fallbackWithPayload.question},
              ${fallbackWithPayload.answer},
              ${fallbackWithPayload.status},
              ${fallbackWithPayload.notes},
              ${t.json(fallbackWithPayload.provenance_json)},
              ${fallbackWithPayload.payload_schema_version},
              ${payloadJson},
              now(),
              now()
            )
            ON CONFLICT (run_id, question_id) DO NOTHING
            RETURNING id
          `;

          if (!inserted[0]) return false;

          await t`
            UPDATE runs
            SET questions_done = LEAST(questions_total, questions_done + 1),
                failure_counts_json = jsonb_set(
                  failure_counts_json,
                  ARRAY['VALIDATION_ERROR']::text[],
                  to_jsonb(COALESCE((failure_counts_json->>'VALIDATION_ERROR')::int, 0) + 1),
                  true
                ),
                updated_at = now()
            WHERE id = ${runId}
          `;
          return true;
        });
      } catch {
        // If we can't write the fallback row, just continue; finalization will
        // mark the run partial if not all rows were persisted.
      }
    }

    if (wrote) {
      existingQids.add(q.question_id);
      // eslint-disable-next-line no-console
      console.info("run.step", {
        run_id: runId,
        trace_id: run.trace_id ?? null,
        step_key: stepKey,
        question_id: q.question_id,
        row_status: rowWithPayload.status,
        reason_code: reasonCode,
      });

      // Yield a small window so polling clients can observe incremental row writes.
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
  await sql`
    UPDATE runs
    SET questions_done = ${questionsDone},
        failure_counts_json = ${sql.json(failureCounts)},
        updated_at = now()
    WHERE id = ${runId}
  `;

  await completeRunIfReady({ runId, clearError: true, db: sql });

  // If we couldn't persist terminal rows for every question, avoid leaving the
  // run stuck in running. Keep it inspectable with a safe error envelope.
  if (questionsDone < run.questions_total) {
    await transitionRunState({
      runId,
      to: "partial",
      errorJson: {
        code: "ROW_WRITE_INCOMPLETE",
        message: "Run completed with missing terminal rows.",
        details: { questions_total: run.questions_total, questions_done: questionsDone },
      },
      db: sql,
    });
  }

  // eslint-disable-next-line no-console
  console.info("run.completed", { run_id: runId, trace_id: run.trace_id ?? null });
}
