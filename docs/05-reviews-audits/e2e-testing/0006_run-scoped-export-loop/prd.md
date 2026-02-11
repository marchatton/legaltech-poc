# PRD: E2E-V3-0006 Run-Scoped Export Loop

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0006-run-scoped-export-loop
Priority: P0

## Introduction / Overview

### Problem
Export safety and context continuity are critical; regressions can leak unsafe artefacts or break the failed-row recovery loop.

### Goal
Define a deterministic E2E scenario proving exports are run-scoped, fail closed when needed, and deep-link back into failed-row triage.

### Slice
Validate v3 affordances U29-U32 (F6) with run selector and blocked-export behavior.

### Primary Observable Effect
Operators can export from a completed run when safe, and when blocked they are routed directly to failed rows for that same run.

### In Scope
- Completed-run selector behavior
- CSV/DOCX export actions
- Blocked-export panel and `Review failed rows` deep-link
- Run-scoped report filter continuity

## Goals

- Enforce fail-closed export posture.
- Preserve run context when returning from blocked export to report triage.
- Keep export action surface deterministic.

## User Stories

### US-001: Export Safely and Return to Failed Rows with Context Intact
As an operator, I want export actions to block unsafe output and guide me directly to the right failed rows.

#### Acceptance Criteria
- AC-001 (Given): Given at least one completed run and one run with failed citation rows, export surface offers completed runs only.
- AC-002 (When): When operator selects a completed safe run, CSV/DOCX export actions are enabled and return downloadable artefacts.
- AC-003 (Then): Then blocked run exports show a deterministic blocked panel with failed-row count and `Review failed rows` CTA.
- AC-004 (Example): Example: clicking `Review failed rows` opens report with matching `run_id` and failed filter pre-applied.
- AC-005 (Negative): Negative: export must not proceed silently for a run with verification failures.

#### Verification
- Pack/fixture/script:
  - Seed one safe completed run and one blocked run case
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for run selector filtering, safe export, blocked export, deep-link continuity.
- Manual checks:
  - Validate both safe-export and blocked-export branches.

## Functional Requirements

- FR-001: Export selector must list completed runs only.
- FR-002: Export actions must be bound to selected run scope.
- FR-003: Blocked exports must render fail-closed messaging and recovery CTA.
- FR-004: Recovery CTA must preserve `run_id` and failed-row filter context.

## Non-Goals (Out of Scope)

- Bulk export scheduling across multiple runs.
- Unsafe override/admin-only export path.

## Failure States & UX

- No completed runs: disabled export controls + guidance.
- Export job/network failure: deterministic `ErrorBanner` with retry.

## Metrics / Logging

- Success signals:
  - Export success rate for safe completed runs.
- Debug signals:
  - Blocked-export events and deep-link follow-through rate.

## Rollback / Disable Plan

- Disable run-scoped export UI and fallback to prior export entrypoint if context continuity fails.

## Risks & Dependencies

- Risk: Run selector can drift from backend completion status.
- Dependency: Stable run/report export contracts.

## Success Metrics

- E2E catches unsafe-export regressions and broken failed-row deep links.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(app)/matters/ExportCsvButton.tsx`
- `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`
- `apps/web/app/(api)/folders/[id]/report/route.ts`
