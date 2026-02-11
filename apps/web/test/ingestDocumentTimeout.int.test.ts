import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import type { StepRow } from "../lib/wdk/stepQueue.server";

vi.mock("../lib/objectStore.server", () => ({
  readObject: vi.fn(async () => new Uint8Array([0x25, 0x50, 0x44, 0x46])), // "%PDF" prefix; content unused by mock pdfjs.
}));

vi.mock("pdfjs-dist/legacy/build/pdf.mjs", () => ({
  GlobalWorkerOptions: {},
  getDocument: (_opts: { data: Uint8Array }) => ({
    promise: new Promise(() => {}), // Never resolves; forces timeout.
    destroy: vi.fn(async () => {}),
  }),
}));

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("ingest_document wall-clock timeout (wdk)", () => {
  const url = databaseUrl();
  const sql1 = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });
  const ORIGINAL_TIMEOUT = process.env.ORBITAL_PDF_INGEST_TIMEOUT_MS;

  beforeAll(async () => {
    await ensureAllSchemas(sql1);
  });

  afterAll(async () => {
    if (ORIGINAL_TIMEOUT === undefined) delete process.env.ORBITAL_PDF_INGEST_TIMEOUT_MS;
    else process.env.ORBITAL_PDF_INGEST_TIMEOUT_MS = ORIGINAL_TIMEOUT;
    await sql1.end({ timeout: 2 });
  });

  it("fails closed with a safe error on timeout", async () => {
    process.env.ORBITAL_PDF_INGEST_TIMEOUT_MS = "25";

    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;
    const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;

    await sql1`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'ingest timeout test', 'empty')`;
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
    await ingestDocumentProcessStep({ step, workerId: "w-timeout", db: sql1 });

    const docRows = await sql1<Array<{ parse_status: string; ocr_status: string; error_json: any | null }>>`
      SELECT parse_status, ocr_status, error_json
      FROM documents
      WHERE id = ${documentId}
      LIMIT 1
    `;
    expect(docRows[0]?.parse_status).toBe("failed");
    expect(docRows[0]?.ocr_status).toBe("failed");
    expect(docRows[0]?.error_json).toEqual({ code: "PDF_INGEST_TIMEOUT", message: "PDF ingest timed out." });

    const runRows = await sql1<Array<{ state: string; error_json: any | null }>>`
      SELECT state, error_json
      FROM runs
      WHERE id = ${started.runId}
      LIMIT 1
    `;
    expect(runRows[0]?.state).toBe("failed");
    expect(runRows[0]?.error_json).toEqual({ code: "PDF_INGEST_TIMEOUT", message: "PDF ingest timed out." });

    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });
});

