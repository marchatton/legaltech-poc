import { describe, expect, it } from "vitest";

import {
  buildMatterTabHref,
  exportDisabledReason,
  firstSearchParamValue,
  isExportRunEligible,
  resolveSelectedRunId,
} from "./runScope";

describe("run scope helpers", () => {
  it("builds report deep-links with run + row_tab filters", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "report",
      runId: "run_456",
      rowTab: "flagged",
    });

    expect(href).toBe("/matters/fld_123?tab=report&run_id=run_456&row_tab=flagged");
  });

  it("maps legacy row_tab values to row_tab=flagged", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "report",
      runId: "run_456",
      rowTab: "citation_failed",
    });

    expect(href).toBe("/matters/fld_123?tab=report&run_id=run_456&row_tab=flagged");
  });

  it("maps legacy status=failed links to row_tab=flagged", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "report",
      runId: "run_456",
      status: "failed",
    });

    expect(href).toBe("/matters/fld_123?tab=report&run_id=run_456&row_tab=flagged");
  });

  it("maps reviewed status links to row_tab=reviewed", () => {
    const href = buildMatterTabHref({
      matterId: "fld_123",
      tab: "report",
      runId: "run_456",
      status: "reviewed",
    });

    expect(href).toBe("/matters/fld_123?tab=report&run_id=run_456&row_tab=reviewed");
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

  it("treats only completed runs as export-eligible", () => {
    expect(isExportRunEligible("completed")).toBe(true);
    expect(isExportRunEligible("running")).toBe(false);
    expect(isExportRunEligible("failed")).toBe(false);
    expect(isExportRunEligible("partial")).toBe(false);
    expect(isExportRunEligible(null)).toBe(false);
  });

  it("publishes deterministic disabled reasons for non-completed runs", () => {
    expect(exportDisabledReason({ runId: null, runStatus: null })).toBe("Run analysis first to enable exports.");
    expect(exportDisabledReason({ runId: "run_a", runStatus: "running" })).toBe(
      "Run must complete before exports are available (current: running).",
    );
    expect(exportDisabledReason({ runId: "run_b", runStatus: "failed" })).toBe(
      "Run must complete before exports are available (current: failed).",
    );
    expect(exportDisabledReason({ runId: "run_c", runStatus: "completed" })).toBeNull();
  });
});
