import "server-only";

import type { Sql } from "./db.server";
import { ensureSchema, sql } from "./db.server";

export type RunState = "queued" | "running" | "completed" | "partial" | "failed" | "cancelled";

type JsonArg = Parameters<typeof sql.json>[0];

type TransitionFailureReason = "NOT_FOUND" | "INVALID_TRANSITION" | "TERMINAL_IMMUTABLE";

type TransitionRow = {
  id: string;
  state: RunState;
  queued_at: Date;
  started_at: Date | null;
  completed_at: Date | null;
};

type TransitionFailed = {
  ok: false;
  reason: TransitionFailureReason;
  currentState: string | null;
};

type TransitionSucceeded = {
  ok: true;
  run: TransitionRow;
};

export type TransitionRunStateResult = TransitionSucceeded | TransitionFailed;

const TERMINAL_RUN_STATES = new Set<RunState>(["completed", "partial", "failed", "cancelled"]);

const ALLOWED_FROM: Readonly<Record<RunState, readonly RunState[]>> = {
  queued: [],
  running: ["queued"],
  completed: ["running"],
  partial: ["running"],
  failed: ["queued", "running"],
  cancelled: ["queued", "running"],
};

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

function asRunState(value: string | null | undefined): RunState | null {
  if (value === "queued") return "queued";
  if (value === "running") return "running";
  if (value === "completed") return "completed";
  if (value === "partial") return "partial";
  if (value === "failed") return "failed";
  if (value === "cancelled") return "cancelled";
  return null;
}

export function isTerminalRunState(value: string): boolean {
  const state = asRunState(value);
  return state ? TERMINAL_RUN_STATES.has(state) : false;
}

export async function transitionRunState(args: {
  runId: string;
  to: RunState;
  errorJson?: unknown;
  clearError?: boolean;
  db?: Sql;
}): Promise<TransitionRunStateResult> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const fromStates = ALLOWED_FROM[args.to];
  if (fromStates.length === 0) {
    throw new Error(`RUN_STATE_TRANSITION_TO_INITIAL_NOT_ALLOWED:${args.to}`);
  }

  const nextIsTerminal = TERMINAL_RUN_STATES.has(args.to);
  const hasErrorJson = Object.prototype.hasOwnProperty.call(args, "errorJson");
  const clearError = args.clearError === true;
  const errorJson = hasErrorJson ? s.json(args.errorJson as JsonArg) : null;

  const transitioned = await s<TransitionRow[]>`
    UPDATE runs
    SET state = ${args.to},
        started_at = CASE
          WHEN ${args.to} = 'running' THEN COALESCE(started_at, now())
          ELSE started_at
        END,
        completed_at = CASE
          WHEN ${nextIsTerminal} THEN COALESCE(completed_at, now())
          ELSE completed_at
        END,
        error_json = CASE
          WHEN ${hasErrorJson} THEN ${errorJson}
          WHEN ${clearError} THEN NULL
          ELSE error_json
        END,
        updated_at = now()
    WHERE id = ${args.runId}
      AND state = ANY(${fromStates})
    RETURNING id, state, queued_at, started_at, completed_at
  `;
  const row = transitioned[0];
  if (row) return { ok: true, run: row };

  const currentRows = await s<Array<{ state: string }>>`
    SELECT state
    FROM runs
    WHERE id = ${args.runId}
    LIMIT 1
  `;
  const current = currentRows[0];
  if (!current) return { ok: false, reason: "NOT_FOUND", currentState: null };
  if (isTerminalRunState(current.state)) {
    return { ok: false, reason: "TERMINAL_IMMUTABLE", currentState: current.state };
  }
  return { ok: false, reason: "INVALID_TRANSITION", currentState: current.state };
}

export async function completeRunIfReady(args: {
  runId: string;
  clearError?: boolean;
  db?: Sql;
}): Promise<{ completed: boolean }> {
  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const clearError = args.clearError === true;

  const rows = await s<Array<{ id: string }>>`
    UPDATE runs
    SET state = 'completed',
        completed_at = COALESCE(completed_at, now()),
        error_json = CASE WHEN ${clearError} THEN NULL ELSE error_json END,
        updated_at = now()
    WHERE id = ${args.runId}
      AND state = 'running'
      AND questions_done >= questions_total
    RETURNING id
  `;

  return { completed: Boolean(rows[0]) };
}
