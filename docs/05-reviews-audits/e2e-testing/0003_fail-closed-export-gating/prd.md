# PRD: E2E-0003 Fail-Closed Citation + Export Blocked (pack_01_clean)

Owner: (TBD)
Status: Draft
Date: 2026-02-09
Slug: e2e-0003-fail-closed-export-gating

## Introduction / Overview

### Problem
The PoC’s safety posture depends on failing closed:
- If a citation invariant breaks (e.g. snippet hash mismatch), the viewer must render **no overlay** and show an explicit `citation_failed` reason.
- Exports must be blocked by default when verification fails (no silent unsafe outputs).

These are easy to regress across UI, API, and verification code paths.

### Goal
Define a deterministic e2e scenario proving:
1) corrupted citations fail closed in the viewer (explicit reason_code; no overlay), and
2) export is blocked by default when any row fails deterministic verification.

### Slice
One e2e scenario against the seeded Matters UI on `pack_01_clean` using the tracer-bullet corrupted citation row `TB-BAD-CITATION` with citation id `cit_TB_BAD_1`.

### Primary Observable Effect
When the scenario passes:
- The viewer shows `citation_failed` with `reason_code: SNIPPET_HASH_MISMATCH` for `cit_TB_BAD_1` and draws no highlight overlay.
- Clicking `Export CSV` yields a blocked error state showing `EXPORT_BLOCKED`.

### In Scope
- Seeded Matters UI route `/matters?pack=pack_01_clean`
- Citation viewer fail-closed UI for corrupted citations
- Export CSV gating (`/spikes/export/csv`) with deterministic verification

## Goals

- Prove fail-closed UI behavior for corrupted citations (no overlay, explicit reason_code).
- Prove export gating blocks unsafe outputs by default (when verification fails).
- Provide acceptance criteria that can be automated deterministically.

## User Stories

### US-001: Corrupted Citations Fail Closed and Block Export
As a reviewer, if the system’s citation integrity checks fail, I want explicit errors and blocked exports so I never accidentally rely on unsafe outputs.

#### Acceptance Criteria
- AC-001 (setup): Seed `pack_01_clean` (default includes `TB-BAD-CITATION` with a corrupted `snippet_hash`):
  - `pnpm fixture:seed pack_01_clean --overwrite`
- AC-002 (setup): Start dev server with spikes enabled:
  - `SPIKES_ENABLED=1 pnpm dev` (required; `/matters` is dev-only)
- AC-003: Visiting `/matters?pack=pack_01_clean` shows row `TB-BAD-CITATION` with:
  - status `citation_failed`
  - citation chip `cit_TB_BAD_1`
- AC-004: Clicking `Export CSV` shows an explicit blocked state:
  - error message starts with `EXPORT_BLOCKED:`
  - message contains `Export blocked` and indicates one or more rows failed verification
- AC-005: Clicking citation chip `cit_TB_BAD_1` opens the viewer and:
  - renders a `citation_failed` panel
  - shows `reason_code: SNIPPET_HASH_MISMATCH`
  - renders **no** highlight overlay polygons (the highlight `<svg>` contains zero `<polygon>` elements)
- AC-006 (negative): When the viewer is in `citation_failed` state, it must not disable this failure behind loading states; the error reason must be visible without scrolling (panel near the snippet hashes).

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_01_clean --overwrite`
  - run app with spikes enabled: `SPIKES_ENABLED=1 pnpm dev`
- Automated checks:
  - (future) e2e runner asserts:
    - blocked export UI state (`EXPORT_BLOCKED`)
    - viewer `reason_code: SNIPPET_HASH_MISMATCH`
    - absence of highlight polygons
- Manual checks:
  - Navigate to `/matters?pack=pack_01_clean`
  - Click `Export CSV` (should be blocked)
  - Click `TB-BAD-CITATION` -> `cit_TB_BAD_1` and confirm fail-closed viewer state

## Functional Requirements

- FR-001: Any corrupted citation (snippet hash mismatch, wrong doc, wrong page, invalid geometry) must render as `citation_failed` with an explicit `reason_code`, and render no highlight overlay.
- FR-002: Export CSV must be blocked by default if any row fails deterministic verification (`EXPORT_BLOCKED`) unless an explicitly authorised unsafe override is used (demo-only).
- FR-003: Export blocking must be user-visible in the UI (not silent).

## Non-Goals (Out of Scope)

- Unsafe override flows (`ALLOW_UNSAFE_EXPORTS`, admin token) beyond verifying the default blocked posture.
- Semantic correctness of answers (this scenario is integrity/invariant-only).

## Technical Considerations (Optional)

- `Export CSV` depends on `/spikes/export/csv`, which is gated by `SPIKES_ENABLED=1`.
- The corrupted citation row is seeded by `scripts/fixtures/seed.ts` (citation id `cit_TB_BAD_1`, question id `TB-BAD-CITATION`).

## Failure States & UX

- If export is not blocked: regression (unsafe posture).
- If viewer renders any overlay polygons for corrupted citation: regression (not fail-closed).
- If reason_code is missing or non-specific: regression (non-actionable failure UX).

## Metrics / Logging

- Capture:
  - the export response error code string visible to the user
  - viewer reason_code text
  - screenshots of the viewer overlay area to ensure “no overlay” is obvious

## Rollback / Disable Plan

- If spikes endpoints are removed, export gating should move to the canonical artefact export surface and this scenario should be updated accordingly.

## Risks & Dependencies

- Risk: If the corrupted citation row is removed from fixture seed output, this scenario needs a new deterministic corruption trigger.
- Risk: Headless download assertions can be flaky; prefer asserting on the user-visible blocked state rather than download plumbing.

## Success Metrics

- Regressions are caught if:
  - corrupted citations no longer fail closed
  - export is no longer blocked by default on verification failures

## Open Questions

- Should e2e automation assert the exact `reason_code` string, or allow a small allowlist of fail-closed codes (e.g. `SNIPPET_HASH_MISMATCH`, `DOC_MISMATCH`, `WRONG_PAGE`)?

## Sources

- Demo runbook: `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md` (Edge case B + export posture)
- Export endpoint + gating: `apps/web/app/(api)/spikes/export/csv/route.ts`
- Export UI: `apps/web/app/(app)/matters/ExportCsvButton.tsx`
- Viewer: `apps/web/app/(app)/matters/viewer/page.tsx`
- Viewer overlay: `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
- Fixture seed: `scripts/fixtures/seed.ts`
