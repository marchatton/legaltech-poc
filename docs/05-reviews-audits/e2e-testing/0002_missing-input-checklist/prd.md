# PRD: E2E-0002 Missing Input Checklist (pack_02_missing_rea)

Owner: (TBD)
Status: Draft
Date: 2026-02-09
Slug: e2e-0002-missing-input-checklist

## Introduction / Overview

### Problem
In a high-stakes workflow, “missing inputs” must be a first-class outcome: we must be able to say “Not found” with strict invariants and actionable guidance. This UX is easy to regress (copy changes, checklist rendering, payload parsing, status taxonomy).

### Goal
Define a deterministic e2e scenario that proves:
1) `missing_input` rows render with the exact “Not found in provided documents.” answer and **zero citations**, and
2) the UI surfaces an actionable missing-doc checklist and exception-level missing-doc callouts.

### Slice
One e2e scenario against the **dev-only** seeded Matters UI on `pack_02_missing_rea`.

### Primary Observable Effect
When the scenario passes, a user can switch to `pack_02_missing_rea` and immediately see:
- a `missing_input` row with strict invariants (exact answer, zero citations), and
- a missing document checklist pointing to `REA.pdf`, plus an exceptions-table item marked `missing_doc`.

### In Scope
- Seeded Matters UI route `/matters?pack=pack_02_missing_rea`
- `missing_input` row + checklist rendering
- Exceptions table payload rendering (list payload v0) including `missing_doc` item UX

## Goals

- Prove the `missing_input` invariant is visible and testable in the UI (exact answer, zero citations).
- Prove missing-doc guidance is actionable (filename + evidence signals + checklist copy).
- Provide acceptance criteria that can be automated deterministically.

## User Stories

### US-001: Missing Inputs Are Explicit and Actionable
As a reviewer, when the pack is missing a referenced instrument PDF, I want the system to mark it as `missing_input` with an actionable checklist so I can request the right document and rerun.

#### Acceptance Criteria
- AC-001 (setup): Seed snapshots exist for `pack_02_missing_rea`:
  - `pnpm fixture:seed pack_02_missing_rea --overwrite`
- AC-002: In dev mode, visiting `/matters?pack=pack_02_missing_rea` renders `pack_id: pack_02_missing_rea`.
- AC-003: Row `TB-MISSING-INPUT` exists with:
  - status `missing_input`
  - answer exactly `Not found in provided documents.`
  - no citation chips (UI shows `(no citations)` and there are zero `cit_*` chips in the row)
  - a visible section titled `Missing document checklist`
  - checklist contains an item labeled `REA.pdf`
- AC-004: Row `TS-04` (exceptions table) includes a `missing_doc` item for the REA and renders:
  - item type `Reciprocal Easement Agreement (REA)`
  - badge `missing_doc`
  - `Missing instrument document` callout with expected filename `REA.pdf` and checklist guidance copy
- AC-005 (negative): `missing_input` rows must never render a `Mark reviewed` button (only `needs_review` rows are reviewable).

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_02_missing_rea --overwrite`
  - run app: `pnpm dev`
- Automated checks:
  - (future) e2e runner asserts on:
    - status chip `missing_input`
    - exact answer string
    - zero citation chip anchors rendered for `TB-MISSING-INPUT`
    - presence of checklist item `REA.pdf`
    - exceptions item badge `missing_doc` and callout copy
- Manual checks:
  - Switch pack to `pack_02_missing_rea`
  - Confirm missing_input row + checklist
  - Expand the exceptions table item and confirm the `missing_doc` callout is present

## Functional Requirements

- FR-001: The seeded snapshot row `TB-MISSING-INPUT` must render as `missing_input` with the exact answer `Not found in provided documents.` and must have zero citations.
- FR-002: For `missing_input` rows, the UI must render a `Missing document checklist` derived from provenance signals (filename + evidence signals).
- FR-003: The exceptions table must render list payload v0 and surface exception-level missing-doc UX when `match_status` is `missing_doc`.
- FR-004: Only `needs_review` rows render the `Mark reviewed` affordance.

## Non-Goals (Out of Scope)

- Fixing the missing-doc detection algorithm itself (this scenario verifies UX + invariants, not recall).
- DB-backed ingest/index pipeline and workflow execution.

## Technical Considerations (Optional)

- This scenario depends on seeded snapshot content in `tmp/fixture-seed/pack_02_missing_rea/snapshot.json`.
- The `missing_input` answer string and citation count are hard invariants enforced by deterministic verification.

## Failure States & UX

- If the checklist is missing: user has no actionable next step; treat as regression.
- If `missing_input` row has citations or different answer string: treat as regression (violates trust posture).

## Metrics / Logging

- Test runner should capture:
  - DOM snapshot/screenshot of the missing_input row and checklist
  - any console warnings/errors during payload parsing

## Rollback / Disable Plan

- If seeded snapshots are removed or moved, update the scenario to use the canonical workflow surfaces that produce `missing_input`.

## Risks & Dependencies

- Risk: Copy changes can break the exact-string invariant; tests should assert exact answer string.
- Risk: UI refactors can hide the checklist behind collapsed UI; tests should expand details as needed.

## Success Metrics

- Regression is caught if:
  - missing_input invariant breaks (wrong answer string, citations present)
  - checklist stops rendering or omits `REA.pdf`
  - missing_doc exception UX disappears from the exceptions table

## Open Questions

- Should the e2e suite assert exact evidence signals (source/page), or only assert the presence of `REA.pdf` in the checklist?

## Sources

- Demo runbook: `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md` (Edge case A)
- Pack summary: `docs/08-example-data/packs_summary.md`
- Seeded Matters UI: `apps/web/app/(app)/matters/page.tsx`
- Fixture seed loader: `apps/web/lib/fixtureSeed.server.ts`

