import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { claimNextStep, requeueStaleRunningSteps, scheduleStep } from "../lib/wdk/stepQueue.server";
import { drainWdkStepsOnce, type StepHandlerMap } from "../lib/wdk/wdkWorker.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function defer<T>() {
  let resolve!: (val: T) => void;
  let reject!: (err: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("wdk step queue (db)", () => {
  const url = databaseUrl();
  const sql1 = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });
  const sql2 = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(sql1);
  });

  afterAll(async () => {
    await sql1.end({ timeout: 2 });
    await sql2.end({ timeout: 2 });
  });

  it("claims next step with FOR UPDATE SKIP LOCKED", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const stepKey = `test:${randomUUID()}:step`;

    await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'wdk test', 'empty')`;
    await sql1`
      INSERT INTO runs (id, folder_id, type, state, index_version, agent_bundle_version, question_set_version)
      VALUES (${runId}, ${folderId}, 'wdk_test', 'running', 'v1', 'v0', 'v0')
    `;
    await scheduleStep({
      runId,
      stepKey,
      stepType: "test_side_effect",
      input: { ok: true },
      db: sql1,
    });

    const claimed = defer<void>();
    const release = defer<void>();

    const tx1 = sql1
      .begin(async (tx) => {
        const step = await claimNextStep({ workerId: "w1", db: tx as unknown as typeof sql1 });
        expect(step).not.toBeNull();
        claimed.resolve();
        await release.promise;
        throw new Error("ROLLBACK_TEST");
      })
      .catch((err) => {
        if (err instanceof Error && err.message === "ROLLBACK_TEST") return;
        throw err;
      });

    await claimed.promise;

    // If SKIP LOCKED is missing, this would block on tx1's row lock.
    const step2 = await Promise.race([
      claimNextStep({ workerId: "w2", db: sql2 }),
      new Promise<null>((_r, rej) => setTimeout(() => rej(new Error("Timed out waiting for step claim")), 500)),
    ]);
    expect(step2).toBeNull();

    release.resolve();
    await tx1;

    await sql1`DELETE FROM run_steps WHERE run_id = ${runId}`;
    await sql1`DELETE FROM runs WHERE id = ${runId}`;
    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("does not double-execute a single (run_id, step_key) across two workers", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const stepKey = `test:${randomUUID()}:side_effect`;

    await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'wdk test', 'empty')`;
    await sql1`
      INSERT INTO runs (id, folder_id, type, state, index_version, agent_bundle_version, question_set_version)
      VALUES (${runId}, ${folderId}, 'wdk_test', 'running', 'v1', 'v0', 'v0')
    `;
    await scheduleStep({
      runId,
      stepKey,
      stepType: "test_side_effect",
      input: { ok: true },
      db: sql1,
    });

    const executions: string[] = [];
    const handlers: StepHandlerMap = {
      test_side_effect: async ({ step, workerId }) => {
        executions.push(workerId);
        await new Promise((r) => setTimeout(r, 25));
        return { output: { executed_by: workerId, step_id: step.id } };
      },
    };

    await Promise.all([
      drainWdkStepsOnce({ workerId: "w1", handlers, maxSteps: 1, db: sql1 }),
      drainWdkStepsOnce({ workerId: "w2", handlers, maxSteps: 1, db: sql2 }),
    ]);

    expect(executions.length).toBe(1);

    const rows = await sql1<
      Array<{ state: string; attempt: number; locked_by: string | null; output_json: any; step_key: string }>
    >`
      SELECT state, attempt, locked_by, output_json, step_key
      FROM run_steps
      WHERE run_id = ${runId}
        AND step_key = ${stepKey}
      LIMIT 1
    `;
    const row = rows[0];
    expect(row).toBeTruthy();
    expect(row?.state).toBe("succeeded");
    expect(row?.attempt).toBe(1);
    expect(row?.locked_by).toBeNull();
    expect(String(row?.output_json?.executed_by ?? "")).toBe(executions[0]);
    expect(row?.step_key).toBe(stepKey);

    await sql1`DELETE FROM run_steps WHERE run_id = ${runId}`;
    await sql1`DELETE FROM runs WHERE id = ${runId}`;
    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("requeues stale running steps so a crash can't block the queue", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;
    const stepId = `stp_${randomUUID()}`;
    const stepKey = `test:${randomUUID()}:stale`;

    await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'wdk test', 'empty')`;
    await sql1`
      INSERT INTO runs (id, folder_id, type, state, index_version, agent_bundle_version, question_set_version)
      VALUES (${runId}, ${folderId}, 'wdk_test', 'running', 'v1', 'v0', 'v0')
    `;

    const lockedAt = new Date(Date.now() - 10 * 60 * 1000);
    await sql1`
      INSERT INTO run_steps (
        id,
        run_id,
        step_type,
        state,
        attempt,
        step_key,
        locked_at,
        locked_by
      )
      VALUES (
        ${stepId},
        ${runId},
        'test_side_effect',
        'running',
        1,
        ${stepKey},
        ${lockedAt},
        'crashed-worker'
      )
    `;

    const { n } = await requeueStaleRunningSteps({
      cutoff: new Date(Date.now() - 5 * 60 * 1000),
      limit: 10,
      db: sql1,
    });
    expect(n).toBe(1);

    const rows = await sql1<Array<{ state: string; locked_at: Date | null; locked_by: string | null }>>`
      SELECT state, locked_at, locked_by
      FROM run_steps
      WHERE id = ${stepId}
      LIMIT 1
    `;
    const row = rows[0];
    expect(row).toBeTruthy();
    expect(row?.state).toBe("queued");
    expect(row?.locked_at).toBeNull();
    expect(row?.locked_by).toBeNull();

    await sql1`DELETE FROM run_steps WHERE run_id = ${runId}`;
    await sql1`DELETE FROM runs WHERE id = ${runId}`;
    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });
});

