import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { putObject, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function PUT(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  await ensureSchema();

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

  const expiresHeader = req.headers.get("x-orbital-upload-expires");
  const sigHeader = req.headers.get("x-orbital-upload-signature");
  if (!expiresHeader || !sigHeader) {
    return Response.json(
      safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing upload signature headers.", traceId }),
      { status: 403, headers },
    );
  }

  const expiresAtMs = Number(expiresHeader);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid upload expires header.", traceId }),
      { status: 400, headers },
    );
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Upload URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<{ id: string; folder_id: string; storage_key: string | null }[]>`
    SELECT id, folder_id, storage_key
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

  const sigOk = verifySignature({ storageKey: doc.storage_key, expiresAtMs, sig: sigHeader });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid upload signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await req.arrayBuffer());
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid request body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const result = await putObject({ storageKey: doc.storage_key, bytes });

  await sql`
    UPDATE documents
    SET upload_completed_at = COALESCE(upload_completed_at, now()),
        sha256 = ${result.sha256},
        updated_at = now()
    WHERE id = ${doc.id}
  `;

  await refreshFolderState(doc.folder_id);

  return new Response(null, { status: 200, headers });
}
