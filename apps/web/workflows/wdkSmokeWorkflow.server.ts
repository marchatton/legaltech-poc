import "server-only";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { newId } from "../lib/ids";
import { scheduleStep } from "../lib/wdk/stepQueue.server";

export async function startWdkSmokeWorkflow(args?: { traceId?: string; db?: Sql }): Promise<{
  folderId: string;
  runId: string;
  initStepId: string;
}> {
  "use workflow";

  if (!args?.db) await ensureSchema();
  const s = args?.db ?? sql;

  const folderId = newId("fld");
  const runId = newId("run");
  const traceId = args?.traceId ?? null;

  await s`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'wdk_smoke', 'empty')`;
  await s`
    INSERT INTO runs (
      id,
      folder_id,
      type,
      state,
      index_version,
      agent_bundle_version,
      question_set_version,
      trace_id
    )
    VALUES (
      ${runId},
      ${folderId},
      'wdk_smoke',
      'running',
      'v1',
      'v0',
      'v0',
      ${traceId}
    )
  `;

  const { id: initStepId } = await scheduleStep({
    runId,
    stepKey: "wdk_smoke:init",
    stepType: "wdk_smoke.init",
    input: { trace_id: traceId },
    db: s,
  });

  return { folderId, runId, initStepId };
}

