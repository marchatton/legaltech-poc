import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0Schema,
  safeErrorEnvelope,
  type ListPayloadV0,
} from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { newId } from "../../../../lib/ids";
import { assertJsonContentType } from "../../../../lib/jsonContentType";
import { createSignedGetHeaders, putObject, validateArtefactDocxStorageKey } from "../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../lib/trace.server";
import { renderMemoDocx, type MemoCitation } from "../../../../lib/memoDocx.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  folder_id: z.string().trim().min(1),
  run_id: z.string().trim().min(1).max(200),
  kind: z.literal("memo"),
  unsafe_override: z.boolean().optional().default(false),
});

type FolderRow = {
  id: string;
  name: string;
};

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
  status: string;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
};

type CitationRow = {
  id: string;
  document_id: string;
  document_filename: string | null;
  page_number: number;
};

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

function exportErrorEnvelope(opts: {
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

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const rec = provenance as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const verify = rec.verify;
  if (verify && typeof verify === "object" && !Array.isArray(verify)) {
    const code = (verify as Record<string, unknown>).reason_code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  const verification = rec.verification;
  if (verification && typeof verification === "object" && !Array.isArray(verification)) {
    const code = (verification as Record<string, unknown>).reason_code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  return null;
}

function safeParseChecklist(provenance: unknown): string[] {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return [];
  const rec = provenance as Record<string, unknown>;
  const raw = rec.missing_docs_checklist;
  if (!Array.isArray(raw)) return [];

  const out: string[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const label = (item as Record<string, unknown>).label;
    if (typeof label === "string" && label.trim()) out.push(label.trim());
  }
  return out;
}

function requireListPayload(row: ReportRow, expectedKind: ListPayloadV0["kind"]): ListPayloadV0 {
  if (row.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(`MISSING_PAYLOAD_SCHEMA:${row.question_id}:${String(row.payload_schema_version ?? "null")}`);
  }
  const parsed = ListPayloadV0Schema.safeParse(row.payload_json);
  if (!parsed.success) {
    throw new Error(`INVALID_PAYLOAD_JSON:${row.question_id}`);
  }
  if (parsed.data.kind !== expectedKind) {
    throw new Error(`PAYLOAD_KIND_MISMATCH:${row.question_id}:${parsed.data.kind}:${expectedKind}`);
  }
  return parsed.data;
}

function collectCitationIds(payload: ListPayloadV0): string[] {
  const ids: string[] = [];
  for (const it of payload.items) {
    for (const cid of it.citation_ids) ids.push(cid);
  }
  return ids;
}

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
    return Response.json(exportErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      exportErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedBody.data.folder_id;
  const runId = parsedBody.data.run_id;
  const unsafeOverride = parsedBody.data.unsafe_override;

  const folders = await sql<FolderRow[]>`
    SELECT id, name
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return Response.json(exportErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runs = await sql<RunRow[]>`
    SELECT id, state, index_version, agent_bundle_version, question_set_version
    FROM runs
    WHERE id = ${runId}
      AND folder_id = ${folderId}
    LIMIT 1
  `;
  const run = runs[0] ?? null;
  if (!run) {
    return Response.json(exportErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (run.state !== "completed") {
    return Response.json(
      exportErrorEnvelope({ code: "CONFLICT", message: "Export is only available for completed runs.", traceId }),
      { status: 409, headers },
    );
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, status, provenance_json, payload_schema_version, payload_json
    FROM report_rows
    WHERE run_id = ${runId}
    ORDER BY question_id ASC
  `;

  const citationFailures = rows
    .filter((r) => r.status === "citation_failed")
    .map((r) => ({
      question_id: r.question_id,
      reason_code: extractReasonCode(r.provenance_json) ?? "VALIDATION_ERROR",
    }));

  if (citationFailures.length > 0 && !unsafeOverride) {
    return Response.json(
      exportErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${citationFailures.length} row(s) failed verification.`,
        details: {
          citation_failed_count: citationFailures.length,
          failed_question_ids: citationFailures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(citationFailures.map((f) => f.reason_code))).sort(),
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      exportErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is demo-only.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  const requirementsRow = rows.find((r) => r.question_id === "TS-03") ?? null;
  const exceptionsRow = rows.find((r) => r.question_id === "TS-04") ?? null;
  const surveyIssuesRow = rows.find((r) => r.question_id === "TS-09") ?? null;

  if (!requirementsRow || !exceptionsRow || !surveyIssuesRow) {
    return Response.json(
      exportErrorEnvelope({
        code: "INTERNAL",
        message: "Export requires list-shaped report rows.",
        details: {
          missing_question_ids: ["TS-03", "TS-04", "TS-09"].filter(
            (qid) => !rows.some((r) => r.question_id === qid),
          ),
        },
        traceId,
      }),
      { status: 500, headers },
    );
  }

  let requirements: ListPayloadV0;
  let exceptions: ListPayloadV0;
  let surveyIssues: ListPayloadV0;
  try {
    requirements = requireListPayload(requirementsRow, "requirements_tracker");
    exceptions = requireListPayload(exceptionsRow, "exceptions_table");
    surveyIssues = requireListPayload(surveyIssuesRow, "survey_issues");
  } catch {
    return Response.json(
      exportErrorEnvelope({
        code: "INTERNAL",
        message: "Export requires structured list payloads.",
        details: { reason: "payload_contract_mismatch" },
        traceId,
      }),
      { status: 500, headers },
    );
  }

  const missingInputs = rows
    .filter((r) => r.status === "missing_input")
    .slice()
    .sort((a, b) => a.question_id.localeCompare(b.question_id))
    .map((r) => ({
      question_id: r.question_id,
      question: r.question,
      checklist: safeParseChecklist(r.provenance_json),
    }));

  const uniqueCitationIds = new Set<string>();
  for (const cid of collectCitationIds(requirements)) uniqueCitationIds.add(cid);
  for (const cid of collectCitationIds(exceptions)) uniqueCitationIds.add(cid);
  for (const cid of collectCitationIds(surveyIssues)) uniqueCitationIds.add(cid);
  const citationIds = Array.from(uniqueCitationIds);

  const citationsById = new Map<string, MemoCitation>();
  if (citationIds.length) {
    const citations = await sql<CitationRow[]>`
      SELECT c.id, c.document_id, d.filename as document_filename, c.page_number
      FROM citations c
      INNER JOIN report_rows r ON r.id = c.report_row_id
      LEFT JOIN documents d ON d.id = c.document_id
      WHERE c.id = ANY(${citationIds})
        AND r.run_id = ${runId}
        AND r.folder_id = ${folderId}
    `;

    for (const c of citations) {
      citationsById.set(c.id, {
        id: c.id,
        document_filename: c.document_filename ?? c.document_id,
        page_number: c.page_number,
      });
    }

    const missing = citationIds.filter((cid) => !citationsById.has(cid));
    if (missing.length) {
      return Response.json(
        exportErrorEnvelope({
          code: "INTERNAL",
          message: "Export could not resolve locked citations.",
          details: { missing_citation_ids: missing.slice(0, 25), missing_count: missing.length },
          traceId,
        }),
        { status: 500, headers },
      );
    }
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  let bytes: Uint8Array;
  try {
    bytes = await renderMemoDocx({
      folder,
      run,
      generatedAt: createdAt,
      requirements,
      exceptions,
      surveyIssues,
      missingInputs,
      citationsById,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("export.docx.render failed", {
      trace_id: traceId,
      folder_id: folderId,
      run_id: runId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(exportErrorEnvelope({ code: "INTERNAL", message: "Failed to render memo docx.", traceId }), {
      status: 500,
      headers,
    });
  }

  const filename = unsafeOverride ? "memo.UNSAFE.docx" : "memo.docx";
  const storageKey = `folders/${folderId}/artefacts/${artefactId}.docx`;
  const keyOk = validateArtefactDocxStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(
      exportErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }),
      { status: 500, headers },
    );
  }

  await putObject({ storageKey, bytes });

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
      'docx',
      'memo',
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({
        template: "memo_v1",
        question_ids: ["TS-03", "TS-04", "TS-09"],
        unsafe_override: unsafeOverride,
      })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `/artefacts/${artefactId}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: traceId,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "docx",
        kind: "memo",
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
