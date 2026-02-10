import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { hybridSearchWithDebug } from "../../../../../lib/retrieval/hybridSearch.server";
import { assertSpikesEnabled } from "../../../../../lib/spikes.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const OptionalInt = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return undefined;
      return Number(s);
    }
    return val;
  },
  z.number().int().nonnegative().optional(),
);

const OptionalFloat = z.preprocess(
  (val) => {
    if (val === undefined || val === null) return undefined;
    if (typeof val === "string") {
      const s = val.trim();
      if (!s) return undefined;
      return Number(s);
    }
    return val;
  },
  z.number().finite().optional(),
);

const OptsSchema = z
  .object({
    kLex: OptionalInt,
    kSem: OptionalInt,
    kFinal: OptionalInt,
    lexWeight: OptionalFloat,
    semWeight: OptionalFloat,
    probes: OptionalInt,
  })
  .partial();

const RequestSchema = z.object({
  folderId: z.string().trim().min(1),
  indexVersion: z.string().trim().min(1),
  queryText: z.string().trim().min(1),
  opts: OptsSchema.optional(),
});

function rawFromSearchParams(req: Request): unknown {
  const url = new URL(req.url);
  return {
    folderId: url.searchParams.get("folderId"),
    indexVersion: url.searchParams.get("indexVersion"),
    queryText: url.searchParams.get("queryText"),
    opts: {
      kLex: url.searchParams.get("kLex"),
      kSem: url.searchParams.get("kSem"),
      kFinal: url.searchParams.get("kFinal"),
      lexWeight: url.searchParams.get("lexWeight"),
      semWeight: url.searchParams.get("semWeight"),
      probes: url.searchParams.get("probes"),
    },
  };
}

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  const parsed = RequestSchema.safeParse(rawFromSearchParams(req));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  try {
    const { hits, debug } = await hybridSearchWithDebug({ ...parsed.data, traceId });
    return Response.json(
      {
        ok: true,
        args: {
          folderId: parsed.data.folderId,
          indexVersion: parsed.data.indexVersion,
          queryText: parsed.data.queryText,
          opts: parsed.data.opts ?? {},
        },
        debug,
        hits,
      },
      { status: 200, headers },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("spikes.retrieval.hybrid_search_failed", {
      trace_id: traceId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Hybrid search failed.", traceId }), {
      status: 500,
      headers,
    });
  }
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = RequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  try {
    const { hits, debug } = await hybridSearchWithDebug({ ...parsed.data, traceId });
    return Response.json(
      {
        ok: true,
        args: parsed.data,
        debug,
        hits,
      },
      { status: 200, headers },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("spikes.retrieval.hybrid_search_failed", {
      trace_id: traceId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Hybrid search failed.", traceId }), {
      status: 500,
      headers,
    });
  }
}
