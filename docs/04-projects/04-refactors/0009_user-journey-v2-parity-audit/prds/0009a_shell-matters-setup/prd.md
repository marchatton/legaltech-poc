# PRD: Shell, Matters List, and Setup Flow Parity (0009a)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: shell-matters-setup

## Introduction / Overview

### Problem
Core shell and setup affordances are the largest early-stage parity gap: missing global navigation structure, weak wayfinding, incomplete matter list actions, and no first-class setup/upload workflow.

### Goal
Ship a coherent shell + matters + setup baseline that supports reliable entry into the rest of the matter workflow.

### Slice
Deliver UI shell/navigation and matter setup affordances plus thin backend contracts for list/search, creation, document readiness, and upload completion.

### Primary Observable Effect
Operators can navigate via a stable shell, find/create matters quickly, upload documents through a guided setup flow, and understand run readiness reasons before launching Quick Start.

### In Scope
- U1-U12 (with U12 cut-line: no new pre-run checklist state machine)
- W-A1, W-A2, W-A3
- N1-N6 contracts

## Goals

- Restore app-shell parity signals (nav, env badge behavior, breadcrumb, sticky wayfinding context).
- Enable searchable matter list with saved-view chips and creation/open workflows.
- Provide first-class document setup workflow backed by existing upload-init/upload-complete contracts.
- Surface explicit run readiness reasons without implementing checklist gating backend.

## User Stories

### US-001: App shell navigation and wayfinding baseline
As an operator, I want stable shell wayfinding so I can always see where I am and where core destinations live.

#### Acceptance Criteria
- AC-001: Shell includes `Matters` plus placeholder-disabled `Runs`, `Alerts`, and `Settings` destinations.
  - Example: `Matters` is clickable; other destinations are visible but disabled with placeholder state.
  - Negative: placeholder tabs are not silently hidden.
- AC-002: Breadcrumb chain and sticky context identifier are visible on list/detail surfaces.
  - Example: detail page shows `Matters > {Matter Name}` and sticky matter ID/name in shell context.
  - Negative: local component breadcrumbs without shell-level persistence are insufficient.
- AC-003: Environment badge contract is explicit (`demo-dev` / `demo-prod` copy path from demo mode state).
  - Example: toolbar shows `DEMO MODE · demo-dev` in dev demo context.
  - Negative: no ambiguous generic badge without environment qualifier when mode is known.

#### Verification
- Pack/fixture/script: demo toolbar + matter routes in app shell.
- Automated checks: component tests for nav and breadcrumb rendering.
- Manual checks: navigate list/detail and confirm sticky wayfinding consistency.

### US-002: Matters list search, saved views, and create/open affordances
As an operator, I want list affordances for search, focus filters, create, and open so I can move quickly between matters.

#### Acceptance Criteria
- AC-004: Matters list supports search (`q`) and state/saved-view chips (`Active`, `Needs Attention`, `Demo Packs`).
  - Example: selecting `Needs Attention` filters rows to matters with blocked/incomplete status.
  - Negative: chip changes that only alter UI locally without query/state reflection are insufficient.
- AC-005: List includes primary `New Matter` CTA and row-level `Open` action.
  - Example: clicking `New Matter` opens creation flow with required name field.
  - Negative: creating a nameless matter is rejected with user-visible validation.
- AC-006: Demo-only `Demo History` side surface is available on list with reopen action.
  - Example: recent demo item shows pack + timestamp + reopen action.
  - Negative: history panel does not show hardcoded sample rows when no real demo data exists.

#### Verification
- Pack/fixture/script: matter list route with seeded demo packs.
- Automated checks: list filtering/search tests; create form validation tests.
- Manual checks: search + filter + create + open + demo history reopen walkthrough.

### US-003: Matter setup documents workflow and upload handoff
As an operator, I want a setup/documents workflow so that ingest readiness is obvious before I run extraction.

#### Acceptance Criteria
- AC-007: Matter setup includes first-class documents workflow with indexed docs list and readiness states.
  - Example: documents list shows parse/ocr/readiness statuses from `GET /api/folders/:id/documents`.
  - Negative: static hardcoded ingest counts/states are not allowed.
- AC-008: Upload flow uses existing init/upload/complete contracts and shows status transitions.
  - Example: upload-init returns capability envelope, then complete triggers ingest and row state updates.
  - Negative: UI must not promise unsupported MIME/capabilities beyond current backend contract.
- AC-009: Setup surface clearly hands off from document ingestion to review/run surfaces.
  - Example: after required docs are ready, UI shows explicit next action to start run/review.
  - Negative: setup completion must not rely on hidden implicit transitions.

#### Verification
- Pack/fixture/script: upload workflow in matter setup route.
- Automated checks: API handler tests for readiness payload and upload completion transitions.
- Manual checks: upload PDF and observe state progression until ready.

### US-004: Quick Start readiness reasons and state copy
As an operator, I want explicit run-state reason copy so I know why Quick Start is ready, blocked, or complete.

#### Acceptance Criteria
- AC-010: Quick Start entry shows reasoned states (`ready`, `blocked`, `already complete`).
  - Example: missing indexed docs renders `blocked` with actionable reason text.
  - Negative: binary disabled button with no explanation is not acceptable.
- AC-011: Run start uses existing readiness preconditions contract (no new checklist state machine).
  - Example: API conflict reasons are surfaced in UX copy when run start is denied.
  - Negative: this slice must not introduce new backend checklist persistence.

#### Verification
- Pack/fixture/script: run start flow with ready and blocked fixtures.
- Automated checks: start-run conflict mapping tests.
- Manual checks: verify all three state copies from UI.

## Functional Requirements

- FR-001: Implement shell IA updates for navigation, breadcrumb, and sticky context.
- FR-002: Extend list endpoint usage for `q`, `state`, and `view` filtering affordances.
- FR-003: Ensure create matter contract enforces explicit name.
- FR-004: Surface documents readiness model and upload capability envelope in setup UI.
- FR-005: Keep run-start gating on existing readiness checks only.

## Non-Goals (Out of Scope)

- Building functional `Runs`, `Alerts`, or `Settings` pages.
- Introducing pre-run checklist backend state machine (U12 deferred).
- Multi-file resumable/chunked upload orchestration.

## Design Considerations

- Preserve existing design system components; wireframe styles are reference-only.
- Keep placeholder destinations visibly disabled, not hidden.
- Maintain keyboard/touch discoverability for all primary actions.

## Technical Considerations

- Contracts: `GET/POST /api/folders`, `GET /api/folders/:id/documents`, upload init/complete routes.
- Validation: matter name required; upload errors map to deterministic UI states.
- Backward compatibility: additive API affordances only.

## Failure States & UX

- Upload-init failure -> deterministic error banner with retry.
- Ingest not ready -> blocked run state with actionable message.
- Empty list/search miss -> explicit empty state + clear/reset affordance.

## Metrics / Logging

- Success signals:
  - Matter creation completion rate.
  - Upload completion-to-ready transition rate.
- Debug signals:
  - `matters.list.filter_applied` with `q/state/view`.
  - `setup.upload.failed` with deterministic error code.

## Rollback / Disable Plan

- Feature flag: `shell_setup_parity_v1` (default off until QA).
- Safe fallback behavior: revert to existing shell/list/setup presentation while preserving additive API fields.

## Risks & Dependencies

- Risks:
  - Readiness states may drift from ingest backend reality.
  - Placeholder navigation could be mistaken for broken links without explicit disabled styling.
- Dependencies:
  - Depends on existing folder/documents/upload APIs staying stable.
  - Unblocks report/chat/export slices by normalizing matter setup entry.

## Success Metrics

- U1-U12 baseline affordances are visible and testable in shell + setup surfaces.
- Matter list supports search/filter/create/open with no hardcoded demo placeholders.
- Operators can upload and reach actionable readiness state without ambiguity.

## Open Questions

- SP-0009-03: exact readiness state taxonomy needed from documents endpoint for setup UX.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/MattersListPage.tsx`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/NewMatterPage.tsx`
