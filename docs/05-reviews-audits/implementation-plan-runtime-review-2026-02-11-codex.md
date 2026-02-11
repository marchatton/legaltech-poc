# Detailed Implementation Plan Runtime Review (2026-02-11, Codex)

## 1. Goal
Address three runtime reliability/performance issues identified on 2026-02-11:
1. Quick Start workflow step scheduling is not atomic and can leave runs stuck.
2. Dev inline ingest draining can claim unrelated Quick Start steps and fail them as unknown types.
3. Hybrid retrieval performs semantic embedding work even when no vectors exist.

Target outcome: no stuck Quick Start runs from partial scheduling, no cross-run step theft by inline ingest drains, and no unnecessary embedding calls when semantic corpus size is zero.

## 2. Scope
In scope:
1. Queue scheduling and draining behavior in WDK runtime paths.
2. Hybrid retrieval semantic enable/disable branching.
3. Regression tests for each fix.
4. Runtime logging updates required for observability.

Out of scope:
1. Re-architecture of `run_steps` table or worker model.
2. Product behavior changes in question set content or answer generation.
3. New retrieval ranking algorithms.

## 3. Primary Files
1. `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`
2. `apps/web/lib/ingest/ingestQueue.server.ts`
3. `apps/web/lib/wdk/wdkInlineKick.server.ts`
4. `apps/web/lib/retrieval/hybridSearch.server.ts`
5. `apps/web/test/wdkStepQueue.int.test.ts`
6. `apps/web/test/ingestCutoverFlag.test.ts`
7. `apps/web/test/hybridSearchGoldenQuestions.smoke.int.test.ts` or a new targeted retrieval test file

## 4. Workstream A (P1): Atomic Quick Start Step Scheduling

### 4.1 Problem Statement
`startQuickStartTitleSurveyWorkflow()` currently loops over questions and calls `scheduleStep()` one-by-one. If an insertion fails mid-loop, only a subset of question steps exists while `runs.questions_total` already reflects full question count.

### 4.2 Implementation Changes
1. Wrap question-step scheduling in a single database transaction in `startQuickStartTitleSurveyWorkflow()`.
2. Use transaction-scoped SQL client (`sql.begin(...)`) so all step inserts succeed or all roll back.
3. Keep deterministic `step_key` behavior unchanged to preserve idempotency.
4. Add reconciliation guard: after scheduling attempt (or at worker preflight), verify queued+terminal quick-start step count for the run matches expected question count; if low, backfill missing steps in one transaction.
5. Add structured log event when reconciliation performs backfill:
   - `event`: `wdk.quick_start.reconciled`
   - fields: `run_id`, `expected_steps`, `existing_steps`, `inserted_steps`, `trace_id`.

### 4.3 Acceptance Criteria
1. A transient failure during scheduling cannot leave partial step sets committed.
2. For a run with `questions_total = N`, the system converges to exactly `N` quick-start question steps.
3. Quick Start runs can still complete (`questions_done >= questions_total`) after retries/restarts.

### 4.4 Test Plan
1. Add/extend integration test in `apps/web/test/wdkStepQueue.int.test.ts`:
   - simulate mid-scheduling failure (mock/stub failure on one step insert),
   - assert no partial question-step set is committed if transaction fails.
2. Add reconciliation regression test:
   - seed run with intentionally missing quick-start steps,
   - execute reconciliation path,
   - assert missing steps are backfilled and run can reach `completed`.

## 5. Workstream B (P2): Prevent Inline Ingest Drainer Cross-Run Claims

### 5.1 Problem Statement
`startDocumentIngest()` triggers `kickInlineWdkWorker({ handlers: wdkSmokeStepHandlers })` in development. That drainer claims from shared `run_steps` without run scoping. If it claims Quick Start steps, missing handlers cause `STEP_TYPE_UNKNOWN` failures.

### 5.2 Implementation Changes
1. Add optional `runId` parameter to `kickInlineWdkWorker()` in `wdkInlineKick.server.ts`.
2. Pass `runId` into `drainWdkStepsOnce()` so claim query is scoped when provided.
3. In `startDocumentIngest()` (`ingestQueue.server.ts`), pass the returned ingest `runId` to inline kick.
4. Keep handler map behavior unchanged for ingest-only drain path; this fix should isolate queue claiming by run rather than broadening handler coverage.
5. Add inline drain log fields:
   - `run_id` (nullable),
   - `handler_count`.

### 5.3 Acceptance Criteria
1. Inline ingest drain does not claim steps from runs other than the ingest run when `runId` is supplied.
2. Quick Start steps are never failed with `STEP_TYPE_UNKNOWN` due to ingest inline drain.
3. Existing ingest cutover behavior remains unchanged (still starts WDK ingest workflow).

### 5.4 Test Plan
1. Update `apps/web/test/ingestCutoverFlag.test.ts`:
   - assert `kickInlineWdkWorker` receives `runId` from `startIngestDocumentWorkflow`.
2. Add queue isolation regression test (integration):
   - create one ingest run and one quick-start run with queued steps,
   - trigger inline drain with ingest `runId`,
   - assert only ingest step(s) are claimed/processed.
3. Verify no `STEP_TYPE_UNKNOWN` for quick-start step types in this scenario.

## 6. Workstream C (P2): Skip Semantic Branch When `nVectors === 0`

### 6.1 Problem Statement
`hybridSearchInternal()` currently proceeds into semantic branch setup and can eventually attempt embedding even when folder/index has zero vectors, adding avoidable cost and warning noise.

### 6.2 Implementation Changes
1. In `hybridSearch.server.ts`, after `countVectors(...)`, add early short-circuit:
   - if `nVectors === 0`, set `semanticDisabledReason = "NO_VECTORS"`, skip `runSemanticBranch()`.
2. Ensure lexical-only fallback remains explicit:
   - `effectiveLexWeight = 1`, `effectiveSemWeight = 0` when semantic disabled.
3. Preserve current behavior for non-zero vectors and existing disabled reasons (`KSEM_ZERO`, `PGVECTOR_DISABLED`, `EMBEDDING_COLUMN_MISSING`, etc.).
4. Ensure debug/log output includes `NO_VECTORS` so incidents are diagnosable without warnings.

### 6.3 Acceptance Criteria
1. No embedding request is attempted when vector count is zero.
2. Search still returns lexical results.
3. Debug payload reports `semanticEnabled = false` and `semanticDisabledReason = "NO_VECTORS"`.

### 6.4 Test Plan
1. Add targeted retrieval test (new or existing test file):
   - seed lexical chunks with no embeddings,
   - run `hybridSearchWithDebug()` with `kSem > 0`,
   - assert `semanticDisabledReason === "NO_VECTORS"`.
2. If mocking is practical, assert `embed(...)` is not called in this path.

## 7. Implementation Sequence
1. Workstream A (atomic scheduling + reconciliation): highest user-facing correctness risk.
2. Workstream B (inline drain run scoping): prevents cross-run queue corruption in dev workflows.
3. Workstream C (no-vector short-circuit): performance/noise improvement with low coupling.
4. Final pass: run targeted tests and produce rollout notes.

## 8. Verification Matrix
1. Quick Start scheduling:
   - run targeted WDK queue tests,
   - assert run-state convergence and correct step counts.
2. Inline ingest isolation:
   - run ingest cutover/unit tests,
   - run integration test proving run-scoped claims.
3. Retrieval no-vector behavior:
   - run hybrid retrieval targeted test,
   - verify `NO_VECTORS` debug reason and lexical results.

Suggested commands (exact test names may vary after test additions):
1. `pnpm -C apps/web vitest run test/wdkStepQueue.int.test.ts`
2. `pnpm -C apps/web vitest run test/ingestCutoverFlag.test.ts`
3. `pnpm -C apps/web vitest run test/hybridSearchGoldenQuestions.smoke.int.test.ts`

## 9. Rollout and Safety
1. Deploy with enhanced logs enabled.
2. Monitor for 24h:
   - no new stuck Quick Start runs (`state=running` with stale `updated_at` and `questions_done < questions_total`),
   - no `STEP_TYPE_UNKNOWN` on `quick_start_title_survey.write_row_v0`,
   - reduced `retrieval.semantic_embed_failed` frequency for empty-vector environments.
3. Rollback strategy:
   - code rollback only; no schema migration required.

## 10. Risks and Mitigations
1. Risk: transaction wrapper changes scheduling latency.
   Mitigation: keep inserts lightweight and bounded by question-set size.
2. Risk: adding `runId` scoping changes inline drain behavior in edge paths.
   Mitigation: keep `runId` optional and default to current behavior when absent.
3. Risk: new semantic disabled reason impacts strict enum consumers.
   Mitigation: treat reason as additive; confirm any consumer parses unknown reasons safely.

## 11. Definition of Done
1. All three workstreams implemented and merged.
2. Regression tests added and passing.
3. Logs/metrics confirm no recurrence of the identified failure modes.
4. This document remains the source implementation plan for the 2026-02-11 runtime review fixes.
