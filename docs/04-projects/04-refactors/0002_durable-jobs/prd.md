# PRD: Durable Jobs (P1)

Owner: marc
Status: Draft
Date: 2026-02-09
Slug: durable-jobs

## Introduction / Overview

### Problem
The current PoC previously used in-process, in-memory queues for:
- document ingest (`ingestQueue.server.ts`)
- "Quick Start run" execution (`quickStartRunQueue.server.ts`)

This creates major operational drift from the target docs (durable orchestration) and causes real issues even for PoC/demo usage:
- server restarts drop work
- no safe multi-worker concurrency
- retries/backoff are ad-hoc and not persisted
- the web server and "worker" concerns are coupled (a single bad ingest can wedge the server process)

### Goal
Replace in-memory queues with a minimal durable job model:
- Postgres-backed `jobs` table
- a worker loop that claims and executes jobs with retries + backoff
- keep dev UX: when running `pnpm dev`, enqueueing a job should still "just run" via a dev-only inline worker kick

### Slice
P1: durable jobs and worker foundation, without implementing the full WDK target:
- DB: introduce `jobs` table (state machine + idempotency key)
- Code: `enqueueJob()` + `claimNextJob()` + worker handler map
- Convert ingest + quick-start run to enqueue jobs instead of in-memory queues
- Add a standalone worker entrypoint (`pnpm worker`)
- Update the "Current PoC runtime" doc to describe reality

### Primary Observable Effect
- Ingest and runs are durable across server restarts (queued work persists in Postgres).
- Multiple workers can run without double-processing jobs.
- `pnpm dev` still processes jobs without a separate worker process (development only).

## Goals
- Replace in-memory queues with durable jobs persisted in Postgres.
- Make job enqueue idempotent (by `(type, job_key)`).
- Add safe worker concurrency using `FOR UPDATE SKIP LOCKED`.
- Provide bounded retries with exponential backoff.
- Keep docs and "current runtime" truthfully aligned.

## User Stories

### US-001: Durable job enqueue is idempotent
As a developer, I want to enqueue the same logical job repeatedly without creating duplicates so that route handlers can be safely retried.

#### Acceptance Criteria
- AC-001: `enqueueJob({type, jobKey})` does not create duplicate rows for the same `(type, job_key)`.
- AC-002: If a job is `running`, enqueue does not overwrite `payload_json` or reset attempts.
- AC-003: If a job is terminal (`succeeded`/`failed`), enqueue re-queues it (state becomes `queued`, attempts resets to `0`).

#### Verification
- Automated: unit tests for enqueue semantics.

### US-002: Workers can safely claim jobs without double-processing
As an operator, I want multiple worker processes to run concurrently without two workers claiming the same job.

#### Acceptance Criteria
- AC-004: `claimNextJob()` uses a `FOR UPDATE SKIP LOCKED` claim pattern.
- AC-005: A claimed job transitions `queued -> running` and records `{locked_at, locked_by}`.
- AC-006: Job `attempts` increments on claim (1-based).

#### Verification
- Automated: unit tests for claim semantics (single-process) and basic state transitions.

### US-003: Ingest runs via durable jobs
As a user, I want document ingest to complete even if the Next.js server restarts mid-ingest.

#### Acceptance Criteria
- AC-007: Enqueueing ingest inserts/updates a job with `type="ingest_document"` and payload `{document_id}`.
- AC-008: Ingest execution logic lives in `processDocumentIngest(documentId)` and is invoked by the worker.
- AC-009: On handler failures, the job is retried up to 3 attempts with exponential backoff; otherwise marked `failed`.

#### Verification
- Automated: `pnpm --filter @orbital-poc/web typecheck && pnpm --filter @orbital-poc/web test`
- Manual: run `pnpm dev`, upload a PDF, and confirm ingest completes without running a separate worker process.

### US-004: Quick Start runs via durable jobs
As a user, I want a run to complete even if the Next.js server restarts after I click "Run".

#### Acceptance Criteria
- AC-010: Enqueueing a quick-start run inserts/updates a job with `type="execute_run"` and payload `{run_id}`.
- AC-011: Run execution logic lives in `processQuickStartRun(runId)` and is invoked by the worker.
- AC-012: The worker respects idempotency of row writes (retries do not duplicate `report_rows`).

#### Verification
- Automated: `pnpm --filter @orbital-poc/web typecheck && pnpm --filter @orbital-poc/web test`
- Manual: start a run; refresh/restart the server and confirm the run can still finish (worker continues on next claim).

### US-005: Dev inline worker kick preserves `pnpm dev` UX
As a developer, I want jobs to run automatically during local development without a second terminal.

#### Acceptance Criteria
- AC-013: In `NODE_ENV=development`, enqueueing a job kicks an inline worker drainer that processes a bounded number of jobs.
- AC-014: In non-development environments, the inline kick is a no-op.
- AC-015: A standalone worker can be started via `pnpm --filter @orbital-poc/web worker`.

#### Verification
- Manual: confirm job execution with and without a running worker process in development vs production-mode runs.

### US-006: Current runtime docs are updated
As a contributor, I want `docs/03-architecture/07_current_poc_runtime.md` to reflect the durable job model so I can reason correctly about runtime behavior.

#### Acceptance Criteria
- AC-016: The doc no longer states "in-memory queues"; it describes Postgres-backed jobs + worker.
- AC-017: The component map diagram reflects `jobs` table + worker.

## Functional Requirements
- FR-001: Add a `jobs` table to runtime DDL in `ensureSchema()` with:
  - `state` enum constraint: `queued | running | succeeded | failed`
  - unique constraint on `(type, job_key)`
  - index to efficiently find runnable jobs (`state`, `available_at`)
- FR-002: Implement `enqueueJob()` (idempotent by `(type, job_key)`).
- FR-003: Implement `claimNextJob()` using `FOR UPDATE SKIP LOCKED`.
- FR-004: Implement worker loop with:
  - handler map for job types
  - payload validation (Zod)
  - retries with exponential backoff, max attempts = 3
- FR-005: Convert ingest + quick-start run to use the new job system.
- FR-006: Add a worker entrypoint script and `pnpm worker` command.

## Non-Goals (Out of Scope)
- Full WDK durable orchestration and step graph execution.
- Priority queues, cancellation, dead-letter queues, cron scheduling.
- A generalized "step boundary" framework beyond the minimal job types needed today.
- Replacing runtime DDL with migrations (separate slice).

## Risks & Dependencies
- Risk: Dev inline worker could mask production requirements. Mitigation: doc + explicit `pnpm worker` script.
- Risk: Jobs table adds more runtime DDL; dev/prod DB roles must allow table creation for PoC.
- Dependency: Postgres availability for local dev (already required).

## Success Metrics
- Server restarts do not drop queued ingest/run work.
- Contributors can start a worker process deterministically (`pnpm worker`) when running outside dev.

## Open Questions
- Should we add a "stale running job" reaper (e.g. running too long) or leave it as-is for PoC?
- Do we want env-configurable retry limits/backoff for demo tuning?

## Sources
- `docs/98-tmp/oracle/oracle-arch-drift.md` (P1 recommendation: Postgres-backed jobs table + worker)
- `apps/web/lib/db.server.ts` (runtime DDL)
- `apps/web/lib/ingest/ingestQueue.server.ts`, `apps/web/lib/quickStartRunQueue.server.ts` (previous in-memory queues)

