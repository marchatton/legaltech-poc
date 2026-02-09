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

function artefactFrom(json: unknown): Record<string, unknown> | null {
  if (!isRecord(json)) return null;
  const artefact = json.artefact;
  if (!isRecord(artefact)) return null;
  return artefact;
}

describe("export docx (memo)", () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("returns 409 when run is not completed", async () => {
    const { POST } = await import("../app/(api)/export/docx/route");

    const folderId = "fld_test_409";
    const runId = "run_test_409";

    queueSqlResults([
      [{ id: folderId, name: "Test folder" }],
      [
        {
          id: runId,
          state: "running",
          index_version: "v1",
          agent_bundle_version: "git:test",
          question_set_version: "qs:test",
        },
      ],
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId, run_id: runId, kind: "memo" }),
      }),
    );

    expect(res.status).toBe(409);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("CONFLICT");
  });

  it("fails closed when required list payload rows are missing", async () => {
    const { POST } = await import("../app/(api)/export/docx/route");

    const folderId = "fld_test_payload_missing";
    const runId = "run_test_payload_missing";

    queueSqlResults([
      [{ id: folderId, name: "Test folder" }],
      [
        {
          id: runId,
          state: "completed",
          index_version: "v1",
          agent_bundle_version: "git:test",
          question_set_version: "qs:test",
        },
      ],
      [
        {
          id: "row_ts04",
          question_id: "TS-04",
          question: "List the recorded exceptions in Schedule B-II.",
          status: "needs_review",
          provenance_json: {},
          payload_schema_version: "list_payload_v0",
          payload_json: { kind: "exceptions_table", items: [] },
        },
      ],
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId, run_id: runId, kind: "memo" }),
      }),
    );

    expect(res.status).toBe(500);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("INTERNAL");
  });

  it("writes memo.docx as an artefact for a completed run", async () => {
    const { POST } = await import("../app/(api)/export/docx/route");

    const folderId = "fld_test_docx";
    const runId = "run_test_docx";

    queueSqlResults([
      [{ id: folderId, name: "Test folder" }],
      [
        {
          id: runId,
          state: "completed",
          index_version: "v1",
          agent_bundle_version: "git:test",
          question_set_version: "qs:test",
        },
      ],
      [
        {
          id: "row_ts03",
          question_id: "TS-03",
          question: "List Schedule B-I requirements.",
          status: "needs_review",
          provenance_json: {},
          payload_schema_version: "list_payload_v0",
          payload_json: { kind: "requirements_tracker", items: [] },
        },
        {
          id: "row_ts04",
          question_id: "TS-04",
          question: "List the recorded exceptions in Schedule B-II.",
          status: "needs_review",
          provenance_json: {},
          payload_schema_version: "list_payload_v0",
          payload_json: { kind: "exceptions_table", items: [] },
        },
        {
          id: "row_ts09",
          question_id: "TS-09",
          question:
            "List survey reconciliation issues and QC flags (title <-> survey), including missing-doc, cert-gap, mismatch, encroachments, and scan-quality warnings.",
          status: "needs_review",
          provenance_json: {},
          payload_schema_version: "list_payload_v0",
          payload_json: { kind: "survey_issues", items: [] },
        },
      ],
      [],
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ folder_id: folderId, run_id: runId, kind: "memo" }),
      }),
    );

    expect(res.status).toBe(200);
    const json: unknown = await res.json().catch(() => null);
    const artefact = artefactFrom(json);
    expect(artefact).not.toBeNull();
    expect(artefact?.type).toBe("docx");
    expect(artefact?.kind).toBe("memo");
    expect(artefact?.filename).toBe("memo.docx");
    expect(typeof artefact?.storage_key).toBe("string");

    if (!artefact || typeof artefact.storage_key !== "string") {
      throw new Error("Missing artefact.storage_key in response.");
    }
    const storageKey = artefact.storage_key;
    expect(storageKey).toMatch(new RegExp(`^folders/${folderId}/artefacts/art_[0-9a-f-]+\\.docx$`, "i"));

    const p = objectStorePath(storageKey);
    try {
      const bytes = fs.readFileSync(p);
      expect(bytes.length).toBeGreaterThan(100);
      expect(bytes[0]).toBe(0x50); // "P"
      expect(bytes[1]).toBe(0x4b); // "K"
    } finally {
      fs.rmSync(p, { force: true });
    }
  });
});
