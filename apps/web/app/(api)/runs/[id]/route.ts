import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1).max(200),
});

function asFailureCounts(val: unknown): Record<string, number> {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (typeof k !== "string" || !k) continue;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) out[k] = Math.floor(v);
  }
  return out;
}

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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
      }),
      { status: 400, headers },
    );
  }

  const runId = parsedParams.data.id;
  const runs = await sql<
    Array<{
      id: string;
      state: string;
      index_version: string;
      agent_bundle_version: string;
      question_set_version: string;
      questions_total: number;
      questions_done: number;
      failure_counts_json: unknown;
      queued_at: Date;
      started_at: Date | null;
      completed_at: Date | null;
    }>
  >`
    SELECT
      id,
      state,
      index_version,
      agent_bundle_version,
      question_set_version,
      questions_total,
      questions_done,
      failure_counts_json,
      queued_at,
      started_at,
      completed_at
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
        progress: {
          questions_total: run.questions_total ?? 0,
          questions_done: run.questions_done ?? 0,
        },
        failure_counts: asFailureCounts(run.failure_counts_json),
        transitions: {
          queued_at: run.queued_at.toISOString(),
          started_at: run.started_at ? run.started_at.toISOString() : null,
          completed_at: run.completed_at ? run.completed_at.toISOString() : null,
        },
      },
    },
    { status: 200, headers },
  );
}
