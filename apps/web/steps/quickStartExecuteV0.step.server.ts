import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { processQuickStartRun } from "../lib/quickStartRunProcessor.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

const InputSchema = z.object({
  trace_id: z.string().min(1).nullable().optional(),
});

export async function quickStartExecuteV0Step(args: { step: StepRow; workerId: string; db?: Sql }): Promise<{
  output: unknown;
  metrics?: unknown;
}> {
  "use step";

  const input = InputSchema.parse(args.step.input_json);

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.execute_v0.started", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    trace_id: input.trace_id ?? null,
  });

  const startedAt = Date.now();
  await processQuickStartRun(args.step.run_id);
  const durationMs = Date.now() - startedAt;

  // eslint-disable-next-line no-console
  console.info("wdk.quick_start.execute_v0.completed", {
    orchestration: "wdk",
    worker_id: args.workerId,
    step_id: args.step.id,
    run_id: args.step.run_id,
    step_key: args.step.step_key,
    step_type: args.step.step_type,
    attempt: args.step.attempt,
    duration_ms: durationMs,
    trace_id: input.trace_id ?? null,
  });

  return {
    output: {
      ok: true,
      run_id: args.step.run_id,
      duration_ms: durationMs,
      trace_id: input.trace_id ?? null,
    },
    metrics: { duration_ms: durationMs },
  };
}

