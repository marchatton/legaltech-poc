import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const newIdMock = vi.fn(() => "doc_upload_test");
const createSignedPutHeadersMock = vi.fn(() => ({
  expires_at_ms: 1_701_000_000_000,
  signature: "sig_test",
}));
const createSignedGetHeadersMock = vi.fn(() => ({
  expires_at_ms: 1_701_000_000_000,
  signature: "sig_get_test",
}));
const validateStorageKeyMock = vi.fn(() => ({ ok: true as const }));

vi.mock("./db.server", () => {
  const fn = sqlMock as unknown as typeof sqlMock & { array: (value: unknown) => unknown };
  fn.array = (value: unknown) => value;
  return {
    ensureSchema: ensureSchemaMock,
    sql: fn,
  };
});

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
}));

vi.mock("./ids", () => ({
  newId: newIdMock,
}));

vi.mock("./objectStore.server", () => ({
  createSignedGetHeaders: createSignedGetHeadersMock,
  createSignedPutHeaders: createSignedPutHeadersMock,
  validateStorageKey: validateStorageKeyMock,
}));

function queueSqlResults(results: unknown[]) {
  const queue = results.slice();
  sqlMock.mockImplementation(async () => queue.shift() ?? []);
}

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function errorCode(json: unknown): string | null {
  if (!isRecord(json)) return null;
  const error = json.error;
  if (!isRecord(error)) return null;
  const code = error.code;
  return typeof code === "string" ? code : null;
}

describe("folders documents setup routes", () => {
  beforeEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    newIdMock.mockReset();
    newIdMock.mockImplementation(() => "doc_upload_test");
    createSignedPutHeadersMock.mockReset();
    createSignedPutHeadersMock.mockReturnValue({
      expires_at_ms: 1_701_000_000_000,
      signature: "sig_test",
    });
    createSignedGetHeadersMock.mockReset();
    createSignedGetHeadersMock.mockReturnValue({
      expires_at_ms: 1_701_000_000_000,
      signature: "sig_get_test",
    });
    validateStorageKeyMock.mockReset();
    validateStorageKeyMock.mockReturnValue({ ok: true });
  });

  it("GET returns parse/ocr plus derived readiness statuses", async () => {
    const now = new Date("2026-02-11T16:00:00.000Z");
    queueSqlResults([
      [{ id: "fld_test" }],
      [
        {
          id: "doc_ingesting",
          folder_id: "fld_test",
          filename: "queued.pdf",
          storage_key: "folders/fld_test/documents/doc_ingesting.pdf",
          upload_completed_at: now,
          parse_status: "queued",
          ocr_status: "queued",
          extraction_quality: null,
          page_count: null,
          error_json: null,
          created_at: now,
        },
        {
          id: "doc_ready",
          folder_id: "fld_test",
          filename: "ready.pdf",
          storage_key: "folders/fld_test/documents/doc_ready.pdf",
          upload_completed_at: now,
          parse_status: "parsed",
          ocr_status: "done",
          extraction_quality: 0.92,
          page_count: 3,
          error_json: null,
          created_at: now,
        },
      ],
    ]);

    const { GET } = await import("../app/(api)/folders/[id]/documents/route");
    const res = await GET(new Request("http://localhost:3000/folders/fld_test/documents"), {
      params: Promise.resolve({ id: "fld_test" }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      documents: Array<{ id: string; status: string }>;
      readiness: { indexed_ready: number; ingesting: number };
      capabilities: { accepted_mime: string[]; max_bytes: number };
    };

    const statusById = new Map(json.documents.map((doc) => [doc.id, doc.status]));
    expect(statusById.get("doc_ingesting")).toBe("ingesting");
    expect(statusById.get("doc_ready")).toBe("indexed-ready");
    expect(json.readiness.indexed_ready).toBe(1);
    expect(json.readiness.ingesting).toBe(1);
    expect(json.capabilities.accepted_mime).toEqual(["application/pdf"]);
    expect(json.capabilities.max_bytes).toBe(50 * 1024 * 1024);
  });

  it("POST returns upload capability envelope with queued status", async () => {
    queueSqlResults([
      [{ id: "fld_test" }],
      [],
    ]);

    const { POST } = await import("../app/(api)/folders/[id]/documents/route");
    const res = await POST(
      new Request("http://localhost:3000/folders/fld_test/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "upload.pdf",
          mime: "application/pdf",
          bytes: 1024,
        }),
      }),
      { params: Promise.resolve({ id: "fld_test" }) },
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      document: { status: string };
      capabilities: { accepted_mime: string[]; max_bytes: number };
      upload: { headers: Record<string, string> };
    };

    expect(json.document.status).toBe("queued");
    expect(json.capabilities.accepted_mime).toEqual(["application/pdf"]);
    expect(json.capabilities.max_bytes).toBe(50 * 1024 * 1024);
    expect(json.upload.headers["Content-Type"]).toBe("application/pdf");
  });

  it("POST rejects unsupported upload mime types", async () => {
    const { POST } = await import("../app/(api)/folders/[id]/documents/route");
    const res = await POST(
      new Request("http://localhost:3000/folders/fld_test/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: "bad.docx",
          mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
          bytes: 1024,
        }),
      }),
      { params: Promise.resolve({ id: "fld_test" }) },
    );

    expect(res.status).toBe(400);
    const json = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("VALIDATION_ERROR");
  });
});
