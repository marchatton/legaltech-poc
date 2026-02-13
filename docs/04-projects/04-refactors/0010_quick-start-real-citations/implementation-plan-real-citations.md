# Implementation Plan: Quick Start Real Row-Level Citations

Date: 2026-02-13
Status: Ready to implement

## Enhancement Summary

Deepened on: 2026-02-13
Sections enhanced: 11
Research/review passes used: `architecture-strategist`, `data-integrity-guardian`, `performance-oracle`, `security-sentinel`, `code-simplicity-reviewer`, `spec-flow-analyzer`, `kieran-typescript-reviewer`, `pattern-recognition-specialist`, `framework-docs-researcher`, `best-practices-researcher`, `deployment-verification-agent`, `git-history-analyzer`

### Key improvements
1. Added explicit lockable-anchor contract and no-evidence reason-code precedence.
2. Added transaction-safe idempotency pattern (`ON CONFLICT` claim + early short-circuit before retrieval/draft work).
3. Added boundary/security requirements for prompt injection resistance, retrieval scoping, and safe error surfaces.
4. Added deploy verification signals and rollback triggers for direct replacement blast radius.
5. Added historical implementation/test parallels from recent Quick Start and report-row commits.

### New considerations discovered
- Exactly-once execution is not guaranteed; implementation must be idempotent under at-least-once retries.
- `question` and retrieval chunks are untrusted input and must be treated as data, not instructions.
- Reason-code consistency is a contract across step output, API/UI diagnostics, and export/reporting.

Locked decisions for this plan:
- `1a` keep one step now (`quick_start_title_survey.write_row_v0`) and implement internal phases
- `2a` no-evidence outcomes are `missing_input`
- `3a` strict anchor policy (no page fallback for unresolved anchors)
- `4a` lock top-1 citation per row
- `5b` direct replacement (no feature flag)

## Target Outcome

Replace placeholder Quick Start row writes with real `retrieve -> draft -> lock` behavior so rows with evidence get valid locked `citation_ids`, and no-evidence rows are `missing_input` with canonical answer text plus explicit reason codes.

## Architecture + Data Flow (per question)

1. Validate step input (`question_id`, optional `trace_id`) and fail safely on schema errors.
2. Load run + question context in `quick_start_title_survey.write_row_v0` and assert run ownership/scope.
3. Perform early idempotent row-claim/short-circuit before retrieval/model calls.
4. Check document readiness (`upload_completed_at`, `parse_status='parsed'`, `ocr_status='done'`).
5. Retrieve evidence using `hybridSearch` with pinned `runs.index_version` and `queryText=question`.
6. Scope retrieval strictly to run/folder documents; reject out-of-scope chunks.
7. Hydrate retrieved chunks (`id`, `document_id`, `page_start`, `page_end`, `text`) preserving rank.
8. Apply strict anchor gating; only lockable chunks proceed.
9. Draft answer from hydrated evidence only; unsupported answers become exact `Not found in provided documents.`.
10. Lock exactly one citation (top-1) with `document_id`, `page_number`, `snippet`, `snippet_hash`, and optional `polygons_json`.
11. Persist row + citation in one transaction, then update run progress idempotently.
12. Emit structured step output with deterministic reason codes and stage timings.

### Research Insights

**Best practices**
- Keep route handlers thin and push business logic to server-side modules; keep contracts explicit and typed.
- Treat retries as normal and design for idempotency (`unique key + upsert/conflict handling`).
- Keep retrieval and drafting strictly evidence-bound for grounded outputs.

**Performance considerations**
- Do row existence short-circuit before retrieval/draft work.
- Hydrate top-K chunks lazily (for example K=3) instead of full candidate hydration.
- Capture retrieval latency, hydration count, and draft duration metrics.

**Implementation details**

```sql
-- Row-claim pattern to prevent duplicate writes under retries/concurrency
INSERT INTO report_rows (run_id, question_id, ...)
VALUES ($1, $2, ...)
ON CONFLICT (run_id, question_id) DO NOTHING
RETURNING id;
```

- If no row is returned from claim insert, load existing row and skip retrieval/draft path.
- Keep external side effects out of the row/citation transaction block.

**Edge cases**
- Concurrent retries for same `(run_id, question_id)`.
- Retrieval returns chunks but all anchors invalid.
- Draft fails after retrieval success.
- Run-progress update fails after row/citation commit.

**References**
- https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- https://www.postgresql.org/docs/current/sql-insert.html
- https://www.postgresql.org/docs/current/explicit-locking.html
- https://docs.stripe.com/api/idempotent_requests
- https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/

## Row Status + Reason Code Policy

### No-evidence rows (`missing_input`)
- `status = 'missing_input'`
- `answer = 'Not found in provided documents.'` (exact string)
- `citation_ids = []`
- `provenance_json.reason_code` required and enum-constrained

Canonical no-evidence reason codes:
- `NO_EVIDENCE_NO_READY_DOCUMENTS`
- `NO_EVIDENCE_RETRIEVAL_EMPTY`
- `NO_EVIDENCE_ANCHOR_UNRESOLVED`
- `NO_EVIDENCE_DRAFT_UNSUPPORTED`

Reason-code precedence (deterministic):
1. `NO_EVIDENCE_NO_READY_DOCUMENTS`
2. `NO_EVIDENCE_RETRIEVAL_EMPTY`
3. `NO_EVIDENCE_ANCHOR_UNRESOLVED`
4. `NO_EVIDENCE_DRAFT_UNSUPPORTED`

### System/validation failures (`citation_failed`)
- Keep fail-closed posture for unexpected failures.
- Use safe reason codes only (for example `VALIDATION_ERROR`, `ROW_WRITE_FAILED`, `PROGRESS_UPDATE_FAILED`).
- Never surface stack traces, provider payloads, or raw upstream messages to user-facing fields.

### Research Insights

**Best practices**
- Keep reason codes short, machine-readable, and stable across services.
- Use a closed enum/union type and validate at the boundary (Zod + runtime checks).

**Implementation details**
- Add a single source-of-truth type for reason codes used by step output, report rows, UI diagnostics, and tests.
- Add a mapping table in docs/spec copy for user-safe text per reason code.

**Edge cases**
- New branch added without reason code assignment.
- Reason code mismatch between step output and persisted row.

**References**
- https://zod.dev/

## Exact Touchpoints / Files

| File | Planned change |
| --- | --- |
| `apps/web/steps/quickStartWriteRowV0.step.server.ts` | Replace placeholder row logic with internal retrieve/draft/lock pipeline, strict anchor gating, top-1 citation lock, explicit missing-input reason codes, early idempotent short-circuit, typed row outcome unions. |
| `apps/web/lib/retrieval/hybridSearch.server.ts` | Reuse retrieval contract; enforce run/folder scoping and keep rank fidelity. |
| `apps/web/app/(api)/folders/[id]/chat/route.ts` | Reuse grounded drafting prompt pattern; treat question/chunk content as untrusted input. |
| `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | Surface missing-input reason codes with user-safe copy in diagnostics drawer. |
| `apps/web/test/reportRowsFromStepOutputs.int.test.ts` | Replace stale placeholder expectation (`Unable to produce citations.`) with canonical grounded/missing-input behavior. |
| `apps/web/test/foldersRunsRoute.wdk.int.test.ts` | Extend idempotency assertions to prove retries do not duplicate rows/citations. |
| `apps/web/test/realDataWorkflows.e2e.int.test.ts` | Assert evidence-backed `citation_ids`, correct PDF/page open, and canonical missing-input reason codes. |
| `docs/03-architecture/07_current_poc_runtime.md` | Remove/adjust statement that Quick Start only writes placeholders. |
| `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md` | Add user-safe copy for no-evidence/system reason codes. |

### Route + Workflow Contracts

- Keep `quick_start_title_survey.write_row_v0` as the single source of truth for row materialization.
- Do not change external workflow/route contracts in this rollout.
- Keep deterministic `step_key` semantics and existing queue orchestration behavior.

## Rollout Phases (direct replacement)

1. Preflight contracts: reason-code enum, anchor contract, and row-claim idempotency behavior.
2. Implement step internals: retrieve + strict anchor validation + top-1 locking + canonical missing-input fallback.
3. Wire diagnostics/tests/docs: drawer copy, integration/idempotency/e2e updates, runtime architecture docs.
4. Verify + ship: targeted tests, full verify, monitored deploy, rollback readiness.

## Idempotency Requirements (must preserve)

- Keep deterministic `step_key` behavior.
- Preserve `UNIQUE (run_id, question_id)` insertion guard.
- Perform row-claim short-circuit before retrieval/draft calls.
- Insert citation only after row insert succeeds, in same transaction.
- Keep progress updates idempotent and resilient to retry replay.
- Assume at-least-once execution and guarantee duplicate-safe outcomes.

### Research Insights

**Best practices**
- Prefer request/job idempotency keys and deterministic conflict handling.
- Keep transaction scopes small and side-effect free.

**Implementation details**
- Use `INSERT ... ON CONFLICT ... RETURNING` claim pattern for row ownership under concurrency.
- If transaction commits but post-commit emit/update fails, retries must detect existing row and avoid duplicate citation writes.

**Edge cases**
- Two workers race same `(run_id, question_id)`.
- Retry lands between row insert and citation insert.
- Retry lands after commit but before step output emit.

**References**
- https://www.postgresql.org/docs/current/sql-insert.html
- https://docs.stripe.com/api/idempotent_requests
- https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/

## Fail-Closed Requirements (must preserve)

- Never lock a citation when anchor page is unresolved.
- Never output `needs_review` without at least one locked citation.
- Keep canonical missing-input answer invariant.
- Keep export gating behavior unchanged (`citation_failed` blocks by default).
- Treat retrieval/question text as untrusted input; enforce prompt-injection-resistant grounding template.
- Keep user-facing errors safe and non-leaky.

### Research Insights

**Security considerations**
- Validate and normalize question/chunk inputs at boundaries.
- Ensure retrieval cannot cross run/folder trust boundaries.
- Apply LLM prompt-injection controls in drafting instructions.

**References**
- https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- https://genai.owasp.org/llm-top-10/

## Test Plan

### Integration tests
- Evidence exists -> row `needs_review`, `citation_ids.length === 1`, citation resolves via `/citations/:id`.
- No ready docs -> `missing_input`, exact canonical answer, reason code `NO_EVIDENCE_NO_READY_DOCUMENTS`.
- Retrieval empty -> `missing_input`, reason code `NO_EVIDENCE_RETRIEVAL_EMPTY`.
- Anchor unresolved -> `missing_input`, reason code `NO_EVIDENCE_ANCHOR_UNRESOLVED`.
- Draft unsupported -> `missing_input`, reason code `NO_EVIDENCE_DRAFT_UNSUPPORTED`.
- Forced validation/transaction failure -> `citation_failed` with safe reason code.

### Idempotency/concurrency tests
- Re-run/retry same step -> one `report_rows` row per `(run_id, question_id)` and at most one locked citation.
- Parallel retries for same question -> deterministic single row + single citation.
- Retry after partial failure -> no duplicate citation insert.

### E2E/UI checks
- Evidence chip opens correct PDF + page.
- Drawer surfaces explicit reason codes for no-evidence rows.
- No row shows placeholder `Unable to produce citations.` after rollout.

### Commands

```bash
pnpm --filter @orbital-poc/web test -- test/reportRowsFromStepOutputs.int.test.ts
pnpm --filter @orbital-poc/web test -- test/foldersRunsRoute.wdk.int.test.ts
pnpm --filter @orbital-poc/web test -- test/realDataWorkflows.e2e.int.test.ts
pnpm verify
```

## Deployment Verification (direct replacement)

### Pre-deploy checks
- Capture baseline counts by Quick Start status and citation presence.
- Confirm no existing rows violate canonical missing-input answer invariant.

### Post-deploy checks
- `needs_review` rows have exactly one locked citation when evidence exists.
- `missing_input` rows always carry canonical answer + reason code.
- `citation_failed` remains export-blocking.

### Monitoring signals (first 24h)
- Rate of `citation_failed` rows.
- Distribution drift of no-evidence reason codes.
- Retrieval latency and draft failure rates.

### Rollback triggers
- Duplicate row/citation writes under retries.
- Missing reason codes or non-canonical missing-input answers.
- Evidence-present cases yielding empty citations at elevated rate.

## Risks and Mitigations

- Model/gateway failures: preserve safe terminal row outputs and never emit fake citations.
- Retrieval misses on real docs: capture retrieval provenance + reason code for deterministic debugging/tuning.
- Geometry gaps in current ingest: lock doc/page/snippet/hash now; keep viewer and export fail-closed where geometry is required.
- Direct replacement blast radius: run targeted + full verify before merge and keep rollback simple (single step file plus test/doc deltas).
- Concurrency edge cases: enforce row-claim idempotency and prove with parallel retry tests.

## Historical Parallels (git history)

Recent commits in this area confirm the direction of this plan:
- `87ac7b5 fix(report): materialize rows from run step outputs`
- `1c6a9f1 fix(trust-contract): remove seed fallback paths`
- `577c793 fix(quick-start): mark docs-ready rows needs-review`
- `f61784c fix(runs-api): serialize run-start for dedupe`

Applied lesson: keep step output authoritative, avoid fallback placeholders, preserve dedupe semantics, and verify behavior with real-data integration/e2e coverage.

## Demo Checklist

1. Run Quick Start on a folder with parsed/indexed docs.
2. Confirm no new rows show placeholder `Unable to produce citations.`.
3. Confirm at least one row has non-empty `citation_ids`.
4. Click citation chip and verify correct PDF + page opens.
5. Run no-evidence case and verify:
   - `status = missing_input`
   - `answer = Not found in provided documents.`
   - explicit `provenance_json.reason_code`
6. Confirm export blocking behavior remains unchanged for `citation_failed`.

## Acceptance Criteria Mapping

- Quick Start rows get valid `citation_ids` when evidence exists:
  - covered by retrieve + strict lock path and integration/e2e assertions.
- Citation chips open correct PDF/page:
  - covered by strict anchor lock policy and viewer checks.
- No-evidence rows use canonical text with explicit reason codes:
  - covered by missing-input policy + no-evidence reason-code tests.

## References

- Next.js route handlers: https://nextjs.org/docs/app/building-your-application/routing/route-handlers
- PostgreSQL explicit locking: https://www.postgresql.org/docs/current/explicit-locking.html
- PostgreSQL `INSERT ... ON CONFLICT`: https://www.postgresql.org/docs/current/sql-insert.html
- Stripe idempotent requests: https://docs.stripe.com/api/idempotent_requests
- AWS idempotent API retries: https://aws.amazon.com/builders-library/making-retries-safe-with-idempotent-APIs/
- Zod docs: https://zod.dev/
- OWASP LLM prompt injection prevention: https://cheatsheetseries.owasp.org/cheatsheets/LLM_Prompt_Injection_Prevention_Cheat_Sheet.html
- OWASP Top 10 for LLM applications: https://genai.owasp.org/llm-top-10/
- RAG paper (Lewis et al., 2020): https://arxiv.org/abs/2005.11401
- CRAG paper (Yan et al., 2024): https://arxiv.org/abs/2401.15884
