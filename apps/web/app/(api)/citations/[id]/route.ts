import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { isDevOrDemoProd } from "../../../../lib/runtimeMode";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  // Keep IDs intentionally constrained so we can safely validate and fail closed.
  // Fixture seed IDs look like: cit_TS-04_1, cit_TB_BAD_1
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for dev seed data where multiple packs may share ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
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

function findCitationInSeedSnapshots(args: {
  citationId: string;
  packId?: string;
}):
  | {
      ok: true;
      citation: {
        document_id: string;
        page_number: number;
        polygons: unknown;
        snippet: string;
        snippet_hash: string;
        doc_version: string | null;
        verified_at: string | null;
        loaded_state: string | null;
      };
    }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{
    pack_id: string;
    citation: {
      document_id: string;
      page_number: number;
      polygons: unknown;
      snippet: string;
      snippet_hash: string;
      doc_version: string | null;
      verified_at: string | null;
      loaded_state: string | null;
    };
  }> = [];

  for (const packId of packIds) {
    let snapshot: ReturnType<typeof loadSeedSnapshot> | null;
    try {
      snapshot = loadSeedSnapshot(packId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("loadSeedSnapshot failed", {
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
      return { ok: false, code: "INTERNAL", message: "Failed to load seed snapshot." };
    }
    if (!snapshot) continue;

    const cit = snapshot.citations?.[args.citationId];
    if (!cit) continue;

    hits.push({
      pack_id: packId,
      citation: {
        document_id: cit.document_id,
        page_number: cit.page_number,
        polygons: cit.polygons,
        snippet: cit.snippet,
        snippet_hash: cit.snippet_hash,
        doc_version: nonEmptyNullableString(cit.doc_version),
        verified_at: nonEmptyNullableString(cit.verified_at),
        loaded_state: nonEmptyNullableString(cit.loaded_state),
      },
    });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Citation not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "Citation id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.pack_id) },
    };
  }

  return { ok: true, citation: hits[0]!.citation };
}

function seedCitationResponse(args: { citationId: string; packId?: string; traceId: string; headers: Headers }): Response {
  const found = findCitationInSeedSnapshots({ citationId: args.citationId, packId: args.packId });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId: args.traceId,
      }),
      { status, headers: args.headers },
    );
  }

  return Response.json(
    {
      citation: {
        id: args.citationId,
        document_id: found.citation.document_id,
        page_number: found.citation.page_number,
        polygons: found.citation.polygons,
        snippet: found.citation.snippet,
        snippet_hash: found.citation.snippet_hash,
        doc_version: found.citation.doc_version,
        verified_at: found.citation.verified_at,
        loaded_state: found.citation.loaded_state,
      },
    },
    { status: 200, headers: args.headers },
  );
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const citationsApiEnabled = process.env.FEATURE_CITATIONS_API === "1";
  if (!citationsApiEnabled) {
    // Preserve existing dev-only fixture behavior until the feature is enabled.
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

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const citationId = parsedParams.data.id;

  if (citationsApiEnabled) {
    await ensureSchema();
    const citations = await sql<
      Array<{
        id: string;
        document_id: string;
        page_number: number;
        snippet: string;
        snippet_hash: string;
        polygons_json: unknown;
        provenance_json: unknown;
      }>
    >`
      SELECT c.id, c.document_id, c.page_number, c.snippet, c.snippet_hash, c.polygons_json, r.provenance_json
      FROM citations c
      LEFT JOIN report_rows r
        ON r.id = c.report_row_id
      WHERE c.id = ${citationId}
      LIMIT 1
    `;
    const cit = citations[0];
    if (!cit) {
      if (isDevOrDemoProd()) {
        return seedCitationResponse({
          citationId,
          packId: parsedQuery.data.pack,
          traceId,
          headers,
        });
      }
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
  }

  return seedCitationResponse({
    citationId,
    packId: parsedQuery.data.pack,
    traceId,
    headers,
  });
}
