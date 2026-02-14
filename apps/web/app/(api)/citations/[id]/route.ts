import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  // Keep IDs intentionally constrained so we can safely validate and fail closed.
  // Citation IDs use the `cit_` prefix (for example: cit_abc123).
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

type TrustMetadataFields = {
  doc_version: string | null;
  verified_at: string | null;
  loaded_state: string | null;
};

function nonEmptyNullableString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function trustMetadataFromProvenance(provenance: unknown): TrustMetadataFields {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) {
    return {
      doc_version: null,
      verified_at: null,
      loaded_state: null,
    };
  }
  const rec = provenance as Record<string, unknown>;
  return {
    doc_version: nonEmptyNullableString(rec.doc_version),
    verified_at: nonEmptyNullableString(rec.verified_at),
    loaded_state: nonEmptyNullableString(rec.loaded_state),
  };
}

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const citationsApiEnabled = process.env.FEATURE_CITATIONS_API === "1";
  if (!citationsApiEnabled) {
    // Keep route access constrained when the citations API flag is disabled.
    const devGate = assertDevOrDemoProdApi(traceId, headers);
    if (devGate) return devGate;
  }

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

  const citationId = parsedParams.data.id;

  try {
    await ensureSchema();
    const citations = await sql<
      Array<{
        id: string;
        document_id: string;
        document_filename: string | null;
        page_number: number;
        snippet: string;
        snippet_hash: string;
        polygons_json: unknown;
        provenance_json: unknown;
      }>
    >`
      SELECT c.id, c.document_id, d.filename AS document_filename, c.page_number, c.snippet, c.snippet_hash, c.polygons_json, r.provenance_json
      FROM citations c
      LEFT JOIN report_rows r
        ON r.id = c.report_row_id
      LEFT JOIN documents d
        ON d.id = c.document_id
      WHERE c.id = ${citationId}
      LIMIT 1
    `;
    const cit = citations[0];
    if (!cit) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Citation not found.", traceId }), {
        status: 404,
        headers,
      });
    }
    const trust = trustMetadataFromProvenance(cit.provenance_json);

    return Response.json(
      {
        citation: {
          id: cit.id,
          document_id: cit.document_id,
          document_filename: nonEmptyNullableString(cit.document_filename),
          page_number: cit.page_number,
          polygons: cit.polygons_json,
          snippet: cit.snippet,
          snippet_hash: cit.snippet_hash,
          doc_version: trust.doc_version,
          verified_at: trust.verified_at,
          loaded_state: trust.loaded_state,
        },
      },
      { status: 200, headers },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("citations.get_failed", {
      citationId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to load citation.", traceId }), {
      status: 500,
      headers,
    });
  }
}
