import "server-only";

import { drainWdkStepsOnce, type StepHandlerMap } from "./wdkWorker.server";

type GlobalWdkInlineWorker = typeof globalThis & {
  __orbitalInlineWdkWorker?: { draining: boolean };
};

const g = globalThis as GlobalWdkInlineWorker;
if (!g.__orbitalInlineWdkWorker) g.__orbitalInlineWdkWorker = { draining: false };

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function kickInlineWdkWorker(args: { handlers: StepHandlerMap; maxSteps?: number }): void {
  if (process.env.NODE_ENV !== "development") return;

  const state = g.__orbitalInlineWdkWorker!;
  if (state.draining) return;
  state.draining = true;

  const workerId = `inline-wdk:${process.pid}`;
  void drainWdkStepsOnce({ workerId, handlers: args.handlers, maxSteps: args.maxSteps ?? 25 })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("wdk.worker.drain_failed", { worker_id: workerId, message: safeErrMessage(err) });
    })
    .finally(() => {
      state.draining = false;
    });
}

