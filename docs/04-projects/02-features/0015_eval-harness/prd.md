# PRD: Fixture-Driven Eval Harness (Hard Gates + Reports)

Owner: TBD
Status: DRAFT (NO-GO until spikes close)
Date: 2026-02-07

## Summary

Create a lightweight, deterministic eval harness that:
- runs against in-repo fixture packs with `/truth`
- produces per-pack **JSON** + **Markdown** eval reports
- computes and enforces PoC hard gates:
  - schema validity
  - citation integrity
  - expected failure journeys

Optionally wire a report-only CI job that uploads the reports as build artefacts.

## Problem

The PoC’s trust posture depends on deterministic regression detection. Without fixture-driven evals, we will repeatedly discover citation/retrieval regressions during demos.

## Goals

- `fixture:eval` produces per-pack reports (JSON + Markdown) for:
  - `docs/08-example-data/pack_01_clean`
  - `docs/08-example-data/pack_02_missing_rea`
  - `docs/08-example-data/pack_03_bad_citation` (to be added)
- Hard gates align with `docs/03-architecture/60_observability_and_evals.md`:
  - schema validity (100%)
  - citation integrity (100%)
  - expected failure journeys: missing docs -> `missing_input`, bad citation -> `citation_failed`
- Runner exits non-zero when any hard gate fails (even if CI is report-only initially).
- Failure outputs use the canonical failure taxonomy codes.

## Non-goals

- Complex scoring models, dashboards, or “quality” judgement beyond the hard gates.
- Orchestrating ingestion + running workflows inside CI as part of the first slice (keep CI report-only and fast).

## Users

- Developers: need fast feedback loops when changing OCR/chunking/retrieval/verification.
- Demo operator: needs confidence the demo packs still pass.

## Solution

Implement the fixture-driven eval harness described in:
- `docs/03-architecture/60_observability_and_evals.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- ADR-0006 in `docs/03-architecture/DECISIONS.md`

Key design constraints:
- Deterministic outputs for a given pack and produced run outputs.
- Citation integrity uses the canonical `snippet_hash` normalization rule from `docs/03-architecture/30_data_model.md`.

## Scope

In scope:
- Add fixture pack `pack_03_bad_citation` under `docs/08-example-data/`:
  - minimally: `/docs`, `/truth`, and the smallest pack needed to reliably create a `citation_failed` row.
- Implement `fixture:eval` (script/command name per repo conventions) that:
  - reads produced outputs for a pack (at minimum: report rows + citations)
  - compares against `/truth`
  - emits:
    - per-pack JSON report
    - per-pack Markdown summary
    - cross-pack summary table
  - returns non-zero exit code when hard gates fail
- Metrics included in the report:
  - hard gates (pass/fail + counts)
  - failure taxonomy counts (aligned to `docs/03-architecture/60_observability_and_evals.md`)
- Optional: CI wiring (report-only) that uploads the JSON/MD outputs as build artefacts.

Out of scope:
- Gating CI on recall thresholds in the first pass (report-only first).
- Automated model calls inside evals beyond what is required to read persisted outputs.

## Breadboard Mapping

From `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`:
- Parts: F6 (eval harness), F7 (CI integration)
- Code affordances: N12, N13

## User Stories

### US-001 Run Fixture Evals Locally
As a developer, I can run `fixture:eval` for a pack and get a deterministic report so I can catch regressions before demos.

### US-002 Enforce Hard Trust Gates
As a developer, I get a clear pass/fail on schema validity, citation integrity, and failure journeys so we never ship a broken trust moment.

### US-003 Publish Eval Reports In CI (Report-Only)
As a developer, CI uploads eval reports so reviewers can see regressions without running the harness locally.

## Acceptance Criteria

- AC-001: `fixture:eval pack_01_clean` produces per-pack JSON + Markdown reports and a summary table.
- AC-002: `fixture:eval pack_02_missing_rea` produces reports and confirms expected `missing_input` journeys.
- AC-003: `fixture:eval pack_03_bad_citation` fails the hard gate for expected failure journey and reports `citation_failed` taxonomy correctly.
- AC-004: Citation integrity checks validate:
  - cited page exists
  - polygons exist
  - `snippet_hash` matches canonical normalization rule
- AC-005: Runner exits non-zero if any hard gate fails.
- AC-006 (optional CI): CI job runs evals and uploads JSON/MD reports as build artefacts, but does not block merges beyond hard gates until explicitly enabled.

## Verification Plan

- Run locally on the 3 packs and inspect outputs:
  - JSON schema is stable and machine-readable
  - Markdown summary is human-scannable
- Validate taxonomy codes match `docs/03-architecture/60_observability_and_evals.md`.
- Confirm `snippet_hash` normalization matches `docs/03-architecture/30_data_model.md` (no duplicate implementations).

## Risks

- Eval runtime too slow and gets ignored (RH9).
- Citation integrity checks become flaky if underlying storage/polygons are unstable (RH8).

## Open Questions

- Where do the “produced outputs” live for eval reads (DB vs exported artefacts vs file snapshots)?
- Do we need a minimal “truth seeding” path to run evals before the full pipeline exists?

## Links

- `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/60_observability_and_evals.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0006)

