# PRD: UI Polish Sweep (Design-System First) (0009g)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: ui-polish-sweep

## Introduction / Overview

### Problem
Core parity slices close major affordance gaps, but small UI inconsistencies still create friction: uneven loading/empty/error states, inconsistent action hierarchy, and uneven trust/microcopy clarity across surfaces.

### Goal
Run one focused UI polish sweep that harmonizes high-frequency UI details while preserving parity scope and explicitly avoiding previously excluded wireframe items.

### Slice
Apply cross-surface polish to shell, report/viewer, exports/artefacts, chat, and demo surfaces by extending existing design-system primitives and patterns.

### Primary Observable Effect
The app feels visually and behaviorally cohesive: predictable states, clear primary actions, consistent trust/copy language, and stronger keyboard/touch accessibility.

### In Scope
- UI-only polish pass across slices `0009a`..`0009f`
- Inspiration sources:
  - Magic-pattern affordances in `orbital-user-journeys-and-magic-patterns-prompts-v2.md` (U* contracts)
  - Wireframe interaction patterns in `orbital-ui-wireframes`
  - Brand/system primitives in `docs/02-guidelines/v5-final/*`
- Implementation constraint: **use and extend our own design system** (tokens/components), not wireframe styling copy-over.
- Repository update (2026-02-11): `apps/web/app/ui` has recently added shared UI components; this sweep should prioritize incorporating those where they fit.

## Goals

- Standardize loading/empty/blocked/success states across major matter surfaces.
- Normalize CTA hierarchy and row/action affordances for speed + clarity.
- Tighten interaction/a11y polish (keyboard focus, touch discoverability, hover guardrails).
- Align copy and trust language with deterministic, source-backed UI behavior.
- Enforce a mandatory 3-check polish gate across all touched surfaces.

## User Stories

### US-001: Design-system-first polish primitives
As a developer, I want reusable polish primitives built from our existing design system so improvements are consistent and maintainable.

#### Acceptance Criteria
- AC-001: Polish uses `docs/02-guidelines/v5-final/tokens.css` and `docs/02-guidelines/v5-final/tailwind.preset.ts` as the visual baseline.
  - Example: shared spacing/radius/typography/feedback primitives are applied via existing tokenized classes.
  - Negative: no direct wireframe CSS transplant or parallel ad-hoc token set.
- AC-002: Any new UI pattern is added as extension of existing component primitives (buttons/chips/banners/skeleton states).
  - Example: a shared skeleton and empty-state block is reused in report/chat/artefacts.
  - Negative: one-off per-page variants that diverge from system components are not acceptable.

#### Verification
- Pack/fixture/script: component-level snapshots on core surfaces.
- Automated checks: lint/typecheck/tests for shared component updates.
- Manual checks: visual pass across shell/report/chat/export/demo routes.

### US-002: Cross-surface state consistency sweep
As an operator, I want consistent loading/empty/blocked/success states so I can understand system state instantly.

#### Acceptance Criteria
- AC-003: Loading states use a consistent skeleton/progress treatment across report, viewer, exports, artefacts, and chat.
  - Example: all async fetch states render the same loading language and skeleton rhythm.
  - Negative: spinner-only or silent loading states without context are not acceptable.
- AC-004: Empty and blocked states include deterministic guidance and next actions.
  - Example: no indexed docs in chat links to setup action; blocked export links to failed rows.
  - Negative: blank/placeholder UI with no recommended next step is not acceptable.

#### Verification
- Pack/fixture/script: fixture scenarios for empty, loading, blocked, and success states.
- Automated checks: state-component rendering tests.
- Manual checks: walkthrough of each major route state.

### US-003: Interaction hierarchy and accessibility polish
As an operator, I want clear primary actions and accessible interactions so high-speed workflows remain reliable.

#### Acceptance Criteria
- AC-005: Primary vs secondary action hierarchy is consistent (one primary open/download action per context).
  - Example: artefact row has one primary download CTA with clearly secondary alternatives.
  - Negative: competing equal-weight CTAs causing ambiguous action choice are not acceptable.
- AC-006: Hover-only affordances have keyboard/touch-visible equivalents and focus return behavior is preserved.
  - Example: viewer close returns focus to invoking element and key actions are reachable without hover.
  - Negative: required affordance discoverable only by hover is not acceptable.

#### Verification
- Pack/fixture/script: keyboard/touch smoke checklist.
- Automated checks: interaction tests for focus/aria states on updated controls.
- Manual checks: keyboard-only walkthrough on report/viewer/chat flows.

### US-004: Trust copy and exclusion guardrail sweep
As a product team, we want trust language and metadata to stay honest so polish does not introduce misleading UX.

#### Acceptance Criteria
- AC-007: Trust/status text is source-backed and consistent with live payload fields.
  - Example: verification/footer copy only renders when metadata exists, otherwise deterministic fallback copy appears.
  - Negative: hardcoded trust claims, IDs, timestamps, or ingest stats are forbidden.
- AC-008: Explicitly excluded wireframe items remain excluded in polish implementation.
  - Example: no promise of unsupported upload MIME limits; no second-level demo timers.
  - Negative: polish scope must not reintroduce cut items from W-C3/W-C4/W-C5/W-C7/W-C11.

#### Verification
- Pack/fixture/script: UI copy/trust assertions against live fixture payloads.
- Automated checks: tests asserting fallback copy for missing metadata.
- Manual checks: targeted review of excluded-item checklist.

## Functional Requirements

- FR-001: Enforce mandatory 3-check polish gate on every touched surface:
  - State clarity (loading, empty, blocked, success with deterministic next-step guidance)
  - ErrorBanner consistency (code + trace, retry gated by `retryable`, support gating)
  - Interaction accessibility (no hover-only critical actions, correct focus return)
- FR-002: Apply v5 token/preset primitives consistently to updated states/components.
- FR-003: Map magic-pattern affordances (U* contracts) to concrete UI polish checks.
- FR-004: Enforce wireframe exclusion guardrails during implementation review.

## Non-Goals (Out of Scope)

- Rebuilding layout architecture or introducing new major features.
- Reversing previously accepted scope cuts.
- Copying wireframe visual styling wholesale.
- Animation-heavy refinements that block parity delivery.

## Design Considerations

- Use `docs/02-guidelines/v5-final/design-system.html` for canonical visual language samples.
- Use wireframes and magic patterns for interaction inspiration, not token/style duplication.
- Keep semantic color intent from v5 final (orange high-signal, cyan user context, semantic success/warning/destructive).

## Technical Considerations

- Prefer shared component updates in app design-system surface over per-route overrides.
- Evaluate `apps/web/app/ui` first (`Button`, `Card`, `Tabs`, `Table`, `EmptyState`, `Skeleton`, `Tooltip`, `UploadZone`) before introducing new polish primitives.
- Keep changes additive and low-risk to existing slice logic/contracts.
- Validate any new class patterns against existing Tailwind preset conventions.

## Failure States & UX

- Missing metadata -> deterministic fallback trust copy.
- Missing support/action target -> clear disabled/help state, not silent dead-end.
- Interaction unavailable on touch/keyboard -> provide equivalent visible control.

## Metrics / Logging

- Success signals:
  - Reduced UX inconsistency defects from parity QA pass.
  - Reduced operator misclick/misnavigation in smoke tests.
- Debug signals:
  - UI state transition logs for loading/blocked/retry states.
  - Accessibility regression checklist pass/fail counts.

## Rollback / Disable Plan

- Feature flag: `ui_polish_sweep_v1`.
- Safe fallback behavior: retain functionality from slices `0009a`..`0009f` without polish extensions.

## Risks & Dependencies

- Risks:
  - Over-polishing may create regressions in mature flows if done too early.
  - Inconsistent adoption if shared primitives are bypassed.
- Dependencies:
  - Depends on core slice surfaces being in place (`0009a`..`0009f`).
  - Best scheduled as final consolidation wave.

## Success Metrics

- UI polish checklist passes across shell, report/viewer, exports/artefacts, chat, and demo surfaces.
- No explicitly excluded wireframe items are reintroduced.
- Design-system usage is increased (fewer one-off UI variants).

## Resolved Spike Decision

- SP-0009-06 resolved (2026-02-11): mandatory polish gate is locked to three checks.
  - State clarity
  - ErrorBanner consistency
  - Interaction accessibility
- Guardrail audit remains mandatory for W-C3/W-C4/W-C5/W-C7/W-C11 exclusions.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-and-magic-patterns-prompts-v2.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
- `docs/04-projects/04-refactors/0007_empty-text-sentinel-chunks/oracle-spike-response.md`
- `apps/web/app/ui`
