import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { drainWdkStepsOnce } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";
import { POST } from "../app/(api)/folders/[id]/runs/route";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("POST /folders/:id/runs (quick start)", () => {
  const url = databaseUrl();
  const sql = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  const prevMode = process.env.ORBITAL_MODE;

  beforeAll(async () => {
    process.env.ORBITAL_MODE = "demo-prod";
    await ensureAllSchemas(sql);
  });

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

    // Route should schedule the Quick Start WDK step immediately.
    const stepRows = await sql<Array<{ id: string; step_key: string; step_type: string; state: string }>>`
      SELECT id, step_key, step_type, state
      FROM run_steps
      WHERE run_id = ${runId}
        AND step_key = ${`quick_start:${questionSetVersion}:execute_v0`}
      LIMIT 1
    `;
    expect(stepRows[0]).toBeTruthy();
    expect(stepRows[0]?.state).toBe("queued");
    expect(stepRows[0]?.step_type).toBe("quick_start_title_survey.execute_v0");

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
    await sql`UPDATE run_steps SET available_at = ${oldest}, created_at = ${oldest} WHERE id = ${stepRows[0]!.id}`;
    await drainWdkStepsOnce({
      workerId: "test:wdk",
      handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
      maxSteps: 1,
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
});
