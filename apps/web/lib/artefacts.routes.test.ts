import fs from "node:fs";
import path from "node:path";

import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { putObject } from "./objectStore.server";

const ensureSchemaMock = vi.fn();
const sqlMock = vi.fn();

vi.mock("./db.server", () => ({
  ensureSchema: ensureSchemaMock,
  sql: sqlMock,
}));

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

describe("artefacts list + download", () => {
  beforeEach(() => {
    process.env.OBJECT_STORE_SIGNING_SECRET = "test-secret";
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  afterEach(() => {
    ensureSchemaMock.mockReset();
    sqlMock.mockReset();
  });

  it("lists artefacts newest-first with fresh download_url and no-cache headers", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/artefacts/route");

    const folderId = "fld_test";
    const newest = {
      id: "art_11111111-1111-1111-1111-111111111111",
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename: "requirements_tracker.csv",
      storage_key: `folders/${folderId}/artefacts/art_11111111-1111-1111-1111-111111111111.csv`,
      source_run_id: "run_123",
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };
    const older = {
      id: "art_22222222-2222-2222-2222-222222222222",
      folder_id: folderId,
      type: "csv",
      kind: "exceptions_table",
      filename: "exceptions_table.csv",
      storage_key: `folders/${folderId}/artefacts/art_22222222-2222-2222-2222-222222222222.csv`,
      source_run_id: null,
      created_at: new Date("2026-02-08T00:00:01.000Z"),
    };

    queueSqlResults([[{ id: folderId }], [newest, older]]);

    const res = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });

    expect(res.status).toBe(200);
    expect(res.headers.get("Cache-Control")).toBe("no-store, no-cache");

    const json = (await res.json()) as unknown;
    expect(json).toEqual({
      artefacts: [
        expect.objectContaining({ id: newest.id }),
        expect.objectContaining({ id: older.id }),
      ],
    });

    const artefacts = (json as { artefacts: Array<{ download_url: string }> }).artefacts;
    expect(artefacts[0]?.download_url).toContain(`/artefacts/${newest.id}/download?`);
    expect(artefacts[1]?.download_url).toContain(`/artefacts/${older.id}/download?`);
  });

  it("returns new download_url values on repeat list calls", async () => {
    const { GET } = await import("../app/(api)/folders/[id]/artefacts/route");

    const folderId = "fld_test_repeat";
    const artefact = {
      id: "art_33333333-3333-3333-3333-333333333333",
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename: "requirements_tracker.csv",
      storage_key: `folders/${folderId}/artefacts/art_33333333-3333-3333-3333-333333333333.csv`,
      source_run_id: "run_123",
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };

    queueSqlResults([[{ id: folderId }], [artefact]]);
    const res1 = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });
    const json1 = (await res1.json()) as { artefacts: Array<{ download_url: string }> };

    queueSqlResults([[{ id: folderId }], [artefact]]);
    const res2 = await GET(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
      params: Promise.resolve({ id: folderId }),
    });
    const json2 = (await res2.json()) as { artefacts: Array<{ download_url: string }> };

    expect(json1.artefacts[0]?.download_url).not.toEqual(json2.artefacts[0]?.download_url);
  });

  it("serves artefact bytes for a valid signed download_url", async () => {
    const { GET: listGet } = await import("../app/(api)/folders/[id]/artefacts/route");
    const { GET: downloadGet } = await import("../app/(api)/artefacts/[id]/download/route");

    const folderId = "fld_test_download";
    const artefactId = "art_44444444-4444-4444-4444-444444444444";
    const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
    const filename = "requirements_tracker.csv";

    const artefact = {
      id: artefactId,
      folder_id: folderId,
      type: "csv",
      kind: "requirements_tracker",
      filename,
      storage_key: storageKey,
      source_run_id: null,
      created_at: new Date("2026-02-08T00:00:02.000Z"),
    };

    const bytes = Buffer.from("hello,world\n", "utf8");
    await putObject({ storageKey, bytes });

    try {
      queueSqlResults([[{ id: folderId }], [artefact], [artefact]]);

      const listRes = await listGet(new Request(`http://localhost:3000/folders/${folderId}/artefacts`), {
        params: Promise.resolve({ id: folderId }),
      });
      const listJson = (await listRes.json()) as { artefacts: Array<{ download_url: string }> };
      const downloadUrl = listJson.artefacts[0]?.download_url;
      expect(typeof downloadUrl).toBe("string");

      const downloadRes = await downloadGet(new Request(downloadUrl!), {
        params: Promise.resolve({ id: artefactId }),
      });

      expect(downloadRes.status).toBe(200);
      expect(downloadRes.headers.get("Cache-Control")).toBe("no-store, no-cache");
      expect(downloadRes.headers.get("Content-Disposition")).toBe(`attachment; filename="${filename}"`);
      expect(downloadRes.headers.get("Content-Type")).toBe("text/csv; charset=utf-8");

      const out = Buffer.from(await downloadRes.arrayBuffer());
      expect(out).toEqual(bytes);
    } finally {
      fs.rmSync(objectStorePath(storageKey), { force: true });
    }
  });
});

