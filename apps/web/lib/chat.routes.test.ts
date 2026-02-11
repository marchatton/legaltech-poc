import { beforeEach, describe, expect, it, vi } from "vitest";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();
const hybridSearchMock = vi.fn();
const streamTextMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

vi.mock("./devOnlyApi.server", () => ({
  assertDevOnlyApi: () => null,
  assertDevOrDemoProdApi: () => null,
}));

vi.mock("./retrieval/types", () => ({
  hybridSearch: hybridSearchMock,
}));

vi.mock("./ai/gateway.server", () => ({
  chatModel: () => "mock-model",
}));

vi.mock("ai", () => ({
  streamText: streamTextMock,
}));

function queueSqlResults(results: unknown[]) {
  const queue = results.slice();
  sqlMock.mockImplementation(async () => queue.shift() ?? []);
}

describe("POST /folders/:id/chat", () => {
  beforeEach(() => {
    vi.resetModules();
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
    hybridSearchMock.mockReset();
    streamTextMock.mockReset();
    process.env.CHAT_ENABLED = "1";
  });

  it("returns deterministic envelope fields on folder-not-found", async () => {
    queueSqlResults([[]]);

    const { POST } = await import("../app/(api)/folders/[id]/chat/route");
    const res = await POST(
      new Request("http://localhost:3000/folders/fld_missing/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "hello" }),
      }),
      { params: Promise.resolve({ id: "fld_missing" }) },
    );

    expect(res.status).toBe(404);
    const json = (await res.json()) as {
      error?: { code?: unknown; message?: unknown; trace_id?: unknown; retryable?: unknown };
    };
    expect(json.error?.code).toBe("NOT_FOUND");
    expect(json.error?.message).toBe("Folder not found.");
    expect(typeof json.error?.trace_id).toBe("string");
    expect((json.error?.trace_id as string | undefined) ?? "").toMatch(/^trc_/);
    expect(json.error?.retryable).toBe(false);
    expect(JSON.stringify(json)).not.toContain("stack");
  });

  it("emits deterministic stream error fields without provider leakage", async () => {
    queueSqlResults([[{ latest_index_version: "v1" }]]);
    hybridSearchMock.mockRejectedValueOnce(new Error("provider timeout payload=raw_internal_blob"));

    const { POST } = await import("../app/(api)/folders/[id]/chat/route");
    const res = await POST(
      new Request("http://localhost:3000/folders/fld_123/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ message: "test question" }),
      }),
      { params: Promise.resolve({ id: "fld_123" }) },
    );

    expect(res.status).toBe(200);
    const body = await res.text();
    const events = body
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => JSON.parse(line) as Record<string, unknown>);
    const meta = events.find((evt) => evt.type === "meta");
    const error = events.find((evt) => evt.type === "error");

    expect(meta?.trace_id).toMatch(/^trc_/);
    expect(error).toMatchObject({
      type: "error",
      status: "citation_failed",
      code: "MODEL_STREAM_FAILED",
      message: "Chat response failed. Please retry.",
      retryable: true,
    });
    expect(error?.trace_id).toBe(meta?.trace_id);
    expect(body).not.toContain("provider timeout payload=raw_internal_blob");
  });
});
