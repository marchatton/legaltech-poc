import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
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

function findCitationInSeedSnapshots(args: {
  citationId: string;
  packId?: string;
}):
  | { ok: true; citation: { document_id: string; page_number: number; polygons: unknown; snippet: string; snippet_hash: string } }
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

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
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

  const found = findCitationInSeedSnapshots({ citationId, packId: parsedQuery.data.pack });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  return Response.json(
    {
      citation: {
        id: citationId,
        document_id: found.citation.document_id,
        page_number: found.citation.page_number,
        polygons: found.citation.polygons,
        snippet: found.citation.snippet,
        snippet_hash: found.citation.snippet_hash,
      },
    },
    { status: 200, headers },
  );
}
