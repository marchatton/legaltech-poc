import "server-only";

import { chunkPageCharWindowV0 } from "@legaltech-poc/core";
import { hashSnippet } from "@legaltech-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";
import { primeDocumentChunkEmbeddings } from "../retrieval/embedChunks.server";
import { safeErrMessage } from "../safeErrMessage";

type PdfJsTextItem = { str?: string };

type PdfJsPage = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
};

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
  destroy?: () => Promise<void>;
};

type PdfJsLoadingTask = {
  promise: Promise<PdfJsDoc>;
  destroy?: () => Promise<void>;
};

type PdfJsModule = {
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (opts: { data: Uint8Array }) => PdfJsLoadingTask;
};

// Defensive caps: this ingest path runs in-process and writes extracted text into Postgres.
const MAX_PAGES = 200;
const MAX_TEXT_CHARS_PER_PAGE = 50_000;
const MAX_TOTAL_TEXT_CHARS = 2_000_000;

// SEC-006 stopgap: bound in-process pdf.js work so worst-case PDFs can't tie up a worker indefinitely.
const DEFAULT_PDF_INGEST_WALL_CLOCK_TIMEOUT_MS = 60_000;

class PdfIngestTimeoutError extends Error {
  constructor() {
    super("PDF_INGEST_TIMEOUT");
    this.name = "PdfIngestTimeoutError";
  }
}

function pdfIngestWallClockTimeoutMs(): number {
  const raw = process.env.ORBITAL_PDF_INGEST_TIMEOUT_MS?.trim();
  if (!raw) return DEFAULT_PDF_INGEST_WALL_CLOCK_TIMEOUT_MS;
  const ms = Number(raw);
  if (!Number.isFinite(ms) || ms <= 0) return DEFAULT_PDF_INGEST_WALL_CLOCK_TIMEOUT_MS;
  return Math.floor(ms);
}

function throwIfTimedOut(deadlineAtMs: number): void {
  if (Date.now() >= deadlineAtMs) throw new PdfIngestTimeoutError();
}

function isPdfIngestTimeout(err: unknown): err is PdfIngestTimeoutError {
  return err instanceof PdfIngestTimeoutError;
}

async function racePdfWork<T>(args: {
  promise: Promise<T>;
  deadlineAtMs: number;
  onTimeout?: () => void;
}): Promise<T> {
  const remainingMs = args.deadlineAtMs - Date.now();
  if (remainingMs <= 0) {
    args.onTimeout?.();
    // Ensure the losing promise doesn't later raise an unhandled rejection.
    void args.promise.catch(() => {});
    throw new PdfIngestTimeoutError();
  }

  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  try {
    return await Promise.race([
      args.promise,
      new Promise<T>((_resolve, reject) => {
        timeoutId = setTimeout(() => {
          args.onTimeout?.();
          void args.promise.catch(() => {});
          reject(new PdfIngestTimeoutError());
        }, remainingMs);
      }),
    ]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
}

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

  const wallClockTimeoutMs = pdfIngestWallClockTimeoutMs();
  const deadlineAtMs = Date.now() + wallClockTimeoutMs;
  let loadingTask: PdfJsLoadingTask | null = null;
  let pdfForCleanup: PdfJsDoc | null = null;

  async function handleTimeout(): Promise<void> {
    // eslint-disable-next-line no-console
    console.error("document.ingest.timed_out", { document_id: documentId, timeout_ms: wallClockTimeoutMs });
    void Promise.resolve(loadingTask?.destroy?.()).catch(() => {});
    void Promise.resolve(pdfForCleanup?.destroy?.()).catch(() => {});
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_INGEST_TIMEOUT", "PDF ingest timed out."),
    });
  }

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

  let pdf: PdfJsDoc;
  try {
    throwIfTimedOut(deadlineAtMs);
    const pdfjs = await loadPdfjs();
    throwIfTimedOut(deadlineAtMs);

    loadingTask = pdfjs.getDocument({ data: bytes });
    try {
      pdf = await racePdfWork({
        promise: loadingTask.promise,
        deadlineAtMs,
        onTimeout: () => {
          void Promise.resolve(loadingTask?.destroy?.()).catch(() => {});
        },
      });
    } catch (err) {
      if (isPdfIngestTimeout(err)) throw err;

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

    pdfForCleanup = pdf;

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

    throwIfTimedOut(deadlineAtMs);
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
      throwIfTimedOut(deadlineAtMs);
      const page = await racePdfWork({
        promise: pdf.getPage(pageNumber),
        deadlineAtMs,
        onTimeout: () => {
          void Promise.resolve(pdfForCleanup?.destroy?.()).catch(() => {});
        },
      });
      const content = await racePdfWork({
        promise: page.getTextContent(),
        deadlineAtMs,
        onTimeout: () => {
          void Promise.resolve(pdfForCleanup?.destroy?.()).catch(() => {});
        },
      });
      const items = Array.isArray(content.items) ? content.items : [];
      const text = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();

      if (text.length > MAX_TEXT_CHARS_PER_PAGE) {
        await failDocument({
          documentId,
          folderId: doc.folder_id,
          error: safeError(
            "INGEST_PAGE_TEXT_TOO_LARGE",
            `Page ${pageNumber} extracted too much text (${text.length} chars); max per page is ${MAX_TEXT_CHARS_PER_PAGE}.`,
          ),
        });
        return;
      }

      if (totalChars + text.length > MAX_TOTAL_TEXT_CHARS) {
        await failDocument({
          documentId,
          folderId: doc.folder_id,
          error: safeError(
            "INGEST_TOTAL_TEXT_TOO_LARGE",
            `PDF extracted too much text (>${MAX_TOTAL_TEXT_CHARS} chars total).`,
          ),
        });
        return;
      }

      totalChars += text.length;

      const layout_json: LayoutJson = {
        source: "pdfjs",
        schema_version: "layout_v0",
        has_geometry: false,
        item_count: items.length,
      };

      pages.push({ page_number: pageNumber, text, layout_json });
    }

    throwIfTimedOut(deadlineAtMs);
    const avgCharsPerPage = totalChars / pageCount;
    // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
    // 0.60 "ready" threshold; scans with little/no text should remain low.
    const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
    const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";
    const extractionMethod = "pdfjs";

    throwIfTimedOut(deadlineAtMs);
    const folders = await sql<{ latest_index_version: string }[]>`
      SELECT latest_index_version
      FROM folders
      WHERE id = ${doc.folder_id}
      LIMIT 1
    `;
    const indexVersion = folders[0]?.latest_index_version ?? "v1";

    type JsonArg = Parameters<typeof sql.json>[0];

    type ChunkToWrite = {
      chunk_index: number;
      page_start: number | null;
      page_end: number | null;
      text: string;
      metadata_json: JsonArg;
      text_hash: string;
    };

    const chunksToWrite: ChunkToWrite[] = [];

    let chunkIndex = 0;
    for (const p of pages) {
      throwIfTimedOut(deadlineAtMs);
      const pageChunks = chunkPageCharWindowV0({ page_number: p.page_number, text: p.text });
      for (const c of pageChunks) {
        throwIfTimedOut(deadlineAtMs);
        // Defensive: treat empty-text chunks as non-real. Empty docs should get a single doc-level sentinel chunk.
        if (c.text.length === 0) continue;
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

    const wroteSentinel = chunksToWrite.length === 0;
    if (wroteSentinel) {
      chunksToWrite.push({
        chunk_index: 0,
        page_start: null,
        page_end: null,
        text: "",
        metadata_json: { chunker_id: "char_window_v0", sentinel: "no_extracted_text" },
        text_hash: hashSnippet(""),
      });
    }

    try {
      await sql.begin(async (tx) => {
        // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
        const t = tx as unknown as typeof sql;

        throwIfTimedOut(deadlineAtMs);
        await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
        for (const p of pages) {
          throwIfTimedOut(deadlineAtMs);
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

        throwIfTimedOut(deadlineAtMs);
        await t`
          UPDATE documents
          SET ocr_status = 'done',
              extraction_quality = ${extractionQuality},
              metadata_json = COALESCE(metadata_json, '{}'::jsonb) || ${t.json({
                extraction_method: extractionMethod,
                extraction_has_geometry: false,
                extraction_quality_method: extractionQualityMethod,
                extraction_total_chars: totalChars,
              })},
              updated_at = now()
          WHERE id = ${documentId}
        `;

        throwIfTimedOut(deadlineAtMs);
        const hasEmbeddingColumnRows = await t<Array<{ exists: boolean }>>`
          SELECT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_schema = 'public'
              AND table_name = 'chunks'
              AND column_name = 'embedding'
          ) AS exists
        `;
        const hasEmbeddingColumn = hasEmbeddingColumnRows[0]?.exists ?? false;

        // Deterministic, page-bounded chunking suitable for citations.
        // Use UPSERT to make re-ingest idempotent by (document_id, index_version, chunk_index).
        for (const c of chunksToWrite) {
          throwIfTimedOut(deadlineAtMs);
          if (hasEmbeddingColumn) {
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
                text_hash = EXCLUDED.text_hash,
                embedding = CASE
                  WHEN chunks.text_hash <> EXCLUDED.text_hash THEN NULL
                  ELSE chunks.embedding
                END,
                embedded_at = CASE
                  WHEN chunks.text_hash <> EXCLUDED.text_hash THEN NULL
                  ELSE chunks.embedded_at
                END
            `;
            continue;
          }

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
              text_hash = EXCLUDED.text_hash,
              embedded_at = CASE
                WHEN chunks.text_hash <> EXCLUDED.text_hash THEN NULL
                ELSE chunks.embedded_at
              END
          `;
        }

        // If chunk count decreases (caps/tuning/version changes), delete stale tails.
        throwIfTimedOut(deadlineAtMs);
        await t`
          DELETE FROM chunks
          WHERE document_id = ${documentId}
            AND index_version = ${indexVersion}
            AND chunk_index >= ${chunksToWrite.length}
        `;
      });
    } catch (err) {
      if (isPdfIngestTimeout(err)) throw err;

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

    if (wroteSentinel) {
      // eslint-disable-next-line no-console
      console.info("ingest.no_extracted_text_sentinel_written", {
        document_id: documentId,
        index_version: indexVersion,
        page_count: pageCount,
        total_chars: totalChars,
      });
    }

    const semanticPrime = await primeDocumentChunkEmbeddings({ documentId, indexVersion });
    if (semanticPrime.embedded > 0) {
      // eslint-disable-next-line no-console
      console.info("ingest.semantic_prime_document", {
        document_id: documentId,
        index_version: indexVersion,
        attempted: semanticPrime.attempted,
        embedded: semanticPrime.embedded,
      });
    }

    await refreshFolderState(doc.folder_id);
  } catch (err) {
    if (isPdfIngestTimeout(err)) {
      await handleTimeout();
      return;
    }
    throw err;
  } finally {
    void Promise.resolve(loadingTask?.destroy?.()).catch(() => {});
    void Promise.resolve(pdfForCleanup?.destroy?.()).catch(() => {});
  }
}
