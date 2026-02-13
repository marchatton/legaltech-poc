import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const assertDevOrDemoProdApiMock = vi.fn();
const createObjectReadStreamMock = vi.fn();
const statObjectMock = vi.fn();
const validateStorageKeyMock = vi.fn();
const verifySignatureMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: assertDevOrDemoProdApiMock,
}));

vi.mock("./objectStore.server", () => ({
  createObjectReadStream: createObjectReadStreamMock,
  statObject: statObjectMock,
  validateStorageKey: validateStorageKeyMock,
  verifySignature: verifySignatureMock,
}));

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function errorCode(json: unknown): string | null {
  if (!isRecord(json)) return null;
  const env = json.error;
  if (!isRecord(env)) return null;
  const code = env.code;
  return typeof code === "string" && code.trim() ? code.trim() : null;
}

describe("GET /documents/:id/pdf", () => {
  beforeEach(() => {
    delete process.env.EVIDENCE_BACKEND;
    delete process.env.ORBITAL_MODE;

    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    assertDevOrDemoProdApiMock.mockReset();
    assertDevOrDemoProdApiMock.mockReturnValue(null);
    createObjectReadStreamMock.mockReset();
    statObjectMock.mockReset();
    validateStorageKeyMock.mockReset();
    validateStorageKeyMock.mockReturnValue({ ok: true });
    verifySignatureMock.mockReset();
    verifySignatureMock.mockReturnValue(true);
  });

  it("returns 404 for fixture ids when EVIDENCE_BACKEND=db_only", async () => {
    process.env.EVIDENCE_BACKEND = "db_only";
    process.env.ORBITAL_MODE = "dev";

    const documentId = "fx_pack_01_clean__share_purchase_agreement";
    const expiresAtMs = Date.now() + 60_000;
    const { GET } = await import("../app/(api)/documents/[id]/pdf/route");

    const res = await GET(
      new Request(`http://localhost:3000/documents/${documentId}/pdf?expires=${expiresAtMs}&sig=sig_test`),
      {
        params: Promise.resolve({ id: documentId }),
      },
    );

    expect(res.status).toBe(404);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("NOT_FOUND");

    expect(assertDevOrDemoProdApiMock).toHaveBeenCalledTimes(1);
    expect(ensureSchemaMock).not.toHaveBeenCalled();
    expect(sqlMock).not.toHaveBeenCalled();
    expect(validateStorageKeyMock).not.toHaveBeenCalled();
    expect(verifySignatureMock).not.toHaveBeenCalled();
    expect(statObjectMock).not.toHaveBeenCalled();
    expect(createObjectReadStreamMock).not.toHaveBeenCalled();
  });

  it("returns UNAUTHORISED when render signature is missing", async () => {
    process.env.ORBITAL_MODE = "dev";

    const documentId = "doc_pdf_missing_sig";
    const { GET } = await import("../app/(api)/documents/[id]/pdf/route");

    const res = await GET(new Request(`http://localhost:3000/documents/${documentId}/pdf`), {
      params: Promise.resolve({ id: documentId }),
    });

    expect(res.status).toBe(403);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("UNAUTHORISED");

    expect(assertDevOrDemoProdApiMock).toHaveBeenCalledTimes(1);
    expect(ensureSchemaMock).not.toHaveBeenCalled();
    expect(sqlMock).not.toHaveBeenCalled();
  });

  it("returns typed INTERNAL envelope when pdf path throws unexpectedly", async () => {
    process.env.ORBITAL_MODE = "dev";

    ensureSchemaMock.mockImplementationOnce(async () => {
      throw new Error("boom");
    });

    const documentId = "doc_pdf_internal";
    const expiresAtMs = Date.now() + 60_000;
    const { GET } = await import("../app/(api)/documents/[id]/pdf/route");

    const res = await GET(
      new Request(`http://localhost:3000/documents/${documentId}/pdf?expires=${expiresAtMs}&sig=sig_test`),
      {
        params: Promise.resolve({ id: documentId }),
      },
    );

    expect(res.status).toBe(500);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("INTERNAL");
  });
});
