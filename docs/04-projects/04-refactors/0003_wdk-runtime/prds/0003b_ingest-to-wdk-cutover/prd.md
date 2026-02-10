# PRD: Ingest Cutover to WDK (Feature-Flagged) + Retire Ingest Jobs (0003b)

Owner: marc  
Status: Draft  
Date: 2026-02-10  
Slug: ingest-to-wdk-cutover

## Introduction / Overview

### Problem
Even after WDK runtime exists (0003a), the repo still uses the legacy durable jobs runtime for document ingest (`jobs(type=ingest_document)` calling `processDocumentIngest`). That keeps two durable runtimes alive, increases drift risk, and makes it unclear where long-running side effects belong.

### Goal
Move **document ingest execution** to a WDK workflow/step implementation, and stop creating new ingest jobs. Do this behind a short-lived feature flag for rollback safety.

### Primary Observable Effect
- When the cutover flag is ON, uploading a PDF results in ingest being executed by WDK (and no new `jobs(type=ingest_document)` rows are created).
- When the flag is OFF, ingest continues to work via the existing jobs runtime.

Important boundary:
- Quick Start run execution cutover is handled by `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`, not here.

## Goals
- WDK owns document ingest execution when the flag is enabled.
- The ingest workflow uses explicit step boundaries (`"use step"`) and is safe to retry without duplicating durable side effects.
- Dev UX is preserved (optional inline kick is acceptable, but must be WDK-based).
- The jobs runtime is no longer used for ingest once the flag is rolled forward and legacy path is deleted.

## Non-goals (explicit cuts)
- Do not change PDF extraction behavior (still `pdfjs-dist` text extraction; no OCR/geometry in this slice).
- Do not change storage backend (`tmp/object-store` remains).
- Do not change folder/document state taxonomy.

## Users
- User (PoC/demo): uploads PDFs and expects ingest to complete durably across server restarts.
- Developer: wants one durable runtime posture for side effects.

## User Stories

### US-001: Feature-flagged ingest uses WDK workflow execution
As a developer, I want ingest to be runnable via WDK behind a flag so we can cut over safely and roll back quickly if needed.

#### Acceptance Criteria
- AC-001: Introduce a single ingest cutover flag (env-based).
  - Example: when `FEATURE_WDK_INGEST=1`, uploads start WDK ingest workflow.
  - Negative: when the flag is unset/0, uploads do not start WDK ingest workflow.
- AC-002: When the flag is ON, the upload/ingest route does not enqueue `jobs(type=ingest_document)`.
  - Example: querying `jobs` after an upload shows no new ingest job row.
  - Negative: legacy enqueue is not called as a fallback when WDK is enabled.
- AC-003: When the flag is OFF, ingest continues to work via legacy jobs enqueue.
  - Example: existing behavior remains unchanged and ingest completes.
  - Negative: the flag OFF path does not require a WDK worker running.

#### Verification
- Automated: unit test that toggles the flag and asserts the chosen enqueue path.
- Manual: upload with flag ON and OFF.

### US-002: WDK ingest step is idempotent at the step boundary
As an operator, I want step retries to not duplicate durable writes so that worker restarts do not corrupt state.

#### Acceptance Criteria
- AC-004: WDK ingest workflow schedules a deterministic `step_key` per document ingest execution.
  - Example: a restart does not schedule duplicate ingest steps for the same document.
  - Negative: retries do not create additional `document_pages` duplicates (should remain unique per `(document_id, page_number)`).
- AC-005: Step retries do not create duplicate chunks/pages beyond existing uniqueness constraints.
  - Example: retries either short-circuit or overwrite safely without multiplying data.
  - Negative: repeated retries do not leave the document in a permanently inconsistent state.

#### Verification
- Manual: start ingest, kill worker mid-step, restart worker, confirm completion and stable row counts.

### US-003: Legacy ingest jobs path is deletable after rollout
As a contributor, I want the legacy ingest jobs path to be explicitly removable once the flag is rolled forward so the repo does not accumulate “temporary” dual runtimes.

#### Acceptance Criteria
- AC-006: Provide a clear “roll forward” checklist and then delete the legacy ingest job enqueue + handler path.
  - Example: once enabled by default, `jobs(type=ingest_document)` is no longer referenced anywhere.
  - Negative: there is no silent fallback that reintroduces the jobs runtime for ingest.

#### Verification
- Automated: grep-based test or type-level assertion that legacy ingest enqueue is not imported when flag default is ON (implementation-specific).

## Functional Requirements
- FR-001: Add `FEATURE_WDK_INGEST` (or equivalent) as a single cutover flag.
- FR-002: Implement `ingest_document` workflow type in WDK registry.
- FR-003: Implement an ingest step that can initially call existing `processDocumentIngest(documentId)` (thin integration), while running under WDK execution semantics.
- FR-004: Update the upload/ingest route to create an `ingest_document` run row and start WDK ingest workflow with input `{ run_id }` when the flag is enabled.
- FR-005: Preserve/replace dev inline execution kick with a WDK-compatible mechanism (if needed).

## Failure States + UX
- If WDK worker is not running and flag is ON, ingest will not progress. This is acceptable for PoC, but must be observable:
  - logs show workflow started
  - document state remains in “queued/parsing” state rather than silently succeeding

## Metrics / Logging
- Log `document.ingest.started` with `orchestration: "wdk" | "jobs"`.
- Log ingest step completion/failure with `{ document_id, step_key, attempt }`.

## Rollback / Disable Path
- Rollback: set `FEATURE_WDK_INGEST=0` to revert to legacy jobs ingest enqueue.
- Important: rollback must not require DB schema rollback (schema changes should be additive/compatible).

## Quality Gates
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`
- `pnpm verify`

## Verification Plan
Automated:
- unit tests verifying flag switching between jobs and WDK enqueue paths

Manual smoke:
1. `FEATURE_WDK_INGEST=1 pnpm dev`
2. `pnpm --filter @orbital-poc/web worker`
3. Upload a PDF; confirm ingest completes and no ingest job row is created
4. Kill worker mid-ingest; restart; confirm completion without duplicate durable writes
5. `FEATURE_WDK_INGEST=0` and confirm legacy ingest path still works without WDK worker

## Open Questions
- None (resolved 2026-02-10): ingest uses `runs` + `run_steps` with `runs.type=ingest_document` (no parallel WDK-run tables).

## Sources
- `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
- `docs/03-architecture/07_current_poc_runtime.md`
- `apps/web/lib/ingest/ingestProcessor.server.ts`
- `apps/web/lib/jobs/jobWorker.server.ts`
