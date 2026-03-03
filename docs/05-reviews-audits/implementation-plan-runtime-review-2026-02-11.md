# Implementation Plan: Runtime Review Findings (2026-02-11)

## Scope
This plan addresses the high/medium-risk findings from the 16-hour code review window (`HEAD~29..HEAD`), using the confirmed decisions:

1. Skip semantic embedding when there are zero vectors.
2. Make pgvector extension setup idempotent and race-safe.
3. Keep fail-fast ingest limits, but surface clear user-facing error messages in UI.
4. Auto-kick Quick Start processing in dev/demo environments.
5. Keep citations API internal/dev-only for now.

## Objectives
- Prevent Quick Start runs from stalling in dev/demo when no long-running worker is active.
- Prevent accidental public exposure of citations API behavior.
- Reduce retrieval cost/latency when semantic search cannot produce results.
- Remove false-negative pgvector readiness outcomes under concurrent schema setup.
- Improve non-technical UX for ingest failures while preserving fail-fast safety.

## Non-goals
- No change to prod security model beyond preserving existing dev/demo gating.
- No broad refactor of workflow architecture.
- No behavior change to ingest thresholds themselves.

## Workstreams

### WS1: Quick Start self-progress in dev/demo
**Files**
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
- `apps/web/lib/wdk/wdkInlineKick.server.ts`
- `apps/web/steps/quickStartStepHandlers.server.ts`
- `apps/web/lib/wdk/wdkWorker.server.ts` (reuse existing `runId` support)

**Changes**
1. After `startQuickStartTitleSurveyWorkflow(...)`, trigger an inline WDK kick in allowed environments.
2. Extend `kickInlineWdkWorker(...)` to accept optional `runId`.
3. Pass `runId` to `drainWdkStepsOnce(...)` so inline draining is scoped to the new run (avoid draining unrelated queued work).
4. Use handlers that include Quick Start step handlers (`quickStartStepHandlers`).
5. Keep behavior no-op in production (preserve current guardrails).

**Acceptance criteria**
- In `dev`/`demo-prod`, starting Quick Start begins consuming steps without requiring `pnpm --filter @legaltech-poc/web worker`.
- In `prod`, inline kick remains disabled.
- Idempotency behavior remains unchanged.

---

### WS2: Re-lock citations API to internal/dev-only surface
**Files**
- `apps/web/app/(api)/citations/[id]/route.ts`
- `apps/web/lib/citations.routes.test.ts`

**Changes**
1. Apply `assertDevOrDemoProdApi(traceId, headers)` unconditionally at route entry.
2. Keep `FEATURE_CITATIONS_API` as behavior flag (DB-first vs fixture behavior), not exposure flag.
3. Update tests that currently assert “no dev gate when feature flag=1”.

**Acceptance criteria**
- In prod posture, route returns not-found style envelope regardless of `FEATURE_CITATIONS_API`.
- Existing dev/demo use cases continue working.

---

### WS3: Short-circuit semantic branch when `nVectors === 0`
**Files**
- `apps/web/lib/retrieval/hybridSearch.server.ts`
- Add/adjust tests in retrieval test suite (unit/integration as appropriate)

**Changes**
1. In `hybridSearchInternal`, after vector count, branch:
   - If `nVectors === 0`, set `semanticDisabledReason = "NO_VECTORS"` and skip `runSemanticBranch`.
   - Else continue current semantic path.
2. Preserve lexical results and debug payload fields.

**Acceptance criteria**
- No embedding call when vector count is zero.
- Retrieval still returns lexical matches.
- Debug payload reports `semanticDisabledReason: "NO_VECTORS"` where applicable.

---

### WS4: Make pgvector setup race-safe and idempotent
**Files**
- `apps/web/lib/db/schema/retrieval.server.ts`
- Add/adjust schema test coverage if needed

**Changes**
1. Change `CREATE EXTENSION vector;` to `CREATE EXTENSION IF NOT EXISTS vector;`.
2. In the catch path, re-check extension existence before returning `false`.
3. Keep explicit warning logs only for real disablement conditions.

**Acceptance criteria**
- Concurrent schema calls do not produce false “pgvector disabled” outcomes.
- Extension enablement remains safe in environments without extension support.

---

### WS5: Surface ingest failure reason in UI (non-technical wording)
**Files**
- `apps/web/lib/ingestErrorMessage.ts` (new)
- `apps/web/app/(app)/matters/[id]/page.tsx`
- Optional: `apps/web/app/(api)/folders/[id]/documents/route.ts` (if response shaping is needed)

**Changes**
1. Introduce a small mapper for ingest `error_json`:
   - `INGEST_TOO_MANY_PAGES`
   - `INGEST_PAGE_TEXT_TOO_LARGE`
   - `INGEST_TOTAL_TEXT_TOO_LARGE`
   - fallback for unknown ingest codes
2. Render friendly message in document cards instead of raw JSON blob as primary text.
3. Preserve technical detail in secondary line (small text / collapsible) for operators.

**Suggested user copy (initial)**
- `INGEST_TOO_MANY_PAGES`: "This file is too long to process right now. Please split it into smaller PDFs."
- `INGEST_PAGE_TEXT_TOO_LARGE`: "One page contains too much extracted text to process safely. Try a cleaner PDF export."
- `INGEST_TOTAL_TEXT_TOO_LARGE`: "This file contains too much total text to process safely. Split it into smaller documents."

**Acceptance criteria**
- Non-technical user can understand why ingest failed without reading raw JSON.
- Error code remains available for debugging.

## Execution order
1. WS3 (`NO_VECTORS`) and WS4 (pgvector idempotency)  
2. WS2 (citations route gating)  
3. WS1 (Quick Start inline kick in dev/demo)  
4. WS5 (ingest error UX)  
5. Verification pass

## Verification plan

### Targeted tests first
- `pnpm --filter @legaltech-poc/web test -- lib/citations.routes.test.ts`
- `pnpm --filter @legaltech-poc/web test -- test/foldersRunsRoute.wdk.int.test.ts`
- Retrieval tests covering hybrid behavior:
  - `pnpm --filter @legaltech-poc/web test -- test/hybridSearchGoldenQuestions.smoke.int.test.ts`
  - plus a focused test for `NO_VECTORS` behavior
- Ingest UI/message tests (new test file for mapper + render behavior)

### Full verification
- `pnpm verify`

## Risks and mitigations
- **Risk:** Inline WDK kick drains unrelated queued steps.  
  **Mitigation:** Scope by `runId` in inline kick path.

- **Risk:** Tightening citations gating could break test assumptions.  
  **Mitigation:** Update route tests to assert new gate behavior explicitly for prod posture.

- **Risk:** UI message mapping drifts from backend codes.  
  **Mitigation:** Centralize code-to-message mapping in one helper + unit tests.

## Rollback plan
- All changes are isolated and reversible by file-level rollback:
  - Remove inline kick call and new `runId` parameter wiring.
  - Restore previous citations gate condition.
  - Restore previous semantic branch flow.
  - Restore previous pgvector DDL statement.
  - Revert UI message mapping helper and render logic.

## Done definition
- All five decisions implemented.
- Targeted tests pass for each workstream.
- `pnpm verify` passes.
- No regression in Quick Start idempotency, run progress API, or citations fixture fallback behavior in dev/demo.
