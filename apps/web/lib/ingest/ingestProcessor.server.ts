import "server-only";

import { chunkPageCharWindowV0 } from "@orbital-poc/core";
import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";
import { safeErrMessage } from "../safeErrMessage";

type PdfJsTextItem = { str?: string };

type PdfJsPage = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
};

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};

type PdfJsModule = {
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (opts: { data: Uint8Array }) => { promise: Promise<PdfJsDoc> };
};

// Defensive caps: this ingest path runs in-process and writes extracted text into Postgres.
const MAX_PAGES = 200;
const MAX_TEXT_CHARS_PER_PAGE = 50_000;
const MAX_TOTAL_TEXT_CHARS = 2_000_000;

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let pdfjsConfigured = false;

async function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs") as unknown as Promise<PdfJsModule>;
  }
  const pdfjs = await pdfjsPromise;
  if (!pdfjsConfigured) {
    // Next's server bundler relocates pdf.js files into vendor chunks, breaking
    // the default relative worker import ("./pdf.worker.mjs"). Force a package
    // specifier so Node can resolve it from node_modules at runtime.
    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
    }
    pdfjsConfigured = true;
  }
  return pdfjs;
}

type DocForIngest = {
  id: string;
  folder_id: string;
  storage_key: string | null;
  upload_completed_at: string | null;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
};

type SafeErrorJson = { code: string; message: string };

function safeError(code: string, message: string): SafeErrorJson {
  return { code, message };
}

async function failDocument(args: { documentId: string; folderId: string; error: SafeErrorJson }): Promise<void> {
  await sql`
    UPDATE documents
    SET parse_status = 'failed',
        ocr_status = 'failed',
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.documentId}
  `;
  await refreshFolderState(args.folderId);
}

export async function processDocumentIngest(documentId: string): Promise<void> {
  await ensureSchema();

  const docs = await sql<DocForIngest[]>`
    SELECT id, folder_id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) return;

  // Idempotency: don't restart successful/failed ingests.
  if (doc.parse_status === "parsed" && doc.ocr_status === "done") return;
  if (doc.parse_status === "failed" || doc.ocr_status === "failed") return;

  if (!doc.storage_key) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("MISSING_STORAGE_KEY", "Document is missing storage_key."),
    });
    return;
  }

  if (!doc.upload_completed_at) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_NOT_COMPLETE", "Upload has not completed yet."),
    });
    return;
  }

  // Transition into an in-progress state if needed.
  //
  // This is intentionally idempotent: a worker crash can leave the document stuck
  // in parsing/running. WDK/job retries should be able to resume and reach a
  // terminal (done/failed) state without requiring manual intervention.
  const inProgress = await sql<Array<{ id: string }>>`
    UPDATE documents
    SET parse_status = CASE WHEN parse_status = 'queued' THEN 'parsing' ELSE parse_status END,
        ocr_status = CASE WHEN ocr_status = 'queued' THEN 'running' ELSE ocr_status END,
        error_json = NULL,
        updated_at = now()
    WHERE id = ${documentId}
      AND parse_status <> 'failed'
      AND ocr_status <> 'failed'
      AND NOT (parse_status = 'parsed' AND ocr_status = 'done')
    RETURNING id
  `;
  // Another worker may have completed/failed between the read above and this
  // state transition. Treat as an idempotent no-op.
  if (!inProgress[0]) return;
  await refreshFolderState(doc.folder_id);
  // Yield a tiny window so polling UIs can observe progress states.
  await new Promise((r) => setTimeout(r, 150));

  let bytes: Uint8Array;
  try {
    bytes = await readObject(doc.storage_key);
  } catch {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_MISSING", "Raw PDF not found for storage_key."),
    });
    return;
  }

  const pdfjs = await loadPdfjs();

  let pdf: PdfJsDoc;
  try {
    pdf = await pdfjs.getDocument({ data: bytes }).promise;
  } catch (err) {
    // Server-side only: keep client errors safe, but log detail for debugging.
    // Do not log raw PDF bytes.
    // eslint-disable-next-line no-console
    console.error("pdfjs getDocument failed", {
      documentId,
      message: safeErrMessage(err),
    });
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PARSE_FAILED", "Unable to parse PDF."),
    });
    return;
  }

  const pageCount = typeof pdf.numPages === "number" && Number.isFinite(pdf.numPages) ? pdf.numPages : 0;
  if (pageCount <= 0) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PAGE_COUNT_INVALID", "Parsed PDF had no pages."),
    });
    return;
  }

  if (pageCount > MAX_PAGES) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("INGEST_TOO_MANY_PAGES", `PDF has too many pages (${pageCount}); max is ${MAX_PAGES}.`),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsed',
        page_count = ${pageCount},
        updated_at = now()
    WHERE id = ${documentId}
  `;
  await refreshFolderState(doc.folder_id);

  type LayoutJson = {
    source: "pdfjs";
    schema_version: "layout_v0";
    has_geometry: boolean;
    item_count: number;
  };

  const pages: Array<{ page_number: number; text: string; layout_json: LayoutJson }> = [];
  let totalChars = 0;
  let remainingChars = MAX_TOTAL_TEXT_CHARS;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const rawText = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
    const perPageCapped = rawText.length > MAX_TEXT_CHARS_PER_PAGE ? rawText.slice(0, MAX_TEXT_CHARS_PER_PAGE) : rawText;
    const text = remainingChars <= 0 ? "" : perPageCapped.slice(0, remainingChars);
    remainingChars = Math.max(0, remainingChars - text.length);
    totalChars += text.length;

    const layout_json: LayoutJson = {
      source: "pdfjs",
      schema_version: "layout_v0",
      has_geometry: false,
      item_count: items.length,
    };

    pages.push({ page_number: pageNumber, text, layout_json });
  }

  const avgCharsPerPage = totalChars / pageCount;
  // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
  // 0.60 "ready" threshold; scans with little/no text should remain low.
  const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
  const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";
  const extractionMethod = "pdfjs";

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${doc.folder_id}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

  const chunksToWrite: Array<{
    chunk_index: number;
    page_start: number;
    page_end: number;
    text: string;
    metadata_json: { chunker_id: string; page_number: number; char_start: number; char_end: number };
    text_hash: string;
  }> = [];

  let chunkIndex = 0;
  for (const p of pages) {
    const pageChunks = chunkPageCharWindowV0({ page_number: p.page_number, text: p.text });
    for (const c of pageChunks) {
      const textHash = hashSnippet(c.text);
      chunksToWrite.push({
        chunk_index: chunkIndex,
        page_start: c.page_number,
        page_end: c.page_number,
        text: c.text,
        metadata_json: {
          chunker_id: c.chunker_id,
          page_number: c.page_number,
          char_start: c.char_start,
          char_end: c.char_end,
        },
        text_hash: textHash,
      });
      chunkIndex += 1;
    }
  }

  try {
    await sql.begin(async (tx) => {
      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
      const t = tx as unknown as typeof sql;

      await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
      for (const p of pages) {
        await t`
          INSERT INTO document_pages (id, document_id, page_number, text, layout_json, created_at, updated_at)
          VALUES (
            ${newId("pg")},
            ${documentId},
            ${p.page_number},
            ${p.text},
            ${t.json(p.layout_json)},
            now(),
            now()
          )
        `;
      }

      await t`
        UPDATE documents
        SET ocr_status = 'done',
            extraction_quality = ${extractionQuality},
            metadata_json = metadata_json || ${t.json({
              extraction_method: extractionMethod,
              extraction_has_geometry: false,
              extraction_quality_method: extractionQualityMethod,
            })},
            updated_at = now()
        WHERE id = ${documentId}
      `;

      // Deterministic, page-bounded chunking suitable for citations.
      // Use UPSERT to make re-ingest idempotent by (document_id, index_version, chunk_index).
      for (const c of chunksToWrite) {
        await t`
          INSERT INTO chunks (
            id,
            document_id,
            index_version,
            chunk_index,
            page_start,
            page_end,
            text,
            metadata_json,
            text_hash,
            created_at
          )
          VALUES (
            ${newId("chk")},
            ${documentId},
            ${indexVersion},
            ${c.chunk_index},
            ${c.page_start},
            ${c.page_end},
            ${c.text},
            ${t.json(c.metadata_json)},
            ${c.text_hash},
            now()
          )
          ON CONFLICT (document_id, index_version, chunk_index) DO UPDATE SET
            page_start = EXCLUDED.page_start,
            page_end = EXCLUDED.page_end,
            text = EXCLUDED.text,
            metadata_json = EXCLUDED.metadata_json,
            text_hash = EXCLUDED.text_hash
        `;
      }

      // If chunk count decreases (caps/tuning/version changes), delete stale tails.
      await t`
        DELETE FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
          AND chunk_index >= ${chunksToWrite.length}
      `;
    });
  } catch {
    await sql`
      UPDATE documents
      SET ocr_status = 'failed',
          error_json = ${sql.json(safeError("INGEST_FAILED", "Ingest failed while writing extracted pages."))},
          updated_at = now()
      WHERE id = ${documentId}
    `;
    await refreshFolderState(doc.folder_id);
    return;
  }

  await refreshFolderState(doc.folder_id);
}
