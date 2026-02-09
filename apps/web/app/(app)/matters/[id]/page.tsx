import { z } from "zod";

import Link from "next/link";

import { assertDevOnly } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

import { ArtefactsList } from "../ArtefactsList";
import { ExportCsvButton } from "../ExportCsvButton";

import { ExportMemoButton } from "./ExportMemoButton";
import { QuickStartPanel } from "./QuickStartPanel";

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

export default async function MatterPage(props: { params: Promise<Record<string, string | string[] | undefined>> }) {
  assertDevOnly();

  const rawParams = await props.params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-destructive">Invalid route params.</p>
      </main>
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
      <main className="mx-auto max-w-5xl p-6">
        <h1 className="text-2xl font-semibold">Matter</h1>
        <p className="mt-2 text-sm text-muted-foreground">Matter not found.</p>
      </main>
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
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Matter</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-xs text-muted-foreground">
              {folder.id}
            </span>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground">{folder.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
              {folder.state}
            </span>
          </div>
        </div>

        <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href="/matters">
          Back to matters
        </Link>
      </div>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm font-semibold text-foreground">Seeded documents</div>
        <p className="mt-1 text-xs text-muted-foreground">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <div className="mt-4 text-sm text-muted-foreground">No documents.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded-ui-sm bg-foreground px-2 py-0.5 font-mono text-xs text-background">
                        {d.id}
                      </div>
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
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                      {JSON.stringify(d.error_json, null, 2)}
                    </pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>

      <section className="mt-6 rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-foreground">Quick Start</div>
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
          <div className="mt-4 text-xs text-muted-foreground">No Quick Start runs yet.</div>
        )}
      </section>

      <section className="mt-6 rounded border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold text-slate-900">Exports</div>
            <p className="mt-1 text-xs text-slate-600">
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
      </section>

      {artefactsListEnabled ? (
        <div className="mt-6">
          <ArtefactsList folderId={folderId} />
        </div>
      ) : null}
    </main>
  );
}
