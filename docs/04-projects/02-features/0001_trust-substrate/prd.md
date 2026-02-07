# PRD: 0001 Trust Substrate (Evidence Viewer + Click-to-Highlight)

Owner: marc
Status: Draft (Blocked by RH1-RH5 spikes)
Date: 2026-02-07
Slug: 0001-trust-substrate

## Introduction / Overview

### Problem
Orbital's product UX must be trustworthy before any "Quick Start" generation is credible. Today we don't have an evidence layer that can:
- present source PDFs reliably
- lock citations as immutable objects
- let a reviewer click a citation and see the clause highlighted
- fail closed when evidence cannot be verified (no "almost right" trust leakage)
- make failure states explicit and actionable

### Goal
Ship a fixture-driven evidence surface where a reviewer can click a citation chip and see the correct clause highlighted with a snippet + `snippet_hash`, and where failures are explicit and block export by default.

### Slice
This dossier is an initiative-level PRD spine. Implementation should happen via thin slices (see `breadboard-pack.md`), but the end state is a single "trust moment" flow:
Matter (Folder) -> citation chip -> PDF viewer -> verified highlight overlay + snippet/hash, with fail-closed behavior and export gating.

### Primary Observable Effect
- Reviewers can open a Matter, navigate its documents, and inspect evidence.
- Clicking a citation opens the right document/page and overlays a highlight that stays aligned across zoom/rotation (or we explicitly cut/patch with an honest fallback).
- When citation invariants fail, the UI shows `citation_failed`, renders no overlay, and blocks export by default.

### In Scope
- Matter (Folder) baseline: create folder, upload PDFs, list docs, open viewer.
- PDF viewer: page navigation + zoom (pdf.js).
- Citation contract: locked citation object + `GET /citations/:id` with polygons + snippet + `snippet_hash`.
- Click-to-highlight UX scaffold: seeded report rows + citation chips that jump to viewer and render highlight using fixture anchors (`docs/08-example-data/*/layout/*.anchors.json`).
- Row statuses + export gate: export blocked by default when any row is `citation_failed`.
- Failure journeys: missing-doc checklist, citation mismatch details, "flag citation wrong".
- Provenance: minimal run trace export (developer-facing).

## Goals
- Establish a credible "trust moment" in fixture packs (`pack_01_clean`, `pack_02_missing_rea`, `pack_07_scans_rotated_low_quality`).
- Make trust failures explicit and actionable (no silent failure, no best-effort highlights).
- Keep server/client boundaries clean (server-first fetching; viewer is client-only).

## User Stories

### US-001: Matter baseline (Folder CRUD + detail surface)
As a reviewer, I want to create and open a Matter so that I can review evidence for a specific deal.

#### Acceptance Criteria
- AC-001: I can create a Matter (API/DB: `folder`) and see it in a Matter list.
- AC-002: I can open a Matter detail page that shows a document list and a seeded report table.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/`
- Manual checks: create Matter, open Matter detail, confirm seeded report rows render.

### US-002: Upload PDFs and show ingest status
As a reviewer, I want to upload PDFs into a Matter so that the evidence is available in the viewer.

#### Acceptance Criteria
- AC-003: I can upload a PDF into a Matter and see it appear in the document list.
- AC-004: The document list shows ingest status and basic quality metadata fields (even if stubbed).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/`, `docs/08-example-data/pack_07_scans_rotated_low_quality/`
- Manual checks: upload both a clean PDF and a scanned/rotated PDF; confirm both are viewable.

### US-003: View a PDF (page nav + zoom) via render contract
As a reviewer, I want a reliable PDF viewer with page navigation and zoom so that I can inspect the underlying evidence.

#### Acceptance Criteria
- AC-005: Viewer renders the correct PDF and can navigate to any page.
- AC-006: Zoom controls re-render consistently (no CSS-scaling drift) and the viewer stays responsive on `pack_07` scans.
- AC-007: Viewer obtains `render_url` via `GET /documents/:id/render?page=N` (server contract, 1-indexed `page`) rather than hardcoding storage paths.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_07_scans_rotated_low_quality/`
- Manual checks: rapidly page-jump; confirm UI remains responsive and render time is acceptable (see RH1).

### US-004: Locked citation object + hashing contract
As a reviewer, I want each citation to be a locked object with a snippet + `snippet_hash` so that evidence is immutable and verifiable.

#### Acceptance Criteria
- AC-008: `GET /citations/:id` returns locked payload `{document_id,page_number,polygons,snippet,snippet_hash}`.
- AC-009: `snippet_hash` uses canonical normalisation rules (single implementation reused everywhere) and is stable across repeated processing (see RH3).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/`
- Manual checks: open a citation in UI; confirm snippet and hash are displayed and match API payload.

### US-005: Citation chip -> jump-to-highlight (anchors-first, fail-closed)
As a reviewer, I want to click a citation chip and see the referenced clause highlighted so that I can trust the report row.

#### Acceptance Criteria
- AC-010: Clicking a citation chip opens the viewer at the correct document + page.
- AC-011: Highlight overlay maps locked polygons to viewport CSS pixels correctly at 50/100/150% zoom (or the UI explicitly enforces the chosen honest fallback).
- AC-012: On rotated/scanned pages (`pack_07`), highlight remains aligned (or the UI explicitly enforces the chosen honest fallback).
- AC-013: If citation invariants fail (doc mismatch, invalid polygons, wrong page, `snippet_hash` mismatch), the UI renders no overlay and shows explicit `citation_failed` details.

#### Verification
- Pack/fixture/script: anchors from `docs/08-example-data/*/layout/*.anchors.json`
- Manual checks: use the RH2 spike harness plan; capture screenshots at 50/100/150 with HUD visible.

### US-006: Row status machine + export gate (fail closed)
As a reviewer, I want report rows to have terminal statuses and exports to be blocked when evidence fails so that we never ship untrusted output.

#### Acceptance Criteria
- AC-014: Rows can be in terminal statuses: `needs_review|reviewed|missing_input|citation_failed` and statuses are visible in the report table.
- AC-015: One deliberate bad citation produces `citation_failed` and export is blocked by default when any row is `citation_failed`.

#### Verification
- Pack/fixture/script: include at least one deliberate bad citation fixture (`snippet_hash` mismatch) in `pack_01_clean` flow.
- Manual checks: verify export is blocked with explicit reason.

### US-007: Failure journeys + provenance export
As a reviewer, I want missing-doc and quality failures to be actionable, and as a developer I want a trace export so that failures can be debugged without guesswork.

#### Acceptance Criteria
- AC-016: In `pack_02_missing_rea`, rows that depend on missing docs are `missing_input` and show an actionable missing-doc checklist.
- AC-016a: `missing_input` rows use the exact answer string `Not found in provided documents.` and have zero citations (state model invariant).
- AC-017: The UI can export a minimal run trace JSON (developer-facing) with safe redaction defaults (opaque IDs + hashes, no raw provider payloads).
- AC-018: "Flag citation wrong" action logs a safe feedback event with citation_id + reason code.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_02_missing_rea/`
- Manual checks: verify missing-doc checklist appears; download trace export; verify feedback action produces a log/event.

## Functional Requirements

- FR-001: The UI must call the entity a "Matter", but API/DB terminology remains "Folder" (`folder_id`).
- FR-002: All external inputs at route/API boundaries must be validated with Zod and return the safe error envelope (no internal leak).
- FR-003: The PDF viewer must render in a client component; server components fetch `render_url` and citation payloads server-first.
- FR-004: Canonical polygon coordinate spec:
  - store citation polygons as normalised `[0..1]` page coordinates, origin top-left, relative to unrotated page `viewBox`.
  - map to viewport CSS pixels via `viewBox` -> `viewport.convertToViewportPoint()`.
- FR-005: Highlight overlay must be rendered in viewport CSS pixel space (`viewport.width/height`), not canvas backing store pixels.
- FR-006: Fail-closed highlight: if any citation invariants fail, render no overlay and show explicit `citation_failed` state.
- FR-007: Row status machine must block export by default when any row is `citation_failed`.
- FR-007a: Export is only allowed when `runs.state = completed` (PoC default), and returns `EXPORT_BLOCKED` when any row is `citation_failed` unless an explicit demo-only override is enabled.
- FR-008: Failure journeys must be user-visible (missing docs, citation mismatch details, doc quality warnings).
- FR-009: Provenance trace export must be minimal and safe (redact by default; hashes/IDs preferred).

## Non-Goals (Out of Scope)
- Auth/RBAC, sharing, multi-tenant admin.
- External web research inside runs.
- Full Quick Start generation (Initiative 0002).
- Legal/materiality judgement.
- Requiring perfect OCR-derived highlight geometry before we can prove the trust UX.
  - OCR/layout extraction remains the default ingest posture for PDFs (ADR-0003).
  - We use fixture anchors first to validate highlight overlay mapping, then swap to OCR-derived geometry behind the same contracts.

## Design Considerations (Optional)
- Viewer UI states: loading skeleton, render error, page-out-of-range, citation_failed panel, citation details panel (snippet + hash).
- Accessibility: citation chips must be keyboard navigable; viewer controls must be accessible; error states must be readable (no color-only).

## Technical Considerations (Optional)
- Viewer architecture: see `breadboard-pack.md` and oracle notes `tmp-oracle/oracle_response_0001.md` (RH2).
- Coordinate math: treat `devicePixelRatio`, `page.rotate`, and non-zero `viewBox` origins as first-class (common drift sources).
- Evidence capture for RH2: prefer automation only if installable in this environment; otherwise commit manual screenshots with HUD visible.

## Failure States & UX

No silent failures. Examples:
- Missing doc(s): detect -> row `missing_input` -> show checklist -> allow upload/retry.
- Citation invariant failure (`snippet_hash` mismatch, invalid polygons, wrong page): detect -> row `citation_failed` -> show details + "flag citation wrong" -> block export by default.
- Viewer render failure (`render_url` unavailable): show explicit error panel with safe error code + retry.

## Metrics / Logging
- Success signals:
  - `citation_click_to_highlight_success_rate` (target: 100% on fixture packs)
  - `export_block_rate_due_to_citation_failed` (should match deliberate bad fixtures; no false positives on clean fixtures)
- Debug signals:
  - structured logs for `citation_overlay_rendered`, `citation_overlay_failed` (reason code), `viewer_page_render_ms`, `export_blocked`

## Rollback / Disable Plan
- Feature flag: `FEATURE_TRUST_SUBSTRATE` (default: off until spikes closed)
- Safe fallback behavior: when disabled, hide export and citation highlight features (no partial trust UX).

## Risks & Dependencies
- Spikes (must close or cut/patch):
  - RH1 pdf.js perf on scans
  - RH2 highlight overlay transforms across zoom/rotation
  - RH3 snippet normalisation/hash stability
  - RH4 verifier precision (0 false passes target) vs latency/cost
  - RH5 missing-doc heuristics false positives
- Security/design: provenance volume + PII risk (RH6).
- Contract choice: signed render URLs vs proxy (RH7).

## Success Metrics
- Fixture-driven demo passes:
  - `pack_01_clean`: citation click-to-highlight works; deliberate bad citation blocks export.
  - `pack_02_missing_rea`: missing-doc checklist shown; export behavior consistent.
  - `pack_07_scans_rotated_low_quality`: viewer remains usable; evidence is inspectable; highlight is honest (aligned or explicitly cut/patch).

## Open Questions
- Appetite/timebox: full perimeter now vs cut to "trust moment only" first?
- Storage access pattern for pdf.js: signed URLs vs proxy endpoint?
- Verification v1: code checks only, or include entailment model from day one?
- Canonical evidence capture approach for RH2 regression: manual screenshots vs automated harness (Playwright/agent-browser/etc)?

## Sources
- `docs/04-projects/02-features/0001_trust-substrate/brief.md`
- `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
- `docs/04-projects/02-features/0001_trust-substrate/risk-register.md`
- `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md`
- `docs/04-projects/02-features/0001_trust-substrate/tmp-oracle/oracle_response_0001.md` (RH2)

## Appendix: Shaping Notes (Optional)

### RH2 mapping summary (anchors-first)
- Store polygons as normalised `[0..1]` coords (origin top-left).
- Convert to PDF points using page `viewBox` and invert Y into PDF's bottom-left origin.
- Convert to viewport CSS pixels using `viewport.convertToViewportPoint()`.
- Render overlay in viewport CSS pixel space (`viewport.width/height`), not canvas backing pixels.

### RH2 honest fallbacks (if alignment is too hard)
- Cut: lock citation highlight to 100% zoom ("verified at 100% only").
- Patch: "evidence crop card" (render page offscreen and crop bbox) instead of live overlay alignment.
