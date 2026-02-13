import "server-only";

import { z } from "zod";

import type { Sql } from "./db.server";
import { ensureSchema, sql } from "./db.server";
import { newId } from "./ids";

const REPORT_ROW_STEP_TYPE = "quick_start_title_survey.write_row_v0";

const ReportRowStatusSchema = z.enum(["needs_review", "reviewed", "missing_input", "citation_failed"]);

const StepCitationSchema = z.object({
  id: z.string().min(1),
  document_id: z.string().min(1),
  page_number: z.number().int().positive(),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
  polygons_json: z.unknown(),
});

const StepReportRowSchema = z.object({
  question_id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string(),
  status: ReportRowStatusSchema,
  notes: z.string().nullable().optional(),
  provenance_json: z.unknown(),
  payload_schema_version: z.string().nullable(),
  payload_json: z.unknown().nullable(),
  citations: z.array(StepCitationSchema).optional(),
});

const StepOutputSchema = z.object({
  report_row: StepReportRowSchema.optional(),
});

type StepRow = {
  step_key: string;
  question_id: string | null;
  output_json: unknown;
};

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

export async function materializeReportRowsFromStepOutputs(args: {
  runId: string;
  folderId: string;
  questionSetVersion: string;
  db?: Sql;
}): Promise<{ consideredSteps: number; insertedRows: number; insertedCitations: number }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const steps = await s<StepRow[]>`
    SELECT step_key, question_id, output_json
    FROM run_steps
    WHERE run_id = ${args.runId}
      AND step_type = ${REPORT_ROW_STEP_TYPE}
      AND state = 'succeeded'
    ORDER BY created_at ASC, step_key ASC
  `;

  let insertedRows = 0;
  let insertedCitations = 0;

  for (const step of steps) {
    const parsed = StepOutputSchema.safeParse(step.output_json);
    if (!parsed.success) {
      throw new Error(
        `REPORT_ROW_STEP_OUTPUT_INVALID:${step.step_key}:${parsed.error.issues
          .map((issue) => issue.code)
          .join(",")}`,
      );
    }

    const reportRow = parsed.data.report_row;
    if (!reportRow) continue;

    if (step.question_id && step.question_id !== reportRow.question_id) {
      throw new Error(`REPORT_ROW_STEP_QUESTION_MISMATCH:${step.step_key}`);
    }

    const payload = reportRow.payload_json ?? null;
    const payloadJson = payload === null ? null : s.json(payload as JsonArg);
    const rowInsert = await s<Array<{ id: string }>>`
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
        ${args.runId},
        ${args.folderId},
        ${args.questionSetVersion},
        ${reportRow.question_id},
        ${reportRow.question},
        ${reportRow.answer},
        ${reportRow.status},
        ${reportRow.notes ?? null},
        ${s.json(reportRow.provenance_json as JsonArg)},
        ${reportRow.payload_schema_version},
        ${payloadJson},
        now(),
        now()
      )
      ON CONFLICT (run_id, question_id) DO NOTHING
      RETURNING id
    `;

    if (rowInsert[0]) insertedRows += 1;

    const citations = reportRow.citations ?? [];
    if (citations.length === 0) continue;

    let reportRowId = rowInsert[0]?.id ?? null;
    if (!reportRowId) {
      const existingRows = await s<Array<{ id: string }>>`
        SELECT id
        FROM report_rows
        WHERE run_id = ${args.runId}
          AND question_id = ${reportRow.question_id}
        LIMIT 1
      `;
      reportRowId = existingRows[0]?.id ?? null;
    }
    if (!reportRowId) continue;

    for (const citation of citations) {
      const citationInsert = await s<Array<{ id: string }>>`
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
          ${reportRowId},
          ${citation.document_id},
          ${citation.page_number},
          ${citation.snippet},
          ${citation.snippet_hash},
          ${s.json(citation.polygons_json as JsonArg)},
          now(),
          now()
        )
        ON CONFLICT (id) DO NOTHING
        RETURNING id
      `;
      if (citationInsert[0]) insertedCitations += 1;
    }
  }

  return { consideredSteps: steps.length, insertedRows, insertedCitations };
}

