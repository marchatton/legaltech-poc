import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

type MockPdfPage = { page: number; text: string };

const DEFAULT_PDFJS_PAGES: MockPdfPage[] = [
  { page: 1, text: "hello world" },
  { page: 2, text: "second page" },
];

function setPdfjsMockPages(pages: MockPdfPage[]): void {
  (globalThis as unknown as Record<string, unknown>).__pdfjsMockPages = pages;
}

function clearPdfjsMockPages(): void {
  delete (globalThis as unknown as Record<string, unknown>).__pdfjsMockPages;
}

vi.mock("../lib/objectStore.server", () => ({
  readObject: vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46])), // "%PDF" prefix; content unused by mock pdfjs.
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  function getPages(): MockPdfPage[] {
    const value = (globalThis as unknown as Record<string, unknown>).__pdfjsMockPages;
    if (Array.isArray(value)) return value as MockPdfPage[];
    return DEFAULT_PDFJS_PAGES;
  }

  return {
    GlobalWorkerOptions: {},
    getDocument: (_opts: { data: Uint8Array }) => ({
      promise: Promise.resolve({
        get numPages() {
          return getPages().length;
        },
        getPage: async (pageNumber: number) => {
          const p = getPages()[pageNumber - 1];
          if (!p) throw new Error("PAGE_OUT_OF_RANGE");
          return {
            getTextContent: async () => ({ items: [{ str: p.text }] }),
          };
        },
      }),
    }),
  };
});

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("ingest_document step idempotency (wdk)", () => {
  const url = databaseUrl();
  const sql1 = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });
  const prevDbUrl = process.env.DATABASE_URL;

  beforeAll(async () => {
    await ensureAllSchemas(sql1);
    // Ensure server-only modules using the global db.server.ts connect to the same DB.
    process.env.DATABASE_URL = url;
  });

  afterAll(async () => {
    if (typeof prevDbUrl === "string") {
      process.env.DATABASE_URL = prevDbUrl;
    } else {
      delete process.env.DATABASE_URL;
    }
    await sql1.end({ timeout: 2 });
  });

  it("resumes after a crash and does not duplicate document_pages", async () => {
    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;
    const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;

    await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'ingest test', 'empty')`;
    await sql1`
      INSERT INTO documents (
        id,
        folder_id,
        filename,
        mime,
        bytes,
        sha256,
        storage_key,
        upload_completed_at,
        parse_status,
        ocr_status,
        created_at,
        updated_at
      )
      VALUES (
        ${documentId},
        ${folderId},
        'test.pdf',
        'application/pdf',
        1,
        NULL,
        ${storageKey},
        now(),
        'queued',
        'queued',
        now(),
        now()
      )
    `;

    const { startIngestDocumentWorkflow } = await import("../workflows/ingestDocumentWorkflow.server");
    const started = await startIngestDocumentWorkflow({ documentId, traceId, db: sql1 });

    // Simulate a worker crash mid-step.
    await sql1`
      UPDATE run_steps
      SET state = 'running',
          attempt = 1,
          locked_at = ${new Date(0)},
          locked_by = 'crashed-worker'
      WHERE id = ${started.stepId}
    `;
    await sql1`
      UPDATE documents
      SET parse_status = 'parsing',
          ocr_status = 'running',
          updated_at = now()
      WHERE id = ${documentId}
    `;
    // Simulate a retry claim.
    await sql1`
      UPDATE run_steps
      SET state = 'running',
          attempt = 2,
          locked_at = now(),
          locked_by = 'w1',
          updated_at = now()
      WHERE id = ${started.stepId}
    `;
    const stepRows = await sql1<StepRow[]>`
      SELECT
        id,
        run_id,
        step_type,
        state,
        attempt,
        step_key,
        available_at,
        locked_at,
        locked_by,
        input_json,
        output_json,
        trace_id,
        question_id,
        metrics_json,
        error_json,
        created_at,
        updated_at
      FROM run_steps
      WHERE id = ${started.stepId}
      LIMIT 1
    `;
    const step = stepRows[0];
    expect(step).toBeTruthy();

    const { ingestDocumentProcessStep } = await import("../steps/ingestDocumentProcess.step.server");
    await ingestDocumentProcessStep({ step, workerId: "w1", db: sql1 });

    const docRows = await sql1<Array<{ parse_status: string; ocr_status: string }>>`
      SELECT parse_status, ocr_status
      FROM documents
      WHERE id = ${documentId}
      LIMIT 1
    `;
    expect(docRows[0]?.parse_status).toBe("parsed");
    expect(docRows[0]?.ocr_status).toBe("done");

    const runRows = await sql1<Array<{ state: string }>>`
      SELECT state
      FROM runs
      WHERE id = ${started.runId}
      LIMIT 1
    `;
    expect(runRows[0]?.state).toBe("completed");

    const pageCounts = await sql1<Array<{ n: number; distinct_n: number }>>`
      SELECT
        count(*)::int AS n,
        count(DISTINCT page_number)::int AS distinct_n
      FROM document_pages
      WHERE document_id = ${documentId}
    `;
    expect(pageCounts[0]?.n).toBe(2);
    expect(pageCounts[0]?.distinct_n).toBe(2);

    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("writes exactly one sentinel chunk for an empty-text PDF, progresses folder to indexed, and retrieval returns no hits", async () => {
    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;
    const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;

    setPdfjsMockPages([
      { page: 1, text: "" },
      { page: 2, text: "" },
      { page: 3, text: "" },
    ]);

    try {
      await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'ingest empty-text test', 'empty')`;
      await sql1`
        INSERT INTO documents (
          id,
          folder_id,
          filename,
          mime,
          bytes,
          sha256,
          storage_key,
          upload_completed_at,
          parse_status,
          ocr_status,
          created_at,
          updated_at
        )
        VALUES (
          ${documentId},
          ${folderId},
          'empty.pdf',
          'application/pdf',
          1,
          NULL,
          ${storageKey},
          now(),
          'queued',
          'queued',
          now(),
          now()
        )
      `;

      const { startIngestDocumentWorkflow } = await import("../workflows/ingestDocumentWorkflow.server");
      const started = await startIngestDocumentWorkflow({ documentId, traceId, db: sql1 });

      // Simulate a worker claim.
      await sql1`
        UPDATE run_steps
        SET state = 'running',
            attempt = 1,
            locked_at = now(),
            locked_by = 'w1',
            updated_at = now()
        WHERE id = ${started.stepId}
      `;

      const stepRows = await sql1<StepRow[]>`
        SELECT
          id,
          run_id,
          step_type,
          state,
          attempt,
          step_key,
          available_at,
          locked_at,
          locked_by,
          input_json,
          output_json,
          trace_id,
          question_id,
          metrics_json,
          error_json,
          created_at,
          updated_at
        FROM run_steps
        WHERE id = ${started.stepId}
        LIMIT 1
      `;
      const step = stepRows[0];
      expect(step).toBeTruthy();

      const { ingestDocumentProcessStep } = await import("../steps/ingestDocumentProcess.step.server");
      await ingestDocumentProcessStep({ step, workerId: "w1", db: sql1 });

      const docRows = await sql1<
        Array<{ page_count: number | null; parse_status: string; ocr_status: string; extraction_quality: number | null; metadata_json: any }>
      >`
        SELECT page_count, parse_status, ocr_status, extraction_quality, metadata_json
        FROM documents
        WHERE id = ${documentId}
        LIMIT 1
      `;
      const doc = docRows[0];
      expect(doc?.parse_status).toBe("parsed");
      expect(doc?.ocr_status).toBe("done");
      expect(doc?.page_count).toBe(3);
      expect(doc?.extraction_quality ?? 1).toBeLessThan(0.6);
      expect(doc?.metadata_json?.extraction_total_chars).toBe(0);

      const pageCounts = await sql1<Array<{ n: number; distinct_n: number }>>`
        SELECT
          count(*)::int AS n,
          count(DISTINCT page_number)::int AS distinct_n
        FROM document_pages
        WHERE document_id = ${documentId}
      `;
      expect(pageCounts[0]?.n).toBe(3);
      expect(pageCounts[0]?.distinct_n).toBe(3);

      const folderRows = await sql1<Array<{ latest_index_version: string; state: string }>>`
        SELECT latest_index_version, state
        FROM folders
        WHERE id = ${folderId}
        LIMIT 1
      `;
      const folder = folderRows[0];
      expect(folder?.latest_index_version).toBeTruthy();
      expect(folder?.state).toBe("indexed");

      const indexVersion = folder?.latest_index_version ?? "v1";
      const chunkRows = await sql1<
        Array<{
          id: string;
          chunk_index: number;
          page_start: number | null;
          page_end: number | null;
          text: string;
          metadata_json: any;
          embedded_at: string | null;
        }>
      >`
        SELECT id, chunk_index, page_start, page_end, text, metadata_json, embedded_at
        FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
        ORDER BY chunk_index ASC
      `;
      expect(chunkRows.length).toBe(1);
      expect(chunkRows[0]?.chunk_index).toBe(0);
      expect(chunkRows[0]?.page_start).toBeNull();
      expect(chunkRows[0]?.page_end).toBeNull();
      expect(chunkRows[0]?.text).toBe("");
      expect(chunkRows[0]?.metadata_json?.sentinel).toBe("no_extracted_text");
      expect(chunkRows[0]?.embedded_at).toBeNull();

      const sentinelChunkId = chunkRows[0]!.id;

      const { hybridSearch } = await import("../lib/retrieval/types");
      const hits = await hybridSearch({
        folderId,
        indexVersion,
        queryText: "non-empty query",
        // CI-safe: do not require embeddings provider configuration.
        opts: { kLex: 20, kSem: 0, kFinal: 10 },
      });
      expect(hits).toEqual([]);
      expect(hits.some((h) => h.chunk_id === sentinelChunkId)).toBe(false);
    } finally {
      clearPdfjsMockPages();
      await sql1`DELETE FROM folders WHERE id = ${folderId}`;
    }
  }, 20_000);
});
