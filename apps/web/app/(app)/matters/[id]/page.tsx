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
import { Alert } from "../../../ui/Alert";
import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { Card } from "../../../ui/Card";
import { EmptyState } from "../../../ui/EmptyState";
import { MonoId } from "../../../ui/MonoId";
import { Page, PageHeader, SectionTitle } from "../../../ui/Page";
import { ProgressBar } from "../../../ui/ProgressBar";
import { ArtefactsList } from "../ArtefactsList";
import { firstSearchParamValue, resolveSelectedRunId, type RunSelectorOption } from "../runScope";

import { ExportsPanel } from "./ExportsPanel";
import { SetupDocumentsPanel } from "./SetupDocumentsPanel";
import { QuickStartPanel, type QuickStartReadiness } from "./QuickStartPanel";
import { ChatPanel } from "./ChatPanel";
import {
  deriveOperatorChecklistSteps,
  formatOperatorElapsedLabel,
  type OperatorChecklistState,
} from "./operatorChecklist";
import { deriveFixtureContextBanner } from "./fixtureContextBanner";
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
  { id: "reviewed", label: "Reviewed" },
  { id: "flagged", label: "Flagged" },
];

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

function checklistBadgeVariant(state: OperatorChecklistState): BadgeVariant {
  if (state === "done") return "success";
  if (state === "in_progress") return "warning";
  return "muted";
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
    return (
      <Page>
        <PageHeader title="Matter" subtitle="Invalid route params." />
      </Page>
    );
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
    return (
      <Page>
        <PageHeader title="Matter" subtitle="Matter not found." />
      </Page>
    );
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
  const requestedRunId = firstSearchParamValue(rawSearchParams.run_id);
  const triageFilters = parseReportTriageFilters(rawSearchParams);
  const reportRequestedRunId = parseRunIdFilter(rawSearchParams);

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

  return (
    <Page>
      <PageHeader
        title="Matter"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <MonoId>{folder.id}</MonoId>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground">{folder.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
              {folder.state}
            </span>
          </span>
        }
        right={
          <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href="/matters">
            Back to matters
          </Link>
        }
      />

      <Card className="mt-8 p-4">
        <Alert variant={fixtureContextBanner.variant} title="Fixture context">
          <div className="grid gap-2 text-sm">
            <div>
              <span className="font-semibold text-foreground">Active pack:</span>{" "}
              <span className="font-mono text-xs text-foreground">{fixtureContextBanner.activePack}</span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Loaded at:</span>{" "}
              <span className="font-mono text-xs text-foreground">
                {fixtureContextBanner.loadedAt === "not detected"
                  ? "not detected"
                  : formatDemoLoadedAtLabel(fixtureContextBanner.loadedAt)}
              </span>
            </div>
            <div>
              <span className="font-semibold text-foreground">Load state:</span> {fixtureContextBanner.loadState}
            </div>
            <div>
              <span className="font-semibold text-foreground">Next step:</span> {fixtureContextBanner.nextStep}
            </div>
          </div>
        </Alert>
      </Card>

      <Card className="mt-8 p-4">
        <SetupDocumentsPanel
          folderId={folderId}
          folderState={folder.state}
          initialDocuments={setupDocuments}
          initialCapabilities={buildDocumentUploadCapabilities()}
        />
      </Card>

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <SectionTitle>Operator checklist</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Ordered run steps derived from live Quick Start signals.
            </p>
          </div>
          <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
            {operatorElapsedLabel}
          </span>
        </div>

        <ol className="mt-4 grid gap-2">
          {operatorChecklistSteps.map((step, idx) => (
            <li
              key={step.id}
              className="flex items-center justify-between gap-3 rounded-ui-md border border-border/70 bg-card px-3 py-2"
            >
              <div className="flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">{idx + 1}.</span>
                <span className="text-foreground">{step.label}</span>
              </div>
              <Badge variant={checklistBadgeVariant(step.state)}>{step.state}</Badge>
            </li>
          ))}
        </ol>
      </Card>

      {chatEnabled ? (
        <Card className="mt-8 p-4">
          <SectionTitle>Chat</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Evidence-first chat over the indexed documents in this matter.
          </p>
          <div className="mt-4">
            <ChatPanel folderId={folderId} />
          </div>
        </Card>
      ) : null}

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle>Quick Start</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the Quick Start run for this matter. To run the same demo again, load the pack again to create a
              fresh matter.
            </p>
          </div>

          <QuickStartPanel folderId={folderId} readiness={quickStartReadiness} />
        </div>

        {latestRun ? (
          <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
            <div>
              latest run: <span className="font-mono">{latestRun.id}</span> ({latestRun.state})
            </div>
            <div>
              progress: {latestRun.questions_done}/{latestRun.questions_total} questions
            </div>
            {latestRun.questions_total > 0 ? (
              <ProgressBar value={Math.round((latestRun.questions_done / latestRun.questions_total) * 100)} className="mt-1" />
            ) : null}
            <div className="flex flex-wrap gap-3">
              <a
                className="underline hover:text-foreground"
                href={`/runs/${encodeURIComponent(latestRun.id)}`}
                target="_blank"
                rel="noreferrer"
              >
                Run JSON
              </a>
              <a
                className="underline hover:text-foreground"
                href={`/folders/${encodeURIComponent(folderId)}/report?${new URLSearchParams({
                  run_id: latestRun.id,
                }).toString()}`}
                target="_blank"
                rel="noreferrer"
              >
                Report JSON
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              created: {latestRun.created_at.toISOString()} • updated: {latestRun.updated_at.toISOString()}
            </div>
          </div>
        ) : (
          <EmptyState title="No runs yet" description="Start a Quick Start run to analyse this matter." />
        )}
      </Card>

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle>Report Triage</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Filter report rows by status and scan long outputs using a dense, sticky-header table.
            </p>
          </div>
          {reportRun ? (
            <div className="grid justify-items-end gap-1 text-xs text-muted-foreground">
              <div>
                run: <span className="font-mono">{reportRun.id}</span>
              </div>
              <div>
                showing {visibleReportRows.length} of {reportRowsWithCounts.length}
              </div>
            </div>
          ) : null}
        </div>

        {reportRun ? (
          <>
            <div className="mt-4 flex flex-wrap gap-2" role="tablist" aria-label="Report row status tabs">
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
                        ? "inline-flex items-center gap-2 rounded-full border border-primary bg-primary px-3 py-1.5 text-xs font-semibold text-primary-foreground"
                        : "inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground"
                    }
                  >
                    <span>{tab.label}</span>
                    <span
                      className={
                        isActive
                          ? "rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-2xs font-semibold"
                          : "rounded-full bg-muted px-1.5 py-0.5 text-2xs font-semibold text-muted-foreground"
                      }
                    >
                      {reportRowCounts[tab.id]}
                    </span>
                  </Link>
                );
              })}
            </div>

            {reportRowsWithCounts.length === 0 ? (
              <div className="mt-4">
                <EmptyState title="No report rows yet" description="Run Quick Start to generate report rows for triage." />
              </div>
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
          <div className="mt-4">
            <EmptyState title="No runs to review" description="Start Quick Start first, then triage report rows here." />
          </div>
        )}
      </Card>

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle>Exports</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Export a Word memo (.docx) and CSV artefacts for a selected completed run. Review links keep the same run
              scope.
            </p>
          </div>

          <ExportsPanel
            folderId={folderId}
            runOptions={runOptions}
            initialRunId={initialExportRunId}
            unsafeOverrideEnabled={unsafeOverrideEnabled}
          />
        </div>
      </Card>

      {artefactsListEnabled ? (
        <div className="mt-8">
          <ArtefactsList folderId={folderId} searchParams={rawSearchParams} />
        </div>
      ) : null}
    </Page>
  );
}
