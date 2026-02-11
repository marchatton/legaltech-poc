import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { newId } from "../../../../../lib/ids";
import { createSignedPutHeaders, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const InitUploadSchema = z.object({
  filename: z.string().trim().min(1),
  mime: z.literal("application/pdf"),
  bytes: z.number().int().positive(),
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
      parse_status: string;
      ocr_status: string;
      extraction_quality: number | null;
      page_count: number | null;
      error_json: unknown | null;
      created_at: Date;
    }>
  >`
    SELECT id, folder_id, filename, parse_status, ocr_status, extraction_quality, page_count, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      documents: documents.map((d) => ({
        id: d.id,
        folder_id: d.folder_id,
        filename: d.filename,
        parse_status: d.parse_status,
        ocr_status: d.ocr_status,
        extraction_quality: d.extraction_quality,
        page_count: d.page_count,
        error_json: d.error_json,
        created_at: d.created_at.toISOString(),
      })),
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
        parse_status: "queued",
        ocr_status: "queued",
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
    },
    { status: 200, headers },
  );
}
