import { describe, expect, it } from "vitest";

import {
  countReportRowsByTab,
  filterReportRowsByTab,
  parseReportTriageFilters,
  rowMatchesReportTriageTab,
} from "../lib/reportTriage.server";

describe("report triage filters", () => {
  it("defaults to all when row_tab is invalid", () => {
    const parsed = parseReportTriageFilters({ row_tab: "unknown" });
    expect(parsed).toEqual({ rowTab: "all" });
  });

  it("keeps explicit needs_review query value", () => {
    const parsed = parseReportTriageFilters({ row_tab: "needs_review" });
    expect(parsed).toEqual({ rowTab: "needs_review" });
  });

  it("maps flagged tab to missing_input and citation_failed rows", () => {
    const rows = [
      { id: "r1", status: "needs_review" },
      { id: "r2", status: "reviewed" },
      { id: "r3", status: "missing_input" },
      { id: "r4", status: "citation_failed" },
    ];

    const filtered = filterReportRowsByTab({ rows, rowTab: "flagged" });
    expect(filtered.map((row) => row.id)).toEqual(["r3", "r4"]);
  });

  it("returns deterministic tab counts", () => {
    const rows = [
      { status: "needs_review" },
      { status: "reviewed" },
      { status: "missing_input" },
      { status: "citation_failed" },
      { status: "reviewed" },
    ];

    expect(countReportRowsByTab(rows)).toEqual({
      all: 5,
      needs_review: 1,
      reviewed: 2,
      flagged: 2,
    });
  });

  it("matches individual status rows against active triage tab", () => {
    expect(rowMatchesReportTriageTab({ status: "reviewed", rowTab: "reviewed" })).toBe(true);
    expect(rowMatchesReportTriageTab({ status: "citation_failed", rowTab: "flagged" })).toBe(true);
    expect(rowMatchesReportTriageTab({ status: "reviewed", rowTab: "needs_review" })).toBe(false);
  });
});
