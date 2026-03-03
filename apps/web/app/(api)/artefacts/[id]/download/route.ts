import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import {
  createObjectReadStream,
  objectExists,
  statObject,
  validateArtefactStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact id"),
});

function contentTypeForArtefact(type: string): string {
  if (type === "csv") return "text/csv; charset=utf-8";
  if (type === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

function safeDownloadFilename(args: { id: string; type: string; filename: unknown }): string {
  const ext = args.type === "csv" ? ".csv" : args.type === "docx" ? ".docx" : "";
  const fallback = `${args.id}${ext}`;

  if (typeof args.filename !== "string") return fallback;
  const s = args.filename.trim();
  if (!s) return fallback;
  if (s.length > 200) return fallback;
  if (!/^[A-Za-z0-9 _.-]+$/.test(s)) return fallback;
  if (ext && !s.toLowerCase().endsWith(ext)) return fallback;
  return s;
}

type ArtefactRow = {
  id: string;
  type: string;
  filename: string;
  storage_key: string;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

  const devGate = assertDevOrDemoProdApi(traceId, headers);
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
  const expiresRaw = url.searchParams.get("expires");
  const sigRaw = url.searchParams.get("sig");
  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid download expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Download URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  await ensureSchema();

  const artefactId = parsedParams.data.id;
  const rows = await sql<ArtefactRow[]>`
    SELECT id, type, filename, storage_key
    FROM artefacts
    WHERE id = ${artefactId}
    LIMIT 1
  `;
  const artefact = rows[0];
  if (!artefact) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const keyOk = validateArtefactStorageKey(artefact.storage_key);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "CONFLICT", message: "Artefact has an invalid storage_key.", traceId }),
      { status: 409, headers },
    );
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: artefact.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(artefact.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(artefact.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", contentTypeForArtefact(artefact.type));
  outHeaders.set("Content-Disposition", `attachment; filename="${safeDownloadFilename(artefact)}"`);
  outHeaders.set("Content-Length", String(stat.size));

  const nodeStream = createObjectReadStream(artefact.storage_key);
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers: outHeaders });
}
