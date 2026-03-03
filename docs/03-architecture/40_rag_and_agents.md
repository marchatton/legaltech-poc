# RAG + agents (Quick Start)

> Note: This document describes the **target** RAG/agent pipeline. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This doc describes the end-to-end "evidence-first" pipeline for Quick Start. It is intentionally implementation-oriented.

Canonical related docs:
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions and why)
- `docs/03-architecture/20_state_model.md` (statuses + invariants)
- `docs/03-architecture/30_data_model.md` (tables + hashing + immutability rules)
- `docs/03-architecture/60_observability_and_evals.md` (failure taxonomy + eval posture)

## Current PoC status (implemented today)
The repo implements a baseline end-to-end `retrieve -> draft -> lock` pipeline for Quick Start, with deterministic fail-closed row statuses.

Current behavior:
- Ingest runs as WDK steps, extracts text via pdf.js (not OCR), and stores per-page text with `has_geometry=false`.
  - Code: `apps/web/workflows/ingestDocumentWorkflow.server.ts`, `apps/web/steps/ingestDocumentProcess.step.server.ts`
- Quick Start runs schedule one WDK row step per question; each step performs hybrid retrieval, evidence hydration, grounded draft, and citation locking.
  - Code: `apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`, `apps/web/steps/quickStartWriteRowV0.step.server.ts`
- `GET /citations/:id` reads locked citations from Postgres and returns polygons/snippets for viewer overlay.
  - Code: `apps/web/app/(api)/citations/[id]/route.ts`
- Fixture seed snapshots still back trace export and spike CSV export routes.
  - Code: `apps/web/app/(api)/runs/[id]/trace/route.ts`, `apps/web/app/(api)/spikes/export/csv/route.ts`, `apps/web/lib/fixtureSeed.server.ts`

Gaps vs target:
- No OCR/layout geometry yet; locked citations currently use deterministic page-level fallback polygons.
- Verification v1 is integrity-only (no entailment model).
- Trace export is not yet reconstructed from persisted `runs/run_steps` artifacts.

Treat the remainder of this doc as the **target** pipeline to build towards.

## Why RAG exists here
RAG is the mechanism that makes “evidence-first” possible:
- It finds evidence in the uploaded pack.
- It turns evidence into stable references (chunk IDs).
- It enables citation locking and verification (ADR-0001/0002).

## Non-negotiable invariants (PoC defaults)
- Retrieval returns **IDs**, not prose (ADR-0004). Steps pass around `chunk_id`s and `citation_id`s, not paragraphs.
- Drafting produces structured outputs with **candidate citations as chunk IDs** (ADR-0001).
- Citations are **locked** and **immutable** once created (ADR-0001).
- Verification is **fail-closed** (ADR-0002).
- No external web research inside a run (ADR-0007).

## Ingestion (RAG substrate)
Target default: OCR everything for consistent geometry
- store per-page text + polygons (`document_pages.layout_json`)
- chunk into citable units
- index:
  - lexical (tsvector)
  - semantic (pgvector)

### Geometry maturity ladder (explicit)
Until OCR/layout geometry is implemented for real uploads, we need to be honest about what “highlight” means.

Geometry levels:
- v0: **page-level** highlight only (full-page polygon). This is the required fallback when `document_pages.layout_json.has_geometry = false`.
- v1: line-level polygons (OCR/layout provider returns per-line boxes).
- v2: word/span-level polygons (higher precision, higher complexity).

Canonical v0 fallback polygon (normalized coordinates):
```json
[[[0,0],[1,0],[1,1],[0,1]]]
```

UI rule (v0): label the highlight as “page-level” so users do not infer precision.

Implementation notes:
- OCR/layout is abstracted behind one adapter interface (ADR-0012; accepted).
- Chunking must be deterministic for a given `(document_id, index_version)`; if you change chunking logic, bump the folder `index_version`.

### Pre-geometry bridge (explicit)
Until OCR/layout geometry exists for real uploads (`has_geometry=false`), we may ship a pre-geometry retrieval substrate that chunks
`document_pages.text` directly using a deterministic char-window chunker:
- `chunker_id`: `char_window_v0`
- metadata: `page_number`, `char_start`, `char_end`

This is a deliberate v0 exception to ADR-0015's target `line_window_v1` posture. When migrating to OCR/layout lines, bump
folder `index_version` and rebuild chunks/embeddings.

## Chunking (what makes a chunk citable)
Chunking strategy is pinned in ADR-0015. Baseline requirements still apply:
- A chunk must map back to a document page range (`page_start`, `page_end`) and stable evidence geometry.
- A chunk must be retrievable by ID alone (no dependency on an LLM re-run).
- Chunk metadata must be sufficient for filtering/rerank later (doc type, section hints, etc).

PoC defaults (ADR-0015):
- Page-bounded chunks only (`page_start = page_end = page_number`).
- Chunk sizing: `max_lines = 20` OR `max_chars = 1500` (whichever comes first), with `overlap_lines = 4` (within a page only).
- Boundary rules: never split inside an OCR line; prefer splitting on blank lines; treat section headers as hard boundaries.
- Required metadata (store on the chunk row, e.g. `chunks.metadata_json`):
  - `chunker_id` (e.g. `line_window_v1`)
  - `chunk_params` (max_lines/max_chars/overlap_lines + header regex version)
  - `page_number`
  - `line_start` / `line_end` (inclusive line indices in the canonical OCR line list)
  - optional `doc_type`, `section_hint`

## Retrieval (per question)
Contract:
- Input: `{ folder_id, index_version, question_id, question_text, filters? }`
- Output: ordered list of hits `{ chunk_id, score, document_id, page_start, page_end }`

Algorithm (PoC default):
- Hybrid search (tsvector + pgvector) scoped to `index_version`.
- Apply filters (eg doc_type) if present.
- Optional rerank (but preserve the "IDs-only" contract).

Hard rules:
- Return chunk IDs, not prose.
- Include scores for observability/evals (Recall@K and debug).
- Cap K for cost and stability (eg K=10 by default; pin per fixture suite).

## Hydration (IDs -> evidence)
Retrieval produces IDs only. Hydration resolves those IDs into evidence payloads for drafting.

Contract:
- Input: `{ index_version, hits: [{chunk_id, score}] }`
- Output: `evidence: [{ chunk_id, document_id, page_start, page_end, snippet, polygons, snippet_hash? }]`

Hard rules:
- Hydration is read-only and deterministic for a given `index_version`.
- The hydrated `snippet` must come from the canonical chunk store (not an LLM).

## Drafting (from hydrated evidence only)
Contract:
- Input: `{ question_id, question_text, evidence: HydratedEvidence[] }`
- Output: structured row JSON:
  - `answer` (string or structured JSON-as-string; decide per artefact)
  - `notes` (optional)
  - `candidate_citation_chunk_ids: string[]`

Hard rules:
- The draft must be derived from the provided evidence only.
- If the evidence set cannot support an answer, the draft must output the exact string:
  `Not found in provided documents.` (and provide an actionable missing-doc checklist in notes/provenance).

## Citation locking (creates immutable citations)
Locking converts "candidate chunk IDs" into immutable citation records.

Contract:
- Input: `{ index_version, candidate_chunk_ids: string[] }`
- Output:
  - `citations[]` persisted: `{ citation_id, document_id, page_number, polygons, snippet, snippet_hash, index_version, chunk_id? }`
  - mapping `chunk_id -> citation_id` used to rewrite the report row

Hard rules:
- `snippet_hash` must follow the canonical hashing rule in `docs/03-architecture/30_data_model.md`.
- Store enough geometry to render highlights without re-running retrieval.
- Do not persist "signed URLs" or transient provider URLs; only keys and stable metadata.

Failure modes:
- `CITATION_MISMATCH`: chunk resolves to a different snippet than expected, or hash check fails.
- `RETRIEVAL_MISS`: candidate chunk IDs do not exist for this `index_version`.

## Verification (fail-closed)
PoC v1 verification is integrity-only (ADR-0017). No entailment model or runtime verifier is called.

Deterministic integrity checks (runtime):
- row JSON validates against the Zod schema (hard gate)
- every `citation_id` resolves and has polygons + snippet_hash

Output mapping (see `docs/03-architecture/20_state_model.md`):
- `needs_review`: integrity checks pass.
- `missing_input`: answer is exactly `Not found in provided documents.` and there are zero citations.
- `citation_failed`: anything else that fails (hash mismatch, missing polygons, schema fail).

Reason codes should align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md`.

## Agent mapping (PoC implementation)
This is the "4 agents" story implemented as a constrained workflow (ADR-0005):
- Orchestrator: WDK workflow controller (`"use workflow"`)
- Retrieval agent: retrieval step(s) (`"use step"`)
- Drafting agent: drafting step (`"use step"`)
- Verification agent: lock + verify steps (`"use step"`)
- Research agent: out-of-scope (no external web; ADR-0007)

## Idempotency and determinism (step-level rules)
Because WDK can replay/retry, each step must be safely repeatable:
- Use a deterministic `step_key` stored in `run_steps` (see `docs/03-architecture/30_data_model.md`).
- Steps must not create duplicate `report_rows` or `citations`.
- Any "randomness" (sampling temperature, top_p) should be pinned/recorded in provenance.

## Open decisions to pin (candidate ADRs)
- Whether rerank is enabled by default and what model it uses.
- What the report row payload schemas are for each artefact type (CSV vs JSON vs hybrid).
