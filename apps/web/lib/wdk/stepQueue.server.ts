import "server-only";

import type { Sql } from "../db.server";
import { ensureSchema, sql } from "../db.server";
import { newId } from "../ids";

export type StepState = "queued" | "running" | "succeeded" | "failed";

export type StepRow = {
  id: string;
  run_id: string;
  step_type: string;
  state: StepState;
  attempt: number;
  step_key: string;
  available_at: Date;
  locked_at: Date | null;
  locked_by: string | null;
  input_json: unknown;
  output_json: unknown;
  trace_id: string | null;
  question_id: string | null;
  metrics_json: unknown;
  error_json: unknown | null;
  created_at: Date;
  updated_at: Date;
};

type JsonArg = Parameters<typeof sql.json>[0];

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

export async function scheduleStep(args: {
  runId: string;
  stepKey: string;
  stepType: string;
  input: unknown;
  availableAt?: Date;
  db?: Sql;
}): Promise<{ id: string; inserted: boolean }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  // Default to DB time to avoid subtle clock skew between app and Postgres.
  const availableAt: Date | null = args.availableAt ?? null;
  const rows = await s<Array<{ id: string }>>`
    INSERT INTO run_steps (
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      available_at,
      locked_at,
      locked_by,
      input_json,
      output_json,
      metrics_json,
      error_json,
      created_at,
      updated_at
    )
    VALUES (
      ${newId("stp")},
      ${args.runId},
      ${args.stepType},
      'queued',
      0,
      ${args.stepKey},
      COALESCE(${availableAt}, now()),
      NULL,
      NULL,
      ${s.json(args.input as JsonArg)},
      ${s.json({} as JsonArg)},
      ${s.json({} as JsonArg)},
      NULL,
      now(),
      now()
    )
    ON CONFLICT (run_id, step_key) DO NOTHING
    RETURNING id
  `;

  const inserted = rows[0];
  if (inserted) return { id: inserted.id, inserted: true };

  // Idempotency: if the step already exists, return its id.
  const existing = await s<Array<{ id: string }>>`
    SELECT id
    FROM run_steps
    WHERE run_id = ${args.runId}
      AND step_key = ${args.stepKey}
    LIMIT 1
  `;
  const row = existing[0];
  if (!row) throw new Error("WDK_SCHEDULE_STEP_CONFLICT_MISSING_ROW");
  return { id: row.id, inserted: false };
}

export async function claimNextStep(args: { workerId: string; runId?: string; db?: Sql }): Promise<StepRow | null> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);
  const runId = args.runId ?? null;

  const rows = await s<StepRow[]>`
    WITH next AS (
      SELECT id
      FROM run_steps
      WHERE state = 'queued'
        AND available_at <= now()
        AND run_id = COALESCE(${runId}, run_id)
      ORDER BY available_at ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE run_steps
    SET state = 'running',
        locked_at = now(),
        locked_by = ${args.workerId},
        attempt = attempt + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM next)
    RETURNING
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      available_at,
      locked_at,
      locked_by,
      input_json,
      output_json,
      trace_id,
      question_id,
      metrics_json,
      error_json,
      created_at,
      updated_at
  `;

  return rows[0] ?? null;
}

export async function markStepSucceeded(args: {
  stepId: string;
  workerId: string;
  output: unknown;
  metrics?: unknown;
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const metrics = args.metrics ?? {};
  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'succeeded',
        locked_at = NULL,
        locked_by = NULL,
        output_json = ${s.json(args.output as JsonArg)},
        metrics_json = ${s.json(metrics as JsonArg)},
        error_json = NULL,
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_MARK_SUCCEEDED_LOST_LOCK");
}

export async function rescheduleStep(args: {
  stepId: string;
  workerId: string;
  availableAt: Date;
  error: { code: string; message: string };
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'queued',
        available_at = ${args.availableAt},
        locked_at = NULL,
        locked_by = NULL,
        output_json = ${s.json({} as JsonArg)},
        error_json = ${s.json(args.error as JsonArg)},
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_RESCHEDULE_LOST_LOCK");
}

export async function markStepFailed(args: {
  stepId: string;
  workerId: string;
  error: { code: string; message: string };
  db?: Sql;
}): Promise<void> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const rows = await s<Array<{ id: string }>>`
    UPDATE run_steps
    SET state = 'failed',
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${s.json(args.error as JsonArg)},
        updated_at = now()
    WHERE id = ${args.stepId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("WDK_MARK_FAILED_LOST_LOCK");
}

export async function requeueStaleRunningSteps(args: { cutoff: Date; limit?: number; db?: Sql }): Promise<{ n: number }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const limit = Math.max(1, Math.min(500, args.limit ?? 50));
  const stale = await s<Array<{ id: string }>>`
    WITH next AS (
      SELECT id
      FROM run_steps
      WHERE state = 'running'
        AND locked_at IS NOT NULL
        AND locked_at < ${args.cutoff}
      ORDER BY locked_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE run_steps
    SET state = 'queued',
        available_at = now(),
        locked_at = NULL,
        locked_by = NULL,
        error_json = COALESCE(
          error_json,
          ${s.json({ code: "STEP_STALE_REQUEUED", message: "Step reclaimed after stale lock." } as JsonArg)}
        ),
        updated_at = now()
    WHERE id IN (SELECT id FROM next)
    RETURNING id
  `;

  return { n: stale.length };
}
