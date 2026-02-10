import "server-only";

import { z } from "zod";

import { ensureSchema, sql } from "../db.server";
import { newId } from "../ids";

export const JobTypeSchema = z.enum(["execute_run"]);
export type JobType = z.infer<typeof JobTypeSchema>;

export type JobState = "queued" | "running" | "succeeded" | "failed";

export type JobRow = {
  id: string;
  type: JobType;
  state: JobState;
  job_key: string;
  payload_json: unknown;
  attempts: number;
  available_at: Date;
  locked_at: Date | null;
  locked_by: string | null;
  error_json: unknown | null;
  created_at: Date;
  updated_at: Date;
};

type JsonArg = Parameters<typeof sql.json>[0];

export async function enqueueJob(args: { type: JobType; jobKey: string; payload: unknown }): Promise<{ id: string }> {
  await ensureSchema();

  const rows = await sql<Array<{ id: string }>>`
    INSERT INTO jobs (
      id,
      type,
      state,
      job_key,
      payload_json,
      attempts,
      available_at,
      locked_at,
      locked_by,
      error_json,
      created_at,
      updated_at
    )
    VALUES (
      ${newId("job")},
      ${args.type},
      'queued',
      ${args.jobKey},
      ${sql.json(args.payload as JsonArg)},
      0,
      now(),
      NULL,
      NULL,
      NULL,
      now(),
      now()
    )
    ON CONFLICT (type, job_key) DO UPDATE SET
      state = CASE WHEN jobs.state = 'running' THEN jobs.state ELSE 'queued' END,
      payload_json = CASE WHEN jobs.state = 'running' THEN jobs.payload_json ELSE EXCLUDED.payload_json END,
      attempts = CASE WHEN jobs.state = 'running' THEN jobs.attempts ELSE 0 END,
      available_at = CASE WHEN jobs.state = 'running' THEN jobs.available_at ELSE now() END,
      locked_at = CASE WHEN jobs.state = 'running' THEN jobs.locked_at ELSE NULL END,
      locked_by = CASE WHEN jobs.state = 'running' THEN jobs.locked_by ELSE NULL END,
      error_json = CASE WHEN jobs.state = 'running' THEN jobs.error_json ELSE NULL END,
      updated_at = now()
    RETURNING id
  `;

  const row = rows[0];
  if (!row) throw new Error("JOBS_ENQUEUE_FAILED");
  return { id: row.id };
}

export async function claimNextJob(args: { workerId: string }): Promise<JobRow | null> {
  await ensureSchema();

  const rows = await sql<JobRow[]>`
    WITH next AS (
      SELECT id
      FROM jobs
      WHERE state = 'queued'
        AND available_at <= now()
      ORDER BY available_at ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE jobs
    SET state = 'running',
        locked_at = now(),
        locked_by = ${args.workerId},
        attempts = attempts + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM next)
    RETURNING
      id,
      type,
      state,
      job_key,
      payload_json,
      attempts,
      available_at,
      locked_at,
      locked_by,
      error_json,
      created_at,
      updated_at
  `;

  const job = rows[0];
  if (!job) return null;

  const parsedType = JobTypeSchema.safeParse(job.type);
  if (!parsedType.success) {
    // Fail loudly; a bad type indicates schema drift or manual DB corruption.
    throw new Error(`Unknown job.type: ${String(job.type)}`);
  }

  return { ...job, type: parsedType.data };
}

export async function markJobSucceeded(args: { jobId: string; workerId: string }): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'succeeded',
        locked_at = NULL,
        locked_by = NULL,
        error_json = NULL,
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_MARK_SUCCEEDED_LOST_LOCK");
}

export async function rescheduleJob(args: {
  jobId: string;
  workerId: string;
  availableAt: Date;
  error: { code: string; message: string };
}): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'queued',
        available_at = ${args.availableAt},
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_RESCHEDULE_LOST_LOCK");
}

export async function markJobFailed(args: {
  jobId: string;
  workerId: string;
  error: { code: string; message: string };
}): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'failed',
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_MARK_FAILED_LOST_LOCK");
}

export async function requeueStaleRunningJobs(args: {
  cutoff: Date;
  limit?: number;
}): Promise<{ n: number }> {
  await ensureSchema();

  const limit = Math.max(1, Math.min(500, args.limit ?? 50));
  const stale = await sql<Array<{ id: string }>>`
    WITH next AS (
      SELECT id
      FROM jobs
      WHERE state = 'running'
        AND locked_at IS NOT NULL
        AND locked_at < ${args.cutoff}
      ORDER BY locked_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE jobs
    SET state = 'queued',
        available_at = now(),
        locked_at = NULL,
        locked_by = NULL,
        error_json = COALESCE(
          error_json,
          ${sql.json({ code: "JOB_STALE_REQUEUED", message: "Job reclaimed after stale lock." })}
        ),
        updated_at = now()
    WHERE id IN (SELECT id FROM next)
    RETURNING id
  `;

  return { n: stale.length };
}
