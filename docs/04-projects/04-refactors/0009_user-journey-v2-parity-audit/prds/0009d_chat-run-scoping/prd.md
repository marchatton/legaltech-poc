# PRD: Chat Run Scoping and Source Navigation Parity (0009d)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: chat-run-scoping

## Introduction / Overview

### Problem
Matter chat has composer/streaming basics but lacks explicit run scoping controls, source-to-evidence navigation, mismatch warnings, and no-context guidance.

### Goal
Deliver parity v1 (`L1`) chat scoping and trust affordances without expanding into heavier L2/L3 orchestration.

### Slice
Implement chat run chip/picker, run-scoped request metadata, source-jump behavior, mismatch warning, and empty/disabled guidance.

### Primary Observable Effect
Users can choose a recent completed run for chat context, see selected/effective run metadata, and jump from sources to evidence when anchors exist.

### In Scope
- U37-U43 (U38/U39 already implemented, retained as compatibility constraints)
- W-A9
- N11, N12

## Goals

- Lock scope to `L1` run scoping (selected run + mismatch metadata).
- Provide clickable sources with deterministic disabled behavior when anchors are absent.
- Add selected-message source rail to improve source discoverability.
- Prevent dead-end chat input states when no indexed docs/context exists.

## User Stories

### US-001: Run chip and recent completed run picker
As an operator, I want a run chip and picker in chat so I can control which run context the assistant uses.

#### Acceptance Criteria
- AC-001: Chat surface shows active run chip and selector populated from recent completed runs.
  - Example: selecting run `R123` updates chip and next request payload with `run_id=R123`.
  - Negative: selector must not include unknown runs without clear disabled/unavailable labeling.
- AC-002: Default behavior remains deterministic when no explicit run is selected.
  - Example: chat defaults to latest completed run with visible selected/effective run copy.
  - Negative: implicit run switches without visible metadata are not allowed.

#### Verification
- Pack/fixture/script: folder with multiple completed runs.
- Automated checks: run picker state + payload tests.
- Manual checks: select different runs and verify chip/payload consistency.

### US-002: Backend run-scoped chat metadata contract (L1)
As an operator, I want response metadata about selected/effective run so I can trust scope behavior.

#### Acceptance Criteria
- AC-003: `POST /api/folders/:id/chat` accepts optional `run_id` and returns stream metadata (`selected_run_id`, `effective_run_id`, `scope_mismatch`).
  - Example: stale `run_id` falls back to effective run with mismatch flag surfaced.
  - Negative: request must not silently ignore invalid run without explicit mismatch metadata.
- AC-004: L1 scope boundary is enforced.
  - Example: no multi-run compare semantics are exposed.
  - Negative: L2 strict isolation and L3 compare/merge are out-of-scope.

#### Verification
- Pack/fixture/script: chat requests with valid, stale, and missing `run_id`.
- Automated checks: API contract tests for metadata fields.
- Manual checks: verify mismatch behavior in UI.

### US-003: Source chips jump to evidence with deterministic fallback
As an operator, I want source chips to open evidence directly when possible so I can verify claims quickly.

#### Acceptance Criteria
- AC-005: Source chips are clickable when citation anchor mapping exists and open evidence viewer at target location.
  - Example: clicking source opens viewer on document/page anchor.
  - Negative: chips without anchors must not attempt broken navigation.
- AC-006: Non-jumpable sources show friendly disabled hover/copy.
  - Example: tooltip says source cannot be jumped because anchor is unavailable.
  - Negative: disabled source state must not appear as interactive link.

#### Verification
- Pack/fixture/script: chat messages with mixed jumpable and non-jumpable citations.
- Automated checks: chip enable/disable mapping tests.
- Manual checks: click-through behavior and fallback copy.

### US-004: Selected-message sources rail and mismatch warning UI
As an operator, I want a dedicated sources rail so I can inspect provenance for the selected message.

#### Acceptance Criteria
- AC-007: Selecting a chat message opens/updates a side rail listing that message's sources.
  - Example: side rail updates immediately when selecting a different response message.
  - Negative: rail must not show stale sources from previous selection.
- AC-008: Run mismatch warning appears when selected/effective run diverges.
  - Example: warning banner indicates chat used effective run `R200` instead of selected `R123`.
  - Negative: mismatch state must not be hidden in debug-only logs.

#### Verification
- Pack/fixture/script: chat thread with multiple messages and mixed source sets.
- Automated checks: rail selection/mismatch UI tests.
- Manual checks: message selection and warning behavior.

### US-005: Empty and no-context onboarding states
As an operator, I want guided prompts and disabled-input copy when context is unavailable so I can recover quickly.

#### Acceptance Criteria
- AC-009: Empty chat state provides suggested prompts with one-click injection.
  - Example: clicking suggested prompt inserts text into composer and keeps editability.
  - Negative: suggested prompts cannot auto-send without user confirmation.
- AC-010: Chat input disables with guidance when no indexed docs/context are available.
  - Example: disabled composer explains which setup step is missing.
  - Negative: silent disabled input with no guidance is unacceptable.

#### Verification
- Pack/fixture/script: empty matter + indexed matter scenarios.
- Automated checks: empty/disabled state component tests.
- Manual checks: prompt injection and no-context guidance.

## Functional Requirements

- FR-001: Add run picker UI state and selected/effective run display in chat.
- FR-002: Extend chat API contract to include optional `run_id` and scope metadata.
- FR-003: Add citation source click-to-evidence behavior with deterministic fallback copy.
- FR-004: Add selected-message source rail and mismatch warning surface.
- FR-005: Add empty/no-context onboarding patterns in chat panel.

## Non-Goals (Out of Scope)

- L2 strict run isolation semantics.
- L3 multi-run compare/merge UX.
- Backend-heavy source reconstruction/fuzzy anchor recovery.

## Technical Considerations

- Prefer additive chat stream metadata fields to avoid breaking current stream consumers.
- Reuse run selector endpoint/shape from exports slice where possible.
- Keep source-jump behavior gated by explicit anchor availability.

## Failure States & UX

- Invalid or stale `run_id` -> mismatch warning + effective run disclosure.
- Missing source anchor -> disabled chip + explanatory message.
- No indexed docs -> disabled composer + setup guidance.

## Metrics / Logging

- Success signals:
  - Run picker usage rate in chat.
  - Source chip click-through rate.
- Debug signals:
  - `chat.scope.mismatch` with selected/effective run IDs.
  - `chat.source.jump.unavailable` reason code distribution.

## Rollback / Disable Plan

- Feature flag: `chat_run_scope_l1`.
- Safe fallback behavior: current latest-run implicit chat behavior.

## Risks & Dependencies

- Risks:
  - Scope mismatch copy may be misunderstood without precise wording.
  - Missing anchor rates may reduce perceived usefulness of source chips.
- Dependencies:
  - Depends on run selector contract from `0009c`.
  - Depends on evidence viewer route integration from `0009b`.

## Success Metrics

- Operators can intentionally scope chat to a run and understand effective scope.
- Source chips reliably open evidence when possible and fail gracefully otherwise.
- No-context chat states provide actionable recovery guidance.

## Open Questions

- SP-0009-01: fallback policy when selected run is stale/incomplete.
- SP-0009-02: minimum anchor coverage threshold for enabling jump affordance by default.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ChatTab.tsx`
