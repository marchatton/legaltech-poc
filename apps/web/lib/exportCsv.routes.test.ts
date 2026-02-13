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

function errorTraceId(json: unknown): string | null {
  if (!isRecord(json)) return null;
  const env = json.error;
  if (!isRecord(env)) return null;
  const traceId = env.trace_id;
  return typeof traceId === "string" && traceId.trim() ? traceId : null;
}

function errorRetryable(json: unknown): boolean | null {
  if (!isRecord(json)) return null;
  const env = json.error;
  if (!isRecord(env)) return null;
  return typeof env.retryable === "boolean" ? env.retryable : null;
}

function errorDetails(json: unknown): Record<string, unknown> | null {
  if (!isRecord(json)) return null;
  const env = json.error;
  if (!isRecord(env)) return null;
  return isRecord(env.details) ? env.details : null;
}

function artefactFrom(json: unknown): Record<string, unknown> | null {
  if (!isRecord(json)) return null;
  const artefact = json.artefact;
  if (!isRecord(artefact)) return null;
  return artefact;
}

function hasSignedDownloadLink(json: unknown): boolean {
  if (json === null || json === undefined) return false;
  return /\/artefacts\/[^"\s]+\/download\?/.test(JSON.stringify(json));
}

describe("export csv", () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    delete process.env.EVIDENCE_BACKEND;
    delete process.env.DEMO_MODE;
    delete process.env.ALLOW_UNSAFE_EXPORTS;
    delete process.env.ORBITAL_ADMIN_TOKEN;
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("returns 415 when Content-Type is not application/json", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "text/plain" },
        body: JSON.stringify({ folder_id: "fld_test", run_id: "run_test", kind: "requirements_tracker" }),
      }),
    );

    expect(res.status).toBe(415);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("UNSUPPORTED_MEDIA_TYPE");
  });

  it("returns 404 on DB run miss (no fixture fallback)", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    queueSqlResults([[]]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: "pack_01_clean",
          run_id: "run_missing",
          kind: "requirements_tracker",
        }),
      }),
    );

    expect(res.status).toBe(404);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("NOT_FOUND");
    expect(ensureSchemaMock).toHaveBeenCalledTimes(1);
    expect(sqlMock).toHaveBeenCalledTimes(1);
  });

  it("writes a downloadable csv artefact for a completed run", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    const folderId = "fld_test_csv_completed";
    const runId = "run_test_csv_completed";

    queueSqlResults([
      [{ id: runId, state: "completed" }],
      [],
      [
        {
          id: "row_ts03",
          question_id: "TS-03",
          answer: "requirements payload",
          status: "needs_review",
          notes: null,
          provenance_json: {},
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
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: folderId,
          run_id: runId,
          kind: "requirements_tracker",
        }),
      }),
    );

    expect(res.status).toBe(200);
    const json: unknown = await res.json().catch(() => null);
    const artefact = artefactFrom(json);
    expect(artefact).not.toBeNull();
    expect(artefact?.type).toBe("csv");
    expect(artefact?.kind).toBe("requirements_tracker");
    expect(artefact?.filename).toBe("requirements_tracker.csv");
    expect(artefact?.source_run_id).toBe(runId);
    expect(typeof artefact?.download_url).toBe("string");
    expect(String(artefact?.download_url)).toMatch(/^\/artefacts\/art_[0-9a-f-]+\/download\?/i);
    expect(typeof artefact?.storage_key).toBe("string");

    if (!artefact || typeof artefact.storage_key !== "string") {
      throw new Error("Missing artefact.storage_key in response.");
    }

    const p = objectStorePath(artefact.storage_key);
    try {
      const bytes = fs.readFileSync(p);
      expect(bytes.length).toBeGreaterThan(10);
    } finally {
      fs.rmSync(p, { force: true });
    }
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
    expect(errorTraceId(json)).toMatch(/^trc_/);
    expect(errorRetryable(json)).toBe(false);
    expect(artefactFrom(json)).toBeNull();
    expect(hasSignedDownloadLink(json)).toBe(false);

    const details = errorDetails(json);
    const reasonCodes = Array.isArray(details?.reason_codes) ? details.reason_codes : [];
    expect(reasonCodes).toContain("VALIDATION_ERROR");
    expect(details?.run_id).toBe(runId);
    expect(details?.failed_question_ids).toEqual(["TS-03"]);
  });

  it("returns EXPORT_BLOCKED when structured report payload is missing", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    queueSqlResults([[{ id: "run_missing_row", state: "completed" }], [], []]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: "fld_missing_row",
          run_id: "run_missing_row",
          kind: "requirements_tracker",
        }),
      }),
    );

    expect(res.status).toBe(409);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("EXPORT_BLOCKED");
    expect(artefactFrom(json)).toBeNull();
    expect(hasSignedDownloadLink(json)).toBe(false);
    const details = errorDetails(json);
    const reasonCodes = Array.isArray(details?.reason_codes) ? details.reason_codes : [];
    expect(reasonCodes).toContain("REPORT_ROW_MISSING");
  });

  it("returns EXPORT_BLOCKED when locked citations are missing", async () => {
    const { POST } = await import("../app/(api)/export/csv/route");

    queueSqlResults([
      [{ id: "run_missing_citations", state: "completed" }],
      [],
      [
        {
          id: "row_ts03",
          question_id: "TS-03",
          answer: "requirements payload",
          status: "needs_review",
          notes: null,
          provenance_json: {},
          payload_schema_version: "list_payload_v0",
          payload_json: {
            kind: "requirements_tracker",
            items: [
              {
                kind: "requirements_tracker_item",
                item_id: "bi:1",
                citation_ids: ["cit_missing_01"],
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
    ]);

    const res = await POST(
      new Request("http://localhost:3000/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: "fld_missing_citations",
          run_id: "run_missing_citations",
          kind: "requirements_tracker",
        }),
      }),
    );

    expect(res.status).toBe(409);
    const json: unknown = await res.json().catch(() => null);
    expect(errorCode(json)).toBe("EXPORT_BLOCKED");
    expect(artefactFrom(json)).toBeNull();
    expect(hasSignedDownloadLink(json)).toBe(false);
    const details = errorDetails(json);
    const reasonCodes = Array.isArray(details?.reason_codes) ? details.reason_codes : [];
    expect(reasonCodes).toContain("MISSING_LOCKED_CITATIONS");
    expect(details?.run_id).toBe("run_missing_citations");
    expect(details?.missing_citation_ids).toEqual(["cit_missing_01"]);
  });

  it.each(["running", "failed", "partial"] as const)(
    "returns EXPORT_BLOCKED and no artefact when run state is %s",
    async (runState) => {
      const { POST } = await import("../app/(api)/export/csv/route");

      const folderId = `fld_test_csv_${runState}`;
      const runId = `run_test_csv_${runState}`;

      queueSqlResults([[{ id: runId, state: runState }]]);

      const res = await POST(
        new Request("http://localhost:3000/export/csv", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            folder_id: folderId,
            run_id: runId,
            kind: "requirements_tracker",
          }),
        }),
      );

      expect(res.status).toBe(409);
      const json: unknown = await res.json().catch(() => null);
      expect(errorCode(json)).toBe("EXPORT_BLOCKED");
      expect(artefactFrom(json)).toBeNull();
      expect(hasSignedDownloadLink(json)).toBe(false);
      const details = errorDetails(json);
      const reasonCodes = Array.isArray(details?.reason_codes) ? details.reason_codes : [];
      expect(reasonCodes).toContain("RUN_NOT_COMPLETED");
    },
  );

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
