import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { claimNextStep, requeueStaleRunningSteps, scheduleStep } from "../lib/wdk/stepQueue.server";
import { drainWdkStepsOnce, type StepHandlerMap } from "../lib/wdk/wdkWorker.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";
import { startWdkSmokeWorkflow } from "../workflows/wdkSmokeWorkflow.server";

const VERY_OLD = new Date(-2208988800000); // 1900-01-01T00:00:00.000Z

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
      availableAt: VERY_OLD,
      db: sql1,
    });

    const claimed = defer<void>();
    const release = defer<void>();
    let claimedStepId: string | null = null;

    const tx1 = sql1
      .begin(async (tx) => {
        const step = await claimNextStep({ workerId: "w1", db: tx as unknown as typeof sql1 });
        expect(step).not.toBeNull();
        claimedStepId = step?.id ?? null;
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
    // If the shared DB has other queued steps, a worker may claim those; use a
    // rollback transaction to keep this test non-destructive.
    let step2: Awaited<ReturnType<typeof claimNextStep>> = null;
    try {
      await Promise.race([
        sql2
          .begin(async (tx) => {
            step2 = await claimNextStep({ workerId: "w2", db: tx as unknown as typeof sql2 });
            throw new Error("ROLLBACK_TEST_W2");
          })
          .catch((err) => {
            if (err instanceof Error && err.message === "ROLLBACK_TEST_W2") return;
            throw err;
          }),
        new Promise<void>((_r, rej) => setTimeout(() => rej(new Error("Timed out waiting for step claim")), 500)),
      ]);

      if (step2 && claimedStepId) {
        expect(step2.id).not.toBe(claimedStepId);
      }
    } finally {
      // Always release tx1 even if assertions fail, to avoid cascading timeouts.
      release.resolve();
      await tx1;
    }

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
      availableAt: VERY_OLD,
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

    // Make this the oldest stale lock so the test is resilient to a dirty shared dev DB.
    const lockedAt = VERY_OLD;
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
    expect(n).toBeGreaterThan(0);

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

  it("executes wdk_smoke with retry + backoff", async () => {
    const started = await startWdkSmokeWorkflow({ traceId: `trc_${randomUUID()}`, db: sql1 });
    // Ensure smoke steps win the queue even if the shared dev DB has other work.
    await sql1`UPDATE run_steps SET available_at = ${VERY_OLD} WHERE run_id = ${started.runId}`;

    // Execute steps deterministically even if the shared DB has other queued work.
    await drainWdkStepsOnce({ workerId: "w1", handlers: wdkSmokeStepHandlers, maxSteps: 1, db: sql1 }); // init
    await sql1`UPDATE run_steps SET available_at = ${VERY_OLD} WHERE run_id = ${started.runId} AND state = 'queued'`;
    await drainWdkStepsOnce({ workerId: "w1", handlers: wdkSmokeStepHandlers, maxSteps: 1, db: sql1 }); // flaky (fails once)

    const initRows = await sql1<Array<{ state: string; attempt: number }>>`
      SELECT state, attempt
      FROM run_steps
      WHERE run_id = ${started.runId}
        AND step_key = 'wdk_smoke:init'
      LIMIT 1
    `;
    expect(initRows[0]?.state).toBe("succeeded");
    expect(initRows[0]?.attempt).toBe(1);

    const flakyRows = await sql1<
      Array<{ state: string; attempt: number; available_at: Date; updated_at: Date; error_json: any }>
    >`
      SELECT state, attempt, available_at, updated_at, error_json
      FROM run_steps
      WHERE run_id = ${started.runId}
        AND step_key = 'wdk_smoke:flaky'
      LIMIT 1
    `;
    const flaky = flakyRows[0];
    expect(flaky?.state).toBe("queued");
    expect(flaky?.attempt).toBe(1);
    expect(String(flaky?.error_json?.code ?? "")).toBe("STEP_FAILED_RETRYING");

    const backoffMs = flaky.available_at.getTime() - flaky.updated_at.getTime();
    expect(backoffMs).toBeGreaterThanOrEqual(500);
    expect(backoffMs).toBeLessThanOrEqual(35_000);

    // Fast-forward the scheduled retry (and make it win the queue) without
    // waiting for the wall clock.
    await sql1`
      UPDATE run_steps
      SET available_at = ${VERY_OLD}
      WHERE run_id = ${started.runId}
        AND step_key = 'wdk_smoke:flaky'
    `;

    await drainWdkStepsOnce({ workerId: "w1", handlers: wdkSmokeStepHandlers, maxSteps: 1, db: sql1 }); // flaky (succeeds)
    await sql1`UPDATE run_steps SET available_at = ${VERY_OLD} WHERE run_id = ${started.runId} AND state = 'queued'`;
    await drainWdkStepsOnce({ workerId: "w1", handlers: wdkSmokeStepHandlers, maxSteps: 1, db: sql1 }); // done

    const finalFlakyRows = await sql1<Array<{ state: string; attempt: number; error_json: any }>>`
      SELECT state, attempt, error_json
      FROM run_steps
      WHERE run_id = ${started.runId}
        AND step_key = 'wdk_smoke:flaky'
      LIMIT 1
    `;
    expect(finalFlakyRows[0]?.state).toBe("succeeded");
    expect(finalFlakyRows[0]?.attempt).toBe(2);
    expect(finalFlakyRows[0]?.error_json).toBeNull();

    const doneRows = await sql1<Array<{ state: string; attempt: number }>>`
      SELECT state, attempt
      FROM run_steps
      WHERE run_id = ${started.runId}
        AND step_key = 'wdk_smoke:done'
      LIMIT 1
    `;
    expect(doneRows[0]?.state).toBe("succeeded");
    expect(doneRows[0]?.attempt).toBe(1);

    const runRows = await sql1<Array<{ state: string }>>`
      SELECT state
      FROM runs
      WHERE id = ${started.runId}
      LIMIT 1
    `;
    expect(runRows[0]?.state).toBe("completed");

    await sql1`DELETE FROM folders WHERE id = ${started.folderId}`;
  });
});
