import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { parseFixtureDocumentId } from "@orbital-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { parseSingleRangeHeader } from "../../../../../lib/httpRange.server";
import { createObjectReadStream, statObject, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

function safePdfFilename(val: unknown): string {
  if (typeof val !== "string") return "document.pdf";
  const s = val.trim();
  if (!s) return "document.pdf";
  if (s.length > 200) return "document.pdf";
  if (!/^[A-Za-z0-9_.-]+\.pdf$/i.test(s)) return "document.pdf";
  return s;
}

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

  const documentId = parsedParams.data.id;

  const url = new URL(req.url);
  const expiresRaw =
    url.searchParams.get("expires") ??
    url.searchParams.get("x_orbital_render_expires") ??
    req.headers.get("x-orbital-render-expires");
  const sigRaw =
    url.searchParams.get("sig") ??
    url.searchParams.get("x_orbital_render_signature") ??
    req.headers.get("x-orbital-render-signature");

  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid render expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Render URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    // Fixture documents are only available in dev.
    if (process.env.NODE_ENV !== "development") {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const sigOk = verifySignature({ storageKey: `fixture:${documentId}`, expiresAtMs, sig: sigRaw });
    if (!sigOk) {
      return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
        status: 403,
        headers,
      });
    }

    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(candidate);
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }
    if (!stat.isFile()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const size = stat.size;
    const rangeHeader = req.headers.get("range");
    const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${safePdfFilename(fixture.filename)}"`);

    if (!rangeHeader) {
      headers.set("Content-Length", String(size));
      const nodeStream = fs.createReadStream(candidate);
      return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
    }

    if (!range) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = range;
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    const nodeStream = fs.createReadStream(candidate, { start, end });
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
  }

  await ensureSchema();

  const docs = await sql<Array<{ id: string; storage_key: string | null; filename: string }>>`
    SELECT id, storage_key, filename
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

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ storageKey: doc.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(doc.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(doc.filename)}"`);

  if (!rangeHeader) {
    headers.set("Content-Length", String(size));
    const nodeStream = createObjectReadStream(doc.storage_key);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
  }

  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));

  const nodeStream = createObjectReadStream(doc.storage_key, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
}
