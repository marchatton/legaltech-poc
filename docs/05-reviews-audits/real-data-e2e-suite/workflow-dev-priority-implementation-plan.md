# Real-Data E2E: Dev-Priority Implementation Plan

Date: 2026-02-13  
Scope: deliver real-data workflow reliability with `dev` as the primary implementation mode, while landing fast demo-prod operator wins.

## Status Update (2026-02-13)

Completed:
1. Phase 0 quick wins are shipped: `pack_09_bad_citation` is in the shared allowlist (`apps/web/lib/demoPackAllowlist.ts`), reachable in toolbar (`apps/web/app/DemoToolbar.tsx`), and covered by smoke flow checks (`apps/web/test/realDataWorkflows.e2e.int.test.ts`, `.github/workflows/real-data-smoke.yml`).
2. Phase 1 `P0` closure loops landed (US-001..US-012): readiness/run/report/trust contracts are implemented and passing full verification gates.
3. Priority #1 trust-path hardening is executed:
   1. `apps/web/steps/quickStartWriteRowV0.step.server.ts`: removed write fallback branch; row-write failures now transition run to explicit `failed` with `ROW_WRITE_FAILED`.
   2. `apps/web/app/(api)/citations/[id]/route.ts`: removed seed snapshot fallback; DB miss is fail-closed `NOT_FOUND`.
   3. `apps/web/app/(api)/export/csv/route.ts`: removed fixture-backed export fallback; unknown run is fail-closed `NOT_FOUND`.

Remaining:
1. Phase 2 (`Loop D`) stabilization: chat persistence contract + resilience matrix expansion + operator/review polish.
2. Phase 3 cadence hardening: broaden nightly coverage and add weekly full resilience/fault matrix with clear triage ownership.

## Inputs

- `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`

## Goals

1. Close the highest-impact workflow gaps in `dev` first (`P0` before `P1/P2`).
2. Keep `demo-prod` useful for demos/operators through quick, low-risk allowlist wins.
3. Preserve fail-closed trust behavior while removing seeded/fallback dependency in dev workflow execution.

## Non-Goals

1. Full `prod` rollout for these workflows.
2. Broad demo-prod parity for all setup and authoring paths.
3. Expanding all pack allowlists immediately before `P0` dev closure.

## Delivery Policy (Required)

1. Large changes: run `3-4` Ralph loops in parallel.
2. Small isolated changes: one-shot directly.
3. "Large" means work spans multiple workflow modules or crosses API + step engine + UI contracts.
4. Every loop ships with targeted verification for its owned workflow slice before merge.

## Target State By Mode

| Mode | Target by end of this plan |
|---|---|
| Dev | `P0` workflows are real-data driven and deterministic; no seeded/fallback critical path for run/report/trust behavior. |
| Demo-prod | Operator path is reliable with allowlisted packs (`pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`) and trust demo coverage. |
| Prod | Remains blocked for these workflows in this cycle. |

## Phase Plan

### Phase 0: One-shot quick wins for demo-prod allowlist (Completed)

Primary objective: improve operator utility immediately without broad scope expansion.

Tasks:
1. Add `pack_09_bad_citation` to load-pack allowlist schema (`apps/web/app/(api)/demo/load-pack/route.ts`).
2. Add `pack_09_bad_citation` to operator dropdown (`apps/web/app/DemoToolbar.tsx`).
3. Add/adjust smoke coverage for operator flow: load pack -> run -> verify export-blocked contract.
4. Sync docs/matrix references to reflect new quick-win baseline.

Acceptance criteria:
1. Operator can load `pack_09_bad_citation` from UI in demo-prod.
2. No regression for `pack_01_clean` and `pack_02_missing_rea`.
3. Trust/fail-closed path remains enforced (`EXPORT_BLOCKED` behavior unchanged).

### Phase 1: Dev `P0` contract closure (parallel loops A/B/C) (Completed)

Primary objective: make `P0` workflow behavior in dev consistently reflect real execution data.

### Loop A: Entry/readiness foundation

Scope:
1. Entry + readiness gate consistency for create/upload/ingest readiness messaging.
2. Quick Start enablement based on real folder/document readiness state, not seeded assumptions.

Exit criteria:
1. Readiness UI and API state transitions are consistent under clean and missing-input packs.
2. No contradictory state (for example "ready" UI with blocked backend prerequisites).

### Loop B: Run lifecycle + report contract

Scope:
1. Run start/progress/terminal status contract normalization.
2. Replace seeded/fallback report row write behavior in quick start path with real contract output.

Exit criteria:
1. Run transitions and report statuses are traceable from real run data.
2. Report rows in dev reflect actual step outcomes, not default fail-closed placeholders.

### Loop C: Trust/citation/export contract

Scope:
1. Citation evidence path reliability (citation -> render -> PDF).
2. Export fail-closed behavior correctness against citation/report state.

Exit criteria:
1. `pack_09_bad_citation` consistently drives blocked export behavior.
2. Citation evidence requests return explicit, stable outcomes (success or typed failure), without hidden fallback masking.

### Phase 2: Dev `P1/P2` stabilization (parallel loop D plus spillover) (Open)

Primary objective: tighten secondary workflows after `P0` closes.

### Loop D: Review/chat/operator/resilience

Scope:
1. Review workflow polish (triage + mark-reviewed feedback parity).
2. Chat contract hardening toward run-scoped, persisted behavior.
3. Operator repeat-run predictability and pack reload consistency.
4. Resilience matrix coverage (timeouts/retries/error contract consistency across surfaces).

Exit criteria:
1. Review and chat behavior are consistent across pack scenarios used in smoke/nightly tiers.
2. Resilience failures surface coherent, non-contradictory UX and API envelopes.

### Phase 3: Full suite breadth and cadence hardening (Open)

Primary objective: stabilize maintenance cost and prevent regressions.

Tasks:
1. Complete nightly coverage for all packs across `P0 + P1`.
2. Weekly full matrix including resilience/fault injection paths.
3. Keep the 2D suite as source-of-truth mapping between workflow modules and pack scenarios.

Acceptance criteria:
1. Tiered suite schedule is executable and documented.
2. Failures are attributable to a workflow module and pack scenario without ambiguous triage.

## Ralph Loop Topology (Large Changes)

| Loop | Ownership | Phase | Dependencies |
|---|---|---|---|
| Loop A | Entry/readiness | Phase 1 | None |
| Loop B | Run/report | Phase 1 | Loop A readiness contract decisions |
| Loop C | Trust/citation/export | Phase 1 | Loop B report/citation contract decisions |
| Loop D | Review/chat/resilience/operator | Phase 2 | Stable `P0` contracts from A/B/C |

Coordination rules:
1. One integration owner tracks shared contract decisions and sequence merges.
2. Shared schema/state contract changes are merged before dependent loop completion.
3. Each loop carries loop-local tests plus `P0` smoke checks before merge.

## One-Shot Policy (Small Changes)

Use one-shot directly when all are true:
1. Change affects a single surface or a tightly coupled API+UI pair.
2. No cross-loop dependency or shared contract migration is needed.
3. Can be verified by targeted smoke checks without multi-loop coordination.

Examples:
1. Allowlist enum + toolbar option update.
2. Copy-only or docs-only clarifications.
3. Single route validation guard fix with isolated test updates.

## Verification Ladder

1. Loop-local checks: targeted tests for touched workflows/routes/components.
2. PR smoke (`P0`): `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`.
3. Nightly: all packs for `P0 + P1`.
4. Weekly: full matrix including resilience/fault-injection workflows.
5. Manual operator spot-check in demo-prod for allowlisted packs after each allowlist change.

## Risks and Mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Seeded fallback behavior leaks into final contracts | False confidence from passing tests with non-real data paths | Track and remove fallback branches in phase exit criteria; require pack-based verification. |
| Loop merge conflicts across shared contracts | Slower integration and regressions | Define shared contracts first; merge foundational loop outputs before dependent loops. |
| Demo-prod scope creep | Dev-priority schedule slip | Restrict demo-prod work to explicit quick-win checklist unless re-scoped intentionally. |
| Suite runtime cost growth | Slower feedback loop | Maintain tiered run strategy (smoke/nightly/weekly) and keep PR smoke minimal but representative. |

## Definition of Done

1. Phase 0 quick wins are live (`pack_09_bad_citation` allowlisted and operator-reachable).
2. `P0` workflows in dev are contract-correct and run on real data paths.
3. Tiered suite cadence is active with clear pack/workflow mapping.
4. Matrix and 2D model docs remain aligned with implementation reality.
