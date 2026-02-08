import "server-only";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";

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

const queue: string[] = [];
const running = new Set<string>();
let draining = false;

export function enqueueDocumentIngest(documentId: string): void {
  if (running.has(documentId)) return;
  if (queue.includes(documentId)) return;
  queue.push(documentId);
  void drain();
}

async function drain(): Promise<void> {
  if (draining) return;
  draining = true;
  try {
    while (queue.length) {
      const next = queue.shift();
      if (!next) continue;
      if (running.has(next)) continue;
      running.add(next);
      try {
        await ingestOne(next);
      } finally {
        running.delete(next);
      }
    }
  } finally {
    draining = false;
  }
}

type SafeErrorJson = { code: string; message: string };

function safeError(code: string, message: string): SafeErrorJson {
  return { code, message };
}

async function failDocument(args: {
  documentId: string;
  folderId: string;
  error: SafeErrorJson;
}): Promise<void> {
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

async function ingestOne(documentId: string): Promise<void> {
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

  await sql`
    UPDATE documents
    SET parse_status = 'parsing',
        ocr_status = 'running',
        error_json = NULL,
        updated_at = now()
    WHERE id = ${documentId}
      AND parse_status = 'queued'
      AND ocr_status = 'queued'
  `;
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
      message: err instanceof Error ? err.message : String(err),
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

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const text = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
    totalChars += text.length;
    const layout_json: LayoutJson = {
      source: "pdfjs",
      schema_version: "layout_v0",
      has_geometry: false,
      item_count: items.length,
    };

    pages.push({
      page_number: pageNumber,
      text,
      layout_json,
    });
  }

  const avgCharsPerPage = totalChars / pageCount;
  // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
  // 0.60 "ready" threshold; scans with little/no text should remain low.
  const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
  const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${doc.folder_id}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

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
            metadata_json = jsonb_set(metadata_json, '{extraction_quality_method}', to_jsonb(${extractionQualityMethod}::text), true),
            updated_at = now()
        WHERE id = ${documentId}
      `;

      await t`
        DELETE FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
      `;

      // Minimal chunking: one chunk per page.
      for (let i = 0; i < pages.length; i++) {
        const p = pages[i]!;
        const textHash = hashSnippet(p.text);
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
            ${i},
            ${p.page_number},
            ${p.page_number},
            ${p.text},
            ${t.json({ page_number: p.page_number })},
            ${textHash},
            now()
          )
        `;
      }
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
