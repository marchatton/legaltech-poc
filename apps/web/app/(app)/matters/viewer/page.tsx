import { z } from "zod";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { assertDevOnly } from "../../../../lib/devOnly";
import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

import { CitationViewerClient } from "./CitationViewerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  citation: z.string().min(1),
  document_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid document id")
    .optional(),
  page: z.coerce.number().int().positive().optional(),
});

export default async function MatterViewerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  if (!parsed.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">Invalid query params.</p>
      </main>
    );
  }

  const packId = parsed.data.pack;
  const citationId = parsed.data.citation;
  const requestedDocId = parsed.data.document_id ?? null;
  const requestedPage = parsed.data.page ?? null;

  const snapshot = loadSeedSnapshot(packId);
  const cit = snapshot?.citations?.[citationId] ?? null;

  if (!snapshot) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">
          No seeded snapshot for <span className="font-mono">{packId}</span>. Run{" "}
          <code className="font-mono">pnpm fixture:seed {packId}</code>.
        </p>
      </main>
    );
  }

  if (!cit) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">
          Citation not found: <span className="font-mono">{citationId}</span>
        </p>
        <div className="mt-4">
          <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const computed = hashSnippet(cit.snippet);
  const resolvedDocId = requestedDocId ?? cit.document_filename;
  const resolvedPage = requestedPage ?? cit.page_number;
  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_filename) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  const pdfUrl = `/spikes/local-pdf?${new URLSearchParams({
    pack: packId,
    filename: resolvedDocId,
  }).toString()}`;

  return (
    <main className="mx-auto max-w-6xl p-6">
      <div className="flex flex-wrap items-center gap-3">
        <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
          Back to matters
        </a>
        <div className="text-sm text-slate-700">
          <span className="font-medium text-slate-900">citation:</span> <span className="font-mono">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentFilename={resolvedDocId}
          pageNumber={resolvedPage}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
        />
      </div>
    </main>
  );
}
