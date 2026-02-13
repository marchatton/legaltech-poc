# PRD: Real-Data E2E Loop C - Trust, Citation, and Export Contract

Owner: marc
Status: Draft
Date: 2026-02-12
Slug: real-data-e2e-loop-c-trust-citation-export

## Introduction / Overview

### Problem
Trust/citation/export flows are partially implemented but still include fallback behavior that can mask true evidence outcomes. Demo-prod operator utility is also constrained by an allowlist that excludes `pack_09_bad_citation`.

### Goal
Make citation evidence and export fail-closed behavior explicit, deterministic, and operator-reachable, including the Phase 0 allowlist quick win.

### Slice
This slice owns P0 trust + citation + export closure and the fast demo-prod operator allowlist baseline for `pack_09_bad_citation`.

### Primary Observable Effect
Operators can load `pack_09_bad_citation`, run workflows, and consistently observe typed citation outcomes and `EXPORT_BLOCKED` behavior when trust conditions fail.

## In Scope

- Citation evidence path reliability (`citation -> render -> pdf`) with explicit typed outcomes.
- Export fail-closed correctness against report/citation state.
- Phase 0 quick wins: add `pack_09_bad_citation` to load-pack API allowlist and demo toolbar option.
- Operator smoke checks for load -> run -> export-blocked contract.

## Goals

- Keep trust behavior fail-closed and user-visible.
- Eliminate hidden fallback masking in citation response paths.
- Improve demo-prod operator reliability with minimal-scope allowlist expansion.

## User Stories

### US-001: Citation evidence requests return explicit stable outcomes
As a reviewer, I want citation lookups to return either verifiable evidence or typed failure so trust decisions are auditable.

#### Acceptance Criteria
- Citation open path returns deterministic success payload or typed failure envelope.
- Render/PDF retrieval behavior is explicit for missing/invalid citation anchors.
- Example: valid citation opens expected document page with trust metadata and render URL.
- Negative: invalid citation never renders stale highlight overlays or ambiguous success UI.

#### Verification
- Pack/fixture/script: run citation checks for `pack_01_clean` and `pack_09_bad_citation`.
- Automated checks: route tests for `/api/citations/:id`, `/api/documents/:id/render`, and `/api/documents/:id/pdf` typed outcomes.
- Manual checks: open viewer from report/chat source chips and verify success vs failure rendering.

### US-002: Export fail-closed contract remains strict and observable
As an operator, I want blocked exports to be deterministic so unsafe outputs cannot be downloaded.

#### Acceptance Criteria
- Export route enforces `EXPORT_BLOCKED` whenever run/report/citation safety preconditions are not met.
- Blocked export states surface actionable UX to inspect failed rows/evidence.
- Example: `pack_09_bad_citation` run results in blocked export with explicit reason and no downloadable artefact.
- Negative: blocked/incomplete runs must never produce signed download links.

#### Verification
- Pack/fixture/script: load `pack_09_bad_citation`, run quick start, attempt CSV export.
- Automated checks: export route tests asserting `EXPORT_BLOCKED` envelope for fail-closed scenarios.
- Manual checks: confirm blocked export UI and recovery path into report triage.

### US-003: Demo-prod operator allowlist includes `pack_09_bad_citation`
As a demo operator, I want to select `pack_09_bad_citation` from the toolbar so trust/fail-closed scenarios can be demonstrated without manual API calls.

#### Acceptance Criteria
- Load-pack API schema allowlist includes `pack_09_bad_citation`.
- Demo toolbar pack dropdown includes `pack_09_bad_citation` and loads it successfully.
- Example: operator can select pack 09, start a run, and observe blocked export behavior end to end.
- Negative: non-allowlisted arbitrary pack ids remain rejected with validation errors.

#### Verification
- Pack/fixture/script: demo-prod operator smoke for load pack -> run -> export blocked.
- Automated checks: request schema validation tests for allowlist behavior and regression checks for packs 01/02.
- Manual checks: toolbar selection + run + blocked export walkthrough.

## Functional Requirements

- FR-001: Standardize citation outcome envelope (success or typed failure) across citation/render/pdf routes.
- FR-002: Preserve strict fail-closed export gating for unsafe or unresolved evidence states.
- FR-003: Add `pack_09_bad_citation` allowlist in load-pack API and toolbar options.
- FR-004: Ensure operator smoke coverage exists for pack 09 fail-closed flow.
- FR-005: Keep compatibility for existing allowlisted packs `pack_01_clean` and `pack_02_missing_rea`.

## Non-Goals (Out of Scope)

- Broad allowlist expansion for all packs in this phase.
- Relaxing fail-closed trust policies or enabling unsafe exports by default.
- Full prod-mode rollout of trust/export workflows.

## Failure States + UX

- Invalid citation: explicit `citation_failed` presentation and no highlight overlays.
- Blocked export: clear blocked reason and triage/review recovery action.
- Allowlist validation failure: typed input error with no side effects.

## Metrics / Logging

- `citation_lookup_failed_total` by typed reason code.
- `export_blocked_total` by run id and failure category.
- `demo_pack_load_validation_error_total` for non-allowlisted ids.

## Rollback / Disable Path

- Allowlist change is additive and can be reverted by removing `pack_09_bad_citation` from API/UI enums.
- Citation outcome normalization can be toggled back to previous route behavior while preserving fail-closed export defaults.

## Risks + Dependencies

- Risks:
  - Citation fallback branches may still mask typed failures under specific edge cases.
  - Toolbar and API allowlist drift could reintroduce operator confusion.
- Dependencies:
  - Depends on Loop B run/report contract for reliable export gating decisions.
  - Depends on existing citation/render/pdf route contracts remaining stable.

## Success Metrics

- `pack_09_bad_citation` is operator-loadable in demo-prod.
- Citation open path shows explicit success or typed failure with no silent ambiguity.
- Exports stay fail-closed with stable `EXPORT_BLOCKED` behavior for unsafe scenarios.

## Open Questions

- None. Closed on 2026-02-13 via `ask-questions-if-underspecified` defaults.

## Resolved Decisions

- `pack_09_bad_citation` operator smoke coverage runs in both PR and nightly tiers.
- No dedicated operator-facing copy spec is added in this phase; blocked export messaging uses existing shared error/support copy conventions.

## Quality Gates

- `pnpm lint`
- `pnpm typecheck`
- `pnpm test`

## Sources

- `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`
- `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
