# PRD: Shell + Setup + Demo Polish (0009g1)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: shell-setup-demo-polish

## Introduction / Overview

### Problem
Shell, setup, and demo surfaces are high-frequency entry points, but polish is inconsistent across loading/empty/blocked states, CTA clarity, and error interaction behavior.

### Goal
Polish `/matters` shell + setup + demo surfaces with deterministic, design-system-first UI behavior while minimizing cross-team merge conflicts.

### Slice
Route-focused polish for shell/setup/demo files only, excluding detail-surface components owned by `0009g2`.

### Primary Observable Effect
Operators get consistent state messaging and action hierarchy in shell/setup/demo flows with predictable keyboard/touch behavior.

### In Scope
- `/matters` shell and wayfinding polish.
- Setup/readiness and upload-related state/copy consistency.
- Demo checklist card/supporting UI polish on matter-level entry surfaces.
- ErrorBanner and fallback consistency where these surfaces show deterministic failures.

## Goals

- Standardize state clarity for shell/setup/demo surfaces.
- Improve CTA hierarchy and focus behavior on entry workflows.
- Keep error/support behavior aligned with `0009f` patterns.
- Reuse shared components from `apps/web/app/ui` before route-local variants.

## User Stories

### US-001: Shell/setup/demo state clarity sweep
As an operator, I want consistent loading/empty/blocked/success states on entry surfaces so I can recover quickly.

#### Acceptance Criteria
- AC-001: Shell/setup/demo states use deterministic copy and next-step guidance.
  - Example: setup blocked states include actionable recovery path rather than generic placeholder text.
  - Negative: no blank or spinner-only states without context.
- AC-002: Shared state primitives (skeleton/empty/error blocks) are reused from design-system components where available.
  - Example: same skeleton rhythm appears across shell and setup async sections.
  - Negative: no one-off per-route state patterns that diverge visually/behaviorally.

#### Verification
- Pack/fixture/script: shell/setup/demo fixture scenarios for loading, empty, blocked, success.
- Automated checks: rendering tests for state components on targeted surfaces.
- Manual checks: `/matters` entry walkthrough with setup + demo states.

### US-002: Entry-surface action hierarchy and accessibility polish
As an operator, I want primary/secondary actions and focus behavior to be predictable on shell/setup/demo flows.

#### Acceptance Criteria
- AC-003: Each entry-surface context has one clear primary action and clearly secondary alternatives.
  - Example: setup panel promotes one primary "next action" while support actions remain secondary.
  - Negative: no competing equal-weight CTAs in the same context.
- AC-004: Hover-dependent affordances have keyboard/touch-visible equivalents with correct focus return.
  - Example: keyboard-only path can complete setup navigation without hidden hover affordances.
  - Negative: no required interaction discoverable only on hover.

#### Verification
- Pack/fixture/script: keyboard/touch smoke checklist for shell/setup/demo.
- Automated checks: interaction tests for focus order/return on updated controls.
- Manual checks: keyboard-only entry flow walkthrough.

### US-003: Error/support consistency on shell/setup/demo surfaces
As an operator, I want deterministic errors and recovery actions to behave the same way across entry surfaces.

#### Acceptance Criteria
- AC-005: ErrorBanner fields and retry/support behavior on shell/setup/demo match `0009f` rules.
  - Example: retry is shown only when `retryable=true`; support fallback appears when target unavailable.
  - Negative: no bespoke error layout or field mapping drift.
- AC-006: Missing metadata and unavailable actions show explicit fallback copy.
  - Example: unavailable support target surfaces copyable deterministic identifiers.
  - Negative: no dead-end disabled actions with no explanation.

#### Verification
- Pack/fixture/script: deterministic error fixtures for shell/setup/demo routes.
- Automated checks: ErrorBanner rendering and action-gating tests.
- Manual checks: failure-path walkthrough for setup/demo actions.

## Functional Requirements

- FR-001: Apply state clarity patterns to shell/setup/demo surfaces using shared design-system primitives.
- FR-002: Normalize entry-surface CTA hierarchy and interaction accessibility.
- FR-003: Align deterministic error/support behavior with `0009f` contracts.
- FR-004: Keep scope limited to shell/setup/demo-owned files to reduce merge conflicts.

## Non-Goals (Out of Scope)

- Report/viewer/exports/chat detail-surface polish (owned by `0009g2`).
- New backend contract work beyond existing slice APIs.
- Reopening deferred parity cuts.

## Technical Considerations

- Prefer updates in route files/components used by `/matters` and setup/demo entry flows.
- Use `apps/web/app/ui` primitives before adding route-local component variants.
- Keep shared component edits additive and minimal to lower conflict risk.

## Failure States & UX

- Ambiguous entry state text can cause wrong next action selection.
- Missing keyboard/touch equivalents can block non-mouse workflows.
- Error handling drift from `0009f` can reduce trust in recovery paths.

## Metrics / Logging

- Success signals:
  - Fewer shell/setup/demo polish defects in QA pass.
  - Faster completion of entry/setup flows in manual smoke checks.
- Debug signals:
  - Count of entry-surface fallback/error states observed during verification.

## Rollback / Disable Plan

- Feature flag: `ui_polish_sweep_shell_v1`.
- Safe fallback: retain pre-polish shell/setup/demo UI from `0009a` and `0009e`.

## Risks & Dependencies

- Risks:
  - Shared component edits can still collide if detail-surface scope leaks into this slice.
  - Over-polish on entry surfaces can obscure deterministic status messaging.
- Dependencies:
  - Blocked by `0009a/US-004` (readiness/state copy baseline).
  - Blocked by `0009e/US-003` (demo shortcut surface availability).
  - Blocked by `0009f/US-002` (reusable ErrorBanner integration baseline).

## Success Metrics

- Shell/setup/demo polish checks pass with deterministic state messaging.
- Keyboard/touch accessibility checks pass on entry-surface critical actions.
- Error/support behavior matches `0009f` contract across touched entry surfaces.

## Resolved Spike Decision

- SP-0009-06 applies: mandatory checks are enforced in this slice where relevant.
  - State clarity.
  - ErrorBanner consistency.
  - Interaction accessibility.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009e_demo-operator-loop/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
- `apps/web/app/ui`
