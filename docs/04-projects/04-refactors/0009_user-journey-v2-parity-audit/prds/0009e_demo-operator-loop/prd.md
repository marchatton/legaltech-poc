# PRD: Demo Operator Loop and Checklist Parity (0009e)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: demo-operator-loop

## Introduction / Overview

### Problem
Demo mode surfaces exist, but operator workflow parity is incomplete: checklist progress/elapsed tracking is missing, fixture context is weak, and repeat-load/reopen loops are not explicit.

### Goal
Strengthen demo-mode operator flow so repeated walkthroughs are deterministic, fast, and auditable.

### Slice
Implement operator checklist card, explicit fixture context/checklist copy, and repeat demo shortcuts (`Load pack again`, demo history reopen).

### Primary Observable Effect
In demo mode, operators can track progress steps with elapsed time, quickly reload packs, and reopen recent demo matters without manual navigation churn.

### In Scope
- U47-U49
- W-A2 (operational behavior), W-A3 (state copy alignment), W-C11
- N16

## Goals

- Add checklist card with coarse step completion and elapsed time.
- Improve fixture context visibility for demo-mode confidence.
- Reduce repeat demo cycle friction with shortcut actions.

## User Stories

### US-001: Operator checklist card with coarse progress and elapsed time
As a demo operator, I want checklist progress and elapsed time so I can track where I am in the walkthrough.

#### Acceptance Criteria
- AC-001: Checklist card shows ordered steps with `todo`, `in_progress`, `done` state badges.
  - Example: run start moves step from `todo` to `in_progress` and completion updates to `done`.
  - Negative: checklist state must not rely on hardcoded static progression.
- AC-002: Elapsed time is displayed at coarse minute-level precision.
  - Example: elapsed shows `7m` from `runs.created_at` (or `started_at` when available).
  - Negative: second-level precision timers are out of scope in parity v1.

#### Verification
- Pack/fixture/script: demo mode run walkthrough with checklist steps.
- Automated checks: checklist state derivation tests from run metadata.
- Manual checks: run demo flow and verify card progression + elapsed display.

### US-002: Fixture context and guidance banner mode
As a demo operator, I want explicit fixture context so I can explain what demo state is loaded and what to do next.

#### Acceptance Criteria
- AC-003: Demo surfaces show clear fixture context banner (pack name, loaded status, next action guidance).
  - Example: banner updates after load to indicate active pack and recommended next step.
  - Negative: implicit context text hidden in low-salience copy is insufficient.
- AC-004: Quick Start state copy aligns with checklist guidance (`ready`, `blocked`, `already complete`).
  - Example: blocked state banner points to missing prerequisite step.
  - Negative: contradictory checklist and quick-start messaging is not allowed.

#### Verification
- Pack/fixture/script: load different demo packs and observe guidance updates.
- Automated checks: banner state mapping tests.
- Manual checks: compare checklist and quick-start copy consistency.

### US-003: Repeat demo shortcuts (`Load pack again`, reopen recent)
As a demo operator, I want explicit repeat actions so I can rerun demos quickly without setup friction.

#### Acceptance Criteria
- AC-005: Demo toolbar includes `Load pack again` shortcut for currently selected pack.
  - Example: shortcut reruns pack load and resets relevant demo state deterministically.
  - Negative: shortcut must not bypass required readiness resets silently.
- AC-006: Demo history supports reopen action with pack + timestamp context.
  - Example: selecting history item reopens corresponding matter context.
  - Negative: history must not show synthetic fake entries when no real demo runs exist.

#### Verification
- Pack/fixture/script: repeated load/reopen cycles on demo packs.
- Automated checks: demo action handler tests.
- Manual checks: run loop timing and reopen behavior walkthrough.

## Functional Requirements

- FR-001: Add operator checklist card bound to run metadata and coarse elapsed calculation.
- FR-002: Add fixture context banner and action guidance states.
- FR-003: Add deterministic repeat-load and demo-history reopen actions.

## Non-Goals (Out of Scope)

- Precision telemetry pipeline for sub-minute checklist timing.
- New backend-heavy demo orchestration.
- Non-demo production workflow changes.

## Technical Considerations

- Extend/reuse run metadata contracts to include `created_at` and `updated_at` (plus `started_at` when available).
- Elapsed baseline is locked to `created_at` in parity v1 unless reliable `started_at` is present.
- Keep checklist states derivable from existing run/document signals in parity v1.
- Ensure demo shortcuts remain deterministic and idempotent.

## Failure States & UX

- Pack reload failure -> deterministic banner error with retry.
- Missing run timestamps -> checklist card shows `Elapsed unavailable` and keeps step states visible.
- Reopen target missing -> user-visible fallback to matters list with explanation.

## Metrics / Logging

- Success signals:
  - Demo loop completion time reduction.
  - Repeat-load shortcut usage rate.
- Debug signals:
  - `demo.checklist.step_transition`.
  - `demo.pack.reload.failed`.

## Rollback / Disable Plan

- Feature flag: `demo_operator_loop_v1`.
- Safe fallback behavior: existing demo mode toolbar and load flows remain active.

## Risks & Dependencies

- Risks:
  - Checklist derivation may become inconsistent with actual run state transitions.
  - Repeat-load actions may produce confusing state if reset semantics are unclear.
- Dependencies:
  - Depends on demo mode surfaces and run metadata availability.
  - Integrates with matters list surfaces from `0009a`.

## Success Metrics

- Operators can complete demo loops with visible progress and coarse elapsed context.
- Repeat demo actions reduce manual setup effort and navigation churn.

## Resolved Spike Decision

- SP-0009-05 resolved (2026-02-11): checklist elapsed uses run timestamps and minute-level rendering.
  - Baseline: `created_at` (or `started_at` when present and reliable).
  - Precision: minute-level only.
  - Missing timestamp fallback: render `Elapsed unavailable` (no guessed stopwatch).

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/OperatorChecklist.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/DemoHistory.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/demo/DemoToolbar.tsx`
- `docs/04-projects/04-refactors/0007_empty-text-sentinel-chunks/oracle-spike-response.md`
