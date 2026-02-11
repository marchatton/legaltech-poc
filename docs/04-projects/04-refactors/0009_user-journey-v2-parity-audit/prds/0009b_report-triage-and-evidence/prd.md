# PRD: Report Triage and Evidence Workflow Parity (0009b)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: report-triage-and-evidence

## Introduction / Overview

### Problem
Report triage and evidence review remain fragmented: missing row triage tabs, no dedicated row drawer action flow, weak split-view ergonomics, and incomplete trust metadata/recovery UX.

### Goal
Deliver a fast, auditable report review workflow where operators can filter rows, inspect evidence, make decisions, and recover from citation issues without context loss.

### Slice
Implement report triage drawer + evidence viewer parity with thin/moderate backend affordances for review mutations and trust metadata.

### Primary Observable Effect
Operators can move from row list -> row drawer -> evidence viewer -> review decision in one loop, with clear trust and failure states.

### In Scope
- U15, U17-U28
- W-A4, W-A5, W-A6, W-A7, W-A10, W-A11
- N8, N9, N10, N12, N15

## Goals

- Add row triage tabs and high-density report-table scanning patterns.
- Ship dedicated row drawer with decision actions and metadata.
- Make split-view evidence workflow explicit (controls, loading, focus/close behavior).
- Improve trust/failure messaging for citation review and feedback.

## User Stories

### US-001: Report triage tabs and scalable table behavior
As an operator, I want report rows organized by triage tabs so I can focus on unresolved work quickly.

#### Acceptance Criteria
- AC-001: Report supports local row-status tabs (`All`, `Needs Review`, `Reviewed`, `Flagged`) and sticky header scanning pattern.
  - Example: selecting `Needs Review` updates visible rows and keeps tab/filter state in URL.
  - Negative: tab state cannot reset unexpectedly on pagination/sort interaction.
- AC-002: Table behavior is optimized for dense review loops.
  - Example: sticky header stays visible during long-list scroll.
  - Negative: dense mode does not remove critical status or provenance context.

#### Verification
- Pack/fixture/script: report route with mixed row statuses.
- Automated checks: tab/filter state tests.
- Manual checks: scroll/triage behavior on long report tables.

### US-002: Row drawer as primary review decision surface
As an operator, I want a row drawer that centralizes row details and actions so I can complete reviews without context switching.

#### Acceptance Criteria
- AC-003: Rows open into a drawer with structured payload, citation summary, and metadata (`schema field`, `data type`, `model/version`).
  - Example: clicking a row opens drawer while preserving list position.
  - Negative: inline-only cards without drawer action are not acceptable parity.
- AC-004: Drawer supports `Mark reviewed`, `Flag issue`, and `Copy extracted answer` actions.
  - Example: marking reviewed updates row status in table immediately.
  - Negative: mutation errors must not silently fail; user sees deterministic feedback.

#### Verification
- Pack/fixture/script: report rows with mixed confidence/citation states.
- Automated checks: row mutation handler tests.
- Manual checks: open drawer, take action, confirm table state updates.

### US-003: Split-view evidence workflow with explicit controls
As an operator, I want stable split-view evidence controls so I can validate citations while maintaining row context.

#### Acceptance Criteria
- AC-005: Split-view lock keeps row context and evidence viewer visible together.
  - Example: operator can pin split view and navigate row list without closing viewer.
  - Negative: split-view state loss on minor navigation is not acceptable.
- AC-006: Evidence viewer includes loading skeleton, page controls, and explicit `Reset to 100% to verify` behavior.
  - Example: zooming away from 100% reveals reset CTA and returns verification state at 100%.
  - Negative: verification status is never implied without explicit state copy.
- AC-007: Modal interaction contract supports Esc close, backdrop close, and focus return target.
  - Example: closing viewer returns keyboard focus to originating row trigger.
  - Negative: close behavior must not trap keyboard focus.

#### Verification
- Pack/fixture/script: citation viewer highlight fixtures.
- Automated checks: viewer control/state tests.
- Manual checks: keyboard + pointer interaction pass.

### US-004: Trust metadata rail and footer contract
As an operator, I want explicit trust metadata so I can audit why a row is trustworthy.

#### Acceptance Criteria
- AC-008: Metadata rail/footer exposes trust fields (`doc_version`, `verified_at`, `loaded_state`, source provenance).
  - Example: trust footer values are rendered from API payload, not hardcoded literals.
  - Negative: placeholder trust claims without source-backed fields are not allowed.

#### Verification
- Pack/fixture/script: report/citation payload with nullable trust fields.
- Automated checks: payload-to-UI mapping tests.
- Manual checks: verify trust metadata rendering for present/absent values.

### US-005: Citation failure recovery and feedback acknowledgement
As an operator, I want clear recovery actions when citation quality fails so I can continue workflow safely.

#### Acceptance Criteria
- AC-009: `citation_failed` states include deterministic reason code + recovery checklist steps.
  - Example: user sees steps to review failed rows and retry relevant action.
  - Negative: no raw JSON-only dead-end links without actionable UI path.
- AC-010: `Flag citation wrong` is available as a UI-only acknowledgement flow in parity v1.
  - Example: action confirms with "Thanks, we'll investigate" without persistence.
  - Negative: this slice does not require new citation-flag persistence endpoint.

#### Verification
- Pack/fixture/script: rows with `citation_failed` states.
- Automated checks: failure-state rendering tests.
- Manual checks: flag action + recovery checklist walkthrough.

## Functional Requirements

- FR-001: Add report row-status tab/filter model and URL sync.
- FR-002: Add row drawer open interaction and review mutations.
- FR-003: Add split-view lock state + viewer controls/focus behavior.
- FR-004: Expose trust metadata fields from report/citation payloads.
- FR-005: Keep citation flag feedback UI-only for parity v1.

## Non-Goals (Out of Scope)

- Persistent citation dispute workflow/lifecycle.
- Fuzzy anchor recovery heuristics for broken citations.
- Full assignment/queue management for reviewer operations.

## Technical Considerations

- Shared APIs: `GET /api/folders/:id/report`, `PATCH /api/report-rows/:id`, citation/render routes.
- Viewer state should remain client-managed in parity v1 (no backend layout persistence required).
- Trust metadata fields should be nullable and additive.

## Failure States & UX

- Missing anchor -> disabled jump affordance with friendly reason.
- Mutation failure -> deterministic ErrorBanner path.
- Citation failed -> guided recovery checklist and clear escalation path.

## Metrics / Logging

- Success signals:
  - Time-to-review completion per row.
  - Share of rows resolved without leaving report context.
- Debug signals:
  - `report.row_drawer.opened`, `report.row_action.failed`.
  - `viewer.jump.disabled` reasons distribution.

## Rollback / Disable Plan

- Feature flag: `report_evidence_parity_v1`.
- Safe fallback behavior: keep existing inline row review and citation viewer behavior.

## Risks & Dependencies

- Risks:
  - Viewer interaction changes can regress keyboard accessibility.
  - Review mutation contract may conflict with existing row status invariants.
- Dependencies:
  - Depends on setup/data readiness from `0009a`.
  - Supports downstream export/chat trust workflows.

## Success Metrics

- Operators can triage rows via tabs and complete review decisions in drawer.
- Evidence viewer supports explicit verification controls and stable split-view behavior.
- Citation failure handling is actionable and user-visible.

## Open Questions

- SP-0009-02: anchor coverage threshold for reliable jump-to-evidence defaults.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ReportTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/RowDrawer.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx`
