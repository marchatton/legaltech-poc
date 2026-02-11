# PRD: Exports and Artefacts Run-Scoped Parity (0009c)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: exports-and-artefacts

## Introduction / Overview

### Problem
Export and artefact workflows are partially implemented but lack run scoping controls, deep-link continuity to failed rows, and consistent provenance/filter/freshness affordances.

### Goal
Make exports and artefacts run-aware, review-loop friendly, and transparent about provenance/safety.

### Slice
Deliver run selector contract + export/report deep-link continuity + artefact filtering/provenance/freshness behavior.

### Primary Observable Effect
Operators can select the run they are exporting from, jump directly to failed rows for that run, and inspect/download artefacts with clear type/provenance/safety context.

### In Scope
- U29-U36
- W-A8
- N7, N8, N13

## Goals

- Add reusable run list/read model for export/report scoping.
- Standardize export blocked-state pattern and failed-row deep-link behavior.
- Add artefact kind/type filters and explicit provenance columns.
- Improve download feedback and unsafe-tag explanation UX.

## User Stories

### US-001: Shared run selector contract for export/report
As an operator, I want recent completed runs listed consistently so I can scope exports and report views to the right run.

#### Acceptance Criteria
- AC-001: `GET /api/folders/:id/runs` returns recent run list for selector use (including status and timestamps).
  - Example: selector shows newest completed runs and defaults to latest completed run.
  - Negative: selector does not include runs in unknown/incompatible states without clear label.
- AC-002: `GET /api/folders/:id/report` supports `run_id` + `status` filters with response echo.
  - Example: calling with `run_id=R123&status=failed` returns only failed rows for that run.
  - Negative: omitted `run_id` must not silently bind to stale run selection from prior navigation state.

#### Verification
- Pack/fixture/script: seeded folder with multiple runs and mixed statuses.
- Automated checks: API contract tests for runs list and report filter echo.
- Manual checks: selector changes update report/export context correctly.

### US-002: Export panel run scoping and failed-row deep-link continuity
As an operator, I want export actions scoped to a chosen run and a clear path to review failures.

#### Acceptance Criteria
- AC-003: Export panel includes run selector and explicitly shows currently scoped run.
  - Example: changing run selector updates export action target and blocked-state messaging.
  - Negative: export defaults must not silently ignore user-selected run.
- AC-004: Blocked export uses shared panel pattern with `Review failed rows` deep-link carrying `run_id` + failed filter state.
  - Example: clicking deep-link opens report tab scoped to the same run and failed rows only.
  - Negative: deep-link that drops run context is not acceptable.

#### Verification
- Pack/fixture/script: export gate fixtures (safe vs blocked rows).
- Automated checks: deep-link query generation tests.
- Manual checks: blocked export -> review failed rows loop.

### US-003: Artefact filtering and provenance visibility
As an operator, I want artefact filters and provenance fields so I can find the right downloadable output quickly.

#### Acceptance Criteria
- AC-005: Artefact list supports filters for kind/type (`csv`, `docx`, `unsafe`) and exposes `source_run_id`.
  - Example: selecting `unsafe` filter shows only artefacts tagged unsafe with source run metadata visible.
  - Negative: provenance metadata cannot be hidden when filter is active.
- AC-006: Artefact table preserves primary open hierarchy and avoids duplicated/conflicting open CTAs.
  - Example: one primary download action with optional secondary context action.
  - Negative: multiple equal-weight open buttons causing ambiguous intent are not allowed.

#### Verification
- Pack/fixture/script: artefact list with mixed kinds and source runs.
- Automated checks: filter and provenance rendering tests.
- Manual checks: inspect filter combinations and row-level provenance.

### US-004: Download feedback and unsafe explanation pattern
As an operator, I want clear download state and unsafe context so I can trust export actions.

#### Acceptance Criteria
- AC-007: Downloads show loading/completion/freshness feedback for selected artefacts.
  - Example: clicking download shows progress state then completion hint with freshness timestamp.
  - Negative: silent no-op clicks without feedback are not acceptable.
- AC-008: `UNSAFE` tags include explanatory tooltip/panel pattern.
  - Example: tooltip explains why artefact is unsafe and where to review blocking issues.
  - Negative: unsafe tag without explanation is not acceptable parity.

#### Verification
- Pack/fixture/script: safe + unsafe artefact scenarios.
- Automated checks: download state rendering tests.
- Manual checks: unsafe explanation and recovery navigation.

## Functional Requirements

- FR-001: Add/reuse run selector model for export/report surfaces.
- FR-002: Add report deep-link contract carrying `run_id` and failed status state.
- FR-003: Extend artefacts endpoint and UI for filter/provenance fields.
- FR-004: Standardize export blocked panel and unsafe explanation treatment.

## Non-Goals (Out of Scope)

- Server-side saved view persistence for export/report filters.
- Advanced artefact sorting beyond baseline filters.
- Multi-run comparative export generation.

## Technical Considerations

- Shared contracts with chat slice: run list/read model should remain additive and reusable.
- Ensure run selector supports completed-run prioritization for deterministic operator flow.
- Keep blocked/export safety behavior aligned with existing fail-closed posture.

## Failure States & UX

- Missing run list data -> selector disabled state with deterministic message.
- Export blocked -> standardized panel with deep-link to filtered report.
- Download error -> deterministic error code and retry action.

## Metrics / Logging

- Success signals:
  - Export completion rate by selected run.
  - Failed-row deep-link usage rate.
- Debug signals:
  - `export.blocked.view_failed_rows_clicked`.
  - `artefact.filter.changed` with kind/type payload.

## Rollback / Disable Plan

- Feature flag: `export_artefact_run_scope_v1`.
- Safe fallback behavior: preserve current latest-run export behavior and current artefact list UI.

## Risks & Dependencies

- Risks:
  - Run selector contract divergence across export/report/chat surfaces.
  - Deep-link query mismatch between export panel and report routing.
- Dependencies:
  - Depends on folder/run/report API stability.
  - Provides shared run scoping affordances for chat slice (`0009d`).

## Success Metrics

- Run selector and scoped report deep-link are functional end-to-end.
- Artefact filtering/provenance/safety explanations are visible and testable.
- Export blocked-state loop reliably returns operators to failed rows.

## Open Questions

- Should run selector include non-completed runs in a collapsed advanced state or only completed runs in parity v1?

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ExportsTab.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx`
