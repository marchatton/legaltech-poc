import os from "node:os";

import { runContinuousJobWorker } from "../lib/jobs/jobWorker.server";

function workerId(): string {
  const fromEnv = process.env.ORBITAL_WORKER_ID?.trim();
  if (fromEnv) return fromEnv;
  return `worker:${os.hostname()}:${process.pid}`;
}

process.on("SIGINT", () => process.exit(0));
process.on("SIGTERM", () => process.exit(0));

await runContinuousJobWorker({ workerId: workerId() });

