# PRD: Runtime Review Hardening (WDK Runtime, Retrieval, and API Exposure)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: runtime-review-hardening

## Introduction / Overview

### Problem
Recent runtime review findings show multiple correctness and reliability gaps across WDK scheduling/draining, retrieval fallback behavior, pgvector readiness checks, citations API exposure gating, and ingest failure UX messaging. Today, these gaps can cause stuck or partial Quick Start behavior, cross-run step claims in development flows, avoidable semantic embed work, false pgvector disablement under concurrent setup, and unclear user-facing ingest failures.

### Goal
Ship a single hardening slice that closes the identified runtime failure modes while preserving production safety defaults.

### Slice
One refactor slice that makes runtime behavior deterministic and observable across six bounded workstreams: atomic Quick Start scheduling, run-scoped inline draining with dev/demo self-progress, citations route re-locking, retrieval no-vector short-circuiting, pgvector setup idempotency, and ingest error UX mapping.

### Primary Observable Effect
Before: Quick Start can stall or partially schedule, dev inline drains can touch unrelated runs, citations behavior can become publicly reachable with a flag, retrieval may run unnecessary semantic work, pgvector can appear disabled due to setup races, and ingest failures surface raw JSON.

After: Quick Start converges reliably, inline drains respect run boundaries, citations remains dev/demo-only, retrieval skips semantic work when vectors are absent, pgvector setup is race-safe, and users see clear ingest failure messages.

### In Scope
- Atomic question-step scheduling and reconciliation for Quick Start.
- Run-scoped inline draining and dev/demo Quick Start self-progress behavior.
- Citations API gate hardening (`dev`/`demo-prod` only).
- Retrieval semantic short-circuit for `nVectors === 0`.
- Pgvector extension setup idempotency and race safety.
- Friendly ingest failure message mapping in matter UI.
- Targeted regression tests plus full verification.

## Goals

- Eliminate partial Quick Start step scheduling outcomes for a run.
- Prevent cross-run inline drainer claims in development ingest paths.
- Keep citations route hidden outside `dev` and `demo-prod`.
- Avoid unnecessary semantic embedding work when no vectors exist.
- Remove false pgvector disabled outcomes caused by concurrent setup.
- Make ingest failure reasons understandable to non-technical users.

## User Stories

### US-001: Atomic Quick Start scheduling and convergence
As an engineer, I want Quick Start question steps to be scheduled atomically with reconciliation so that runs do not get stuck with partial step sets.

#### Acceptance Criteria
- AC-001: Example: if one step insert fails during scheduling, the transaction rolls back and no partial question-step set is committed.
- AC-002: Example: for a run with `questions_total = N`, reconciliation backfills missing steps and converges to exactly `N` question steps.
- AC-003: Negative: duplicate scheduling attempts must not create duplicate step rows for the same `(run_id, step_key)`.

#### Verification
- Pack/fixture/script: deterministic run setup in integration tests with seeded runs and controlled insert failure.
- Automated checks: `pnpm -C apps/web vitest run test/wdkStepQueue.int.test.ts`.
- Manual checks: start a Quick Start run and confirm stable progress without missing-step drift.

### US-002: Run-scoped inline draining and dev/demo Quick Start self-progress
As a developer running demo flows, I want inline draining scoped by run id and auto-kicked Quick Start processing so that development runs progress without cross-run interference.

#### Acceptance Criteria
- AC-004: Example: ingest inline drain invoked with ingest `runId` only claims/handles steps for that run.
- AC-005: Example: in `dev`/`demo-prod`, creating a Quick Start run begins consuming steps without requiring a separate worker process.
- AC-006: Negative: in `prod` posture, inline kick path remains disabled.
- AC-007: Negative: Quick Start steps are not failed as `STEP_TYPE_UNKNOWN` due to ingest handler mismatch.

#### Verification
- Pack/fixture/script: two-run scenario (ingest + quick-start) and route-triggered Quick Start run progression.
- Automated checks:
  - `pnpm -C apps/web vitest run test/ingestCutoverFlag.test.ts`
  - `pnpm -C apps/web vitest run test/foldersRunsRoute.wdk.int.test.ts`
  - `pnpm -C apps/web vitest run test/wdkStepQueue.int.test.ts`
- Manual checks: create ingest and Quick Start runs in local demo mode and verify isolation + progress.

### US-003: Citations API remains internal/dev-only
As a security-conscious operator, I want citations API exposure locked to `dev`/`demo-prod` regardless of feature toggles so that production posture remains closed by default.

#### Acceptance Criteria
- AC-008: Example: in `prod` posture, citations route returns a not-found style error envelope even when `FEATURE_CITATIONS_API=1`.
- AC-009: Example: in `dev`/`demo-prod`, DB-first citations behavior still works with fixture fallback behavior.
- AC-010: Negative: feature flag must not bypass environment gate checks.

#### Verification
- Pack/fixture/script: mode-matrix route test across `dev`, `demo-prod`, and `prod`.
- Automated checks: `pnpm -C apps/web vitest run lib/citations.routes.test.ts`.
- Manual checks: call citations endpoint in each mode and validate expected status/code.

### US-004: Retrieval semantic branch short-circuits when vectors are absent
As an engineer, I want retrieval to skip semantic work when `nVectors` is zero so that empty-vector environments avoid unnecessary embedding cost and noise.

#### Acceptance Criteria
- AC-011: Example: with lexical chunks present and zero vectors, retrieval returns lexical results with `semanticDisabledReason = "NO_VECTORS"`.
- AC-012: Example: lexical fallback uses effective weights `lex=1` and `sem=0` when semantic is disabled.
- AC-013: Negative: embedding call path must not execute when `nVectors === 0`.

#### Verification
- Pack/fixture/script: retrieval fixture with lexical rows and no embeddings.
- Automated checks:
  - `pnpm -C apps/web vitest run test/hybridSearchGoldenQuestions.smoke.int.test.ts`
  - plus a focused retrieval no-vector regression test file.
- Manual checks: run debug retrieval endpoint/path and inspect disabled reason output.

### US-005: Pgvector setup is idempotent and race-safe
As an engineer, I want pgvector setup to tolerate concurrent initialization so that schema readiness does not report false disabled states.

#### Acceptance Criteria
- AC-014: Example: concurrent schema setup calls do not produce false `PGVECTOR_DISABLED` outcomes when extension creation succeeds in one caller.
- AC-015: Example: extension setup uses `CREATE EXTENSION IF NOT EXISTS vector`.
- AC-016: Negative: environments without extension support still fail safe and retain explicit disablement behavior.

#### Verification
- Pack/fixture/script: concurrent schema-initialization scenario in schema/retrieval tests.
- Automated checks: retrieval schema and related integration tests under `apps/web`.
- Manual checks: inspect logs for real disablement vs race-condition noise.

### US-006: Ingest failures surface clear user-facing messaging
As a non-technical user, I want readable ingest failure explanations so that I can act without parsing raw JSON errors.

#### Acceptance Criteria
- AC-017: Example: known ingest error codes map to clear messages (`INGEST_TOO_MANY_PAGES`, `INGEST_PAGE_TEXT_TOO_LARGE`, `INGEST_TOTAL_TEXT_TOO_LARGE`).
- AC-018: Example: UI shows friendly primary message and preserves technical detail as secondary/debug detail.
- AC-019: Negative: unknown error codes must fall back safely without blank or crashing UI.

#### Verification
- Pack/fixture/script: error-json mapping fixtures and matter page rendering fixture.
- Automated checks: new mapper unit test and updated matter page render tests.
- Manual checks: load matter with failing docs and confirm message clarity plus debug detail access.

## Functional Requirements

Numbered, specific system behaviors. Keep each requirement atomic.

- FR-001: Quick Start scheduling must insert all question steps in one transaction or none.
- FR-002: Quick Start reconciliation must backfill missing question steps for a run to match `questions_total`.
- FR-003: Inline drainer entrypoint must accept optional `runId`.
- FR-004: Step-claim query must scope to `runId` when provided.
- FR-005: Ingest inline kick must pass ingest `runId` to inline drainer.
- FR-006: Quick Start route must auto-kick inline processing only in `dev`/`demo-prod`.
- FR-007: Production posture must keep inline kick disabled.
- FR-008: Citations route must always enforce `assertDevOrDemoProdApi` before feature-flag behavior branches.
- FR-009: Retrieval must short-circuit semantic branch when vector count is zero.
- FR-010: Retrieval debug output must include `semanticDisabledReason = "NO_VECTORS"` when applicable.
- FR-011: Lexical-only fallback weighting must be explicit when semantic branch is disabled.
- FR-012: Retrieval schema setup must use `CREATE EXTENSION IF NOT EXISTS vector`.
- FR-013: Retrieval schema catch path must re-check extension existence before returning disabled.
- FR-014: Ingest error mapper must cover known ingest error codes and default fallback.
- FR-015: Matter page must render friendly ingest error message as primary output.
- FR-016: Matter page must preserve technical details for operators in secondary UI.
- FR-017: Each workstream must include at least one targeted regression test.
- FR-018: Full repository verification (`pnpm verify`) must pass before completion.

## Non-Goals (Out of Scope)

- Re-architecture of `run_steps` or worker framework.
- Changing question-set content, run product semantics, or agent output behavior.
- Introducing new retrieval ranking algorithms or embedding model changes.
- Changing ingest thresholds or broad document processing policy.
- Broad UI redesign beyond ingest error message rendering.

## Design Considerations (Optional)

- UI/UX notes:
  - Keep ingest failure copy plain-language and action-oriented.
  - Preserve raw/technical error context in a secondary element for operators.
  - Do not alter existing run progress UI semantics beyond enabling reliable progression.

## Technical Considerations (Optional)

- Dependencies:
  - Existing WDK queue/runtime modules.
  - Retrieval schema and hybrid search path.
  - Citations route and dev-only gate helper.
- Data model / API contracts:
  - No new tables required.
  - Existing run/step/citation/document shapes preserved.
  - New semantic disabled reason value (`NO_VECTORS`) is additive.
- Constraints:
  - Preserve production closed-by-default posture.
  - Preserve idempotency behavior for step scheduling.
  - Keep changes reversible without schema migrations.

## Failure States & UX

No silent failures. For each failure mode, specify user-facing UX.

- Mid-scheduling insert failure: transaction rollback + retry path -> no partial run-step state visible to user.
- Cross-run claim risk in dev drain: run-scoped claim query -> no unrelated run failures.
- Citations call outside allowed modes: gate returns not-found envelope -> no endpoint leakage.
- No vectors for semantic branch: lexical fallback with debug reason `NO_VECTORS` -> no user-visible hard error.
- Pgvector unsupported environment: safe disablement path -> retrieval continues lexically where possible.
- Ingest limit failures: mapped friendly copy -> user can take corrective action without raw JSON parsing.

## Metrics / Logging

At least one measurable signal.

- Success signals:
  - Zero recurring partial Quick Start schedule incidents after deploy.
  - Zero `STEP_TYPE_UNKNOWN` events for `quick_start_title_survey.write_row_v0` in ingest-drain scenarios.
  - Presence of `semanticDisabledReason=NO_VECTORS` in empty-vector contexts with reduced embed-failure noise.
- Debug signals:
  - Structured log when reconciliation backfills steps (`wdk.quick_start.reconciled`).
  - Inline drainer logs include scoped `run_id` and `handler_count`.
  - Pgvector readiness logs only for real disablement cases.

## Rollback / Disable Plan

- Feature flag / gating:
  - Preserve current environment gate behavior (`dev`/`demo-prod` vs `prod`).
- Safe fallback behavior:
  - Revert per-workstream changes independently (transaction wrapper, run-scoping, route gate placement, semantic short-circuit, pgvector DDL, ingest mapper/UI).
  - No schema migration rollback required.

## Risks & Dependencies

- Risks:
  - Scheduling transaction may increase step creation latency for large question sets.
  - Run scoping may miss edge paths where `runId` is not passed.
  - Additive disabled reason could break strict downstream parsing.
  - Ingest message mapping could drift from backend error codes.
- Dependencies:
  - Existing tests must support deterministic failure simulation.
  - Runtime mode configuration (`ORBITAL_MODE`) must be correct in environments.
  - Dev/demo workflows rely on inline worker behavior constraints.

## Success Metrics

- Quick Start runs converge to expected step counts and complete without partial scheduling regressions.
- No cross-run inline drainer claim regressions in ingest/Quick Start mixed scenarios.
- Citations route remains inaccessible in `prod` posture even with feature flag enabled.
- Retrieval avoids semantic branch execution when vectors are absent and still returns lexical matches.
- User-facing ingest failure text is understood without reading raw error JSON.

## Open Questions

- Q1: None blocking; confirm final wording for friendly ingest error copy with product/design owner.
- Q2: Confirm whether to add a dedicated retrieval unit test for no-vector embed-call avoidance or rely on existing integration coverage plus targeted mock assertions.

## Sources

List the shaping inputs used to produce this PRD (paths + short notes if helpful).

- brief.md: not present in dossier (n/a)
- breadboard-pack.md: not present in dossier (n/a)
- spike-investigation.md: not present in dossier (n/a)
- risk-register.md: not present in dossier (n/a)
- docs/05-reviews-audits/implementation-plan-runtime-review-2026-02-11.md: full five-decision scope baseline.
- docs/05-reviews-audits/implementation-plan-runtime-review-2026-02-11-codex.md: deeper failure-mode and regression strategy.
- docs/05-reviews-audits/implementation-plan-runtime-review-2026-02-11-synthesized.md: merged execution sequence and verification matrix.

## Appendix: Shaping Notes (Optional)

Capture any shaping details that did not fit cleanly above so no information is lost.

### brief.md

Not present.

### breadboard-pack.md

Not present.

### spike-investigation.md

Not present.

### risk-register.md

Not present.
