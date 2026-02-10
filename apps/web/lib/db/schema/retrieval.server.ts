import "server-only";

import type { Sql } from "../../db.server";

const IVFFLAT_CREATE_MIN_VECTORS = 500;

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function computeIvfflatLists(nVectors: number): number {
  // PRD guidance: lists = clamp(1, 100, floor(nVectors / 1000)).
  const lists = Math.floor(nVectors / 1000);
  return Math.max(1, Math.min(100, lists));
}

function isIndexCreateRace(err: unknown): boolean {
  if (!err || typeof err !== "object") return false;
  const e = err as { code?: string; constraint?: string; message?: string };

  // Most common: concurrent CREATE INDEX IF NOT EXISTS races inside pg_catalog.
  if (e.code === "23505" && e.constraint === "pg_class_relname_nsp_index") return true;
  if (e.code === "42P07") return true;
  if (e.code === "42710") return true;
  if (typeof e.message === "string" && e.message.includes("pg_class_relname_nsp_index")) return true;

  return false;
}

async function indexExists(sql: Sql, indexName: string): Promise<boolean> {
  const rows = await sql<Array<{ exists: boolean }>>`
    SELECT to_regclass(${indexName}) IS NOT NULL AS exists
  `;
  return rows[0]?.exists ?? false;
}

async function createIndexSafely(
  sql: Sql,
  indexName: string,
  create: () => Promise<void>,
): Promise<void> {
  try {
    await create();
  } catch (err) {
    if (!isIndexCreateRace(err)) throw err;
    if (await indexExists(sql, indexName)) return;
    throw err;
  }
}

async function ensurePgvectorEnabled(sql: Sql): Promise<boolean> {
  const rows = await sql<Array<{ enabled: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') AS enabled
  `;
  if (rows[0]?.enabled) return true;

  try {
    await sql`CREATE EXTENSION vector;`;
    return true;
  } catch (err) {
    // pgvector isn't guaranteed in every environment (eg. hosted PG without
    // extensions). Degrade to lexical-only and make it explicit in logs.
    console.warn("retrieval.pgvector_disabled", { message: safeErrMessage(err) });
    return false;
  }
}

export async function ensureRetrievalSchema(sql: Sql): Promise<void> {
  // Minimal chunk substrate to satisfy folder state invariants.
  await sql`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      index_version TEXT NOT NULL,
      chunk_index INT NOT NULL,
      page_start INT NULL,
      page_end INT NULL,
      text TEXT NOT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      text_hash TEXT NOT NULL,
      text_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', "text")) STORED,
      embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small',
      embedded_at TIMESTAMPTZ NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, index_version, chunk_index)
    );
  `;

  // CREATE TABLE IF NOT EXISTS won't backfill for existing dev DBs.
  await sql`
    ALTER TABLE chunks
    ADD COLUMN IF NOT EXISTS text_tsv tsvector GENERATED ALWAYS AS (to_tsvector('english', "text")) STORED
  `;
  await sql`
    ALTER TABLE chunks
    ADD COLUMN IF NOT EXISTS embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small'
  `;
  await sql`ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedded_at TIMESTAMPTZ NULL`;

  await createIndexSafely(sql, "public.chunks_text_tsv_gin_idx", async () => {
    await sql`
      CREATE INDEX IF NOT EXISTS chunks_text_tsv_gin_idx
      ON chunks USING GIN (text_tsv)
    `;
  });

  const pgvectorEnabled = await ensurePgvectorEnabled(sql);
  if (!pgvectorEnabled) return;

  // Semantic retrieval substrate.
  await sql`ALTER TABLE chunks ADD COLUMN IF NOT EXISTS embedding vector(1536)`;

  // Create IVFFlat conservatively. `vector_cosine_ops` uses cosine distance (<=>).
  const vecCounts = await sql<Array<{ n_vectors: number }>>`
    SELECT count(*)::int AS n_vectors
    FROM chunks
    WHERE embedding IS NOT NULL
  `;
  const nVectors = vecCounts[0]?.n_vectors ?? 0;
  if (nVectors < IVFFLAT_CREATE_MIN_VECTORS) return;
  const lists = computeIvfflatLists(nVectors);

  // DDL option values can't be parameterized reliably; clamp lists and inject.
  await createIndexSafely(sql, "public.chunks_embedding_ivfflat_idx", async () => {
    await sql.unsafe(
      `CREATE INDEX IF NOT EXISTS chunks_embedding_ivfflat_idx
       ON chunks USING ivfflat (embedding vector_cosine_ops)
       WITH (lists = ${lists})
       WHERE embedding IS NOT NULL`,
    );
  });
}
