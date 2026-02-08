import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import {
  objectExists,
  readObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const QuerySchema = z.object({
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  artefact_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact_id"),
});

function safeFilename(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  if (s.length > 200) return null;
  if (!/^[A-Za-z0-9_.-]+\.csv$/.test(s)) return null;
  return s;
}

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsed.data.folder_id;
  const artefactId = parsed.data.artefact_id;

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

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid storage key.", traceId }), {
      status: 400,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(storageKey)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const metaKey = `folders/${folderId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metaKey);

  let filename: string = `${artefactId}.csv`;
  if (metaOk.ok && objectExists(metaKey)) {
    try {
      const metaBytes = await readObject(metaKey);
      const meta = JSON.parse(Buffer.from(metaBytes).toString("utf8")) as unknown;
      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        filename = safeFilename((meta as { filename?: unknown }).filename) ?? filename;
      }
    } catch {
      // ignore metadata parse failures; downloads should still work.
    }
  }

  const bytes = await readObject(storageKey);
  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", "text/csv; charset=utf-8");
  outHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: outHeaders,
  });
}
