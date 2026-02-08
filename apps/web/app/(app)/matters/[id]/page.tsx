import { z } from "zod";

import Link from "next/link";

import { assertDevOnly } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

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
        <p className="mt-2 text-sm text-red-700">Invalid route params.</p>
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
        <p className="mt-2 text-sm text-slate-700">Matter not found.</p>
      </main>
    );
  }

  const docs = await sql<DocRow[]>`
    SELECT id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">Matter</h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-700">
            <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs text-slate-800">{folder.id}</span>
            <span className="text-slate-400">•</span>
            <span className="font-medium text-slate-900">{folder.name}</span>
            <span className="text-slate-400">•</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
              {folder.state}
            </span>
          </div>
        </div>

        <Link className="text-xs font-medium text-slate-700 underline" href="/matters">
          Back to matters
        </Link>
      </div>

      <section className="mt-6 rounded border border-slate-200 bg-white p-4">
        <div className="text-sm font-semibold text-slate-900">Seeded documents</div>
        <p className="mt-1 text-xs text-slate-600">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <div className="mt-4 text-sm text-slate-700">No documents.</div>
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded border border-slate-200 bg-slate-50 p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="rounded bg-slate-900 px-2 py-0.5 font-mono text-xs text-white">{d.id}</div>
                      <div className="text-sm font-medium text-slate-900">{d.filename}</div>
                      <div className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-800">
                        {ingest}
                      </div>
                      {typeof d.extraction_quality === "number" ? (
                        <div className="text-xs text-slate-600">
                          quality: {Math.round(d.extraction_quality * 100)}%
                        </div>
                      ) : null}
                      {typeof d.page_count === "number" ? (
                        <div className="text-xs text-slate-600">pages: {d.page_count}</div>
                      ) : null}
                    </div>

                    {url ? (
                      <a className="text-xs font-medium text-slate-700 underline" href={url} target="_blank" rel="noreferrer">
                        Open PDF
                      </a>
                    ) : (
                      <div className="text-xs text-slate-500">PDF not ready</div>
                    )}
                  </div>

                  {d.error_json ? (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-red-700">
                      {JSON.stringify(d.error_json, null, 2)}
                    </pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
