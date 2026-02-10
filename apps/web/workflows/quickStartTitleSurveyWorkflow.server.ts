import "server-only";

import { z } from "zod";

import type { Sql } from "../lib/db.server";
import { loadQuestionSetV1 } from "../lib/questionSet.server";
import { scheduleStep } from "../lib/wdk/stepQueue.server";

const ArgsSchema = z.object({
  runId: z.string().min(1),
  questionSetVersion: z.string().min(1),
  traceId: z.string().min(1).nullable().optional(),
  db: z.any().optional(),
});

export type QuickStartScheduledStep = { stepId: string; inserted: boolean; stepKey: string; stepType: string };

export async function startQuickStartTitleSurveyWorkflow(args: {
  runId: string;
  questionSetVersion: string;
  traceId?: string | null;
  db?: Sql;
}): Promise<{ stepType: string; steps: QuickStartScheduledStep[] }> {
  "use workflow";

  const parsed = ArgsSchema.parse({
    runId: args.runId,
    questionSetVersion: args.questionSetVersion,
    traceId: args.traceId ?? null,
    db: args.db,
  });

  const { questionSet } = await loadQuestionSetV1();
  const stepType = "quick_start_title_survey.write_row_v0";

  const steps: QuickStartScheduledStep[] = [];
  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${parsed.questionSetVersion}:question:${q.question_id}:write_row`;
    const scheduled = await scheduleStep({
      runId: parsed.runId,
      stepKey,
      stepType,
      input: { trace_id: parsed.traceId ?? null, question_id: q.question_id },
      db: args.db,
    });
    steps.push({ stepId: scheduled.id, inserted: scheduled.inserted, stepKey, stepType });
  }

  return { stepType, steps };
}
