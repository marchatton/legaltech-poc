import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: () => null,
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
  return typeof error.code === "string" ? error.code : null;
}

describe("GET /folders/:id/runs (selector list)", () => {
  beforeEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("returns newest completed runs with selector-ready fields", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/runs/route");

    const folderId = "fld_selector";
    const newestCreated = new Date("2026-02-11T16:00:00.000Z");
    const newestUpdated = new Date("2026-02-11T16:03:00.000Z");
    const olderCreated = new Date("2026-02-10T09:00:00.000Z");
    const olderUpdated = new Date("2026-02-10T09:04:00.000Z");

    queueSqlResults([
      [{ id: folderId }],
      [
        { id: "run_latest", state: "completed", created_at: newestCreated, updated_at: newestUpdated },
        { id: "run_previous", state: "completed", created_at: olderCreated, updated_at: olderUpdated },
      ],
    ]);

    const res = await GET(new Request(`http://localhost:3000/folders/${folderId}/runs`), {
      params: Promise.resolve({ id: folderId }),
    });

    expect(res.status).toBe(200);
    const json = (await res.json()) as {
      runs: Array<{ run_id: string; status: string; created_at: string; updated_at: string }>;
    };

    expect(json).toEqual({
      runs: [
        {
          run_id: "run_latest",
          status: "completed",
          created_at: newestCreated.toISOString(),
          updated_at: newestUpdated.toISOString(),
        },
        {
          run_id: "run_previous",
          status: "completed",
          created_at: olderCreated.toISOString(),
          updated_at: olderUpdated.toISOString(),
        },
      ],
    });
  });

  it("enforces completed-only selector options in the run list query", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/runs/route");

    const folderId = "fld_selector_query";
    queueSqlResults([[{ id: folderId }], []]);

    const res = await GET(new Request(`http://localhost:3000/folders/${folderId}/runs`), {
      params: Promise.resolve({ id: folderId }),
    });

    expect(res.status).toBe(200);

    const sqlCall = sqlMock.mock.calls[1];
    const template = sqlCall?.[0] as TemplateStringsArray | undefined;
    const queryText = template ? template.join(" ") : "";

    expect(queryText).toContain("AND state = 'completed'");
    expect(queryText).toContain("ORDER BY created_at DESC");
  });

  it("returns NOT_FOUND when folder does not exist", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/runs/route");

    queueSqlResults([[]]);

    const res = await GET(new Request("http://localhost:3000/folders/fld_missing/runs"), {
      params: Promise.resolve({ id: "fld_missing" }),
    });

    expect(res.status).toBe(404);
    const json = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("NOT_FOUND");
  });
});
