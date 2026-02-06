# PRD Bundle: Initiative 002 — Quick Start Engine

Owner:
Status: Draft
Date: 2026-02-05

## Summary

This bundle captures thin PRD slices derived from breadboards 2.1–2.6. Each slice is a discrete, testable capability tied to acceptance packs.

## Problem

Current analysis is manual and slow, and outputs are not deterministic. We need a testable pipeline that produces a reliable first-pass report with evidence.

## Goals

- Deterministic outputs for target packs.
- Evidence-backed rows with status, confidence, and citations.
- Incremental run progress visible to the user.

## Non-goals

- Freeform research or chat.
- Legal strategy recommendations.
- Universal support for all title formats.
- Visual/geometry overlays for surveys.

## Users

- Practitioners needing a fast first pass.
- Internal operators validating extraction quality on known packs.

## Success Metrics

- Quick Start completes for `pack_01_clean` and `pack_04_multi_parcel_complex`.
- Key fields match truth tables for requirements/exceptions/survey issues on target packs.
- Users see row updates with accurate statuses and citations.

## Acceptance packs

- `pack_01_clean`
- `pack_04_multi_parcel_complex`
- `pack_05_duplicate_instrument_exhibit_missing`
- `pack_06_noisy_scans_rotated_page`
- `pack_03_mismatch_and_cert_gap`
- `pack_02_missing_rea`

## PRD slices (derived from breadboards)

### Slice 2.1A — Question set JSON + versioning

User story: As an operator, I can load a fixed question set (<=25) with stable IDs and a version tag.

In scope:
- v1 question set JSON with IDs
- Version tag accessible to UI and worker

Out of scope:
- Editable question sets

Acceptance criteria:
- Question set v1 has <=25 questions with stable IDs and expected output mappings
- Version tag is included in run metadata and visible in setup modal
- Running `pack_01_clean` produces one row per question_id

Failure states + UX:
- If question set missing, block run with a clear error state

Metrics/logging:
- `question_set_missing_count`

Rollback/disable:
- Feature flag to fall back to stubbed question list

### Slice 2.1B — Row schema + migrations

User story: As an operator, row schema is stable and migrations preserve data.

In scope:
- Row schema with required fields
- Migration path for schema updates

Out of scope:
- Historical backfills across all packs

Acceptance criteria:
- Row schema includes `question_id`, `question`, `answer`, `citations[]`, `status`, `confidence?`, `docs_searched[]`
- Schema validation passes for `pack_01_clean` rows
- Migration leaves existing rows readable with no data loss

Failure states + UX:
- If schema validation fails, rows are marked `needs_review` and surfaced in UI

Metrics/logging:
- `row_schema_validation_failures`

Rollback/disable:
- Safe default to store raw JSON payload if validation fails

### Slice 2.1C — UI table columns + row drawer layout

User story: As a user, I can view fixed columns and open a row drawer with citations.

In scope:
- Row table with fixed columns
- Row drawer showing answer + citations

Out of scope:
- Inline editing of answers

Acceptance criteria:
- Row table renders fixed columns for `pack_01_clean`
- Row drawer shows answer and citation list
- Clicking a citation opens the viewer at the cited location

Failure states + UX:
- Missing citations show a `needs_review` badge

Metrics/logging:
- `row_drawer_open_count`

Rollback/disable:
- Feature flag to hide drawer and show a read-only row table

---

### Slice 2.2A — Commitment doc-type classifier + parser routing

User story: As the system, I can classify commitment docs and route them to the parser.

In scope:
- Doc-type classifier for commitment PDFs
- Routing to parsing pipeline

Out of scope:
- Full coverage of all title formats

Acceptance criteria:
- Commitment docs in `pack_01_clean` and `pack_04_multi_parcel_complex` route to parser
- Unknown doc types are flagged as `needs_review`

Failure states + UX:
- Unclassified docs show a warning in run progress

Metrics/logging:
- `commitment_doc_unclassified_count`

Rollback/disable:
- Manual override to force classification for a run

### Slice 2.2B — B-I extraction logic (requirements)

User story: As an operator, I can extract B-I requirements with item numbers.

In scope:
- B-I section detection
- Requirements list with item numbers

Out of scope:
- Semantic interpretation of requirement meaning

Acceptance criteria:
- `pack_01_clean` and `pack_04_multi_parcel_complex` yield requirements lists matching truth key fields
- Requirements include item numbers

Failure states + UX:
- If B-I cannot be detected, row status becomes `needs_review`

Metrics/logging:
- `bi_parse_failure_count`

Rollback/disable:
- Fallback to empty list with explicit failure state

### Slice 2.2C — B-II extraction logic (exceptions)

User story: As an operator, I can extract B-II exceptions with item numbers and recording refs.

In scope:
- B-II section detection
- Exceptions list with item numbers and refs

Out of scope:
- Matching exceptions to instruments

Acceptance criteria:
- `pack_01_clean` and `pack_04_multi_parcel_complex` yield exceptions lists matching truth key fields
- Recording refs are captured when present

Failure states + UX:
- If refs are missing, row status is `needs_review`

Metrics/logging:
- `bii_parse_failure_count`

Rollback/disable:
- Fallback to empty list with explicit failure state

### Slice 2.2D — Parser confidence UI + override notes

User story: As a user, I can see parser confidence and add override notes.

In scope:
- Confidence badge in row table
- Override notes field in row drawer

Out of scope:
- Automatic correction of parsing results

Acceptance criteria:
- `pack_06_noisy_scans_rotated_page` shows low confidence badges
- Override notes persist on row updates

Failure states + UX:
- If confidence unavailable, show `unknown` badge

Metrics/logging:
- `parser_confidence_low_count`

Rollback/disable:
- Hide confidence badge behind feature flag

---

### Slice 2.3A — Instrument matching service

User story: As a user, exceptions link to the correct instrument PDFs with ambiguity surfaced.

In scope:
- Matching by instrument number + book/page
- Ambiguity flagged as `needs_review`

Out of scope:
- Deep semantic matching

Acceptance criteria:
- `pack_01_clean` exceptions link to correct PDFs
- Duplicate instrument numbers in `pack_05_duplicate_instrument_exhibit_missing` surface `needs_review`

Failure states + UX:
- No match results in `needs_review` with explicit reason

Metrics/logging:
- `instrument_match_ambiguity_count`

Rollback/disable:
- Fallback to manual selection only

### Slice 2.3B — Exception summary extractor

User story: As a user, I can read a short exception summary with citations.

In scope:
- Summary extraction with citations

Out of scope:
- Materiality assessments

Acceptance criteria:
- `pack_01_clean` summaries include citations to instrument clauses
- Missing exhibit in `pack_05_duplicate_instrument_exhibit_missing` yields flagged summary

Failure states + UX:
- If summary fails, show `needs_review` with empty summary

Metrics/logging:
- `exception_summary_failure_count`

Rollback/disable:
- Fallback to showing raw instrument excerpt

### Slice 2.3C — Risk tagging rubric

User story: As a user, exceptions are tagged with basic risk categories.

In scope:
- Risk tags: access/use/parking/utility/monetary/boundary

Out of scope:
- Risk scoring or materiality

Acceptance criteria:
- Exceptions in `pack_01_clean` receive at least one tag
- Tags render in row drawer and are editable later (not in v1)

Failure states + UX:
- If tagging fails, show `needs_review` with no tags

Metrics/logging:
- `risk_tagging_failure_count`

Rollback/disable:
- Hide tags behind feature flag

### Slice 2.3D — Ambiguity UI + user selection

User story: As a user, I can choose the correct instrument when multiple matches exist.

In scope:
- Ambiguity UI for multiple matches
- Selection persists to row

Out of scope:
- Automatic disambiguation beyond heuristics

Acceptance criteria:
- `pack_05_duplicate_instrument_exhibit_missing` surfaces multiple matches
- User selection updates the row and clears ambiguity badge

Failure states + UX:
- If selection fails, keep `needs_review` badge and show error

Metrics/logging:
- `instrument_selection_count`

Rollback/disable:
- Disable auto-match and force manual selection

---

### Slice 2.4A — Survey doc-type classifier + extraction routing

User story: As the system, I can identify survey documents and route them to the parser.

In scope:
- Survey doc classifier
- Routing to survey parser

Out of scope:
- Multi-format survey interpretation

Acceptance criteria:
- `pack_01_clean` and `pack_06_noisy_scans_rotated_page` surveys route to parser
- Non-survey docs are ignored with a logged reason

Failure states + UX:
- Unclassified docs show warning in run progress

Metrics/logging:
- `survey_doc_unclassified_count`

Rollback/disable:
- Manual override to force survey classification

### Slice 2.4B — Certification extraction

User story: As a user, I can see certification parties, surveyor, and date.

In scope:
- Certification block extraction

Out of scope:
- Validation of certification correctness

Acceptance criteria:
- `pack_01_clean` shows certification parties and date
- `pack_03_mismatch_and_cert_gap` flags missing certification party

Failure states + UX:
- Missing certification shows `needs_review` badge

Metrics/logging:
- `survey_cert_missing_count`

Rollback/disable:
- Hide certification panel behind feature flag

### Slice 2.4C — Callout extraction

User story: As a user, I can see survey callouts with citations.

In scope:
- Extract text callouts for encroachments/easements/access

Out of scope:
- Visual/geometry interpretation

Acceptance criteria:
- `pack_01_clean` yields at least 3 callouts with citations
- `pack_06_noisy_scans_rotated_page` yields at least 3 callouts with citations

Failure states + UX:
- If callouts missing, show `needs_review` and empty list

Metrics/logging:
- `survey_callout_missing_count`

Rollback/disable:
- Fallback to showing raw OCR text block list

### Slice 2.4D — Survey extraction quality indicator

User story: As a user, I can see when survey extraction is low quality.

In scope:
- Quality indicator in row table

Out of scope:
- Automatic repair of survey extraction

Acceptance criteria:
- Low signal in `pack_06_noisy_scans_rotated_page` shows quality badge
- Quality badge appears in row list and drawer

Failure states + UX:
- If quality score missing, show `unknown` badge

Metrics/logging:
- `survey_quality_low_count`

Rollback/disable:
- Hide quality badge behind feature flag

---

### Slice 2.5A — Reconciliation rules engine

User story: As the system, I can compare exceptions to survey evidence and emit a status.

In scope:
- Rules mapping exception types to survey checks

Out of scope:
- Geometry overlays

Acceptance criteria:
- `pack_01_clean` emits depicted/not depicted/unknown statuses for a subset
- `pack_05_duplicate_instrument_exhibit_missing` flags incomplete plotting

Failure states + UX:
- If evidence is weak, output `unknown` not `not depicted`

Metrics/logging:
- `reconciliation_unknown_count`

Rollback/disable:
- Disable reconciliation and show `unknown` for all

### Slice 2.5B — Issues list generator

User story: As a user, I can view a reconciliation issues list with citations.

In scope:
- Structured issues list with citations

Out of scope:
- Severity scoring

Acceptance criteria:
- `pack_01_clean` issues list includes citations from title + survey when available
- Issues list includes status and category fields

Failure states + UX:
- Missing citations show `needs_review` badge

Metrics/logging:
- `reconciliation_issue_count`

Rollback/disable:
- Fallback to empty issues list with warning

### Slice 2.5C — Reconciliation issues UI

User story: As a user, I can filter and review reconciliation issues.

In scope:
- Issues list UI with filters and status badges

Out of scope:
- Inline editing of reconciliation outputs

Acceptance criteria:
- Filters work on `pack_01_clean` issues list
- Clicking an issue opens drawer with dual citations

Failure states + UX:
- If issues list is empty, show empty state with guidance

Metrics/logging:
- `reconciliation_issue_view_count`

Rollback/disable:
- Hide reconciliation tab behind feature flag

### Slice 2.5D — Unknown handling + guidance copy

User story: As a user, I understand why a reconciliation row is "unknown" and what to do.

In scope:
- Guidance copy for unknown status

Out of scope:
- Auto-resolution of unknowns

Acceptance criteria:
- Unknown rows show guidance copy in drawer
- `pack_05_duplicate_instrument_exhibit_missing` produces unknowns when evidence is weak

Failure states + UX:
- If guidance copy missing, show default help text

Metrics/logging:
- `reconciliation_unknown_help_open_count`

Rollback/disable:
- Hide guidance copy if copy validation fails

---

### Slice 2.6A — Runs API + run state model

User story: As a user, I can start a run and see its state progress.

In scope:
- Run states: created/running/partial/completed/failed

Out of scope:
- Long-running agent loops

Acceptance criteria:
- `pack_01_clean` run transitions through states
- `pack_02_missing_rea` fails gracefully with `failed` state

Failure states + UX:
- Failed run shows a clear error state and retry option

Metrics/logging:
- `run_failed_count`

Rollback/disable:
- Feature flag to disable Quick Start CTA

### Slice 2.6B — Worker job runner + step model

User story: As the system, I execute deterministic steps for each run.

In scope:
- Step machine with ordered steps

Out of scope:
- Adaptive or branching workflows

Acceptance criteria:
- Steps execute in order for `pack_01_clean`
- Step progress is persisted and viewable in UI

Failure states + UX:
- Step failure shows which step failed in run progress

Metrics/logging:
- `step_failure_count`

Rollback/disable:
- Pause worker via feature flag

### Slice 2.6C — Incremental UI updates (polling/SSE)

User story: As a user, I see rows appear progressively during a run.

In scope:
- Polling or SSE updates

Out of scope:
- Real-time streaming tokens

Acceptance criteria:
- `pack_01_clean` rows appear incrementally without full page refresh
- Run progress updates within a bounded interval

Failure states + UX:
- If updates fail, UI falls back to manual refresh

Metrics/logging:
- `ui_poll_failure_count`

Rollback/disable:
- Disable incremental updates and show final results only

### Slice 2.6D — Row upsert behavior + provenance stamping

User story: As an operator, restarting a run does not duplicate rows and retains provenance.

In scope:
- Idempotent upsert by `question_id`
- Provenance stamping with snippet hashes

Out of scope:
- Historical backfills

Acceptance criteria:
- Restarting `pack_01_clean` run does not duplicate rows
- Snippet hashes remain stable across retries

Failure states + UX:
- If idempotency fails, mark run as `failed` and show warning

Metrics/logging:
- `row_upsert_conflict_count`

Rollback/disable:
- Disable restarts and require new run creation

## Risks

See `risk-register.md` for rabbit holes and mitigations.

## Verification Plan

- Run Quick Start on target packs and compare against truth CSVs for key fields.
- Validate row schema and run idempotency via restart test.
- Manual spot-check of citations for a sample of rows across artefacts.

## Open Questions

- Appetite/timebox for each PRD slice.
- Any acceptance packs beyond those named.
- Definition of "key fields" for truth matching.
- UI placement and ownership for Quick Start flows.
- Confidence computation method for v1.

## Links

- Initiative: `docs/00-strategy/initiatives/002-quick-start-engine.md`
- Breadboard: `breadboard-pack.md`
- Risks: `risk-register.md`
- Spikes: `spike-investigation.md`
