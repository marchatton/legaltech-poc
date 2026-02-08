import "server-only";

import { ensureSchema, sql } from "./db.server";
import { newId } from "./ids";
import { loadQuestionSetV1 } from "./questionSet.server";

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

const queue: string[] = [];
const running = new Set<string>();
let draining = false;

export function enqueueQuickStartRun(runId: string): void {
  if (running.has(runId)) return;
  if (queue.includes(runId)) return;
  queue.push(runId);
  void drain();
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length) {
      const next = queue.shift();
      if (!next) continue;
      if (running.has(next)) continue;
      running.add(next);
      try {
        await executeOne(next);
      } finally {
        running.delete(next);
      }
    }
  } finally {
    draining = false;
  }
}

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
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
    payload_json: null as null,
  };
}

function citationFailedRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce locked citations in this slice.",
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
    payload_json: null as null,
  };
}

async function executeOne(runId: string): Promise<void> {
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
    await sql`
      UPDATE runs
      SET state = 'failed',
          error_json = ${sql.json({
            code: "QUESTION_SET_MISMATCH",
            message: "Pinned question_set_version does not match current question set.",
          })},
          updated_at = now()
      WHERE id = ${runId}
    `;
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

  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${run.question_set_version}:question:${q.question_id}:write_row`;
    const stepId = newId("stp");
    const rowId = newId("row");
    const traceId = run.trace_id ?? newId("trc");

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

    const reasonCode =
      row.status === "citation_failed"
        ? String((row.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    const wrote = await sql.begin(async (tx) => {
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
          ${t.json({ row_status: row.status })},
          NULL,
          now(),
          now()
        )
        ON CONFLICT (run_id, step_key) DO NOTHING
        RETURNING id
      `;
      if (!steps[0]) return false;

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
          ${row.folder_id},
          ${row.question_set_version},
          ${row.question_id},
          ${row.question},
          ${row.answer},
          ${row.status},
          ${row.notes},
          ${t.json(row.provenance_json)},
          ${row.payload_schema_version},
          NULL,
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
              WHEN ${row.status} = 'citation_failed' THEN jsonb_set(
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

    if (wrote) {
      // Yield a small window so polling clients can observe incremental row writes.
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  await sql`
    UPDATE runs
    SET state = 'completed',
        updated_at = now()
    WHERE id = ${runId}
      AND state = 'running'
      AND questions_done >= questions_total
  `;

  // eslint-disable-next-line no-console
  console.info("run.completed", { run_id: runId, trace_id: run.trace_id ?? null });
}
