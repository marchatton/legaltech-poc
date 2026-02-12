import "server-only";

import { drainWdkStepsOnce, type StepHandlerMap } from "./wdkWorker.server";

type GlobalWdkInlineWorker = typeof globalThis & {
  __orbitalInlineWdkWorker?: { draining: boolean; queue: KickRequest[] };
};

type KickRequest = {
  handlers: StepHandlerMap;
  maxSteps: number;
  runId: string | null;
};

const g = globalThis as GlobalWdkInlineWorker;
if (!g.__orbitalInlineWdkWorker) g.__orbitalInlineWdkWorker = { draining: false, queue: [] };

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

async function drainKickQueue(): Promise<void> {
  const state = g.__orbitalInlineWdkWorker!;
  const workerId = `inline-wdk:${process.pid}`;

  while (state.queue.length > 0) {
    const request = state.queue.shift();
    if (!request) continue;

    await drainWdkStepsOnce({
      workerId,
      handlers: request.handlers,
      maxSteps: request.maxSteps,
      runId: request.runId ?? undefined,
    });
  }
}

function startDrainIfNeeded(): void {
  const state = g.__orbitalInlineWdkWorker!;
  if (state.draining) return;
  if (state.queue.length === 0) return;

  state.draining = true;
  void drainKickQueue()
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("wdk.worker.drain_failed", { worker_id: `inline-wdk:${process.pid}`, message: safeErrMessage(err) });
    })
    .finally(() => {
      state.draining = false;
      startDrainIfNeeded();
    });
}

export function kickInlineWdkWorker(args: {
  handlers: StepHandlerMap;
  maxSteps?: number;
  runId?: string | null;
}): void {
  if (process.env.NODE_ENV !== "development") return;

  const state = g.__orbitalInlineWdkWorker!;
  state.queue.push({
    handlers: args.handlers,
    maxSteps: args.maxSteps ?? 25,
    runId: args.runId ?? null,
  });
  startDrainIfNeeded();
}
