import "server-only";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { newId } from "../lib/ids";
import { transitionRunState } from "../lib/runLifecycle.server";
import { scheduleStep } from "../lib/wdk/stepQueue.server";

function agentBundleVersion(): string {
  const configured =
    process.env.ORBITAL_AGENT_BUNDLE_VERSION?.trim() ??
    process.env.AGENT_BUNDLE_VERSION?.trim() ??
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ??
    "";
  if (!configured) return "git:dev";
  if (/^[a-f0-9]{7,40}$/i.test(configured)) return `git:${configured.slice(0, 7)}`;
  return configured;
}

function withDb(db?: Sql): Sql {
  return db ?? sql;
}

export async function startIngestDocumentWorkflow(args: {
  documentId: string;
  traceId?: string | null;
  db?: Sql;
}): Promise<{ runId: string; stepId: string }> {
  "use workflow";

  if (!args.db) await ensureSchema();
  const s = withDb(args.db);

  const traceId = args.traceId ?? null;

  const docs = await s<Array<{ folder_id: string }>>`
    SELECT folder_id
    FROM documents
    WHERE id = ${args.documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) throw new Error("INGEST_WDK_START_DOCUMENT_NOT_FOUND");

  const folderId = doc.folder_id;
  const folders = await s<Array<{ latest_index_version: string }>>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

  const idempotencyKey = `ingest_document:${args.documentId}`;
  const runInsertId = newId("run");
  const agentVersion = agentBundleVersion();

  let runId = runInsertId;
  let insertedRun = false;
  try {
    await s`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        idempotency_key,
        trace_id,
        questions_total,
        questions_done,
        created_at,
        updated_at
      )
      VALUES (
        ${runInsertId},
        ${folderId},
        'ingest_document',
        'queued',
        ${indexVersion},
        ${agentVersion},
        'v0',
        ${idempotencyKey},
        ${traceId},
        0,
        0,
        now(),
        now()
      )
    `;
    insertedRun = true;
  } catch (err: unknown) {
    // Idempotency-key races should reuse the existing run.
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (code === "23505") {
      const existing = await s<Array<{ id: string }>>`
        SELECT id
        FROM runs
        WHERE folder_id = ${folderId}
          AND idempotency_key = ${idempotencyKey}
        LIMIT 1
      `;
      const row = existing[0];
      if (!row) throw new Error("INGEST_WDK_START_RUN_CONFLICT_MISSING_ROW");
      runId = row.id;
    } else {
      throw err;
    }
  }

  const { id: stepId } = await scheduleStep({
    runId,
    stepKey: `ingest_document:${args.documentId}:process`,
    stepType: "ingest_document.process",
    input: { document_id: args.documentId, trace_id: traceId, run_id: runId },
    db: s,
  });

  const runningTransition = await transitionRunState({ runId, to: "running", clearError: true, db: s });
  if (!runningTransition.ok) {
    // Idempotent retries may target an already-running or terminal run.
    const acceptableIdempotentState =
      !insertedRun &&
      (runningTransition.reason === "INVALID_TRANSITION" || runningTransition.reason === "TERMINAL_IMMUTABLE");
    if (!acceptableIdempotentState) {
      throw new Error(
        `INGEST_WDK_START_RUN_TRANSITION_FAILED:${runningTransition.reason}:${runningTransition.currentState ?? "none"}`,
      );
    }
  }

  return { runId, stepId };
}
