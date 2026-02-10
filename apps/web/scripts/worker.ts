import os from "node:os";

import { runContinuousWdkWorker } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";

function workerId(): string {
  const fromEnv = process.env.ORBITAL_WORKER_ID?.trim();
  if (fromEnv) return fromEnv;
  return `worker:${os.hostname()}:${process.pid}`;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const baseId = workerId();
// Worker entrypoint: WDK-only. If a job-like runtime is reintroduced later,
// it must be explicit and must not be used for Quick Start.
await runContinuousWdkWorker({
  workerId: `${baseId}:wdk`,
  handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
});
