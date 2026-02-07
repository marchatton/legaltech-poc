# PRD: CSV Exports + Artefacts List (Requirements / Exceptions / Survey Issues)

Owner: TBD
Status: DRAFT (GO: spike outcomes locked; remaining dependency is Initiative 002 structured row payload persistence: payload_json + payload_schema_version)
Date: 2026-02-07

## Summary

Ship demo-grade CSV exports aligned with canonical architecture contracts:
- 1-click exports for:
  - `requirements_tracker.csv`
  - `exceptions_table.csv`
  - `survey_issues.csv`
- Strict export gating (fail-closed) and clear UI blocked/not-ready states.
- Artefact persistence + artefacts list/download via fresh signed URLs.

This PRD does not include Word export, eval harness, or demo tooling.

## Problem

Report rows are trapped in the UI and demos are brittle. We need a repeatable way to export a practitioner-usable artefact and retrieve it later, without undermining the trust posture (fail-closed on `citation_failed`).

## Goals

- A demo operator can export all 3 CSV artefacts from `docs/08-example-data/pack_01_clean`.
- The export is **deterministic** (locked headers + deterministic row ordering).
- Export is only available when `runs.state = completed`.
- Export is blocked by default when any row is `citation_failed` (unless demo-only `unsafe_override=true` is explicitly used via API-only unsafe override per ADR-0019).
- Exported artefacts are listed for the matter and downloadable via fresh signed URLs.
- Exports include:
  - row status
  - citations rendered as `filename:page` plus `citation_ids`

## Locked decisions from spikes (2026-02-07)

### CSV schemas v1 (locked headers + ordering)

requirements_tracker.csv headers (v1):
1) requirement_id
2) requirement_text
3) source_question_id
4) row_status
5) source_answer
6) failure_code
7) citations
8) citation_ids
9) notes

exceptions_table.csv headers (v1):
1) exception_id
2) exception_text
3) source_question_id
4) row_status
5) source_answer
6) failure_code
7) citations
8) citation_ids
9) notes

survey_issues.csv headers (v1):
1) issue_id
2) issue_text
3) source_question_id
4) row_status
5) source_answer
6) failure_code
7) citations
8) citation_ids
9) notes

Column semantics (locked):
- Column 6 (`failure_code`) carries the row-level Tier 2 `reason_code` when `row_status=citation_failed`; otherwise it must be empty.
- Despite the header name, this is *not* the Tier 1 step-level `failure_code` (see `docs/03-architecture/60_observability_and_evals.md`).

### Deterministic row ordering (locked)

- Sort rows by:
  1) source_question_id asc
  2) *_id asc
  3) citations asc (tie-breaker)
- Citations within a row are rendered as:
  - citations: unique "filename:page" entries sorted by (filename asc, page asc, citation_id asc) and joined with "; "
  - citation_ids: citation IDs sorted asc and joined with "; "

### Export gating + unsafe override (locked)

- runs.state must be completed, else 409 CONFLICT.
- If any row is citation_failed and unsafe_override != true, return EXPORT_BLOCKED.
- unsafe_override=true is demo-only and requires DEMO_MODE + ALLOW_UNSAFE_EXPORTS + a valid `X-Orbital-Admin-Token` (ADR-0019); otherwise 403 UNAUTHORISED.
- Unsafe override is API-only (no Trust Substrate UI affordance) (ADR-0019).
- Unsafe exports must be visibly labelled in filename (e.g. requirements_tracker.UNSAFE.csv) and recorded in artefact metadata_json.
- Under unsafe exports, any exported items derived from a citation_failed report row must:
  - have row_status=citation_failed
  - have failure_code populated from provenance
  - have empty citations and citation_ids (do not export untrusted evidence)
  - have notes prefixed with "UNSAFE: "

## Non-goals

- Word export (.docx) (handled in 0005).
- Eval harness + CI integration (handled in 0006).
- Demo reset/delete UI (handled in 0007; slice 1 has no deletion via HTTP).
- Excel formatting beyond CSV.
- Any prose-parsing fallback if `payload_json` is missing (exports must fail closed).

## Users

- Demo operator (internal): needs one-click export + reliable download.
- Practitioner reviewer (friendly): sanity-checks CSV usability via paste/import.

## Solution

Add/implement the canonical export + artefact listing contract:
- `POST /export/csv` with `kind=requirements_tracker|exceptions_table|survey_issues`
- `GET /folders/:id/artefacts` to list/download previously exported artefacts

Exports must not parse prose. CSV mapping consumes structured row payloads persisted by Initiative 002 via `report_rows.payload_schema_version` + `report_rows.payload_json` (see `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`).

## Scope

In scope:
- Export endpoint + validation (`kind` support, request Zod boundary validation).
- Export gating:
  - `runs.state = completed` required (else `409 CONFLICT`)
  - if any row in the run is `citation_failed` and `unsafe_override != true`, export is blocked (`EXPORT_BLOCKED`)
  - `unsafe_override = true` is demo-only and requires `DEMO_MODE` + `ALLOW_UNSAFE_EXPORTS` + a valid `X-Orbital-Admin-Token` (else `403 UNAUTHORISED`) (ADR-0019)
  - unsafe override is API-only (ADR-0019)
- CSV schemas v1 for:
  - `requirements_tracker`
  - `exceptions_table`
  - `survey_issues`
  - Each has locked header list + ordering (from CSV usability spike outcome) and deterministic row ordering rule (documented).
- Artefact persistence:
  - persist `storage_key` + metadata (`kind`, `schema_version`, `filename`, `source_run_id`)
  - do not persist signed URLs
- UI:
  - export buttons for the 3 CSV kinds
  - disabled state until run completes
  - blocked banner state for `EXPORT_BLOCKED`
  - artefacts list with working download links
- Logging: export attempt + success/blocked/failure with `trace_id`.

Out of scope:
- Any destructive reset tooling.

## Breadboard Mapping

From `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`:
- Parts: F1 (export endpoints), F2 (CSV schemas + mappers), F4 (artefacts list), F5 (export UI states)
- Affordances: U1, U2, U4, U5
- Code affordances: N1, N2, N3, N5, N6

## User Stories

### US-001 Export CSV Artefacts
As a demo operator, I can export the requirements tracker, exceptions table, and survey issues CSVs for a completed run so I can share outputs outside the UI.

### US-002 See Blocked/Not-Ready States
As a demo operator, I can clearly see when export is not ready (run still running) or blocked (citation failures) so I don’t create inconsistent artefacts.

### US-003 View And Download Artefacts
As a demo operator, I can see previously exported artefacts for a matter and download them reliably.

## Functional Requirements

- FR-001: `POST /export/csv` accepts `{ folder_id, run_id, kind, unsafe_override }` per `docs/03-architecture/50_api_surface.md`.
- FR-002: Supported CSV `kind` values are exactly: `requirements_tracker`, `exceptions_table`, `survey_issues`.
- FR-003: Export only allowed when `runs.state = completed`; otherwise return `409` with `error.code = "CONFLICT"`.
- FR-004: If any row in the run is `citation_failed` and `unsafe_override != true`, export returns non-2xx with `error.code = "EXPORT_BLOCKED"`.
- FR-005: If `unsafe_override = true`:
  - when demo mode is not enabled (or `ALLOW_UNSAFE_EXPORTS` is not enabled) or the admin token is missing/invalid, return `403` with `error.code = "UNAUTHORISED"` (ADR-0019).
  - when allowed, export must label the artefact as unsafe (filename + metadata_json.unsafe_override=true).
- FR-006: CSV mapper consumes structured row payload (`payload_json` + `payload_schema_version`) (no prose parsing). If payload is missing, export fails closed with `409 CONFLICT` and a safe message pointing to the Initiative 002 dependency.
- FR-007: CSV headers + ordering are locked (v1 schemas) and drift is prevented by snapshot tests against fixture packs.
- FR-008: Deterministic row ordering is enforced in code (no DB ordering assumptions).
- FR-009: Artefact metadata includes `kind`, `schema_version`, `filename`, `source_run_id`, `created_at`, and `unsafe_override` (when applicable).
- FR-010: `GET /folders/:id/artefacts` returns a list with fresh `download_url` values (do not persist signed URLs).
- FR-011: UI disables export until run completion, shows blocked banner on `EXPORT_BLOCKED`, and renders artefacts list.
- FR-012: Logging exists for export attempt + success/blocked/fail: `folder_id`, `run_id`, `kind`, `artefact_id` (if created), `trace_id`.
- FR-013: CSV rows include `row_status`, citations as `filename:page`, and `citation_ids`.
- FR-014: For `missing_input`, `source_answer` must be exactly `Not found in provided documents.` and citations columns must be empty.

## Acceptance Criteria

- AC-001: From `docs/08-example-data/pack_01_clean`, operator can export all 3 CSV kinds and download them successfully.
- AC-002: If `runs.state != completed`, export button is disabled and API returns `409 CONFLICT` if called anyway.
- AC-003: If any row is `citation_failed` and `unsafe_override != true`, API returns `EXPORT_BLOCKED` and UI shows blocked banner with counts and next action.
- AC-004: Each CSV output matches the spike-locked header list + ordering and has deterministic row ordering.
- AC-005: From `docs/08-example-data/pack_02_missing_rea`, exports succeed (unless blocked by `citation_failed`) and include `missing_input` rows with the canonical answer preserved.
- AC-006: Artefact is persisted and appears in `GET /folders/:id/artefacts` with a working (fresh) `download_url`.
- AC-007: No signed URLs are persisted; only `storage_key` + metadata are stored.
- AC-008: Export does not parse `report_rows.answer` prose; it uses structured row payload (`payload_json`) and fails closed if missing.
- AC-009: When `DEMO_MODE` and `ALLOW_UNSAFE_EXPORTS` are enabled and a valid `X-Orbital-Admin-Token` is provided (ADR-0019), an admin can export with `unsafe_override=true` (API-only), and the resulting CSV filename is labelled `*.UNSAFE.csv`.

## Verification Plan

- Fixture packs:
  - `docs/08-example-data/pack_01_clean`
  - `docs/08-example-data/pack_02_missing_rea`
- Contract checks:
  - API request/response shapes match `docs/03-architecture/50_api_surface.md`
  - export gating matches `docs/03-architecture/20_state_model.md`
- Snapshot tests:
  - CSV header list + ordering per kind
  - deterministic row ordering (stable sort) per kind
- Manual smoke:
  - export works twice in a row for the same completed run (each kind)
  - artefact list download links still work after refresh (fresh signed URLs)

## Failure States + UX (no silent failures)

- Run not completed: export disabled; explain “Run still running”.
- Export blocked (`EXPORT_BLOCKED`): show blocked banner with exact copy:
  - Title: `Export blocked`
  - Body: `This run contains {n} row(s) with failed citation verification. Fix the citations or re-run. By default we do not export when any row is citation_failed.`
  - Detail line: `Run must be completed. Exports are only available for completed runs.`
  - CTA (normal): `Review failed rows`
  - Unsafe override: API-only (ADR-0019). No UI bypass is provided in this slice.
- Missing `payload_json`: show a hard error explaining the dependency on Initiative 002 (fail closed; no prose parsing fallback in this slice).
- Storage errors: safe user-facing error; log with `EXPORT_FAIL`.

## Metrics / Logging

- Count export attempts by `kind` + result (`success|blocked|conflict|fail`)
- Attach `trace_id` to UI-visible errors.

## Rollback / Disable Path

- Feature-flag the export UI affordance off by default until end-to-end works on `pack_01_clean`.

## Risks + Dependencies

- Requires structured row payload (`payload_json` + `payload_schema_version`) persisted by Initiative 002 (see `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`).
- CSV usability is spike-dependent (header list/order).
- Artefacts list must generate fresh signed URLs (expiry handling).

## Open Questions

- None for slice 0004 (spike outcomes locked).
- Dependency remains: Initiative 002 must persist structured `payload_json` + `payload_schema_version` for all three artefacts.

## Links (sources)

- `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/risk-register.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/50_api_surface.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0002, ADR-0008, ADR-0019)
