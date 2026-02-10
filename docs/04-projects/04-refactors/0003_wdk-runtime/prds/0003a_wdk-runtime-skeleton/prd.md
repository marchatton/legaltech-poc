# PRD: WDK Runtime Skeleton + Worker + Smoke Workflow (0003a)

Owner: marc  
Status: Draft  
Date: 2026-02-10  
Slug: wdk-runtime-skeleton

## Introduction / Overview

### Problem
We have a durable jobs worker (`apps/web/lib/jobs/*`), but we do not have the WDK runtime described in target docs:
- workflow controller vs steps separation
- `"use workflow"` / `"use step"` conventions as first-class code structure
- a Postgres-backed “world” for step retries/progress

Without WDK being real, Workstream C (Quick Start cutover to WDK) and later retrieval/chat work will either stall or reintroduce “temporary” glue that becomes permanent.

### Goal
Ship a minimal in-repo WDK runtime + worker that can execute a tiny workflow durably and observably, without cutting over production routes yet.

### Primary Observable Effect
- `pnpm --filter @orbital-poc/web worker` can execute a `wdk_smoke` workflow (2-3 steps) durably across restarts.
- The workflow and steps follow directive conventions:
  - workflow starts with `"use workflow"`
  - steps start with `"use step"`

## Goals
- WDK core runtime API exists and is used by at least one real workflow.
- Safe step claiming for multiple workers using `FOR UPDATE SKIP LOCKED`.
- Bounded retry/backoff and stale lock requeue behavior exists and is testable.
- Step inputs/outputs are JSON-serialisable and Zod-validated at boundaries.

## Non-goals (explicit cuts)
- No cutover of ingest or runs in this slice.
- No UI work beyond a minimal dev-only trigger endpoint if needed.
- No retrieval/draft/lock/verify pipeline work.

## Users
- Developer: wants a real WDK worker loop to build on.
- Operator (demo): wants “the worker” to be a stable concept, not an ad-hoc job runner.

## User Stories

### US-001: A WDK worker can claim and execute step work durably
As a developer, I want a WDK worker loop that claims executable steps safely so that work continues across restarts and can scale to multiple workers.

#### Acceptance Criteria
- AC-001: Worker claims the next runnable step using `FOR UPDATE SKIP LOCKED` semantics (no double-claims).
  - Example: with two workers running, a step is executed by only one worker.
  - Negative: two workers do not execute the same `(run_id, step_key)` step concurrently.
- AC-002: Step attempt counters are 1-based and increment on each claim.
  - Example: a failing step shows attempt 1 then attempt 2 after retry.
  - Negative: attempt does not reset to 1 on retry for the same step row.
- AC-003: Stale locks are reclaimed after a fixed cutoff.
  - Example: kill a worker mid-step; after cutoff, another worker can reclaim it.
  - Negative: a permanently “running” step cannot block the queue indefinitely.

#### Verification
- Automated: unit tests for claim semantics in the step queue.
- Manual smoke: run two workers, start smoke workflow, confirm no double execution.

### US-002: A minimal `wdk_smoke` workflow proves “workflow + steps” conventions
As a developer, I want a tiny workflow with 2-3 steps so that we prove end-to-end durability and the `"use workflow"`/`"use step"` structure before cutting over real production flows.

#### Acceptance Criteria
- AC-004: A `wdk_smoke` workflow exists and is startable via a dev-only mechanism.
  - Example: a dev-only `/spikes/wdk/smoke/start` route starts a run.
  - Negative: the route is not available when dev/spikes gating is off.
- AC-005: The workflow schedules at least 2 steps and records durable step state.
  - Example: DB shows step rows moving `queued -> running -> succeeded`.
  - Negative: step execution does not occur “in-process” inside the HTTP handler.
- AC-006: One smoke step deliberately fails once and succeeds on retry (to prove retry path).
  - Example: first attempt fails and is rescheduled; second attempt succeeds.
  - Negative: failure does not mark the whole workflow `failed` if retry budget remains.

#### Verification
- Manual: start smoke workflow, kill worker mid-flight, restart worker, confirm completion without duplicates.

### US-003: Conventions are enforceable (best-effort guardrail)
As a contributor, I want a basic guardrail so it’s obvious when a “workflow” or “step” violates conventions.

#### Acceptance Criteria
- AC-007: Add a lightweight automated check (test or script) that asserts workflow/step directive literals exist in the right places.
  - Example: missing `"use step"` in a step file fails CI.
  - Negative: the check does not attempt to be a full parser; it should not block unrelated changes due to brittleness.

#### Verification
- Automated: a unit test that intentionally fails if directives are missing (use a fixture file or in-memory strings).

## Functional Requirements
- FR-001: Introduce minimal WDK runtime modules (suggested path: `apps/web/lib/wdk/*`).
- FR-002: Introduce workflow registry and step registry with Zod schemas for IO validation.
- FR-003: Add Postgres-backed “world” primitives for:
  - starting a run (or WDK-run) deterministically
  - scheduling steps with deterministic `step_key`
  - claiming steps with `FOR UPDATE SKIP LOCKED`
  - marking success/failure and rescheduling with backoff
  - requeueing stale running steps
- FR-004: Add a WDK worker loop and wire it into `pnpm --filter @orbital-poc/web worker`.

## Failure States + UX
- If the worker is not running, started smoke workflows do not progress. This is acceptable but must be visible in logs and DB state.

## Metrics / Logging
- Log worker lifecycle events: `wdk.worker.started`, `wdk.worker.tick_failed`.
- Log step execution events with `{ run_id, step_key, step_type, attempt, state }`.

## Rollback / Disable Path
- No production rollout in this slice; rollback is via code revert.

## Quality Gates
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`
- `pnpm verify`

## Verification Plan
Automated:
- unit tests for `claimNextStep` behavior (single-step claim invariants)
- unit tests for retry/backoff scheduling

Manual smoke:
1. `pnpm dev`
2. `pnpm --filter @orbital-poc/web worker`
3. Start `wdk_smoke`
4. Kill worker mid-flight; restart; confirm eventual completion without duplicates

## Open Questions
- Should WDK step execution reuse `run_steps` directly or use WDK-specific step rows and mirror into `run_steps` later?

## Sources
- `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/96-engineering-tutor-learnings/2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md`

