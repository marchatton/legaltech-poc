import "server-only";

import type { StepHandlerMap } from "../lib/wdk/wdkWorker.server";

import { quickStartWriteRowV0Step } from "./quickStartWriteRowV0.step.server";

export const quickStartStepHandlers: StepHandlerMap = {
  "quick_start_title_survey.write_row_v0": quickStartWriteRowV0Step,
};
