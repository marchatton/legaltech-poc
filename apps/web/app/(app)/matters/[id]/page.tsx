import { z } from "zod";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import {
  buildDocumentUploadCapabilities,
  deriveDocumentReadinessStatus,
} from "../../../../lib/documentSetup";
import {
  countReportRowsByTab,
  filterReportRowsByTab,
  parseReportTriageFilters,
} from "../../../../lib/reportTriage.server";
import { deriveRunFailureEnvelope } from "../../../../lib/runFailureEnvelope";
import { resolveCanonicalReadiness } from "../../../../lib/readinessContract.server";
import { Badge } from "../../../ui/Badge";
import { Card } from "../../../ui/Card";
import { EmptyState } from "../../../ui/EmptyState";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { OrbitalLoader } from "../../../ui/OrbitalLoader";
import { SectionTitle } from "../../../ui/Page";
import { ProgressBar } from "../../../ui/ProgressBar";
import { SegmentedControl } from "../../../ui/SegmentedControl";
import { StatePage } from "../../../ui/StatePage";
import { WorkspaceTabs, type WorkspaceTabItem } from "../../../ui/WorkspaceTabs";
import { firstSearchParamValue, resolveSelectedRunId, type RunSelectorOption } from "../runScope";

import { ExportsPanel } from "./ExportsPanel";
import { MatterAutoRefresh } from "./MatterAutoRefresh";
import { SetupDocumentsPanel } from "./SetupDocumentsPanel";
import { type QuickStartReadiness } from "./QuickStartPanel";
import { QuickStartActionButton } from "./QuickStartActionButton";
import { ChatPanel } from "./ChatPanel";
import { deriveOperatorChecklistSteps } from "./operatorChecklist";
import { ReportTriagePanel } from "./ReportTriagePanel";
import {
  ensureDbSchema,
  fetchFolder,
  fetchDocuments,
  fetchLatestRun,
  fetchRunOptions,
  fetchRequestedRun,
  fetchCompletedFallbackRun,
  fetchReportRows,
  fetchCitationIdsByRow,
  renderDocUrl,
  type ReportRowWithCounts,
} from "./matterDetail.server";
import {
  type SearchParamRecord,
  type MatterDetailTab,
  MATTER_DETAIL_TAB_ORDER,
  MATTER_DETAIL_TAB_LABELS,
  REPORT_TRIAGE_TABS,
  parseRunIdFilter,
  reportTabHref,
  parseDetailTab,
  buildDetailTabHref,
  matterStateBadgeVariant,
  matterStatusLabel,
} from "./matterDetailHelpers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

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

const RUN_PROGRESS_FAILURE_CODES = new Set(["RUN_QUEUED", "RUN_IN_PROGRESS"]);

function isRunProgressFailure(args: { code: string } | null): boolean {
  if (!args) return false;
  return RUN_PROGRESS_FAILURE_CODES.has(args.code);
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

  await ensureDbSchema();

  const folderId = parsed.data.id;
  const folder = await fetchFolder(folderId);
  if (!folder) {
    return <StatePage title="Matter" message="Matter not found." backHref="/matters" backLabel="Back to matters" />;
  }

  const docs = await fetchDocuments(folderId);
  const latestRun = await fetchLatestRun(folderId);

  const checklistSignal = latestRun
    ? {
        state: latestRun.state,
        createdAt: latestRun.created_at,
        updatedAt: latestRun.updated_at,
        startedAt: latestRun.started_at,
      }
    : null;
  const operatorChecklistSteps = deriveOperatorChecklistSteps(checklistSignal);
  const requestedRunId = firstSearchParamValue(rawSearchParams.run_id);
  const triageFilters = parseReportTriageFilters(rawSearchParams);
  const reportRequestedRunId = parseRunIdFilter(rawSearchParams);
  const activeTab = parseDetailTab(rawSearchParams);

  const exportRunRows = await fetchRunOptions(folderId);
  const runOptions: RunSelectorOption[] = exportRunRows.map((run) => ({
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
    const requested = await fetchRequestedRun(reportRequestedRunId, folderId);
    reportRun = requested ?? latestRun;
    activeRun = reportRun;
  } else if (!reportRequestedRunId && latestRun && latestRun.state !== "completed") {
    const fallback = await fetchCompletedFallbackRun(folderId);
    if (fallback && fallback.id !== latestRun.id) reportRun = fallback;
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
  const reportRunProgress = isRunProgressFailure(reportRunFailure);
  const activeRunProgress = isRunProgressFailure(activeRunFailure);
  const reportRunBlockingFailure = reportRunFailure && !reportRunProgress ? reportRunFailure : null;
  const activeRunBlockingFailure = activeRunFailure && !activeRunProgress ? activeRunFailure : null;
  const showingCompletedHistory = Boolean(
    activeRun && reportRun && activeRun.id !== reportRun.id && activeRun.state !== "completed",
  );

  const reportRows = reportRun ? await fetchReportRows(reportRun.id) : [];
  const reportRowIds = reportRows.map((row) => row.id);
  const citationIdsByRow = await fetchCitationIdsByRow(reportRowIds);
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
    open_pdf_url: renderDocUrl(doc),
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
  const chatContextGuidance = canonicalReadiness.reason;
  const quickStartReadiness: QuickStartReadiness =
    canonicalReadiness.state !== "runnable"
      ? {
          state: "blocked",
          reason:
            canonicalReadiness.reason_code === "NO_INDEXED_DOCUMENTS"
              ? "Upload a PDF and refresh readiness before running analysis."
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
  const showRunQuestionsProgress = runQuestionsDone > 0 || runQuestionsTotal > 0;
  const reportEmptyStateTitle = reportRunBlockingFailure
    ? "Run report unavailable"
    : reportRunProgress
      ? "Analysis in progress"
      : "No report rows yet";
  const reportEmptyStateDescription = reportRunBlockingFailure
    ? "No report rows were produced for this run. Re-run analysis after fixing the failure."
    : reportRunProgress
      ? "Report rows will appear after processing completes. Refresh in a moment."
      : "Run analysis to generate report rows for triage.";
  const showIngestingCenterState = !reportRun && canonicalReadiness.reason_code === "INGEST_IN_PROGRESS";
  const autoRefreshEnabled = canonicalReadiness.reason_code === "INGEST_IN_PROGRESS";

  return (
    <div className="min-w-0">
      <MatterAutoRefresh enabled={autoRefreshEnabled} />
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
              {showRunQuestionsProgress ? (
                <div className="flex items-center gap-3 rounded-ui-md border border-border bg-muted/30 px-3 py-2">
                  <ProgressIcon />
                  <div className="flex flex-col">
                    <span className="text-xs font-medium text-muted-foreground">
                      {runQuestionsDone}/{runQuestionsTotal} questions
                    </span>
                    <ProgressBar value={runProgress} className="mt-1 w-28" />
                  </div>
                </div>
              ) : null}
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
              <div className="mb-4">
                <span className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Progress</span>
              </div>

              <ol className="relative space-y-4">
                {operatorChecklistSteps.map((step, i) => {
                  const isLast = i === operatorChecklistSteps.length - 1;
                  return (
                    <li key={step.id} className="relative pl-6">
                      {!isLast && (
                        <span className="absolute left-[7px] top-4 h-[calc(100%+0.5rem)] w-0.5 bg-border" aria-hidden="true" />
                      )}
                      <span className={`absolute left-0 top-0.5 flex size-4 items-center justify-center rounded-full ${
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
                {activeRunBlockingFailure ? (
                  <ErrorBanner
                    title="Latest run needs attention"
                    code={activeRunBlockingFailure.code}
                    message={activeRunBlockingFailure.message}
                    traceId={activeRunBlockingFailure.trace_id}
                    retryable={activeRunBlockingFailure.retryable}
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
                        Select a completed run history or re-run analysis after the failure is resolved.
                      </div>
                    )}
                  </ErrorBanner>
                ) : null}
                {!activeRunBlockingFailure && activeRunProgress ? (
                  <div className="mb-3 text-xs text-muted-foreground">
                    {showingCompletedHistory && activeRun && reportRun ? (
                      <>
                        Showing report history from completed run{" "}
                        <span className="font-mono text-foreground">{reportRun.id}</span> while active run{" "}
                        <span className="font-mono text-foreground">{activeRun.id}</span> is{" "}
                        <span className="font-medium text-foreground">{activeRun.state}</span>.
                      </>
                    ) : (
                      "Analysis is still running. Report rows will appear when processing finishes."
                    )}
                  </div>
                ) : null}

                <SegmentedControl
                  options={REPORT_TRIAGE_TABS.map((tab) => ({
                    value: tab.id,
                    label: tab.label,
                    count: reportRowCounts[tab.id],
                    href: reportTabHref({
                      folderId,
                      runId: reportRun?.id ?? null,
                      rowTab: tab.id,
                    }),
                  }))}
                  value={triageFilters.rowTab}
                />

                {reportRowsWithCounts.length === 0 ? (
                  <EmptyState
                    icon={
                      reportRunProgress ? (
                        <OrbitalLoader size="lg" aria-label="Analysis in progress" />
                      ) : (
                        <DocumentIcon />
                      )
                    }
                    iconContainerClassName={reportRunProgress ? "bg-transparent text-foreground" : undefined}
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
            ) : showIngestingCenterState ? (
              <Card className="mx-auto max-w-2xl">
                <div className="px-6 py-10 text-center animate-fade-in-up sm:px-8">
                  <div className="mx-auto mb-4 flex size-14 items-center justify-center text-warning">
                    <OrbitalLoader size="lg" aria-label="Ingesting folder" />
                  </div>
                  <h2 className="font-serif text-heading-sm font-medium text-foreground">Folder is ingesting</h2>
                  <p className="mx-auto mt-1.5 max-w-xl text-sm text-muted-foreground">
                    Wait for indexing to complete, then refresh readiness.
                  </p>
                  <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                    <Badge variant="warning">Indexing in progress</Badge>
                    <Badge variant="muted">
                      {indexedReadyCount}/{setupDocuments.length} documents ready
                    </Badge>
                  </div>
                  <div className="mt-6">
                    <QuickStartActionButton
                      folderId={folderId}
                      readiness={quickStartReadiness}
                      appearance="button"
                      align="center"
                    />
                  </div>
                </div>
              </Card>
            ) : (
              <EmptyState
                icon={<DocumentIcon />}
                title="Click run analysis"
                description="We will process all uploaded documents, extract evidence, and generate citation-backed report rows."
                action={
                  <QuickStartActionButton
                    folderId={folderId}
                    readiness={quickStartReadiness}
                    appearance="button"
                    align="center"
                  />
                }
              />
            )}
          </section>
        ) : null}

        {activeTab === "documents" ? (
          <section className="max-w-3xl rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
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
          <section className="max-w-2xl rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="mb-3">
              <SectionTitle>Reports</SectionTitle>
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
