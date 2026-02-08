import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders, objectExists, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive(),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const page = parsedQuery.data.page;

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    // Verify the fixture PDF exists so we can fail closed on drift.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }
    try {
      const stat = fs.statSync(candidate);
      if (!stat.isFile()) throw new Error("NOT_A_FILE");
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const origin = new URL(req.url).origin;
    const signed = createSignedGetHeaders({ storageKey: `fixture:${documentId}` });
    const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
      expires: String(signed.expires_at_ms),
      sig: signed.signature,
    }).toString()}`;

    return Response.json(
      {
        document_id: documentId,
        page,
        render_url: renderUrl,
      },
      { status: 200, headers },
    );
  }

  await ensureSchema();

  const docs = await sql<
    Array<{ id: string; storage_key: string | null; upload_completed_at: Date | null; page_count: number | null }>
  >`
    SELECT id, storage_key, upload_completed_at, page_count
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!objectExists(doc.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Raw PDF not found for storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const pageCount = typeof doc.page_count === "number" && Number.isFinite(doc.page_count) ? doc.page_count : null;
  if (pageCount && page > pageCount) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "page is out of range.",
        details: { page: "out_of_range", page_count: pageCount },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      document_id: documentId,
      page,
      render_url: renderUrl,
    },
    { status: 200, headers },
  );
}
