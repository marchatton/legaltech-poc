import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import { drainWdkStepsOnce } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";
import { POST } from "../app/(api)/folders/[id]/runs/route";
import { GET as GET_RUN } from "../app/(api)/runs/[id]/route";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readConflict(json: unknown): { code: string; message: string; details: Record<string, unknown> | null } | null {
  if (!isRecord(json)) return null;
  const error = isRecord(json.error) ? json.error : null;
  if (!error) return null;
  const code = typeof error.code === "string" ? error.code : null;
  const message = typeof error.message === "string" ? error.message : null;
  if (!code || !message) return null;
  return {
    code,
    message,
    details: isRecord(error.details) ? error.details : null,
  };
}

describe("POST /folders/:id/runs (quick start)", () => {
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

  it(
    "starts WDK unconditionally, preserves idempotency, and does not enqueue execute_run jobs",
    async () => {
    const folderId = `fld_${randomUUID()}`;
    const docId = `doc_${randomUUID()}`;
    const chunkId = `chk_${randomUUID()}`;

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'route test', 'empty')`;
    await sql`
      INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
      VALUES (${docId}, ${folderId}, 'test.pdf', 'application/pdf', 1, 'parsed', 'done')
    `;
    await sql`
      INSERT INTO chunks (id, document_id, index_version, chunk_index, text, text_hash)
      VALUES (${chunkId}, ${docId}, 'v1', 0, 'hello', ${`hash_${randomUUID()}`})
    `;

    const idemKey = `idem_${randomUUID()}`;
    const req1 = new Request(`http://localhost/folders/${folderId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idemKey },
      body: JSON.stringify({ type: "quick_start_title_survey" }),
    });
    const res1 = await POST(req1, { params: Promise.resolve({ id: folderId }) });
    expect(res1.status).toBe(200);

    const body1 = (await res1.json()) as any;
    expect(body1?.run?.id).toMatch(/^run_/);
    expect(body1?.run?.folder_id).toBe(folderId);
    expect(body1?.run?.state).toBe("running");
    const runId = String(body1.run.id);
    const questionSetVersion = String(body1.run.question_set_version);

    // Negative: route should not enqueue legacy execute_run durable jobs.
    const jobRows = await sql<Array<{ id: string }>>`
      SELECT id
      FROM jobs
      WHERE type = 'execute_run'
        AND job_key = ${`run:${runId}`}
      LIMIT 1
    `;
    expect(jobRows[0]).toBeFalsy();

    const { version: expectedQuestionSetVersion, questionSet } = await loadQuestionSetV1();
    expect(expectedQuestionSetVersion).toBe(questionSetVersion);

    const expectedStepKeys = questionSet.questions.map(
      (q) => `quick_start:${questionSetVersion}:question:${q.question_id}:write_row`,
    );

    // Route should schedule the Quick Start WDK steps immediately (one per question_id).
    const stepRows = await sql<Array<{ id: string; step_key: string; step_type: string; state: string }>>`
      SELECT id, step_key, step_type, state
      FROM run_steps
      WHERE run_id = ${runId}
        AND step_type = 'quick_start_title_survey.write_row_v0'
    `;
    expect(stepRows.length).toBe(questionSet.questions.length);
    for (const row of stepRows) {
      // Inline worker kicks can claim or complete steps immediately after scheduling.
      expect(["queued", "running", "succeeded"]).toContain(row.state);
      expect(row.step_type).toBe("quick_start_title_survey.write_row_v0");
    }
    expect(stepRows.map((r) => r.step_key).sort()).toEqual([...expectedStepKeys].sort());

    // Idempotency: second request returns the existing run (no duplicates).
    const req2 = new Request(`http://localhost/folders/${folderId}/runs`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "Idempotency-Key": idemKey },
      body: JSON.stringify({ type: "quick_start_title_survey" }),
    });
    const res2 = await POST(req2, { params: Promise.resolve({ id: folderId }) });
    expect(res2.status).toBe(200);

    const body2 = (await res2.json()) as any;
    expect(body2?.run?.id).toBe(runId);

    const runRows = await sql<Array<{ n: number }>>`
      SELECT COUNT(*)::int as n
      FROM runs
      WHERE folder_id = ${folderId}
        AND idempotency_key = ${idemKey}
    `;
    expect(runRows[0]?.n).toBe(1);

    // Example: with a WDK worker running, the run can reach a terminal state.
    const oldest = new Date(0);
    await sql`
      UPDATE run_steps
      SET available_at = ${oldest},
          created_at = ${oldest}
      WHERE run_id = ${runId}
        AND step_type = 'quick_start_title_survey.write_row_v0'
    `;

    // Progress should increment as each per-question step completes.
    await drainWdkStepsOnce({
      workerId: "test:wdk",
      runId,
      handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
      maxSteps: 1,
      db: sql,
    });

    const progressRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`, { method: "GET" }), {
      params: Promise.resolve({ id: runId }),
    });
    expect(progressRes.status).toBe(200);
    const progressBody = (await progressRes.json()) as any;
    expect(progressBody?.run?.progress?.questions_done).toBeGreaterThanOrEqual(1);
    expect(progressBody?.run?.progress?.questions_done).toBeLessThanOrEqual(questionSet.questions.length);
    expect(progressBody?.run?.progress?.questions_total).toBe(questionSet.questions.length);

    await drainWdkStepsOnce({
      workerId: "test:wdk",
      runId,
      handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
      maxSteps: questionSet.questions.length + 5,
      db: sql,
    });

    const finalRun = await sql<Array<{ state: string }>>`
      SELECT state
      FROM runs
      WHERE id = ${runId}
      LIMIT 1
    `;
    expect(finalRun[0]?.state).toBe("completed");

      await sql`DELETE FROM folders WHERE id = ${folderId}`;
    },
    20_000,
  );

  it(
    "returns explicit conflicts for missing prerequisites and allows blocked-to-ready transition",
    async () => {
      const folderId = `fld_${randomUUID()}`;
      const docIdMissingRea = `doc_${randomUUID()}`;
      const chunkIdMissingRea = `chk_${randomUUID()}`;
      const docIdRea = `doc_${randomUUID()}`;
      const chunkIdRea = `chk_${randomUUID()}`;
      const seedTag = randomUUID().replaceAll("-", "").slice(0, 10);
      const folderName = `DEMO: pack_02_missing_rea 2026-02-13T00:00:00Z ${seedTag}`;

      await sql`
        INSERT INTO folders (id, name, state, latest_index_version)
        VALUES (${folderId}, ${folderName}, 'ready', 'v1')
      `;
      await sql`
        INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
        VALUES (${docIdMissingRea}, ${folderId}, 'TitleCommitment.pdf', 'application/pdf', 1, 'parsed', 'done')
      `;
      await sql`
        INSERT INTO chunks (id, document_id, index_version, chunk_index, text, text_hash)
        VALUES (${chunkIdMissingRea}, ${docIdMissingRea}, 'v1', 0, 'seed', ${`hash_${randomUUID()}`})
      `;

      const blockedRes = await POST(
        new Request(`http://localhost/folders/${folderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `idem_blocked_${randomUUID()}` },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(blockedRes.status).toBe(409);
      const blockedJson = (await blockedRes.json()) as unknown;
      const blocked = readConflict(blockedJson);
      expect(blocked?.code).toBe("CONFLICT");
      expect(blocked?.message).toContain("REA.pdf");
      expect(blocked?.details?.readiness_reason_code).toBe("MISSING_PREREQUISITE_DOCUMENT");
      expect(blocked?.details?.missing_documents).toEqual(["REA.pdf"]);

      const beforeRows = await sql<Array<{ n: number }>>`
        SELECT COUNT(*)::int as n
        FROM runs
        WHERE folder_id = ${folderId}
          AND type = 'quick_start_title_survey'
      `;
      expect(beforeRows[0]?.n).toBe(0);

      await sql`
        INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
        VALUES (${docIdRea}, ${folderId}, 'REA.pdf', 'application/pdf', 1, 'parsed', 'done')
      `;
      await sql`
        INSERT INTO chunks (id, document_id, index_version, chunk_index, text, text_hash)
        VALUES (${chunkIdRea}, ${docIdRea}, 'v1', 0, 'ready', ${`hash_${randomUUID()}`})
      `;

      const startedRes = await POST(
        new Request(`http://localhost/folders/${folderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `idem_started_${randomUUID()}` },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(startedRes.status).toBe(200);
      const startedBody = (await startedRes.json()) as any;
      const runId = String(startedBody?.run?.id);
      expect(runId).toMatch(/^run_/);

      const progressRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`, { method: "GET" }), {
        params: Promise.resolve({ id: runId }),
      });
      expect(progressRes.status).toBe(200);
      const progressBody = (await progressRes.json()) as any;
      expect(progressBody?.run?.progress?.questions_total).toBeGreaterThan(0);

      const duplicateRes = await POST(
        new Request(`http://localhost/folders/${folderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `idem_duplicate_${randomUUID()}` },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(duplicateRes.status).toBe(409);
      const duplicateJson = (await duplicateRes.json()) as unknown;
      const duplicate = readConflict(duplicateJson);
      expect(duplicate?.code).toBe("CONFLICT");
      expect(duplicate?.message).toContain("Quick Start already");

      const afterRows = await sql<Array<{ n: number }>>`
        SELECT COUNT(*)::int as n
        FROM runs
        WHERE folder_id = ${folderId}
          AND type = 'quick_start_title_survey'
      `;
      expect(afterRows[0]?.n).toBe(1);

      await sql`DELETE FROM folders WHERE id = ${folderId}`;
    },
    20_000,
  );
});
