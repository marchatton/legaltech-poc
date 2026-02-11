# PRD: E2E-V3-0007 Artefact Provenance Retrieval

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0007-artefact-provenance-retrieval
Priority: P2

## Introduction / Overview

### Problem
Artefact retrieval needs provenance and safety context; regressions can hide unsafe outputs or detach downloads from source runs.

### Goal
Define a deterministic E2E scenario proving artefact filtering, provenance visibility, unsafe labeling, and resilient download behavior.

### Slice
Validate v3 affordances U33-U36 (F7) across artefact list and download flows.

### Primary Observable Effect
Operators can filter artefacts by kind/type, inspect provenance, and download with clear safety feedback.

### In Scope
- Artefact filters (`csv`, `docx`, `unsafe`)
- Provenance metadata display (`source_run_id`)
- Download action feedback
- `UNSAFE` explanation affordance

## Goals

- Keep artefact retrieval auditable.
- Surface unsafe status clearly before download.
- Ensure download failures are explicit and recoverable.

## User Stories

### US-001: Retrieve Artefacts with Provenance and Safety Context
As an operator, I want artefact list and download actions to include provenance and safety cues so I can trust what I download.

#### Acceptance Criteria
- AC-001 (Given): Given mixed artefacts exist (csv/docx + safe/unsafe), artefact list renders all with provenance metadata.
- AC-002 (When): When operator applies filters, list updates deterministically by selected kind/type/safety.
- AC-003 (Then): Then each row shows source run provenance and actionable download control with loading feedback.
- AC-004 (Example): Example: selecting `unsafe` filter shows only rows with `UNSAFE` label and explanation copy.
- AC-005 (Negative): Negative: expired or invalid signed URL must show deterministic error state rather than silent download failure.

#### Verification
- Pack/fixture/script:
  - Seed artefacts with mixed kind/type/safety
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for filtering, provenance rendering, unsafe explanation, download failure handling.
- Manual checks:
  - Filter rows, inspect provenance, trigger safe + failing download paths.

## Functional Requirements

- FR-001: Artefact list must support deterministic kind/type/safety filters.
- FR-002: Rows must expose `source_run_id` provenance.
- FR-003: Unsafe artefacts must be clearly labeled with explanation.
- FR-004: Download action must expose loading and failure states.

## Non-Goals (Out of Scope)

- Artefact generation pipeline.
- Retention policy and lifecycle management.

## Failure States & UX

- Missing provenance: explicit placeholder (`source unknown`) not blank.
- Download signing failure: deterministic `ErrorBanner` with support path.

## Metrics / Logging

- Success signals:
  - Artefact download completion rate.
- Debug signals:
  - Download-signing failure rates by artefact kind.

## Rollback / Disable Plan

- Disable enhanced artefact list and fallback to simple download links.

## Risks & Dependencies

- Risk: Signed URL freshness causes flaky download attempts.
- Dependency: Stable artefact listing and download endpoints.

## Success Metrics

- E2E catches regressions in provenance/safety labeling and download resilience.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(app)/matters/ArtefactsList.tsx`
- `apps/web/app/(api)/folders/[id]/artefacts/route.ts`
- `apps/web/app/(api)/artefacts/[id]/download/route.ts`
