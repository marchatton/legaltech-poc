import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { GET as GET_FOLDER } from "../app/(api)/folders/[id]/route";
import { POST as POST_RUNS } from "../app/(api)/folders/[id]/runs/route";
import { ensureAllSchemas } from "../lib/db/schema/index.server";
import { listMatters, parseMatterListFilters } from "../lib/mattersList.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function readSafeError(
  payload: unknown,
): { code: string; message: string; details: Record<string, unknown> | null } | null {
  if (!isRecord(payload)) return null;
  const error = isRecord(payload.error) ? payload.error : null;
  if (!error) return null;
  const code = typeof error.code === "string" ? error.code : null;
  const message = typeof error.message === "string" ? error.message : null;
  if (!code || !message) return null;
  return {
    code,
    message,
    details: isRecord(error.details) ? error.details : null,
  };
}

async function seedRunnableDemoMatter(args: {
  sql: postgres.Sql;
  folderId: string;
  folderName: string;
  filenames: string[];
}): Promise<void> {
  await args.sql`
    INSERT INTO folders (id, name, state, latest_index_version)
    VALUES (${args.folderId}, ${args.folderName}, 'ready', 'v1')
  `;

  for (const filename of args.filenames) {
    const docId = `doc_${randomUUID().replaceAll("-", "")}`;
    await args.sql`
      INSERT INTO documents (
        id, folder_id, filename, mime, bytes, storage_key, upload_completed_at, parse_status, ocr_status,
        page_count, extraction_quality
      )
      VALUES (
        ${docId},
        ${args.folderId},
        ${filename},
        'application/pdf',
        1024,
        ${`folders/${args.folderId}/documents/${docId}.pdf`},
        now(),
        'parsed',
        'done',
        1,
        0.99
      )
    `;
    await args.sql`
      INSERT INTO chunks (id, document_id, index_version, chunk_index, text, text_hash)
      VALUES (
        ${`chk_${randomUUID().replaceAll("-", "")}`},
        ${docId},
        'v1',
        0,
        'seed chunk',
        ${`hash_${randomUUID()}`}
      )
    `;
    await args.sql`
      INSERT INTO document_pages (id, document_id, page_number, text, layout_json)
      VALUES (
        ${`pg_${randomUUID().replaceAll("-", "")}`},
        ${docId},
        1,
        'seed page',
        ${args.sql.json({ blocks: [] })}
      )
    `;
  }
}

describe("US-001 canonical readiness parity", () => {
  const sql = postgres(databaseUrl(), { max: 1, idle_timeout: 2, connect_timeout: 2 });
  const env = process.env as Record<string, string | undefined>;
  const previousNodeEnv = env.NODE_ENV;

  beforeAll(async () => {
    env.NODE_ENV = "development";
    await ensureAllSchemas(sql);
  }, 30_000);

  afterAll(async () => {
    if (previousNodeEnv === undefined) delete env.NODE_ENV;
    else env.NODE_ENV = previousNodeEnv;
    await sql.end({ timeout: 2 });
  });

  it("keeps list/detail/run-start readiness in lock-step for packs 01 and 02", async () => {
    const seedTag = `us001_${randomUUID().replaceAll("-", "").slice(0, 10)}`;
    const pack01FolderId = `fld_${seedTag}_pack01`;
    const pack02FolderId = `fld_${seedTag}_pack02`;

    const pack01Name = `DEMO: pack_01_clean 2026-02-13T00:00:00Z ${seedTag}`;
    const pack02Name = `DEMO: pack_02_missing_rea 2026-02-13T00:00:00Z ${seedTag}`;

    await seedRunnableDemoMatter({
      sql,
      folderId: pack01FolderId,
      folderName: pack01Name,
      filenames: ["TitleCommitment.pdf", "REA.pdf", "Utility_Easement.pdf"],
    });
    await seedRunnableDemoMatter({
      sql,
      folderId: pack02FolderId,
      folderName: pack02Name,
      filenames: ["TitleCommitment.pdf", "Utility_Easement.pdf"],
    });

    try {
      const listRows = await listMatters(parseMatterListFilters({ q: seedTag }));
      const listById = new Map(listRows.map((row) => [row.id, row]));
      const pack01List = listById.get(pack01FolderId);
      const pack02List = listById.get(pack02FolderId);

      expect(pack01List?.readiness.state).toBe("runnable");
      expect(pack02List?.readiness.state).toBe("blocked");
      expect(pack02List?.readiness.reason_code).toBe("MISSING_PREREQUISITE_DOCUMENT");
      expect(pack02List?.readiness.reason).toContain("REA.pdf");

      const pack01DetailRes = await GET_FOLDER(new Request(`http://localhost/folders/${pack01FolderId}`), {
        params: Promise.resolve({ id: pack01FolderId }),
      });
      expect(pack01DetailRes.status).toBe(200);
      const pack01DetailJson = (await pack01DetailRes.json()) as {
        folder: { readiness: { state: string; reason_code: string; reason: string } };
      };
      expect(pack01DetailJson.folder.readiness.state).toBe("runnable");

      const pack02DetailRes = await GET_FOLDER(new Request(`http://localhost/folders/${pack02FolderId}`), {
        params: Promise.resolve({ id: pack02FolderId }),
      });
      expect(pack02DetailRes.status).toBe(200);
      const pack02DetailJson = (await pack02DetailRes.json()) as {
        folder: { readiness: { state: string; reason_code: string; reason: string } };
      };
      expect(pack02DetailJson.folder.readiness.state).toBe("blocked");
      expect(pack02DetailJson.folder.readiness.reason_code).toBe("MISSING_PREREQUISITE_DOCUMENT");
      expect(pack02DetailJson.folder.readiness.reason).toBe(pack02List?.readiness.reason);

      const startPack01 = await POST_RUNS(
        new Request(`http://localhost/folders/${pack01FolderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `idem_${randomUUID()}` },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: pack01FolderId }) },
      );
      expect(startPack01.status).toBe(200);

      const startPack02 = await POST_RUNS(
        new Request(`http://localhost/folders/${pack02FolderId}/runs`, {
          method: "POST",
          headers: { "Content-Type": "application/json", "Idempotency-Key": `idem_${randomUUID()}` },
          body: JSON.stringify({ type: "quick_start_title_survey" }),
        }),
        { params: Promise.resolve({ id: pack02FolderId }) },
      );
      expect(startPack02.status).toBe(409);
      const blockedError = readSafeError(await startPack02.json());
      expect(blockedError?.code).toBe("CONFLICT");
      expect(blockedError?.message).toBe(pack02DetailJson.folder.readiness.reason);
      expect(blockedError?.details?.readiness_reason_code).toBe(pack02DetailJson.folder.readiness.reason_code);
    } finally {
      await sql`DELETE FROM folders WHERE id = ANY(${sql.array([pack01FolderId, pack02FolderId])})`;
    }
  }, 20_000);
});
