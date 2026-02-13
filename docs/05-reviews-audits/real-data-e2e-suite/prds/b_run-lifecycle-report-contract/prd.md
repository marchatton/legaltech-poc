# PRD: Real-Data E2E Loop B - Run Lifecycle + Report Contract

Owner: marc
Status: Draft
Date: 2026-02-12
Slug: real-data-e2e-loop-b-run-report

## Introduction / Overview

### Problem
Run scheduling/progress endpoints are live, but dev Quick Start paths still rely on seeded/fallback row writes in key cases. This produces report outputs that can diverge from actual step execution.

### Goal
Normalize run lifecycle and report-row contracts so report output in dev reflects real run data end to end.

### Slice
This slice owns P0 run lifecycle + report closure: run state transitions, terminal-state guarantees, and report row/status generation from real step outcomes.

### Primary Observable Effect
For the same run, `/api/runs/:id` state transitions and `/api/folders/:id/report` row statuses are traceable to real step execution without seeded placeholder substitution.

## In Scope

- Run start/progress/terminal-state contract normalization for P0 flows.
- Report row write/read path alignment to real step outputs.
- Removal of seeded/fallback fail-closed placeholder writes from Quick Start critical path.
- Pack coverage for `pack_01_clean`, `pack_04_multi_parcel`, and `pack_05_partial_release`.

## Goals

- Ensure run states are deterministic and observable.
- Ensure report rows represent real workflow outputs.
- Preserve fail-closed behavior without using placeholder synthesis as a default success path.

## User Stories

### US-001: Run lifecycle state machine is deterministic
As an operator, I want run start/progress/terminal states to be consistent so I can trust run status before triage/export actions.

#### Acceptance Criteria
- Run creation returns a stable initial state and progresses through valid transitions only.
- Terminal states are explicit and immutable once reached.
- Example: a successful run transitions `queued -> running -> completed` and exposes timestamps for each terminal decision point.
- Negative: run state must never regress from terminal to non-terminal or oscillate between contradictory states.

#### Verification
- Pack/fixture/script: execute quick start runs for `pack_01_clean` and `pack_04_multi_parcel` and capture state timeline from `/api/runs/:id`.
- Automated checks: run-state transition tests asserting allowed transition graph.
- Manual checks: verify run progress and terminal status in matter detail UI.

### US-002: Report rows are sourced from real step outcomes
As a reviewer, I want report rows and statuses to map to real step results so triage decisions reflect actual extraction/verification behavior.

#### Acceptance Criteria
- Report rows are generated from persisted run outputs for the selected run.
- Row status values and payload versions match real step results.
- Example: `pack_05_partial_release` produces mixed row statuses that are stable across report reloads.
- Negative: seeded/fallback placeholder writes from Quick Start are not emitted for successful real-data runs.

#### Verification
- Pack/fixture/script: run `pack_01_clean`, `pack_04_multi_parcel`, and `pack_05_partial_release`; compare run-step outputs to report rows.
- Automated checks: integration tests for `runs -> report` data mapping and row status invariants.
- Manual checks: refresh report tabs and verify row consistency for the same run id.

### US-003: Run/report failure contracts are explicit to users
As an operator, I want run/report failures surfaced with typed reasons so recovery paths are clear.

#### Acceptance Criteria
- Run failures render deterministic error envelopes with stable code fields.
- Report retrieval for failed/incomplete runs surfaces a clear recoverable UI state.
- Example: failed run shows a typed failure banner and preserves prior completed run report history.
- Negative: report surface must not display stale "success" rows for a failed active run.

#### Verification
- Pack/fixture/script: inject a controlled run failure and observe report surface behavior.
- Automated checks: API tests for failure envelope shape; UI tests for error-state rendering.
- Manual checks: verify recovery messaging points to rerun or triage actions.

## Functional Requirements

- FR-001: Enforce one canonical run-state transition model in run APIs and UI consumers.
- FR-002: Persist and expose terminal-state metadata needed for downstream report/export contracts.
- FR-003: Report row generation must be run-scoped and sourced from real step outputs.
- FR-004: Remove Quick Start seeded placeholder row writes from the critical successful path.
- FR-005: Failure envelopes must be typed and safe for UI display without leaking internals.

## Non-Goals (Out of Scope)

- Citation rendering and export blocking contract work (Loop C scope).
- Broad review/chat UX polish outside run/report correctness.
- Production-mode rollout for run/report workflows.

## Failure States + UX

- Run creation denied: explicit blocked/conflict message with next action.
- Run execution failure: deterministic error banner with code and trace id.
- Report fetch failure: recoverable empty/error state with retry and run selection guidance.

## Metrics / Logging

- `run_state_transition_invalid_total` (target: `0`).
- `report_rows_seeded_fallback_total` (target: `0` for successful real-data runs).
- `report_state_mismatch_total` between run terminal state and report payload state.

## Rollback / Disable Path

- Feature gate for real-run report mapping can be toggled off to fall back to current fail-closed defaults if regressions are detected.
- Safe fallback maintains blocked/default-safe exports and existing trust constraints.

## Risks + Dependencies

- Risks:
  - Hidden fallback branches may still write seeded rows under rare timing/error paths.
  - Consumers may assume old row status semantics and misrender mixed states.
- Dependencies:
  - Depends on Loop A readiness decisions for predictable run-start gating.
  - Unblocks Loop C export/citation contracts that depend on reliable run/report state.

## Success Metrics

- Run state progression is deterministic for target packs with no invalid transitions.
- Report rows map to real run outputs for all target packs.
- Seeded fallback report writes are absent from successful P0 runs.

## Open Questions

- None. Closed on 2026-02-13 via `ask-questions-if-underspecified` defaults.

## Resolved Decisions

- Run polling cadence is standardized in this loop: poll every 2s while run state is `queued` or `running`; stop polling at terminal states.
- No temporary compatibility shim will be added; report consumers must align to the canonical run/report contract.

## Quality Gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Sources

- `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
