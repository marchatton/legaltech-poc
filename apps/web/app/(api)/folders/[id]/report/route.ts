import { z } from "zod";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { materializeReportRowsFromStepOutputs } from "../../../../../lib/reportRowsFromStepOutputs.server";
import { createTraceContext } from "../../../../../lib/trace.server";

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

function zodIssueSummary(err: unknown): Array<{ code: string; message: string; path: Array<string | number> }> {
  if (!err || typeof err !== "object" || !("issues" in err)) return [];
  const anyErr = err as { issues?: Array<{ code: string; message: string; path: Array<string | number> }> };
  return Array.isArray(anyErr.issues) ? anyErr.issues.map((i) => ({ code: i.code, message: i.message, path: i.path })) : [];
}

function parseRunId(req: Request): string | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get("run_id");
  if (raw === null) return null;
  const parsed = RunIdSchema.safeParse(raw);
  if (!parsed.success) return "__invalid__";
  return parsed.data;
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
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

  try {
    await materializeReportRowsFromStepOutputs({
      runId: run.id,
      folderId,
      questionSetVersion: run.question_set_version,
      db: sql,
    });
  } catch (err) {
    return Response.json(
      safeErrorEnvelope({
        code: "INTERNAL",
        message: "Failed to materialize report rows from run step outputs.",
        details: { run_id: run.id, message: err instanceof Error ? err.message : String(err) },
        traceId,
      }),
      { status: 500, headers },
    );
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, created_at, updated_at
    FROM report_rows
    WHERE run_id = ${run.id}
    ORDER BY created_at ASC, question_id ASC
  `;

  for (const r of rows) {
    const hasSchema = r.payload_schema_version !== null && String(r.payload_schema_version).trim() !== "";
    const hasPayload = r.payload_json !== null && r.payload_json !== undefined;
    if (hasSchema !== hasPayload) {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload is in an inconsistent state.",
          details: { row_id: r.id, question_id: r.question_id },
          traceId,
        }),
        { status: 500, headers },
      );
    }

    if (!hasSchema) continue;

    if (r.payload_schema_version === LIST_PAYLOAD_V0_SCHEMA_VERSION) {
      const parsed = ListPayloadV0Schema.safeParse(r.payload_json);
      if (!parsed.success) {
        return Response.json(
          safeErrorEnvelope({
            code: "INTERNAL",
            message: "Report row payload failed schema validation.",
            details: { row_id: r.id, question_id: r.question_id, issues: zodIssueSummary(parsed.error) },
            traceId,
          }),
          { status: 500, headers },
        );
      }
    } else {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload uses an unsupported schema version.",
          details: { row_id: r.id, question_id: r.question_id, payload_schema_version: r.payload_schema_version },
          traceId,
        }),
        { status: 500, headers },
      );
    }
  }

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
