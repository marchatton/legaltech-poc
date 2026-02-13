import fsSync from "node:fs";
import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";

import { POST as POST_FOLDERS } from "../app/(api)/folders/route";
import { POST as POST_FOLDER_DOCUMENTS, GET as GET_FOLDER_DOCUMENTS } from "../app/(api)/folders/[id]/documents/route";
import { POST as POST_RUNS } from "../app/(api)/folders/[id]/runs/route";
import { GET as GET_REPORT } from "../app/(api)/folders/[id]/report/route";
import { POST as POST_DOCUMENT_COMPLETE } from "../app/(api)/documents/[id]/complete/route";
import { GET as GET_DOCUMENT_PDF } from "../app/(api)/documents/[id]/pdf/route";
import { GET as GET_DOCUMENT_RENDER } from "../app/(api)/documents/[id]/render/route";
import { PUT as PUT_DOCUMENT_UPLOAD } from "../app/(api)/documents/[id]/upload/route";
import { GET as GET_CITATION } from "../app/(api)/citations/[id]/route";
import { GET as GET_RUN } from "../app/(api)/runs/[id]/route";
import { MISSING_EVIDENCE_TEXT, parseChatStreamEvent, type ChatStreamEvent } from "../lib/chat/protocol";
import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { drainWdkStepsOnce } from "../lib/wdk/wdkWorker.server";
import { quickStartStepHandlers } from "../steps/quickStartStepHandlers.server";
import { wdkSmokeStepHandlers } from "../steps/wdkSmokeStepHandlers.server";

const streamTextMock = vi.fn();
vi.mock("ai", () => ({
  streamText: (args: unknown) => streamTextMock(args),
}));

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

function resolvePackTruthPath(filename: string): string {
  const candidates = [
    path.resolve(process.cwd(), "../../docs/08-example-data/pack_01_clean/truth", filename),
    path.resolve(process.cwd(), "docs/08-example-data/pack_01_clean/truth", filename),
  ];

  for (const candidate of candidates) {
    try {
      const stat = fsSync.statSync(candidate);
      if (stat.isFile()) return candidate;
    } catch {
      // try next candidate
    }
  }

  throw new Error(`PACK_TRUTH_NOT_FOUND:${filename}`);
}

function parseQuestionFromChatPrompt(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const maybeMessages = (value as { messages?: unknown }).messages;
  if (!Array.isArray(maybeMessages) || maybeMessages.length === 0) return null;
  const first = maybeMessages[0];
  if (!first || typeof first !== "object" || Array.isArray(first)) return null;
  const content = (first as { content?: unknown }).content;
  if (typeof content !== "string") return null;
  const marker = "Question:\n";
  const start = content.indexOf(marker);
  if (start < 0) return null;
  const fromQuestion = content.slice(start + marker.length);
  const end = fromQuestion.indexOf("\n\nSources:");
  if (end < 0) return fromQuestion.trim() || null;
  const question = fromQuestion.slice(0, end).trim();
  return question.length > 0 ? question : null;
}

function parseChatEvents(body: string): ChatStreamEvent[] {
  return body
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => parseChatStreamEvent(line))
    .filter((evt): evt is ChatStreamEvent => evt !== null);
}

type CreateFolderResponse = {
  folder: {
    id: string;
  };
};

type InitUploadResponse = {
  document: {
    id: string;
  };
  upload: {
    storage_key: string;
    headers: Record<string, string>;
  };
};

type DocumentsResponse = {
  documents: Array<{
    id: string;
    filename: string;
    status: string;
    open_pdf_url: string | null;
    error_json: unknown | null;
  }>;
};

type StartRunResponse = {
  run: {
    id: string;
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
    question_id: string;
    status: string;
    answer: string;
    citation_ids: string[];
  }>;
};

type CitationResponse = {
  citation: {
    id: string;
    document_id: string;
    page_number: number;
    snippet_hash: string;
    polygons: unknown;
  };
};

type RenderResponse = {
  document_id: string;
  render_url: string;
};

type GoldenQuestion = {
  question_id: string;
  question: string;
  expected_answer_contains: string[];
  expected_citations?: Array<{
    doc: string;
    anchor: string;
  }>;
};

type GoldenQuestionExpectation = {
  questionId: string;
  question: string;
  expectedAnswerContains: string;
  expectedCitationDoc: string;
};

describe("citation flow from a fresh document upload", () => {
  const url = databaseUrl();
  const db = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  const env = process.env as Record<string, string | undefined>;
  const originalEnv = {
    NODE_ENV: env.NODE_ENV,
    ORBITAL_MODE: env.ORBITAL_MODE,
    ALLOW_DEV_OBJECT_STORE_SECRET: env.ALLOW_DEV_OBJECT_STORE_SECRET,
    FEATURE_CITATIONS_API: env.FEATURE_CITATIONS_API,
    AI_GATEWAY_API_KEY: env.AI_GATEWAY_API_KEY,
  };

  beforeAll(async () => {
    env.NODE_ENV = "development";
    delete env.ORBITAL_MODE;
    env.ALLOW_DEV_OBJECT_STORE_SECRET = "1";
    env.FEATURE_CITATIONS_API = "1";
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
    if (originalEnv.AI_GATEWAY_API_KEY === undefined) delete env.AI_GATEWAY_API_KEY;
    else env.AI_GATEWAY_API_KEY = originalEnv.AI_GATEWAY_API_KEY;
    await db.end({ timeout: 2 });
  });

  it(
    "creates citations and render payloads after uploading a new PDF",
    async () => {
      let folderId: string | null = null;
      try {
        // Note: this test uploads a subset of real docs from pack_01_clean.
        // We only use truth expectations whose cited doc is one of these uploads.
        const uploadPlan = ["TitleCommitment.pdf", "ALTA_Survey.pdf", "REA.pdf", "Utility_Easement.pdf"] as const;
        const goldenQuestionsPath = resolvePackTruthPath("golden_questions.json");
        const goldenQuestions = JSON.parse(await fs.readFile(goldenQuestionsPath, "utf8")) as GoldenQuestion[];
        // This ensures we only assert against ground truth that should map to rows in this
        // run (question -> expected citation doc -> uploaded document id).
        const expectedQuestions = goldenQuestions
          .map((q): GoldenQuestionExpectation | null => {
            const expectedAnswerContains = q.expected_answer_contains[0] ?? null;
            const expectedCitationDoc = q.expected_citations?.[0]?.doc ?? null;
            if (!expectedAnswerContains || !expectedCitationDoc) return null;
            if (!uploadPlan.includes(expectedCitationDoc as (typeof uploadPlan)[number])) return null;
            return {
              questionId: q.question_id,
              question: q.question,
              expectedAnswerContains,
              expectedCitationDoc,
            };
          })
          .filter((q): q is GoldenQuestionExpectation => q !== null);
        if (expectedQuestions.length < 2) {
          throw new Error("PACK_TRUTH_NOT_ENOUGH_EXPECTATIONS_FOR_UPLOADED_DOCS");
        }

        const expectedQuestionById = new Map(expectedQuestions.map((q) => [q.questionId, q]));
        const expectedAnswerByQuestion = new Map(expectedQuestions.map((q) => [q.question, q.expectedAnswerContains]));
        streamTextMock.mockReset();
        streamTextMock.mockImplementation((args: unknown) => {
          const question = parseQuestionFromChatPrompt(args);
          const answer = question ? expectedAnswerByQuestion.get(question) : null;
          return {
            textStream: (async function* () {
              yield answer ?? MISSING_EVIDENCE_TEXT;
            })(),
          };
        });

        const createFolderRes = await POST_FOLDERS(
          new Request("http://localhost/folders", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ name: `citations-upload-e2e-${randomUUID()}` }),
          }),
        );
        expect(createFolderRes.status).toBe(200);
        const createFolderJson = (await createFolderRes.json()) as CreateFolderResponse;
        folderId = createFolderJson.folder.id;
        expect(folderId).toMatch(/^fld_/);

        const uploadedByFilename = new Map<
          string,
          {
            documentId: string;
          }
        >();

        for (const filename of uploadPlan) {
          const pdfPath = resolvePackPdfPath(filename);
          const pdfBytes = new Uint8Array(await fs.readFile(pdfPath));

          const initUploadRes = await POST_FOLDER_DOCUMENTS(
            new Request(`http://localhost/folders/${folderId}/documents`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                filename,
                mime: "application/pdf",
                bytes: pdfBytes.byteLength,
              }),
            }),
            { params: Promise.resolve({ id: folderId }) },
          );
          expect(initUploadRes.status).toBe(200);
          const initUploadJson = (await initUploadRes.json()) as InitUploadResponse;
          const documentId = initUploadJson.document.id;
          expect(documentId).toMatch(/^doc_/);

          const uploadHeaders = new Headers();
          for (const [k, v] of Object.entries(initUploadJson.upload.headers)) uploadHeaders.set(k, v);

          const uploadRes = await PUT_DOCUMENT_UPLOAD(
            new Request(`http://localhost/documents/${documentId}/upload`, {
              method: "PUT",
              headers: uploadHeaders,
              body: pdfBytes,
            }),
            { params: Promise.resolve({ id: documentId }) },
          );
          expect(uploadRes.status).toBe(200);

          const completeRes = await POST_DOCUMENT_COMPLETE(
            new Request(`http://localhost/documents/${documentId}/complete`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ storage_key: initUploadJson.upload.storage_key }),
            }),
            { params: Promise.resolve({ id: documentId }) },
          );
          expect(completeRes.status).toBe(200);

          uploadedByFilename.set(filename, {
            documentId,
          });
        }

        const ingestRunIdByDocumentId = new Map<string, string>();
        let indexedReady = false;
        for (let i = 0; i < 120; i += 1) {
          for (const uploaded of uploadedByFilename.values()) {
            if (ingestRunIdByDocumentId.has(uploaded.documentId)) continue;
            const rows = await db<Array<{ id: string }>>`
              SELECT id
              FROM runs
              WHERE idempotency_key = ${`ingest_document:${uploaded.documentId}`}
              ORDER BY created_at DESC
              LIMIT 1
            `;
            const runId = rows[0]?.id ?? null;
            if (runId) ingestRunIdByDocumentId.set(uploaded.documentId, runId);
          }

          for (const ingestRunId of ingestRunIdByDocumentId.values()) {
            await drainWdkStepsOnce({
              workerId: "test:citations-upload-e2e:ingest",
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
          const uploadedDocs = Array.from(uploadedByFilename.values()).map((uploaded) => {
            const doc = docsJson.documents.find((d) => d.id === uploaded.documentId);
            expect(doc).toBeTruthy();
            return doc ?? null;
          });
          const failedDoc = uploadedDocs.find((doc) => doc?.status === "failed");
          if (failedDoc) {
            throw new Error(`DOCUMENT_INGEST_FAILED:${JSON.stringify(failedDoc.error_json ?? {})}`);
          }
          if (uploadedDocs.every((doc) => doc?.status === "indexed-ready")) {
            indexedReady = true;
            break;
          }
          await sleep(250);
        }
        expect(indexedReady).toBe(true);

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

        let completed = false;
        for (let i = 0; i < 80; i += 1) {
          await drainWdkStepsOnce({
            workerId: "test:citations-upload-e2e:quick-start",
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
          if (runJson.run.state === "completed") {
            completed = true;
            break;
          }
          if (runJson.run.state === "failed") {
            throw new Error(`QUICK_START_FAILED:${runId}`);
          }
          await sleep(200);
        }
        expect(completed).toBe(true);

        const reportRes = await GET_REPORT(
          new Request(`http://localhost/folders/${folderId}/report?${new URLSearchParams({ run_id: runId }).toString()}`),
          { params: Promise.resolve({ id: folderId }) },
        );
        expect(reportRes.status).toBe(200);
        const reportJson = (await reportRes.json()) as ReportResponse;
        expect(reportJson.run.id).toBe(runId);
        expect(reportJson.rows.length).toBeGreaterThan(0);
        expect(reportJson.rows.some((row) => row.answer === "Unable to produce citations.")).toBe(false);

        // Confirms report rows are backed by real fixture truth and uploaded docs, not
        // hardcoded test-only assumptions.
        const rowsBackedByTruth = reportJson.rows
          .filter((row) => row.status === "needs_review" && row.citation_ids.length > 0)
          .map((row) => {
            const expected = expectedQuestionById.get(row.question_id);
            if (!expected) return null;
            const expectedSourceDocId = uploadedByFilename.get(expected.expectedCitationDoc)?.documentId ?? "";
            if (!expectedSourceDocId) return null;
            return {
              row,
              expected,
              expectedSourceDocId,
            };
          })
          .filter(
            (
              item,
            ): item is {
              row: ReportResponse["rows"][number];
              expected: GoldenQuestionExpectation;
              expectedSourceDocId: string;
            } => item !== null,
          );
        expect(rowsBackedByTruth.length).toBeGreaterThanOrEqual(2);

        const citationEvidence = rowsBackedByTruth[0];
        expect(citationEvidence).toBeTruthy();
        const citationId = citationEvidence?.row.citation_ids[0] ?? "";
        expect(citationId).toMatch(/^cit_/);

        const citationRes = await GET_CITATION(new Request(`http://localhost/citations/${citationId}`), {
          params: Promise.resolve({ id: citationId }),
        });
        expect(citationRes.status).toBe(200);
        const citationJson = (await citationRes.json()) as CitationResponse;
        expect(citationJson.citation.id).toBe(citationId);
        expect(citationEvidence?.expectedSourceDocId).toMatch(/^doc_/);
        expect(citationJson.citation.document_id).toBe(citationEvidence?.expectedSourceDocId ?? "");
        expect(citationJson.citation.page_number).toBeGreaterThan(0);
        expect(citationJson.citation.snippet_hash).toMatch(/^sha256:/);
        expect(Array.isArray(citationJson.citation.polygons)).toBe(true);
        const polygons = citationJson.citation.polygons as unknown[];
        expect(polygons.length).toBeGreaterThan(0);
        const firstPolygon = polygons[0];
        expect(Array.isArray(firstPolygon)).toBe(true);
        expect((firstPolygon as unknown[]).length).toBeGreaterThanOrEqual(3);

        const renderRes = await GET_DOCUMENT_RENDER(
          new Request(
            `http://localhost/documents/${citationJson.citation.document_id}/render?${new URLSearchParams({
              page: String(citationJson.citation.page_number),
            })}`,
          ),
          { params: Promise.resolve({ id: citationJson.citation.document_id }) },
        );
        expect(renderRes.status).toBe(200);
        const renderJson = (await renderRes.json()) as RenderResponse;
        expect(renderJson.document_id).toBe(citationEvidence?.expectedSourceDocId ?? "");
        expect(renderJson.render_url).toContain(`/documents/${citationEvidence?.expectedSourceDocId ?? ""}/pdf?`);

        const prevGatewayKey = env.AI_GATEWAY_API_KEY;
        env.AI_GATEWAY_API_KEY = "test-gateway-key";
        try {
          const { POST: POST_CHAT } = await import("../app/(api)/folders/[id]/chat/route");
          const chatExpectations = rowsBackedByTruth.slice(0, 2).map((item) => ({
            questionId: item.expected.questionId,
            question: item.expected.question,
            expectedAnswerContains: item.expected.expectedAnswerContains,
            expectedSourceDocId: item.expectedSourceDocId,
          }));

          for (const chatCheck of chatExpectations) {
            expect(chatCheck.expectedSourceDocId).toMatch(/^doc_/);
            const chatRes = await POST_CHAT(
              new Request(`http://localhost/folders/${folderId}/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: chatCheck.question }),
              }),
              { params: Promise.resolve({ id: folderId }) },
            );
            expect(chatRes.status).toBe(200);
            const chatBody = await chatRes.text();
            const chatEvents = parseChatEvents(chatBody);
            expect(chatEvents.some((evt) => evt.type === "meta")).toBe(true);
            expect(chatEvents.some((evt) => evt.type === "done" && evt.status === "complete")).toBe(true);
            expect(chatEvents.some((evt) => evt.type === "error")).toBe(false);

            const answerText = chatEvents
              .filter((evt): evt is Extract<ChatStreamEvent, { type: "token" }> => evt.type === "token")
              .map((evt) => evt.token)
              .join("");
            expect(answerText).toContain(chatCheck.expectedAnswerContains);

            const sourcesEvent = chatEvents.find(
              (evt): evt is Extract<ChatStreamEvent, { type: "sources" }> => evt.type === "sources",
            );
            expect(sourcesEvent).toBeTruthy();
            expect((sourcesEvent?.sources.length ?? 0) > 0).toBe(true);
            expect(
              sourcesEvent?.sources.some(
                (source) => source.document_id === chatCheck.expectedSourceDocId && source.anchor_state === "ready",
              ),
            ).toBe(true);
          }
        } finally {
          if (prevGatewayKey === undefined) delete env.AI_GATEWAY_API_KEY;
          else env.AI_GATEWAY_API_KEY = prevGatewayKey;
        }

        const docsForDownloadRes = await GET_FOLDER_DOCUMENTS(new Request(`http://localhost/folders/${folderId}/documents`), {
          params: Promise.resolve({ id: folderId }),
        });
        expect(docsForDownloadRes.status).toBe(200);
        const docsForDownloadJson = (await docsForDownloadRes.json()) as DocumentsResponse;
        for (const filename of uploadPlan) {
          const uploadedDocId = uploadedByFilename.get(filename)?.documentId ?? "";
          expect(uploadedDocId).toMatch(/^doc_/);
          const doc = docsForDownloadJson.documents.find((d) => d.id === uploadedDocId);
          expect(doc).toBeTruthy();
          expect(doc?.filename).toBe(filename);
          expect(typeof doc?.open_pdf_url).toBe("string");
          const pdfRes = await GET_DOCUMENT_PDF(
            new Request(`http://localhost${doc?.open_pdf_url ?? ""}`),
            { params: Promise.resolve({ id: uploadedDocId }) },
          );
          expect(pdfRes.status).toBe(200);
          expect(pdfRes.headers.get("content-type")).toContain("application/pdf");
        }
      } finally {
        if (folderId) {
          await db`DELETE FROM folders WHERE id = ${folderId}`;
        }
      }
    },
    120_000,
  );
});
