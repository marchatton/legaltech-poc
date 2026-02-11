import { describe, expect, it } from "vitest";

import { buildMatterTabHref, firstSearchParamValue, resolveSelectedRunId } from "./runScope";

describe("run scope helpers", () => {
  it("builds report deep-links with run + status filters", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "report",
      runId: "run_456",
      status: "failed",
    });

    expect(href).toBe("/matters/fld_123?tab=report&run_id=run_456&status=failed");
  });

  it("omits optional params when absent", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "exports",
    });

    expect(href).toBe("/matters/fld_123?tab=exports");
  });

  it("uses requested run when available", () => {
    const selected = resolveSelectedRunId({
      availableRuns: [{ run_id: "run_newest" }, { run_id: "run_older" }],
      requestedRunId: "run_older",
    });

    expect(selected).toBe("run_older");
  });

  it("falls back to newest run when requested run is unavailable", () => {
    const selected = resolveSelectedRunId({
      availableRuns: [{ run_id: "run_newest" }, { run_id: "run_older" }],
      requestedRunId: "run_missing",
    });

    expect(selected).toBe("run_newest");
  });

  it("returns null when no runs are available", () => {
    const selected = resolveSelectedRunId({
      availableRuns: [],
      requestedRunId: "run_any",
    });

    expect(selected).toBeNull();
  });

  it("normalizes search params from single and array values", () => {
    expect(firstSearchParamValue(" run_1 ")).toBe("run_1");
    expect(firstSearchParamValue(["", " run_2 "])).toBe("run_2");
    expect(firstSearchParamValue(undefined)).toBeNull();
  });
});
