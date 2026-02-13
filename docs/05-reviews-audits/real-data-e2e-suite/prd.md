# PRD: Real-Data E2E Overnight Consolidated Loop (A -> B -> C)

Owner: marc
Status: Draft
Date: 2026-02-13
Slug: real-data-e2e-overnight-abc

## Enhancement Summary

- Deepened on: 2026-02-13
- Sections enhanced: execution mode, user stories, functional requirements, verification, deployment checks
- Key additions:
  1. Added explicit overnight recovery/checkpoint flow (`US-010`) so failures halt safely and can resume deterministically.
  2. Added run-start idempotency and concurrency guardrails (`US-011`) to prevent duplicate runs and race-driven drift.
  3. Added cross-surface parity drift detection and telemetry taxonomy (`US-012`) to fail fast on A->B->C contract divergence.

## Introduction / Overview

### Problem
Real-data E2E closure for P0 is split across three dependent loops (A readiness, B run/report, C trust/export). Running them independently increases sequencing drift risk during unattended overnight execution.

### Goal
Provide one consolidated PRD that executes the full A -> B -> C scope in strict dependency order with explicit resilience and observability guardrails.

### Slice
This is an intentionally large consolidation slice that bundles Loop A, Loop B, and Loop C into a single sequential execution chain suitable for long unattended runs.

### Primary Observable Effect
After execution, readiness, run/report, and trust/export behavior is contract-consistent on real-data packs, with fail-closed outcomes, checkpointed recovery semantics, and no unresolved planning questions.

## Execution Mode (Overnight)

- Existing codebase: `apps/web` (Next.js + TypeScript + Postgres).
- Single consolidated loop: one PRD, sequential story dependencies.
- Story order is mandatory: `US-001` through `US-012`.
- Existing slice PRDs under `prds/` remain as references and are not deleted.
- Failure policy: stop on first contract-breaking story, persist checkpoint, require explicit resume decision.

## In Scope

- Loop A: readiness consistency and Quick Start gating on canonical readiness contract.
- Loop B: deterministic run lifecycle and report rows from real step outputs.
- Loop C: typed citation outcomes, strict fail-closed export gating, and `pack_09_bad_citation` operator coverage.
- Recovery + resumability for unattended overnight loop.
- Concurrency/idempotency controls for run start and operator-triggered actions.
- Cross-surface parity/drift detection with PR and nightly smoke coverage.

## Goals

- Eliminate contradictory readiness/run/report/trust states across UI and API surfaces.
- Preserve strict fail-closed trust/export behavior while improving operator reliability.
- Keep overnight execution deterministic, resumable, and observable.

## Resolved Decisions

- Existing codebase implementation path (not greenfield).
- Consolidation output is root `prd.md` + `prd.json`; `prds/a|b|c` retained as references.
- Overnight execution uses one sequential loop.
- Readiness reason codes are centralized before Loop B.
- Polling cadence standardized: every 2s while `queued`/`running`, stop at terminal.
- No temporary compatibility shim for placeholder-row consumers.
- `pack_09_bad_citation` smoke runs in both PR and nightly tiers.
- No dedicated telemetry dashboard or separate copy-spec project in this phase.

## User Stories

### US-001: Canonical readiness contract across list/detail/API
As an operator, I want readiness states to match across list, detail, and run-start APIs so I can trust whether a matter is runnable.

#### Acceptance Criteria
- Given `pack_01_clean`, readiness is runnable across list/detail/API.
- Given `pack_02_missing_rea`, readiness is blocked with explicit reason across list/detail/API.
- Example: detail shows blocked reason text and run-start denial returns matching reason-code family.
- Negative: UI must never show ready while run-start API denies missing prerequisites.

#### Verification
- Pack/fixture/script: `pack_01_clean`, `pack_02_missing_rea` parity checks across `/matters`, `/matters/[id]`, and run-start routes.
- Automated checks: readiness contract tests.
- Manual checks: list/detail/API parity spot checks.

### US-002: Quick Start readiness gate is deterministic
As an operator, I want Quick Start to start only when readiness is runnable so blocked contexts fail loudly.

#### Acceptance Criteria
- Quick Start enablement is derived only from canonical readiness state.
- Blocked readiness shows actionable reason and does not enqueue a run.
- Example: remediating missing prerequisites transitions blocked -> runnable and enables Quick Start.
- Negative: blocked start attempts cannot silently enqueue runs.

#### Verification
- Pack/fixture/script: blocked-to-ready transition with `pack_02_missing_rea` remediation scenario.
- Automated checks: run-start guard and conflict/error envelope tests.
- Manual checks: button states, banners, run creation behavior.

### US-003: Setup/readiness failure UX is explicit
As an operator, I want setup failures surfaced clearly so recovery is obvious.

#### Acceptance Criteria
- Upload/init/complete and readiness recomputation failures render deterministic user-facing errors.
- Recovery actions (retry/next step) are visible.
- Example: upload completion failure shows retry and does not mark readiness complete.
- Negative: failures must not remain hidden behind indefinite loading states.

#### Verification
- Pack/fixture/script: fixture-injected setup failure paths.
- Automated checks: route error mapping + UI error-state tests.
- Manual checks: failed upload to successful retry path.

### US-004: Run lifecycle state machine is deterministic
As an operator, I want run transitions to be stable so downstream triage/export behavior is trustworthy.

#### Acceptance Criteria
- Runs follow allowed transitions only with explicit terminal states.
- Terminal states are immutable once reached.
- Example: successful run `queued -> running -> completed` with timestamped transition points.
- Negative: terminal runs never regress to non-terminal states.

#### Verification
- Pack/fixture/script: `pack_01_clean`, `pack_04_multi_parcel` run-state timelines.
- Automated checks: transition-graph tests.
- Manual checks: run progress and terminal status in matter detail.

### US-005: Report rows are sourced from real step outcomes
As a reviewer, I want report rows to reflect actual run outputs so triage is based on real execution.

#### Acceptance Criteria
- Report rows for a run are generated from persisted step outputs.
- Row statuses/schema versions are stable across reloads for the same run.
- Example: `pack_05_partial_release` yields stable mixed statuses on reload.
- Negative: seeded fallback placeholder rows are not emitted for successful real-data runs.

#### Verification
- Pack/fixture/script: `pack_01_clean`, `pack_04_multi_parcel`, `pack_05_partial_release` run-to-report mapping checks.
- Automated checks: integration tests for run/report invariants.
- Manual checks: report reload stability per run id.

### US-006: Run/report failure envelopes are explicit and safe
As an operator, I want typed failure envelopes so recovery actions are clear and safe.

#### Acceptance Criteria
- Run failures expose deterministic, typed error envelopes.
- Report retrieval for failed/incomplete runs shows recoverable error states.
- Example: failed run shows typed banner while prior completed run history remains intact.
- Negative: failed active runs must not show stale success rows.

#### Verification
- Pack/fixture/script: controlled run-failure scenario.
- Automated checks: run/report failure envelope tests.
- Manual checks: rerun/triage recovery messaging.

### US-007: Citation outcomes are explicit (success or typed failure)
As a reviewer, I want citation evidence requests to return auditable outcomes so trust checks are deterministic.

#### Acceptance Criteria
- Citation/render/pdf paths return either valid payloads or typed failures.
- Invalid citations are explicit and do not render stale evidence overlays.
- Example: valid citation opens expected doc/page with trust metadata.
- Negative: invalid citation never appears as ambiguous success.

#### Verification
- Pack/fixture/script: `pack_01_clean` and `pack_09_bad_citation` citation checks.
- Automated checks: typed-outcome route tests for citation/render/pdf endpoints.
- Manual checks: source chip to viewer success/failure behavior.

### US-008: Export fail-closed behavior is strict and observable
As an operator, I want blocked exports enforced deterministically so unsafe outputs cannot leak.

#### Acceptance Criteria
- Export route enforces `EXPORT_BLOCKED` when trust/run/report safety preconditions fail.
- Blocked export state provides recovery path to failed-row evidence review.
- Example: `pack_09_bad_citation` run blocks export with explicit reason and no download.
- Negative: blocked/incomplete runs never produce signed download links.

#### Verification
- Pack/fixture/script: `pack_09_bad_citation` load -> run -> export attempt.
- Automated checks: export route `EXPORT_BLOCKED` assertions.
- Manual checks: blocked export UX and report-triage recovery path.

### US-009: Demo-prod allowlist includes `pack_09_bad_citation` with PR/nightly smoke
As a demo operator, I want `pack_09_bad_citation` available in toolbar flow so fail-closed demos are operator-reachable.

#### Acceptance Criteria
- Load-pack API and toolbar options include `pack_09_bad_citation`.
- PR smoke and nightly smoke both include `pack_09_bad_citation` operator path checks.
- Example: operator selects pack 09, runs flow, observes blocked export contract.
- Negative: non-allowlisted arbitrary pack ids remain validation-rejected.

#### Verification
- Pack/fixture/script: demo-prod operator smoke (load pack -> run -> blocked export).
- Automated checks: allowlist schema tests + regression checks for packs 01/02.
- Manual checks: toolbar, run launch, blocked export walk-through.

### US-010: Overnight loop recovery and checkpoint resume
As an on-call operator, I want the overnight loop to stop safely and resume from a known checkpoint so failures do not corrupt downstream contracts.

#### Acceptance Criteria
- Loop persists stage checkpoint after each story completion (`US-*` marker + run context).
- On contract-breaking failure, loop halts before downstream stories and writes a structured failure checkpoint.
- Example: failure in Loop B stories halts before Loop C export logic and records resume pointer.
- Negative: loop never auto-continues into downstream stories after a failed upstream contract.

#### Verification
- Pack/fixture/script: inject failure at `US-005` and verify halt/resume semantics.
- Automated checks: checkpoint writer/reader tests and failure-stop integration test.
- Manual checks: simulate resume from checkpoint and verify no re-run of completed stories.

### US-011: Run-start idempotency and concurrency guardrails
As an operator, I want duplicate start actions to be safely de-duped so concurrent clicks or retries do not create conflicting runs.

#### Acceptance Criteria
- Run-start endpoint enforces idempotency key or equivalent lock semantics per matter/context.
- Concurrent requests for same runnable context produce one canonical run and clear duplicate response behavior.
- Example: double-triggered Quick Start yields one run id and one informative duplicate response.
- Negative: concurrent starts never create multiple active runs for the same story context.

#### Verification
- Pack/fixture/script: parallel run-start requests on same matter.
- Automated checks: idempotency lock tests and race-condition integration tests.
- Manual checks: UI double-click scenario and retry scenario.

### US-012: Cross-surface parity drift detection and telemetry taxonomy
As an engineering lead, I want automated parity checks and canonical telemetry tags so A->B->C drift is detected early.

#### Acceptance Criteria
- Parity checks compare list/detail/run/report/export contract outputs for same run context.
- Telemetry tags use canonical fields (`stage`, `story_id`, `pack_id`, `run_id`) across all loop surfaces.
- Example: mismatch in readiness parity triggers failed verification and points to exact stage/story.
- Negative: smoke runs never pass when contract mismatches exceed threshold (`readiness_state_mismatch_detected > 0`).

#### Verification
- Pack/fixture/script: parity-check suite over `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`.
- Automated checks: telemetry schema tests + parity assertion tests.
- Manual checks: inspect emitted logs and verify stage/story tags are present and consistent.

## Functional Requirements

- FR-001: Canonical readiness reason model shared across list/detail/run-start surfaces.
- FR-002: Quick Start gating derives solely from canonical readiness contract.
- FR-003: Setup/readiness failures map to deterministic user-facing errors.
- FR-004: Run-state transition model is canonical and enforced.
- FR-005: Run polling cadence is standardized to 2s for `queued`/`running`, stop at terminal.
- FR-006: Report rows are generated from persisted run step outputs (run-scoped).
- FR-007: Seeded fallback rows are removed from successful real-data critical paths.
- FR-008: Run/report failure envelopes are typed and safe for UI.
- FR-009: Citation/render/pdf routes use explicit success-or-typed-failure outcome contracts.
- FR-010: Export fail-closed gating remains strict with `EXPORT_BLOCKED` behavior.
- FR-011: `pack_09_bad_citation` is allowlisted in both API schema and toolbar options.
- FR-012: PR + nightly smoke tiers include pack 09 operator path coverage.
- FR-013: Run/report row consistency invariants are enforced via schema constraints and monitoring.
- FR-014: Report row generation is idempotent with deterministic step-output identity and conflict handling.
- FR-015: Cross-surface correctness checks keep list/detail/run/report/export aligned to one source of truth.
- FR-016: Overnight execution persists resumable checkpoints and fails closed on upstream contract violations.
- FR-017: Run-start path enforces idempotent concurrency control for duplicate requests.
- FR-018: Telemetry taxonomy and parity assertions are mandatory in PR/nightly verification.

## Non-Goals (Out of Scope)

- Loop D scope (`P1/P2` review/chat/resilience broad stabilization).
- Production rollout for these workflows in this cycle.
- Broad allowlist expansion across all packs.
- Dedicated telemetry dashboard buildout or separate copy-spec project.

## Implementation Best Practices

### Next.js route handlers
- Keep handlers in `app/**/route.ts` and enforce method-specific behavior with explicit exports.
- Validate all params/body at boundary; treat route params as untrusted input.
- Keep orchestration logic in shared server modules, not inside handler glue code.

### Zod validation
- Reuse shared schemas for readiness reasons, run states, citation outcomes, and export envelopes.
- Use `.safeParse` for user-facing validation responses and typed issues.
- Use strict schema mode where unknown keys should be rejected.

### Deterministic test strategy
- Favor deterministic integration tests for contract paths and reserve broad E2E for smoke tiers.
- Isolate fixtures and avoid nondeterministic clocks/randomness in assertions.
- Keep PR suites fast and reliable; run heavier parity matrices nightly.

## Performance Considerations

- Polling: keep 2s cadence with bounded retries and timeout backoff; stop on terminal.
- Query shape: avoid run/report N+1 patterns, prefer run-scoped bulk fetches.
- Rendering: cache idempotent citation/render outcomes by pack/run where safe.
- Overnight stability: persist checkpoints and cap parallel expensive operations.

## Failure States + UX

- Readiness blocked: explicit reason and next action.
- Setup/upload/recompute failures: deterministic banners with retry.
- Run/report failures: typed error envelopes with recoverable UX.
- Invalid citations: explicit `citation_failed` behavior, no stale highlights.
- Blocked exports: explicit blocked reason and triage handoff path.
- Invalid pack id: validation error with no side effects.
- Concurrent run-start: explicit duplicate/in-progress feedback.

## Metrics / Logging

- `readiness_state_mismatch_detected` (target `0` on smoke packs).
- `quick_start_blocked_attempt_total` by reason code.
- `run_state_transition_invalid_total` (target `0`).
- `report_rows_seeded_fallback_total` (target `0` on successful real-data runs).
- `report_state_mismatch_total`.
- `citation_lookup_failed_total` by typed failure code.
- `export_blocked_total` by run and failure category.
- `demo_pack_load_validation_error_total`.
- `overnight_checkpoint_write_fail_total`.
- `overnight_resume_attempt_total` and `overnight_resume_success_total`.

## Rollback / Disable Path

- Keep additive feature gates for readiness canonicalization, run/report mapping, and checkpoint resume behavior.
- If regressions appear, revert to safe blocked-default/fail-closed behavior.
- Allowlist rollback path: remove `pack_09_bad_citation` from API/UI enums.
- Disable checkpoint resume feature independently if resume semantics prove unstable.

## Risks + Dependencies

- Risks:
  - Hidden fallback branches may still surface inconsistent states.
  - Consumer assumptions about old placeholder semantics may cause transient mismatches.
  - Cross-surface copy/contract drift can reduce operator confidence.
  - Concurrency edges may bypass intended single-run behavior without strict locks.
- Dependencies:
  - Existing `apps/web` folder/document/run/report/citation/export APIs.
  - Sequential dependency chain: readiness -> run/report -> trust/export.
  - Reliable fixture packs and smoke tooling for parity checks.

## Verification Plan

1. Local/CI gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`.
2. Story-level checks in strict order (`US-001` ... `US-012`).
3. PR smoke packs: `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`.
4. Nightly smoke includes pack 09 operator path, blocked export, and parity drift assertions.
5. Failure injection verifies `US-010` halt/checkpoint/resume behavior.
6. Concurrency test verifies `US-011` idempotency lock semantics.

Suggested Ralph run command:
- `ralph build 1 --agent=codex --prd docs/05-reviews-audits/real-data-e2e-suite/prd.json --no-commit`

## Deployment Verification

### Pre-run checks
- Verify allowlist includes `pack_09_bad_citation` in API and toolbar contracts.
- Verify readiness parity checks return no mismatches on packs 01/02.
- Verify report invariant checks expect zero seeded fallback rows on successful runs.

### Post-run checks
- Confirm no invalid run-state transitions occurred.
- Confirm blocked export behavior for pack 09 and no unsafe download links issued.
- Confirm checkpoint records and telemetry tags exist for each story stage.

### Rollback readiness
- Confirm rollback toggles are available for allowlist, checkpoint resume, and run/report contract mapping.

## Success Metrics

- A->B->C contract chain is stable under real-data packs with deterministic states.
- No unresolved planning questions remain for this consolidated overnight loop.
- `pack_09_bad_citation` trust/export fail-closed behavior is operator-reachable and covered in PR/nightly smoke.
- Overnight runs can halt and resume without re-running completed stages.

## Open Questions

- None.

## Quality Gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Sources

- `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
- `docs/05-reviews-audits/real-data-e2e-suite/prds/a_entry-readiness-foundation/prd.md`
- `docs/05-reviews-audits/real-data-e2e-suite/prds/b_run-lifecycle-report-contract/prd.md`
- `docs/05-reviews-audits/real-data-e2e-suite/prds/c_trust-citation-export-contract/prd.md`
