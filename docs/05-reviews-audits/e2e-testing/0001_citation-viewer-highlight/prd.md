# PRD: E2E-0001 Seeded Matters Citation Highlight + Review

Owner: (TBD)
Status: Draft
Date: 2026-02-09
Slug: e2e-0001-citation-viewer-highlight

## Introduction / Overview

### Problem
The most important "trust moment" in this PoC is: click a citation -> see the cited clause highlighted in the PDF. This is easy to regress (PDF rendering, overlay mapping, routing, query params, fixture ids), and it’s currently not protected by an end-to-end scenario with explicit acceptance criteria.

### Goal
Define a deterministic e2e scenario that proves the citation viewer highlight overlay works and that review state changes are explicit and persisted.

### Slice
One e2e scenario against the **dev-only** fixture-seeded Matters UI:
- Load `pack_01_clean`
- Mark a `needs_review` row as `reviewed`
- Click a citation chip and verify PDF renders with a highlight overlay (no fail-closed error)

### Primary Observable Effect
When the scenario passes, a user can:
1) change a row status to `reviewed` (persisted), and
2) open a citation viewer where the PDF renders and at least one highlight polygon is visible at 100% zoom.

### In Scope
- `apps/web` dev-only route `/matters?pack=pack_01_clean` backed by `tmp/fixture-seed/pack_01_clean/snapshot.json`
- Citation viewer route `/matters/viewer?pack=...&citation=...`
- Mark reviewed action (`Mark reviewed` button) persistence to `tmp/fixture-seed/*/snapshot.json`

## Goals

- Prove the click-to-highlight evidence UX works end-to-end on a seeded pack.
- Prove review state transitions are explicit (no silent success) and persisted across refresh.
- Provide acceptance criteria that can be automated deterministically (no OCR/LLM dependencies).

## User Stories

### US-001: Click Citation -> Highlight Evidence (and Persist Review)
As a reviewer, I want to click a citation and see the cited text highlighted in the PDF so that I can validate claims quickly, and I want to mark rows reviewed explicitly so the workflow state is visible.

#### Acceptance Criteria
- AC-001 (setup): Seed snapshot and start the dev server:
  - `pnpm fixture:seed pack_01_clean --overwrite` (creates `tmp/fixture-seed/pack_01_clean/snapshot.json`)
  - `pnpm dev` (required; `/matters` is dev-only)
- AC-002: Visiting `/matters?pack=pack_01_clean` renders:
  - Page title `Matters`
  - `pack_id: pack_01_clean`
- AC-003: Row `TS-01` exists and is initially `needs_review`, with a citation chip `cit_TS-01_1`.
- AC-004: Clicking `Mark reviewed` on row `TS-01`:
  - redirects back to `/matters?pack=pack_01_clean&reviewed=TS-01`
  - updates the row status to `reviewed`
  - shows the success banner `Saved` / `Marked as reviewed.`
  - persists after refresh (row remains `reviewed`)
- AC-005: Clicking citation chip `cit_TS-01_1` opens the viewer and:
  - does not render a `citation_failed` reason_code panel
  - renders at least one `<polygon>` overlay inside the highlight `<svg>`
  - shows `Locked to 100% while highlighting` and disables the Zoom select
- AC-006 (negative): Visiting `/matters/viewer?pack=pack_01_clean&citation=DOES_NOT_EXIST` shows:
  - `Citation not found: DOES_NOT_EXIST`
  - a `Back to matters` link to `/matters?pack=pack_01_clean`

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_01_clean --overwrite`
  - run app: `pnpm dev` (requires `NODE_ENV=development`)
- Automated checks:
  - (future) e2e runner (Playwright or agent-driven) that asserts on:
    - URL transitions
    - row status chip text
    - presence/absence of `citation_failed`
    - presence of at least one `<polygon>` element in the viewer
- Manual checks:
  - Navigate to `/matters?pack=pack_01_clean`
  - Mark `TS-01` reviewed
  - Click `cit_TS-01_1` and visually confirm the highlight overlay is drawn

## Functional Requirements

- FR-001: The Matters page must render a seeded snapshot for `pack_01_clean` when `tmp/fixture-seed/pack_01_clean/snapshot.json` exists.
- FR-002: A `needs_review` row must render a `Mark reviewed` button that persists the status change and shows an explicit success state.
- FR-003: Citation chips must link to `/matters/viewer` with sufficient query params to load the citation and render the target PDF page.
- FR-004: The citation viewer must render a highlight overlay when invariants pass, and must lock zoom to 100% while highlighting.
- FR-005: The citation viewer must render a user-visible error state (no overlay) when the citation is missing or cannot be loaded.

## Non-Goals (Out of Scope)

- DB-backed ingest/index pipeline (`/demo/load-pack`, `/matters/[id]`) and Quick Start workflow execution.
- OCR/layout extraction correctness (this scenario uses seeded snapshots + fixture PDFs).
- Entailment/semantic verification (deterministic integrity only).

## Design Considerations (Optional)

- Keep selectors stable for automation:
  - citation chips are anchors with monospace ids (e.g. `cit_TS-01_1`)
  - viewer uses `canvas#citation-canvas` and an `<svg>` overlay with `<polygon>` elements

## Technical Considerations (Optional)

- Dependencies:
  - `tmp/fixture-seed/*/snapshot.json` must be writable for `Mark reviewed` to persist.
  - `pdfjs-dist` must load its worker in the test environment.
- Routes touched:
  - UI: `/matters`, `/matters/viewer`
  - API: `/citations/:id?pack=...`, `/documents/:document_id/render?page=...`

## Failure States & UX

- Seed snapshot missing: Matters page instructs `pnpm fixture:seed <pack>` and shows no rows.
- Citation fetch fails: viewer shows `Failed to load citation` with code/message and `Back to matters`.
- Render URL fetch fails: viewer shows `Failed to fetch render_url` with code/message and `Back to matters`.
- Overlay invariants fail: viewer shows `citation_failed` + `reason_code`, and renders no overlay.

## Metrics / Logging

- Test runner should capture:
  - browser console logs + network failures
  - screenshot on failure (Matters page and Viewer page)
  - final URL on failure for quick triage

## Rollback / Disable Plan

- If the dev-only seeded UI is removed or gated differently, this scenario should be disabled or rewritten to target the production workflow surfaces.

## Risks & Dependencies

- Risk: The snapshot file is mutable; tests must re-seed with `--overwrite` to keep runs deterministic.
- Risk: Canvas/PDF rendering in headless browsers can be flaky; assertions should key off DOM state (polygons present) rather than pixel-perfect diffs.

## Success Metrics

- Running this scenario catches regressions in:
  - citation linking/routing
  - PDF rendering
  - highlight overlay mapping
  - explicit review state persistence

## Open Questions

- Should the e2e harness run via a browser runner (Playwright) or via an agent harness that can click/verify DOM state?
- Do we want to treat `Mark reviewed` as a required e2e step, or keep this scenario read-only?

## Sources

- Demo runbook: `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md` (Steps 2.2 and 2.3)
- Matters UI: `apps/web/app/(app)/matters/page.tsx`
- Review action: `apps/web/app/(app)/matters/actions.ts`
- Viewer route: `apps/web/app/(app)/matters/viewer/page.tsx`
- Viewer overlay: `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
