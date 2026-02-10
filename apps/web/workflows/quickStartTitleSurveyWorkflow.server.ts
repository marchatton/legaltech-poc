import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { scheduleStep } from "../lib/wdk/stepQueue.server";

const ArgsSchema = z.object({
  runId: z.string().min(1),
  questionSetVersion: z.string().min(1),
  traceId: z.string().min(1).nullable().optional(),
  db: z.any().optional(),
});

export async function startQuickStartTitleSurveyWorkflow(args: {
  runId: string;
  questionSetVersion: string;
  traceId?: string | null;
  db?: Sql;
}): Promise<{ stepId: string; inserted: boolean; stepKey: string; stepType: string }> {
  "use workflow";

  const parsed = ArgsSchema.parse({
    runId: args.runId,
    questionSetVersion: args.questionSetVersion,
    traceId: args.traceId ?? null,
    db: args.db,
  });

  const stepKey = `quick_start:${parsed.questionSetVersion}:execute_v0`;
  const stepType = "quick_start_title_survey.execute_v0";

  const scheduled = await scheduleStep({
    runId: parsed.runId,
    stepKey,
    stepType,
    input: { trace_id: parsed.traceId ?? null },
    db: args.db,
  });

  return { stepId: scheduled.id, inserted: scheduled.inserted, stepKey, stepType };
}

