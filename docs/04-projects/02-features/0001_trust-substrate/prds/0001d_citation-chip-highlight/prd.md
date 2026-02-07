# PRD: 0001d Citation Chips + Click-to-Highlight (Anchors-First, Fail-Closed)

Owner: marc
Status: Draft (NO-GO until RH2 spike executed)
Date: 2026-02-07
Slug: 0001d-citation-chip-highlight

## Introduction / Overview

### Problem
The core trust affordance is: click a citation -> see the exact clause highlighted in the PDF. Without this, "citations" are just metadata.

### Goal
Ship the citation click-to-highlight UX scaffold:
- report rows show citation chips (seeded from fixtures)
- clicking a chip opens the viewer at the cited document/page
- viewer overlays the locked citation polygon(s) and shows snippet + snippet_hash
- fail closed when invariants break (no "best effort" highlights)

### Slice
UI scaffold + overlay rendering only. No Quick Start runs, no entailment verification, no export.

### Primary Observable Effect
On `pack_01_clean`, a reviewer can click a citation chip and see the correct clause highlighted, including at 50/100/150% zoom (or an honest fallback is enforced).

### In Scope
- Matter detail UI:
  - seeded report rows table (fixture-backed)
  - citation chips rendered from `citation_id`s only (ADR-0001)
- Viewer behavior (builds on 0001b):
  - accept `searchParams` (`page`, optional `citation`)
  - fetch `GET /citations/:id` and render overlay + snippet/hash
- Highlight overlay mapping (per RH2 oracle guidance):
  - store polygons normalized `[0..1]`, origin top-left
  - map to viewport CSS pixels via page `viewBox` -> `viewport.convertToViewportPoint()`
  - overlay sized to `viewport.width/height` CSS pixels
- Fail-closed behavior:
  - if any invariant fails (doc mismatch, page out of range, invalid polygons, render_url missing): render no overlay and show explicit failure UI

## Goals
- Prove the trust moment on fixture packs with evidence capture (screenshots + bbox logs).
- Avoid accidental trust leakage (fail-closed overlay).

## User Stories

### US-001: Click citation chip -> open viewer at cited evidence
As a reviewer, I want to click a citation chip and jump to the cited PDF page so that I can inspect evidence quickly.

#### Acceptance Criteria
- AC-001: Report rows render citation chips derived from `citation_id`s (no free-text citations).
- AC-002: Clicking a chip navigates to the viewer with the correct `document_id` and `page` (1-indexed).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/`
- Manual checks: click chips across at least two documents (commitment + survey).

### US-002: Evidence highlights align across zoom + rotation
As a reviewer, I want the highlight to stay glued to the clause across zoom and rotation so that I can trust what I am seeing.

#### Acceptance Criteria
- AC-003: Highlight aligns at 100% zoom for at least one commitment anchor and one survey anchor (pack_01).
- AC-004: Highlight remains aligned at 50/100/150% zoom and bbox scales with zoom (within ±2% OR ±3 CSS px vs `bbox100 * scale`) (or an explicit cut is enforced: "highlights verified at 100% only").
- AC-005: Highlight remains aligned on at least one rotated/scanned page (pack_07) (or an explicit cut/patch is enforced).
- AC-006: Fail-closed: deliberate invalid polygon or wrong page yields explicit failure UI and no overlay.

#### Verification
- Use the dev-only RH2 harness route (`/spikes/rh2-overlay`) (loads fixture anchors and PDFs via `/spikes/local-pdf`).
- Fixture-backed mini-eval per RH2 spike plan:
  - pack_01 anchors:
    - TitleCommitment: `SCHED_A_PROPOSED_INSURED` (page 1)
    - ALTA_Survey: `SURVEY_CERT_PARTIES` (page 3)
  - screenshots at 50/100/150 with a debug HUD visible
  - bbox logs prove scaling invariance (±2% OR ±3 CSS px)
  - rotation screenshots for pack_07 (rotation 0 and 90; include `page.rotate` in `totalRotation`)
  - fail-closed screenshot + safe error code (invalid polygon injection + wrong page)
- Evidence capture: prefer `browser-use` scripted screenshots (or manual DevTools if faster).

## Functional Requirements
- FR-001: Highlight renderer is a pure mapping util (unit-testable) and is reused in viewer overlay rendering.
- FR-002: Overlay uses viewport CSS px (not canvas backing store px); do not mix in `devicePixelRatio`.
- FR-003: Handle page rotation correctly (do not override `page.rotate` accidentally).
- FR-004: All failures render explicit user-visible states and log safe reason codes (align with failure taxonomy where possible).

## Non-Goals (Out of Scope)
- Entailment verification (beyond deterministic integrity/fail-closed checks).
- Export gating and run completion requirements (handled in 0001e).

## Failure States & UX
- Invalid citation payload: show `citation_failed` panel with safe reason code.
- Overlay mapping failure: show `citation_failed` panel and log `CITATION_MISMATCH`-style codes where applicable.
- Viewer render failure: show safe error and a retry action.

## Metrics / Logging
- Events:
  - `citation_chip.clicked`
  - `highlight_overlay.rendered`
  - `highlight_overlay.failed` (reason_code)
- Metrics:
  - citation click-to-highlight success rate on fixture packs (target: 100% on pack_01)

## Rollback / Disable Plan
- Feature flag: `FEATURE_CITATION_HIGHLIGHTS` (default off until RH2 evidence is recorded).
- Safe fallback: citation chips still navigate to the page but show snippet/hash without overlay (honest "highlight not available" state).

## Risks & Dependencies
- Blocked by RH2: overlay transform across zoom/rotation.
- Dependencies:
  - 0001b PDF viewer (render URL contract + pdf.js render)
  - 0001c citations API (locked citation payload)

## Success Metrics
- Evidence captured for RH2: pack_01 + pack_07 screenshots and bbox logs; fail-closed case proven.

## Open Questions
- None. Fallback is "verified at 100% zoom only" (ADR-0020).

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md` (RH2)
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH2)
  - `docs/04-projects/02-features/0001_trust-substrate/tmp-oracle/oracle_response_0001.md` (RH2 guidance)
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0002)
  - `docs/03-architecture/50_api_surface.md`
