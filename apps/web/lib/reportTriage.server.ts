import "server-only";

import { z } from "zod";

const ReportTriageTabSchema = z.enum(["all", "needs_review", "reviewed", "flagged"]);

export type ReportTriageTab = z.infer<typeof ReportTriageTabSchema>;

export type ReportTriageFilters = {
  rowTab: ReportTriageTab;
};

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export function parseReportTriageFilters(raw: Record<string, unknown>): ReportTriageFilters {
  const rowTab = firstString(raw.row_tab);
  const parsed = ReportTriageTabSchema.safeParse(rowTab && rowTab.length > 0 ? rowTab : undefined);
  return {
    rowTab: parsed.success ? parsed.data : "all",
  };
}

export function isFlaggedReportStatus(status: string): boolean {
  return status === "citation_failed" || status === "missing_input";
}

export function rowMatchesReportTriageTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
  if (args.rowTab === "all") return true;
  if (args.rowTab === "flagged") return isFlaggedReportStatus(args.status);
  return args.status === args.rowTab;
}

export function filterReportRowsByTab<T extends { status: string }>(args: {
  rows: T[];
  rowTab: ReportTriageTab;
}): T[] {
  return args.rows.filter((row) => rowMatchesReportTriageTab({ status: row.status, rowTab: args.rowTab }));
}

export type ReportTriageTabCounts = Record<ReportTriageTab, number>;

export function countReportRowsByTab(rows: Array<{ status: string }>): ReportTriageTabCounts {
  const counts: ReportTriageTabCounts = {
    all: rows.length,
    needs_review: 0,
    reviewed: 0,
    flagged: 0,
  };

  for (const row of rows) {
    if (row.status === "needs_review") counts.needs_review += 1;
    if (row.status === "reviewed") counts.reviewed += 1;
    if (isFlaggedReportStatus(row.status)) counts.flagged += 1;
  }

  return counts;
}
