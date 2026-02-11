# PRD: E2E-V3-0009 Demo Operator Loop

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0009-demo-operator-loop
Priority: P1

## Introduction / Overview

### Problem
Demo workflows must be repeatable and explicit. Regressions in pack loading, checklist state, elapsed timing, or history reopen can break operator confidence.

### Goal
Define a deterministic E2E scenario proving demo operators can load/reload allowlisted packs and follow checklist progression with stable context.

### Slice
Validate v3 affordances U44-U49 (F9) plus run timestamp-derived elapsed behavior.

### Primary Observable Effect
Operator can repeatedly load demo packs, observe checklist progression, and reopen recent demo matters quickly.

### In Scope
- Persistent `DEMO MODE` toolbar
- Allowlisted pack selector + `Load demo pack`
- Checklist status progression + minute-level elapsed display
- Demo history reopen and load-again shortcuts

## Goals

- Keep demo run loop deterministic and repeatable.
- Prevent accidental use of non-allowlisted packs.
- Keep elapsed timing coarse and stable.

## User Stories

### US-001: Load/Reload Demo Packs with Guided Checklist and History Reopen
As an operator, I want a repeatable demo control loop so I can run scripted demos reliably.

#### Acceptance Criteria
- AC-001 (Given): Given demo mode is enabled, toolbar is visible with `DEMO MODE` label and allowlisted packs only.
- AC-002 (When): When operator loads a pack, system creates/opens a fresh matter and displays checklist context.
- AC-003 (Then): Then checklist shows `todo/in_progress/done` progression and minute-level elapsed time (or explicit unavailable state).
- AC-004 (Example): Example: using `Load pack again` creates a new demo matter without destructive reset of prior run records.
- AC-005 (Negative): Negative: submitting a non-allowlisted pack id returns validation error and does not create/open a matter.

#### Verification
- Pack/fixture/script:
  - `pnpm dev`
  - Demo mode env enabled
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for toolbar, load flow, checklist states, elapsed display, history reopen.
- Manual checks:
  - Run a full load -> checklist -> reopen -> load-again loop.

## Functional Requirements

- FR-001: Demo toolbar must stay visible and explicit in demo mode.
- FR-002: Pack selector must enforce allowlist.
- FR-003: Load action must create/open deterministic demo matter context.
- FR-004: Checklist status and elapsed must derive from run timestamps at minute granularity.
- FR-005: History reopen must return to selected prior demo context.

## Non-Goals (Out of Scope)

- Second-level/high-precision elapsed timing.
- Arbitrary external pack ingestion.

## Failure States & UX

- Load failure: deterministic error code/message in toolbar.
- Missing timestamp data: explicit `Elapsed unavailable` state.

## Metrics / Logging

- Success signals:
  - Demo pack load success rate.
- Debug signals:
  - Pack validation failures and checklist state derivation errors.

## Rollback / Disable Plan

- Fallback to prior demo loader route if checklist/history flow regresses.

## Risks & Dependencies

- Risk: Demo state can drift under rapid repeated load actions.
- Dependency: Stable demo load API and run metadata timestamps.

## Success Metrics

- E2E validates deterministic operator loop with repeatability.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/DemoToolbar.tsx`
- `apps/web/app/(api)/demo/load-pack/route.ts`
- `apps/web/app/(api)/runs/[id]/route.ts`
