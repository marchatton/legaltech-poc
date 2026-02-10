import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { beforeAll, afterAll, describe, expect, it, vi } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

vi.mock("../lib/objectStore.server", () => ({
  readObject: vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46])), // "%PDF" prefix; content unused by mock pdfjs.
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => {
  const pages = [
    { page: 1, text: "hello world" },
    { page: 2, text: "second page" },
  ];

  return {
    GlobalWorkerOptions: {},
    getDocument: (_opts: { data: Uint8Array }) => ({
      promise: Promise.resolve({
        numPages: pages.length,
        getPage: async (pageNumber: number) => {
          const p = pages[pageNumber - 1];
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

  beforeAll(async () => {
    await ensureAllSchemas(sql1);
  });

  afterAll(async () => {
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
});
