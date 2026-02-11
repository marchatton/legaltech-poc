import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { assertJsonContentType } from "../../../../lib/jsonContentType";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1).max(200),
});

const BodySchema = z.object({
  action: z.literal("mark_reviewed"),
});

type RowState = {
  id: string;
  status: string;
  updated_at: Date;
};

function conflictResponse(args: { code: string; message: string; details?: unknown; traceId: string; headers: Headers }): Response {
  return Response.json(
    safeErrorEnvelope({
      code: args.code,
      message: args.message,
      details: args.details,
      traceId: args.traceId,
      retryable: false,
    }),
    { status: 409, headers: args.headers },
  );
}

export async function PATCH(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
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
        retryable: false,
      }),
      { status: 400, headers },
    );
  }

  const contentTypeGate = assertJsonContentType({ req, traceId, headers });
  if (contentTypeGate) return contentTypeGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid JSON body.",
        traceId,
        retryable: false,
      }),
      { status: 400, headers },
    );
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
        retryable: false,
      }),
      { status: 400, headers },
    );
  }

  const rowId = parsedParams.data.id;

  const updated = await sql<RowState[]>`
    UPDATE report_rows
    SET status = 'reviewed',
        updated_at = now()
    WHERE id = ${rowId}
      AND status = 'needs_review'
    RETURNING id, status, updated_at
  `;
  if (updated[0]) {
    return Response.json(
      {
        row: {
          id: updated[0].id,
          status: updated[0].status,
          updated_at: updated[0].updated_at.toISOString(),
        },
      },
      { status: 200, headers },
    );
  }

  const existing = await sql<RowState[]>`
    SELECT id, status, updated_at
    FROM report_rows
    WHERE id = ${rowId}
    LIMIT 1
  `;
  const row = existing[0] ?? null;
  if (!row) {
    return Response.json(
      safeErrorEnvelope({
        code: "NOT_FOUND",
        message: "Report row not found.",
        traceId,
        retryable: false,
      }),
      { status: 404, headers },
    );
  }

  if (row.status === "reviewed") {
    return Response.json(
      {
        row: {
          id: row.id,
          status: row.status,
          updated_at: row.updated_at.toISOString(),
        },
      },
      { status: 200, headers },
    );
  }

  return conflictResponse({
    code: "INVALID_STATE",
    message: "Only needs_review rows can be marked reviewed.",
    details: { status: row.status, row_id: row.id },
    traceId,
    headers,
  });
}
