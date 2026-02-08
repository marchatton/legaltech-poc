import { z } from "zod";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { headers } from "next/headers";

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

const CitationResponseSchema = z.object({
  citation: z.object({
    id: z.string().min(1),
    document_id: z.string().min(1),
    page_number: z.number().int().positive(),
    polygons: z
      .array(z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).min(3))
      .min(1),
    snippet: z.string(),
    snippet_hash: z.string().min(1),
  }),
});

const RenderResponseSchema = z.object({
  document_id: z.string().min(1),
  page: z.number().int().positive(),
  render_url: z.string().min(1),
});

async function originFromRequestHeaders(): Promise<string> {
  const h = await headers();
  const host = h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "http";
  if (host) return `${proto}://${host}`;
  // Best-effort fallback for local dev.
  return "http://localhost:3000";
}

type SafeErr = { code: string; message: string };

function safeErrFromJson(json: unknown, fallback: SafeErr): SafeErr {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const env = (json as { error?: unknown }).error;
  if (!env || typeof env !== "object" || Array.isArray(env)) return fallback;
  const code = (env as { code?: unknown }).code;
  const message = (env as { message?: unknown }).message;
  return {
    code: typeof code === "string" && code.trim() ? code.trim() : fallback.code,
    message: typeof message === "string" && message.trim() ? message.trim() : fallback.message,
  };
}

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

  const origin = await originFromRequestHeaders();

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}?${new URLSearchParams({ pack: packId }).toString()}`, {
      cache: "no-store",
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(citationJson, { code: "CITATION_FETCH_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-slate-700">
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">
          Failed to load citation: <span className="font-mono">{citationId}</span>
        </p>
        <p className="mt-2 text-xs text-slate-600">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">Invalid citation payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const cit = parsedCitation.data.citation;

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
  const resolvedDocId = requestedDocId ?? cit.document_id;
  const resolvedPage = requestedPage ?? cit.page_number;
  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_id) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(resolvedDocId)}/render?page=${resolvedPage}`, {
      cache: "no-store",
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <main className="mx-auto max-w-3xl p-6">
          <h1 className="text-xl font-semibold">Viewer</h1>
          <p className="mt-2 text-sm text-slate-700">
            Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
          </p>
          <p className="mt-2 text-xs text-slate-600">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </main>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">
          Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
        </p>
        <p className="mt-2 text-xs text-slate-600">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return (
      <main className="mx-auto max-w-3xl p-6">
        <h1 className="text-xl font-semibold">Viewer</h1>
        <p className="mt-2 text-sm text-slate-700">Invalid render_url payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-slate-900 underline" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </main>
    );
  }

  const pdfUrl = parsedRender.data.render_url;

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
          documentId={resolvedDocId}
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
