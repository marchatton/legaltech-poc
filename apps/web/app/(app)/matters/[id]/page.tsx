import { z } from "zod";

import Link from "next/link";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";

import {
  buildDocumentUploadCapabilities,
  deriveDocumentReadinessStatus,
  type DocumentOcrStatus,
  type DocumentParseStatus,
} from "../../../../lib/documentSetup";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";
import {
  countReportRowsByTab,
  filterReportRowsByTab,
  parseReportTriageFilters,
  type ReportTriageTab,
} from "../../../../lib/reportTriage.server";
import { deriveRunFailureEnvelope } from "../../../../lib/runFailureEnvelope";
import { resolveCanonicalReadiness } from "../../../../lib/readinessContract.server";
import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { EmptyState } from "../../../ui/EmptyState";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { buttonClassName } from "../../../ui/Button";
import { ProgressBar } from "../../../ui/ProgressBar";
import { StatePage } from "../../../ui/StatePage";
import { WorkspaceTabs, type WorkspaceTabItem } from "../../../ui/WorkspaceTabs";
import { firstSearchParamValue, resolveSelectedRunId, type RunSelectorOption } from "../runScope";

import { ExportsPanel } from "./ExportsPanel";
import { SetupDocumentsPanel } from "./SetupDocumentsPanel";
import { type QuickStartReadiness } from "./QuickStartPanel";
import { QuickStartActionButton } from "./QuickStartActionButton";
import { ChatPanel } from "./ChatPanel";
import {
  deriveOperatorChecklistSteps,
  formatOperatorElapsedLabel,
  summarizeOperatorChecklist,
} from "./operatorChecklist";
import { ReportTriagePanel } from "./ReportTriagePanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type SearchParamRecord = Record<string, string | string[] | undefined>;

type FolderRow = {
  id: string;
  name: string;
  state: string;
  latest_index_version: string;
  jurisdiction_state: string | null;
  created_at: Date;
  updated_at: Date;
};

type DocRow = {
  id: string;
  filename: string;
  storage_key: string | null;
  upload_completed_at: Date | null;
  parse_status: DocumentParseStatus;
  ocr_status: DocumentOcrStatus;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
  folder_id: string;
};

type RunSummaryRow = {
  id: string;
  state: string;
  agent_bundle_version: string | null;
  questions_total: number;
  questions_done: number;
  error_json: unknown | null;
  trace_id: string | null;
  created_at: Date;
  updated_at: Date;
  started_at: Date | null;
};

type RunSelectorDbRow = {
  id: string;
  state: string;
  created_at: Date;
  updated_at: Date;
};

type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  updated_at: Date;
};

type ReportRowWithCounts = ReportRow & {
  citation_count: number;
  citation_ids: string[];
};

const RunIdSchema = z.string().trim().min(1).max(200);

const REPORT_TRIAGE_TABS: Array<{ id: ReportTriageTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "needs_review", label: "Needs Review" },
  { id: "reviewed", label: "Reviewed" },
  { id: "flagged", label: "Flagged" },
];

type MatterDetailTab = "report" | "documents" | "chat" | "exports";

const MATTER_DETAIL_TAB_ORDER: MatterDetailTab[] = ["report", "documents", "chat", "exports"];
const MATTER_DETAIL_TAB_LABELS: Record<MatterDetailTab, string> = {
  report: "To-do",
  documents: "Documents",
  chat: "Chat",
  exports: "Reports",
};

function firstString(value: string | string[] | undefined): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function parseRunIdFilter(searchParams: Record<string, string | string[] | undefined>): string | null {
  const raw = firstString(searchParams.run_id);
  if (!raw) return null;
  const parsed = RunIdSchema.safeParse(raw);
  return parsed.success ? parsed.data : null;
}

function reportTabHref(args: { folderId: string; runId: string | null; rowTab: ReportTriageTab }): string {
  const params = new URLSearchParams();
  if (args.runId) params.set("run_id", args.runId);
  if (args.rowTab !== "all") params.set("row_tab", args.rowTab);
  params.set("tab", "report");
  const query = params.toString();
  return query.length > 0 ? `/matters/${encodeURIComponent(args.folderId)}?${query}` : `/matters/${encodeURIComponent(args.folderId)}`;
}

function parseDetailTab(searchParams: SearchParamRecord): MatterDetailTab {
  const raw = firstString(searchParams.tab);
  if (!raw) return "report";
  return MATTER_DETAIL_TAB_ORDER.includes(raw as MatterDetailTab) ? (raw as MatterDetailTab) : "report";
}

function buildDetailTabHref(args: {
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

function renderUrl(doc: DocRow): string | null {
  if (!doc.storage_key || !doc.upload_completed_at) return null;
  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) return null;

  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  return `/documents/${encodeURIComponent(doc.id)}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;
}

function matterStateBadgeVariant(args: {
  readinessState: "runnable" | "blocked";
  folderState: string;
}): BadgeVariant {
  if (args.readinessState === "runnable") return "success";
  if (args.folderState === "failed") return "destructive";
  return "warning";
}

function matterStatusLabel(args: {
  readinessState: "runnable" | "blocked";
  folderState: string;
}): string {
  if (args.readinessState === "runnable") return "Ready";
  if (args.folderState === "failed") return "Needs Attention";
  if (args.folderState === "ingesting") return "Processing";
  return "Blocked";
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function ProgressIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-primary" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function tabIcon(tabId: MatterDetailTab) {
  if (tabId === "report") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
        <path d="m5 13 4 4L19 7" />
      </svg>
    );
  }
  if (tabId === "documents") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
        <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
        <polyline points="14 2 14 8 20 8" />
      </svg>
    );
  }
  if (tabId === "chat") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    );
  }
  if (tabId === "exports") {
    return (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
        <path d="M12 3v12" />
        <path d="m7 10 5 5 5-5" />
        <path d="M5 21h14" />
      </svg>
    );
  }
  return null;
}

export default async function MatterPage(props: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<SearchParamRecord>;
}) {
  assertDevOrDemoProd();

  const rawParams = await props.params;
  const rawSearchParams = (await props.searchParams) ?? {};
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return <StatePage title="Matter" message="Invalid route params." />;
  }

  await ensureSchema();

  const folderId = parsed.data.id;
  const folders = await sql<FolderRow[]>`
    SELECT id, name, state, latest_index_version, jurisdiction_state, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return <StatePage title="Matter" message="Matter not found." backHref="/matters" backLabel="Back to matters" />;
  }

  const docs = await sql<DocRow[]>`
    SELECT id, folder_id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 1
  `;
  const latestRun = runs[0] ?? null;
  const checklistSignal = latestRun
    ? {
        state: latestRun.state,
        createdAt: latestRun.created_at,
        updatedAt: latestRun.updated_at,
        startedAt: latestRun.started_at,
      }
    : null;
  const operatorChecklistSteps = deriveOperatorChecklistSteps(checklistSignal);
  const operatorElapsedLabel = formatOperatorElapsedLabel(checklistSignal);
  const operatorChecklistSummary = summarizeOperatorChecklist(operatorChecklistSteps);
  const requestedRunId = firstSearchParamValue(rawSearchParams.run_id);
  const triageFilters = parseReportTriageFilters(rawSearchParams);
  const reportRequestedRunId = parseRunIdFilter(rawSearchParams);
  const activeTab = parseDetailTab(rawSearchParams);

  const exportRuns = await sql<RunSelectorDbRow[]>`
    SELECT id, state, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 25
  `;
  const runOptions: RunSelectorOption[] = exportRuns.map((run) => ({
    run_id: run.id,
    status: run.state,
    created_at: run.created_at.toISOString(),
    updated_at: run.updated_at.toISOString(),
  }));
  const initialExportRunId = resolveSelectedRunId({
    availableRuns: runOptions,
    requestedRunId,
  });

  let reportRun = latestRun;
  let activeRun = latestRun;
  if (reportRequestedRunId && reportRequestedRunId !== latestRun?.id) {
    const requestedRuns = await sql<RunSummaryRow[]>`
      SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
      FROM runs
      WHERE id = ${reportRequestedRunId}
        AND folder_id = ${folderId}
        AND type = 'quick_start_title_survey'
      LIMIT 1
    `;
    reportRun = requestedRuns[0] ?? latestRun;
    activeRun = reportRun;
  } else if (!reportRequestedRunId && latestRun && latestRun.state !== "completed") {
    const fallbackRuns = await sql<RunSummaryRow[]>`
      SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
      FROM runs
      WHERE folder_id = ${folderId}
        AND type = 'quick_start_title_survey'
        AND state = ${"completed"}
      ORDER BY created_at DESC, updated_at DESC, id DESC
      LIMIT 1
    `;
    const fallbackRun = fallbackRuns[0] ?? null;
    if (fallbackRun && fallbackRun.id !== latestRun.id) reportRun = fallbackRun;
  }

  const reportRunFailure = reportRun
    ? deriveRunFailureEnvelope({
        runId: reportRun.id,
        state: reportRun.state,
        errorJson: reportRun.error_json,
        traceId: reportRun.trace_id,
      })
    : null;
  const activeRunFailure = activeRun
    ? deriveRunFailureEnvelope({
        runId: activeRun.id,
        state: activeRun.state,
        errorJson: activeRun.error_json,
        traceId: activeRun.trace_id,
      })
    : null;
  const showingCompletedHistory = Boolean(activeRunFailure && activeRun && reportRun && activeRun.id !== reportRun.id);

  const reportRows = reportRun
    ? await sql<ReportRow[]>`
        SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, updated_at
        FROM report_rows
        WHERE run_id = ${reportRun.id}
        ORDER BY created_at ASC, question_id ASC
      `
    : [];
  const reportRowIds = reportRows.map((row) => row.id);
  const reportCitations = reportRowIds.length
    ? await sql<Array<{ report_row_id: string; citation_id: string }>>`
        SELECT report_row_id, id AS citation_id
        FROM citations
        WHERE report_row_id = ANY(${reportRowIds})
        ORDER BY report_row_id ASC, id ASC
      `
    : [];
  const citationIdsByRow = new Map<string, string[]>();
  for (const item of reportCitations) {
    const existing = citationIdsByRow.get(item.report_row_id);
    if (existing) existing.push(item.citation_id);
    else citationIdsByRow.set(item.report_row_id, [item.citation_id]);
  }
  const reportRowsWithCounts: ReportRowWithCounts[] = reportRows.map((row) => ({
    ...row,
    citation_count: citationIdsByRow.get(row.id)?.length ?? 0,
    citation_ids: citationIdsByRow.get(row.id) ?? [],
  }));
  const reportRowsForClient = reportRowsWithCounts.map((row) => ({
    ...row,
    updated_at: row.updated_at.toISOString(),
  }));
  const reportRowCounts = countReportRowsByTab(reportRowsWithCounts);
  const visibleReportRows = filterReportRowsByTab({
    rows: reportRowsWithCounts,
    rowTab: triageFilters.rowTab,
  });

  const setupDocuments = docs.map((doc) => ({
    id: doc.id,
    folder_id: doc.folder_id,
    filename: doc.filename,
    upload_completed_at: doc.upload_completed_at ? doc.upload_completed_at.toISOString() : null,
    parse_status: doc.parse_status,
    ocr_status: doc.ocr_status,
    status: deriveDocumentReadinessStatus({
      uploadCompletedAt: doc.upload_completed_at,
      parseStatus: doc.parse_status,
      ocrStatus: doc.ocr_status,
    }),
    extraction_quality: doc.extraction_quality,
    page_count: doc.page_count,
    error_json: doc.error_json,
    created_at: doc.created_at.toISOString(),
    open_pdf_url: renderUrl(doc),
  }));
  const indexedReadyCount = setupDocuments.reduce(
    (count, doc) => (doc.status === "indexed-ready" ? count + 1 : count),
    0,
  );

  const canonicalReadiness = resolveCanonicalReadiness({
    folderState: folder.state,
    folderName: folder.name,
    documentFilenames: setupDocuments.map((doc) => doc.filename),
    indexedReadyCount,
  });
  const runnable = canonicalReadiness.state === "runnable";
  const chatContextReady = runnable && indexedReadyCount > 0;
  const chatContextGuidance =
    indexedReadyCount === 0
      ? "Upload a PDF and refresh readiness to enable chat."
      : "Waiting for matter to reach ready state.";
  const quickStartReadiness: QuickStartReadiness =
    canonicalReadiness.state !== "runnable"
      ? {
          state: "blocked",
          reason:
            canonicalReadiness.reason_code === "NO_INDEXED_DOCUMENTS"
              ? "Upload a PDF and refresh readiness before running Quick Start."
              : canonicalReadiness.reason,
        }
      : {
          state: "ready",
          reason: canonicalReadiness.reason,
        };
  const unsafeOverrideEnabled =
    process.env.DEMO_MODE === "1" &&
    process.env.ALLOW_UNSAFE_EXPORTS === "1" &&
    Boolean(process.env.ORBITAL_ADMIN_TOKEN?.trim());

  const tabCounts: Record<MatterDetailTab, number | null> = {
    report: reportRowsWithCounts.length,
    documents: setupDocuments.length,
    chat: null,
    exports: runOptions.length,
  };
  const detailTabs: WorkspaceTabItem[] = MATTER_DETAIL_TAB_ORDER.map((tabId) => ({
    id: tabId,
    label: MATTER_DETAIL_TAB_LABELS[tabId],
    href: buildDetailTabHref({
      folderId,
      tab: tabId,
      rawSearchParams,
      reportRunId: reportRun?.id ?? null,
    }),
    count: tabCounts[tabId],
    icon: tabIcon(tabId),
  }));
  const runQuestionsDone = latestRun?.questions_done ?? 0;
  const runQuestionsTotal = latestRun?.questions_total ?? 0;
  const runProgress = runQuestionsTotal > 0 ? Math.round((runQuestionsDone / runQuestionsTotal) * 100) : 0;
  const reportEmptyStateTitle = reportRunFailure ? "Run report unavailable" : "No report rows yet";
  const reportEmptyStateDescription = reportRunFailure
    ? "No report rows were produced for this run. Re-run Quick Start after fixing the failure."
    : "Run Quick Start to generate report rows for triage.";

  return (
    <div className="min-w-0">
      <section className="sticky top-0 z-10 border-b border-border bg-card">
        <div className="px-6 pt-4 lg:px-8">
          <div className="flex flex-wrap items-center justify-between gap-4 pb-4">
            <div className="flex items-center gap-3 min-w-0">
              <h1 className="font-serif text-2xl font-semibold text-foreground truncate">{folder.name}</h1>
              <Badge
                variant={matterStateBadgeVariant({
                  readinessState: canonicalReadiness.state,
                  folderState: folder.state,
                })}
                className="shrink-0"
              >
                {matterStatusLabel({
                  readinessState: canonicalReadiness.state,
                  folderState: folder.state,
                })}
              </Badge>
              {folder.jurisdiction_state ? (
                <Badge variant="muted" className="shrink-0">
                  {folder.jurisdiction_state}
                </Badge>
              ) : null}
            </div>

            <div className="flex items-center gap-3 shrink-0">
              <div className="flex items-center gap-3 rounded-ui-md border border-border bg-muted/30 px-3 py-2">
                <ProgressIcon />
                <div className="flex flex-col">
                  <span className="text-xs font-medium text-muted-foreground">
                    {runQuestionsDone}/{runQuestionsTotal} questions
                  </span>
                  <ProgressBar value={runProgress} className="mt-1 w-28" />
                </div>
              </div>
              <QuickStartActionButton folderId={folderId} readiness={quickStartReadiness} />
            </div>
          </div>

          <WorkspaceTabs
            items={detailTabs}
            activeId={activeTab}
            ariaLabel="Matter detail sections"
          />
        </div>
      </section>

      <div className="px-6 py-6 lg:px-8">
        {activeTab === "report" ? (
          <section className="space-y-4">
            <div className="max-w-lg rounded-ui-lg border border-border/70 bg-muted/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
                  <span className="text-2xs text-muted-foreground">{operatorChecklistSummary} · {operatorElapsedLabel}</span>
                </div>
                <Link href="/matters" className={buttonClassName({ variant: "secondary", size: "sm" })}>
                  Load Pack Again
                </Link>
              </div>

              <ol className="relative ml-3 space-y-4">
                {operatorChecklistSteps.map((step, i) => {
                  const isFirst = i === 0;
                  const isLast = i === operatorChecklistSteps.length - 1;
                  return (
                    <li key={step.id} className="relative pl-6">
                      {!isLast && (
                        <span className="absolute -left-[1px] top-4 h-[calc(100%+0.5rem)] w-0.5 bg-border" aria-hidden="true" />
                      )}
                      <span className={`absolute -left-[9px] top-0.5 flex size-4 items-center justify-center rounded-full ${
                        step.state === "done"
                          ? "bg-success text-white"
                          : step.state === "in_progress"
                            ? "bg-warning text-white"
                            : "border-2 border-border bg-card"
                      }`}>
                        {step.state === "done" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" className="size-2.5" aria-hidden="true">
                            <path d="m5 13 4 4L19 7" />
                          </svg>
                        ) : step.state === "in_progress" ? (
                          <span className="size-1.5 rounded-full bg-white animate-pulse" />
                        ) : null}
                      </span>
                      <div className={`text-sm ${step.state === "done" ? "text-muted-foreground" : step.state === "in_progress" ? "font-medium text-foreground" : "text-muted-foreground"}`}>
                        {step.label}
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            {reportRun ? (
              <>
                {activeRunFailure ? (
                  <ErrorBanner
                    title="Latest run needs attention"
                    code={activeRunFailure.code}
                    message={activeRunFailure.message}
                    traceId={activeRunFailure.trace_id}
                    retryable={activeRunFailure.retryable}
                    supportRoute={`/matters/${folderId}`}
                    showSupportAction={false}
                    className="mb-4"
                  >
                    {showingCompletedHistory && activeRun && reportRun ? (
                      <div className="text-2xs text-muted-foreground">
                        Showing report history from completed run{" "}
                        <span className="font-mono text-foreground">{reportRun.id}</span> while active run{" "}
                        <span className="font-mono text-foreground">{activeRun.id}</span> is{" "}
                        <span className="font-medium text-foreground">{activeRun.state}</span>.
                      </div>
                    ) : (
                      <div className="text-2xs text-muted-foreground">
                        Select a completed run history or re-run Quick Start after the failure is resolved.
                      </div>
                    )}
                  </ErrorBanner>
                ) : null}

                <div className="flex flex-wrap items-center gap-2" aria-label="Report row status tabs">
                  {REPORT_TRIAGE_TABS.map((tab) => {
                    const isActive = triageFilters.rowTab === tab.id;
                    return (
                      <Link
                        key={tab.id}
                        href={reportTabHref({
                          folderId,
                          runId: reportRun?.id ?? null,
                          rowTab: tab.id,
                        })}
                        aria-current={isActive ? "page" : undefined}
                        className={
                          isActive
                            ? "inline-flex items-center gap-2 rounded-pill border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                            : "inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-micro ease-brand-standard"
                        }
                      >
                        <span>{tab.label}</span>
                        <span
                          className={
                            isActive
                              ? "rounded-pill bg-primary-foreground/20 px-1.5 py-0.5 text-2xs font-semibold tabular-nums"
                              : "rounded-pill bg-muted px-1.5 py-0.5 text-2xs font-semibold text-muted-foreground tabular-nums"
                          }
                        >
                          {reportRowCounts[tab.id]}
                        </span>
                      </Link>
                    );
                  })}

                </div>

                {reportRowsWithCounts.length === 0 ? (
                  <EmptyState
                    icon={<DocumentIcon />}
                    title={reportEmptyStateTitle}
                    description={reportEmptyStateDescription}
                  />
                ) : (
                  <>
                    <ReportTriagePanel
                      folderId={folderId}
                      rowTab={triageFilters.rowTab}
                      rows={reportRowsForClient}
                      modelVersion={reportRun.agent_bundle_version}
                    />
                    <p className="mt-2 text-right text-xs text-muted-foreground">
                      Showing {visibleReportRows.length}/{reportRowsWithCounts.length}
                    </p>
                  </>
                )}
              </>
            ) : (
              <EmptyState
                icon={<DocumentIcon />}
                title="No runs to review"
                description="Start Quick Start first, then triage report rows here."
              />
            )}
          </section>
        ) : null}

        {activeTab === "documents" ? (
          <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <SetupDocumentsPanel
              folderId={folderId}
              folderState={folder.state}
              initialDocuments={setupDocuments}
              initialCapabilities={buildDocumentUploadCapabilities()}
            />
          </section>
        ) : null}

        {activeTab === "chat" ? (
          <section>
            <ChatPanel folderId={folderId} contextReady={chatContextReady} contextGuidance={chatContextGuidance} />
          </section>
        ) : null}

        {activeTab === "exports" ? (
          <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="mb-3">
              <h2 className="font-serif text-heading-sm font-medium">Reports</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Export a Word memo, CSV artefacts, and report files for a selected completed run.
              </p>
            </div>
            <ExportsPanel
              folderId={folderId}
              runOptions={runOptions}
              initialRunId={initialExportRunId}
              unsafeOverrideEnabled={unsafeOverrideEnabled}
            />
          </section>
        ) : null}
      </div>
    </div>
  );
}
