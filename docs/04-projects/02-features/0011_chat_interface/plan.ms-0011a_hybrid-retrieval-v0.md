# Plan.ms: 0011a Hybrid Retrieval Substrate v0 (tsvector + pgvector IVFFlat)

Last updated: 2026-02-09

Split source:
- `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md` (PRD A section)

Repo grounding:
- Current ingest writes 1 chunk per page: `apps/web/lib/ingest/ingestProcessor.server.ts`
- Target RAG posture (lexical + vector indexing): `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- Target API contract and spike gating rules: `docs/03-architecture/50_api_surface.md`
- Current runtime reality (no retrieval yet): `docs/03-architecture/07_current_poc_runtime.md`

Assumptions / prerequisites:
- PRD0 is already implemented (shared foundations): AI Gateway wrapper + schema seams + retrieval types contract.
- Dev-only routes exist today and are being migrated. Any debug-only endpoints added for this slice must live under `/spikes/*` and be gated (per `docs/03-architecture/50_api_surface.md`).

## One-liner
Make `chunks` searchable via hybrid lexical + semantic retrieval, returning ranked `chunk_id`s (IDs-only contract).

## Primary Observable Effect (v0)
Before: chunks exist, but there is no way to search them (no tsvector, no embeddings, no retrieval function).
After: calling `hybridSearch(folder_id, index_version, query)` returns a ranked list of chunk IDs; a dev-only spike endpoint can be used to sanity-check hits and tuning knobs.

## Scope

In:
- Upgrade chunking from “1 chunk per page” to deterministic small chunks suitable for citations.
- Store embeddings on `chunks`.
- Store tsvector on `chunks`.
- Implement `hybridSearch()` that returns ranked `HybridSearchHit[]`.
- Create GIN + IVFFlat indexes.
- Add a v0 debug spike endpoint for retrieval visibility.

Out:
- Reranker model.
- OCR/layout geometry.
- Entailment verification.
- Cross-folder retrieval.

## Data Model Changes (Concrete)

### `chunks` table additions

Add columns:
- `text_tsv tsvector`
  - Either a generated stored column or maintained by trigger/ingest write.
- `embedding vector(1536)`
- `embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small'`
- `embedded_at TIMESTAMPTZ NULL`

Note: 1536 is pinned to `openai/text-embedding-3-small`.

### Indexes

Lexical:
- `CREATE INDEX ... ON chunks USING gin (text_tsv);`

Vector (IVFFlat cosine):
- `CREATE INDEX ... ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = <computed>);`

## Retrieval Contract (IDs-only)

Implement a thin contract (library-first; chat calls it):

```ts
export type HybridSearchHit = {
  chunk_id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  score: number;
  lex_score?: number;
  sem_score?: number;
};

export type HybridSearchOpts = {
  kLex?: number; // default 20
  kSem?: number; // default 20
  kFinal?: number; // default 10
  lexWeight?: number; // default 0.55
  semWeight?: number; // default 0.45
  probes?: number; // default min(10, lists)
};

export async function hybridSearch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
}): Promise<HybridSearchHit[]>;
```

## Query Strategy (Keep It Simple + Debuggable)

Do **two DB queries + merge in TS** first.

1) Lexical hits
- `websearch_to_tsquery('english', query)`
- score with `ts_rank_cd(text_tsv, query)`
- cap at `kLex`

2) Semantic hits
- embed query text via AI Gateway embeddings
- `ORDER BY embedding <=> $qvec` (cosine distance)
- cap at `kSem`
- for IVFFlat, set `ivfflat.probes` per request/session in debug builds

3) Merge
- dedupe by `chunk_id`
- convert semantic distance to similarity: `sem_similarity = 1 - distance`
- compute final score:
  - `score = lexWeight*lex + semWeight*sem`
- return top `kFinal`

## Probes + Lists (The Footgun Plan)

Defaults:
- `kLex=20`, `kSem=20`, `kFinal=10`
- `lexWeight=0.55`, `semWeight=0.45`

IVFFlat knobs:
- Compute `lists` conservatively from data size:
  - `lists = clamp(1, 100, floor(nVectors / 1000))`
- Default probes:
  - `probes = min(10, lists)`

Logging (required for debugability):
- `{nVectors, lists, probes, kLex, kSem, kFinal, hitCountsLex, hitCountsSem}`

## Ingest + Embedding Pipeline (v0 Upgrade)

Current state:
- `apps/web/lib/ingest/ingestProcessor.server.ts` writes 1 chunk per page.

Minimal upgrade path (still deterministic):
- Keep `document_pages.text` as-is.
- Replace “1 chunk per page” with “N chunks per page” using a character window chunker:
  - `max_chars = 1500`
  - `overlap_chars = 200`
  - split on whitespace boundaries when possible
- Store in `chunks.metadata_json`:
  - `chunker_id: "char_window_v0"`
  - params
  - `page_number`
  - `char_start`, `char_end`

Embedding:
- Model: `openai/text-embedding-3-small` (via AI Gateway wrapper)
- Validate embedding length is 1536 (fail closed otherwise)
- Persist `embedding`, `embedded_at`, `embedding_model`

Operational cap:
- Enforce a max chunk count per document/index_version to avoid runaway embedding cost.

## IVFFlat Safe Index Creation

Do not create an IVFFlat index “blindly” on day 1.

v0 strategy:
- Create table + columns + GIN index immediately.
- Create IVFFlat index via an `ensureVectorIndex` function that:
  - checks `nVectors = count(*) where embedding is not null`
  - computes `lists`
  - creates the index if missing and `nVectors >= 500` (tunable)

This keeps behavior sane for tiny datasets and avoids confusing “fewer results than expected” behavior.

## Debug Endpoint (Dev-only)

Add a dev-only spike endpoint (must be under `/spikes/*` and gated):
- `GET /spikes/retrieval/hybrid-search?folder_id=...&index_version=...&q=...`

Returns:
- top hits with `chunk_id`, `document_id`, pages, and scores
- tuning context (lists/probes/nVectors)

## Tests / Evals (Light But Real)

- Unit test: chunker determinism (same input -> same chunks).
- Integration test: insert a few chunks with stub vectors and verify:
  - lexical query returns expected chunk_id
  - semantic query returns expected chunk_id
  - merge ordering stable for fixed inputs

## Risks + Mitigations

- pgvector extension availability:
  - Mitigation: update local/docker Postgres image to include pgvector; fail closed with a safe error if extension is missing.
- IVFFlat tuning footguns:
  - Mitigation: delay index creation until there’s data, compute conservative lists, make probes explicit.
- Embedding cost drift:
  - Mitigation: cap chunk count; store `embedding_model` and `embedded_at`; avoid re-embedding unchanged chunks.

## Open Questions

1) When pgvector is unavailable, what is the fallback?
- A. Fail closed with a safe error (correctness-first)
- B. Degrade to lexical-only search (demo-first)

2) Where should `hybridSearch()` live long-term?
- A. `apps/web/lib/retrieval/*` (web-only)
- B. `packages/core/*` (shared) with DB adapters in `apps/web`

3) Should we add a golden-questions Recall@K harness in this slice?
- A. Yes (small, fixture-backed)
- B. No (debug endpoint only for v0)
