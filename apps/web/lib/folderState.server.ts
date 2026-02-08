import "server-only";

import { ensureSchema, sql } from "./db.server";

export type FolderState = "empty" | "ingesting" | "indexed" | "ready" | "failed";

type DocRow = {
  id: string;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
  page_count: number | null;
  extraction_quality: number | null;
  upload_completed_at: string | null;
};

function isUploaded(doc: DocRow): boolean {
  return !!doc.upload_completed_at;
}

export async function deriveFolderState(folderId: string): Promise<FolderState> {
  await ensureSchema();

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) throw new Error("FOLDER_NOT_FOUND");

  const docs = await sql<DocRow[]>`
    SELECT id, parse_status, ocr_status, page_count, extraction_quality, upload_completed_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  const uploaded = docs.filter(isUploaded);
  if (uploaded.length === 0) return "empty";

  if (uploaded.some((d) => d.parse_status === "failed" || d.ocr_status === "failed")) return "failed";

  const allTerminalSuccess = uploaded.every((d) => d.parse_status === "parsed" && d.ocr_status === "done");
  if (!allTerminalSuccess) return "ingesting";

  // All docs ingested; ensure chunks exist for the latest index version.
  const docIds = uploaded.map((d) => d.id);
  const chunks = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM chunks
    WHERE index_version = ${folder.latest_index_version}
      AND document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const chunked = new Map(chunks.map((r) => [r.document_id, r.n]));
  if (docIds.some((id) => (chunked.get(id) ?? 0) <= 0)) return "ingesting";

  // Health checks for "ready".
  const meetsQuality = uploaded.every((d) => (d.extraction_quality ?? 0) >= 0.6);
  if (!meetsQuality) return "indexed";

  const pageCounts = new Map(uploaded.map((d) => [d.id, d.page_count ?? null]));
  if ([...pageCounts.values()].some((n) => typeof n !== "number" || n <= 0)) return "indexed";

  const pageRows = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM document_pages
    WHERE document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const pages = new Map(pageRows.map((r) => [r.document_id, r.n]));
  const pagesMatch = docIds.every((id) => {
    const expected = pageCounts.get(id);
    if (typeof expected !== "number" || expected <= 0) return false;
    return (pages.get(id) ?? 0) === expected;
  });

  return pagesMatch ? "ready" : "indexed";
}

export async function refreshFolderState(folderId: string): Promise<FolderState> {
  const state = await deriveFolderState(folderId);
  await sql`
    UPDATE folders
    SET state = ${state}, updated_at = now()
    WHERE id = ${folderId}
  `;
  return state;
}
