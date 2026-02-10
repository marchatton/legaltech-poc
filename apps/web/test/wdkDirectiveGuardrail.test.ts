import { describe, expect, it } from "vitest";

import { assertWdkDirective } from "../lib/wdk/wdkDirectiveGuardrail.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";
import { startWdkSmokeWorkflow } from "../workflows/wdkSmokeWorkflow.server";

describe("wdk directive guardrail", () => {
  it("asserts directives for registered WDK steps", () => {
    for (const [stepType, handler] of Object.entries(wdkSmokeStepHandlers)) {
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
