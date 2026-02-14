import { z } from "zod";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";
import { fixtureDocumentId, parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";
import Link from "next/link";

import { headers } from "next/headers";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

import { Page, PageHeader, SectionLabel } from "../../../ui/Page";
import { StatePage } from "../../../ui/StatePage";
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
    document_filename: z.string().trim().min(1).nullable().optional(),
    page_number: z.number().int().positive(),
    polygons: z
      .array(z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).min(3))
      .min(1),
    snippet: z.string(),
    snippet_hash: z.string().min(1),
    doc_version: z.string().trim().min(1).nullable().optional(),
    verified_at: z.string().trim().min(1).nullable().optional(),
    loaded_state: z.string().trim().min(1).nullable().optional(),
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

function mattersPackHref(packId: string): string {
  return `/matters?pack=${packId}`;
}

function nonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function fallbackDocumentLabelFromId(documentId: string): string | null {
  const parsed = parseFixtureDocumentId(documentId);
  return parsed.ok ? parsed.filename : null;
}

export default async function MatterViewerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOrDemoProd();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  if (!parsed.success) {
    return <StatePage title="Viewer" message="Invalid query params." />;
  }

  const packId = parsed.data.pack;
  const citationId = parsed.data.citation;
  const requestedDocId = parsed.data.document_id ?? null;
  const requestedPage = parsed.data.page ?? null;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return (
      <StatePage
        title="Viewer"
        message={
          <>
            No seeded snapshot for <span className="font-mono">{packId}</span>.
          </>
        }
        detail={
          <>
            Run <code className="font-mono">pnpm fixture:seed {packId}</code>.
          </>
        }
        backHref={mattersPackHref(packId)}
        backLabel="Back to matters"
      />
    );
  }

  const origin = await originFromRequestHeaders();
  const h = await headers();
  const auth = h.get("authorization");

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}?${new URLSearchParams({ pack: packId }).toString()}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(citationJson, { code: "CITATION_FETCH_FAILED", message: `Request failed (${res.status}).` });
      return (
        <StatePage
          title="Viewer"
          message={
            <>
              Failed to load citation: <span className="font-mono">{citationId}</span>
            </>
          }
          detail={`${e.code}: ${e.message}`}
          backHref={mattersPackHref(packId)}
          backLabel="Back to matters"
        />
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <StatePage
        title="Viewer"
        message={
          <>
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </>
        }
        detail={message}
        backHref={mattersPackHref(packId)}
        backLabel="Back to matters"
      />
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return <StatePage title="Viewer" message="Invalid citation payload." backHref={mattersPackHref(packId)} backLabel="Back to matters" />;
  }

  const cit = parsedCitation.data.citation;

  if (!cit) {
    return (
      <StatePage
        title="Viewer"
        message={
          <>
            Citation not found: <span className="font-mono">{citationId}</span>
          </>
        }
        backHref={mattersPackHref(packId)}
        backLabel="Back to matters"
      />
    );
  }

  const computed = hashSnippet(cit.snippet);
  let resolvedDocId = requestedDocId ?? cit.document_id;
  if (requestedDocId && /\.pdf$/i.test(requestedDocId) && !requestedDocId.startsWith("fx_")) {
    try {
      resolvedDocId = fixtureDocumentId({ packId, filename: requestedDocId });
    } catch {
      // Preserve the original string if it doesn't match the fixture id contract.
    }
  }
  const resolvedPage = requestedPage ?? cit.page_number;
  const filenameByDocumentId = new Map<string, string>();
  for (const seedCitation of Object.values(snapshot.citations)) {
    filenameByDocumentId.set(seedCitation.document_id, seedCitation.document_filename);
  }
  const documentLabel =
    (requestedDocId && /\.pdf$/i.test(requestedDocId) ? requestedDocId : null) ??
    filenameByDocumentId.get(resolvedDocId) ??
    nonEmptyString(cit.document_filename) ??
    fallbackDocumentLabelFromId(resolvedDocId) ??
    resolvedDocId;

  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_id) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(resolvedDocId)}/render?page=${resolvedPage}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <StatePage
          title="Viewer"
          message={
            <>
              Failed to load the PDF preview for <span className="font-mono">{documentLabel}</span> (page {resolvedPage}).
            </>
          }
          detail={`${e.code}: ${e.message}`}
          backHref={mattersPackHref(packId)}
          backLabel="Back to matters"
        />
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <StatePage
        title="Viewer"
        message={
          <>
            Failed to load the PDF preview for <span className="font-mono">{documentLabel}</span> (page {resolvedPage}).
          </>
        }
        detail={message}
        backHref={mattersPackHref(packId)}
        backLabel="Back to matters"
      />
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return <StatePage title="Viewer" message="Invalid PDF preview payload." backHref={mattersPackHref(packId)} backLabel="Back to matters" />;
  }

  const pdfUrl = parsedRender.data.render_url;

  return (
    <Page width="lg">
      <PageHeader
        title="Matter Viewer"
        subtitle="Seeded-pack citation viewer for parity and diagnostics."
        right={
          <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href={mattersPackHref(packId)}>
            Back to matters
          </Link>
        }
      />

      <div className="mt-6 rounded-ui-lg border border-border bg-card px-4 py-3 shadow-ui-sm">
        <SectionLabel>Context</SectionLabel>
        <div className="mt-2 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">citation:</span>{" "}
          <span className="rounded-ui-sm bg-muted px-2 py-1 font-mono text-xs text-foreground">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentId={resolvedDocId}
          documentLabel={documentLabel}
          pageNumber={resolvedPage}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
          docVersion={cit.doc_version ?? null}
          verifiedAt={cit.verified_at ?? null}
          loadedState={cit.loaded_state ?? null}
        />
      </div>
    </Page>
  );
}
