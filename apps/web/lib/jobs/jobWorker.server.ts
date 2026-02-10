import "server-only";

import { z } from "zod";

import { safeErrMessage } from "../safeErrMessage";

import {
  claimNextJob,
  markJobFailed,
  markJobSucceeded,
  requeueStaleRunningJobs,
  rescheduleJob,
  type JobRow,
} from "./jobQueue.server";
import { processQuickStartRun } from "../quickStartRunProcessor.server";

type GlobalJobsWorker = typeof globalThis & {
  __orbitalInlineJobWorker?: { draining: boolean };
};

const g = globalThis as GlobalJobsWorker;
if (!g.__orbitalInlineJobWorker) g.__orbitalInlineJobWorker = { draining: false };

const RunPayloadSchema = z.object({ run_id: z.string().min(1) });

function backoffMs(attempt: number): number {
  // attempt is 1-based and increments when the job is claimed.
  const base = 1_000;
  const max = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(max, ms);
}

async function handleJob(job: JobRow): Promise<void> {
  if (job.type === "execute_run") {
    const parsed = RunPayloadSchema.safeParse(job.payload_json);
    if (!parsed.success) throw new Error("JOB_PAYLOAD_INVALID");
    await processQuickStartRun(parsed.data.run_id);
    return;
  }

  // Should be unreachable due to JobTypeSchema validation in claimNextJob().
  throw new Error(`JOB_TYPE_UNSUPPORTED: ${String((job as { type?: unknown }).type)}`);
}

export async function drainJobsOnce(args: { workerId: string; maxJobs?: number }): Promise<number> {
  const maxJobs = args.maxJobs ?? 50;
  let processed = 0;

  for (let i = 0; i < maxJobs; i += 1) {
    const job = await claimNextJob({ workerId: args.workerId });
    if (!job) return processed;

    try {
      await handleJob(job);
      await markJobSucceeded({ jobId: job.id, workerId: args.workerId });
    } catch (err) {
      const maxAttempts = 3;
      if (job.attempts < maxAttempts) {
        const ms = backoffMs(job.attempts);
        await rescheduleJob({
          jobId: job.id,
          workerId: args.workerId,
          availableAt: new Date(Date.now() + ms),
          error: { code: "JOB_FAILED_RETRYING", message: "Job failed; retry scheduled." },
        });
      } else {
        await markJobFailed({
          jobId: job.id,
          workerId: args.workerId,
          error: { code: "JOB_FAILED", message: "Job failed permanently." },
        });
      }

      // eslint-disable-next-line no-console
      console.error("jobs.worker.job_failed", {
        job_id: job.id,
        job_type: job.type,
        job_key: job.job_key,
        attempts: job.attempts,
        message: safeErrMessage(err),
      });
    }

    processed += 1;
  }

  return processed;
}

export function kickInlineJobWorker(): void {
  if (process.env.NODE_ENV !== "development") return;

  const state = g.__orbitalInlineJobWorker!;
  if (state.draining) return;
  state.draining = true;

  const workerId = `inline:${process.pid}`;
  void drainJobsOnce({ workerId, maxJobs: 100 })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.worker.drain_failed", { worker_id: workerId, message: safeErrMessage(err) });
    })
    .finally(() => {
      state.draining = false;
    });
}

export async function runContinuousJobWorker(args: {
  workerId: string;
  pollIntervalMs?: number;
  maxJobsPerTick?: number;
}): Promise<never> {
  const pollIntervalMs = args.pollIntervalMs ?? 1_000;
  const maxJobsPerTick = args.maxJobsPerTick ?? 25;
  const staleLockMs = 5 * 60 * 1000;

  // eslint-disable-next-line no-console
  console.info("jobs.worker.started", { worker_id: args.workerId, poll_interval_ms: pollIntervalMs });

  while (true) {
    try {
      await requeueStaleRunningJobs({ cutoff: new Date(Date.now() - staleLockMs), limit: 100 });
      const n = await drainJobsOnce({ workerId: args.workerId, maxJobs: maxJobsPerTick });
      if (n === 0) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("jobs.worker.tick_failed", { worker_id: args.workerId, message: safeErrMessage(err) });
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }
}
