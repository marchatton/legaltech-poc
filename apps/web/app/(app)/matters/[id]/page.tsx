import { z } from "zod";

import Link from "next/link";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { parseSafeErrorLike } from "../../../../lib/safeErrorDisplay";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

import { Card } from "../../../ui/Card";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { EmptyState } from "../../../ui/EmptyState";
import { MonoId } from "../../../ui/MonoId";
import { Page, PageHeader, SectionTitle } from "../../../ui/Page";
import { ProgressBar } from "../../../ui/ProgressBar";
import { ArtefactsList } from "../ArtefactsList";
import { ExportCsvButton } from "../ExportCsvButton";

import { ExportMemoButton } from "./ExportMemoButton";
import { QuickStartPanel } from "./QuickStartPanel";
import { ChatPanel } from "./ChatPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

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
  parse_status: string;
  ocr_status: string;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
};

type RunSummaryRow = {
  id: string;
  state: string;
  questions_total: number;
  questions_done: number;
  created_at: Date;
  updated_at: Date;
};

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

function documentErrorPayload(errorJson: unknown): { code: string; message: string; traceId?: string } {
  const parsed = parseSafeErrorLike(errorJson);
  if (parsed) {
    return {
      code: parsed.code,
      message: parsed.message,
      traceId: parsed.traceId,
    };
  }
  return {
    code: "DOCUMENT_ERROR",
    message: "Document processing failed.",
  };
}

export default async function MatterPage(props: { params: Promise<Record<string, string | string[] | undefined>> }) {
  assertDevOrDemoProd();

  const rawParams = await props.params;
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
    SELECT id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, questions_total, questions_done, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const latestRun = runs[0] ?? null;

  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";
  const completedRunId = latestRun?.state === "completed" ? latestRun.id : null;
  const chatEnabled = process.env.CHAT_ENABLED === "1";

  const runnable = folder.state === "indexed" || folder.state === "ready";
  let quickStartDisabledReason: string | null = null;
  if (latestRun) {
    quickStartDisabledReason =
      "Quick Start already started for this matter. Load the pack again to create a fresh matter (no cleanup).";
  } else if (!runnable) {
    quickStartDisabledReason = `Quick Start is disabled until the matter is indexed/ready (current state: ${folder.state}). Refresh in a moment.`;
  }

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
        <SectionTitle>Seeded documents</SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <EmptyState title="No documents" description="Documents will appear here once the demo pack finishes ingesting." />
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <MonoId variant="inverted">{d.id}</MonoId>
                      <div className="text-sm font-medium text-foreground">{d.filename}</div>
                      <div className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                        {ingest}
                      </div>
                      {typeof d.extraction_quality === "number" ? (
                        <div className="text-xs text-muted-foreground">
                          quality: {Math.round(d.extraction_quality * 100)}%
                        </div>
                      ) : null}
                      {typeof d.page_count === "number" ? (
                        <div className="text-xs text-muted-foreground">pages: {d.page_count}</div>
                      ) : null}
                    </div>

                    {url ? (
                      <a
                        className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <div className="text-xs text-muted-foreground">PDF not ready</div>
                    )}
                  </div>

                  {d.error_json ? (
                    <ErrorBanner
                      {...documentErrorPayload(d.error_json)}
                      title="Document processing failed"
                      className="mt-2"
                    />
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
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

          <QuickStartPanel folderId={folderId} disabledReason={quickStartDisabledReason} />
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
            <SectionTitle>Exports</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Export a Word memo (.docx) and CSV artefacts for the latest completed run. Exports are disabled until a run
              completes.
            </p>
          </div>

          <div className="grid justify-items-end gap-2">
            <ExportMemoButton
              folderId={folderId}
              runId={latestRun?.id ?? null}
              runState={latestRun?.state ?? null}
              unsafeOverrideEnabled={unsafeOverrideEnabled}
            />
            <div className="flex flex-wrap items-start justify-end gap-2">
              <ExportCsvButton
                folderId={folderId}
                runId={completedRunId}
                kind="requirements_tracker"
                label="Export requirements"
              />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="exceptions_table" label="Export exceptions" />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="survey_issues" label="Export survey issues" />
            </div>
          </div>
        </div>
      </Card>

      {artefactsListEnabled ? (
        <div className="mt-8">
          <ArtefactsList folderId={folderId} />
        </div>
      ) : null}
    </Page>
  );
}
