# PRD: 0001e Row Statuses + Export Gate + Failure Journeys (Fail-Closed)

Owner: marc
Status: Draft (NO-GO until RH4/RH5 spikes executed)
Date: 2026-02-07
Slug: 0001e-row-status-export-failures

## Introduction / Overview

### Problem
Trust UX requires explicit failure journeys and hard gating. If we allow export with failed evidence, we create false trust.

### Goal
Implement:
- report row terminal statuses and invariants (`needs_review|reviewed|missing_input|citation_failed`)
- missing-doc journeys (`missing_input` + checklist)
- `citation_failed` journey (explicit reasons, non-exportable)
- export gating per API surface (block on `citation_failed` by default)

### Slice
Row statuses + export gate + failure UX. Not building the full Quick Start workflow.

### Primary Observable Effect
On fixture packs:
- missing docs produce `missing_input` with an actionable checklist
- a deliberate bad citation produces `citation_failed` and blocks export with `EXPORT_BLOCKED`

### In Scope
- Status model and invariants per `docs/03-architecture/20_state_model.md`.
- Export contract per `docs/03-architecture/50_api_surface.md`:
  - exports allowed only when `runs.state = completed` (PoC default)
  - block export when any row is `citation_failed` unless demo-only override is enabled
- UI surfaces:
  - report table shows status badges and gating reasons
  - "Export" button shows blocked state and why
  - "Flag citation wrong" action records a safe feedback event (does not leak internals)

## Goals
- Make failure states explicit, actionable, and safe.
- Never silently export untrusted rows by default.

## User Stories

### US-001: Missing docs yields missing_input with checklist
As a reviewer, I want missing inputs to be explicit and actionable so that I can upload the right documents.

#### Acceptance Criteria
- AC-001: Rows with no supporting evidence resolve to `missing_input`.
- AC-002: `missing_input` rows must have:
  - answer exactly `Not found in provided documents.`
  - zero citations
  - `notes` (or provenance) containing a missing-doc checklist with concrete evidence signals (`{label, confidence, signals[]}`)
  - only show high-confidence candidates by default (`confidence >= 0.8`); do not surface low-confidence guesses as "missing"
- AC-003: Missing-doc detection flags `REA.pdf` in `pack_02_missing_rea` and produces no missing-doc flags in `pack_01_clean` (FP=0).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_02_missing_rea/`, `docs/08-example-data/pack_01_clean/`
- Script/harness: `packages/core/src/spikes/rh5_missing_docs_harness.ts`
- Manual checks: open report table and confirm missing-doc checklist is visible and actionable.

### US-002: Bad evidence yields citation_failed and blocks export
As a reviewer, I want evidence failures to block export so that we don't ship untrusted outputs.

#### Acceptance Criteria
- AC-004: A deliberate bad citation (`snippet_hash` mismatch, invalid polygons, or verification fail) yields `citation_failed`.
- AC-004a: Verification is precision-first: deterministic integrity checks short-circuit; any `UNSURE` entailment verdict is treated as `FAIL` (fail-closed).
- AC-005: Export is blocked by default when any row is `citation_failed`:
  - `POST /export/csv` returns non-2xx with `error.code = EXPORT_BLOCKED`
- AC-006: Unsafe override:
  - when `unsafe_override=true` is provided and demo mode is not enabled, return `403 UNAUTHORISED`
  - if demo mode allows unsafe export, the artefact is visibly labelled unsafe and metadata records the override

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/` with one deliberately corrupted citation fixture.
- Dataset (RH4): `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json`
- Script/harness: `packages/core/src/spikes/rh4_verification_harness.ts`
- Manual checks: attempt export; confirm blocked state and API error code.

### US-003: needs_review -> reviewed is explicit and persisted
As a reviewer, I want to mark a row as reviewed so that the table reflects what I've checked.

#### Acceptance Criteria
- AC-007: Rows can transition `needs_review` -> `reviewed` only via explicit user action.
- AC-008: Status invariants hold:
  - `needs_review|reviewed` rows have >=1 locked citation (ADR-0001)

#### Verification
- Manual checks: click "Mark reviewed" on a row and confirm persistence.

## Functional Requirements
- FR-001: Status values are constrained to the state model; do not invent new statuses.
- FR-002: Reason codes recorded in provenance align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md` where possible (e.g. `CITATION_MISMATCH`, `ENTAILMENT_FAIL`).
- FR-003: Export gating must be implemented at the API boundary (server-enforced), not just UI.
- FR-004: All errors use the standard envelope and include `trace_id` for debugging.

## Non-Goals (Out of Scope)
- Full entailment verifier tuning (beyond the spike and conservative v1 rubric).
- Building the entire Quick Start workflow controller (handled in Initiative 0002).

## Failure States & UX
- Export blocked: show clear "blocked" state, list count of `citation_failed` rows, and link to the failing rows.
- Unsafe export disallowed: show message that unsafe override is demo-only.
- Verification/citation failure: show explicit `citation_failed` reason and a "Flag citation wrong" affordance.

## Metrics / Logging
- Events:
  - `row.status_changed` (from/to + actor)
  - `export.blocked` (counts + reason codes)
  - `export.unsafe_override_requested` / `export.unsafe_override_denied`
- Metrics:
  - blocked export rate (by reason code)
  - counts of `missing_input` and `citation_failed` per pack

## Rollback / Disable Plan
- Feature flag: `FEATURE_EXPORTS` (default off).
- Safe fallback: hide export buttons; keep report table read-only.

## Risks & Dependencies
- Blocked by:
  - RH4 verification precision (false passes) and latency budget:
    - Dataset: `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json` (>=20 bad examples)
    - Pass criteria: `false_passes = 0`; treat `UNSURE` as `FAIL`; `p95 <= 8s` per row on dev machine
  - RH5 missing-doc detection heuristics
- Dependencies:
  - citations are lockable and immutable (ADR-0001)
  - report rows persisted per run (`runs.state` used for export preconditions)

## Success Metrics
- `pack_02_missing_rea`: missing docs -> `missing_input` with checklist and exact answer string.
- `pack_01_clean`: deliberate bad citation -> `citation_failed`; export blocked with `EXPORT_BLOCKED`.

## Open Questions
- Do we allow unsafe override at all in the PoC UI, or only via API in a demo-only mode?

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md` (RH4/RH5)
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH4/RH5)
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md` (ADR-0002, ADR-0008)
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/60_observability_and_evals.md`
