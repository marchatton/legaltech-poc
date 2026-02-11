import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();

vi.mock("./db.server", () => {
  const fn = sqlMock as unknown as typeof sqlMock & { json: (value: unknown) => unknown };
  fn.json = (value: unknown) => value;
  return {
    ensureSchema: ensureSchemaMock,
    sql: fn,
  };
});

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: () => null,
}));

function queueSqlResults(results: unknown[]) {
  const queue = results.slice();
  sqlMock.mockImplementation(async () => queue.shift() ?? []);
}

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

describe("PATCH /report-rows/:id", () => {
  beforeEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("marks needs_review row as reviewed", async () => {
    const { PATCH } = await import("../app/(api)/report-rows/[id]/route");

    queueSqlResults([
      [
        {
          id: "row_01",
          status: "reviewed",
          updated_at: new Date("2026-02-11T17:00:00.000Z"),
        },
      ],
    ]);

    const res = await PATCH(
      new Request("http://localhost:3000/report-rows/row_01", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_reviewed" }),
      }),
      { params: Promise.resolve({ id: "row_01" }) },
    );

    expect(res.status).toBe(200);
    const json: unknown = await res.json().catch(() => null);
    expect(isRecord(json)).toBe(true);
    expect(isRecord(isRecord(json) ? json.row : null)).toBe(true);
    if (!isRecord(json) || !isRecord(json.row)) throw new Error("Missing row in response");
    expect(json.row.status).toBe("reviewed");
    expect(String(json.row.updated_at)).toContain("2026-02-11T17:00:00.000Z");
  });

  it("returns INVALID_STATE when row status cannot transition", async () => {
    const { PATCH } = await import("../app/(api)/report-rows/[id]/route");

    queueSqlResults([
      [],
      [
        {
          id: "row_02",
          status: "citation_failed",
          updated_at: new Date("2026-02-11T17:00:00.000Z"),
        },
      ],
    ]);

    const res = await PATCH(
      new Request("http://localhost:3000/report-rows/row_02", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_reviewed" }),
      }),
      { params: Promise.resolve({ id: "row_02" }) },
    );

    expect(res.status).toBe(409);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("INVALID_STATE");
  });

  it("returns NOT_FOUND when row id does not exist", async () => {
    const { PATCH } = await import("../app/(api)/report-rows/[id]/route");

    queueSqlResults([[], []]);

    const res = await PATCH(
      new Request("http://localhost:3000/report-rows/row_missing", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "mark_reviewed" }),
      }),
      { params: Promise.resolve({ id: "row_missing" }) },
    );

    expect(res.status).toBe(404);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("NOT_FOUND");
  });

  it("returns 415 for non-json requests", async () => {
    const { PATCH } = await import("../app/(api)/report-rows/[id]/route");

    const res = await PATCH(
      new Request("http://localhost:3000/report-rows/row_01", {
        method: "PATCH",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ action: "mark_reviewed" }),
      }),
      { params: Promise.resolve({ id: "row_01" }) },
    );

    expect(res.status).toBe(415);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("UNSUPPORTED_MEDIA_TYPE");
  });
});
