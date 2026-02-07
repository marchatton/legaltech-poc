# PRD: 0001c Citations API + Locking Contract (snippet + hash + geometry)

Owner: marc
Status: Draft (NO-GO until RH3 spike executed)
Date: 2026-02-07
Slug: 0001c-citations-api-locking

## Introduction / Overview

### Problem
Trust UX needs an immutable, inspectable citation object. Without a locked citation contract (snippet + snippet_hash + geometry), we can't safely highlight evidence or detect drift.

### Goal
Implement the locked citation object contract and API:
- immutable `citations` records (ADR-0001)
- canonical `snippet_hash` rule (data model)
- `GET /citations/:id` returns the locked payload needed for viewer highlight + integrity checks

### Slice
Citation contract only. No viewer UI, no overlays, no verification/entailment.

### Primary Observable Effect
Given a `citation_id`, the client can fetch a stable payload `{document_id,page_number,polygons,snippet,snippet_hash}` and render evidence without recomputing it.

### In Scope
- Data model for citations (see `docs/03-architecture/30_data_model.md`):
  - store `snippet`, `snippet_hash`, `polygons`, `document_id`, `page_number`, `index_version`, optional `chunk_id`
  - treat citations as immutable after insert
- Canonical hashing util:
  - `snippet_hash = sha256(normalise(snippet))`
  - `normalise`: trim; CRLF->LF; collapse whitespace runs to a single space
- HTTP API:
  - `GET /citations/:id` response shape per `docs/03-architecture/50_api_surface.md`
- Safety:
  - boundary validation with Zod and safe error envelope (ADR-0008)

## Goals
- Citation payload is sufficient for highlighting and integrity checks.
- Hashing is stable and implemented once (no drift between caller sites).

## User Stories

### US-001: Fetch a locked citation by ID
As a reviewer, I want to fetch a citation payload so that I can inspect evidence reliably.

#### Acceptance Criteria
- AC-001: `GET /citations/:id` returns:
  - `document_id`
  - `page_number`
  - `polygons`
  - `snippet`
  - `snippet_hash`
- AC-002: Errors use the standard error envelope with safe `code` and `message` (no leaks).

#### Verification
- Manual checks: call the endpoint for a known citation id and confirm fields.

### US-002: Canonical snippet hashing is stable
As a developer, I want one canonical hashing implementation so that citation integrity checks are reliable.

#### Acceptance Criteria
- AC-003: `normalise()` is implemented once (e.g. `packages/core/citations`) and reused everywhere.
- AC-004: RH3 spike demonstrates stable hashes across repeated runs for the same source snippet.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/` (RH3 spike plan).
- Evidence: RH3 spike report with a stability table.

## Functional Requirements
- FR-001: Citations are immutable once created; "fixing" a citation creates a new citation and updates the owning row to reference the new id (data model rule).
- FR-002: `snippet_hash` must use the canonical rule and be persisted on the citation.
- FR-003: Store enough geometry to highlight evidence without re-running retrieval or OCR.
- FR-004: Never return signed URLs or transient provider URLs from citation endpoints; only stable IDs and metadata.

## Non-Goals (Out of Scope)
- Creating citations from chunk IDs (the lock step) if Quick Start is not yet implemented.
  - We can still seed citations from fixture packs for early UI scaffold, but the durable lock step belongs to the workflow.
- Entailment verification.

## Failure States & UX
- Citation not found: `404 NOT_FOUND`.
- Invalid id format: `VALIDATION_ERROR`.
- Unsafe internal failures: `INTERNAL` with `trace_id`.

## Metrics / Logging
- Structured events:
  - `citation.fetched`, `citation.fetch_failed`
- Metrics:
  - p50/p95 latency for `GET /citations/:id`
  - hash integrity checks pass/fail counts (in evals later)

## Rollback / Disable Plan
- Feature flag: `FEATURE_CITATIONS_API` (default off until RH3 spike evidence is recorded).
- Safe fallback: citation chips/links are hidden and UI explains citations are not enabled.

## Risks & Dependencies
- Blocked by RH3: snippet normalisation + hash stability in practice.
- Dependencies:
  - Postgres schema for citations.
  - Document/page identity model (`document_id`, `page_number`) must be stable.

## Success Metrics
- Fixture-driven: citations fetched for pack_01 and snippet_hash is stable (RH3 evidence).

## Open Questions
- Polygon coordinate spec for locked citations: do we store normalized `[0..1]` polygons or absolute PDF points? (Pick one and enforce.)

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md` (RH3)
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH3)
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0008)
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`

