import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid run id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for fixture seed data where multiple packs may share run ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function assertAdminAllowed(req: Request):
  | { ok: true }
  | { ok: false; code: "UNAUTHORISED" | "INTERNAL"; message: string } {
  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim() ?? "";
  if (!expected) {
    // Keep production posture strict; allow explicit bypass in dev only.
    const bypassAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_ADMIN_BYPASS === "1";
    if (bypassAllowed) return { ok: true };
    return { ok: false, code: "INTERNAL", message: "Trace export is misconfigured." };
  }

  const provided = req.headers.get("x-orbital-admin-token")?.trim() ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return { ok: false, code: "UNAUTHORISED", message: "Admin token required." };
  }

  return { ok: true };
}

type SeedSnapshot = NonNullable<ReturnType<typeof loadSeedSnapshot>>;

function traceErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId: string;
}): ReturnType<typeof safeErrorEnvelope> {
  return safeErrorEnvelope({
    code: opts.code,
    message: opts.message,
    details: opts.details,
    traceId: opts.traceId,
    retryable: opts.code === "INTERNAL",
  });
}

function findRunInSeedSnapshots(args: {
  runId: string;
  packId?: string;
}):
  | { ok: true; packId: string; snapshot: SeedSnapshot }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{ packId: string; snapshot: SeedSnapshot }> = [];

  for (const packId of packIds) {
    let snapshot: SeedSnapshot | null;
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
    if (typeof snapshot.meta.run_id !== "string") continue;
    if (snapshot.meta.run_id !== args.runId) continue;
    hits.push({ packId, snapshot });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Run not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "run_id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.packId) },
    };
  }

  return { ok: true, packId: hits[0]!.packId, snapshot: hits[0]!.snapshot };
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

type RetrievedChunk = { chunk_id: string; score: number | null };

function extractRetrievedChunks(provenance: unknown): RetrievedChunk[] {
  if (!isRecord(provenance)) return [];

  const candidates = Array.isArray(provenance.retrieved)
    ? provenance.retrieved
    : Array.isArray(provenance.retrieved_chunks)
      ? provenance.retrieved_chunks
      : null;
  if (!candidates) return [];

  const out: RetrievedChunk[] = [];
  for (const c of candidates) {
    if (!isRecord(c)) continue;
    const chunkId = typeof c.chunk_id === "string" ? c.chunk_id.trim() : "";
    if (!chunkId) continue;
    const score = typeof c.score === "number" && Number.isFinite(c.score) ? c.score : null;
    out.push({ chunk_id: chunkId, score });
  }
  return out;
}

function safeDurationMs(ms: unknown): number {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms);
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  if (process.env.FEATURE_TRACE_EXPORT !== "1") {
    return Response.json(
      traceErrorEnvelope({ code: "NOT_FOUND", message: "Trace export not enabled.", traceId }),
      { status: 404, headers },
    );
  }

  const admin = assertAdminAllowed(req);
  if (!admin.ok) {
    return Response.json(traceErrorEnvelope({ code: admin.code, message: admin.message, traceId }), {
      status: admin.code === "UNAUTHORISED" ? 403 : 500,
      headers,
    });
  }

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      traceErrorEnvelope({
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
      traceErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const runId = parsedParams.data.id;
  const packId = parsedQuery.data.pack;

  const found = findRunInSeedSnapshots({ runId, packId });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      traceErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  const snapshot = found.snapshot;

  const results = await Promise.all(
    snapshot.rows.map(async (row) => {
      const citationIds = row.citation_ids ?? [];
      const citations = citationIds
        .map((cid) => {
          const cit = snapshot.citations?.[cid];
          if (!cit) return null;
          return {
            document_id: cit.document_id,
            page_number: cit.page_number,
            snippet: cit.snippet,
            snippet_hash: cit.snippet_hash,
            polygons: cit.polygons,
          };
        })
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      const missingCount = citationIds.length - citations.length;
      const verify =
        missingCount > 0
          ? {
              verdict: "fail" as const,
              reason_code: "VALIDATION_ERROR",
              reason: `Missing ${missingCount} citation(s) referenced by id.`,
              timings_ms: { total: 0, deterministic: 0 },
            }
          : await verifyRow(
              {
                case_id: snapshot.meta.pack_id,
                question_id: row.question_id,
                question: row.question,
                answer: row.answer,
                citations,
              },
              { mode: "deterministic-only" },
            );

      const retrieved = extractRetrievedChunks((row as { provenance_json?: unknown }).provenance_json);

      return {
        row,
        citationIds,
        verify,
        retrieved,
      };
    }),
  );

  const trace = {
    run: {
      run_id: runId,
      folder_id: snapshot.meta.pack_id,
      state: "completed",
      index_version: typeof snapshot.meta.index_version === "string" ? snapshot.meta.index_version : null,
      agent_bundle_version: typeof snapshot.meta.agent_bundle_version === "string" ? snapshot.meta.agent_bundle_version : null,
      question_set_version: typeof snapshot.meta.question_set_version === "string" ? snapshot.meta.question_set_version : null,
    },
    steps: results.map(({ row, verify }) => ({
      step_key: `verify:${row.question_id}`,
      step_type: "verify_row",
      state: verify.verdict === "pass" ? "succeeded" : "failed",
      attempt: 1,
      duration_ms: safeDurationMs(verify.timings_ms?.total),
      metrics_json: {
        timings_ms: verify.timings_ms,
      },
      error_json:
        verify.verdict === "pass"
          ? null
          : {
              code: verify.reason_code,
              message: `Verification failed (${verify.reason_code}).`,
            },
    })),
    rows: results.map(({ row, citationIds, verify, retrieved }) => ({
      question_id: row.question_id,
      status: row.status,
      citation_ids: citationIds,
      provenance_json: {
        retrieved,
        verification: {
          verdict: verify.verdict,
          reason_code: verify.reason_code,
        },
      },
    })),
  };

  headers.set("Content-Disposition", `attachment; filename=\"trace_${runId}.json\"`);
  return Response.json({ trace }, { status: 200, headers });
}
