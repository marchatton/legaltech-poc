# PRD: 0001b PDF Viewer (Page Nav + Zoom + Render URL Contract)

Owner: marc
Status: Draft (NO-GO until RH1 spike executed)
Date: 2026-02-07
Slug: 0001b-pdf-viewer

## Introduction / Overview

### Problem
Trust UX requires a reliable PDF viewer. If page navigation or zoom is janky (especially on scanned/rotated packs), the evidence layer collapses.

### Goal
Implement a PDF viewer that:
- renders PDFs via pdf.js
- supports page navigation + zoom
- uses the render contract (`GET /documents/:id/render?page=N`) to obtain a signed URL for pdf.js
- remains responsive on scanned/rotated PDFs (`pack_07_scans_rotated_low_quality`)

### Slice
Viewer only. No citations, no highlight overlays, no runs.

### Primary Observable Effect
A user can open a document from a Matter and navigate/zoom without the UI freezing.

### In Scope
- Viewer route and minimal UI wiring:
  - From Matter detail, open a document in the viewer.
  - Server-first fetch of `render_url` (no client-side fetch-by-default).
- API:
  - `GET /documents/:id/render?page=N` returns `{ render_url }` where `page` is 1-indexed (API surface).
- Viewer behaviors:
  - page navigation (jump + next/prev)
  - zoom 50/100/150 (re-render, not CSS-scale)
  - rotation handling (respect page intrinsic rotation)
- Explicit failure UI (safe error codes; no stack traces).

## Goals
- Viewer works for `pack_01_clean` and remains usable for `pack_07_scans_rotated_low_quality`.
- Zoom is crisp and stable (no devicePixelRatio drift).

## User Stories

### US-001: Open and view a PDF
As a reviewer, I want to open a PDF so that I can inspect evidence.

#### Acceptance Criteria
- AC-001: From a Matter, I can open a document viewer route for a selected document.
- AC-002: Viewer fetches `render_url` via `GET /documents/:id/render?page=N` (1-indexed `page`) and renders via pdf.js.
- AC-003: Viewer shows an explicit error state if `render_url` is unavailable or the document is not found.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/docs/`
- Manual checks: open commitment and survey PDFs; confirm they render.

### US-002: Page navigation and zoom stays responsive on scans
As a reviewer, I want to page-jump and zoom on scanned PDFs so that I can inspect evidence in low-quality packs.

#### Acceptance Criteria
- AC-004: PDFs served to pdf.js support Range requests (`Accept-Ranges: bytes`; `Range: bytes=...` returns `206 Partial Content`). Without this, RH1 perf numbers are invalid.
- AC-005: Define `totalMs` as: time from "request page N" to `renderTask.promise` resolve (exclude initial PDF load). Serial test (N=20, 100% zoom): `p95(totalMs) < 1000ms` and `max(totalMs) < 1500ms`.
- AC-006: Spam test (N=30 @ 200ms): viewer remains responsive (no visible freezes; `maxLongTaskMs < 250ms`) and final requested page completes `< 1500ms` after its request timestamp; intermediate renders are cancelled (>=70% cancellation rate).
- AC-007: Zoom 50/100/150 re-renders consistently (no CSS-scaling drift).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_07_scans_rotated_low_quality/docs/`
- Manual checks: use the dev-only RH1 harness route (`/__spikes/rh1-pdf-perf`) to run serial + spam tests and download results JSON; capture screenshots with HUD visible.
- Evidence: summary + decision recorded in `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH1 report section).

## Functional Requirements
- FR-001: Viewer is a client component; server components fetch data (render_url) server-first.
- FR-002: Use viewport CSS pixels (`viewport.width/height`) for layout; keep canvas backing store scaled by `devicePixelRatio` for crispness.
- FR-003: Handle rotation safely: either omit explicit `rotation` and let pdf.js apply `page.rotate`, or compute `totalRotation` including `page.rotate`.
- FR-004: Use the API error envelope for failures (ADR-0008); never leak internals.
- FR-005: Cancel in-flight render tasks on navigation and avoid piling up render work during rapid page jumps.
- FR-006: Render a single page at a time in this slice (no continuous scroll).

## Non-Goals (Out of Scope)
- Highlight overlays and citation UX.
- OCR/layout rendering layers (text selection, annotations) unless needed for baseline usability.

## Failure States & UX
- Render URL fetch fails: show safe error + retry.
- Page out of range: show safe error `VALIDATION_ERROR` (or equivalent) and allow navigation to a valid page.
- pdf.js render error: show safe error and a "reload" action.

## Metrics / Logging
- Structured events:
  - `viewer.opened`, `viewer.page.rendered`, `viewer.page.render_failed`
- Metrics:
  - `viewer_page_render_ms` (p50/p95 per pack)
  - `viewer_page_jump_ms`

## Rollback / Disable Plan
- Feature flag: `FEATURE_PDF_VIEWER` (default: off until RH1 spike evidence is recorded).
- Safe fallback: disable viewer links and show a message that viewer is not enabled.

## Risks & Dependencies
- Blocked by RH1: pdf.js performance on scanned/rotated PDFs.
- Dependencies:
  - Storage render URL contract (signed URLs, S3-compatible storage).
  - Document ingest must provide correct `page_count` to validate page bounds (state model).

## Success Metrics
- `pack_07_scans_rotated_low_quality` is usable: page-jump + zoom without UI freezing; timing evidence recorded.

## Open Questions
- Do we need progressive rendering/skeletons for long pages in `pack_07`?
- Do we standardize on a single zoom strategy (rerender-only) for the PoC?

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md` (RH1)
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH1)
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md` (ADR-0008)
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/20_state_model.md`
