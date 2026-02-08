import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { enqueueDocumentIngest } from "../../../../../lib/ingest/ingestQueue.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  storage_key: z.string().min(1),
});

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
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

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      parse_status: "queued" | "parsing" | "parsed" | "failed";
      ocr_status: "queued" | "running" | "done" | "failed";
    }>
  >`
    SELECT id, storage_key, upload_completed_at, parse_status, ocr_status
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

  if (!doc.storage_key || doc.storage_key !== parsedBody.data.storage_key) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "storage_key did not match document.",
        details: { storage_key: "mismatch" },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.parse_status === "queued" && doc.ocr_status === "queued") {
    enqueueDocumentIngest(documentId);
  }

  return Response.json(
    {
      document: {
        id: doc.id,
        parse_status: doc.parse_status,
        ocr_status: doc.ocr_status,
      },
    },
    { status: 200, headers },
  );
}
