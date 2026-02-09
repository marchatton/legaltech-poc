import "server-only";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema } from "@orbital-poc/core";
import type { ListPayloadV0 } from "@orbital-poc/core";
import { z } from "zod";

export const ExportCsvKindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);
export type ExportCsvKind = z.infer<typeof ExportCsvKindSchema>;

const HEADERS_BY_KIND: Record<ExportCsvKind, readonly string[]> = {
  requirements_tracker: [
    "requirement_id",
    "requirement_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
  exceptions_table: [
    "exception_id",
    "exception_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
  survey_issues: [
    "issue_id",
    "issue_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
};

export type CitationForCsv = {
  filename: string;
  page: number;
};

export type SourceRowForCsv = {
  source_question_id: string;
  row_status: string;
  source_answer: string;
  failure_code: string;
  notes: string | null;
};

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function asNonEmptyTrimmedString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  return s;
}

function joinNotes(parts: Array<string | null>): string {
  const nonEmpty = parts.map((p) => asNonEmptyTrimmedString(p)).filter((p): p is string => Boolean(p));
  return nonEmpty.join("\n\n");
}

function splitCompoundId(id: string): Array<string | number> {
  return id
    .split(":")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => (/^\d+$/.test(seg) ? Number(seg) : seg.toLowerCase()));
}

function compareCompoundId(a: string, b: string): number {
  if (a === b) return 0;

  const as = splitCompoundId(a);
  const bs = splitCompoundId(b);
  const n = Math.min(as.length, bs.length);

  for (let i = 0; i < n; i++) {
    const av = as[i];
    const bv = bs[i];

    if (typeof av === "number" && typeof bv === "number") {
      if (av !== bv) return av < bv ? -1 : 1;
      continue;
    }

    if (typeof av === "string" && typeof bv === "string") {
      const cmp = av.localeCompare(bv);
      if (cmp !== 0) return cmp;
      continue;
    }

    // Keep ordering deterministic even when segment types mismatch.
    if (typeof av === "number") return -1;
    if (typeof bv === "number") return 1;
  }

  if (as.length !== bs.length) return as.length < bs.length ? -1 : 1;
  return a.localeCompare(b);
}

function stableUniq<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export function renderCitationColumns(args: {
  citationIds: readonly string[];
  citationById: ReadonlyMap<string, CitationForCsv>;
}): { citations: string; citation_ids: string } {
  const expanded = args.citationIds.map((id) => {
    const cit = args.citationById.get(id);
    if (!cit) {
      throw new Error(`Missing citation: ${id}`);
    }
    return { id, filename: cit.filename, page: cit.page };
  });

  // Sort by (filename asc, page asc, citation_id asc) before rendering.
  expanded.sort((a, b) => {
    const fn = a.filename.localeCompare(b.filename);
    if (fn !== 0) return fn;
    if (a.page !== b.page) return a.page < b.page ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  const uniqFilenamePage = stableUniq(expanded, (c) => `${c.filename}:${c.page}`);
  const citations = uniqFilenamePage.map((c) => `${c.filename}:${c.page}`).join("; ");

  const uniqIds = Array.from(new Set(args.citationIds));
  uniqIds.sort((a, b) => a.localeCompare(b));
  const citation_ids = uniqIds.join("; ");

  return { citations, citation_ids };
}

function assertListPayloadV0(payloadSchemaVersion: string | null, payloadJson: unknown): ListPayloadV0 {
  if (payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(`Unsupported payload_schema_version: ${String(payloadSchemaVersion ?? "null")}`);
  }
  const parsed = ListPayloadV0Schema.safeParse(payloadJson);
  if (!parsed.success) {
    throw new Error(`Invalid list_payload_v0 payload: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function csvFromSourceRow(args: {
  kind: ExportCsvKind;
  sourceRow: SourceRowForCsv;
  payloadSchemaVersion: string | null;
  payloadJson: unknown;
  citationById: ReadonlyMap<string, CitationForCsv>;
}): string {
  const headers = HEADERS_BY_KIND[args.kind];
  if (!headers) throw new Error(`Unsupported kind: ${String(args.kind)}`);

  const payload = assertListPayloadV0(args.payloadSchemaVersion, args.payloadJson);
  if (payload.kind !== args.kind) {
    throw new Error(`Payload kind mismatch: expected ${args.kind}, got ${payload.kind}`);
  }

  type Row = { id: string; citations: string; record: Record<string, string> };
  const rows: Row[] = [];

  for (const item of payload.items) {
    const itemNotes = "notes" in item ? (item.notes ?? null) : null;
    const notes = joinNotes([itemNotes, args.sourceRow.notes]);

    const { citations, citation_ids } = renderCitationColumns({
      citationIds: item.citation_ids,
      citationById: args.citationById,
    });

    if (args.kind === "requirements_tracker") {
      if (item.kind !== "requirements_tracker_item") {
        throw new Error(`Unexpected item.kind for requirements_tracker: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          requirement_id: item.item_id,
          requirement_text: item.requirement,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    if (args.kind === "exceptions_table") {
      if (item.kind !== "exceptions_table_item") {
        throw new Error(`Unexpected item.kind for exceptions_table: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          exception_id: item.item_id,
          exception_text: item.type,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    if (args.kind === "survey_issues") {
      if (item.kind !== "survey_issue_item") {
        throw new Error(`Unexpected item.kind for survey_issues: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          issue_id: item.item_id,
          issue_text: item.description,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    // Exhaustiveness check.
    throw new Error(`Unhandled kind: ${String(args.kind)}`);
  }

  rows.sort((a, b) => {
    const idCmp = compareCompoundId(a.id, b.id);
    if (idCmp !== 0) return idCmp;
    const c = a.citations.localeCompare(b.citations);
    if (c !== 0) return c;
    return 0;
  });

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row.record[h] ?? "")).join(",")),
  ];
  return lines.join("\n") + "\n";
}

export function reasonCodeFromProvenance(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const rec = provenance as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}
