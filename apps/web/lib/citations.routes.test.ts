import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const assertDevOrDemoProdApiMock = vi.fn();

const originalNodeEnv = process.env.NODE_ENV;

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: assertDevOrDemoProdApiMock,
}));

function queueSqlResults(results: unknown[]) {
  const queue = results.slice();
  sqlMock.mockImplementation(async () => queue.shift() ?? []);
}

describe("GET /citations/:id (db-only)", () => {
  beforeEach(() => {
    delete process.env.FEATURE_CITATIONS_API;
    delete process.env.EVIDENCE_BACKEND;
    delete process.env.ORBITAL_MODE;
    (process.env as Record<string, string | undefined>).NODE_ENV = originalNodeEnv;
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    assertDevOrDemoProdApiMock.mockReset();
  });

  it("returns DB-backed citations even when FEATURE_CITATIONS_API is disabled", async () => {
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    process.env.ORBITAL_MODE = "dev";

    const citationId = "cit_db_first_when_disabled";
    const row = {
      id: citationId,
      document_id: "doc_db_first",
      page_number: 4,
      snippet: "DB first even with flag disabled.",
      snippet_hash: "sha256:dbfirst",
      polygons_json: [[[0.1, 0.1], [0.3, 0.1], [0.3, 0.2], [0.1, 0.2]]],
      provenance_json: {},
    };
    queueSqlResults([[row]]);

    const { GET } = await import("../app/(api)/citations/[id]/route");
    const res = await GET(new Request(`http://localhost:3000/citations/${citationId}`), {
      params: Promise.resolve({ id: citationId }),
    });

    expect(assertDevOrDemoProdApiMock).toHaveBeenCalledTimes(1);
    expect(ensureSchemaMock).toHaveBeenCalledTimes(1);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      citation: {
        id: citationId,
        document_id: row.document_id,
        document_filename: null,
        page_number: row.page_number,
        polygons: row.polygons_json,
        snippet: row.snippet,
        snippet_hash: row.snippet_hash,
        doc_version: null,
        verified_at: null,
        loaded_state: null,
      },
    });
  });

  it("returns a DB-backed citation when FEATURE_CITATIONS_API=1 (no dev gate)", async () => {
    process.env.FEATURE_CITATIONS_API = "1";

    const citationId = "cit_123";
    const row = {
      id: citationId,
      document_id: "doc_123",
      page_number: 12,
      snippet: "Example snippet.",
      snippet_hash: "sha256:test",
      polygons_json: [[[0.1, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]],
      provenance_json: {
        doc_version: "v1.2.3",
        verified_at: "2026-02-11T18:10:00.000Z",
        loaded_state: "loaded",
      },
    };

    queueSqlResults([[row]]);

    const { GET } = await import("../app/(api)/citations/[id]/route");
    const res = await GET(new Request(`http://localhost:3000/citations/${citationId}`), {
      params: Promise.resolve({ id: citationId }),
    });

    expect(assertDevOrDemoProdApiMock).not.toHaveBeenCalled();
    expect(ensureSchemaMock).toHaveBeenCalledTimes(1);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      citation: {
        id: citationId,
        document_id: row.document_id,
        document_filename: null,
        page_number: row.page_number,
        polygons: row.polygons_json,
        snippet: row.snippet,
        snippet_hash: row.snippet_hash,
        doc_version: "v1.2.3",
        verified_at: "2026-02-11T18:10:00.000Z",
        loaded_state: "loaded",
      },
    });
  });

  it("returns null trust metadata fields when provenance payload is missing", async () => {
    process.env.FEATURE_CITATIONS_API = "1";

    const citationId = "cit_456";
    const row = {
      id: citationId,
      document_id: "doc_456",
      page_number: 4,
      snippet: "Example snippet without provenance trust metadata.",
      snippet_hash: "sha256:test-missing-trust",
      polygons_json: [[[0.1, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]],
      provenance_json: {},
    };

    queueSqlResults([[row]]);

    const { GET } = await import("../app/(api)/citations/[id]/route");
    const res = await GET(new Request(`http://localhost:3000/citations/${citationId}`), {
      params: Promise.resolve({ id: citationId }),
    });

    expect(assertDevOrDemoProdApiMock).not.toHaveBeenCalled();
    expect(ensureSchemaMock).toHaveBeenCalledTimes(1);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({
      citation: {
        id: citationId,
        document_id: row.document_id,
        document_filename: null,
        page_number: row.page_number,
        polygons: row.polygons_json,
        snippet: row.snippet,
        snippet_hash: row.snippet_hash,
        doc_version: null,
        verified_at: null,
        loaded_state: null,
      },
    });
  });

  it("returns 404 on DB miss even in dev mode", async () => {
    process.env.FEATURE_CITATIONS_API = "1";
    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    process.env.ORBITAL_MODE = "dev";

    queueSqlResults([[]]);

    const { GET } = await import("../app/(api)/citations/[id]/route");
    const res = await GET(new Request("http://localhost:3000/citations/cit_missing_dev"), {
      params: Promise.resolve({ id: "cit_missing_dev" }),
    });

    expect(res.status).toBe(404);
    expect(await res.json()).toEqual({
      error: {
        code: "NOT_FOUND",
        message: "Citation not found.",
        trace_id: expect.any(String),
      },
    });
  });

  it("returns typed INTERNAL envelope when citation query throws unexpectedly", async () => {
    process.env.FEATURE_CITATIONS_API = "1";

    const citationId = "cit_throws_internal";
    sqlMock.mockImplementationOnce(async () => {
      throw new Error("db exploded");
    });

    const { GET } = await import("../app/(api)/citations/[id]/route");
    const res = await GET(new Request(`http://localhost:3000/citations/${citationId}`), {
      params: Promise.resolve({ id: citationId }),
    });

    expect(assertDevOrDemoProdApiMock).not.toHaveBeenCalled();
    expect(ensureSchemaMock).toHaveBeenCalledTimes(1);
    expect(sqlMock).toHaveBeenCalledTimes(1);

    expect(res.status).toBe(500);
    expect(await res.json()).toEqual({
      error: {
        code: "INTERNAL",
        message: "Failed to load citation.",
        trace_id: expect.any(String),
      },
    });
  });
});
