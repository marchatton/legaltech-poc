# PRD: Detail Surfaces + Final Guardrails (0009g2)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: detail-surfaces-and-guardrails

## Introduction / Overview

### Problem
Detail surfaces (`/matters/:id` report/viewer/exports/chat) carry most trust and recovery interactions; inconsistencies here can create operator confusion and trust regressions.

### Goal
Polish detail surfaces with deterministic state/copy/interaction behavior, then run final cross-surface guardrail sign-off without reintroducing excluded wireframe items.

### Slice
Detail-surface polish plus final trust/exclusion audit story. This slice owns report/viewer/exports/chat polish and the final sign-off matrix.

### Primary Observable Effect
Detail workflows feel consistent and trustworthy, and there is one explicit final pass proving exclusions remain intact.

### In Scope
- Report and viewer polish consistency.
- Exports and artefacts polish consistency.
- Chat detail-surface polish consistency.
- Final guardrail sign-off matrix for W-C3/W-C4/W-C5/W-C7/W-C11 after both child implementation tracks stabilize.

## Goals

- Standardize state and trust-copy behavior across detail surfaces.
- Improve interaction hierarchy and accessibility in high-frequency detail workflows.
- Keep deterministic error and retry/support semantics aligned with `0009f`.
- Finish with a single auditable exclusion/trust guardrail sign-off.

## User Stories

### US-001: Detail-surface state and trust-copy consistency
As an operator, I want consistent state messaging and trust copy in report/viewer/exports/chat so decisions are reliable.

#### Acceptance Criteria
- AC-001: Loading/empty/blocked/success states across detail surfaces include deterministic next-step guidance.
  - Example: blocked export state links to corrective action and explains reason.
  - Negative: no generic placeholder states with no guidance.
- AC-002: Trust/status metadata renders only when source-backed fields exist, with deterministic fallback copy otherwise.
  - Example: footer trust copy shows fallback text when metadata is absent.
  - Negative: no hardcoded IDs/timestamps/stats as trust evidence.

#### Verification
- Pack/fixture/script: detail-surface fixtures for report/viewer/exports/chat state permutations.
- Automated checks: trust-copy and fallback rendering tests.
- Manual checks: end-to-end detail-surface walkthrough.

### US-002: Detail interaction hierarchy and accessibility polish
As an operator, I want clear primary actions and robust keyboard/touch behavior on detail surfaces.

#### Acceptance Criteria
- AC-003: Each detail context has one clear primary action with secondary alternatives.
  - Example: artefact row emphasizes one primary download/open action.
  - Negative: no equal-weight competing CTAs that obscure primary intent.
- AC-004: Focus order/return and non-hover affordances are preserved in viewer/chat/report interactions.
  - Example: viewer close returns focus to invoking element.
  - Negative: no critical action dependent on hover only.

#### Verification
- Pack/fixture/script: keyboard/touch smoke checklist for detail routes.
- Automated checks: interaction tests for focus behavior and ARIA state.
- Manual checks: keyboard-only detail-flow run.

### US-003: Detail error/retry/support consistency
As an operator, I want deterministic error behavior on detail surfaces so recovery is predictable.

#### Acceptance Criteria
- AC-005: ErrorBanner usage, retry gating, and support behavior align with `0009f` across report/viewer/exports/chat.
  - Example: non-retryable error hides retry and shows corrective guidance.
  - Negative: no per-surface bespoke error behavior drift.
- AC-006: Disabled or unavailable actions show explicit fallback explanation.
  - Example: unavailable jump/support actions show why and what to do next.
  - Negative: no silent disabled controls.

#### Verification
- Pack/fixture/script: detail-surface deterministic error fixtures.
- Automated checks: retry/support action-gating tests.
- Manual checks: failure-path walkthrough in report/export/chat.

### US-004: Final cross-surface guardrail and exclusion sign-off
As a product team, we want one final audit story to ensure polish did not reintroduce excluded wireframe behavior.

#### Acceptance Criteria
- AC-007: Guardrail matrix includes pass/fail for W-C3/W-C4/W-C5/W-C7/W-C11 across all touched surfaces.
  - Example: explicit check confirms no hardcoded ingest stats or unsupported upload claims.
  - Negative: no unchecked exclusion rows in final sign-off.
- AC-008: Final sign-off confirms SP-0009-06 mandatory checks are satisfied across both child slices.
  - Example: state clarity + ErrorBanner consistency + accessibility all marked pass with evidence links.
  - Negative: no final sign-off while `0009g1` implementation stories remain open.

#### Verification
- Pack/fixture/script: guardrail matrix checklist with linked evidence snapshots/tests.
- Automated checks: N/A.
- Manual checks: final review pass across all polished surfaces.

## Functional Requirements

- FR-001: Apply deterministic state and trust-copy polish across detail surfaces.
- FR-002: Normalize interaction hierarchy and accessibility across report/viewer/exports/chat.
- FR-003: Align deterministic error/retry/support behavior with `0009f`.
- FR-004: Run final exclusion/trust guardrail sign-off after both child implementation tracks stabilize.

## Non-Goals (Out of Scope)

- Shell/setup/demo route polish implementation (owned by `0009g1`).
- New backend contract work.
- Scope expansion beyond parity v1 cut lines.

## Technical Considerations

- Focus edits on detail-surface route/component files to keep ownership boundary clear.
- Shared component changes should be additive and coordinated with `0009g1` to avoid collisions.
- Use v5 token/preset and existing `apps/web/app/ui` primitives.

## Failure States & UX

- Trust-copy drift can make verification claims feel unreliable.
- Focus/accessibility regressions can degrade high-speed operator workflows.
- Missing final guardrail audit can allow excluded behavior to slip back in.

## Metrics / Logging

- Success signals:
  - Detail-surface polish checklist passes with deterministic trust copy.
  - Final guardrail matrix passes without exclusion violations.
- Debug signals:
  - Count of trust-copy fallback triggers and exclusion audit failures.

## Rollback / Disable Plan

- Feature flag: `ui_polish_sweep_detail_v1`.
- Safe fallback: retain pre-polish detail surface behavior from `0009b`/`0009c`/`0009d`.

## Risks & Dependencies

- Risks:
  - Detail surfaces touch many shared patterns; unmanaged edits can increase merge conflicts.
  - Final sign-off may surface late inconsistencies requiring cross-slice fixes.
- Dependencies:
  - Blocked by `0009b/US-003` (report/viewer integration baseline).
  - Blocked by `0009c/US-003` (exports/artefacts baseline).
  - Blocked by `0009d/US-004` (chat detail-surface baseline).
  - Blocked by `0009f/US-004` (retry semantics baseline).
  - Final sign-off story (`US-004`) blocked by completion of `0009g1` implementation stories.

## Success Metrics

- Detail surfaces pass state/trust/action consistency checks.
- No exclusion violations in final guardrail matrix.
- Final sign-off completed after both child implementation tracks stabilize.

## Resolved Spike Decision

- SP-0009-06 applies: mandatory checks and guardrails are enforced in this slice.
  - State clarity.
  - ErrorBanner consistency.
  - Interaction accessibility.
  - Exclusion audit for W-C3/W-C4/W-C5/W-C7/W-C11.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009d_chat-run-scoping/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
- `apps/web/app/ui`
