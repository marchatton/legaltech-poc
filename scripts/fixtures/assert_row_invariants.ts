import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type InvariantError = {
  kind: string;
  question_id?: string;
  message: string;
  details?: unknown;
};

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance) return null;
  if (!isRecord(provenance)) return null;

  const direct = provenance.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const verify = provenance.verify;
  if (isRecord(verify) && typeof verify.reason_code === "string" && verify.reason_code.trim()) return verify.reason_code.trim();

  const v = provenance.verification;
  if (isRecord(v) && typeof v.reason_code === "string" && v.reason_code.trim()) return v.reason_code.trim();

  return null;
}

function hasChecklist(row: { notes?: string | null; provenance_json?: unknown }): boolean {
  if (typeof row.notes === "string" && row.notes.trim().length > 0) return true;
  const prov = row.provenance_json;
  if (!prov || !isRecord(prov)) return false;

  const checklist = prov.checklist;
  if (Array.isArray(checklist) && checklist.some((x) => typeof x === "string" && x.trim().length > 0)) return true;

  const missing = prov.missing_docs_checklist;
  if (Array.isArray(missing) && missing.some((x) => typeof x === "string" && x.trim().length > 0)) return true;

  return false;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = resolve(requireStringArg(args, "snapshot"));
  const outPath = getStringArg(args, "out") ? resolve(getStringArg(args, "out")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);

  const errors: InvariantError[] = [];

  // Unique question_id
  const seen = new Set<string>();
  for (const row of snapshot.rows) {
    if (!row || typeof row !== "object") {
      errors.push({ kind: "row_invalid", message: "Row must be an object", details: row });
      continue;
    }
    const qid = (row as any).question_id;
    if (typeof qid !== "string" || !qid.trim()) {
      errors.push({ kind: "row_invalid", message: "Row.question_id must be a non-empty string", details: row });
      continue;
    }
    if (seen.has(qid)) errors.push({ kind: "duplicate_question_id", question_id: qid, message: "Duplicate question_id in snapshot" });
    seen.add(qid);
  }

  const allowedStatuses = new Set(["needs_review", "reviewed", "missing_input", "citation_failed"]);
  const strictReasonCodes = new Set([
    // Row-level taxonomy (docs/03-architecture/60_observability_and_evals.md)
    "VALIDATION_ERROR",
    "NO_CITATIONS",
    "MISSING_INPUT_INVARIANT",
    "CITATION_MISMATCH",
    "NO_ANCHORS_FILE",
    "ANCHOR_NOT_FOUND",
  ]);
  const enforceStrictReasonCodes = Boolean(args["strict-reason-codes"]);

  for (const row of snapshot.rows) {
    const qid = row.question_id;
    if (!allowedStatuses.has(row.status)) {
      errors.push({
        kind: "status_invalid",
        question_id: qid,
        message: `Invalid row status: ${String(row.status)}`,
        details: { status: row.status },
      });
    }

    if (!Array.isArray(row.citation_ids) || row.citation_ids.some((x) => typeof x !== "string")) {
      errors.push({
        kind: "citation_ids_invalid",
        question_id: qid,
        message: "Row.citation_ids must be a string[]",
        details: { citation_ids: row.citation_ids },
      });
    }

    if ((row.status === "needs_review" || row.status === "reviewed") && row.citation_ids.length < 1) {
      errors.push({
        kind: "missing_citations",
        question_id: qid,
        message: "needs_review|reviewed rows must have >= 1 locked citation_id",
      });
    }

    if (row.status === "missing_input") {
      if (row.answer !== "Not found in provided documents.") {
        errors.push({
          kind: "missing_input_answer_mismatch",
          question_id: qid,
          message: "missing_input rows must use exact answer string",
          details: { answer: row.answer },
        });
      }
      if (row.citation_ids.length !== 0) {
        errors.push({
          kind: "missing_input_has_citations",
          question_id: qid,
          message: "missing_input rows must have zero citations",
          details: { citation_ids: row.citation_ids },
        });
      }
      if (!hasChecklist(row)) {
        errors.push({
          kind: "missing_input_missing_checklist",
          question_id: qid,
          message: "missing_input rows must include an actionable checklist (notes or provenance_json.checklist[])",
        });
      }
    }

    if (row.status === "citation_failed") {
      const reasonCode = extractReasonCode(row.provenance_json);
      if (!reasonCode) {
        errors.push({
          kind: "citation_failed_missing_reason_code",
          question_id: qid,
          message: "citation_failed rows must include a safe reason_code in provenance",
        });
      } else if (!/^[A-Z][A-Z0-9_]+$/.test(reasonCode)) {
        errors.push({
          kind: "citation_failed_invalid_reason_code",
          question_id: qid,
          message: `Invalid reason_code format: ${reasonCode}`,
          details: { reason_code: reasonCode },
        });
      } else if (enforceStrictReasonCodes && !strictReasonCodes.has(reasonCode)) {
        errors.push({
          kind: "citation_failed_unknown_reason_code",
          question_id: qid,
          message: `Unknown reason_code (strict mode): ${reasonCode}`,
          details: { reason_code: reasonCode, allowed: Array.from(strictReasonCodes) },
        });
      }
    }

    const hasSchema = row.payload_schema_version !== undefined && row.payload_schema_version !== null && row.payload_schema_version !== "";
    const hasPayload = row.payload_json !== undefined && row.payload_json !== null;
    if (hasSchema !== hasPayload) {
      errors.push({
        kind: "payload_fields_inconsistent",
        question_id: qid,
        message: "payload_schema_version and payload_json must be both present or both absent",
        details: { payload_schema_version: row.payload_schema_version, payload_json_present: hasPayload },
      });
    }
  }

  const result = {
    pass: errors.length === 0,
    snapshot_path: snapshotPath,
    pack_id: snapshot.meta.pack_id,
    error_count: errors.length,
    errors,
  };

  if (outPath) {
    await writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");
  }

  // Human summary
  if (result.pass) {
    process.stdout.write(`PASS row invariants (${snapshot.meta.pack_id})\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL row invariants (${snapshot.meta.pack_id}) - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 20)) {
    process.stdout.write(`- ${e.question_id ?? "(no question_id)"}: ${e.kind}: ${e.message}\n`);
  }
  if (errors.length > 20) process.stdout.write(`(showing first 20)\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});
