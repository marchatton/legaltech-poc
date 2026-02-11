# Implementation Plan: Runtime Review Findings (Synthesis, 2026-02-11)

## context
Implement a single, complete plan that combines:
1. The full five-decision scope from `implementation-plan-runtime-review-2026-02-11.md`.
2. The deeper runtime-failure handling and regression detail from `implementation-plan-runtime-review-2026-02-11-codex.md`.

Target outcomes:
1. No stuck Quick Start runs from partial scheduling.
2. No cross-run inline drainer claims.
3. No unnecessary semantic embedding when vector corpus is empty.
4. Citations API remains internal/dev-only.
5. Pgvector setup is race-safe.
6. Ingest failures are understandable to non-technical users.

## Scope
In scope:
1. WDK scheduling/draining correctness in dev/demo and runtime reliability paths.
2. Retrieval semantic short-circuit and pgvector readiness hardening.
3. Citations API exposure hardening.
4. Ingest failure UX message mapping.
5. Targeted regression tests and verification commands.

Out of scope:
1. WDK architecture rewrite.
2. Question-set/content product changes.
3. Ingest limit threshold changes.

## Workstreams

### WS1 (P1): Atomic Quick Start Scheduling + Reconciliation
**Problem**
Quick Start question steps are scheduled one-by-one; mid-loop failure can leave partial steps while `runs.questions_total` is already full.

**Files**
1. `apps/web/workflows/quickStartTitleSurveyWorkflow.server.ts`
2. `apps/web/test/wdkStepQueue.int.test.ts`

**Changes**
1. Wrap question-step scheduling in a single transaction (all-or-nothing inserts).
2. Preserve deterministic `step_key` and idempotent conflict behavior.
3. Add reconciliation guard for missing Quick Start steps for a run and backfill missing rows in one transaction.
4. Log reconciliation event with `run_id`, `expected_steps`, `existing_steps`, `inserted_steps`, `trace_id`.

**Acceptance criteria**
1. Mid-scheduling failure cannot commit a partial step set.
2. A run with `questions_total = N` converges to exactly `N` Quick Start question steps.
3. Quick Start runs still complete after retries/restarts.

**Tests**
1. Extend `apps/web/test/wdkStepQueue.int.test.ts` to simulate insert failure and assert rollback.
2. Add reconciliation regression case with intentionally missing steps and assert recovery.

---

### WS2 (P1): Run-Scoped Inline Draining + Dev/Demo Quick Start Self-Progress
**Problem**
Inline draining can claim unrelated queued steps in shared `run_steps`. Quick Start in dev/demo may stall when no long-running worker is active.

**Files**
1. `apps/web/lib/wdk/wdkInlineKick.server.ts`
2. `apps/web/lib/ingest/ingestQueue.server.ts`
3. `apps/web/app/(api)/folders/[id]/runs/route.ts`
4. `apps/web/steps/quickStartStepHandlers.server.ts`
5. `apps/web/test/ingestCutoverFlag.test.ts`
6. `apps/web/test/foldersRunsRoute.wdk.int.test.ts`

**Changes**
1. Extend `kickInlineWdkWorker(...)` with optional `runId`.
2. Pass `runId` through to `drainWdkStepsOnce(...)` so claims are scoped when provided.
3. In ingest path, pass returned ingest `runId` into inline kick.
4. In Quick Start create-run route, trigger inline kick in `dev`/`demo-prod` using `quickStartStepHandlers` and the new run id.
5. Keep production behavior unchanged (no inline kick in prod posture).
6. Include log fields for inline kick/drain observability (`run_id`, `handler_count`).

**Acceptance criteria**
1. Ingest inline drain does not claim steps from other runs.
2. Quick Start steps are not failed with `STEP_TYPE_UNKNOWN` due to ingest drainer mismatch.
3. In `dev`/`demo-prod`, Quick Start progresses without requiring manual `worker` process.
4. In `prod`, inline kick remains disabled.

**Tests**
1. Update `apps/web/test/ingestCutoverFlag.test.ts` to assert `runId` is passed to `kickInlineWdkWorker`.
2. Add queue-isolation integration test (ingest run + quick-start run, ingest drain only processes ingest run).
3. Extend `apps/web/test/foldersRunsRoute.wdk.int.test.ts` to assert Quick Start self-progress behavior in allowed modes.

---

### WS3 (P1): Re-lock Citations API to Internal/Dev-Only
**Problem**
Current gating allows `FEATURE_CITATIONS_API=1` to bypass dev/demo protection.

**Files**
1. `apps/web/app/(api)/citations/[id]/route.ts`
2. `apps/web/lib/citations.routes.test.ts`

**Changes**
1. Apply `assertDevOrDemoProdApi(traceId, headers)` unconditionally at route entry.
2. Keep `FEATURE_CITATIONS_API` as behavior/data-source switch, not exposure switch.
3. Update tests that currently expect no dev gate when feature flag is enabled.

**Acceptance criteria**
1. In prod posture, route remains hidden (`NOT_FOUND` envelope) regardless of feature flag.
2. Dev/demo scenarios continue to support DB-first behavior with fixture fallback.

**Tests**
1. Update `apps/web/lib/citations.routes.test.ts` for gate-first behavior in prod posture.

---

### WS4 (P2): Skip Semantic Branch When `nVectors === 0`
**Problem**
Retrieval executes semantic branch setup/embedding path even when vector count is zero.

**Files**
1. `apps/web/lib/retrieval/hybridSearch.server.ts`
2. `apps/web/test/hybridSearchGoldenQuestions.smoke.int.test.ts` (or a new focused retrieval test)

**Changes**
1. After vector count, short-circuit when `nVectors === 0`.
2. Set `semanticDisabledReason = "NO_VECTORS"` and skip `runSemanticBranch(...)`.
3. Keep lexical fallback explicit (`effectiveLexWeight=1`, `effectiveSemWeight=0` when semantic disabled).
4. Preserve existing reasons and behavior for non-zero vectors.

**Acceptance criteria**
1. No embedding call is attempted when vector count is zero.
2. Lexical results still return.
3. Debug payload contains `semanticDisabledReason: "NO_VECTORS"`.

**Tests**
1. Add retrieval test seeded with lexical chunks and no embeddings.
2. Assert `NO_VECTORS` reason and lexical-only output.
3. If feasible, assert embedding helper is not called.

---

### WS5 (P2): Make Pgvector Setup Idempotent + Race-Safe
**Problem**
`CREATE EXTENSION vector;` can fail under concurrent setup and incorrectly mark pgvector disabled.

**Files**
1. `apps/web/lib/db/schema/retrieval.server.ts`
2. Add/adjust retrieval schema tests as needed

**Changes**
1. Use `CREATE EXTENSION IF NOT EXISTS vector;`.
2. In catch path, re-check extension presence before returning disabled.
3. Keep warning logs for real disablement only.

**Acceptance criteria**
1. Concurrent schema initialization does not produce false pgvector-disabled outcomes.
2. Environments without extension support still fail safe.

---

### WS6 (P3): Ingest Failure UX Message Mapping
**Problem**
Matter page surfaces raw `error_json`, which is hard for non-technical users.

**Files**
1. `apps/web/lib/ingestErrorMessage.ts` (new)
2. `apps/web/app/(app)/matters/[id]/page.tsx`
3. Optional: `apps/web/app/(api)/folders/[id]/documents/route.ts` (if response shaping needed)

**Changes**
1. Add ingest error mapper for:
   - `INGEST_TOO_MANY_PAGES`
   - `INGEST_PAGE_TEXT_TOO_LARGE`
   - `INGEST_TOTAL_TEXT_TOO_LARGE`
   - fallback for unknown codes
2. Render friendly primary message in document cards.
3. Preserve technical details (code/raw JSON) in secondary disclosure for operators.

**Acceptance criteria**
1. User can understand failure reason without reading raw JSON.
2. Debug-level details remain available.

**Tests**
1. Add unit tests for `ingestErrorMessage` mapping.
2. Add/adjust UI render tests for friendly + technical detail display.

## Execution Order
1. WS1 atomic scheduling + reconciliation.
2. WS2 run-scoped draining and dev/demo Quick Start self-progress.
3. WS3 citations gate hardening.
4. WS4 no-vectors semantic short-circuit.
5. WS5 pgvector idempotency/race hardening.
6. WS6 ingest error UX mapping.
7. Full verification pass.

## Verification Matrix
Targeted first:
1. `pnpm -C apps/web vitest run test/wdkStepQueue.int.test.ts`
2. `pnpm -C apps/web vitest run test/ingestCutoverFlag.test.ts`
3. `pnpm -C apps/web vitest run test/foldersRunsRoute.wdk.int.test.ts`
4. `pnpm -C apps/web vitest run lib/citations.routes.test.ts`
5. `pnpm -C apps/web vitest run test/hybridSearchGoldenQuestions.smoke.int.test.ts`
6. Any new focused retrieval/schema/UI tests added by this work.

Full suite:
1. `pnpm verify`

## Rollout and Observability
Monitor for at least 24h post-deploy:
1. No growing pool of Quick Start runs stuck in `running` with stale updates.
2. No `STEP_TYPE_UNKNOWN` for `quick_start_title_survey.write_row_v0`.
3. Expected increase in `semanticDisabledReason=NO_VECTORS` and fewer avoidable semantic-embed failures in empty-vector environments.
4. Citations route remains not-found in prod posture.

## Risks and Mitigations
1. Risk: transaction wrapper adds scheduling latency.
   Mitigation: bounded inserts by question-set size; keep SQL minimal.
2. Risk: scoped draining changes behavior for callers that omit `runId`.
   Mitigation: keep `runId` optional and preserve current behavior when absent.
3. Risk: new disabled reason impacts strict parsers.
   Mitigation: keep reason additive; verify consumers handle unknown values.
4. Risk: UI mapper drifts from backend error codes.
   Mitigation: centralize mapping helper with unit coverage.

## Rollback Plan
1. Revert WS1 transaction/reconciliation changes.
2. Revert WS2 `runId` wiring and Quick Start inline kick call site.
3. Revert WS3 citations gate placement.
4. Revert WS4 no-vector short-circuit.
5. Revert WS5 pgvector DDL/catch behavior.
6. Revert WS6 UI mapper and page rendering changes.

## Definition of Done
1. All six workstreams implemented.
2. Targeted regression tests pass.
3. `pnpm verify` passes.
4. No regressions in Quick Start idempotency, ingest cutover flow, citations dev/demo behavior, or retrieval lexical fallback.
