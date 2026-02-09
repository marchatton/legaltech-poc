import "server-only";

import { z } from "zod";

import { ensureSchema, sql } from "../db.server";
import { newId } from "../ids";

export const JobTypeSchema = z.enum(["ingest_document", "execute_run"]);
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

export async function markJobSucceeded(jobId: string): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE jobs
    SET state = 'succeeded',
        locked_at = NULL,
        locked_by = NULL,
        error_json = NULL,
        updated_at = now()
    WHERE id = ${jobId}
  `;
}

export async function rescheduleJob(args: { jobId: string; availableAt: Date; error: { code: string; message: string } }): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE jobs
    SET state = 'queued',
        available_at = ${args.availableAt},
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
  `;
}

export async function markJobFailed(args: { jobId: string; error: { code: string; message: string } }): Promise<void> {
  await ensureSchema();
  await sql`
    UPDATE jobs
    SET state = 'failed',
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
  `;
}
