# PRD: Quick Start to WDK (Workstream C)

Owner: marc
Status: Draft
Date: 2026-02-10
Slug: quick-start-to-wdk

## Introduction / Overview

### Problem
Quick Start is already WDK-owned in code (route schedules per-question WDK steps and does not enqueue `execute_run` jobs), but the docs and legacy durable jobs runtime code still imply a jobs-based execution path. That creates confusing drift and keeps an unused worker loop running.

### Goal
Finish the migration by making the repo single-runtime:
- `POST /folders/:id/runs` schedules WDK steps for Quick Start (already true).
- Quick Start never creates `jobs(type=execute_run)` rows (already true).
- Remove the legacy durable jobs runtime (`apps/web/lib/jobs/*`, `apps/web/lib/quickStartRunQueue.server.ts`) and stop starting the jobs worker in `apps/web/scripts/worker.ts`.

### Primary Observable Effect
- With the WDK worker running, starting Quick Start results in durable progress (visible via `GET /runs/:id`) and a terminal run state without relying on the legacy jobs worker.

### Scope / Slice
This PRD is intentionally scoped to **2a**:
- Make Quick Start WDK-owned (already landed).
- Remove the unused legacy durable jobs runtime so WDK is the only worker loop advancing runs.

## Goals
- Move Quick Start execution to WDK with minimal product-semantic change.
- Preserve run-level idempotency (folder_id + idempotency_key) and step-level idempotency (deterministic step_key).
- Keep the system debuggable: logs and DB rows should make it obvious the run is WDK-orchestrated.
- Remove `execute_run` job handling and any enqueue path for Quick Start.
- Remove the legacy durable jobs worker loop and job type/schema so the worker process is WDK-only.

## Non-goals (explicit cuts)
- Do not implement retrieval/draft/lock/verify for Quick Start (this slice is orchestration refactor).
- Do not migrate ingest to WDK in this workstream.
- Do not change question set, report row schemas, or status taxonomy.
- Do not change evidence/citations primitives.
- Do not implement a first-class "worker not running" indicator (heartbeat + UI state machine); lack of progress + logs are sufficient for this slice.

## Users
- Developer (local): wants Quick Start to run durably under WDK without managing two runtimes.
- Operator (demo/PoC): wants fewer moving parts and a single durable runtime posture.

## User Stories

### US-001: Quick Start is executed by a WDK workflow
As a developer, I want Quick Start run execution to be orchestrated by WDK so that the repo has one durable runtime posture and Quick Start is resumable under the worker.

#### Acceptance Criteria
- AC-001: Starting Quick Start schedules a WDK workflow execution (workflow type is explicitly Quick Start).
  - Example: `POST /folders/:id/runs` returns a run in `running` state and the worker begins executing WDK steps for that run.
  - Negative: If the WDK worker is not running, the run does not silently complete in-process via the legacy jobs worker.
- AC-002: The WDK step implementation can initially be a thin integration that calls the existing `processQuickStartRun(runId)` logic.
- AC-003: Logs clearly indicate orchestration mode for a run (WDK).

#### Verification
- Manual: start web + worker; start a run; observe progress via `GET /runs/:id`.

### US-002: `POST /folders/:id/runs` uses WDK immediately (no rollout flag)
As a developer, I want Quick Start to switch to WDK immediately (we are not live) so that the system stops accumulating drift and the legacy path is removed quickly.

#### Acceptance Criteria
- AC-004: `POST /folders/:id/runs` starts WDK workflow execution unconditionally (no feature flag required).
  - Example: with a worker running, a run progresses to terminal state.
  - Negative: the route does not enqueue `jobs(type=execute_run)` or kick the legacy inline jobs worker.
- AC-005: Run idempotency behavior is preserved.
  - Example: repeated POST with the same `Idempotency-Key` returns the previously created run.
  - Negative: duplicate runs are not created for the same `(folder_id, idempotency_key)`.

#### Verification
- Automated: integration test asserting the route schedules WDK steps immediately, preserves idempotency, and does not enqueue `execute_run` jobs.
- Manual: POST twice with same key, confirm same run id.

### US-003: Remove legacy durable jobs runtime (execute_run + worker loop)
As a developer, I want the unused legacy durable jobs runtime removed so Quick Start cannot accidentally execute via jobs and the worker runs only WDK.

#### Acceptance Criteria
- AC-006: No new `jobs(type=execute_run)` rows are created by starting Quick Start.
  - Example: after starting a run, querying DB shows no matching execute_run job for that run.
  - Negative: there is no remaining code path (including helper functions) that can enqueue `execute_run` jobs for Quick Start.
- AC-007: The legacy jobs runtime does not support the `execute_run` job type (remove type/schema and worker handler).
- AC-008: The worker process no longer starts the jobs worker loop (only WDK worker remains).

#### Verification
- Automated: integration test still passes (no `execute_run` jobs created).
- Manual: `pnpm --filter @orbital-poc/web worker` starts WDK only (no legacy jobs worker).

### US-004: Quick Start uses per-question WDK steps (avoid a single job-like step)
As a developer, I want Quick Start to be broken into per-question durable steps so that restarts do not re-run the entire processor and progress is naturally incremental.

#### Acceptance Criteria
- AC-009: The workflow schedules deterministic per-question step keys (one per `question_id`).
  - Example: killing the worker mid-run and restarting continues without duplicate `report_rows`.
  - Negative: the system does not re-run already completed question writes.
- AC-010: `GET /runs/:id` progress increments as steps complete.

#### Verification
- Manual: start run, kill worker mid-flight, restart worker, confirm run finishes and progress increments.

## Functional Requirements
- FR-001: Define a Quick Start workflow type in the WDK registry (e.g. `quick_start_title_survey`).
- FR-002: Implement WDK step(s) for Quick Start execution.
  - Initial allowed implementation: one step calls `processQuickStartRun(runId)`.
  - Recommended evolution: per-question `write_row` steps.
- FR-003: Update the run-start route to create/reuse the run row (via idempotency) and start WDK workflow execution with input `{ run_id }`.
- FR-004: Remove legacy durable jobs runtime codepaths and worker loop (delete execute_run queue/worker, remove jobs worker startup).
- FR-005: Ensure WDK worker is the only mechanism that can advance Quick Start runs (no silent in-process completion).

## Failure States + UX
- If the worker is not running, the run may stay `running` with no progress. This is acceptable in the PoC, but must be observable:
  - logs should indicate workflow started
  - `GET /runs/:id` shows no progress

## Metrics / Logging
- Log `run.created` with an explicit `orchestration: "wdk"` field.
- Log a WDK step-level event with `{ run_id, step_key, step_type, state }` (or equivalent) to support traceability.

## Rollback / Disable Path
- No production rollout concerns (not live). Rollback is via code revert.
- For safety during development, if WDK is incomplete, the correct fix is to complete Workstream B rather than silently falling back to jobs.

## Quality Gates
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`
- `pnpm --filter @orbital-poc/web lint`

## Verification Plan
Automated:
- Integration test that `POST /folders/:id/runs` starts WDK unconditionally, preserves idempotency, and does not enqueue `execute_run` jobs.

Manual smoke:
1. `pnpm dev`
2. `pnpm --filter @orbital-poc/web worker`
3. In the UI, click "Run Quick Start" (or POST `/folders/:id/runs`).
4. Poll `GET /runs/:id` until terminal.
5. Kill worker mid-run and restart; confirm idempotency (no duplicate rows) and eventual terminal state.

Packs:
- Use fixture packs as a deterministic baseline:
  - `pack_01_clean`
  - `pack_02_missing_rea`

## Risks & Dependencies
- Dependency: Workstream B must provide a functional WDK worker + world schema.
- Risk: A single-step "execute" implementation is a job-in-disguise; mitigate by moving to per-question steps (US-004).
- Risk: Removing legacy jobs path may break dev UX if WDK is incomplete; mitigate by ensuring Workstream B entry criteria are met first.

## Open Questions
- None (resolved 2026-02-10).

## Sources
- `docs/04-projects/04-refactors/0004_quick-start-to-wdk/plan.md`
- `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
- `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`
- `apps/web/test/foldersRunsRoute.wdk.int.test.ts`
- `apps/web/scripts/worker.ts`
- `apps/web/lib/quickStartRunQueue.server.ts`
- `apps/web/lib/jobs/jobWorker.server.ts`
- `apps/web/lib/quickStartRunProcessor.server.ts`
