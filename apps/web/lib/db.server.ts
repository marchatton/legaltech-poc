import "server-only";

import postgres from "postgres";

export type Sql = ReturnType<typeof postgres>;

type GlobalDb = typeof globalThis & {
  __orbitalSql?: Sql;
  __orbitalSchemaReady?: Promise<void>;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Some Sprite environments route `localhost` to an IPv6 host that Postgres
    // does not accept by default. Normalise to IPv4 for local/dev.
    if (process.env.NODE_ENV !== "production" && url.includes("@localhost:")) {
      return url.replace("@localhost:", "@127.0.0.1:");
    }
    return url;
  }

  // PoC default for local dev (matches docker-compose.yml).
  if (process.env.NODE_ENV !== "production") {
    return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
  }

  throw new Error("DATABASE_URL is required in production.");
}

function createSql(): Sql {
  return postgres(databaseUrl(), {
    // Keep the pool small; Next dev reloads modules frequently.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const g = globalThis as GlobalDb;

export const sql: Sql = g.__orbitalSql ?? createSql();
if (!g.__orbitalSql) g.__orbitalSql = sql;

async function ensureSchemaInner(): Promise<void> {
  // Folders (Matters)
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('empty','ingesting','indexed','ready','failed')),
      latest_index_version TEXT NOT NULL DEFAULT 'v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      bytes BIGINT NOT NULL,
      sha256 TEXT NULL,
      storage_key TEXT UNIQUE,
      upload_completed_at TIMESTAMPTZ NULL,
      parse_status TEXT NOT NULL CHECK (parse_status IN ('queued','parsing','parsed','failed')),
      ocr_status TEXT NOT NULL CHECK (ocr_status IN ('queued','running','done','failed')),
      page_count INT NULL,
      extraction_quality REAL NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Per-page OCR/layout output.
  await sql`
    CREATE TABLE IF NOT EXISTS document_pages (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      page_number INT NOT NULL,
      text TEXT NOT NULL,
      layout_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, page_number)
    );
  `;

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
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, index_version, chunk_index)
    );
  `;

  // Runs (Quick Start execution attempts)
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('created','running','completed','partial','failed','cancelled')),
      index_version TEXT NOT NULL,
      agent_bundle_version TEXT NOT NULL,
      question_set_version TEXT NOT NULL,
      idempotency_key TEXT NULL,
      trace_id TEXT NULL,
      questions_total INT NOT NULL DEFAULT 0,
      questions_done INT NOT NULL DEFAULT 0,
      failure_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (folder_id, idempotency_key)
    );
  `;

  // Durable step execution log. Steps are responsible for idempotency via step_key.
  await sql`
    CREATE TABLE IF NOT EXISTS run_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      step_type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      attempt INT NOT NULL DEFAULT 1,
      step_key TEXT NOT NULL,
      trace_id TEXT NULL,
      question_id TEXT NULL,
      metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, step_key)
    );
  `;

  // Report rows are the durable, per-question output of a run (terminal statuses only).
  await sql`
    CREATE TABLE IF NOT EXISTS report_rows (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      question_set_version TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('needs_review','reviewed','missing_input','citation_failed')),
      notes TEXT NULL,
      provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      payload_schema_version TEXT NULL,
      payload_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, question_id),
      CHECK (status <> 'missing_input' OR answer = 'Not found in provided documents.')
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS report_rows_folder_run_idx
    ON report_rows(folder_id, run_id);
  `;

  // Locked citations associated to a report row. In this slice we may emit zero citations.
  await sql`
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
      document_id TEXT NOT NULL,
      page_number INT NOT NULL,
      snippet TEXT NOT NULL,
      snippet_hash TEXT NOT NULL,
      polygons_json JSONB NOT NULL,
      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS citations_report_row_idx
    ON citations(report_row_id);
  `;
}

export async function ensureSchema(): Promise<void> {
  if (!g.__orbitalSchemaReady) {
    g.__orbitalSchemaReady = ensureSchemaInner();
  }
  await g.__orbitalSchemaReady;
}
