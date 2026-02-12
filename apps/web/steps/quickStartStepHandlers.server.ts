import "server-only";

import type { StepHandlerMap } from "../lib/wdk/wdkWorker.server";

import { quickStartWriteRowV0Step } from "./quickStartWriteRowV0.step.server";

async function quickStartWriteRowV0StepHandler(
  args: Parameters<typeof quickStartWriteRowV0Step>[0],
): ReturnType<typeof quickStartWriteRowV0Step> {
  "use step";
  return quickStartWriteRowV0Step(args);
}

export const quickStartStepHandlers: StepHandlerMap = {
  "quick_start_title_survey.write_row_v0": quickStartWriteRowV0StepHandler,
};
