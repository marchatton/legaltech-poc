import { describe, expect, it } from "vitest";

import { assertWdkDirective } from "../lib/wdk/wdkDirectiveGuardrail.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";
import { startQuickStartTitleSurveyWorkflow } from "../workflows/quickStartTitleSurveyWorkflow.server";
import { startWdkSmokeWorkflow } from "../workflows/wdkSmokeWorkflow.server";

describe("wdk directive guardrail", () => {
  it("asserts directives for registered WDK steps", () => {
    const handlers = { ...wdkSmokeStepHandlers, ...quickStartStepHandlers };
    for (const [stepType, handler] of Object.entries(handlers)) {
      expect(() => {
        // assertWdkDirective() only inspects the function source; casting avoids strictFunctionTypes mismatch.
        assertWdkDirective(handler as unknown as (...args: unknown[]) => unknown, "use step", { kind: "step", id: stepType });
      }).not.toThrow();
    }
  });

  it("asserts directives for registered WDK workflows", () => {
    expect(() => {
      assertWdkDirective(startWdkSmokeWorkflow as unknown as (...args: unknown[]) => unknown, "use workflow", {
        kind: "workflow",
        id: "wdk_smoke",
      });
    }).not.toThrow();

    expect(() => {
      assertWdkDirective(startQuickStartTitleSurveyWorkflow, "use workflow", {
        kind: "workflow",
        id: "quick_start_title_survey",
      });
    }).not.toThrow();
  });

  it("fails when a directive is missing", () => {
    async function missingUseStep(): Promise<void> {
      return;
    }

    expect(() => {
      assertWdkDirective(missingUseStep, "use step", { kind: "step", id: "missingUseStep" });
    }).toThrow(/use step/);
  });
});
