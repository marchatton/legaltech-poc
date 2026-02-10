import os from "node:os";

import { runContinuousJobWorker } from "../lib/jobs/jobWorker.server";
import { runContinuousWdkWorker } from "../lib/wdk/wdkWorker.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";

function workerId(): string {
  const fromEnv = process.env.ORBITAL_WORKER_ID?.trim();
  if (fromEnv) return fromEnv;
  return `worker:${os.hostname()}:${process.pid}`;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

const baseId = workerId();
await Promise.all([
  runContinuousJobWorker({ workerId: `${baseId}:jobs` }),
  runContinuousWdkWorker({ workerId: `${baseId}:wdk`, handlers: wdkSmokeStepHandlers }),
]);
