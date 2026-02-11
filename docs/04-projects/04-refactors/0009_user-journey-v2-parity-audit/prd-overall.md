# PRD (Overall): 0009 User Journey V2 Parity Audit

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: 0009-user-journey-v2-parity-audit

## Introduction / Overview

### Problem
The parity audit in `findings.md` shows **38.5% weighted alignment** to the v2 journey affordance model, with **41 non-implemented items** (`Partial + Missing`), concentrated in shell/navigation, matter setup, report triage, run scoping, and operator workflow.

### Goal
Raise journey parity with thin, parallelizable implementation slices that preserve current trust/export strengths while closing the largest affordance gaps.

### Slice
Split the full plan into seven executable PRD slices (`0009a`..`0009g`) so teams can run mostly in parallel with explicit contract dependencies.

### Primary Observable Effect
A new `prds/` tree exists with one `prd.md` + `prd.json` per slice, each constrained to 3-10 stories and wired for parallel execution.

### In Scope
- Decompose the parity plan into execution slices by UI-only, thin backend, and moderate backend boundaries.
- Keep simple UI changes aggregated into fewer stories for faster delivery.
- Split heavier backend work into smaller contract-first stories.
- Identify spike areas that need investigation before build starts.

## Goals

- Convert parity findings into seven implementation-ready PRD slices with clear ownership boundaries.
- Keep each slice at 3-10 stories and suitable for one Ralph loop per story.
- Maximize parallel delivery while preserving deterministic dependencies.
- Preserve v1 cut-line decisions from findings (notably U12, U28, U37 L1-only, U40, U42, U48, W-A8).

## Parallelization Plan

1. Wave 1 (start immediately): `0009a_shell-matters-setup`, `0009f_error-and-support-patterns`
2. Wave 2 (after `0009a` contracts are stable): `0009b_report-triage-and-evidence`, `0009c_exports-and-artefacts`, `0009e_demo-operator-loop`
3. Wave 3 (after run-scope + viewer integration points are ready): `0009d_chat-run-scoping`
4. Wave 4 (final consolidation): `0009g_ui-polish-sweep`

## User Stories

### US-001: Define execution slices with dependency-safe parallelism
As an engineering lead, I want parity work split into thin PRDs so that multiple contributors can implement in parallel without contract collisions.

#### Acceptance Criteria
- AC-001: Seven slice PRDs exist under `prds/` with clear scope boundaries and dependencies.
  - Example: chat and export slices both reuse run-scope contracts without redefining them differently.
  - Negative: no single slice mixes unrelated shell, report, chat, and demo concerns into one oversized scope.
- AC-002: Each slice contains 3-10 stories and includes measurable verification steps.
  - Example: each story has testable acceptance criteria with at least one example and one negative case.
  - Negative: no story is purely narrative or unverifiable.

#### Verification
- Pack/fixture/script: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- Automated checks: JSON parse + story-count checks for all generated PRD JSON files.
- Manual checks: confirm scope coverage of U1-U52 and W-A*/W-C* decisions across slices.

### US-002: Preserve parity cut-line decisions in executable scope
As a planner, I want scope cuts captured inside the slice PRDs so that teams do not re-open deferred backend-heavy work during implementation.

#### Acceptance Criteria
- AC-003: U12 pre-run checklist gating remains de-scoped in parity v1.
  - Example: readiness copy is in scope, checklist state machine backend work is out of scope.
  - Negative: no slice introduces a new checklist-gating backend contract.
- AC-004: U37 remains L1-only and excludes L2/L3 behavior.
  - Example: run chip + recent completed run picker + mismatch metadata are included.
  - Negative: no multi-run compare/merge UX is included.
- AC-005: U28 remains UI-only acknowledgement in parity v1.
  - Example: "Thanks, we'll investigate" can be shown without persistence.
  - Negative: no citation flag persistence endpoint is required in this cut.

#### Verification
- Pack/fixture/script: `findings.md` decision update block.
- Automated checks: N/A.
- Manual checks: verify each cut appears in relevant slice non-goals/open questions.

### US-003: Identify spike-first risks before implementation loops
As a lead, I want spike candidates called out early so that risky contract assumptions are validated before multiple parallel PR loops start.

#### Acceptance Criteria
- AC-006: At least four concrete spike topics are documented with why/decision needed.
  - Example: run-scoped chat retrieval binding and citation anchor coverage are explicit spikes.
  - Negative: no vague "investigate later" placeholders without decision targets.

#### Verification
- Pack/fixture/script: spike list in this file + `openQuestions` in each slice PRD.
- Automated checks: N/A.
- Manual checks: confirm each spike maps to at least one slice dependency.

## Functional Requirements

- FR-001: Create `prd-overall.md` + `prd-overall.json` at dossier root.
- FR-002: Create seven slice folders under `prds/` named `0009a`..`0009g` with `prd.md` + `prd.json`.
- FR-003: Each slice must include quality gates and dependency notes.
- FR-004: Each slice must preserve findings decisions, cut lines, and wireframe guidance relevant to its scope.

## Non-Goals (Out of Scope)

- Implementing production code in this planning step.
- Re-scoring parity after implementation.
- Extending parity v1 to L2/L3 chat run isolation or multi-run compare.
- Backend-heavy orchestration not explicitly included in `findings.md` moderate/thin scope.

## Technical Considerations

- Shared contracts likely touched by multiple slices: runs list/read model, report filters, chat run metadata, safe error envelope.
- Parallelization works best when shared contracts are landed first or behind additive changes.
- Use existing Next.js + TypeScript + Postgres contracts; avoid speculative new infrastructure.

## Failure States & UX

- Missing or inconsistent run scope metadata across chat/export/report can cause user trust regressions.
- Silent failure paths (citation jump unavailable, no indexed docs for chat, export block reasons) must be surfaced explicitly in UI.

## Metrics / Logging

- Success signals:
  - Parity implemented count across targeted U/W affordances per slice.
  - Slice completion throughput (stories closed per slice).
- Debug signals:
  - Run-scope mismatch event logging.
  - ErrorBanner exposure counts by deterministic error code.

## Rollback / Disable Plan

- Feature flag recommendation per slice where behavior changes are risky (`chat_run_scope_l1`, `operator_checklist_card`, `error_banner_v1`).
- Safe fallback: keep current status-quo UI/contract behavior when slice flags are off.

## Risks & Dependencies

- Risks:
  - Contract drift between chat/export/report run scoping if implemented independently.
  - Evidence jump reliability if anchor mapping coverage is lower than expected.
  - Cross-surface error handling divergence if envelope fields are not standardized first.
- Dependencies:
  - Shared API surfaces in `apps/web/app/(api)` must remain additive and backward-safe during rollout.

## Success Metrics

- All seven slice PRDs and JSON artifacts exist and parse.
- Every slice has 3-10 stories and explicit verification.
- All findings cut-line decisions are represented in slice scopes.

## Open Questions (Spike Candidates)

- SP-0009-01: What is the precise run/index binding behavior for `POST /api/folders/:id/chat` when `run_id` is stale or missing?
- SP-0009-02: What percentage of chat/report citations currently include resolvable document/page anchors for reliable jump-to-evidence?
- SP-0009-03: Which document readiness states are required for setup/documents IA without exposing backend pipeline internals?
- SP-0009-04: Which endpoint owns support escalation (`mailto`, internal ticket, or placeholder action) for deterministic error handling?
- SP-0009-05: Are run timestamps sufficient for coarse checklist elapsed minutes, or is additional telemetry needed?

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-and-magic-patterns-prompts-v2.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
