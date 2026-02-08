import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { newId } from "../../../../lib/ids";
import { putObject, validateArtefactCsvStorageKey, validateArtefactMetadataStorageKey } from "../../../../lib/objectStore.server";

export const runtime = "nodejs";

const ExportKindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);

const BodySchema = z.object({
  // PoC v1: the dev UI is fixture-backed, so `folder_id` maps to pack_id.
  // Keep it allowlisted to prevent arbitrary filesystem reads via fixtureSeed.
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  run_id: z.string().min(1).max(200),
  kind: ExportKindSchema,
  unsafe_override: z.boolean().optional().default(false),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function snapshotToCsv(snapshot: ReturnType<typeof loadSeedSnapshot>): string {
  const header = ["question_id", "question", "answer", "status", "citation_ids"].join(",");
  const lines = (snapshot?.rows ?? []).map((r) =>
    [
      csvEscape(r.question_id),
      csvEscape(r.question),
      csvEscape(r.answer),
      csvEscape(r.status),
      csvEscape((r.citation_ids ?? []).join(" ")),
    ].join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

type RowFailure = { question_id: string; reason_code: string };

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const direct = (provenance as { reason_code?: unknown }).reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

async function collectRowFailures(snapshot: NonNullable<ReturnType<typeof loadSeedSnapshot>>): Promise<RowFailure[]> {
  const failures = new Map<string, string>();

  for (const row of snapshot.rows) {
    // Fail-closed: any explicit citation_failed row blocks export.
    if (row.status === "citation_failed") {
      const reason = extractReasonCode((row as { provenance_json?: unknown }).provenance_json) ?? "VALIDATION_ERROR";
      failures.set(row.question_id, reason);
      continue;
    }

    // Deterministic-only integrity checks: no entailment in 0001.
    const citations = (row.citation_ids ?? [])
      .map((cid) => {
        const cit = snapshot.citations?.[cid];
        if (!cit) return null;
        return {
          document_id: cit.document_filename,
          page_number: cit.page_number,
          snippet: cit.snippet,
          snippet_hash: cit.snippet_hash,
          polygons: cit.polygons,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    // Missing citations referenced by id is an invariant failure; treat it as fail-closed.
    if (citations.length !== (row.citation_ids ?? []).length) {
      failures.set(row.question_id, "VALIDATION_ERROR");
      continue;
    }

    const res = await verifyRow(
      {
        case_id: snapshot.meta.pack_id,
        question_id: row.question_id,
        question: row.question,
        answer: row.answer,
        citations,
      },
      { mode: "deterministic-only" },
    );

    if (res.verdict === "fail") failures.set(row.question_id, res.reason_code);
  }

  return Array.from(failures.entries()).map(([question_id, reason_code]) => ({ question_id, reason_code }));
}

export async function POST(req: Request): Promise<Response> {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body." }), {
      status: 400,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const packId = parsed.data.folder_id;
  const runId = parsed.data.run_id;
  const kind = parsed.data.kind;
  const unsafeOverride = parsed.data.unsafe_override;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Seed snapshot not found." }), {
      status: 404,
    });
  }

  if (typeof snapshot.meta.run_id === "string" && snapshot.meta.run_id.trim() && snapshot.meta.run_id !== runId) {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "run_id did not match snapshot.",
        details: { expected: snapshot.meta.run_id },
      }),
      { status: 409 },
    );
  }

  const failures = await collectRowFailures(snapshot);
  if (failures.length > 0 && !unsafeOverride) {
    return Response.json(
      safeErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${failures.length} row(s) are citation_failed.`,
        details: {
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
      }),
      { status: 409 },
    );
  }

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is demo-only.",
      }),
      { status: 403 },
    );
  }

  const artefactId = newId("art");
  const createdAt = new Date().toISOString();
  const csv = snapshotToCsv(snapshot);

  const filename = unsafeOverride ? `UNSAFE_${kind}.csv` : `${kind}.csv`;

  const storageKey = `folders/${packId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key." }), {
      status: 500,
    });
  }

  const metadataKey = `folders/${packId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metadataKey);
  if (!metaOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid metadata key." }), {
      status: 500,
    });
  }

  await putObject({ storageKey, bytes: Buffer.from(csv, "utf8") });
  await putObject({
    storageKey: metadataKey,
    bytes: Buffer.from(
      JSON.stringify(
        {
          id: artefactId,
          type: "csv",
          kind,
          filename,
          storage_key: storageKey,
          source_run_id: runId,
          created_at: createdAt,
          unsafe_override: unsafeOverride,
          blocked: failures.length > 0,
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
        null,
        2,
      ) + "\n",
      "utf8",
    ),
  });

  const downloadUrl = `/export/csv/download?${new URLSearchParams({
    folder_id: packId,
    artefact_id: artefactId,
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
        created_at: createdAt,
        download_url: downloadUrl,
      },
    },
    { status: 200 },
  );
}
