# Plan: WDK Runtime + Conventions (Replace Durable Jobs)

Date: 2026-02-10  
Status: Draft (planning doc; no implementation implied)

## Why this exists
The repo currently has a minimal Postgres-backed durable `jobs` queue + worker loop (`apps/web/lib/jobs/*`). This closes the worst “in-memory queue” drift, but it is still not the target runtime posture described across `docs/03-architecture/*`:
- durable, resumable workflow controller (`"use workflow"`)
- explicit side-effect steps (`"use step"`)
- step-level idempotency + observability (`run_steps`)

This dossier defines Workstream B: ship a concrete WDK runtime in-repo and **replace** the current durable jobs worker with WDK execution as the canonical durable runtime going forward.

## Outcomes (definition of done for Workstream B)
1. A WDK worker process exists (separate from Next.js) and can execute workflows durably via Postgres state.
2. WDK “world” is Postgres-backed with runtime DDL (idempotent, compatible with our `ensureSchema()` approach).
3. Conventions are real in code:
   - workflows start with `"use workflow"`
   - steps start with `"use step"`
   - workflow functions do no side effects directly (they only call steps)
4. Existing durable jobs are retired from any flows owned by Workstream B:
   - `pnpm --filter @orbital-poc/web worker` runs the WDK worker (not the jobs worker)
   - ingest no longer creates `jobs(type=ingest_document)` rows once cutover is rolled forward

Important boundary:
- Quick Start run execution cutover is tracked separately in `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`.

Non-goal reminder: this dossier does **not** implement Retrieval (0011a) or Matter Chat (0011b). It enables them.

## Key decisions (locked for this plan)
- We will implement a **minimal in-repo WDK** (not a third-party orchestration dependency).
- We will do a **tracer-bullet** first (a tiny workflow + 2-3 steps) to prove durability and conventions.
- We will then **cut over immediately** from `jobs` to WDK execution (no long-lived dual-runtime).
- WDK world state uses the existing `runs` + `run_steps` tables (no parallel WDK step tables + mirroring).

## Sequencing (program-level)
Must run first (serial):
2. 0003a WDK runtime skeleton  
   - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003a_wdk-runtime-skeleton/prd.json`

Parallel start point:
- Once `0003a.US-001` is complete (WDK worker can claim + execute steps durably).

Can run in parallel after that:
3. 0003b ingest cutover (depends on `0003a.US-001`)  
   - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003b_ingest-to-wdk-cutover/prd.json`
4. 0004 Quick Start cutover to WDK (separate workstream; depends on “WDK is viable”, i.e. `0003a.US-001`)  
   - `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.json`
5. 0011a retrieval substrate (can run in parallel; only hard-blocks chat)  
   - `docs/04-projects/02-features/0011_chat_interface/prds/0011a_hybrid-retrieval-v0/prd.json`
6. Workstream E: DB-first `GET /citations/:id` + unify associations (parallel; hard-blocks chat)  
   - `docs/04-projects/04-refactors/0005_citations-db-first/prd.json`

Must be last (serial on prerequisites):
7. 0011b Matter Chat (start only after 2 + 5 + 6 are satisfied)  
   - `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.json`

## Current state (reality check)
- Durable jobs: `apps/web/lib/jobs/jobQueue.server.ts`, `apps/web/lib/jobs/jobWorker.server.ts`, `apps/web/scripts/worker.ts`
- State tables already exist: `runs`, `run_steps`, plus many “truth store” tables in `apps/web/lib/db/schema/core.server.ts`
- Docs explicitly say: “WDK not implemented” (`docs/03-architecture/07_current_poc_runtime.md`)

## Target state (end of Workstream B)
### Code layout (target)
Add the repo layout that `docs/03-architecture/05_tech_stack_and_dev_workflow.md` suggests:
```
apps/web/
  workflows/   (WDK workflow entrypoints)
  steps/       (WDK step implementations)
  lib/wdk/     (minimal runtime: world, runner, types)
  scripts/worker.ts (WDK worker entrypoint)
```

### Runtime shape (target)
- `next dev` / `next start`: only handles HTTP + lightweight orchestration calls (start workflow, poll state)
- `pnpm worker`: runs the WDK worker loop that executes queued step work durably

## Design: Minimal WDK (what we build)

### Concepts
We implement the smallest useful subset of the “workflow + steps” model described in:
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/96-engineering-tutor-learnings/2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md`

Definitions:
- **Workflow**: deterministic controller, no side effects, calls steps.
- **Step**: side-effect boundary; step body can do DB/IO/LLM; step must be idempotent or guarded by a deterministic key.
- **World**: Postgres-backed state for:
  - workflow run record
  - durable step execution log
  - retries/backoff
  - progress events (at minimum: queryable state in DB; SSE can come later)

### Schema strategy (world in Postgres)
Constraint: the current `runs` table is Quick-Start-shaped (several non-null columns that do not apply to ingest).

To support replacing `jobs` (ingest + run execution) without inventing a second durability system, we will **generalize** the “run” concept:
- `runs.type` becomes a workflow type (e.g. `quick_start`, `ingest_document`, `demo_smoke`, etc).
- Add (or repurpose) JSON columns for workflow inputs/outputs so non-Quick-Start workflows have a place to store their IO safely.
- Relax or conditionalize Quick-Start-specific NOT NULL constraints so other workflow types can exist without dummy values.

Planned schema deltas (exact DDL to be decided at implementation time):
- `runs`:
  - Add `input_json JSONB NOT NULL DEFAULT '{}'::jsonb`
  - Add `result_json JSONB NOT NULL DEFAULT '{}'::jsonb`
  - Make Quick-Start-specific columns nullable or enforce via CHECK by `runs.type`:
    - `index_version`
    - `agent_bundle_version`
    - `question_set_version`
    - `questions_total`, `questions_done` (can remain but may be 0 for non-QS runs)
- `run_steps`:
  - Confirm it covers what WDK needs (it is already “durable step execution log”).
  - Extend with fields needed for worker claiming, if missing:
    - `available_at TIMESTAMPTZ NOT NULL DEFAULT now()`
    - `locked_at TIMESTAMPTZ NULL`
    - `locked_by TEXT NULL`
    - `input_json JSONB NOT NULL DEFAULT '{}'::jsonb`
    - `output_json JSONB NOT NULL DEFAULT '{}'::jsonb`
    - `attempt INT` is already present (keep 1-based semantics)

If `run_steps` is insufficient, stop and update this plan/ADR rather than silently introducing parallel WDK durability tables.

### Runtime API (internal)
Minimal API surface in `apps/web/lib/wdk/*`:
- `defineWorkflow({ type, runInputSchema, handler })`
- `defineStep({ stepType, inputSchema, handler })`
- `startWorkflow({ type, idempotencyKey?, input }) -> { runId }`
- `scheduleStep({ runId, stepType, stepKey, input })`
- `claimNextStep({ workerId }) -> StepRow | null` (uses `FOR UPDATE SKIP LOCKED`)
- `markStepSucceeded({ stepId, output, metrics })`
- `markStepFailed({ stepId, error, retryAt? })`
- `runWorkflowTick({ runId })` (invokes workflow controller to schedule next steps deterministically)

Notes:
- The “workflow controller” should be runnable by the worker (not the Next.js server) to avoid two competing orchestrators.
- Step IO is JSON-serialisable and validated with Zod at the boundary.

### Conventions enforcement (practical, not theoretical)
We will enforce conventions by:
1. Directory conventions: only treat modules under `apps/web/workflows/*` as workflows and `apps/web/steps/*` as steps.
2. A lightweight test that fails CI if required directive literals are missing:
   - Scan workflow/step files and assert they contain `"use workflow"` / `"use step"` as the first statement in the exported async function (best-effort; doesn’t need to be perfect to be useful).
3. Code review rule of thumb: workflow modules must not import “server-only” modules except the WDK runtime facade.

## Tracer-bullet (4a)
Build a tiny workflow that proves:
- run row is created durably
- 2-3 steps run durably across worker restart
- retries/backoff work
- state is queryable

Candidate: `wdk_smoke` workflow
- Step A: write a row into a small `artefacts` record or `runs.result_json` (safe, deterministic)
- Step B: sleep or do a bounded deterministic computation, then write output
- Step C: deliberately fail once, then succeed on retry (to prove retry + attempt counters)

## Cutover plan (replace durable jobs)
We will replace `jobs` as the execution substrate for ingest in a controlled sequence.
Full retirement of the jobs runtime is only possible after Quick Start run execution is also ported (see refactor 0004).

1) **Introduce WDK runtime and smoke workflow** (no production behavior changed).
2) **Make worker run WDK**:
   - keep the CLI `pnpm --filter @orbital-poc/web worker`
   - update `apps/web/scripts/worker.ts` to run the WDK worker loop
3) **Port enqueue points**:
   - document ingest enqueue switches from `enqueueJob({type:"ingest_document"})` to `startWorkflow({type:"ingest_document", ...})`
   - Quick Start run enqueue is handled by refactor 0004 (do not duplicate here)
4) **Stop creating `jobs` rows**:
   - keep the `jobs` table temporarily for rollback/forensics
   - remove inline job drainer kick logic (or keep, but make it WDK drainer)
5) **Delete or quarantine the jobs runtime**:
   - delete `apps/web/lib/jobs/*` only once all call sites are removed (blocked on refactor 0004)
   - update docs to state WDK is implemented (and call out any remaining legacy-only use)

Rollback posture:
- During the migration PR(s), keep `jobs` code behind a feature flag so we can revert runtime behavior quickly if needed.

## Work breakdown (PR-by-PR)
Keep one concern per PR. Suggested PR slices:

### PR 1: WDK skeleton + smoke workflow (no cutover)
- Add `apps/web/lib/wdk/*` runtime scaffolding (types + schemas + minimal DB accessors)
- Add `apps/web/workflows/wdkSmokeWorkflow.ts`
- Add `apps/web/steps/wdkSmoke*.ts`
- Add a tiny API route under `/spikes/wdk/*` (dev gated) to start the smoke workflow and view state

Acceptance:
- Can start `wdk_smoke` and see run + step rows appear
- Worker restart does not lose queued steps

### PR 2: World schema support
- Update runtime DDL in `apps/web/lib/db/schema/*` for WDK world needs:
  - generalize `runs` for multiple workflow types
  - extend `run_steps` with claim/reschedule fields (or add a sibling WDK steps table if required)
- Add unit tests around claim semantics (`FOR UPDATE SKIP LOCKED`) and idempotency keys

Acceptance:
- Step claim is safe for multiple workers
- Step retries/backoff behave as expected

### PR 3: WDK worker loop + wiring
- Implement `runContinuousWdkWorker()` (poll, claim, execute, reschedule, requeue stale locks)
- Update `apps/web/scripts/worker.ts` to run WDK worker
- Ensure dev behavior: in `NODE_ENV=development`, a safe inline “kick” drains a bounded number of steps (optional, but parity with current DX is desirable)

Acceptance:
- `pnpm --filter @orbital-poc/web worker` executes WDK steps

### PR 4: Cutover ingest to WDK workflow
- Implement `ingest_document` workflow:
  - workflow controller schedules the ingest step(s)
  - step body can call existing `processDocumentIngest(documentId)` initially as a single step (thin integration)
- Update enqueue points in the upload/ingest routes to start the workflow instead of enqueueing a job
- Stop writing `jobs` for ingest

Acceptance:
- Upload -> ingest completes with WDK worker running
- In dev, ingest runs without a second terminal if inline kick is enabled

### PR 5: Cutover run execution to WDK workflow
This work is tracked separately:
- `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`

### PR 6: Remove durable jobs runtime + doc truth
- Delete `apps/web/lib/jobs/*` and any remaining call sites
- Remove `jobs` mentions from “current runtime” docs; state WDK is implemented
- Update `docs/03-architecture/07_current_poc_runtime.md` and any sequencing docs to reference this dossier

Acceptance:
- `pnpm verify` still passes
- Docs no longer claim WDK is unimplemented

## Verification (for each PR)
Minimum:
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`

Worker smoke (manual):
1. `pnpm dev`
2. In another terminal (or via inline kick): `pnpm --filter @orbital-poc/web worker`
3. Trigger smoke workflow start (dev/spike route)
4. Kill worker process mid-flight, restart it, confirm steps continue without duplication

## Open questions (to resolve during PR 1/2, not before)
- How strict should directive enforcement be (best-effort test vs custom ESLint rule)?
- Do we want cancellation semantics in v0 (likely no; defer until a real need exists)?
