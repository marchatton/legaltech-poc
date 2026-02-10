# Plan: Refactor Quick Start To WDK (Workstream C)

Date: 2026-02-10
Status: Draft (planning doc; no implementation implied)
Owner: marc

## Intent
Refactor Quick Start run execution from the durable `jobs` worker to the WDK runtime (Workstream B), so Quick Start is durably orchestrated via workflows + steps.

This closes the biggest runtime drift: two orchestration systems (jobs vs WDK) competing for the same domain problem.

## Dependencies
Hard dependency:
- Workstream B: `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
  - WDK worker exists and can execute steps durably
  - WDK world schema decisions are settled (whether `run_steps` is extended or a sibling table exists)

Soft dependencies (can be follow-ups):
- Retrieval substrate (0011a) and DB-first citations (Workstream D/E) are not required to move Quick Start onto WDK.
  - This refactor should preserve current Quick Start behavior (which is placeholder rows and/or missing-input rows today).

Entry criteria (do not start Workstream C PRs until true):
- `pnpm --filter @orbital-poc/web worker` runs a WDK worker loop (not the legacy jobs worker).
- WDK has a supported way to:
  - start a workflow and persist its run state durably
  - schedule/claim/execute steps durably
  - observe progress via DB rows (at minimum)

## Goal (definition of done)
1. `POST /folders/:id/runs` starts a WDK workflow for Quick Start and returns the created `run` as it does today.
2. Quick Start execution is performed by the WDK worker, not `apps/web/lib/jobs/*`.
3. New Quick Start runs do not create `jobs` rows of type `execute_run`.
4. The existing run state model remains coherent and inspectable:
   - `runs.state` transitions remain correct (`running -> completed|partial|failed`)
   - `runs.questions_total/questions_done` and `failure_counts_json` semantics are preserved
   - idempotency header behavior (`Idempotency-Key`) is preserved
5. Legacy jobs runtime remains present for a short deprecation window, clearly marked as legacy-only, and not used by Quick Start.

## Non-goals (explicit cuts)
- Do not change product semantics (question set, row schemas, status taxonomy, fixture packs).
- Do not implement retrieval/draft/lock/verify logic for Quick Start yet.
- Do not invent a second evidence/citations system.

## Current State (reality check)
Run start:
- API: `apps/web/app/(api)/folders/[id]/runs/route.ts`
  - inserts a `runs` row
  - inserts a `run_steps` row `workflow_start` (succeeded)
  - calls `enqueueQuickStartRun(runId)` (fire-and-forget)
- Queue: `apps/web/lib/quickStartRunQueue.server.ts` enqueues `jobs(type=execute_run, job_key=run:<id>)` and kicks inline drainer in dev
- Worker: `apps/web/lib/jobs/jobWorker.server.ts` handles `execute_run` by calling `processQuickStartRun(runId)`
- Processor: `apps/web/lib/quickStartRunProcessor.server.ts` writes `run_steps(write_row)` and `report_rows`, and finalizes `runs.state`

Polling:
- `GET /runs/:id`: `apps/web/app/(api)/runs/[id]/route.ts`

## Target State
- Quick Start is a WDK workflow type (e.g. `quick_start_title_survey`).
- The WDK worker claims and runs Quick Start steps durably.
- `jobs(type=execute_run)` is no longer written.
- For the deprecation window, the jobs worker can continue to exist for other legacy uses (e.g. ingest) but must be clearly labeled as legacy.

## Design Constraints (to avoid future pain)
- Preserve idempotency:
  - Run-level idempotency remains `(folder_id, idempotency_key)`.
  - Step-level idempotency uses deterministic `step_key` (unique per `run_id`).
- Keep side effects inside steps.
- Keep domain logic testable:
  - Prefer extracting pure functions into `packages/core` when it reduces coupling.
  - Keep WDK wiring inside `apps/web`.

## Plan Overview (PR-by-PR)
This workstream should be landed as small PRs with tight verification loops.

### PR C1: Quick Start WDK workflow skeleton (no cutover)
Goal: Add a WDK workflow + step set for Quick Start without changing behavior.

Changes:
- Add `apps/web/workflows/quickStartTitleSurvey.workflow.ts` (or equivalent) that declares:
  - workflow type: `quick_start_title_survey`
  - input: `{ run_id: string }` (or `{ folder_id, idempotency_key? }` if Workstream B world prefers it)
  - controller: schedules the first step only (tracer bullet)
- Add step(s) in `apps/web/steps/quickStart/*`:
  - `qs_execute_v0` step: calls existing `processQuickStartRun(runId)` as a thin integration slice
- Minimal WDK registry wiring (if Workstream B didn’t already create it):
  - ensure worker can discover workflow + step implementations

Acceptance:
- WDK worker can execute `qs_execute_v0` end-to-end when started manually.
- No route cutover yet.

### PR C2: Feature-flagged cutover for `POST /folders/:id/runs`
Goal: Route starts WDK workflow for Quick Start behind a clearly named flag.

Changes:
- Add an env flag, e.g. `FEATURE_WDK_QUICK_START=1`.
- In `apps/web/app/(api)/folders/[id]/runs/route.ts`:
  - if flag enabled: start the WDK workflow instead of `enqueueQuickStartRun(runId)`
  - else: preserve current job enqueue behavior
- Ensure logs make runtime choice explicit:
  - `run.created` log includes `{ orchestration: 'wdk' | 'jobs' }`
- Add a small test that asserts the branching is correct:
  - WDK flag on: does not call `enqueueQuickStartRun`
  - WDK flag off: still calls `enqueueQuickStartRun`

Acceptance:
- With flag enabled: a run progresses to terminal state with WDK worker running.
- With flag disabled: behavior is unchanged.

### PR C3: Default-on in dev + explicit legacy marking
Goal: Make WDK the default Quick Start runtime in development, and make jobs clearly legacy-only.

Changes:
- Default `FEATURE_WDK_QUICK_START=1` in local dev tooling (document it; do not silently change prod defaults).
- Update code comments and docs to label jobs runtime as legacy:
  - `apps/web/lib/jobs/*` header comment: legacy-only, pending removal
  - `docs/03-architecture/07_current_poc_runtime.md`: Quick Start runs on WDK; jobs may remain only for legacy tasks

Acceptance:
- A contributor following docs runs Quick Start via WDK without confusion.

### PR C4: Remove Quick Start `execute_run` jobs usage (keep ingest as-is)
Goal: Quick Start no longer enqueues durable jobs at all.

Changes:
- Remove `enqueueQuickStartRun()` usage from Quick Start routes.
- Optionally keep `apps/web/lib/quickStartRunQueue.server.ts` for the deprecation window but unused, then delete it.
- Update jobs worker handler map:
  - remove `execute_run` handler (or gate it behind a legacy flag)
- Add a one-time cleanup note:
  - existing `jobs(type=execute_run)` rows in dev DB can be ignored or manually cleared; they should no longer be created

Acceptance:
- `jobs` table can still exist, but Quick Start never writes to it.

### PR C5 (recommended): Move off the monolith processor into per-question WDK steps
Goal: Make the WDK model real: explicit steps, resumability, and controllable progress, instead of a single long `qs_execute_v0` step.

Why:
- A single long step is still a "job" in disguise.
- Per-question steps allow durable progress and safe restarts without re-running the entire processor.

Approach:
- Replace `qs_execute_v0` with a deterministic step graph:
  - Workflow schedules `write_row` steps per question_id.
  - Each step:
    - writes `run_steps(step_type='write_row', step_key=...)` idempotently
    - writes `report_rows` idempotently
    - updates `runs.questions_done` and `failure_counts_json` deterministically
- Convert `processQuickStartRun()` into either:
  - a pure planner that computes per-question intents, or
  - delete it and move logic into a `writeRow` step handler.

Acceptance:
- Killing the worker mid-run and restarting continues the run without duplicating rows.
- `GET /runs/:id` progress updates incrementally as steps complete.

### PR C6: Legacy job runtime deprecation window and removal plan
Goal: Make 4b explicit and enforceable.

Policy (mark clearly):
- Jobs runtime is legacy-only for one deprecation window.
- After the window:
  - delete `apps/web/lib/jobs/*` and `apps/web/lib/*Queue.server.ts` legacy enqueue paths
  - remove `jobs` DDL from `apps/web/lib/db/schema/core.server.ts` (or keep temporarily if ingest hasn’t moved)

Deliverable:
- A short `docs/04-projects/04-refactors/0004_quick-start-to-wdk/deprecation.md` describing:
  - what is legacy
  - how to remove it
  - what must be migrated first (e.g. ingest)

## Verification
Automated (each PR):
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`

Manual smoke (PR C2+):
1. Start web: `pnpm dev`
2. Start worker: `pnpm --filter @orbital-poc/web worker`
3. Trigger a run from the UI or via POST `/folders/:id/runs`.
4. Confirm:
   - run reaches `completed` or `partial`
   - `GET /runs/:id` progress increases over time
   - when WDK mode is enabled, no `jobs(type=execute_run)` row is created

Regression checks:
- Idempotency-Key: repeat `POST /folders/:id/runs` with the same header returns the existing run.
- Folder gating behavior (`indexed|ready` runnable) remains unchanged.

## Risks / Watchouts
- Workstream B schema decisions may require additional changes here (e.g. if `run_steps` is extended for claiming).
- Mixing two runtimes (jobs + WDK) can create confusion; this is why we keep the deprecation window short and clearly documented.
- Refactoring `processQuickStartRun` into per-question steps can accidentally change ordering/timings. This is acceptable as long as:
  - outputs remain terminal-only
  - idempotency and invariants hold

## Open Questions (to settle in PR C1)
- What is the canonical WDK workflow input for Quick Start?
  - Option A: `{ run_id }` (minimal change)
  - Option B: `{ folder_id, run_type, idempotency_key? }` and the workflow creates the `runs` row itself
- Who owns updating `runs.state` to terminal?
  - Option A: step handlers (as today) after each row write
  - Option B: workflow controller finalizes when all step keys exist
