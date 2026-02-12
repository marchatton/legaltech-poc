import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type ArtefactRow = {
  id: string;
  folder_id: string;
  type: string;
  kind: string;
  filename: string;
  storage_key: string;
  source_run_id: string | null;
  metadata_json: unknown;
  created_at: Date;
};

type ArtefactSafety = "all" | "safe" | "unsafe";

type ParsedCursor = {
  createdAt: Date;
  id: string;
};

function nonEmptyQuery(value: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function parseLimit(value: string | null): number {
  if (!value) return 100;
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return 100;
  return Math.min(parsed, 500);
}

function parseIncludeSummary(value: string | null): boolean {
  if (!value) return true;
  return value !== "0";
}

function parseSafety(value: string | null): ArtefactSafety {
  if (value === "safe" || value === "unsafe") return value;
  return "all";
}

function parseCursor(value: string | null): ParsedCursor | null {
  if (!value) return null;
  const [createdAtRaw, idRaw] = value.split("|");
  if (!createdAtRaw || !idRaw) return null;
  const createdAt = new Date(createdAtRaw);
  if (!Number.isFinite(createdAt.getTime())) return null;
  const id = idRaw.trim();
  if (id.length === 0) return null;
  return { createdAt, id };
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function isUnsafeArtefact(row: Pick<ArtefactRow, "filename" | "metadata_json">): boolean {
  if (row.filename.toUpperCase().includes(".UNSAFE.")) return true;
  if (!isRecord(row.metadata_json)) return false;
  return row.metadata_json.unsafe_override === true;
}

function passesCursor(row: ArtefactRow, cursor: ParsedCursor | null): boolean {
  if (!cursor) return true;
  const createdAt = row.created_at.getTime();
  const cursorAt = cursor.createdAt.getTime();
  if (createdAt < cursorAt) return true;
  if (createdAt > cursorAt) return false;
  return row.id < cursor.id;
}

function summaryCounts(rows: ArtefactRow[]): {
  total: number;
  safe: number;
  unsafe: number;
  by_type: Record<string, number>;
  by_kind: Record<string, number>;
  by_run: Array<{ run_id: string | null; count: number }>;
  latest_created_at: string | null;
} {
  const byType = new Map<string, number>();
  const byKind = new Map<string, number>();
  const byRun = new Map<string | null, number>();
  let safe = 0;
  let unsafe = 0;

  for (const row of rows) {
    if (isUnsafeArtefact(row)) unsafe += 1;
    else safe += 1;

    byType.set(row.type, (byType.get(row.type) ?? 0) + 1);
    byKind.set(row.kind, (byKind.get(row.kind) ?? 0) + 1);
    byRun.set(row.source_run_id, (byRun.get(row.source_run_id) ?? 0) + 1);
  }

  return {
    total: rows.length,
    safe,
    unsafe,
    by_type: Object.fromEntries(byType),
    by_kind: Object.fromEntries(byKind),
    by_run: Array.from(byRun.entries()).map(([run_id, count]) => ({ run_id, count })),
    latest_created_at: rows[0]?.created_at.toISOString() ?? null,
  };
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

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
  const requestUrl = new URL(req.url);
  const typeFilter = nonEmptyQuery(requestUrl.searchParams.get("type"));
  const kindFilter = nonEmptyQuery(requestUrl.searchParams.get("kind"));
  const sourceRunIdFilter = nonEmptyQuery(requestUrl.searchParams.get("source_run_id"));
  const safetyFilter = parseSafety(requestUrl.searchParams.get("safety"));
  const limit = parseLimit(requestUrl.searchParams.get("limit"));
  const cursor = parseCursor(nonEmptyQuery(requestUrl.searchParams.get("cursor")));
  const includeSummary = parseIncludeSummary(requestUrl.searchParams.get("include_summary"));

  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, folder_id, type, kind, filename, storage_key, source_run_id, metadata_json, created_at
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;
  const filtered = artefacts.filter((row) => {
    if (typeFilter && row.type !== typeFilter) return false;
    if (kindFilter && row.kind !== kindFilter) return false;
    if (sourceRunIdFilter && row.source_run_id !== sourceRunIdFilter) return false;

    const unsafe = isUnsafeArtefact(row);
    if (safetyFilter === "unsafe" && !unsafe) return false;
    if (safetyFilter === "safe" && unsafe) return false;
    return true;
  });

  const afterCursor = filtered.filter((row) => passesCursor(row, cursor));
  const pageSlice = afterCursor.slice(0, limit + 1);
  const hasMore = pageSlice.length > limit;
  const pagedRows = hasMore ? pageSlice.slice(0, limit) : pageSlice;
  const nextCursor =
    hasMore && pagedRows.length > 0
      ? `${pagedRows[pagedRows.length - 1]!.created_at.toISOString()}|${pagedRows[pagedRows.length - 1]!.id}`
      : null;

  return Response.json(
    {
      artefacts: pagedRows.map((a) => {
        const signed = createSignedGetHeaders({ storageKey: a.storage_key });
        const downloadUrl = `/artefacts/${a.id}/download?${new URLSearchParams({
          expires: String(signed.expires_at_ms),
          sig: signed.signature,
          issued: traceId,
        }).toString()}`;

        return {
          id: a.id,
          type: a.type,
          kind: a.kind,
          filename: a.filename,
          storage_key: a.storage_key,
          source_run_id: a.source_run_id,
          created_at: a.created_at.toISOString(),
          download_url: downloadUrl,
          unsafe: isUnsafeArtefact(a),
        };
      }),
      summary: includeSummary ? summaryCounts(filtered) : undefined,
      next_cursor: nextCursor,
    },
    { status: 200, headers },
  );
}
