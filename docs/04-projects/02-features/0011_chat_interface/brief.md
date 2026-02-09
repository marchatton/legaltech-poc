# Brief: 0011 Chat Interface (Evidence-First Q&A)

Date: 2026-02-09
Status: Shaping

Links:
- Strategy input: `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md`
- Plan.ms (retrieval): `docs/04-projects/02-features/0011_chat_interface/plan.ms-0011a_hybrid-retrieval-v0.md`
- Plan.ms (chat): `docs/04-projects/02-features/0011_chat_interface/plan.ms-0011b_matter-chat-v0.md`

## Problem

Orbital PoC can ingest PDFs into per-page text and minimal `chunks`, but there is no retrieval substrate (lexical + vector) and no chat interface to ask questions and see grounded evidence.

Without chat + sources:
- users cannot interactively explore a Matter with “show me where this is supported”
- the “evidence-first” product story is limited to fixture-backed demos

## Why Now

- The PoC already has: folders (“matters”), documents, per-page extracted text, and a minimal chunks substrate (`docs/03-architecture/07_current_poc_runtime.md`).
- The next leverage point is to make `chunks` searchable and then add a chat UI that uses those chunks as sources.

## Goals

- Hybrid retrieval substrate (lexical + semantic) that returns ranked chunk IDs for a query.
- Matter chat UI that streams assistant responses and shows locked sources (citations) per assistant message.
- Preserve trust posture: answer using sources; when unsupported, respond exactly `Not found in provided documents.`
- Keep integration thin and debuggable (tight feedback loops, minimal magic).

## Non-Goals (Explicitly Out Of Scope)

- Cross-matter chat, org switching, multi-tenant auth.
- Reranking models, entailment verification, or “agent loops”.
- OCR/layout geometry extraction (v0 uses coarse page-level highlight boxes).
- Perfecting the “move off dev-only routes” migration (unless it becomes a hard requirement for demo/prod enablement).

## Scope / Perimeter

We split the work into two thin PRDs (PRD0 assumed already implemented):

Prerequisite (assumed done):
- PRD0 shared foundations (AI Gateway wrapper, schema seams, retrieval types contract).

In scope now:
- `0011a` Hybrid Retrieval Substrate v0 (tsvector + pgvector IVFFlat, IDs-only `hybridSearch()`).
- `0011b` Matter Chat v0 (streaming + locked sources, WDK-aligned durability posture).

## Key User Flow (v0)

1) User opens a Matter.
2) User types a question.
3) Assistant streams an answer.
4) Under the answer, “Sources” show the cited pages/snippets.
5) Clicking a source opens an evidence viewer (PDF + highlight).

## Risks / Unknowns (Top 10)

1) WDK + AI SDK are target posture but not implemented today (per current runtime doc). Integration must stay thin.
2) pgvector availability in local/dev (and later demo/prod) environments.
3) IVFFlat tuning footguns (`lists`, `ivfflat.probes`) and “too little data” index creation.
4) Embedding cost drift (chunk count explosion, re-embedding loops).
5) No geometry: v0 highlight is coarse. Risk of users assuming precision.
6) Dev-only route drift: many current Matter surfaces are dev-only and fixture-backed while target API surface is broader.
7) Streaming + persistence correctness (avoid “half-written” assistant messages).
8) Retrieval quality without an eval harness (risk of “it feels bad” without diagnostics).
9) Schema evolution approach (runtime DDL today; modular seams assumed by PRD0).
10) Safety posture: never leak raw prompts/provider payloads; always safe error envelope.

## Open Questions (Top 10)

1) Do we need chat enabled in a production-build demo (`ORBITAL_MODE=demo-prod`), or dev-only first is acceptable?
2) Should `hybridSearch()` live in `apps/web` or be extracted into `packages/core` with adapters?
3) When pgvector is missing/unavailable, do we fail closed or degrade to lexical-only?
4) What is the minimum retrieval “good enough” proof: golden questions (Recall@K) vs manual debug endpoint only?
5) One thread per matter (simpler) or multiple threads (adds UI + state)?
6) How should sources render: chips under assistant message (simpler) vs inline citations (brittle)?
7) What are the required latency targets for retrieval + streaming to feel good on a demo laptop?
8) How do we cap chunk count per document and enforce reindex semantics on `index_version` bumps?
9) How do we ensure answer string exactness (`Not found in provided documents.`) across chat and quick-start?
10) Is moving fixture-backed dev endpoints to `/spikes/*` a prerequisite for this work, or can it proceed in parallel?

## Shaping Decision (Placeholder)

- GO / NO-GO: TBD
- Appetite: 2 PRDs (0011a + 0011b) with PRD0 assumed complete
- Cut lines if needed:
  - Retrieval: lexical-only first (no pgvector) if pgvector environment is a blocker.
  - Chat: non-resumable streaming first (no reconnect) if WDK integration is too heavy.

