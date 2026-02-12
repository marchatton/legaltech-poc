import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const newIdMock = vi.fn(() => "fld_test_001");

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

vi.mock("./mattersList.server", () => ({
  listMatters: vi.fn(async () => []),
  parseMatterListFilters: vi.fn(() => ({ q: "", state: null, view: null })),
}));

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function errorCode(payload: unknown): string | null {
  if (!isRecord(payload)) return null;
  const error = payload.error;
  if (!isRecord(error)) return null;
  const code = error.code;
  return typeof code === "string" ? code : null;
}

describe("folders create route", () => {
  beforeEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    newIdMock.mockReset();
    newIdMock.mockImplementation(() => "fld_test_001");
  });

  it("creates a matter for a valid name", async () => {
    sqlMock.mockResolvedValue([]);

    const { POST } = await import("../app/(api)/folders/route");
    const res = await POST(
      new Request("http://localhost:3000/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Acme Parcel Review" }),
      }),
    );

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      folder: { id: string; name: string; state: string; latest_index_version: string };
    };
    expect(json.folder).toEqual({
      id: "fld_test_001",
      name: "Acme Parcel Review",
      state: "empty",
      latest_index_version: "v1",
    });
    expect(sqlMock).toHaveBeenCalledTimes(1);
    expect(JSON.stringify(sqlMock.mock.calls[0] ?? [])).toContain("Acme Parcel Review");
  });

  it("rejects empty names without creating a matter", async () => {
    const { POST } = await import("../app/(api)/folders/route");
    const res = await POST(
      new Request("http://localhost:3000/folders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "   " }),
      }),
    );

    expect(res.status).toBe(400);
    const json = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("VALIDATION_ERROR");
    expect(sqlMock).not.toHaveBeenCalled();
  });
});
