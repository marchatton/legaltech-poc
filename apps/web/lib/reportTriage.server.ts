import "server-only";

import { z } from "zod";

const ReportTriageTabSchema = z.enum(["all", "needs_review", "reviewed", "flagged"]);
const FLAGGED_ROW_STATUSES = new Set(["citation_failed", "missing_input", "flagged"]);

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
  const rowTabRaw = firstString(raw.row_tab);
  const statusRaw = firstString(raw.status);

  const normalizedRowTab =
    rowTabRaw === "citation_failed" || rowTabRaw === "missing_input"
      ? "flagged"
      : rowTabRaw;
  const legacyMapped =
    statusRaw === "failed" ||
    statusRaw === "flagged" ||
    statusRaw === "citation_failed" ||
    statusRaw === "missing_input"
      ? "flagged"
      : statusRaw === "needs_review"
        ? "needs_review"
        : statusRaw === "reviewed"
          ? "reviewed"
          : undefined;
  const candidate = normalizedRowTab && normalizedRowTab.length > 0 ? normalizedRowTab : legacyMapped;
  const parsed = ReportTriageTabSchema.safeParse(candidate);
  return {
    rowTab: parsed.success ? parsed.data : "all",
  };
}

export function rowMatchesReportTriageTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
  if (args.rowTab === "all") return true;
  if (args.rowTab === "flagged") return FLAGGED_ROW_STATUSES.has(args.status);
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
    if (FLAGGED_ROW_STATUSES.has(row.status)) counts.flagged += 1;
  }

  return counts;
}
