import { z } from "zod";

import Link from "next/link";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { formatDemoLoadedAtLabel } from "../../../../lib/demoMatterMetadata";
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
import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { EmptyState } from "../../../ui/EmptyState";
import { buttonClassName } from "../../../ui/Button";
import { ProgressBar } from "../../../ui/ProgressBar";
import { StatePage } from "../../../ui/StatePage";
import { WorkspaceTabs, type WorkspaceTabItem } from "../../../ui/WorkspaceTabs";
import { ArtefactsList } from "../ArtefactsList";
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
import { deriveFixtureContextBanner, fixtureStatusLabel } from "./fixtureContextBanner";
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
  { id: "citation_failed", label: "Citation Failed" },
  { id: "missing_input", label: "Missing Input" },
];

type MatterDetailTab = "report" | "documents" | "chat" | "artefacts" | "exports";

const MATTER_DETAIL_TAB_ORDER: MatterDetailTab[] = ["report", "documents", "chat", "artefacts", "exports"];
const MATTER_DETAIL_TAB_LABELS: Record<MatterDetailTab, string> = {
  report: "Report",
  documents: "Documents",
  chat: "Chat",
  artefacts: "Artefacts",
  exports: "Exports",
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

function matterStateBadgeVariant(state: string): BadgeVariant {
  if (state === "ready" || state === "indexed") return "success";
  if (state === "failed") return "destructive";
  return "warning";
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

function fixtureStatusClass(variant: BadgeVariant): string {
  if (variant === "success") {
    return "rounded-pill border border-success/30 bg-success/10 px-2 py-0.5 font-medium text-success";
  }
  if (variant === "info") {
    return "rounded-pill border border-primary/20 bg-primary/10 px-2 py-0.5 font-medium text-primary";
  }
  return "rounded-pill border border-warning/30 bg-warning/10 px-2 py-0.5 font-medium text-warning";
}

function checklistStepChipClass(state: "todo" | "in_progress" | "done"): string {
  if (state === "done") {
    return "rounded-ui-md border border-success/30 bg-success/10 px-2.5 py-2 text-xs";
  }
  if (state === "in_progress") {
    return "rounded-ui-md border border-warning/30 bg-warning/10 px-2.5 py-2 text-xs";
  }
  return "rounded-ui-md border border-border bg-card px-2.5 py-2 text-xs";
}

function checklistStepDotClass(state: "todo" | "in_progress" | "done"): string {
  if (state === "done") {
    return "size-3 rounded-pill border border-success/40 bg-success/20";
  }
  if (state === "in_progress") {
    return "size-3 rounded-pill border border-warning/40 bg-warning/20";
  }
  return "size-3 rounded-pill border border-border bg-background";
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
    SELECT id, name, state, latest_index_version, created_at, updated_at
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
    SELECT id, state, agent_bundle_version, questions_total, questions_done, created_at, updated_at, NULL::timestamptz AS started_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC
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

  const completedRuns = await sql<RunSelectorDbRow[]>`
    SELECT id, state, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
      AND state = 'completed'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 25
  `;
  const runOptions: RunSelectorOption[] = completedRuns.map((run) => ({
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
  if (reportRequestedRunId && reportRequestedRunId !== latestRun?.id) {
    const requestedRuns = await sql<RunSummaryRow[]>`
      SELECT id, state, agent_bundle_version, questions_total, questions_done, created_at, updated_at
      FROM runs
      WHERE id = ${reportRequestedRunId}
        AND folder_id = ${folderId}
        AND type = 'quick_start_title_survey'
      LIMIT 1
    `;
    reportRun = requestedRuns[0] ?? latestRun;
  }

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

  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";
  const chatEnabled = process.env.CHAT_ENABLED === "1";

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

  const runnable = folder.state === "indexed" || folder.state === "ready";
  let quickStartReadiness: QuickStartReadiness;
  if (latestRun?.state === "completed") {
    quickStartReadiness = {
      state: "already-complete",
      reason:
        "Latest Quick Start already completed. Review the outputs below, or load the pack again to create a fresh matter.",
    };
  } else if (latestRun) {
    quickStartReadiness = {
      state: "blocked",
      reason: `Quick Start already ${latestRun.state} for this matter. Wait for this run to finish, or load the pack again to create a fresh matter.`,
    };
  } else if (!runnable) {
    quickStartReadiness = {
      state: "blocked",
      reason:
        indexedReadyCount === 0
          ? `No indexed documents yet. Upload a source PDF and click Refresh readiness until at least one document reaches indexed-ready (current matter state: ${folder.state}).`
          : `Matter state is ${folder.state}. Wait until the matter reaches indexed/ready, then run Quick Start.`,
    };
  } else {
    quickStartReadiness = {
      state: "ready",
      reason: `${indexedReadyCount} indexed-ready document${indexedReadyCount === 1 ? "" : "s"} available. Run Quick Start now.`,
    };
  }
  const fixtureContextBanner = deriveFixtureContextBanner({
    matterName: folder.name,
    readiness: quickStartReadiness,
  });

  const unsafeOverrideEnabled =
    process.env.DEMO_MODE === "1" &&
    process.env.ALLOW_UNSAFE_EXPORTS === "1" &&
    Boolean(process.env.ORBITAL_ADMIN_TOKEN?.trim());

  const tabCounts: Record<MatterDetailTab, number | null> = {
    report: reportRowsWithCounts.length,
    documents: setupDocuments.length,
    chat: null,
    artefacts: null,
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
  }));
  const runQuestionsDone = latestRun?.questions_done ?? 0;
  const runQuestionsTotal = latestRun?.questions_total ?? 0;
  const runProgress = runQuestionsTotal > 0 ? Math.round((runQuestionsDone / runQuestionsTotal) * 100) : 0;

  return (
    <div className="min-w-0">
      <section className="border-b border-border/70 bg-background/95">
        <div className="px-6 py-6 lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <h1 className="font-serif text-heading-lg font-normal text-balance">{folder.name}</h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge variant={matterStateBadgeVariant(folder.state)}>{folder.state}</Badge>
                <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-2xs text-muted-foreground">{folder.id}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="min-w-52 rounded-ui-md border border-border bg-muted/30 px-3 py-2">
                <div className="flex items-center justify-between gap-2 text-2xs font-medium text-muted-foreground">
                  <span>Quick Start progress</span>
                  <span className="font-mono tabular-nums">{runQuestionsDone}/{runQuestionsTotal}</span>
                </div>
                <ProgressBar value={runProgress} className="mt-2" />
              </div>
              <QuickStartActionButton folderId={folderId} readiness={quickStartReadiness} />
            </div>
          </div>

          <WorkspaceTabs
            items={detailTabs}
            activeId={activeTab}
            ariaLabel="Matter detail sections"
            className="mt-4"
          />
        </div>
      </section>

      <div className="px-6 py-6 lg:px-8">
        {activeTab === "report" ? (
          <section className="space-y-4">
            <section className="rounded-ui-lg border border-border/70 bg-muted/20" title="Fixture context">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/70 px-4 py-2.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xs font-semibold uppercase tracking-wide text-muted-foreground">Fixture context</h2>
                  <span className={fixtureStatusClass(fixtureContextBanner.variant)}>
                    {fixtureStatusLabel(fixtureContextBanner.variant)}
                  </span>
                </div>
                <Link href="/matters" className={buttonClassName({ variant: "ghost", size: "sm" })}>
                  Load Pack Again
                </Link>
              </div>

              <div className="px-4 py-3">
                <dl className="grid gap-x-4 gap-y-2 text-2xs text-muted-foreground sm:grid-cols-[auto_1fr_auto_1fr]">
                  <dt className="font-semibold text-muted-foreground">Active pack:</dt>
                  <dd className="font-mono text-foreground/90">{fixtureContextBanner.activePack}</dd>
                  <dt className="font-semibold text-muted-foreground">Loaded at:</dt>
                  <dd className="font-mono tabular-nums text-foreground/90">
                    {fixtureContextBanner.loadedAt === "not detected"
                      ? "not detected"
                      : formatDemoLoadedAtLabel(fixtureContextBanner.loadedAt)}
                  </dd>
                  <dt className="font-semibold text-muted-foreground">Load state:</dt>
                  <dd className="font-mono text-foreground/90">{fixtureContextBanner.loadState}</dd>
                  <dt className="font-semibold text-muted-foreground">Next step:</dt>
                  <dd className="text-xs text-foreground/90 sm:col-span-3">{fixtureContextBanner.nextStep}</dd>
                </dl>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-border/70 pt-2.5">
                  <p className="text-2xs text-muted-foreground">{operatorChecklistSummary}</p>
                  <span className="rounded-pill border border-border/80 bg-card px-2 py-0.5 text-2xs text-muted-foreground">
                    {operatorElapsedLabel}
                  </span>
                </div>

                <ul className="mt-2 grid gap-2 sm:grid-cols-3">
                  {operatorChecklistSteps.map((step) => (
                    <li key={step.id} className={checklistStepChipClass(step.state)}>
                      <div className="flex items-center gap-2">
                        <span className={checklistStepDotClass(step.state)} aria-hidden="true" />
                        <span className={step.state === "done" ? "line-through text-muted-foreground" : "text-foreground"}>
                          {step.label}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {reportRun ? (
              <>
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

                  <span className="ml-auto text-xs text-muted-foreground">
                    run <span className="font-mono">{reportRun.id}</span> | showing {visibleReportRows.length}/{reportRowsWithCounts.length}
                  </span>
                </div>

                {reportRowsWithCounts.length === 0 ? (
                  <EmptyState
                    icon={<DocumentIcon />}
                    title="No report rows yet"
                    description="Run Quick Start to generate report rows for triage."
                  />
                ) : (
                  <ReportTriagePanel
                    folderId={folderId}
                    rowTab={triageFilters.rowTab}
                    rows={reportRowsForClient}
                    modelVersion={reportRun.agent_bundle_version}
                  />
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

        {activeTab === "chat" && chatEnabled ? (
          <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="mb-3 rounded-ui-md border border-warning/20 bg-warning/5 px-3 py-2 text-xs text-warning">
              Run-scoped chat picker is a backend follow-up (`N11`) and is flagged as a non-UI delta in this pass.
            </div>
            <ChatPanel folderId={folderId} />
          </section>
        ) : null}

        {activeTab === "chat" && !chatEnabled ? (
          <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <EmptyState title="Chat is unavailable" description="Set CHAT_ENABLED=1 to enable evidence-first chat for this matter." />
          </section>
        ) : null}

        {activeTab === "exports" ? (
          <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
            <div className="mb-3">
              <h2 className="font-serif text-heading-sm font-medium">Exports</h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Export a Word memo and CSV artefacts for a selected completed run.
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

        {activeTab === "artefacts" ? (
          artefactsListEnabled ? (
            <div className="animate-fade-in">
              <ArtefactsList folderId={folderId} searchParams={rawSearchParams} />
            </div>
          ) : (
            <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
              <EmptyState
                title="Artefacts list disabled"
                description="Enable FEATURE_ARTEFACTS_LIST=1 to use filtered artefact list and provenance view."
              />
            </section>
          )
        ) : null}
      </div>
    </div>
  );
}
