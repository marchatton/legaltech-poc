import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import {
  buildDocumentUploadCapabilities,
  deriveDocumentReadinessStatus,
  DOCUMENT_UPLOAD_ACCEPTED_MIME,
  DOCUMENT_UPLOAD_MAX_BYTES,
  type DocumentOcrStatus,
  type DocumentParseStatus,
} from "../../../../../lib/documentSetup";
import { newId } from "../../../../../lib/ids";
import { createSignedGetHeaders, createSignedPutHeaders, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const InitUploadSchema = z.object({
  filename: z.string().trim().min(1),
  mime: z.enum(DOCUMENT_UPLOAD_ACCEPTED_MIME),
  bytes: z.number().int().positive().max(DOCUMENT_UPLOAD_MAX_BYTES),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documents = await sql<
    Array<{
      id: string;
      folder_id: string;
      filename: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      parse_status: DocumentParseStatus;
      ocr_status: DocumentOcrStatus;
      extraction_quality: number | null;
      page_count: number | null;
      error_json: unknown | null;
      created_at: Date;
    }>
  >`
    SELECT id, folder_id, filename, storage_key, upload_completed_at, parse_status, ocr_status, extraction_quality, page_count, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  const readinessTotals = {
    queued: 0,
    ingesting: 0,
    "indexed-ready": 0,
    failed: 0,
  } satisfies Record<string, number>;

  const readinessDocuments = documents.map((d) => {
    const status = deriveDocumentReadinessStatus({
      uploadCompletedAt: d.upload_completed_at,
      parseStatus: d.parse_status,
      ocrStatus: d.ocr_status,
    });
    readinessTotals[status] += 1;

    const openPdfUrl = (() => {
      if (!d.storage_key || !d.upload_completed_at) return null;
      const keyValid = validateStorageKey(d.storage_key);
      if (!keyValid.ok) return null;

      const signed = createSignedGetHeaders({ storageKey: d.storage_key });
      return `/documents/${encodeURIComponent(d.id)}/pdf?${new URLSearchParams({
        expires: String(signed.expires_at_ms),
        sig: signed.signature,
      }).toString()}`;
    })();

    return {
      id: d.id,
      folder_id: d.folder_id,
      filename: d.filename,
      upload_completed_at: d.upload_completed_at ? d.upload_completed_at.toISOString() : null,
      parse_status: d.parse_status,
      ocr_status: d.ocr_status,
      status,
      extraction_quality: d.extraction_quality,
      page_count: d.page_count,
      error_json: d.error_json,
      created_at: d.created_at.toISOString(),
      open_pdf_url: openPdfUrl,
    };
  });

  return Response.json(
    {
      documents: readinessDocuments,
      readiness: {
        total: readinessDocuments.length,
        queued: readinessTotals.queued,
        ingesting: readinessTotals.ingesting,
        indexed_ready: readinessTotals["indexed-ready"],
        failed: readinessTotals.failed,
      },
      capabilities: buildDocumentUploadCapabilities(),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = InitUploadSchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documentId = newId("doc");
  const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
  const validKey = validateStorageKey(storageKey);
  if (!validKey.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to create storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await sql`
    INSERT INTO documents (
      id,
      folder_id,
      filename,
      mime,
      bytes,
      storage_key,
      parse_status,
      ocr_status,
      created_at,
      updated_at
    )
    VALUES (
      ${documentId},
      ${folderId},
      ${parsedBody.data.filename},
      ${parsedBody.data.mime},
      ${parsedBody.data.bytes},
      ${storageKey},
      'queued',
      'queued',
      now(),
      now()
    )
  `;

  const signed = createSignedPutHeaders({ storageKey });

  return Response.json(
    {
      document: {
        id: documentId,
        folder_id: folderId,
        filename: parsedBody.data.filename,
        upload_completed_at: null,
        parse_status: "queued",
        ocr_status: "queued",
        status: deriveDocumentReadinessStatus({
          uploadCompletedAt: null,
          parseStatus: "queued",
          ocrStatus: "queued",
        }),
      },
      upload: {
        storage_key: storageKey,
        url: `/documents/${documentId}/upload`,
        method: "PUT",
        headers: {
          "Content-Type": parsedBody.data.mime,
          "X-Orbital-Upload-Expires": String(signed.expires_at_ms),
          "X-Orbital-Upload-Signature": signed.signature,
        },
      },
      capabilities: buildDocumentUploadCapabilities(),
    },
    { status: 200, headers },
  );
}
