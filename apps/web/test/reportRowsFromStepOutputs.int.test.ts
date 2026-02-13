import { randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { GET as GET_REPORT } from "../app/(api)/folders/[id]/report/route";
import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import { drainWdkStepsOnce } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function seedSnapshotPath(packId: string): string {
  return path.resolve(process.cwd(), "../../tmp/fixture-seed", packId, "snapshot.json");
}

type ReportRouteJson = {
  run: {
    id: string;
    failure?: {
      code?: string;
      message?: string;
      retryable?: boolean;
    } | null;
  };
  active_run?: {
    id: string;
    failure?: {
      code?: string;
      message?: string;
      retryable?: boolean;
    } | null;
  } | null;
  rows: Array<{
    question_id: string;
    status: string;
    answer: string;
    citation_ids: string[];
  }>;
};

describe("report rows from persisted step outputs", () => {
  const url = databaseUrl();
  const sql = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });
  const prevMode = process.env.ORBITAL_MODE;

  beforeAll(async () => {
    process.env.ORBITAL_MODE = "demo-prod";
    await ensureAllSchemas(sql);
  }, 30_000);

  afterAll(async () => {
    if (prevMode === undefined) delete process.env.ORBITAL_MODE;
    else process.env.ORBITAL_MODE = prevMode;
    await sql.end({ timeout: 2 });
  });

  it("materializes report rows from succeeded run-step outputs and keeps statuses stable across reloads", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const stepId = `stp_${randomUUID()}`;
    const docId = `doc_${randomUUID()}`;
    const citationId = `cit_${randomUUID().replaceAll("-", "_")}`;
    const traceId = `trc_${randomUUID()}`;

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, ${`DEMO: pack_05_partial_release ${new Date().toISOString()}`}, 'ready')`;
    await sql`
      INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
      VALUES (${docId}, ${folderId}, 'TitleCommitment.pdf', 'application/pdf', 1, 'parsed', 'done')
    `;
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        trace_id,
        questions_total,
        questions_done
      )
      VALUES (
        ${runId},
        ${folderId},
        'quick_start_title_survey',
        'completed',
        'v1',
        'git:test',
        'qs:test',
        ${traceId},
        1,
        1
      )
    `;
    await sql`
      INSERT INTO run_steps (
        id,
        run_id,
        step_type,
        state,
        attempt,
        step_key,
        trace_id,
        question_id,
        output_json
      )
      VALUES (
        ${stepId},
        ${runId},
        'quick_start_title_survey.write_row_v0',
        'succeeded',
        1,
        ${`quick_start:qs:test:question:TS-03:write_row`},
        ${traceId},
        'TS-03',
        ${sql.json({
          ok: true,
          run_id: runId,
          trace_id: traceId,
          question_id: "TS-03",
          wrote: true,
          row_status: "needs_review",
          reason_code: null,
          report_row: {
            question_id: "TS-03",
            question: "List Schedule B-I requirements.",
            answer: "Materialized from step output",
            status: "needs_review",
            notes: null,
            provenance_json: {},
            payload_schema_version: null,
            payload_json: null,
            citations: [
              {
                id: citationId,
                document_id: docId,
                page_number: 1,
                snippet: "Schedule B-I requirements snippet",
                snippet_hash: "hash_schedule_b_i",
                polygons_json: [
                  [
                    [0, 0],
                    [1, 0],
                    [1, 1],
                    [0, 1],
                  ],
                ],
              },
            ],
          },
        })}
      )
    `;

    const reportUrl = `http://localhost/folders/${folderId}/report?${new URLSearchParams({ run_id: runId }).toString()}`;
    const firstRes = await GET_REPORT(new Request(reportUrl), { params: Promise.resolve({ id: folderId }) });
    expect(firstRes.status).toBe(200);
    const firstJson = (await firstRes.json()) as ReportRouteJson;
    expect(firstJson.run.id).toBe(runId);
    expect(firstJson.rows).toHaveLength(1);
    expect(firstJson.rows[0]?.question_id).toBe("TS-03");
    expect(firstJson.rows[0]?.status).toBe("needs_review");
    expect(firstJson.rows[0]?.answer).toBe("Materialized from step output");
    expect(firstJson.rows[0]?.citation_ids).toEqual([citationId]);

    const secondRes = await GET_REPORT(new Request(reportUrl), { params: Promise.resolve({ id: folderId }) });
    expect(secondRes.status).toBe(200);
    const secondJson = (await secondRes.json()) as ReportRouteJson;
    expect(secondJson.run.id).toBe(runId);
    expect(secondJson.rows.map((row) => `${row.question_id}:${row.status}`)).toEqual(
      firstJson.rows.map((row) => `${row.question_id}:${row.status}`),
    );

    const persistedRows = await sql<Array<{ n: number }>>`
      SELECT COUNT(*)::int AS n
      FROM report_rows
      WHERE run_id = ${runId}
    `;
    expect(persistedRows[0]?.n).toBe(1);

    const persistedCitations = await sql<Array<{ n: number }>>`
      SELECT COUNT(*)::int AS n
      FROM citations
      WHERE id = ${citationId}
    `;
    expect(persistedCitations[0]?.n).toBe(1);

    await sql`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("does not emit fixture-seeded fallback rows on successful real-data runs", async () => {
    const packId = `pack_99_seedproof_${randomUUID().replaceAll("-", "_").slice(0, 8)}`;
    const snapshotPath = seedSnapshotPath(packId);
    const snapshotDir = path.dirname(snapshotPath);

    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const stepId = `stp_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;
    const docId = `doc_${randomUUID()}`;

    const { version: questionSetVersion } = await loadQuestionSetV1();

    await fs.mkdir(snapshotDir, { recursive: true });
    await fs.writeFile(
      snapshotPath,
      JSON.stringify(
        {
          meta: {
            pack_id: packId,
          },
          rows: [
            {
              question_id: "TS-01",
              question: "Who is the Proposed Insured?",
              answer: "Seeded insured name",
              status: "needs_review",
              citation_ids: [],
              notes: null,
              provenance_json: {},
              payload_schema_version: null,
              payload_json: null,
            },
          ],
          citations: {},
        },
        null,
        2,
      ) + "\n",
      "utf8",
    );

    try {
      await sql`
        INSERT INTO folders (id, name, state)
        VALUES (${folderId}, ${`DEMO: ${packId} ${new Date().toISOString()}`}, 'ready')
      `;
      await sql`
        INSERT INTO documents (id, folder_id, filename, mime, bytes, upload_completed_at, parse_status, ocr_status)
        VALUES (
          ${docId},
          ${folderId},
          'TitleCommitment.pdf',
          'application/pdf',
          1,
          now(),
          'parsed',
          'done'
        )
      `;
      await sql`
        INSERT INTO runs (
          id,
          folder_id,
          type,
          state,
          index_version,
          agent_bundle_version,
          question_set_version,
          trace_id,
          questions_total,
          questions_done
        )
        VALUES (
          ${runId},
          ${folderId},
          'quick_start_title_survey',
          'running',
          'v1',
          'git:test',
          ${questionSetVersion},
          ${traceId},
          1,
          0
        )
      `;
      await sql`
        INSERT INTO run_steps (
          id,
          run_id,
          step_type,
          state,
          attempt,
          step_key,
          trace_id,
          question_id,
          input_json
        )
        VALUES (
          ${stepId},
          ${runId},
          'quick_start_title_survey.write_row_v0',
          'queued',
          0,
          ${`quick_start:${questionSetVersion}:question:TS-01:write_row`},
          ${traceId},
          'TS-01',
          ${sql.json({ trace_id: traceId, question_id: "TS-01" })}
        )
      `;

      await drainWdkStepsOnce({
        workerId: `w_${randomUUID()}`,
        runId,
        handlers: quickStartStepHandlers,
        maxSteps: 2,
        db: sql,
      });

      const runRows = await sql<Array<{ state: string }>>`
        SELECT state
        FROM runs
        WHERE id = ${runId}
        LIMIT 1
      `;
      expect(runRows[0]?.state).toBe("completed");

      const reportRows = await sql<Array<{ status: string; answer: string }>>`
        SELECT status, answer
        FROM report_rows
        WHERE run_id = ${runId}
          AND question_id = 'TS-01'
        LIMIT 1
      `;
      expect(reportRows[0]?.status).toBe("citation_failed");
      expect(reportRows[0]?.answer).toBe("Unable to produce citations.");
    } finally {
      await sql`DELETE FROM folders WHERE id = ${folderId}`;
      await fs.rm(snapshotDir, { recursive: true, force: true });
    }
  });

  it("shows failed active-run envelope while preserving completed history without stale success rows", async () => {
    const folderId = `fld_${randomUUID()}`;
    const completedRunId = `run_${randomUUID()}`;
    const failedRunId = `run_${randomUUID()}`;
    const completedTraceId = `trc_${randomUUID()}`;
    const failedTraceId = `trc_${randomUUID()}`;
    const rowId = `row_${randomUUID()}`;

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'report failure history', 'ready')`;
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        trace_id,
        questions_total,
        questions_done
      )
      VALUES (
        ${completedRunId},
        ${folderId},
        'quick_start_title_survey',
        'completed',
        'v1',
        'git:test',
        'qs:test',
        ${completedTraceId},
        1,
        1
      )
    `;
    await sql`
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
        payload_json
      )
      VALUES (
        ${rowId},
        ${completedRunId},
        ${folderId},
        'qs:test',
        'TS-01',
        'Who is the Proposed Insured?',
        'Completed run history row',
        'needs_review',
        NULL,
        ${sql.json({})},
        NULL,
        NULL
      )
    `;
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        trace_id,
        error_json,
        questions_total,
        questions_done
      )
      VALUES (
        ${failedRunId},
        ${folderId},
        'quick_start_title_survey',
        'failed',
        'v1',
        'git:test',
        'qs:test',
        ${failedTraceId},
        ${sql.json({
          code: "WORKFLOW_SCHEDULE_FAILED",
          message: "Failed to schedule Quick Start workflow steps.",
        })},
        1,
        0
      )
    `;

    const defaultRes = await GET_REPORT(new Request(`http://localhost/folders/${folderId}/report`), {
      params: Promise.resolve({ id: folderId }),
    });
    expect(defaultRes.status).toBe(200);
    const defaultJson = (await defaultRes.json()) as ReportRouteJson;
    expect(defaultJson.run.id).toBe(completedRunId);
    expect(defaultJson.rows).toHaveLength(1);
    expect(defaultJson.rows[0]?.answer).toBe("Completed run history row");
    expect(defaultJson.active_run?.id).toBe(failedRunId);
    expect(defaultJson.active_run?.failure).toMatchObject({
      code: "WORKFLOW_SCHEDULE_FAILED",
      message: "Failed to schedule Quick Start workflow steps.",
      retryable: false,
    });

    const failedRunRes = await GET_REPORT(
      new Request(`http://localhost/folders/${folderId}/report?${new URLSearchParams({ run_id: failedRunId }).toString()}`),
      { params: Promise.resolve({ id: folderId }) },
    );
    expect(failedRunRes.status).toBe(200);
    const failedRunJson = (await failedRunRes.json()) as ReportRouteJson;
    expect(failedRunJson.run.id).toBe(failedRunId);
    expect(failedRunJson.run.failure).toMatchObject({
      code: "WORKFLOW_SCHEDULE_FAILED",
      message: "Failed to schedule Quick Start workflow steps.",
      retryable: false,
    });
    expect(failedRunJson.rows).toHaveLength(0);

    await sql`DELETE FROM folders WHERE id = ${folderId}`;
  });
});
