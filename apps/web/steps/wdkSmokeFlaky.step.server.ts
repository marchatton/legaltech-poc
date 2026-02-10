import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { scheduleStep } from "../lib/wdk/stepQueue.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
});

export async function wdkSmokeFlakyStep(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);

  if (args.step.attempt === 1) {
    throw new Error("WDK_SMOKE_FLAKY_FAIL_ONCE");
  }

  await scheduleStep({
    runId: args.step.run_id,
    stepKey: "wdk_smoke:done",
    stepType: "wdk_smoke.done",
    input: { trace_id: input.trace_id ?? null },
    db: args.db,
  });

  return {
    output: {
      step: "flaky",
      run_id: args.step.run_id,
      worker_id: args.workerId,
      attempt: args.step.attempt,
    },
  };
}

