# PRD: E2E-V3-0003 Run Readiness + Triage Core

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0003-run-readiness-triage-core
Priority: P1

## Introduction / Overview

### Problem
Quick Start gating and report triage are central workflow transitions; regressions here produce false starts, unclear progress, or non-actionable review queues.

### Goal
Define a deterministic E2E scenario proving readiness-gated run start and triage tab behavior on report rows.

### Slice
Validate v3 affordances U13-U17 (F3) and scoped report read behavior via `N6` + `N8`.

### Primary Observable Effect
Operators can start only when ready, see run progress, and filter triage rows by status deterministically.

### In Scope
- `U13`, `U14`, `U15`, `U16`, `U17`
- `N6` run start readiness contract
- `N8` report read model with run-scoped filtering

## Goals

- Prevent non-runnable Quick Start execution.
- Ensure run progress and triage status counts are visible.
- Keep report filters deterministic and URL-scoped.

## User Stories

### US-001: Start Run Only When Ready, Then Triage by Status
As an operator, I want run start to respect readiness and triage filters so I can review work efficiently.

#### Acceptance Criteria
- AC-001 (Given): Given a blocked matter, Quick Start control shows blocked reason and cannot start a run.
- AC-002 (When): When the same matter becomes runnable and Quick Start is triggered, run state and progress become visible.
- AC-003 (Then): Then report triage tabs (`All`, `Needs Review`, `Reviewed`, `Flagged`) filter rows and retain run scope.
- AC-004 (Example): Example: selecting `Needs Review` displays only rows with `needs_review` status and count matches visible rows.
- AC-005 (Negative): Negative: blocked readiness must return explicit conflict error (not silent failure or generic disabled state).

#### Verification
- Pack/fixture/script:
  - Seed runnable and blocked fixtures
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for blocked->ready transition, run start, progress rendering, tab filtering.
- Manual checks:
  - Validate blocked reason copy, then run start and triage tab switching.

## Functional Requirements

- FR-001: Quick Start must enforce readiness contract before run creation.
- FR-002: Progress meter must reflect `questions_done/questions_total`.
- FR-003: Triage tabs must filter row set by status and preserve run scope.

## Non-Goals (Out of Scope)

- Row-level review decision mutations.
- Evidence viewer controls.

## Failure States & UX

- Start conflict: render deterministic error code/message and next action.
- Missing run/report payload: render explicit empty/error state.

## Metrics / Logging

- Success signals:
  - Run-start success rate for runnable matters.
- Debug signals:
  - Run start conflicts and triage-filter mismatch events.

## Rollback / Disable Plan

- Revert to previous run start panel if readiness gating breaks.

## Risks & Dependencies

- Risk: Progress values can drift under async updates.
- Dependency: Stable run start and report endpoints.

## Success Metrics

- E2E catches regressions in readiness gates, progress rendering, and triage filtering.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
- `apps/web/app/(api)/folders/[id]/report/route.ts`
- `apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx`
