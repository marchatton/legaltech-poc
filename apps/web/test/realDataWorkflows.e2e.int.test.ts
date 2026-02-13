import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { hashSnippet } from "@orbital-poc/core/citations/snippet";

import { POST as POST_DEMO_LOAD_PACK } from "../app/(api)/demo/load-pack/route";
import { POST as POST_EXPORT_CSV } from "../app/(api)/export/csv/route";
import { POST as POST_FOLDERS } from "../app/(api)/folders/route";
import { POST as POST_FOLDER_DOCUMENTS, GET as GET_FOLDER_DOCUMENTS } from "../app/(api)/folders/[id]/documents/route";
import { GET as GET_FOLDER } from "../app/(api)/folders/[id]/route";
import { GET as GET_REPORT } from "../app/(api)/folders/[id]/report/route";
import { POST as POST_RUNS } from "../app/(api)/folders/[id]/runs/route";
import { GET as GET_ARTEFACT_DOWNLOAD } from "../app/(api)/artefacts/[id]/download/route";
import { GET as GET_CITATION } from "../app/(api)/citations/[id]/route";
import { POST as POST_DOCUMENT_COMPLETE } from "../app/(api)/documents/[id]/complete/route";
import { GET as GET_DOCUMENT_PDF } from "../app/(api)/documents/[id]/pdf/route";
import { GET as GET_DOCUMENT_RENDER } from "../app/(api)/documents/[id]/render/route";
import { PUT as PUT_DOCUMENT_UPLOAD } from "../app/(api)/documents/[id]/upload/route";
import { GET as GET_RUN } from "../app/(api)/runs/[id]/route";
import { GET as GET_ARTEFACTS } from "../app/(api)/folders/[id]/artefacts/route";
import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { drainWdkStepsOnce } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function hasSignedDownloadLink(payload: unknown): boolean {
  if (payload === null || payload === undefined) return false;
  return /\/artefacts\/[^"\s]+\/download\?/.test(JSON.stringify(payload));
}

function resolvePackPdfPath(filename: string): string {
  const candidates = [
    path.resolve(process.cwd(), "../../docs/08-example-data/pack_01_clean/docs", filename),
    path.resolve(process.cwd(), "docs/08-example-data/pack_01_clean/docs", filename),
  ];
  for (const candidate of candidates) {
    try {
      const stat = fsSync.statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }
  throw new Error(`PACK_PDF_NOT_FOUND:${filename}`);
}

type CreateFolderResponse = {
  folder: {
    id: string;
    name: string;
  };
};

type DemoLoadPackResponse = {
  folder: {
    id: string;
    name: string;
  };
};

type InitUploadResponse = {
  document: {
    id: string;
  };
  upload: {
    storage_key: string;
    url: string;
    method: "PUT";
    headers: Record<string, string>;
  };
};

type DocumentsResponse = {
  documents: Array<{
    id: string;
    parse_status: string;
    ocr_status: string;
    status: string;
    error_json: unknown | null;
  }>;
};

type StartRunResponse = {
  run: {
    id: string;
    state: string;
    question_set_version: string;
  };
};

type RunResponse = {
  run: {
    id: string;
    state: string;
  };
};

type ReportResponse = {
  run: {
    id: string;
  };
  rows: Array<{
    id: string;
    question_id: string;
    status: string;
    payload_schema_version: string | null;
  }>;
};

type CitationResponse = {
  citation: {
    id: string;
    document_id: string;
    page_number: number;
    snippet: string;
    snippet_hash: string;
  };
};

type RenderResponse = {
  document_id: string;
  render_url: string;
};

type ExportCsvResponse = {
  artefact: {
    id: string;
    download_url: string;
  };
};

type ArtefactsResponse = {
  artefacts: Array<{
    id: string;
  }>;
};

type SafeErrorResponse = {
  error: {
    code: string;
    message?: string;
    details?: {
      reason_codes?: string[];
      [key: string]: unknown;
    };
  };
  artefact?: unknown;
};

describe("real-data backend e2e workflows (docs/08-example-data)", () => {
  const url = databaseUrl();
  const db = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  const env = process.env as Record<string, string | undefined>;
  const originalEnv = {
    NODE_ENV: env.NODE_ENV,
    ORBITAL_MODE: env.ORBITAL_MODE,
    ALLOW_DEV_OBJECT_STORE_SECRET: env.ALLOW_DEV_OBJECT_STORE_SECRET,
    FEATURE_CITATIONS_API: env.FEATURE_CITATIONS_API,
    DEMO_MODE: env.DEMO_MODE,
    ALLOW_UNSAFE_EXPORTS: env.ALLOW_UNSAFE_EXPORTS,
    ORBITAL_ADMIN_TOKEN: env.ORBITAL_ADMIN_TOKEN,
  };

  beforeAll(async () => {
    env.NODE_ENV = "development";
    delete env.ORBITAL_MODE;
    env.ALLOW_DEV_OBJECT_STORE_SECRET = "1";
    env.FEATURE_CITATIONS_API = "1";
    delete env.DEMO_MODE;
    delete env.ALLOW_UNSAFE_EXPORTS;
    delete env.ORBITAL_ADMIN_TOKEN;
    await ensureAllSchemas(db);
  }, 30_000);

  afterAll(async () => {
    if (originalEnv.NODE_ENV === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = originalEnv.NODE_ENV;
    if (originalEnv.ORBITAL_MODE === undefined) delete env.ORBITAL_MODE;
    else env.ORBITAL_MODE = originalEnv.ORBITAL_MODE;
    if (originalEnv.ALLOW_DEV_OBJECT_STORE_SECRET === undefined) delete env.ALLOW_DEV_OBJECT_STORE_SECRET;
    else env.ALLOW_DEV_OBJECT_STORE_SECRET = originalEnv.ALLOW_DEV_OBJECT_STORE_SECRET;
    if (originalEnv.FEATURE_CITATIONS_API === undefined) delete env.FEATURE_CITATIONS_API;
    else env.FEATURE_CITATIONS_API = originalEnv.FEATURE_CITATIONS_API;
    if (originalEnv.DEMO_MODE === undefined) delete env.DEMO_MODE;
    else env.DEMO_MODE = originalEnv.DEMO_MODE;
    if (originalEnv.ALLOW_UNSAFE_EXPORTS === undefined) delete env.ALLOW_UNSAFE_EXPORTS;
    else env.ALLOW_UNSAFE_EXPORTS = originalEnv.ALLOW_UNSAFE_EXPORTS;
    if (originalEnv.ORBITAL_ADMIN_TOKEN === undefined) delete env.ORBITAL_ADMIN_TOKEN;
    else env.ORBITAL_ADMIN_TOKEN = originalEnv.ORBITAL_ADMIN_TOKEN;
    await db.end({ timeout: 2 });
  });

  it(
    "runs core backend workflows end-to-end using a real pack PDF",
    async () => {
      const folderName = `real-data-e2e-${randomUUID()}`;
      const createFolderRes = await POST_FOLDERS(
        new Request("http://localhost/folders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: folderName }),
        }),
      );
      expect(createFolderRes.status).toBe(200);
      const createFolderJson = (await createFolderRes.json()) as CreateFolderResponse;
      const folderId = createFolderJson.folder.id;
      expect(folderId).toMatch(/^fld_/);

      const pdfPath = resolvePackPdfPath("TitleCommitment.pdf");
      const pdfBytes = new Uint8Array(await fs.readFile(pdfPath));
      const initUploadRes = await POST_FOLDER_DOCUMENTS(
        new Request(`http://localhost/folders/${folderId}/documents`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: "TitleCommitment.pdf",
            mime: "application/pdf",
            bytes: pdfBytes.byteLength,
          }),
        }),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(initUploadRes.status).toBe(200);
      const initUploadJson = (await initUploadRes.json()) as InitUploadResponse;
      const documentId = initUploadJson.document.id;
      const storageKey = initUploadJson.upload.storage_key;
      expect(documentId).toMatch(/^doc_/);

      const uploadHeaders = new Headers();
      for (const [k, v] of Object.entries(initUploadJson.upload.headers)) {
        uploadHeaders.set(k, v);
      }
      const uploadRes = await PUT_DOCUMENT_UPLOAD(
        new Request(`http://localhost/documents/${documentId}/upload`, {
          method: "PUT",
          headers: uploadHeaders,
          body: pdfBytes,
        }),
        { params: Promise.resolve({ id: documentId }) },
      );
      expect(uploadRes.status).toBe(200);

      const completeUploadRes = await POST_DOCUMENT_COMPLETE(
        new Request(`http://localhost/documents/${documentId}/complete`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ storage_key: storageKey }),
        }),
        { params: Promise.resolve({ id: documentId }) },
      );
      expect(completeUploadRes.status).toBe(200);

      let ingestRunId: string | null = null;
      for (let i = 0; i < 80; i += 1) {
        if (!ingestRunId) {
          const ingestRuns = await db<Array<{ id: string }>>`
            SELECT id
            FROM runs
            WHERE idempotency_key = ${`ingest_document:${documentId}`}
            ORDER BY created_at DESC
            LIMIT 1
          `;
          ingestRunId = ingestRuns[0]?.id ?? null;
        }

        if (ingestRunId) {
          await drainWdkStepsOnce({
            workerId: "test:real-data-e2e:ingest",
            runId: ingestRunId,
            handlers: wdkSmokeStepHandlers,
            maxSteps: 6,
            db,
          });
        }

        const docsRes = await GET_FOLDER_DOCUMENTS(new Request(`http://localhost/folders/${folderId}/documents`), {
          params: Promise.resolve({ id: folderId }),
        });
        expect(docsRes.status).toBe(200);
        const docsJson = (await docsRes.json()) as DocumentsResponse;
        const doc = docsJson.documents.find((d) => d.id === documentId);
        expect(doc).toBeTruthy();

        if (doc?.status === "indexed-ready") break;
        if (doc?.status === "failed") {
          throw new Error(`DOCUMENT_INGEST_FAILED:${JSON.stringify(doc.error_json ?? {})}`);
        }
        await sleep(250);
      }

      const folderRes = await GET_FOLDER(new Request(`http://localhost/folders/${folderId}`), {
        params: Promise.resolve({ id: folderId }),
      });
      expect(folderRes.status).toBe(200);
      const folderJson = (await folderRes.json()) as {
        folder: { state: string };
      };
      expect(["indexed", "ready"]).toContain(folderJson.folder.state);

      const startRunRes = await POST_RUNS(
        new Request(`http://localhost/folders/${folderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(startRunRes.status).toBe(200);
      const startRunJson = (await startRunRes.json()) as StartRunResponse;
      const runId = startRunJson.run.id;
      expect(runId).toMatch(/^run_/);

      for (let i = 0; i < 80; i += 1) {
        await drainWdkStepsOnce({
          workerId: "test:real-data-e2e:quick-start",
          runId,
          handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
          maxSteps: 16,
          db,
        });

        const runRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`), {
          params: Promise.resolve({ id: runId }),
        });
        expect(runRes.status).toBe(200);
        const runJson = (await runRes.json()) as RunResponse;
        if (runJson.run.state === "completed") break;

        await sleep(200);
      }

      const finalRunRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`), {
        params: Promise.resolve({ id: runId }),
      });
      expect(finalRunRes.status).toBe(200);
      const finalRunJson = (await finalRunRes.json()) as RunResponse;
      expect(finalRunJson.run.state).toBe("completed");

      const reportRes = await GET_REPORT(
        new Request(`http://localhost/folders/${folderId}/report?${new URLSearchParams({ run_id: runId }).toString()}`),
        { params: Promise.resolve({ id: folderId }) },
      );
      expect(reportRes.status).toBe(200);
      const reportJson = (await reportRes.json()) as ReportResponse;
      expect(reportJson.run.id).toBe(runId);
      expect(reportJson.rows.length).toBeGreaterThan(0);
      expect(reportJson.rows.some((r) => r.status === "citation_failed")).toBe(true);
      expect(reportJson.rows.some((r) => r.payload_schema_version === "list_payload_v0")).toBe(true);

      const chunkRows = await db<Array<{ document_id: string; page_start: number | null; text: string }>>`
        SELECT document_id, page_start, text
        FROM chunks
        WHERE document_id = ${documentId}
          AND length(text) > 0
        ORDER BY chunk_index ASC
        LIMIT 1
      `;
      const chunk = chunkRows[0];
      expect(chunk).toBeTruthy();

      const questionSetRows = await db<Array<{ question_set_version: string }>>`
        SELECT question_set_version
        FROM runs
        WHERE id = ${runId}
        LIMIT 1
      `;
      const questionSetVersion = questionSetRows[0]?.question_set_version;
      expect(questionSetVersion).toBeTruthy();

      const citationRowId = `row_${randomUUID()}`;
      const citationId = `cit_${randomUUID().replace(/-/g, "_")}`;
      const snippet = chunk!.text.slice(0, 180).trim();
      const snippetHash = hashSnippet(snippet);
      const polygons = [[[0, 0], [1, 0], [1, 1], [0, 1]]];

      await db`
        INSERT INTO report_rows (
          id,
          run_id,
          folder_id,
          question_set_version,
          question_id,
          question,
          answer,
          status,
          notes,
          provenance_json,
          payload_schema_version,
          payload_json,
          created_at,
          updated_at
        )
        VALUES (
          ${citationRowId},
          ${runId},
          ${folderId},
          ${questionSetVersion!},
          ${"TS-E2E-CIT"},
          ${"Real-data citation smoke question"},
          ${"Evidence exists"},
          ${"needs_review"},
          NULL,
          ${db.json({})},
          NULL,
          NULL,
          now(),
          now()
        )
      `;
      await db`
        INSERT INTO citations (
          id,
          report_row_id,
          document_id,
          page_number,
          snippet,
          snippet_hash,
          polygons_json,
          locked_at,
          created_at
        )
        VALUES (
          ${citationId},
          ${citationRowId},
          ${chunk!.document_id},
          ${chunk!.page_start ?? 1},
          ${snippet},
          ${snippetHash},
          ${db.json(polygons)},
          now(),
          now()
        )
      `;

      const citationRes = await GET_CITATION(new Request(`http://localhost/citations/${citationId}`), {
        params: Promise.resolve({ id: citationId }),
      });
      expect(citationRes.status).toBe(200);
      const citationJson = (await citationRes.json()) as CitationResponse;
      expect(citationJson.citation.id).toBe(citationId);
      expect(citationJson.citation.document_id).toBe(chunk!.document_id);
      expect(citationJson.citation.snippet_hash).toBe(snippetHash);

      const renderRes = await GET_DOCUMENT_RENDER(
        new Request(`http://localhost/documents/${documentId}/render?${new URLSearchParams({ page: String(chunk!.page_start ?? 1) })}`),
        { params: Promise.resolve({ id: documentId }) },
      );
      expect(renderRes.status).toBe(200);
      const renderJson = (await renderRes.json()) as RenderResponse;
      expect(renderJson.document_id).toBe(documentId);
      expect(renderJson.render_url).toContain(`/documents/${documentId}/pdf?`);

      const pdfRes = await GET_DOCUMENT_PDF(
        new Request(`http://localhost${renderJson.render_url}`),
        { params: Promise.resolve({ id: documentId }) },
      );
      expect(pdfRes.status).toBe(200);
      expect(pdfRes.headers.get("content-type")).toContain("application/pdf");

      const blockedExportRes = await POST_EXPORT_CSV(
        new Request("http://localhost/export/csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder_id: folderId,
            run_id: runId,
            kind: "requirements_tracker",
            unsafe_override: false,
          }),
        }),
      );
      expect(blockedExportRes.status).toBe(409);
      const blockedExportJson = (await blockedExportRes.json()) as SafeErrorResponse;
      expect(blockedExportJson.error.code).toBe("EXPORT_BLOCKED");
      expect(blockedExportJson.error.message ?? "").toContain("Export blocked");
      expect(blockedExportJson.error.details?.reason_codes ?? []).toContain("NO_CITATIONS");
      expect(blockedExportJson.artefact).toBeUndefined();
      expect(hasSignedDownloadLink(blockedExportJson)).toBe(false);

      env.DEMO_MODE = "1";
      env.ALLOW_UNSAFE_EXPORTS = "1";
      env.ORBITAL_ADMIN_TOKEN = "e2e-admin-token";

      const unsafeExportRes = await POST_EXPORT_CSV(
        new Request("http://localhost/export/csv", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-orbital-admin-token": "e2e-admin-token",
          },
          body: JSON.stringify({
            folder_id: folderId,
            run_id: runId,
            kind: "requirements_tracker",
            unsafe_override: true,
          }),
        }),
      );
      expect(unsafeExportRes.status).toBe(200);
      const unsafeExportJson = (await unsafeExportRes.json()) as ExportCsvResponse;
      expect(unsafeExportJson.artefact.id).toMatch(/^art_/);

      const artefactsRes = await GET_ARTEFACTS(new Request(`http://localhost/folders/${folderId}/artefacts`), {
        params: Promise.resolve({ id: folderId }),
      });
      expect(artefactsRes.status).toBe(200);
      const artefactsJson = (await artefactsRes.json()) as ArtefactsResponse;
      expect(artefactsJson.artefacts.some((a) => a.id === unsafeExportJson.artefact.id)).toBe(true);

      const downloadRes = await GET_ARTEFACT_DOWNLOAD(
        new Request(`http://localhost${unsafeExportJson.artefact.download_url}`),
        { params: Promise.resolve({ id: unsafeExportJson.artefact.id }) },
      );
      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers.get("content-type")).toContain("text/csv");
      const csvText = await downloadRes.text();
      expect(csvText).toContain("requirement_id");

      await db`DELETE FROM folders WHERE id = ${folderId}`;
    },
    120_000,
  );

  it(
    "operator smoke: load-pack bad citation flow stays export-blocked",
    async () => {
      const previousOrbitalMode = env.ORBITAL_MODE;
      env.ORBITAL_MODE = "demo-prod";

      let folderId: string | null = null;
      try {
        const loadPackRes = await POST_DEMO_LOAD_PACK(
          new Request("http://localhost/demo/load-pack", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pack_id: "pack_09_bad_citation" }),
          }),
        );
        expect(loadPackRes.status).toBe(200);
        const loadPackJson = (await loadPackRes.json()) as DemoLoadPackResponse;
        folderId = loadPackJson.folder.id;
        expect(folderId).toMatch(/^fld_/);
        expect(loadPackJson.folder.name).toContain("pack_09_bad_citation");

        for (let i = 0; i < 120; i += 1) {
          const docsRes = await GET_FOLDER_DOCUMENTS(new Request(`http://localhost/folders/${folderId}/documents`), {
            params: Promise.resolve({ id: folderId }),
          });
          expect(docsRes.status).toBe(200);
          const docsJson = (await docsRes.json()) as DocumentsResponse;
          expect(docsJson.documents.length).toBeGreaterThan(0);

          const failedDoc = docsJson.documents.find((doc) => doc.status === "failed");
          if (failedDoc) {
            throw new Error(`DEMO_LOAD_PACK_INGEST_FAILED:${JSON.stringify(failedDoc.error_json ?? {})}`);
          }

          const pendingDocs = docsJson.documents.filter((doc) => doc.status !== "indexed-ready");
          if (pendingDocs.length === 0) break;

          for (const doc of pendingDocs) {
            const ingestRuns = await db<Array<{ id: string }>>`
              SELECT id
              FROM runs
              WHERE idempotency_key = ${`ingest_document:${doc.id}`}
              ORDER BY created_at DESC
              LIMIT 1
            `;
            const ingestRunId = ingestRuns[0]?.id ?? null;
            if (!ingestRunId) continue;

            await drainWdkStepsOnce({
              workerId: "test:real-data-e2e:demo-load-pack",
              runId: ingestRunId,
              handlers: wdkSmokeStepHandlers,
              maxSteps: 6,
              db,
            });
          }

          await sleep(250);
        }

        const finalDocsRes = await GET_FOLDER_DOCUMENTS(new Request(`http://localhost/folders/${folderId}/documents`), {
          params: Promise.resolve({ id: folderId }),
        });
        expect(finalDocsRes.status).toBe(200);
        const finalDocsJson = (await finalDocsRes.json()) as DocumentsResponse;
        expect(finalDocsJson.documents.every((doc) => doc.status === "indexed-ready")).toBe(true);

        const startRunRes = await POST_RUNS(
          new Request(`http://localhost/folders/${folderId}/runs`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ type: "quick_start_title_survey" }),
          }),
          { params: Promise.resolve({ id: folderId }) },
        );
        expect(startRunRes.status).toBe(200);
        const startRunJson = (await startRunRes.json()) as StartRunResponse;
        const runId = startRunJson.run.id;

        for (let i = 0; i < 120; i += 1) {
          await drainWdkStepsOnce({
            workerId: "test:real-data-e2e:demo-operator-smoke",
            runId,
            handlers: { ...wdkSmokeStepHandlers, ...quickStartStepHandlers },
            maxSteps: 16,
            db,
          });

          const runRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`), {
            params: Promise.resolve({ id: runId }),
          });
          expect(runRes.status).toBe(200);
          const runJson = (await runRes.json()) as RunResponse;
          if (runJson.run.state === "completed") break;
          if (runJson.run.state === "failed") {
            throw new Error(`QUICK_START_FAILED:${runId}`);
          }

          await sleep(200);
        }

        const finalRunRes = await GET_RUN(new Request(`http://localhost/runs/${runId}`), {
          params: Promise.resolve({ id: runId }),
        });
        expect(finalRunRes.status).toBe(200);
        const finalRunJson = (await finalRunRes.json()) as RunResponse;
        expect(finalRunJson.run.state).toBe("completed");

        const reportRes = await GET_REPORT(
          new Request(`http://localhost/folders/${folderId}/report?${new URLSearchParams({ run_id: runId }).toString()}`),
          { params: Promise.resolve({ id: folderId }) },
        );
        expect(reportRes.status).toBe(200);
        const reportJson = (await reportRes.json()) as ReportResponse;
        expect(reportJson.rows.length).toBeGreaterThan(0);
        expect(reportJson.rows.some((row) => row.status === "citation_failed")).toBe(true);

        const blockedExportRes = await POST_EXPORT_CSV(
          new Request("http://localhost/export/csv", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              folder_id: folderId,
              run_id: runId,
              kind: "requirements_tracker",
              unsafe_override: false,
            }),
          }),
        );
        expect(blockedExportRes.status).toBe(409);
        const blockedExportJson = (await blockedExportRes.json()) as SafeErrorResponse;
        expect(blockedExportJson.error.code).toBe("EXPORT_BLOCKED");
        expect(blockedExportJson.error.message ?? "").toContain("Export blocked");
        expect((blockedExportJson.error.details?.reason_codes ?? []).length).toBeGreaterThan(0);
        expect(blockedExportJson.artefact).toBeUndefined();
        expect(hasSignedDownloadLink(blockedExportJson)).toBe(false);
      } finally {
        if (folderId) {
          await db`DELETE FROM folders WHERE id = ${folderId}`;
        }
        if (previousOrbitalMode === undefined) delete env.ORBITAL_MODE;
        else env.ORBITAL_MODE = previousOrbitalMode;
      }
    },
    120_000,
  );
});
