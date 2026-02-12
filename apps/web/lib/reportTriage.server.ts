import "server-only";

import { z } from "zod";

const ReportTriageTabSchema = z.enum(["all", "needs_review", "citation_failed", "missing_input"]);

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
  const legacyMapped =
    statusRaw === "failed" || statusRaw === "flagged"
      ? "citation_failed"
      : statusRaw === "needs_review"
        ? "needs_review"
        : statusRaw === "missing_input"
          ? "missing_input"
          : undefined;
  const candidate = rowTabRaw && rowTabRaw.length > 0 ? rowTabRaw : legacyMapped;
  const parsed = ReportTriageTabSchema.safeParse(candidate);
  return {
    rowTab: parsed.success ? parsed.data : "all",
  };
}

export function rowMatchesReportTriageTab(args: { status: string; rowTab: ReportTriageTab }): boolean {
  if (args.rowTab === "all") return true;
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
    citation_failed: 0,
    missing_input: 0,
  };

  for (const row of rows) {
    if (row.status === "needs_review") counts.needs_review += 1;
    if (row.status === "citation_failed") counts.citation_failed += 1;
    if (row.status === "missing_input") counts.missing_input += 1;
  }

  return counts;
}
