import "server-only";

import { embed } from "ai";

import { embeddingModel } from "../ai/gateway.server";
import { ensureSchema, sql } from "../db.server";

import { mergeHybridHits, type LexicalBranchHit, type SemanticBranchHit } from "./mergeHybridHits";
import type { HybridSearchHit, HybridSearchOpts } from "./types";

export const DEFAULT_HYBRID_SEARCH_TUNING = {
  kLex: 20,
  kSem: 20,
  kFinal: 10,
  lexWeight: 0.55,
  semWeight: 0.45,
} as const;

type ResolvedHybridSearchOpts = {
  kLex: number;
  kSem: number;
  kFinal: number;
  lexWeight: number;
  semWeight: number;
  probes: number | null;
};

export type HybridSearchDebug = {
  semanticEnabled: boolean;
  semanticDisabledReason: string | null;
  nVectors: number;
  lists: number;
  probes: number;
  kLex: number;
  kSem: number;
  kFinal: number;
  hitCountsLex: number;
  hitCountsSem: number;
};

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

function computeIvfflatLists(nVectors: number): number {
  // PRD guidance: lists = clamp(1, 100, floor(nVectors / 1000)).
  const lists = Math.floor(nVectors / 1000);
  return Math.max(1, Math.min(100, lists));
}

function toNonNegativeIntOrNull(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  const i = Math.floor(n);
  if (i < 0) return null;
  return i;
}

function toFiniteNumberOrNull(value: unknown): number | null {
  if (value === undefined || value === null) return null;
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return null;
  return n;
}

function resolveHybridSearchOpts(opts?: HybridSearchOpts): ResolvedHybridSearchOpts {
  const kLex = toNonNegativeIntOrNull(opts?.kLex) ?? DEFAULT_HYBRID_SEARCH_TUNING.kLex;
  const kSem = toNonNegativeIntOrNull(opts?.kSem) ?? DEFAULT_HYBRID_SEARCH_TUNING.kSem;
  const kFinal = toNonNegativeIntOrNull(opts?.kFinal) ?? DEFAULT_HYBRID_SEARCH_TUNING.kFinal;
  const lexWeight = toFiniteNumberOrNull(opts?.lexWeight) ?? DEFAULT_HYBRID_SEARCH_TUNING.lexWeight;
  const semWeight = toFiniteNumberOrNull(opts?.semWeight) ?? DEFAULT_HYBRID_SEARCH_TUNING.semWeight;
  const probes = toNonNegativeIntOrNull(opts?.probes);

  return { kLex, kSem, kFinal, lexWeight, semWeight, probes };
}

function vectorLiteral(embedding: unknown): string {
  if (!Array.isArray(embedding)) throw new Error("Embedding is not an array.");
  if (embedding.length !== 1536) throw new Error(`Embedding length must be 1536 (got ${embedding.length}).`);

  const parts: string[] = [];
  for (const n of embedding) {
    const v = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(v)) throw new Error("Embedding contains a non-finite value.");
    parts.push(String(v));
  }

  return `[${parts.join(",")}]`;
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

async function countVectors(args: { folderId: string; indexVersion: string }): Promise<number> {
  const rows = await sql<Array<{ n_vectors: number }>>`
    SELECT count(*)::int AS n_vectors
    FROM chunks c
    JOIN documents d ON d.id = c.document_id
    WHERE d.folder_id = ${args.folderId}
      AND c.index_version = ${args.indexVersion}
      AND c.embedding IS NOT NULL
  `;
  return rows[0]?.n_vectors ?? 0;
}

async function runLexicalBranch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  kLex: number;
}): Promise<LexicalBranchHit[]> {
  if (args.kLex <= 0) return [];
  const queryText = args.queryText.trim();
  if (!queryText) return [];

  try {
    const rows = await sql<LexicalBranchHit[]>`
      WITH q AS (
        SELECT websearch_to_tsquery('english', ${queryText}) AS query
      )
      SELECT
        c.id AS chunk_id,
        c.document_id,
        c.page_start,
        c.page_end,
        ts_rank_cd(c.text_tsv, q.query)::float8 AS lex_score
      FROM chunks c
      JOIN documents d ON d.id = c.document_id
      CROSS JOIN q
      WHERE d.folder_id = ${args.folderId}
        AND c.index_version = ${args.indexVersion}
        AND c.text_tsv @@ q.query
      ORDER BY lex_score DESC, c.id ASC
      LIMIT ${args.kLex}
    `;
    return rows;
  } catch (err) {
    // User input can produce unexpected tsquery parse errors. Degrade to empty
    // lexical hits (semantic may still apply).
    // eslint-disable-next-line no-console
    console.warn("retrieval.lexical_failed", { message: safeErrMessage(err) });
    return [];
  }
}

async function runSemanticBranch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  kSem: number;
  probes: number;
}): Promise<{ hits: SemanticBranchHit[]; ok: true } | { ok: false; reason: string }> {
  if (args.kSem <= 0) return { ok: false, reason: "KSEM_ZERO" };
  const queryText = args.queryText.trim();
  if (!queryText) return { ok: false, reason: "QUERY_EMPTY" };

  let qvecLiteral: string;
  try {
    const model = embeddingModel();
    const embedded = await embed({ model, value: queryText, maxRetries: 1 });
    qvecLiteral = vectorLiteral(embedded.embedding);
  } catch (err) {
    // If embeddings aren't configured/available, degrade to lexical-only.
    // eslint-disable-next-line no-console
    console.warn("retrieval.semantic_embed_failed", { message: safeErrMessage(err) });
    return { ok: false, reason: "EMBED_FAILED" };
  }

  try {
    const rows = await sql.begin(async (tx) => {
      const t = tx as unknown as typeof sql;
      // Avoid leaking a session-level probes value across pooled connections.
      await t`SET LOCAL ivfflat.probes = ${args.probes}`;
      return t<SemanticBranchHit[]>`
        SELECT
          c.id AS chunk_id,
          c.document_id,
          c.page_start,
          c.page_end,
          (1 - (c.embedding <=> ${qvecLiteral}::vector))::float8 AS sem_score
        FROM chunks c
        JOIN documents d ON d.id = c.document_id
        WHERE d.folder_id = ${args.folderId}
          AND c.index_version = ${args.indexVersion}
          AND c.embedding IS NOT NULL
        ORDER BY c.embedding <=> ${qvecLiteral}::vector ASC, c.id ASC
        LIMIT ${args.kSem}
      `;
    });

    return { ok: true, hits: rows };
  } catch (err) {
    // Semantic queries can fail if pgvector isn't available or the schema is
    // missing in a given environment.
    // eslint-disable-next-line no-console
    console.warn("retrieval.semantic_query_failed", { message: safeErrMessage(err) });
    return { ok: false, reason: "SEM_QUERY_FAILED" };
  }
}

async function hybridSearchInternal(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
  traceId?: string;
  log?: boolean;
}): Promise<{ hits: HybridSearchHit[]; debug: HybridSearchDebug }> {
  await ensureSchema();

  const resolved = resolveHybridSearchOpts(args.opts);

  const lexHits = await runLexicalBranch({
    folderId: args.folderId,
    indexVersion: args.indexVersion,
    queryText: args.queryText,
    kLex: resolved.kLex,
  });

  let semanticEnabled = false;
  let semanticDisabledReason: string | null = null;
  let nVectors = 0;
  let lists = 0;
  let probes = 0;

  let semHits: SemanticBranchHit[] = [];

  if (resolved.kSem <= 0) {
    semanticDisabledReason = "KSEM_ZERO";
  } else if (!(await isPgvectorEnabled())) {
    semanticDisabledReason = "PGVECTOR_DISABLED";
  } else if (!(await embeddingColumnExists())) {
    semanticDisabledReason = "EMBEDDING_COLUMN_MISSING";
  } else {
    nVectors = await countVectors({ folderId: args.folderId, indexVersion: args.indexVersion });
    lists = computeIvfflatLists(nVectors);
    const defaultProbes = Math.min(10, lists);
    probes = Math.max(1, Math.min(lists, resolved.probes ?? defaultProbes));

    const sem = await runSemanticBranch({
      folderId: args.folderId,
      indexVersion: args.indexVersion,
      queryText: args.queryText,
      kSem: resolved.kSem,
      probes,
    });

    if (sem.ok) {
      semanticEnabled = true;
      semHits = sem.hits;
    } else {
      semanticDisabledReason = sem.reason;
    }
  }

  const effectiveLexWeight = semanticEnabled ? resolved.lexWeight : 1;
  const effectiveSemWeight = semanticEnabled ? resolved.semWeight : 0;

  const hits = mergeHybridHits({
    lexHits,
    semHits,
    kFinal: resolved.kFinal,
    lexWeight: effectiveLexWeight,
    semWeight: effectiveSemWeight,
  });

  const debug: HybridSearchDebug = {
    semanticEnabled,
    semanticDisabledReason,
    nVectors,
    lists,
    probes,
    kLex: resolved.kLex,
    kSem: resolved.kSem,
    kFinal: resolved.kFinal,
    hitCountsLex: lexHits.length,
    hitCountsSem: semHits.length,
  };

  if (args.log) {
    // eslint-disable-next-line no-console
    console.info("retrieval.hybrid_search", {
      trace_id: args.traceId ?? null,
      nVectors: debug.nVectors,
      lists: debug.lists,
      probes: debug.probes,
      kLex: debug.kLex,
      kSem: debug.kSem,
      kFinal: debug.kFinal,
      hitCountsLex: debug.hitCountsLex,
      hitCountsSem: debug.hitCountsSem,
      semanticEnabled: debug.semanticEnabled,
      semanticDisabledReason: debug.semanticDisabledReason,
    });
  }

  return { hits, debug };
}

export async function hybridSearch(
  folderId: string,
  indexVersion: string,
  queryText: string,
  opts?: HybridSearchOpts,
): Promise<HybridSearchHit[]>;
export async function hybridSearch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
}): Promise<HybridSearchHit[]>;
export async function hybridSearch(
  folderIdOrArgs: string | { folderId: string; indexVersion: string; queryText: string; opts?: HybridSearchOpts },
  indexVersion?: string,
  queryText?: string,
  opts?: HybridSearchOpts,
): Promise<HybridSearchHit[]> {
  const normalized =
    typeof folderIdOrArgs === "string"
      ? { folderId: folderIdOrArgs, indexVersion: indexVersion ?? "", queryText: queryText ?? "", opts }
      : folderIdOrArgs;

  const { hits } = await hybridSearchInternal({ ...normalized });
  return hits;
}

export async function hybridSearchWithDebug(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
  traceId?: string;
}): Promise<{ hits: HybridSearchHit[]; debug: HybridSearchDebug }> {
  return hybridSearchInternal({ ...args, log: true });
}

