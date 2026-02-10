# PRD: 0011a Hybrid Retrieval Substrate v0 (tsvector + pgvector IVFFlat)

Owner: marc
Status: Draft
Date: 2026-02-09
Slug: 0011a_hybrid-retrieval-v0

## Introduction / Overview

### Problem
Today, Orbital ingest produces `document_pages.text` and a minimal `chunks` table, but chunks are not searchable. There is no lexical or semantic retrieval substrate to support evidence-first features (chat, quick start, etc).

Current code reality:
- Chunking is “1 chunk per page” (`apps/web/lib/ingest/ingestProcessor.server.ts`).
- No tsvector, no embeddings, no retrieval function (`docs/03-architecture/07_current_poc_runtime.md`).

### Goal
Implement a deterministic hybrid retrieval capability that returns ranked `chunk_id`s for a query and can be tuned/debugged without “magic”.

### Slice
Create the v0 hybrid search substrate:
- deterministic chunking suitable for citations
- lexical search via tsvector
- semantic search via pgvector embeddings + IVFFlat
- IDs-only `hybridSearch()` contract (chat hydrates separately)

### Primary Observable Effect
Before: queries have no retrieval path; evidence-first flows cannot be built on real documents.  
After: a dev-only spike endpoint and/or harness can retrieve relevant `chunk_id`s for a query in a folder, with scores and tuning knobs logged.

### In Scope
- Upgrade chunking from per-page to small deterministic chunks (char window).
- Add lexical index (tsvector + GIN) for `chunks`.
- Add semantic index (pgvector embeddings + IVFFlat) for `chunks`.
- Implement `hybridSearch()` in `apps/web` as a server-only module, using “two queries + merge in TS” for debuggability.
  - Optional: extract the **pure merge/scoring logic** into `packages/core` (but keep DB + AI calls in `apps/web`).
- Add a dev-only debug endpoint under `/spikes/*` (in `apps/web`) to validate retrieval.

## Goals
- `hybridSearch()` returns stable results for a fixed DB state and query.
- Chunking is deterministic and produces citable snippets (not whole-page blobs).
- Vector index creation is safe for small datasets (avoid “too little data” IVFFlat pitfalls).
- Retrieval can be debugged with explicit logs: lists/probes/hit counts/latency.

## User Stories

### US-001: Ingest Produces Deterministic Small Chunks
As a developer, I want ingest to produce small deterministic chunks per page, so that citations are precise and retrieval has a meaningful unit.

#### Acceptance Criteria
- AC-001: Ingest replaces “1 chunk per page” with deterministic char-window chunking:
  - `max_chars = 1500`
  - `overlap_chars = 200`
  - boundaries prefer whitespace when possible
- AC-002: Chunk metadata persists in `chunks.metadata_json` including:
  - `chunker_id: "char_window_v0"`
  - `page_number`
  - `char_start`, `char_end`
- AC-003: Chunk uniqueness remains idempotent via `UNIQUE(document_id, index_version, chunk_index)`.

#### Verification
- Unit test: same input text => same chunk boundaries and hashes.
- Integration: ingest a 2-page fixture PDF and observe `chunks` count > page count.

### US-002: Chunks Are Searchable Lexically And Semantically
As a developer, I want chunks to have both lexical and vector search fields, so that we can retrieve evidence for both exact matches and conceptual matches.

#### Acceptance Criteria
- AC-004: `chunks` gains these columns:
  - `text_tsv tsvector`
  - `embedding vector(1536)`
  - `embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small'`
  - `embedded_at TIMESTAMPTZ NULL`
- AC-005: Lexical index exists: `GIN(chunks.text_tsv)`.
- AC-006: Semantic indexing exists:
  - pgvector extension enabled (otherwise semantic retrieval is disabled and the system degrades to lexical-only, explicitly observable)
  - IVFFlat index on `embedding vector_cosine_ops` is created *conservatively* (see Technical Considerations).

#### Verification
- Schema validation: columns exist and indexes exist.
- Integration: stub vectors in DB and validate semantic query ordering.

### US-003: Hybrid Search Contract Returns Ranked Chunk IDs
As a feature builder (chat, quick start), I want a single `hybridSearch()` function that returns ranked chunk hits, so that downstream features can be built without duplicating retrieval logic.

#### Acceptance Criteria
- AC-007: `hybridSearch({ folderId, indexVersion, queryText, opts })` returns:
  - `chunk_id`, `document_id`, `page_start`, `page_end`
  - merged ranking from lexical + semantic branches
  - optional per-branch scores (`lex_score`, `sem_score`) for debugging
- AC-008: Default tuning is explicit:
  - `kLex=20`, `kSem=20`, `kFinal=10`
  - `lexWeight=0.55`, `semWeight=0.45`
- AC-009: A dev-only debug endpoint exists under `/spikes/retrieval/*` to call `hybridSearch()` and inspect results.
- AC-010: Logs include `{nVectors, lists, probes, kLex, kSem, kFinal, hitCountsLex, hitCountsSem}`.
- AC-011: A small golden-questions smoke fixture exists (3-10 queries) that asserts an expected doc/page appears in top K results for a seeded fixture folder.

#### Verification
- Unit test: merge scoring is deterministic.
- Manual: run debug endpoint against a fixture pack folder and inspect top hits.
- Automated: run the golden-questions smoke fixture.

## Technical Considerations (Pinned Details)

### Query strategy (two queries + merge)

Lexical:
- `websearch_to_tsquery('english', query)`
- score via `ts_rank_cd(text_tsv, query)`

Semantic:
- embed query text (AI Gateway embeddings)
- `ORDER BY embedding <=> $qvec` (cosine distance)
- convert to similarity as: `sem_similarity = 1 - distance`

Merge:
- dedupe by `chunk_id`
- `score = lexWeight*lex + semWeight*sem`

### Retrieval smoke fixture (golden questions)

- Keep this small (3-10 representative queries).
- Assert a known expected document/page appears in top K for each query.
- Keep it CI-safe:
  - no live provider calls in tests (stub embeddings and/or validate lexical-only baselines).

### IVFFlat index creation (avoid tiny-dataset footguns)

- Compute `nVectors = count(*) where embedding is not null`.
- Compute conservative lists:
  - `lists = clamp(1, 100, floor(nVectors / 1000))`
- Default probes:
  - `probes = min(10, lists)`
- Create the IVFFlat index only when:
  - index missing AND `nVectors >= 500` (tunable)

This makes early behavior predictable and avoids confusing “limited results” outcomes when data is tiny.

### Chunking upgrade

- Keep `document_pages.text` as-is.
- Replace “1 chunk per page” with “N chunks per page” using the char-window chunker.
- Store chunker metadata in `chunks.metadata_json`.

### Embedding pipeline

- Embed each chunk’s text with `openai/text-embedding-3-small` (via AI Gateway wrapper).
- Validate vector length is 1536 (fail closed otherwise).
- Store `embedding`, `embedded_at`, and `embedding_model`.
- Enforce a max chunk count per document/index_version to cap cost.

## Functional Requirements
- FR-001: Chunking must be deterministic for a given `(document_id, index_version)` input.
- FR-002: Hybrid retrieval must be “IDs-only” at the contract boundary (return chunk IDs + metadata).
- FR-003: Lexical retrieval uses Postgres tsvector query strategy suitable for user input (`websearch_to_tsquery`).
- FR-004: Semantic retrieval uses pgvector cosine distance and supports IVFFlat.
- FR-005: Vector index creation must be explicit and safe for small datasets (threshold + conservative lists).
- FR-006: Debug-only routes must live under `/spikes/*` and be gated (no new dev-only endpoints at target paths).

## Non-Goals (Out of Scope)
- Reranker model.
- Cross-folder retrieval.
- OCR geometry and precise highlights.
- Production-grade retrieval eval harness beyond minimal tests/debug endpoint.

## Failure States & UX
- If pgvector extension is missing/unavailable:
  - degrade to lexical-only (semantic branch disabled) and make it observable in logs and the debug endpoint.
- If embeddings provider fails:
  - ingest fails closed for that document/index_version and surfaces a safe error state.
- Never return raw provider payloads or stack traces to clients; use the standard error envelope.

## Metrics / Logging
- Log retrieval latency and tuning knobs for debug endpoint calls.
- Record basic counters:
  - chunks embedded per document
  - embedding failures (by error code)

## Rollback / Disable Plan
- Feature flag the semantic branch (vector search) so the system can run lexical-only if needed.
- Ability to drop/recreate IVFFlat index when vector counts grow and tuning changes.

## Risks & Dependencies
- Depends on environment support for pgvector.
- Depends on having an AI Gateway embedding model wrapper (assumed in PRD0).
- IVFFlat tuning sensitivity (`lists`, `ivfflat.probes`).

## Success Metrics
- For a seeded pack, a representative query retrieves relevant chunks in the top K (manual proof is acceptable for v0).
- Chunk sizes support citations (snippets are not whole pages).
- Debug endpoint makes tuning behavior legible (no “black box” retrieval).

## Decisions (Resolved)
- When pgvector is missing/unavailable: degrade to lexical-only (semantic branch disabled) and make it observable (logs + debug endpoint).
- Retrieval quality: add a small golden-questions smoke fixture now (3-10 queries).
- `hybridSearch()` location: implement in `apps/web` (server-only); `apps/web` owns the spike route. Pure scoring helpers may live in `packages/core`.

## Sources
- `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md`
- `docs/04-projects/02-features/0011_chat_interface/plan.ms-0011a_hybrid-retrieval-v0.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/03-architecture/07_current_poc_runtime.md`
- `docs/03-architecture/50_api_surface.md`
