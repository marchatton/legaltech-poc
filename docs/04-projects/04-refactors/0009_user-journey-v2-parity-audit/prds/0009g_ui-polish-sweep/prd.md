# PRD (Overall): UI Polish Sweep (Design-System First) (0009g)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: ui-polish-sweep

## Introduction / Overview

### Problem
A single catch-all polish PRD still causes slow starts and coordination overhead, but splitting too far creates merge conflict churn.

### Goal
Split `0009g` into exactly two execution slices that are as granular as possible while keeping merge conflict risk low.

### Slice
Decompose `0009g` into two route-aligned child PRDs with explicit `blocked by` contracts.

### Primary Observable Effect
Teams can run polish in parallel with clear ownership boundaries and fewer overlapping edits.

### In Scope
- Keep `0009g` as umbrella PRD with two child PRDs.
- Preserve SP-0009-06 mandatory polish gate.
- Encode story-level blockers so starts happen as soon as each route area is ready.

### Child PRDs
- `prds/0009g1_shell-setup-demo-polish/prd.md`
- `prds/0009g2_detail-surfaces-and-guardrails/prd.md`

## Goals

- Reduce merge conflicts by separating ownership by route/file clusters.
- Keep polish execution parallel where blocker sets differ.
- Preserve deterministic trust-copy and exclusion guardrails.
- Keep each child PRD small enough for quick implementation loops.

## User Stories

### US-001: Split 0009g into two conflict-aware child PRDs
As an engineering lead, I want two bounded polish slices so we get parallel execution without over-fragmenting the work.

#### Acceptance Criteria
- AC-001: Two child PRD folders exist under `0009g_ui-polish-sweep/prds/`, each with `prd.md` + `prd.json`.
  - Example: one slice owns `/matters` + setup/demo; the other owns `/matters/:id` detail surfaces.
  - Negative: no third/fourth micro-slice that increases coordination burden.
- AC-002: Child slices define non-overlapping ownership boundaries.
  - Example: shell/setup/demo polish is isolated from report/viewer/exports/chat polish.
  - Negative: no ambiguous shared ownership for the same route component files.

#### Verification
- Pack/fixture/script: child PRD files in `0009g_ui-polish-sweep/prds/`.
- Automated checks: JSON parse for umbrella and child PRD JSON files.
- Manual checks: ownership map review against route/component file areas.

### US-002: Encode blocker-safe starts for each child slice
As a planning lead, I want explicit blocker stories so each child slice starts at the earliest safe point.

#### Acceptance Criteria
- AC-003: `0009g1` and `0009g2` include concrete blocker story IDs from `0009a`..`0009f`.
  - Example: `0009g1` references `0009a/US-004`, `0009e/US-003`, `0009f/US-002`.
  - Negative: no generic "after core work" dependency language.
- AC-004: Cross-surface guardrail sign-off is sequenced after both child implementation scopes stabilize.
  - Example: `0009g2` final guardrail story depends on `0009g1` completion.
  - Negative: no final guardrail pass while route-level polish is still changing.

#### Verification
- Pack/fixture/script: `sequencing-parallel-plan.md`.
- Automated checks: N/A.
- Manual checks: earliest-start trigger walkthrough.

### US-003: Preserve mandatory polish gate without scope drift
As a product team, I want the split to keep the same quality bar and exclusions.

#### Acceptance Criteria
- AC-005: Both child PRDs include mandatory checks where relevant: state clarity, ErrorBanner consistency, interaction accessibility.
  - Example: detail slice includes focus return and retry/blocked-state consistency.
  - Negative: no child omits deterministic fallback guidance.
- AC-006: Exclusions W-C3/W-C4/W-C5/W-C7/W-C11 remain explicit and auditable.
  - Example: final guardrail matrix captures pass/fail per exclusion.
  - Negative: no reintroduction of hardcoded trust claims, unsupported promises, or precision timer drift.

#### Verification
- Pack/fixture/script: child PRD acceptance criteria and guardrail checklist.
- Automated checks: N/A.
- Manual checks: exclusion audit review.

## Functional Requirements

- FR-001: Keep `0009g` as umbrella PRD and create two child PRDs under `0009g_ui-polish-sweep/prds/`.
- FR-002: Each child PRD must declare explicit blocked-by dependencies with story-level unblockers.
- FR-003: Child scopes must be route-aligned and conflict-aware.
- FR-004: `sequencing-parallel-plan.md` must reflect two-slice `0009g` execution.

## Non-Goals (Out of Scope)

- Introducing new backend contracts beyond `0009a`..`0009f`.
- Reopening deferred parity scope cuts.
- Re-splitting into many micro-slices that increase merge overhead.

## Technical Considerations

- Continue to use `apps/web/app/ui` shared components and v5 token/preset conventions.
- Prefer route-local polish edits in child slices to reduce shared-file conflicts.
- If shared component changes are required, keep them additive and low-churn.

## Failure States & UX

- Overlap in file ownership -> merge conflicts and review churn.
- Unclear blockers -> teams start too early and rework.
- Missing final exclusion audit -> accidental reintroduction of forbidden wireframe behaviors.

## Metrics / Logging

- Success signals:
  - Child slices run in parallel with minimal conflict rebases.
  - Fewer re-plans due to unclear dependencies.
- Debug signals:
  - Number of conflict-related review comments.

## Rollback / Disable Plan

- Planning rollback: collapse child scopes back into umbrella-only execution if two-slice split still causes churn.
- Runtime flags remain owned by child implementation slices.

## Risks & Dependencies

- Risks:
  - Even with two slices, shared component edits can still collide if boundaries are ignored.
  - Final guardrail story may be delayed by late polish churn in either slice.
- Dependencies:
  - `0009g1` blocked by `0009a/US-004`, `0009e/US-003`, `0009f/US-002`.
  - `0009g2` blocked by `0009b/US-003`, `0009c/US-003`, `0009d/US-004`, `0009f/US-004`.
  - `0009g2` final guardrail sign-off story additionally depends on `0009g1` completion.

## Success Metrics

- Two child PRDs exist and parse as JSON.
- Blockers are explicit, story-level, and route-specific.
- Sequencing notes define earliest-start triggers for `0009g1` and `0009g2`.

## Resolved Spike Decision

- SP-0009-06 remains resolved (2026-02-11): mandatory polish gate is unchanged.
  - State clarity.
  - ErrorBanner consistency.
  - Interaction accessibility.
- Exclusion guardrail audit remains mandatory in `0009g2` final sign-off story.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009d_chat-run-scoping/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009e_demo-operator-loop/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/sequencing-parallel-plan.md`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
- `apps/web/app/ui`
