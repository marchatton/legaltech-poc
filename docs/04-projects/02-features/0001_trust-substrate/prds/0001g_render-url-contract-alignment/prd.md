# PRD: 0001g Render URL Contract Alignment (Signed PDF + Range)

Owner: marc
Status: Draft
Date: 2026-02-08
Slug: 0001g-render-url-contract-alignment

## Introduction / Overview

### Problem
The viewer and RH1 harness currently load PDFs via the dev-only `/spikes/local-pdf` endpoint (filesystem-backed). There is no implementation of the canonical render contract `GET /documents/:id/render?page=N`.

This creates concrete issues:
- Contract drift vs `docs/03-architecture/50_api_surface.md` and `0001b` (viewer) PRD acceptance criteria.
- RH1 Range + perf evidence is not tied to the actual URL the viewer will use (`render_url` target), which the plan requires.
- Later trust slices get validated against fixture-only paths and we do not learn whether the real render pipeline is correct and safe.

### Goal
Implement the `GET /documents/:id/render?page=N` contract end-to-end and make the viewer/harness use the returned `render_url`, with Range support and safe signing/redaction rules.

### Slice
One backend capability + thin UI wiring:
- A signed `render_url` for a document that supports Range requests, and a viewer route that uses it server-first.

### Primary Observable Effect
In dev:
- Given an uploaded document (`doc_*`) with `storage_key`, calling `GET /documents/:id/render?page=N` returns `{ document_id, page, render_url }`.
- Opening the viewer uses that `render_url` (not `/spikes/local-pdf`) and pdf.js loads the PDF via Range (`206 Partial Content`).
- RH1 harness can prove Range + perf against the `render_url` target and record evidence that matches the docs.

### In Scope
- API:
  - `GET /documents/:id/render?page=N` per `docs/03-architecture/50_api_surface.md`.
  - A signed PDF bytes endpoint used as the `render_url` target (implementation detail, but must support `Range` and `206`).
- Viewer wiring:
  - Add `/viewer/:documentId` route (server-first render_url fetch) and a client pdf.js viewer that takes `render_url` + `page` + `zoom`.
  - Keep existing dev-only fixture viewer/harness routes, but update RH1 proof to be run against the `render_url` target.
- Verification:
  - Update RH1 workflow to record Range proof + perf evidence for the `render_url` target (not just `/spikes/local-pdf`).

## Goals

- Close contract drift so `0001b` viewer PRD US-001 AC-002 is satisfiable against the real API.
- Ensure the `render_url` target supports Range and is usable by pdf.js (RH1 evidence is relevant to production wiring).

## User Stories

### US-001: Fetch a signed render URL for a document
As a reviewer/developer, I want to request a `render_url` for a document so that pdf.js can load it safely.

#### Acceptance Criteria
- AC-001: `GET /documents/:id/render?page=N` returns `{ document_id, page, render_url }` and validates:
  - document exists
  - `page` is 1-indexed and within `[1..page_count]` when `page_count` is known
- AC-002: `render_url` points to a URL that serves the whole PDF and supports Range:
  - responds with `Accept-Ranges: bytes`
  - `Range: bytes=0-10` returns `206 Partial Content` and a valid `Content-Range`
- AC-003: Errors use the standard safe error envelope and include `trace_id`.
- Example: Upload a PDF via the existing upload flow, then fetch `render_url` for page 1 and confirm the Range precheck passes.
- Negative case: Unknown document id returns `NOT_FOUND` (safe envelope).
- Negative case: Page out of range returns `VALIDATION_ERROR` (safe envelope).

#### Verification
- Script: extend `scripts/us002_smoke.ts` or add a small `scripts/us00x_render_smoke.ts` that:
  - uploads a fixture PDF
  - calls `GET /documents/:id/render?page=1`
  - runs a Range precheck against the returned `render_url`
- Automated checks: `pnpm typecheck`, `pnpm verify`
- Manual checks: curl Range precheck against returned `render_url`

### US-002: Viewer + RH1 harness use the render_url target
As a reviewer, I want the viewer and RH1 harness to use `render_url` so performance evidence matches the real pipeline.

#### Acceptance Criteria
- AC-004: `/viewer/:documentId?page=N` fetches `render_url` server-first and loads the PDF in pdf.js using that URL.
- AC-005: RH1 harness can be run against the `render_url` target and records:
  - Range precondition proof for that URL (not `/spikes/local-pdf`)
  - serial + spam perf JSON artifacts under `docs/04-projects/02-features/0001_trust-substrate/spike-proofs/`
  - an updated summary table/decision in `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md`
- Example: Run RH1 on `pack_07_scans_rotated_low_quality` via `render_url` and record evidence.
- Negative case: If Range support is missing on the `render_url` target, harness reports NO-GO and does not emit misleading perf numbers.

#### Verification
- Harness: update `/spikes/rh1-pdf-perf` to accept a `document_id` (and internally obtain the `render_url`), or add a new dev-only harness route for `render_url` perf.
- Evidence: JSON + summary committed in `spike-investigation.md` (RH1 section)

## Functional Requirements

- FR-001: Signed URLs (`render_url`) are generated on demand with a short TTL; never persisted; never included in traces/provenance; never logged.
- FR-002: The PDF bytes endpoint validates storage keys (allowlist) and prevents path traversal; no arbitrary filesystem reads.
- FR-003: The PDF bytes endpoint supports single-range requests and returns correct `206` responses (pdf.js compatible).
- FR-004: Viewer remains client-only for pdf.js imports (dynamic import boundary); server components fetch `render_url` server-first.
- FR-005: All route boundaries use Zod validation and the standard safe error envelope.

## Non-Goals (Out of Scope)

- Citation overlay changes (US-005/US-006).
- Migrating fixture seed snapshots from filename-based `document_id` to DB document ids (the reconciled PRD’s FR-004).
- Production S3 presigning integration (PoC can use an app-signed URL; production can swap behind the contract later).

## Technical Considerations (Optional)

- The `render_url` target must be the exact URL that pdf.js loads (whole PDF) and must honor Range for pdf.js perf to be meaningful.
- Prefer keeping the signature out of logs; treat query params as secrets (similar posture to S3 `X-Amz-*` presigned URLs).

## Failure States & UX

- Render URL fetch fails: explicit error panel with safe code + retry/back.
- Render URL expired/unauthorised: explicit error panel instructing retry (server will mint a new URL).
- Range request invalid: return `416` and surface a viewer error state (no silent partial rendering).

## Metrics / Logging

- `document.render_url_issued` (count + latency)
- `document.pdf_range_served` (count + bytes)
- RH1 viewer metrics: `totalMs`, cancellation rate, `maxLongTaskMs`

## Rollback / Disable Plan

- Feature flag: `FEATURE_PDF_VIEWER` gates `/viewer/*` entry points.
- Safe fallback: keep `/spikes/local-pdf` for local debugging, but treat it as non-authoritative for RH1 closure once `render_url` exists.

## Risks & Dependencies

- Risk: signed URL leaks via logs or traces. Mitigation: never log; treat query params as secrets; do not include in trace exports.
- Risk: Range implementation bugs break pdf.js. Mitigation: deterministic Range precheck + RH1 harness.
- Dependency: documents must have `storage_key` and (ideally) `page_count` for bounds validation.

## Success Metrics

- RH1 evidence is re-recorded for the actual `render_url` target and meets thresholds.
- `0001b` viewer PRD US-001 AC-002 and US-002 AC-004 are unblocked by implementation (contract-aligned).

## Open Questions

- Q1: For PoC, should `render_url` be a query-signed app route (presigned-style) or should pdf.js use header-signed requests (`httpHeaders`)?
- Q2: Should `/matters/viewer` be replaced by `/viewer/:documentId`, or keep both and deprecate later?

## Sources

- `docs/04-projects/02-features/0001_trust-substrate/prds/0001b_pdf-viewer/prd.md` (render_url + RH1 requirements)
- `docs/04-projects/02-features/0001_trust-substrate/prds/0001b-f_trust-substrate-slices/prd.reconciled.md` (combined slice alignment)
- `docs/04-projects/02-features/0001_trust-substrate/plan.md` (RH1 Range proof requirement: `render_url` target)
- `docs/03-architecture/50_api_surface.md` (canonical contract)
- `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (existing RH1 evidence)
- `docs/04-projects/02-features/0001_trust-substrate/risk-register.md`

