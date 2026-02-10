import { randomUUID } from "node:crypto";

import postgres from "postgres";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

import { ensureAllSchemas } from "../lib/db/schema/index.server";

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Match apps/web/lib/db.server.ts localhost normalization.
    if (url.includes("@localhost:")) return url.replace("@localhost:", "@127.0.0.1:");
    return url;
  }
  return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
}

function oneHotVectorLiteral(dim: number, index: number, value: number): string {
  if (dim <= 0) throw new Error("dim must be > 0");
  if (!Number.isInteger(index) || index < 0 || index >= dim) throw new Error("index out of bounds");
  const arr = Array<number>(dim).fill(0);
  arr[index] = value;
  return `[${arr.join(",")}]`;
}

describe("chunks retrieval schema (db)", () => {
  const url = databaseUrl();
  const sql = postgres(url, { max: 1, idle_timeout: 2, connect_timeout: 2 });

  beforeAll(async () => {
    await ensureAllSchemas(sql);
  });

  afterAll(async () => {
    await sql.end({ timeout: 2 });
  });

  it("adds lexical + semantic columns and indexes", async () => {
    const cols = await sql<
      Array<{
        column_name: string;
        data_type: string;
        udt_name: string;
        is_nullable: string;
        column_default: string | null;
      }>
    >`
      SELECT column_name, data_type, udt_name, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'chunks'
    `;

    const byName = new Map(cols.map((c) => [c.column_name, c]));

    expect(byName.get("text_tsv")?.udt_name).toBe("tsvector");
    expect(byName.get("embedding")?.udt_name).toBe("vector");
    expect(byName.get("embedding_model")?.data_type).toBe("text");
    expect(byName.get("embedding_model")?.is_nullable).toBe("NO");
    expect(String(byName.get("embedding_model")?.column_default ?? "")).toContain("openai/text-embedding-3-small");
    expect(byName.get("embedded_at")?.data_type).toBe("timestamp with time zone");

    const indexes = await sql<Array<{ indexname: string; indexdef: string }>>`
      SELECT indexname, indexdef
      FROM pg_indexes
      WHERE schemaname = 'public'
        AND tablename = 'chunks'
    `;
    const idxByName = new Map(indexes.map((idx) => [idx.indexname, idx.indexdef]));

    expect(idxByName.get("chunks_text_tsv_gin_idx") ?? "").toMatch(/USING gin/i);
    const ivfflat = idxByName.get("chunks_embedding_ivfflat_idx");
    // IVFFlat index is created conservatively (only after enough vectors exist).
    if (ivfflat) {
      expect(ivfflat).toMatch(/USING ivfflat/i);
      expect(ivfflat).toMatch(/vector_cosine_ops/i);
    }
  }, 20_000);

  it("orders semantic results by cosine distance (<=>)", async () => {
    const folderId = `fld_${randomUUID()}`;
    const documentId = `doc_${randomUUID()}`;
    const indexVersion = "v1";

    await sql`INSERT INTO folders (id, name, state) VALUES (${folderId}, 'vector schema test', 'ready')`;
    await sql`
      INSERT INTO documents (id, folder_id, filename, mime, bytes, parse_status, ocr_status)
      VALUES (${documentId}, ${folderId}, 'vectors.txt', 'text/plain', 0, 'parsed', 'done')
    `;

    const dim = 1536;
    const chkA = `chk_${randomUUID()}`;
    const chkB = `chk_${randomUUID()}`;
    const chkC = `chk_${randomUUID()}`;
    const vecA = oneHotVectorLiteral(dim, 0, 1);
    const vecB = oneHotVectorLiteral(dim, 1, 1);
    const vecC = oneHotVectorLiteral(dim, 0, -1);

    await sql`
      INSERT INTO chunks (
        id,
        document_id,
        index_version,
        chunk_index,
        page_start,
        page_end,
        text,
        metadata_json,
        text_hash,
        embedding
      )
      VALUES (
        ${chkA},
        ${documentId},
        ${indexVersion},
        0,
        1,
        1,
        'chunk a',
        ${sql.json({})},
        'h_a',
        ${vecA}::vector
      ),
      (
        ${chkB},
        ${documentId},
        ${indexVersion},
        1,
        1,
        1,
        'chunk b',
        ${sql.json({})},
        'h_b',
        ${vecB}::vector
      ),
      (
        ${chkC},
        ${documentId},
        ${indexVersion},
        2,
        1,
        1,
        'chunk c',
        ${sql.json({})},
        'h_c',
        ${vecC}::vector
      )
    `;

    const queryVec = vecA;

    const rows = await sql<Array<{ id: string; dist: number }>>`
      SELECT id, (embedding <=> ${queryVec}::vector) AS dist
      FROM chunks
      WHERE id IN (${chkA}, ${chkB}, ${chkC})
      ORDER BY embedding <=> ${queryVec}::vector ASC
    `;

    expect(rows.map((r) => r.id)).toEqual([chkA, chkB, chkC]);
    expect(rows[0]?.dist).toBeCloseTo(0, 6);
    expect(rows[1]?.dist).toBeCloseTo(1, 6);
    expect(rows[2]?.dist).toBeCloseTo(2, 6);

    await sql`DELETE FROM chunks WHERE document_id = ${documentId} AND index_version = ${indexVersion}`;
    await sql`DELETE FROM documents WHERE id = ${documentId}`;
    await sql`DELETE FROM folders WHERE id = ${folderId}`;
  }, 20_000);
});
