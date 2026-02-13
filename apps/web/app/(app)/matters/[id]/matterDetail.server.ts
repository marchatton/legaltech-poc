import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";
import { type DocumentOcrStatus, type DocumentParseStatus } from "../../../../lib/documentSetup";

export type FolderRow = {
  id: string;
  name: string;
  state: string;
  latest_index_version: string;
  jurisdiction_state: string | null;
  created_at: Date;
  updated_at: Date;
};

export type DocRow = {
  id: string;
  filename: string;
  storage_key: string | null;
  upload_completed_at: Date | null;
  parse_status: DocumentParseStatus;
  ocr_status: DocumentOcrStatus;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
  folder_id: string;
};

export type RunSummaryRow = {
  id: string;
  state: string;
  agent_bundle_version: string | null;
  questions_total: number;
  questions_done: number;
  error_json: unknown | null;
  trace_id: string | null;
  created_at: Date;
  updated_at: Date;
  started_at: Date | null;
};

type RunSelectorDbRow = {
  id: string;
  state: string;
  created_at: Date;
  updated_at: Date;
};

export type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  updated_at: Date;
};

export type ReportRowWithCounts = ReportRow & {
  citation_count: number;
  citation_ids: string[];
};

export async function ensureDbSchema() {
  await ensureSchema();
}

export async function fetchFolder(folderId: string): Promise<FolderRow | null> {
  const folders = await sql<FolderRow[]>`
    SELECT id, name, state, latest_index_version, jurisdiction_state, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  return folders[0] ?? null;
}

export async function fetchDocuments(folderId: string): Promise<DocRow[]> {
  return sql<DocRow[]>`
    SELECT id, folder_id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;
}

export async function fetchLatestRun(folderId: string): Promise<RunSummaryRow | null> {
  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function fetchRunOptions(folderId: string): Promise<Array<{ id: string; state: string; created_at: Date; updated_at: Date }>> {
  return sql<RunSelectorDbRow[]>`
    SELECT id, state, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 25
  `;
}

export async function fetchRequestedRun(runId: string, folderId: string): Promise<RunSummaryRow | null> {
  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
    FROM runs
    WHERE id = ${runId}
      AND folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function fetchCompletedFallbackRun(folderId: string): Promise<RunSummaryRow | null> {
  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, agent_bundle_version, questions_total, questions_done, error_json, trace_id, created_at, updated_at, started_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
      AND state = ${"completed"}
    ORDER BY created_at DESC, updated_at DESC, id DESC
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function fetchReportRows(runId: string): Promise<ReportRow[]> {
  return sql<ReportRow[]>`
    SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, updated_at
    FROM report_rows
    WHERE run_id = ${runId}
    ORDER BY created_at ASC, question_id ASC
  `;
}

export async function fetchCitationIdsByRow(reportRowIds: string[]): Promise<Map<string, string[]>> {
  const citations = reportRowIds.length
    ? await sql<Array<{ report_row_id: string; citation_id: string }>>`
        SELECT report_row_id, id AS citation_id
        FROM citations
        WHERE report_row_id = ANY(${reportRowIds})
        ORDER BY report_row_id ASC, id ASC
      `
    : [];
  const map = new Map<string, string[]>();
  for (const item of citations) {
    const existing = map.get(item.report_row_id);
    if (existing) existing.push(item.citation_id);
    else map.set(item.report_row_id, [item.citation_id]);
  }
  return map;
}

export function renderDocUrl(doc: DocRow): string | null {
  if (!doc.storage_key || !doc.upload_completed_at) return null;
  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) return null;

  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  return `/documents/${encodeURIComponent(doc.id)}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;
}
