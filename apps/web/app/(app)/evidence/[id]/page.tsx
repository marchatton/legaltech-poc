import { z } from "zod";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { headers } from "next/headers";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";

import { Page } from "../../../ui/Page";
import { CitationViewerClient } from "../../matters/viewer/CitationViewerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  // Keep ids intentionally constrained (same posture as /citations/:id).
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

const SearchSchema = z.object({
  // Optional escape hatch for seeded fixture data (ids can be ambiguous across packs).
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
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
  // Avoid trusting arbitrary hostnames (SSRF). Keep internal fetches pinned to
  // loopback, but allow dynamic ports in dev.
  const host = h.get("host") ?? "";
  const m = host.match(/:(\d{1,5})$/);
  const portFromHost = m?.[1] ? Number(m[1]) : null;
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;
  const port =
    (portFromHost && Number.isInteger(portFromHost) && portFromHost >= 1 && portFromHost <= 65535 ? portFromHost : null) ??
    (envPort && Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535 ? envPort : null) ??
    3000;
  return `http://127.0.0.1:${port}`;
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

function mattersHref(packId: string | null): string {
  if (!packId) return "/matters";
  return `/matters?${new URLSearchParams({ pack: packId }).toString()}`;
}

export default async function EvidenceViewerPage(props: {
  params: Promise<Record<string, string | string[] | undefined>>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOrDemoProd();

  const rawParams = await props.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid route params.</p>
      </Page>
    );
  }

  const rawSearchParams = (await props.searchParams) ?? {};
  const parsedSearchParams = SearchSchema.safeParse(rawSearchParams);
  if (!parsedSearchParams.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid query params.</p>
      </Page>
    );
  }

  const citationId = parsedParams.data.id;
  const packId = parsedSearchParams.data.pack ?? null;

  const origin = await originFromRequestHeaders();
  const h = await headers();
  const auth = h.get("authorization");

  const citationQuery = packId ? `?${new URLSearchParams({ pack: packId }).toString()}` : "";
  const citationHref = mattersHref(packId);

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}${citationQuery}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      if (res.status === 404) {
        return (
          <Page width="sm">
            <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
            <p className="mt-2 text-sm text-muted-foreground">
              Citation not found: <span className="font-mono">{citationId}</span>
            </p>
            <div className="mt-4">
              <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
                Back to matters
              </a>
            </div>
          </Page>
        );
      }

      const e = safeErrFromJson(citationJson, {
        code: "CITATION_FETCH_FAILED",
        message: `Request failed (${res.status}).`,
      });
      return (
        <Page width="sm">
          <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
              Back to matters
            </a>
          </div>
        </Page>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load citation: <span className="font-mono">{citationId}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid citation payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const cit = parsedCitation.data.citation;
  const computed = hashSnippet(cit.snippet);
  const errorCode = computed !== cit.snippet_hash ? "SNIPPET_HASH_MISMATCH" : null;

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(cit.document_id)}/render?page=${cit.page_number}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <Page width="sm">
          <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to fetch render_url for <span className="font-mono">{cit.document_id}</span> (page {cit.page_number}).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
              Back to matters
            </a>
          </div>
        </Page>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to fetch render_url for <span className="font-mono">{cit.document_id}</span> (page {cit.page_number}).
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Evidence</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid render_url payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const pdfUrl = parsedRender.data.render_url;

  return (
    <Page width="lg">
      <div className="flex flex-wrap items-center gap-3">
        <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={citationHref}>
          Back to matters
        </a>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">citation:</span> <span className="font-mono">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentId={cit.document_id}
          pageNumber={cit.page_number}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
        />
      </div>
    </Page>
  );
}

