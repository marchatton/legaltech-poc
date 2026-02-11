import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { DOCUMENT_UPLOAD_MAX_BYTES } from "../../../../../lib/documentSetup";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { putObjectWriteOnce, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

function parseExpectedBytes(val: unknown): number | null {
  if (typeof val === "number" && Number.isSafeInteger(val) && val > 0) return val;
  if (typeof val === "bigint") {
    if (val <= 0n) return null;
    if (val > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(val);
  }
  if (typeof val === "string" && /^[0-9]+$/.test(val)) {
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n <= 0) return null;
    return n;
  }
  return null;
}

function hasPdfMagic(bytes: Uint8Array): boolean {
  // "%PDF-" (25 50 44 46 2d)
  return (
    bytes.byteLength >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function PUT(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
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
  const docs = await sql<
    Array<{
      id: string;
      folder_id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      mime: string;
      bytes: unknown;
    }>
  >`
    SELECT id, folder_id, storage_key, upload_completed_at, mime, bytes
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

  if (doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.mime !== "application/pdf") {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document mime is not application/pdf.", traceId }), {
      status: 409,
      headers,
    });
  }

  const expectedBytes = parseExpectedBytes(doc.bytes);
  if (expectedBytes === null) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Document bytes is invalid.", traceId }), {
      status: 500,
      headers,
    });
  }

  if (expectedBytes > DOCUMENT_UPLOAD_MAX_BYTES) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload too large.",
        details: { bytes: expectedBytes, max_bytes: DOCUMENT_UPLOAD_MAX_BYTES },
        traceId,
      }),
      { status: 413, headers },
    );
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "put", storageKey: doc.storage_key, expiresAtMs, sig: sigHeader });
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

  if (bytes.byteLength > DOCUMENT_UPLOAD_MAX_BYTES) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload too large.", traceId }),
      { status: 413, headers },
    );
  }

  if (bytes.byteLength !== expectedBytes) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload size did not match document bytes.",
        details: { expected_bytes: expectedBytes, actual_bytes: bytes.byteLength },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!hasPdfMagic(bytes)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload must be a PDF.", traceId }),
      { status: 400, headers },
    );
  }

  let result: { bytesWritten: number; sha256: string };
  try {
    result = await putObjectWriteOnce({ storageKey: doc.storage_key, bytes });
  } catch (err) {
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (code === "EEXIST") {
      return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
        status: 409,
        headers,
      });
    }
    throw err;
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE documents
    SET upload_completed_at = now(),
        sha256 = ${result.sha256},
        updated_at = now()
    WHERE id = ${doc.id}
      AND upload_completed_at IS NULL
    RETURNING id
  `;
  if (!updated[0]) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  await refreshFolderState(doc.folder_id);

  return new Response(null, { status: 200, headers });
}
