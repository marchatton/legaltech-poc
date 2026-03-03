import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../../lib/db.server";
import { assertSpikesEnabled } from "../../../../../../lib/spikes.server";
import { createTraceContext } from "../../../../../../lib/trace.server";

export const runtime = "nodejs";

const QuerySchema = z.object({
  run_id: z.string().min(1).max(200),
});

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
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

  await ensureSchema();

  const runId = parsed.data.run_id;
  const runs = await sql<
    Array<{
      id: string;
      folder_id: string;
      type: string;
      state: string;
      trace_id: string | null;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    SELECT id, folder_id, type, state, trace_id, created_at, updated_at
    FROM runs
    WHERE id = ${runId}
      AND type = 'wdk_smoke'
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const steps = await sql<
    Array<{
      id: string;
      step_key: string;
      step_type: string;
      state: string;
      attempt: number;
      available_at: Date;
      locked_at: Date | null;
      locked_by: string | null;
      input_json: unknown;
      output_json: unknown;
      error_json: unknown | null;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    SELECT
      id,
      step_key,
      step_type,
      state,
      attempt,
      available_at,
      locked_at,
      locked_by,
      input_json,
      output_json,
      error_json,
      created_at,
      updated_at
    FROM run_steps
    WHERE run_id = ${runId}
    ORDER BY created_at ASC
  `;

  return Response.json({ run, steps }, { status: 200, headers });
}

