import "server-only";

import type { StepHandlerMap } from "../lib/wdk/wdkWorker.server";

import { quickStartExecuteV0Step } from "./quickStartExecuteV0.step.server";

export const quickStartStepHandlers: StepHandlerMap = {
  "quick_start_title_survey.execute_v0": quickStartExecuteV0Step,
};

