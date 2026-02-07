# PRD: Initiative 0003 (Spine) — Demo-Grade Outputs + Repeatability

Owner: TBD
Status: DRAFT (NO-GO until spikes close)
Date: 2026-02-07
Slug: 0003-demo-grade-outputs

## Introduction / Overview

### Problem
We can generate report rows with locked citations, but we cannot reliably:
- export practitioner-usable artefacts (CSV + a single Word memo),
- list/retrieve exports after the fact, or
- regression-test outputs against fixtures so demos don't regress.

### Goal
Make the PoC demoable and repeatable by adding constrained exports, fixture-driven evals, and safe demo controls without weakening the trust posture.

### Slice
This is the initiative-level PRD spine. Implementation is split into thin PRD dossiers:
- CSV exports + artefacts list: `docs/04-projects/02-features/0004_csv-export/prd.md`
- Word export: `docs/04-projects/02-features/0005_word-export/prd.md`
- Eval harness: `docs/04-projects/02-features/0006_eval-harness/prd.md`
- Demo reliability pack: `docs/04-projects/02-features/0007_demo-reliability/prd.md`

### Primary Observable Effect
From fixture packs under `docs/08-example-data/`, a demo operator can run a demo twice in a row (no destructive reset via HTTP) and produce/export/download deterministic CSV + Word artefacts, while developers can run deterministic fixture evals that enforce hard trust gates.

### In Scope
- Constrained exports (3 CSV kinds + 1 memo docx) that fail closed by default and respect the canonical state model and API surface.
- Artefact persistence + listing with fresh signed download URLs.
- Fixture-driven eval harness with hard gates and per-pack reports.
- Dev-only/feature-flagged demo controls (pack loader + checklist; no destructive reset via HTTP in slice 1).

## Goals

- Exports are deterministic and trustworthy:
  - stable schemas + deterministic ordering
  - no silent exporting around `citation_failed` rows (ADR-0002)
- Regression safety:
  - fixture-driven hard gates for schema validity, citation integrity, and expected failure journeys
- Demo repeatability:
  - load known packs and run the demo twice with no manual cleanup and no risky deletion capability

## User Stories

### US-001: Export Demo-Grade Artefacts
As a demo operator, I want to export the 3 CSV artefacts and a single memo docx from a completed run so I can share outputs outside the UI.

#### Acceptance Criteria
- From `docs/08-example-data/pack_01_clean`, operator can export:
  - requirements tracker CSV
  - exceptions table CSV
  - survey issues CSV
  - memo docx
- Exports are only available when `runs.state = completed`.
- Exports fail closed by default when any row is `citation_failed` (blocked, with clear UX). Any override behavior is explicitly scoped and not shipped in the first slice unless proven safe.

#### Verification
- See PRDs: 0004 and 0005.

### US-002: Detect Regressions With Fixture Evals
As a developer, I want a deterministic eval harness that runs against fixture packs and produces per-pack reports so I can catch regressions before demos.

#### Acceptance Criteria
- `fixture:eval` produces per-pack JSON + Markdown reports for:
  - `docs/08-example-data/pack_01_clean`
  - `docs/08-example-data/pack_02_missing_rea`
  - negative case: `pack_01_clean` with a deliberately corrupted locked citation (forces `citation_failed` / `CITATION_MISMATCH`)
- Hard gates align with `docs/03-architecture/60_observability_and_evals.md`:
  - schema validity (100%)
  - citation integrity (100%)
  - expected failure journeys (missing docs -> `missing_input`, bad citation -> `citation_failed`)

#### Verification
- See PRD: 0006.

### US-003: Run Demos Twice Safely
As a demo operator, I want to load known fixture packs and re-run the demo twice without manual cleanup and without any destructive reset endpoint that could delete non-demo data.

#### Acceptance Criteria
- Demo toolbar is dev-only / feature-flagged and not reachable when demo mode is off.
- Operator can load `pack_01_clean` and `pack_02_missing_rea`, landing in a freshly created matter each time.
- Loading the same pack twice creates two distinct matters; no deletion/reset via HTTP is required.
- Demo checklist exists and matches the actual operator flow.

#### Verification
- See PRD: 0007.

## Functional Requirements

- FR-001: All implementation must conform to canonical contracts:
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/60_observability_and_evals.md`
  - `docs/03-architecture/DECISIONS.md` (ADRs, especially ADR-0001/0002/0005/0006/0008)
- FR-002: Exports must not parse prose from `report_rows.answer` to reconstruct structure.
  - Exports consume a structured `export_payload` persisted by Initiative 002 (recommended: `report_rows.provenance_json.export_payload` + `schema_version`).
- FR-003: No destructive reset/delete HTTP endpoints are shipped as part of the first demo repeatability slice.

## Non-Goals (Out of Scope)

- Per-firm template customization, tone tuning, or a template editor UI.
- Excel formatting beyond CSV.
- “Perfect” Word formatting across all documents and viewers.
- Orchestrating ingestion + runs inside CI as part of the first eval harness slice.
- Any workflow that depends on external web research inside runs (ADR-0007).

## Failure States & UX

- Export not ready: run is not completed -> export disabled; API returns `409 CONFLICT` if called anyway.
- Export blocked: any `citation_failed` row -> `EXPORT_BLOCKED` with counts + remediation path; no silent partial export.
- Demo mode off: demo controls not rendered; pack load action rejected.

## Metrics / Logging

- Export attempts by `kind` + result (`success|blocked|conflict|fail`).
- Fixture eval hard gate pass/fail per pack over time.
- Demo pack load events (pack name, created folder_id/run_id).

## Rollback / Disable Plan

- Feature-flag export UI affordances and demo toolbar off by default until verified on `pack_01_clean`.
- Evals can run report-only first; CI hard gating only when explicitly enabled.

## Risks & Dependencies

- Dependency: Initiative 002 must persist structured `export_payload` + `schema_version`; otherwise exports must fail closed (or the “tracker-grade CSV” claim must be cut).
- Spikes not executed yet: CSV header usability, Word template section list, minimal eval metrics, demo mode necessity.
- Safety: any future destructive reset tooling must have provable guardrails and an ADR; do not ship casually.

## Success Metrics

- Demo operator can run the same demo twice in a row without manual cleanup and without any risky delete capability.
- Export + download path works end-to-end for fixture packs and is deterministic.
- Fixture hard gates catch at least one intentional regression via a corrupted-citation negative case before demo day.

## Open Questions

- Do we ever allow `unsafe_override` exports? If yes, how are they demo-only and visibly unsafe?
- Final CSV header lists + deterministic row ordering rules per kind.
- Final memo template sections + citation rendering format.

## Sources

- Brief: `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- Breadboard: `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- Risks: `docs/04-projects/02-features/0003_demo-grade-outputs/risk-register.md`
- Spikes: `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`
- Child PRDs:
  - `docs/04-projects/02-features/0004_csv-export/prd.md`
  - `docs/04-projects/02-features/0005_word-export/prd.md`
  - `docs/04-projects/02-features/0006_eval-harness/prd.md`
  - `docs/04-projects/02-features/0007_demo-reliability/prd.md`
