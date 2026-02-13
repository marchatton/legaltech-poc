import "server-only";

import { embedMany } from "ai";

import { embeddingModel } from "../ai/gateway.server";
import { sql } from "../db.server";
import { safeErrMessage } from "../safeErrMessage";

import { vectorLiteral } from "./vectorLiteral";

type PendingChunkRow = {
  id: string;
  text: string;
};

type SemanticPrimeSkipReason =
  | "AI_GATEWAY_API_KEY_MISSING"
  | "EMBED_MODEL_MISSING"
  | "PGVECTOR_DISABLED"
  | "EMBEDDING_COLUMN_MISSING"
  | "NO_PENDING_CHUNKS"
  | "EMBED_FAILED";

export type SemanticPrimeResult = {
  attempted: number;
  embedded: number;
  skippedReason: SemanticPrimeSkipReason | null;
};

const DEFAULT_BATCH_SIZE = 32;
const DEFAULT_MAX_CHUNKS_PER_CALL = 128;

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = Number(value?.trim());
  if (!Number.isFinite(n) || n <= 0) return fallback;
  return Math.floor(n);
}

function hasEmbeddingConfig(): SemanticPrimeSkipReason | null {
  if (!process.env.AI_GATEWAY_API_KEY?.trim()) return "AI_GATEWAY_API_KEY_MISSING";
  if (!process.env.EMBED_MODEL?.trim()) return "EMBED_MODEL_MISSING";
  return null;
}

async function isPgvectorEnabled(): Promise<boolean> {
  const rows = await sql<Array<{ enabled: boolean }>>`
    SELECT EXISTS (SELECT 1 FROM pg_extension WHERE extname = 'vector') AS enabled
  `;
  return rows[0]?.enabled ?? false;
}

async function embeddingColumnExists(): Promise<boolean> {
  const rows = await sql<Array<{ exists: boolean }>>`
    SELECT EXISTS (
      SELECT 1
      FROM information_schema.columns
      WHERE table_schema = 'public'
        AND table_name = 'chunks'
        AND column_name = 'embedding'
    ) AS exists
  `;
  return rows[0]?.exists ?? false;
}

async function listPendingChunksForFolder(args: {
  folderId: string;
  indexVersion: string;
  limit: number;
}): Promise<PendingChunkRow[]> {
  return sql<PendingChunkRow[]>`
    SELECT c.id, c.text
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.folder_id = ${args.folderId}
      AND c.index_version = ${args.indexVersion}
      AND c.embedding IS NULL
      AND length(trim(c.text)) > 0
    ORDER BY d.created_at ASC, d.id ASC, c.chunk_index ASC
    LIMIT ${args.limit}
  `;
}

async function listPendingChunksForDocument(args: {
  documentId: string;
  indexVersion: string;
  limit: number;
}): Promise<PendingChunkRow[]> {
  return sql<PendingChunkRow[]>`
    SELECT c.id, c.text
    FROM chunks c
    WHERE c.document_id = ${args.documentId}
      AND c.index_version = ${args.indexVersion}
      AND c.embedding IS NULL
      AND length(trim(c.text)) > 0
    ORDER BY c.chunk_index ASC
    LIMIT ${args.limit}
  `;
}

async function embedAndPersistPendingChunks(args: {
  pending: PendingChunkRow[];
  batchSize: number;
}): Promise<{ attempted: number; embedded: number }> {
  if (args.pending.length === 0) return { attempted: 0, embedded: 0 };

  let embedded = 0;
  const attempted = args.pending.length;
  const modelId = process.env.EMBED_MODEL?.trim() ?? "unknown";

  for (let i = 0; i < args.pending.length; i += args.batchSize) {
    const batch = args.pending.slice(i, i + args.batchSize);
    const values = batch.map((row) => row.text);
    const result = await embedMany({
      model: embeddingModel(),
      values,
      maxRetries: 1,
      maxParallelCalls: 2,
    });

    await sql.begin(async (tx) => {
      const t = tx as unknown as typeof sql;
      for (let j = 0; j < batch.length; j += 1) {
        const chunk = batch[j];
        const embedding = result.embeddings[j];
        if (!chunk || !embedding) continue;
        const literal = vectorLiteral(embedding);
        const updated = await t<Array<{ id: string }>>`
          UPDATE chunks
          SET embedding = ${literal}::vector,
              embedding_model = ${modelId},
              embedded_at = now()
          WHERE id = ${chunk.id}
            AND embedding IS NULL
          RETURNING id
        `;
        if (updated.length > 0) embedded += 1;
      }
    });
  }

  return { attempted, embedded };
}

type PrimeArgs = {
  indexVersion: string;
  maxChunks?: number;
  batchSize?: number;
  traceId?: string;
};

export async function primeFolderChunkEmbeddings(args: PrimeArgs & { folderId: string }): Promise<SemanticPrimeResult> {
  try {
    const configReason = hasEmbeddingConfig();
    if (configReason) return { attempted: 0, embedded: 0, skippedReason: configReason };

    if (!(await isPgvectorEnabled())) return { attempted: 0, embedded: 0, skippedReason: "PGVECTOR_DISABLED" };
    if (!(await embeddingColumnExists())) return { attempted: 0, embedded: 0, skippedReason: "EMBEDDING_COLUMN_MISSING" };

    const maxChunks = Math.max(
      1,
      args.maxChunks ?? parsePositiveInt(process.env.ORBITAL_CHAT_EMBED_MAX_CHUNKS, DEFAULT_MAX_CHUNKS_PER_CALL),
    );
    const batchSize = Math.max(
      1,
      args.batchSize ?? parsePositiveInt(process.env.ORBITAL_CHAT_EMBED_BATCH_SIZE, DEFAULT_BATCH_SIZE),
    );
    const pending = await listPendingChunksForFolder({
      folderId: args.folderId,
      indexVersion: args.indexVersion,
      limit: maxChunks,
    });
    if (pending.length === 0) return { attempted: 0, embedded: 0, skippedReason: "NO_PENDING_CHUNKS" };

    const result = await embedAndPersistPendingChunks({ pending, batchSize });
    return { ...result, skippedReason: null };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("retrieval.semantic_prime_folder_failed", {
      folder_id: args.folderId,
      index_version: args.indexVersion,
      trace_id: args.traceId ?? null,
      message: safeErrMessage(err),
    });
    return { attempted: 0, embedded: 0, skippedReason: "EMBED_FAILED" };
  }
}

export async function primeDocumentChunkEmbeddings(args: PrimeArgs & { documentId: string }): Promise<SemanticPrimeResult> {
  try {
    const configReason = hasEmbeddingConfig();
    if (configReason) return { attempted: 0, embedded: 0, skippedReason: configReason };

    if (!(await isPgvectorEnabled())) return { attempted: 0, embedded: 0, skippedReason: "PGVECTOR_DISABLED" };
    if (!(await embeddingColumnExists())) return { attempted: 0, embedded: 0, skippedReason: "EMBEDDING_COLUMN_MISSING" };

    const maxChunks = Math.max(
      1,
      args.maxChunks ?? parsePositiveInt(process.env.ORBITAL_INGEST_EMBED_MAX_CHUNKS, 512),
    );
    const batchSize = Math.max(
      1,
      args.batchSize ?? parsePositiveInt(process.env.ORBITAL_INGEST_EMBED_BATCH_SIZE, DEFAULT_BATCH_SIZE),
    );
    const pending = await listPendingChunksForDocument({
      documentId: args.documentId,
      indexVersion: args.indexVersion,
      limit: maxChunks,
    });
    if (pending.length === 0) return { attempted: 0, embedded: 0, skippedReason: "NO_PENDING_CHUNKS" };

    const result = await embedAndPersistPendingChunks({ pending, batchSize });
    return { ...result, skippedReason: null };
  } catch (err) {
    // eslint-disable-next-line no-console
    console.warn("retrieval.semantic_prime_document_failed", {
      document_id: args.documentId,
      index_version: args.indexVersion,
      trace_id: args.traceId ?? null,
      message: safeErrMessage(err),
    });
    return { attempted: 0, embedded: 0, skippedReason: "EMBED_FAILED" };
  }
}
