# PRD: Arch Drift Guardrails (P0)

Owner: marc
Status: Draft
Date: 2026-02-09
Slug: arch-drift-guardrails

## Introduction / Overview

### Problem
The canonical architecture docs in `docs/03-architecture/*` describe a target runtime (durable WDK orchestration, OCR/layout geometry, retrieval/draft/lock pipeline). The current PoC implementation is materially different (Next.js App Router, in-memory queues, pdf.js text extraction without geometry, fixture-backed citations/trace/export, runtime DDL).

This mismatch causes:
- incorrect assumptions when implementing features (engineers think WDK/OCR/RAG is already present)
- unsafe-by-default security posture in a few places (signed URL verification can be used incorrectly)
- operational fragility (ingest can be driven into excessive CPU/DB writes by pathological PDFs)

### Goal
Make the PoC safer and easier to reason about by (1) making docs explicitly separate current vs target, and (2) shipping P0 guardrails for signed URLs and ingest.

### Slice
Ship P0 guardrails:
- Docs: add an explicit “Current PoC runtime” reference and ensure canonical docs do not imply WDK/OCR/RAG are already implemented.
- Object store signing: signature verification must fail on expiry by default (no caller footguns), and dev secret fallback must be explicit opt-in.
- Ingest: apply hard caps and record extraction method so we do not “pretend OCR” and we limit resource exhaustion.

### Primary Observable Effect
- Reading `docs/03-architecture/*` clearly shows:
  - what is implemented today
  - what is target/aspirational
  - where the gaps are
- Any expired signed URL fails verification even if a route handler forgets to check `expiresAtMs`.
- In dev, object-store signing requires either `OBJECT_STORE_SIGNING_SECRET` or an explicit `ALLOW_DEV_OBJECT_STORE_SECRET=1` opt-in.
- Oversized/pathological PDFs fail ingest early with a safe error code (and do not wedge the server).
- Extracted documents record `metadata_json.extraction_method = "pdfjs"` (and geometry is explicitly false).

### In Scope
- `apps/web/lib/objectStore.server.ts`
- `apps/web/lib/ingest/ingestQueue.server.ts`
- `docs/03-architecture/*` updates needed for “current vs target” clarity
- Add tests where current coverage is missing for the changed behavior

## Goals
- Reduce docs-to-code confusion: “current vs target” is explicit and linkable.
- Remove signature-expiry footguns: `verifySignature()` is safe-by-default.
- Protect the runtime from trivial ingest DoS: hard caps + safe failure.
- Make extraction semantics honest and inspectable (method + geometry).

## User Stories

### US-001: Signed URL verification is safe-by-default
As an operator, I want signed URL verification to fail on expired signatures by default so that callers cannot accidentally accept expired URLs.

#### Acceptance Criteria
- AC-001: `verifySignature()` returns `false` when `expiresAtMs < Date.now()` even if the HMAC matches.
- AC-002: `verifySignature()` returns `false` when `expiresAtMs` is non-finite or invalid.
- AC-003: Existing signed URL flows still work when `expiresAtMs` is valid and not expired (upload, render, download).
- AC-004 (negative): A route that only calls `verifySignature()` (no explicit expiry check) still rejects expired signatures.

#### Verification
- Automated checks: `pnpm -r typecheck && pnpm -r test`
- Manual: start `pnpm dev`, upload a PDF, render it, download an artefact (dev-only)

### US-002: Dev signing secret fallback requires explicit opt-in
As a developer, I want object-store signing to fail closed unless explicitly configured so that misconfigured deployments do not silently change the auth model.

#### Acceptance Criteria
- AC-005: If `OBJECT_STORE_SIGNING_SECRET` is unset:
  - in non-development: object-store signing throws `OBJECT_STORE_SIGNING_SECRET_MISSING`
  - in development: signing throws unless `ALLOW_DEV_OBJECT_STORE_SECRET=1`
- AC-006: If `ALLOW_DEV_OBJECT_STORE_SECRET=1` in development, the dev fallback secret is used and signed URL flows work.
- AC-007 (negative): Setting `NODE_ENV=development` alone must not enable the fallback.

#### Verification
- Automated checks: `pnpm -r typecheck && pnpm -r test`
- Manual: run the web app with and without the env var and confirm the error is explicit and actionable

### US-003: Ingest is capped and extraction method is recorded
As an operator, I want ingest to have hard caps and honest extraction metadata so the server remains stable and we do not misrepresent OCR/geometry guarantees.

#### Acceptance Criteria
- AC-008: If a PDF has more than `MAX_PAGES`, ingest fails early with a safe error code (and sets the document to `failed`).
- AC-009: Per-page extracted text is capped (truncate) to `MAX_TEXT_CHARS_PER_PAGE` and does not exceed it in `document_pages.text` or `chunks.text`.
- AC-010: `documents.metadata_json.extraction_method` is set to `"pdfjs"` for this ingest path.
- AC-011: `document_pages.layout_json` continues to set `source="pdfjs"` and `has_geometry=false`.
- AC-012 (negative): A pathological PDF should not result in unbounded DB writes or huge per-page text rows.

#### Verification
- Automated checks: `pnpm -r typecheck && pnpm -r test`
- Manual: ingest a representative PDF; confirm folder state reaches `indexed/ready` and extracted text is present

### US-004: Architecture docs are explicit about current vs target
As a contributor, I want architecture docs to explicitly separate current PoC behavior from target architecture so I can reason correctly when making changes.

#### Acceptance Criteria
- AC-013: `docs/03-architecture/*` includes an upfront note that links to a “Current PoC runtime” doc.
- AC-014: `docs/03-architecture/10_system_architecture.md` does not imply WDK/OCR/retrieve/draft/lock are implemented without qualification.
- AC-015: `docs/03-architecture/40_rag_and_agents.md` clearly marks OCR/layout and the retrieve/draft/lock pipeline as target, and documents the current fixture-backed behavior.

#### Verification
- Manual: read the updated docs and confirm no section contradicts obvious repo reality.

## Functional Requirements

- FR-001: `verifySignature()` must validate `expiresAtMs` and fail on expiry before doing timing-safe HMAC comparison.
- FR-002: Dev-only secret fallback must require an explicit allowlist env var.
- FR-003: Ingest must enforce hard caps on pages and extracted text size.
- FR-004: Extraction method metadata must be persisted for the ingest path (pdf.js).
- FR-005: Docs must have an explicit, canonical “Current PoC runtime” reference.

## Non-Goals (Out of Scope)
- Implementing WDK or a durable workflow runtime.
- Implementing OCR/layout providers (Azure DI, Textract) and geometry-backed citations.
- Implementing retrieval/draft/lock steps or a real RAG pipeline.
- Replacing runtime DDL with migrations (separate slice).

## Failure States & UX
- Missing signing config: return safe `INTERNAL` with guidance (never leak secrets); error should mention required env var name(s).
- Ingest exceeds caps: mark document as `failed`, include safe error code/message; folder state should become `failed`.

## Metrics / Logging
- Add structured server logs (safe) for:
  - ingest failure reason code + `{documentId, folderId}`
  - signature verification failures (no raw sigs/URLs)

## Rollback / Disable Plan
- Signing fallback:
  - Set `OBJECT_STORE_SIGNING_SECRET` to restore stable behavior across restarts/environments.
  - Dev fallback can be toggled with `ALLOW_DEV_OBJECT_STORE_SECRET`.
- Ingest caps:
  - If caps are too strict for a demo, increase constants and re-run ingest; keep defaults conservative.

## Risks & Dependencies
- Risk: dev environments without a configured signing secret will break until `ALLOW_DEV_OBJECT_STORE_SECRET=1` or a dev secret is set.
- Risk: ingest caps could reject legitimately large packs; defaults must be tuned for expected demo data.
- Dependency: none (all changes are internal to the web app and docs).

## Success Metrics
- Reduced time-to-orient for contributors: “current vs target” is obvious from docs.
- Fewer unsafe-by-default paths: signature verification cannot be misused to accept expired URLs.
- Improved demo stability: ingest failures are explicit and bounded; no wedged server due to huge PDFs.

## Open Questions
- Should ingest caps be env-configurable (e.g. `INGEST_MAX_PAGES`) for demos, or kept as constants until migrations/durable jobs land?
- Do we want to rename `ocr_status` to `extraction_status` in a later migration slice?

## Sources
- `docs/98-tmp/oracle/oracle-arch-drift.md` (drift + P0 recommendations)
- `apps/web/lib/objectStore.server.ts` (signing and verification)
- `apps/web/lib/ingest/ingestQueue.server.ts` (pdf.js extraction + writes)
- `docs/03-architecture/10_system_architecture.md`, `docs/03-architecture/40_rag_and_agents.md`

