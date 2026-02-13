# PRD: Real-Data E2E Loop A - Entry + Readiness Foundation

Owner: marc
Status: Draft
Date: 2026-02-12
Slug: real-data-e2e-loop-a-entry-readiness

## Introduction / Overview

### Problem
In dev mode, entry and readiness signals can diverge between UI and backend contracts. Operators can see contradictory "ready/blocked" cues, which causes false starts and noisy triage.

### Goal
Make entry and readiness behavior deterministic and real-data backed for Phase 1 Loop A.

### Slice
This slice owns P0 entry + readiness gate closure: matter creation/upload prerequisites, readiness reasoning, and quick-start enablement and denial behavior.

### Primary Observable Effect
Given the same pack state, `/matters` and `/matters/[id]` surfaces show the same readiness outcome as run-start APIs, with explicit reasons for blocked states.

## In Scope

- P0 entry + readiness gate consistency for create/upload/ingest readiness messaging.
- Quick Start enablement based on real folder/document readiness state (not seeded assumptions).
- Readiness coverage for `pack_01_clean` and `pack_02_missing_rea`.
- UX copy for blocked, runnable, and already-complete states.

## Goals

- Remove contradictory readiness states between UI and API.
- Enforce one canonical readiness reason model.
- Keep feedback fast with pack-based smoke checks.

## User Stories

### US-001: Canonical readiness contract across list/detail/API
As an operator, I want list and detail readiness signals to match API truth so I can trust whether a matter is runnable.

#### Acceptance Criteria
- Given `pack_01_clean`, readiness resolves to runnable in both list and detail surfaces and the same state is returned by readiness-dependent APIs.
- Given `pack_02_missing_rea`, readiness resolves to blocked with explicit reason text in list/detail/API payloads.
- Example: detail page shows "Blocked: required document missing" and run start denial includes the same reason code family.
- Negative: UI must never show "Ready" while run-start API denies due to missing prerequisites.

#### Verification
- Pack/fixture/script: load `pack_01_clean` and `pack_02_missing_rea` through operator flow, then compare `/matters`, `/matters/[id]`, and run-start response behavior.
- Automated checks: targeted readiness contract tests around folder/document readiness transformations.
- Manual checks: spot-check state parity across list and detail for both packs.

### US-002: Quick Start readiness gate is deterministic
As an operator, I want Quick Start to only run when prerequisites are satisfied so blocked matters fail loudly and predictably.

#### Acceptance Criteria
- Quick Start is enabled only when canonical readiness state is runnable.
- When readiness is blocked, Quick Start shows actionable reason copy and does not enqueue a run.
- Example: moving from missing to present prerequisite transitions blocked to runnable and enables Quick Start without page refresh hacks.
- Negative: blocked start attempts cannot silently enqueue a run or return ambiguous success UI.

#### Verification
- Pack/fixture/script: transition-ready scenario using `pack_02_missing_rea` after prerequisite remediation.
- Automated checks: start-run guard tests asserting conflict/error envelope for blocked states.
- Manual checks: verify button state, error banner, and run list behavior.

### US-003: Entry/setup error UX is explicit and non-silent
As an operator, I want setup failures surfaced clearly so I can recover without guessing.

#### Acceptance Criteria
- Upload, init, and complete failures render deterministic user-facing error states with retry guidance.
- Readiness recomputation failures surface explicit error code and safe recovery copy.
- Example: upload completion failure shows retry CTA and does not mark readiness complete.
- Negative: failures must not be swallowed into indefinite loading states.

#### Verification
- Pack/fixture/script: inject upload and readiness failure cases in dev fixtures.
- Automated checks: route handler tests for error mapping and UI state tests for banners and disabled actions.
- Manual checks: verify recovery path from failed upload to successful retry.

## Functional Requirements

- FR-001: Use one canonical readiness reason model across list/detail/Quick Start API surfaces.
- FR-002: Quick Start enablement logic must derive from canonical readiness contract only.
- FR-003: Blocked, runnable, and already-complete states must include user-visible reason copy.
- FR-004: Error envelopes for setup/readiness failures must map to deterministic UI banners.
- FR-005: Maintain compatibility with existing dev-first mode posture and no new prod-path enablement.

## Non-Goals (Out of Scope)

- Implementing run lifecycle normalization (Loop B scope).
- Implementing citation/export contract changes (Loop C scope).
- Broad demo-prod parity beyond explicit Phase 0 allowlist quick wins.

## Failure States + UX

- Missing prerequisite documents: blocked state with explicit reason and next step.
- Upload/init/complete failure: deterministic error banner and retry affordance.
- Readiness recomputation failure: safe fallback state (`temporarily unavailable`) plus recovery action.

## Metrics / Logging

- `readiness_state_mismatch_detected` count between UI/API (target: `0` in smoke packs).
- `quick_start_blocked_attempt_total` with reason-code breakdown.
- `setup_upload_failure_total` and retry success rate.

## Rollback / Disable Path

- Feature gate: keep canonical-readiness mapping behind an additive toggle until validated in smoke.
- Safe fallback: preserve existing blocked-default behavior rather than optimistic ready states if toggle is disabled.

## Risks + Dependencies

- Risks:
  - Hidden seeded/fallback branches can still leak contradictory readiness states.
  - Error copy drift between route handlers and UI components can reintroduce ambiguity.
- Dependencies:
  - Uses existing create/upload/readiness APIs in `apps/web/app/(api)/folders/*`.
  - Provides readiness contract inputs required by Loop B run-start normalization.

## Success Metrics

- `pack_01_clean` and `pack_02_missing_rea` produce consistent readiness outcomes across list/detail/API.
- Quick Start never starts when readiness is blocked.
- Setup failures are explicitly surfaced with recovery guidance.

## Open Questions

- None. Closed on 2026-02-13 via `ask-questions-if-underspecified` defaults.

## Resolved Decisions

- Readiness reason codes are centralized in a shared enum module in Loop A before Loop B starts.
- Dedicated telemetry dashboard work is deferred in this phase; use log counters plus PR/nightly smoke outcomes.

## Quality Gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Sources

- `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
