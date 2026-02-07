# PRD: Fixture-Driven Eval Harness (Hard Gates + Reports)

Owner: TBD
Status: DRAFT (GO: spike outcomes locked; pack_09_bad_citation added)
Date: 2026-02-07

## Summary

Create a lightweight, deterministic eval harness that:
- runs against in-repo fixture packs with `/truth`
- produces per-pack **JSON** + **Markdown** eval reports
- computes and enforces PoC hard gates:
  - schema validity
  - citation integrity
  - expected failure journeys
  - export truth match (CSV outputs match `/truth`)

Optionally wire a report-only CI job that uploads the reports as build artefacts.

## Problem

The PoC’s trust posture depends on deterministic regression detection. Without fixture-driven evals, we will repeatedly discover citation/retrieval regressions during demos.

## Goals

- `fixture:eval` produces per-pack reports (JSON + Markdown) for:
  - `docs/08-example-data/pack_01_clean`
  - `docs/08-example-data/pack_02_missing_rea`
  - `docs/08-example-data/pack_09_bad_citation`
- Hard gates align with `docs/03-architecture/60_observability_and_evals.md` (plus export determinism for Initiative 0003):
  1) schema validity (100%)
  2) citation integrity (100%)
  3) expected failure journeys (must fail in the expected way)
  4) export truth match (CSV outputs match `/truth`)
- Runner exits non-zero when any hard gate fails (relative to the pack’s expected outcomes).
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
- Manifest-driven: the eval runner must read `docs/08-example-data/<pack_id>/manifest.json` and fail if missing (no directory inference).
- PoC default: **snapshot-first**. For v1, `fixture:eval` reads file snapshots under each pack’s `/produced/` directory (no DB required). A DB-backed mode can be added later as an optional integration test.

### Export truth match mechanism (v1)
To avoid duplicating export mapping logic, `fixture:eval` must generate CSV outputs using the shared CSV mappers (the same mapping logic used by the export endpoints), using `/produced/report_rows.json` + `/produced/citations.json` snapshots as inputs. The generated CSVs are then compared to `/truth/expected_*.csv` (normalise line endings to LF).

Taxonomy note:
- Row failure reasons are Tier 2 `reason_code` values. If a CSV schema uses a header named `failure_code`, that column still carries the Tier 2 `reason_code` (not Tier 1 step failure codes).

## Scope

In scope:
- Implement `fixture:eval` (script/command name per repo conventions) that:
  - reads produced outputs for a pack from `/produced` snapshots (at minimum: report rows + citations)
  - compares against `/truth`
  - emits:
    - per-pack JSON report
    - per-pack Markdown summary
    - cross-pack summary table
  - returns non-zero exit code when hard gates fail
- Fixture pack `pack_09_bad_citation` under `docs/08-example-data/`:
  - minimally:
    - `/docs/` smallest PDF set required for the pack
    - `/truth/expected_failure_journeys.json` identifying at least one `question_id` expected to be `citation_failed`
    - `/truth/expected_*.csv` files as required by export truth match (can be minimal/empty but must exist)
    - `/produced/report_rows.json` containing at least one row with `status="citation_failed"` and a safe failure reason code
    - `/produced/documents.json` with filenames + page_count so citation checks can validate bounds
    - `/produced/citations.json` if any produced rows reference citations
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
As a developer, I get a clear pass/fail on schema validity, citation integrity, failure journeys, and export truth match so we never ship a broken trust moment.

### US-003 Publish Eval Reports In CI (Report-Only)
As a developer, CI uploads eval reports so reviewers can see regressions without running the harness locally.

## Acceptance Criteria

- AC-001: `fixture:eval pack_01_clean` produces per-pack JSON + Markdown reports and a summary table.
- AC-002: `fixture:eval pack_02_missing_rea` produces reports and confirms expected `missing_input` journeys (answer must be exactly `Not found in provided documents.`).
- AC-003: `fixture:eval pack_09_bad_citation` produces reports and confirms the expected `citation_failed` journey (including a safe failure reason code in provenance / report details).
- AC-004: Citation integrity checks validate (at minimum):
  - cited page exists
  - polygons exist
  - `snippet_hash` matches canonical normalization rule
- AC-005: Export truth match validates that CSVs generated via the shared CSV mappers from `/produced/report_rows.json` + `/produced/citations.json` match `/truth/expected_*.csv` (normalising line endings to LF), including locked header order and deterministic row ordering.
- AC-006: Runner exits non-zero if any hard gate fails for any pack.
- AC-007 (optional CI): CI job runs evals and uploads JSON/MD reports as build artefacts, but does not block merges beyond hard gates until explicitly enabled.

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

- None for slice 0006 (spike outcomes locked).
- Remaining work: wire `fixture:eval` to read pack snapshots under `/produced` and assert failure journeys from `/truth/expected_failure_journeys.json`.

## Links

- `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/60_observability_and_evals.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0006)
