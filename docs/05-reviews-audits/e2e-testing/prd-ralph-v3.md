# PRD: E2E V3 Ralph Journey Decomposition

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-ralph-journey-decomposed
Priority: P0

## Introduction / Overview

### Problem
The original 10 slices were useful for scope coverage but were not decomposed around clear journey groups.

### Goal
Keep a granular story list (10+) while organizing execution into 3-4 core user journeys for a cleaner Ralph testing loop.

### Slice
This PRD decomposes F1-F10 into 14 one-story iterations across 4 core journeys.

### Primary Observable Effect
Ralph loop runs one test intent at a time, but each intent sits inside a clear journey lane with explicit traceability to existing slice PRDs.

## In Scope

- 14 story-level E2E iterations
- 4 journey groups for planning and reporting
- Given/When/Then acceptance criteria per story
- Scenario-step checklists per story for granular execution
- Full references to every file under `docs/05-reviews-audits/e2e-testing`

## Core Journeys

| Journey ID | Name | Story IDs | Journey Coverage |
|---|---|---|---|
| J1 | Entry + Setup | US-001..US-003 | F1, F2 |
| J2 | Run + Review Decisions | US-004..US-006 | F3, F4 |
| J3 | Trust + Export + Provenance | US-007..US-011 | F5, F6, F7 |
| J4 | Chat + Demo + Resilience | US-012..US-014 | F8, F9, F10 |

## Goals

- Preserve granular testing with 10+ stories.
- Avoid ambiguous cross-cutting stories by grouping into journey lanes.
- Keep one-story-per-iteration compatibility with Ralph.
- Maintain direct lineage to the existing `0001`..`0010` slice set.

## User Stories

### J1: Entry + Setup (F1, F2)

### US-001: Validate Shell Wayfinding Baseline
As an operator, I want stable shell wayfinding so I can enter matter workflows confidently.

#### Acceptance Criteria
- Given demo mode and at least one matter, opening `/matters` renders shell with `Matters` active.
- When operator moves list -> detail -> list, navigation state remains deterministic.
- Then environment badge, breadcrumb, and sticky identifiers are visible and non-empty.
- Example: badge shows demo posture and breadcrumb includes `Matters > <Matter Name>`.
- Negative: placeholder tabs do not route to broken or ambiguous screens.

#### Scenario Steps
1. Open `/matters` and validate active shell destination.
2. Enter a matter detail and return.
3. Confirm badge + breadcrumb + sticky ids.
4. Click placeholder tabs and verify deterministic non-broken behavior.

### US-002: Validate Matter Discovery Filtering
As an operator, I want search and saved-view filtering to be deterministic so discovery is reliable.

#### Acceptance Criteria
- Given seeded matters, list supports search and saved-view filters.
- When filters are applied in sequence, row set updates deterministically.
- Then filtered state remains explicit and reversible.
- Example: saved view + query combination yields stable row subset.
- Negative: no filter combination renders ambiguous blank state without guidance.

#### Scenario Steps
1. Apply query filter and record visible row count.
2. Apply saved view and compare reduced set.
3. Clear filters and verify list reset.
4. Trigger empty-match case and verify guidance state.

### US-003: Validate Matter Create + Upload + Readiness Guidance
As an operator, I want matter creation and upload readiness cues so I know when run start is blocked or ready.

#### Acceptance Criteria
- Given valid file input, creating matter and uploading document transitions setup rows through ingest states.
- When readiness is recomputed, reason is explicit (`ready`, `blocked`, `already complete`).
- Then next-action guidance is visible for blocked states.
- Example: missing required docs yields `blocked` with concrete next step copy.
- Negative: create without required matter name fails with visible validation and no new matter.

#### Scenario Steps
1. Create matter with valid name.
2. Upload document and watch ingest transition.
3. Verify readiness label and next-action guidance.
4. Attempt invalid create (empty name) and confirm rejection.

### J2: Run + Review Decisions (F3, F4)

### US-004: Enforce Quick Start Readiness Gate
As an operator, I want Quick Start to enforce readiness so runs cannot start from blocked contexts.

#### Acceptance Criteria
- Given blocked matter, Quick Start is visibly blocked with reason.
- When readiness transitions to runnable, Quick Start can start a run.
- Then run state/progress surfaces immediately.
- Example: blocked-to-ready transition enables run creation without reload hacks.
- Negative: blocked start returns explicit conflict error, not silent failure.

#### Scenario Steps
1. Open blocked matter and inspect Quick Start state.
2. Transition matter to runnable fixture state.
3. Start run and verify progress appears.
4. Re-check blocked behavior remains explicit on blocked fixture.

### US-005: Validate Triage Tab Scope Contract
As a reviewer, I want triage tabs to filter deterministically within run scope.

#### Acceptance Criteria
- Given a run with mixed statuses, tabs (`All`, `Needs Review`, `Reviewed`, `Flagged`) are visible.
- When each tab is selected, rows filter by status only.
- Then run scope remains unchanged while tab changes.
- Example: `Needs Review` count matches visible rows.
- Negative: tab switch never cross-loads rows from another run.

#### Scenario Steps
1. Open report for active run with mixed statuses.
2. Click each triage tab and capture visible counts.
3. Compare counts against row chips.
4. Verify run identifier remains constant while switching tabs.

### US-006: Validate Drawer-First Decisions + Mutation Feedback
As a reviewer, I want drawer decisions to update state with explicit success/failure feedback.

#### Acceptance Criteria
- Given `needs_review` row, opening row launches drawer with row payload.
- When `mark reviewed` or `flag issue` is triggered, row and drawer states update.
- Then copy-to-clipboard action returns explicit confirmation.
- Example: marking reviewed updates row chip without full-page refresh.
- Negative: mutation failure renders `ErrorBanner` and does not pretend success.

#### Scenario Steps
1. Open drawer from `needs_review` row.
2. Execute `mark reviewed`, then reopen row.
3. Execute `flag issue` on another row.
4. Use copy action and confirm message.
5. Trigger mutation error fixture and verify fail state.

### J3: Trust + Export + Provenance (F5, F6, F7)

### US-007: Validate Valid Citation Trust Path
As a reviewer, I want valid citations to render verifiable evidence with trust metadata.

#### Acceptance Criteria
- Given valid citation from report/chat, source chip opens viewer with expected document/page.
- When viewer loads, highlight overlay and trust metadata render from payload.
- Then `Reset to 100% to verify` restores explicit verification posture.
- Example: valid citation shows one or more polygons and no fail panel.
- Negative: missing trust metadata payload shows deterministic fallback state.

#### Scenario Steps
1. Open valid citation from row source chip.
2. Confirm overlay polygons on expected page.
3. Zoom away and reset to 100%.
4. Verify trust footer fields.
5. Simulate metadata omission and verify fallback.

### US-008: Validate Invalid Citation Fail-Closed Path
As a reviewer, I want invalid citations to fail closed with deterministic recovery guidance.

#### Acceptance Criteria
- Given corrupted citation, source chip behavior respects anchor gating.
- When invalid citation is opened, viewer renders `citation_failed` reason code.
- Then no highlight overlay is drawn.
- Example: unresolved anchor chip is disabled with explanation.
- Negative: invalid citation never renders stale/approximate highlight overlays.

#### Scenario Steps
1. Open corrupted citation from report context.
2. Verify fail panel and reason code.
3. Confirm zero overlay polygons.
4. Test unresolved anchor chip disabled state and reason text.

### US-009: Validate Safe Run-Scoped Export Path
As an operator, I want safe exports to run only on completed safe runs.

#### Acceptance Criteria
- Given run selector context, only completed runs are selectable for export.
- When safe run is selected, CSV/DOCX actions produce downloadable artefacts.
- Then artefact metadata remains bound to selected run id.
- Example: safe completed run exports both CSV and DOCX successfully.
- Negative: export action is not enabled for incomplete runs.

#### Scenario Steps
1. Open export surface and inspect run selector.
2. Select safe completed run and export CSV.
3. Export DOCX from same run.
4. Validate returned artefact run id linkage.

### US-010: Validate Blocked Export Recovery Path
As an operator, I want blocked exports to route me back to failed rows with context intact.

#### Acceptance Criteria
- Given run with verification failures, blocked export panel appears deterministically.
- When operator clicks `Review failed rows`, report opens with matching `run_id`.
- Then failed-row filter is pre-applied.
- Example: blocked panel includes failed-row count and recovery CTA.
- Negative: blocked run cannot silently produce export artefact.

#### Scenario Steps
1. Select blocked run in export surface.
2. Verify blocked panel fields and counts.
3. Click recovery CTA.
4. Validate report route contains same run id + failed filter.
5. Confirm no artefact download occurred.

### US-011: Validate Artefact Provenance Retrieval
As an operator, I want artefact filters, provenance labels, and download errors to be explicit.

#### Acceptance Criteria
- Given mixed artefacts (csv/docx, safe/unsafe), list renders provenance metadata.
- When kind/type/safety filters are applied, row set updates deterministically.
- Then each row shows `source_run_id` and actionable download control.
- Example: `unsafe` filter shows only UNSAFE-labelled rows with explanation copy.
- Negative: expired signed URL renders deterministic error state, not silent failure.

#### Scenario Steps
1. Load artefact list and inspect provenance fields.
2. Apply kind/type/safety filters in sequence.
3. Download a valid artefact and verify loading state.
4. Trigger expired URL case and verify explicit error.

### J4: Chat + Demo + Resilience (F8, F9, F10)

### US-012: Validate L1 Run-Scoped Chat Contract
As an operator, I want chat to stay run-scoped with transparent source behavior.

#### Acceptance Criteria
- Given completed runs, chat defaults to most recent completed run.
- When question is submitted, streaming and final response states are explicit.
- Then source chips are clickable only for anchor-ready citations.
- Example: selected/effective run mismatch disclosure appears when metadata differs.
- Negative: no indexed context disables composer with guidance instead of sending request.

#### Scenario Steps
1. Open chat and verify default selected run.
2. Ask question and observe streaming state.
3. Inspect final response source chips.
4. Validate anchor-ready vs disabled source chip behavior.
5. Trigger no-context state and verify composer disable guidance.

### US-013: Validate Demo Operator Pack Loop
As a demo operator, I want pack load/reload/history to behave predictably.

#### Acceptance Criteria
- Given demo mode enabled, toolbar shows explicit `DEMO MODE` posture and allowlisted packs.
- When pack loads, system creates/opens deterministic demo matter and checklist context.
- Then checklist progression and elapsed timing are shown or explicitly unavailable.
- Example: `Load pack again` opens a new demo matter without destructive reset of prior records.
- Negative: non-allowlisted pack id fails validation and creates nothing.

#### Scenario Steps
1. Open demo toolbar and verify allowlist options.
2. Load pack and verify new matter context.
3. Walk checklist states and elapsed time rendering.
4. Use `Load pack again` and verify prior records still accessible.
5. Submit invalid pack id and verify validation error.

### US-014: Validate Cross-Surface Error + Retry + Support Contract
As an operator, I want error behavior to be consistent across surfaces and safely recoverable.

#### Acceptance Criteria
- Given failures across at least three surfaces, each renders deterministic `ErrorBanner`.
- When failure is retryable and handler exists, Retry CTA appears and replays idempotently.
- Then support CTA includes safe context fields (`code`, `trace_id`, `route`) only.
- Example: non-retryable validation error hides Retry CTA and still exposes support path.
- Negative: missing support config shows fallback guidance with copyable identifiers.

#### Scenario Steps
1. Trigger representative failures in export, quick start, and chat/report.
2. Compare error copy/code shape across surfaces.
3. Execute retryable path and verify idempotent recovery.
4. Validate support CTA payload fields.
5. Remove support config and verify fallback guidance state.

## Functional Requirements

- FR-001: Core decomposition uses 4 journeys and 14 stories.
- FR-002: Every story includes both explicit positive and negative criteria.
- FR-003: Story ordering supports one-story-per-iteration Ralph loop.
- FR-004: Each story traces to at least one legacy slice source.

## Non-Goals (Out of Scope)

- Rewriting the legacy `0001`..`0010` PRDs themselves.
- Reducing story count below 10.
- Introducing new product scope beyond F1-F10.

## Verification

- Ralph iteration command:
  - `ralph build 1 --agent=codex --prd docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json --no-commit`
- Shared quality gates per iteration:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
- Browser checks required for UI flows.

## Reference Files (All Under `docs/05-reviews-audits/e2e-testing`)

- `docs/05-reviews-audits/e2e-testing/0001_shell-wayfinding-baseline/prd.md`
- `docs/05-reviews-audits/e2e-testing/0001_shell-wayfinding-baseline/prd.json`
- `docs/05-reviews-audits/e2e-testing/0002_matter-discovery-setup-lane/prd.md`
- `docs/05-reviews-audits/e2e-testing/0002_matter-discovery-setup-lane/prd.json`
- `docs/05-reviews-audits/e2e-testing/0003_run-readiness-triage-core/prd.md`
- `docs/05-reviews-audits/e2e-testing/0003_run-readiness-triage-core/prd.json`
- `docs/05-reviews-audits/e2e-testing/0004_drawer-first-review-decisions/prd.md`
- `docs/05-reviews-audits/e2e-testing/0004_drawer-first-review-decisions/prd.json`
- `docs/05-reviews-audits/e2e-testing/0005_trust-viewer-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0005_trust-viewer-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0006_run-scoped-export-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0006_run-scoped-export-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0007_artefact-provenance-retrieval/prd.md`
- `docs/05-reviews-audits/e2e-testing/0007_artefact-provenance-retrieval/prd.json`
- `docs/05-reviews-audits/e2e-testing/0008_l1-run-scoped-chat/prd.md`
- `docs/05-reviews-audits/e2e-testing/0008_l1-run-scoped-chat/prd.json`
- `docs/05-reviews-audits/e2e-testing/0009_demo-operator-loop/prd.md`
- `docs/05-reviews-audits/e2e-testing/0009_demo-operator-loop/prd.json`
- `docs/05-reviews-audits/e2e-testing/0010_cross-surface-error-contract/prd.md`
- `docs/05-reviews-audits/e2e-testing/0010_cross-surface-error-contract/prd.json`
- `docs/05-reviews-audits/e2e-testing/e2e-v3-summary.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json`
- `docs/05-reviews-audits/e2e-testing/ralph-loop-note.md`
