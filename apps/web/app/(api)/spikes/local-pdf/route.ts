import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { LocalPdfQuerySchema, safeErrorEnvelope } from "@orbital-poc/core";

import { parseSingleRangeHeader } from "../../../../lib/httpRange.server";
import { safePdfFilename } from "../../../../lib/safePdfFilename.server";
import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers: traceHeaders } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, traceHeaders);
  if (spikesGate) return spikesGate;

  const url = new URL(req.url);
  const parsed = LocalPdfQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers: traceHeaders },
    );
  }

  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
  const candidate = path.resolve(packRoot, parsed.data.pack, "docs", parsed.data.filename);
  if (!candidate.startsWith(packRoot + path.sep)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }),
      { status: 400, headers: traceHeaders },
    );
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(candidate);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  const headers = new Headers(traceHeaders);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(parsed.data.filename)}"`);
  headers.set("Cache-Control", "no-store");

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
