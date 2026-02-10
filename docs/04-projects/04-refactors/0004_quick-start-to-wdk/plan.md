# Plan: Refactor Quick Start To WDK (Workstream C)

Date: 2026-02-10
Status: Draft (planning doc; no implementation implied)
Owner: marc

## Intent
Quick Start is already WDK-owned in code. This workstream finishes the migration by removing the unused legacy durable jobs runtime so the worker process is WDK-only and docs match implementation.

## Dependencies
Hard dependency:
- Workstream B: `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
  - WDK worker exists and can execute steps durably
  - WDK world schema decisions are settled (whether `run_steps` is extended or a sibling table exists)

Soft dependencies (can be follow-ups):
- Retrieval substrate (0011a) and DB-first citations (Workstream D/E) are not required to move Quick Start onto WDK.
  - This refactor should preserve current Quick Start behavior (which is placeholder rows and/or missing-input rows today).

Entry criteria (met as of 2026-02-10):
- `POST /folders/:id/runs` schedules Quick Start WDK steps immediately (one per question_id).
- Starting Quick Start does not enqueue `jobs(type=execute_run)` rows.
- Idempotency is preserved via `Idempotency-Key`.

## Goal (definition of done)
1. `POST /folders/:id/runs` starts a WDK workflow for Quick Start and returns the created `run` as it does today.
2. Quick Start execution is performed by the WDK worker, not `apps/web/lib/jobs/*`.
3. New Quick Start runs do not create `jobs` rows of type `execute_run`.
4. The existing run state model remains coherent and inspectable:
   - `runs.state` transitions remain correct (`running -> completed|partial|failed`)
   - `runs.questions_total/questions_done` and `failure_counts_json` semantics are preserved
   - idempotency header behavior (`Idempotency-Key`) is preserved
5. Legacy jobs runtime is removed (worker process runs WDK only).

## Non-goals (explicit cuts)
- Do not change product semantics (question set, row schemas, status taxonomy, fixture packs).
- Do not implement retrieval/draft/lock/verify logic for Quick Start yet.
- Do not invent a second evidence/citations system.

## Current State (reality check)
Run start:
- API: `apps/web/app/(api)/folders/[id]/runs/route.ts`
  - inserts a `runs` row
  - inserts a `run_steps` row `workflow_start` (succeeded)
  - schedules per-question WDK steps via `startQuickStartTitleSurveyWorkflow(...)` (one per `question_id`)
  - logs `orchestration: "wdk"`
- Workflow: `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`
  - schedules queued steps with `step_type = 'quick_start_title_survey.write_row_v0'` and deterministic `step_key`s
- Step handler: `apps/web/steps/quickStartWriteRowV0.step.server.ts`
  - writes placeholder terminal `report_rows` and increments progress

Legacy durable jobs runtime (unused, pending removal):
- `apps/web/lib/quickStartRunQueue.server.ts` still exists and can enqueue `jobs(type=execute_run)`, but has no callers.
- `apps/web/lib/jobs/*` still exists and the worker process currently starts it: `apps/web/scripts/worker.ts`.

Polling:
- `GET /runs/:id`: `apps/web/app/(api)/runs/[id]/route.ts`

## Target State
- Quick Start is a WDK workflow type (e.g. `quick_start_title_survey`).
- The WDK worker claims and runs Quick Start steps durably.
- `jobs(type=execute_run)` is no longer written.
- The legacy durable jobs runtime is removed (no jobs worker loop, no execute_run job type).

## Design Constraints (to avoid future pain)
- Preserve idempotency:
  - Run-level idempotency remains `(folder_id, idempotency_key)`.
  - Step-level idempotency uses deterministic `step_key` (unique per `run_id`).
- Keep side effects inside steps.
- Keep domain logic testable:
  - Prefer extracting pure functions into `packages/core` when it reduces coupling.
  - Keep WDK wiring inside `apps/web`.

## Plan Overview (Remaining Work)

Already landed (2026-02-10):
- Route schedules Quick Start WDK steps unconditionally and preserves idempotency: `apps/web/app/(api)/folders/[id]/runs/route.ts`
- Workflow schedules per-question steps (deterministic step keys): `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`
- Integration test covers scheduling, idempotency, progress increments, and “no execute_run jobs”: `apps/web/test/foldersRunsRoute.wdk.int.test.ts`

Remaining:
- Remove the legacy durable jobs runtime (since it has no known producers):
  - Delete `apps/web/lib/quickStartRunQueue.server.ts`
  - Delete `apps/web/lib/jobs/*`
  - Remove `runContinuousJobWorker(...)` startup from `apps/web/scripts/worker.ts`
  - Optional cleanup: remove jobs DDL/schema if unused
- Update “implemented today” docs to match reality:
  - `docs/03-architecture/07_current_poc_runtime.md`

## Verification
Automated (each PR):
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`

Manual smoke:
1. Start web: `pnpm dev`
2. Start worker: `pnpm --filter @orbital-poc/web worker`
3. Trigger a run from the UI or via POST `/folders/:id/runs`.
4. Confirm:
   - run reaches `completed` or `partial`
   - `GET /runs/:id` progress increases over time
   - no `jobs(type=execute_run)` row is created

Regression checks:
- Idempotency-Key: repeat `POST /folders/:id/runs` with the same header returns the existing run.
- Folder gating behavior (`indexed|ready` runnable) remains unchanged.

## Risks / Watchouts
- Workstream B schema decisions may require additional changes here (e.g. if `run_steps` is extended for claiming).
- Mixing two runtimes (legacy jobs + WDK) is confusing; this is why the remaining work is to remove the legacy jobs runtime promptly.
