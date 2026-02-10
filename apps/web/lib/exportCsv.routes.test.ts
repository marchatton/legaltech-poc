import fs from "node:fs";
import path from "node:path";

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

function objectStorePath(storageKey: string): string {
  const root = path.resolve(process.cwd(), "../../tmp/object-store");
  return path.resolve(root, storageKey);
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

describe("export csv", () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    delete process.env.DEMO_MODE;
    delete process.env.ALLOW_UNSAFE_EXPORTS;
    delete process.env.ORBITAL_ADMIN_TOKEN;
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("returns EXPORT_BLOCKED when source row is citation_failed and unsafe_override=false", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    const folderId = "fld_test_csv_blocked";
    const runId = "run_test_csv_blocked";

    queueSqlResults([
      [{ id: runId, state: "completed" }],
      [
        {
          id: "row_ts03",
          question_id: "TS-03",
          answer: "payload present but failed verification",
          status: "citation_failed",
          notes: null,
          provenance_json: { reason_code: "VALIDATION_ERROR" },
          payload_schema_version: "list_payload_v0",
          payload_json: { kind: "requirements_tracker", items: [] },
        },
      ],
      [],
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId, run_id: runId, kind: "requirements_tracker" }),
      }),
    );

    expect(res.status).toBe(409);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("EXPORT_BLOCKED");
  });

  it("allows unsafe_override=true in dev when properly authorized", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    (process.env as Record<string, string | undefined>).NODE_ENV = "development";
    process.env.DEMO_MODE = "1";
    process.env.ALLOW_UNSAFE_EXPORTS = "1";
    process.env.ORBITAL_ADMIN_TOKEN = "test-admin-token";

    const folderId = "fld_test_csv_unsafe";
    const runId = "run_test_csv_unsafe";

    queueSqlResults([
      [{ id: runId, state: "completed" }],
      [
        {
          id: "row_ts03",
          question_id: "TS-03",
          answer: "payload present but failed verification",
          status: "citation_failed",
          notes: null,
          provenance_json: { reason_code: "VALIDATION_ERROR" },
          payload_schema_version: "list_payload_v0",
          payload_json: {
            kind: "requirements_tracker",
            items: [
              {
                kind: "requirements_tracker_item",
                item_id: "bi:1",
                citation_ids: [],
                bi_item: 1,
                requirement: "R1",
                owner: "Seller",
                item_status: "open",
              },
            ],
          },
        },
      ],
      [],
      [],
      [],
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-orbital-admin-token": "test-admin-token" },
        body: JSON.stringify({
          folder_id: folderId,
          run_id: runId,
          kind: "requirements_tracker",
          unsafe_override: true,
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json: unknown = await res.json().catch(() => null);
    expect(isRecord(json)).toBe(true);
    const artefact = isRecord(json) ? json.artefact : null;
    expect(isRecord(artefact)).toBe(true);

    const storageKey = isRecord(artefact) ? artefact.storage_key : null;
    if (typeof storageKey !== "string") throw new Error("Missing storage_key");

    const p = objectStorePath(storageKey);
    try {
      const bytes = fs.readFileSync(p);
      expect(bytes.length).toBeGreaterThan(10);
    } finally {
      fs.rmSync(p, { force: true });
    }
  });
});
