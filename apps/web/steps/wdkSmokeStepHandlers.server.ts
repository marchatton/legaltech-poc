import "server-only";

import type { StepHandlerMap } from "../lib/wdk/wdkWorker.server";

import { ingestDocumentProcessStep } from "./ingestDocumentProcess.step.server";
import { wdkSmokeDoneStep } from "./wdkSmokeDone.step.server";
import { wdkSmokeFlakyStep } from "./wdkSmokeFlaky.step.server";
import { wdkSmokeInitStep } from "./wdkSmokeInit.step.server";

export const wdkSmokeStepHandlers: StepHandlerMap = {
  "ingest_document.process": ingestDocumentProcessStep,
  "wdk_smoke.init": wdkSmokeInitStep,
  "wdk_smoke.flaky": wdkSmokeFlakyStep,
  "wdk_smoke.done": wdkSmokeDoneStep,
};
