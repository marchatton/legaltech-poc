import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const assertDevOrDemoProdApiMock = vi.fn();
const createSignedGetHeadersMock = vi.fn();
const objectExistsMock = vi.fn();
const validateStorageKeyMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: assertDevOrDemoProdApiMock,
}));

vi.mock("./objectStore.server", () => ({
  createSignedGetHeaders: createSignedGetHeadersMock,
  objectExists: objectExistsMock,
  validateStorageKey: validateStorageKeyMock,
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

describe("GET /documents/:id/render", () => {
  beforeEach(() => {
    delete process.env.EVIDENCE_BACKEND;
    delete process.env.ORBITAL_MODE;

    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    assertDevOrDemoProdApiMock.mockReset();
    assertDevOrDemoProdApiMock.mockReturnValue(null);
    createSignedGetHeadersMock.mockReset();
    createSignedGetHeadersMock.mockReturnValue({ expires_at_ms: Date.now() + 60_000, signature: "sig_test" });
    objectExistsMock.mockReset();
    objectExistsMock.mockReturnValue(true);
    validateStorageKeyMock.mockReset();
    validateStorageKeyMock.mockReturnValue({ ok: true });
  });

  it("returns 404 for fixture ids when EVIDENCE_BACKEND=db_only", async () => {
    process.env.EVIDENCE_BACKEND = "db_only";
    process.env.ORBITAL_MODE = "dev";

    const documentId = "fx_pack_01_clean__share_purchase_agreement";
    const { GET } = await import("../app/(api)/documents/[id]/render/route");

    const res = await GET(new Request(`http://localhost:3000/documents/${documentId}/render?page=1`), {
      params: Promise.resolve({ id: documentId }),
    });

    expect(res.status).toBe(404);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("NOT_FOUND");

    expect(assertDevOrDemoProdApiMock).toHaveBeenCalledTimes(1);
    expect(ensureSchemaMock).not.toHaveBeenCalled();
    expect(sqlMock).not.toHaveBeenCalled();
    expect(createSignedGetHeadersMock).not.toHaveBeenCalled();
    expect(objectExistsMock).not.toHaveBeenCalled();
    expect(validateStorageKeyMock).not.toHaveBeenCalled();
  });
});
