import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { startIngestDocumentWorkflow } from "../workflows/ingestDocumentWorkflow.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

describe("ingest_document workflow (wdk)", () => {
  const url = databaseUrl();
  const sql1 = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(sql1);
  });

  afterAll(async () => {
    await sql1.end({ timeout: 2 });
  });

  it("creates an ingest_document run and queues the ingest step", async () => {
    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;

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
        NULL,
        now(),
        'queued',
        'queued',
        now(),
        now()
      )
    `;

    const started = await startIngestDocumentWorkflow({ documentId, traceId, db: sql1 });

    const runs = await sql1<
      Array<{ id: string; folder_id: string; type: string; state: string; trace_id: string | null; idempotency_key: string | null }>
    >`
      SELECT id, folder_id, type, state, trace_id, idempotency_key
      FROM runs
      WHERE id = ${started.runId}
      LIMIT 1
    `;
    const run = runs[0];
    expect(run).toBeTruthy();
    expect(run?.folder_id).toBe(folderId);
    expect(run?.type).toBe("ingest_document");
    expect(run?.state).toBe("running");
    expect(run?.trace_id).toBe(traceId);
    expect(run?.idempotency_key).toBe(`ingest_document:${documentId}`);

    const steps = await sql1<Array<{ id: string; run_id: string; step_type: string; state: string; step_key: string; input_json: any }>>`
      SELECT id, run_id, step_type, state, step_key, input_json
      FROM run_steps
      WHERE id = ${started.stepId}
      LIMIT 1
    `;
    const step = steps[0];
    expect(step).toBeTruthy();
    expect(step?.run_id).toBe(started.runId);
    expect(step?.step_type).toBe("ingest_document.process");
    expect(step?.state).toBe("queued");
    expect(step?.step_key).toBe(`ingest_document:${documentId}:process`);
    expect(String(step?.input_json?.document_id ?? "")).toBe(documentId);
    expect(String(step?.input_json?.run_id ?? "")).toBe(started.runId);

    const jobs = await sql1<Array<{ id: string }>>`
      SELECT id
      FROM jobs
      WHERE type = 'ingest_document'
        AND job_key = ${`document:${documentId}`}
      LIMIT 1
    `;
    expect(jobs[0]).toBeFalsy();

    await sql1`DELETE FROM jobs WHERE job_key = ${`document:${documentId}`}`;
    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });

  it("is idempotent: schedules a deterministic step_key per document ingest execution", async () => {
    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const traceId = `trc_${randomUUID()}`;

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
        NULL,
        now(),
        'queued',
        'queued',
        now(),
        now()
      )
    `;

    const a = await startIngestDocumentWorkflow({ documentId, traceId, db: sql1 });
    const b = await startIngestDocumentWorkflow({ documentId, traceId, db: sql1 });

    expect(b.runId).toBe(a.runId);
    expect(b.stepId).toBe(a.stepId);

    const stepRows = await sql1<Array<{ id: string; run_id: string; step_key: string }>>`
      SELECT id, run_id, step_key
      FROM run_steps
      WHERE run_id = ${a.runId}
        AND step_key = ${`ingest_document:${documentId}:process`}
    `;
    expect(stepRows.length).toBe(1);
    expect(stepRows[0]?.id).toBe(a.stepId);

    await sql1`DELETE FROM folders WHERE id = ${folderId}`;
  });
});
