import type { HybridSearchHit } from "./types";

export type LexicalBranchHit = {
  chunk_id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  lex_score: number;
};

export type SemanticBranchHit = {
  chunk_id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  sem_score: number;
};

type ScoreParts = { lex?: number; sem?: number };

function safeFiniteNumber(input: unknown): number {
  const n = typeof input === "number" ? input : Number(input);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Merge lexical + semantic branch hits into a deterministic ranked list.
 *
 * Determinism: stable across identical inputs, with a `chunk_id` tie-breaker.
 */
export function mergeHybridHits(args: {
  lexHits: LexicalBranchHit[];
  semHits: SemanticBranchHit[];
  kFinal: number;
  lexWeight: number;
  semWeight: number;
}): HybridSearchHit[] {
  const kFinal = Math.max(0, Math.floor(args.kFinal));
  if (kFinal === 0) return [];

  const lexWeight = safeFiniteNumber(args.lexWeight);
  const semWeight = safeFiniteNumber(args.semWeight);

  const byChunkId = new Map<
    string,
    {
      chunk_id: string;
      document_id: string;
      page_start: number | null;
      page_end: number | null;
      parts: ScoreParts;
    }
  >();

  for (const h of args.lexHits) {
    byChunkId.set(h.chunk_id, {
      chunk_id: h.chunk_id,
      document_id: h.document_id,
      page_start: h.page_start,
      page_end: h.page_end,
      parts: { lex: safeFiniteNumber(h.lex_score) },
    });
  }

  for (const h of args.semHits) {
    const existing = byChunkId.get(h.chunk_id);
    if (existing) {
      existing.parts.sem = safeFiniteNumber(h.sem_score);
      continue;
    }
    byChunkId.set(h.chunk_id, {
      chunk_id: h.chunk_id,
      document_id: h.document_id,
      page_start: h.page_start,
      page_end: h.page_end,
      parts: { sem: safeFiniteNumber(h.sem_score) },
    });
  }

  const merged: HybridSearchHit[] = [];
  for (const row of byChunkId.values()) {
    const lex = row.parts.lex ?? 0;
    const sem = row.parts.sem ?? 0;
    merged.push({
      chunk_id: row.chunk_id,
      document_id: row.document_id,
      page_start: row.page_start,
      page_end: row.page_end,
      score: lexWeight * lex + semWeight * sem,
      lex_score: row.parts.lex,
      sem_score: row.parts.sem,
    });
  }

  merged.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.chunk_id < b.chunk_id) return -1;
    if (a.chunk_id > b.chunk_id) return 1;
    return 0;
  });

  return merged.slice(0, kFinal);
}

