import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { ensureSchema, sql } from "../lib/db.server";
import { transitionRunState } from "../lib/runLifecycle.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
});

export async function wdkSmokeDoneStep(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);

  if (!args.db) await ensureSchema();
  const s = args.db ?? sql;

  await transitionRunState({ runId: args.step.run_id, to: "completed", clearError: true, db: s });

  return {
    output: {
      step: "done",
      run_id: args.step.run_id,
      worker_id: args.workerId,
      attempt: args.step.attempt,
      trace_id: input.trace_id ?? null,
    },
  };
}
