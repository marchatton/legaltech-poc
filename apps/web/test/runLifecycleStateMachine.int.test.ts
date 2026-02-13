import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { completeRunIfReady, transitionRunState } from "../lib/runLifecycle.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("run lifecycle state machine", () => {
  const url = databaseUrl();
  const sql = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(sql);
  }, 30_000);

  afterAll(async () => {
    await sql.end({ timeout: 2 });
  });

  it("transitions queued -> running -> completed with timestamps", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'run lifecycle', 'ready')`;
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        questions_total,
        questions_done
      )
      VALUES (
        ${runId},
        ${folderId},
        'quick_start_title_survey',
        'queued',
        'v1',
        'git:test',
        'v1',
        1,
        0
      )
    `;

    const running = await transitionRunState({ runId, to: "running", db: sql });
    expect(running.ok).toBe(true);

    await sql`
      UPDATE runs
      SET questions_done = 1,
          updated_at = now()
      WHERE id = ${runId}
    `;

    const completed = await completeRunIfReady({ runId, clearError: true, db: sql });
    expect(completed.completed).toBe(true);

    const runRows = await sql<Array<{ state: string; queued_at: Date; started_at: Date | null; completed_at: Date | null }>>`
      SELECT state, queued_at, started_at, completed_at
      FROM runs
      WHERE id = ${runId}
      LIMIT 1
    `;
    const run = runRows[0];
    expect(run?.state).toBe("completed");
    expect(run?.queued_at).toBeTruthy();
    expect(run?.started_at).toBeTruthy();
    expect(run?.completed_at).toBeTruthy();
    expect(run!.started_at!.getTime()).toBeGreaterThanOrEqual(run!.queued_at.getTime());
    expect(run!.completed_at!.getTime()).toBeGreaterThanOrEqual(run!.started_at!.getTime());

    await sql`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("rejects invalid transitions and keeps terminal states immutable", async () => {
    const folderId = `fld_${randomUUID()}`;
    const runId = `run_${randomUUID()}`;

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'run lifecycle immutable', 'ready')`;
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        questions_total,
        questions_done
      )
      VALUES (
        ${runId},
        ${folderId},
        'quick_start_title_survey',
        'queued',
        'v1',
        'git:test',
        'v1',
        1,
        0
      )
    `;

    const invalid = await transitionRunState({ runId, to: "completed", db: sql });
    expect(invalid.ok).toBe(false);
    if (!invalid.ok) {
      expect(invalid.reason).toBe("INVALID_TRANSITION");
      expect(invalid.currentState).toBe("queued");
    }

    const running = await transitionRunState({ runId, to: "running", db: sql });
    expect(running.ok).toBe(true);

    await sql`
      UPDATE runs
      SET questions_done = 1,
          updated_at = now()
      WHERE id = ${runId}
    `;

    const completed = await completeRunIfReady({ runId, clearError: true, db: sql });
    expect(completed.completed).toBe(true);

    const beforeRegressionRows = await sql<Array<{ completed_at: Date | null }>>`
      SELECT completed_at
      FROM runs
      WHERE id = ${runId}
      LIMIT 1
    `;
    const completedAt = beforeRegressionRows[0]?.completed_at ?? null;
    expect(completedAt).toBeTruthy();

    const regression = await transitionRunState({ runId, to: "running", db: sql });
    expect(regression.ok).toBe(false);
    if (!regression.ok) {
      expect(regression.reason).toBe("TERMINAL_IMMUTABLE");
      expect(regression.currentState).toBe("completed");
    }

    const afterRegressionRows = await sql<Array<{ state: string; completed_at: Date | null }>>`
      SELECT state, completed_at
      FROM runs
      WHERE id = ${runId}
      LIMIT 1
    `;
    expect(afterRegressionRows[0]?.state).toBe("completed");
    expect(afterRegressionRows[0]?.completed_at?.toISOString()).toBe(completedAt?.toISOString());

    await sql`DELETE FROM folders WHERE id = ${folderId}`;
  });
});
