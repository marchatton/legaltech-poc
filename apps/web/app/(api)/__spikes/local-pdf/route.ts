import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { LocalPdfQuerySchema, safeErrorEnvelope } from "@orbital-poc/core";

export const runtime = "nodejs";

function parseRangeHeader(rangeHeader: string, size: number): { start: number; end: number } | null {
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const [startStr, endStr] = range.split("-");
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = Number(endStr);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    start = Number(startStr);
    end = hasEnd ? Number(endStr) : size - 1;

    if (!Number.isFinite(start) || start < 0) return null;
    if (!Number.isFinite(end) || end < 0) return null;
    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

export async function GET(req: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });

  const url = new URL(req.url);
  const parsed = LocalPdfQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
  const candidate = path.resolve(packRoot, parsed.data.pack, "docs", parsed.data.filename);
  if (!candidate.startsWith(packRoot + path.sep)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path." }),
      { status: 400 },
    );
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(candidate);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found." }), { status: 404 });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found." }), { status: 404 });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseRangeHeader(rangeHeader, size) : null;

  const headers = new Headers();
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${parsed.data.filename}"`);
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

