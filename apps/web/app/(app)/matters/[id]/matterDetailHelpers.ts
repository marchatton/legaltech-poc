import { z } from "zod";

import type { BadgeVariant } from "../../../ui/Badge";
import type { ReportTriageTab } from "../../../../lib/reportTriage.server";

export type SearchParamRecord = Record<string, string | string[] | undefined>;
export type MatterDetailTab = "report" | "documents" | "chat" | "exports";

export const MATTER_DETAIL_TAB_ORDER: MatterDetailTab[] = ["report", "documents", "chat", "exports"];
export const MATTER_DETAIL_TAB_LABELS: Record<MatterDetailTab, string> = {
  report: "To-do",
  documents: "Documents",
  chat: "Chat",
  exports: "Reports",
};

export const REPORT_TRIAGE_TABS: Array<{ id: ReportTriageTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs Review" },
  { id: "reviewed", label: "Reviewed" },
  { id: "flagged", label: "Flagged" },
];

const RunIdSchema = z.string().trim().min(1).max(200);

export function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

export function parseRunIdFilter(searchParams: SearchParamRecord): string | null {
  const raw = firstString(searchParams.run_id);
  if (!raw) return null;
  const parsed = RunIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

export function reportTabHref(args: { folderId: string; runId: string | null; rowTab: ReportTriageTab }): string {
  const params = new URLSearchParams();
  if (args.runId) params.set("run_id", args.runId);
  if (args.rowTab !== "all") params.set("row_tab", args.rowTab);
  params.set("tab", "report");
  const query = params.toString();
  return query.length > 0 ? `/matters/${encodeURIComponent(args.folderId)}?${query}` : `/matters/${encodeURIComponent(args.folderId)}`;
}

export function parseDetailTab(searchParams: SearchParamRecord): MatterDetailTab {
  const raw = firstString(searchParams.tab);
  if (!raw) return "report";
  return MATTER_DETAIL_TAB_ORDER.includes(raw as MatterDetailTab) ? (raw as MatterDetailTab) : "report";
}

export function buildDetailTabHref(args: {
  folderId: string;
  tab: MatterDetailTab;
  rawSearchParams: SearchParamRecord;
  reportRunId: string | null;
}): string {
  const params = new URLSearchParams();
  const runId = firstString(args.rawSearchParams.run_id);
  const rowTab = firstString(args.rawSearchParams.row_tab);
  if (runId) params.set("run_id", runId);
  if (rowTab && rowTab !== "all") params.set("row_tab", rowTab);
  params.set("tab", args.tab);

  if (args.tab === "report" && args.reportRunId && !params.get("run_id")) {
    params.set("run_id", args.reportRunId);
  }

  const query = params.toString();
  return query.length > 0 ? `/matters/${encodeURIComponent(args.folderId)}?${query}` : `/matters/${encodeURIComponent(args.folderId)}`;
}

export function matterStateBadgeVariant(args: {
  readinessState: "runnable" | "blocked";
  folderState: string;
}): BadgeVariant {
  if (args.readinessState === "runnable") return "success";
  if (args.folderState === "failed") return "destructive";
  return "warning";
}

export function matterStatusLabel(args: {
  readinessState: "runnable" | "blocked";
  folderState: string;
}): string {
  if (args.readinessState === "runnable") return "Ready";
  if (args.folderState === "failed") return "Needs Attention";
  if (args.folderState === "ingesting") return "Processing";
  return "Blocked";
}

export function formatAnswerForDisplay(answer: string): string {
  return answer.replace(/\*\*/g, "");
}
