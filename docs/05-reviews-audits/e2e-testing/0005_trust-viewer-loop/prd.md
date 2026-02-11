# PRD: E2E-V3-0005 Trust Viewer Loop

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0005-trust-viewer-loop
Priority: P0

## Introduction / Overview

### Problem
Citation trust is the highest-risk parity surface: highlight rendering, verification state, trust metadata, and fail-closed behavior must all remain correct.

### Goal
Define a deterministic E2E scenario that validates the full trust viewer loop for both valid and failed citations.

### Slice
Validate v3 affordances U19-U28 (F5), including strict anchor behavior and trust rail fields.

### Primary Observable Effect
Operators can jump from source chips to evidence, verify at 100% zoom, and recover safely when citations fail.

### In Scope
- Citation chip -> evidence viewer transition
- Highlight overlay + reset-to-100 verification action
- Trust footer (`doc_version`, `verified_at`, `loaded_state`)
- `citation_failed` recovery and UI-only flag acknowledgement

## Goals

- Keep evidence verification explicit and auditable.
- Enforce fail-closed behavior for unresolved/broken citations.
- Preserve trust metadata visibility in all viewer states.

## User Stories

### US-001: Verify Evidence and Fail Closed on Citation Problems
As a reviewer, I want source jumps to show verifiable evidence so I can trust outputs and recover safely when verification fails.

#### Acceptance Criteria
- AC-001 (Given): Given a row with valid citation and a row with corrupted citation, source chips are available from report context.
- AC-002 (When): When the valid citation is opened, viewer shows PDF with highlight overlay and explicit verification controls.
- AC-003 (Then): Then trust footer fields render from payload and `Reset to 100% to verify` restores verifiable state.
- AC-004 (Example): Example: valid citation renders one or more highlight polygons and no `citation_failed` panel.
- AC-005 (Negative): Negative: corrupted citation renders `citation_failed` with deterministic reason code and zero overlay polygons.

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_01_clean --overwrite`
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for valid viewer path and fail-closed viewer path.
- Manual checks:
  - Open valid + corrupted citations and confirm trust/failed states.

## Functional Requirements

- FR-001: Source jump is anchor-gated; unresolved anchors are non-clickable with reason.
- FR-002: Viewer must show explicit verification state at 100% zoom.
- FR-003: Trust metadata fields must be payload-backed, not hardcoded.
- FR-004: Citation failure path must expose deterministic reason code and recovery guidance.
- FR-005: `Flag citation wrong` remains UI acknowledgement only.

## Non-Goals (Out of Scope)

- Persistent citation dispute backend workflow.
- Fuzzy/page-only source jump fallback.

## Failure States & UX

- Missing citation: explicit not-found panel + back link.
- Corrupted citation: fail-closed panel + zero overlay + recovery checklist.

## Metrics / Logging

- Success signals:
  - Ratio of valid citations rendering overlay.
- Debug signals:
  - `citation_failed` reason-code distribution.

## Rollback / Disable Plan

- Disable viewer enhancement and revert to baseline citation display if fail-closed assertions fail.

## Risks & Dependencies

- Risk: PDF/rendering differences between local/headless environments.
- Dependency: Citation payload integrity and render endpoint availability.

## Success Metrics

- Trust loop remains deterministic for both good and bad citations.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(app)/matters/viewer/page.tsx`
- `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
- `apps/web/app/(api)/citations/[id]/route.ts`
