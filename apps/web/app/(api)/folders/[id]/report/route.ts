import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { newId } from "../../../../../lib/ids";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const RunIdSchema = z.string().trim().min(1).max(200);

type RunRow = {
  id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  created_at: Date;
  updated_at: Date;
};

function parseRunId(req: Request): string | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get("run_id");
  if (raw === null) return null;
  const parsed = RunIdSchema.safeParse(raw);
  if (!parsed.success) return "__invalid__";
  return parsed.data;
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const traceId = newId("trc");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Trace-Id": traceId,
  });

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
  const folder = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folder[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runId = parseRunId(req);
  if (runId === "__invalid__") {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid run_id query param.", traceId }),
      { status: 400, headers },
    );
  }

  let run: RunRow | null = null;
  if (runId) {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE id = ${runId}
        AND folder_id = ${folderId}
      LIMIT 1
    `;
    run = runs[0] ?? null;
  } else {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE folder_id = ${folderId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    run = runs[0] ?? null;
  }

  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, created_at, updated_at
    FROM report_rows
    WHERE run_id = ${run.id}
    ORDER BY created_at ASC, question_id ASC
  `;

  const rowIds = rows.map((r) => r.id);
  const citations = rowIds.length
    ? await sql<Array<{ id: string; report_row_id: string }>>`
        SELECT id, report_row_id
        FROM citations
        WHERE report_row_id = ANY(${rowIds})
      `
    : [];

  const citationIdsByRow = new Map<string, string[]>();
  for (const c of citations) {
    const existing = citationIdsByRow.get(c.report_row_id);
    if (existing) existing.push(c.id);
    else citationIdsByRow.set(c.report_row_id, [c.id]);
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
      },
      rows: rows.map((r) => {
        const cids = citationIdsByRow.get(r.id) ?? [];
        return {
          id: r.id,
          question_id: r.question_id,
          question: r.question,
          answer: r.answer,
          status: r.status,
          citation_ids: r.status === "missing_input" ? [] : cids,
          payload_schema_version: r.payload_schema_version ?? null,
          payload_json: r.payload_json ?? null,
          notes: r.notes ?? null,
          provenance_json: r.provenance_json ?? {},
          created_at: r.created_at.toISOString(),
          updated_at: r.updated_at.toISOString(),
        };
      }),
    },
    { status: 200, headers },
  );
}

