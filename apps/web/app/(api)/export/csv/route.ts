import { timingSafeEqual } from "node:crypto";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, safeErrorEnvelope } from "@orbital-poc/core";
import { z } from "zod";

import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../lib/trace.server";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { newId } from "../../../../lib/ids";
import { assertJsonContentType } from "../../../../lib/jsonContentType";
import {
  createSignedGetHeaders,
  putObject,
  validateArtefactCsvStorageKey,
} from "../../../../lib/objectStore.server";
import { csvFromSourceRow, ExportCsvKindSchema, reasonCodeFromProvenance } from "../../../../lib/exportCsv.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  folder_id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid folder_id"),
  run_id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/, "Invalid run_id"),
  kind: ExportCsvKindSchema,
  unsafe_override: z.boolean().optional().default(false),
});

type DbRunRow = { id: string; state: string };

type DbReportRow = {
  id: string;
  question_id: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
};

type DbFailedRow = { question_id: string; provenance_json: unknown };

type DbCitationRow = { id: string; filename: string; page_number: number };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  // Unsafe exports must stay dev-only even if flags are accidentally set in production.
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function collectCitationIdsFromPayload(payloadSchemaVersion: string | null, payloadJson: unknown): string[] {
  if (payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) return [];
  const parsed = ListPayloadV0Schema.safeParse(payloadJson);
  if (!parsed.success) return [];
  const ids = parsed.data.items.flatMap((it) => it.citation_ids);
  return Array.from(new Set(ids));
}

function snapshotRowForKind(snapshot: NonNullable<ReturnType<typeof loadSeedSnapshot>>, kind: string): DbReportRow | null {
  const candidates: DbReportRow[] = [];

  for (const r of snapshot.rows ?? []) {
    const hasSchema = r.payload_schema_version !== null && String(r.payload_schema_version ?? "").trim() !== "";
    const hasPayload = r.payload_json !== null && r.payload_json !== undefined;
    if (hasSchema !== hasPayload) continue;
    if (!hasSchema) continue;

    if (r.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) continue;

    const parsed = ListPayloadV0Schema.safeParse(r.payload_json);
    if (!parsed.success) continue;
    if (parsed.data.kind !== kind) continue;

    candidates.push({
      id: `seed_row:${r.question_id}`,
      question_id: r.question_id,
      answer: r.answer,
      status: r.status,
      notes: typeof r.notes === "string" ? r.notes : null,
      provenance_json: (r as { provenance_json?: unknown }).provenance_json ?? {},
      payload_schema_version: r.payload_schema_version,
      payload_json: r.payload_json,
    });
  }

  candidates.sort((a, b) => a.question_id.localeCompare(b.question_id));
  return candidates[0] ?? null;
}

// Implements the target export contract (see docs/03-architecture/50_api_surface.md).
// In dev, we also support fixture-backed runs from tmp/fixture-seed for tracer bullets.
export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const ctGate = assertJsonContentType({ req, traceId, headers });
  if (ctGate) return ctGate;

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
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

  const folderId = parsed.data.folder_id;
  const runId = parsed.data.run_id;
  const kind = parsed.data.kind;
  const unsafeOverride = parsed.data.unsafe_override;

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is not allowed.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  // If the run exists in the DB, enforce run completion gating.
  const runs = await sql<DbRunRow[]>`
    SELECT id, state
    FROM runs
    WHERE id = ${runId}
      AND folder_id = ${folderId}
    LIMIT 1
  `;
  const run = runs[0] ?? null;
  if (run && run.state !== "completed") {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "Run is not completed yet.",
        details: { run_id: runId, state: run.state },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  let sourceRow: DbReportRow | null = null;
  let citationById = new Map<string, { filename: string; page: number }>();

  if (run) {
    // Target contract: block export if ANY row in the run is citation_failed unless unsafe_override=true.
    if (!unsafeOverride) {
      const failed = await sql<DbFailedRow[]>`
        SELECT question_id, provenance_json
        FROM report_rows
        WHERE run_id = ${runId}
          AND status = 'citation_failed'
        ORDER BY question_id ASC
        LIMIT 200
      `;

      if (failed.length > 0) {
        const reasonCodes = Array.from(
          new Set(
            failed
              .map((r) => reasonCodeFromProvenance(r.provenance_json) ?? "VALIDATION_ERROR")
              .filter((c) => typeof c === "string" && c.trim()),
          ),
        ).sort();

        return Response.json(
          safeErrorEnvelope({
            code: "EXPORT_BLOCKED",
            message: `Export blocked: ${failed.length} row(s) failed verification.`,
            details: {
              citation_failed_count: failed.length,
              failed_question_ids: failed.map((r) => r.question_id).slice(0, 50),
              reason_codes: reasonCodes,
            },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }

    const rows = await sql<DbReportRow[]>`
      SELECT id, question_id, answer, status, notes, provenance_json, payload_schema_version, payload_json
      FROM report_rows
      WHERE run_id = ${runId}
        AND payload_schema_version IS NOT NULL
        AND payload_json IS NOT NULL
        AND payload_json->>'kind' = ${kind}
      ORDER BY question_id ASC
      LIMIT 2
    `;
    if (rows.length === 0) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export requires structured payload_json, but no matching row was found.",
          details: { run_id: runId, kind, dependency: "Initiative 002" },
          traceId,
        }),
        { status: 409, headers },
      );
    }
    if (rows.length > 1) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export found multiple structured payload rows for this kind.",
          details: { run_id: runId, kind, row_ids: rows.map((r) => r.id) },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    sourceRow = rows[0] ?? null;

    const citationIds = collectCitationIdsFromPayload(sourceRow.payload_schema_version, sourceRow.payload_json);
    if (citationIds.length) {
      const cits = await sql<DbCitationRow[]>`
        SELECT c.id, d.filename, c.page_number
        FROM citations c
        JOIN report_rows r ON r.id = c.report_row_id
        JOIN documents d ON d.id = c.document_id
        WHERE c.id = ANY(${citationIds})
          AND r.run_id = ${runId}
      `;
      const byId = new Map<string, { filename: string; page: number }>();
      for (const c of cits) {
        byId.set(c.id, { filename: c.filename, page: c.page_number });
      }
      citationById = byId;

      const missing = citationIds.filter((id) => !citationById.has(id));
      if (missing.length) {
        return Response.json(
          safeErrorEnvelope({
            code: "CONFLICT",
            message: "Export requires locked citations, but some citation_ids were missing.",
            details: { missing_citation_ids: missing.slice(0, 25) },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }
  } else {
    // Fixture-backed tracer bullets: folder_id maps to pack_id.
    const snapshot = /^pack_\d{2}_[a-z0-9_]+$/i.test(folderId) ? loadSeedSnapshot(folderId) : null;
    if (!snapshot) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const metaRunId = isRecord(snapshot.meta) && typeof snapshot.meta.run_id === "string" ? snapshot.meta.run_id : null;
    if (metaRunId && metaRunId !== runId) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "run_id did not match seeded snapshot.",
          details: { expected: metaRunId },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    sourceRow = snapshotRowForKind(snapshot, kind);
    if (!sourceRow) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export requires structured payload_json, but no matching row was found.",
          details: { run_id: runId, kind, dependency: "Initiative 002" },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    if (!unsafeOverride) {
      const failed = (snapshot.rows ?? []).filter((r) => r?.status === "citation_failed");
      if (failed.length > 0) {
        return Response.json(
          safeErrorEnvelope({
            code: "EXPORT_BLOCKED",
            message: `Export blocked: ${failed.length} row(s) failed verification.`,
            details: {
              citation_failed_count: failed.length,
              failed_question_ids: failed
                .map((r) => String((r as { question_id?: unknown }).question_id ?? ""))
                .filter((s) => s.trim())
                .slice(0, 50),
            },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }

    for (const [citationId, cit] of Object.entries(snapshot.citations ?? {})) {
      if (!cit || typeof cit !== "object") continue;
      const filename = (cit as { document_filename?: unknown }).document_filename;
      const page = (cit as { page_number?: unknown }).page_number;
      if (typeof filename !== "string" || !filename.trim()) continue;
      if (typeof page !== "number" || !Number.isFinite(page) || page <= 0) continue;
      citationById.set(citationId, { filename: filename.trim(), page: Math.trunc(page) });
    }
  }

  if (!sourceRow) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const failureCode =
    sourceRow.status === "citation_failed" ? reasonCodeFromProvenance(sourceRow.provenance_json) ?? "VALIDATION_ERROR" : "";

  let csv: string;
  try {
    csv = csvFromSourceRow({
      kind,
      sourceRow: {
        source_question_id: sourceRow.question_id,
        row_status: sourceRow.status,
        source_answer: sourceRow.answer,
        failure_code: failureCode,
        notes: sourceRow.notes ?? null,
      },
      payloadSchemaVersion: sourceRow.payload_schema_version,
      payloadJson: sourceRow.payload_json,
      citationById,
      unsafeOverride,
    });
  } catch (err) {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "Export failed to map structured payload to CSV.",
        details: { kind, message: err instanceof Error ? err.message : String(err) },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  const filename = unsafeOverride ? `${kind}.UNSAFE.csv` : `${kind}.csv`;

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await putObject({ storageKey, bytes: Buffer.from(csv, "utf8") });

  // Ensure the folder exists so artefacts list/download works for fixture-backed exports.
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${folderId}, 'ready', 'v1', now(), now())
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO artefacts (
      id,
      folder_id,
      type,
      kind,
      filename,
      storage_key,
      source_run_id,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      ${artefactId},
      ${folderId},
      'csv',
      ${kind},
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({ schema_version: "csv_schemas_v1", unsafe_override: unsafeOverride })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `${origin}/artefacts/${artefactId}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: traceId,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "csv",
        kind,
        filename,
        storage_key: storageKey,
        source_run_id: runId,
        created_at: createdAt.toISOString(),
        download_url: downloadUrl,
      },
    },
    { status: 200, headers },
  );
}
