import "server-only";

import type { Sql } from "../db.server";
import {
  claimNextStep,
  markStepFailed,
  markStepSucceeded,
  requeueStaleRunningSteps,
  rescheduleStep,
  type StepRow,
} from "./stepQueue.server";

export type StepHandler = (args: { step: StepRow; workerId: string; db?: Sql }) => Promise<{
  output: unknown;
  metrics?: unknown;
}>;

export type StepHandlerMap = Record<string, StepHandler>;

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function backoffMs(attempt: number): number {
  // attempt is 1-based and increments when the step is claimed.
  const base = 1_000;
  const max = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(max, ms);
}

async function handleStep(args: { step: StepRow; workerId: string; handlers: StepHandlerMap; db?: Sql }): Promise<void> {
  const handler = args.handlers[args.step.step_type];
  if (!handler) {
    await markStepFailed({
      stepId: args.step.id,
      workerId: args.workerId,
      error: { code: "STEP_TYPE_UNKNOWN", message: `No handler registered for step_type=${args.step.step_type}` },
      db: args.db,
    });
    return;
  }

  const result = await handler({ step: args.step, workerId: args.workerId, db: args.db });
  await markStepSucceeded({
    stepId: args.step.id,
    workerId: args.workerId,
    output: result.output,
    metrics: result.metrics,
    db: args.db,
  });
}

export async function drainWdkStepsOnce(args: {
  workerId: string;
  runId?: string;
  handlers: StepHandlerMap;
  maxSteps?: number;
  maxAttempts?: number;
  db?: Sql;
}): Promise<number> {
  const maxSteps = args.maxSteps ?? 50;
  const maxAttempts = args.maxAttempts ?? 3;

  let processed = 0;
  for (let i = 0; i < maxSteps; i += 1) {
    const step = await claimNextStep({ workerId: args.workerId, runId: args.runId, db: args.db });
    if (!step) return processed;

    // eslint-disable-next-line no-console
    console.info("wdk.worker.step_claimed", {
      worker_id: args.workerId,
      step_id: step.id,
      run_id: step.run_id,
      step_key: step.step_key,
      step_type: step.step_type,
      attempt: step.attempt,
    });

    try {
      await handleStep({ step, workerId: args.workerId, handlers: args.handlers, db: args.db });
    } catch (err) {
      if (step.attempt < maxAttempts) {
        const ms = backoffMs(step.attempt);
        await rescheduleStep({
          stepId: step.id,
          workerId: args.workerId,
          availableAt: new Date(Date.now() + ms),
          error: { code: "STEP_FAILED_RETRYING", message: "Step failed; retry scheduled." },
          db: args.db,
        });
      } else {
        await markStepFailed({
          stepId: step.id,
          workerId: args.workerId,
          error: { code: "STEP_FAILED", message: "Step failed permanently." },
          db: args.db,
        });
      }

      // eslint-disable-next-line no-console
      console.error("wdk.worker.step_failed", {
        worker_id: args.workerId,
        step_id: step.id,
        run_id: step.run_id,
        step_key: step.step_key,
        step_type: step.step_type,
        attempt: step.attempt,
        message: safeErrMessage(err),
      });
    }

    processed += 1;
  }

  return processed;
}

export async function runContinuousWdkWorker(args: {
  workerId: string;
  handlers: StepHandlerMap;
  pollIntervalMs?: number;
  maxStepsPerTick?: number;
  staleLockMs?: number;
  maxAttempts?: number;
  db?: Sql;
}): Promise<never> {
  const pollIntervalMs = args.pollIntervalMs ?? 1_000;
  const maxStepsPerTick = args.maxStepsPerTick ?? 25;
  const staleLockMs = args.staleLockMs ?? 5 * 60 * 1000;

  // eslint-disable-next-line no-console
  console.info("wdk.worker.started", {
    worker_id: args.workerId,
    poll_interval_ms: pollIntervalMs,
    stale_lock_ms: staleLockMs,
  });

  while (true) {
    try {
      await requeueStaleRunningSteps({
        cutoff: new Date(Date.now() - staleLockMs),
        limit: 100,
        db: args.db,
      });

      const n = await drainWdkStepsOnce({
        workerId: args.workerId,
        handlers: args.handlers,
        maxSteps: maxStepsPerTick,
        maxAttempts: args.maxAttempts,
        db: args.db,
      });

      if (n === 0) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("wdk.worker.tick_failed", { worker_id: args.workerId, message: safeErrMessage(err) });
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }
}
