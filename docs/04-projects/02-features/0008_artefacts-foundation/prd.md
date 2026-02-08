# PRD: Artefacts Foundation (Exports): Persistence + Listing + Fresh Download URLs

Owner: TBD
Status: DRAFT
Date: 2026-02-08

## Summary

Multiple export slices (CSV, Word, future) need the same foundation:
- persist an exported file as an `artefacts` record (metadata + storage_key)
- list artefacts for a matter and download them reliably (fresh signed URLs; refresh-safe)
- display unsafe-labelled artefacts clearly

This PRD extracts that shared foundation so 0004 (CSV) and 0005 (Word) can focus on format-specific export generation.

## Problem

Exports are only useful if operators can reliably retrieve past artefacts. Today, export slices duplicate persistence/listing logic and risk drifting (URLs persisted, stale links, inconsistent metadata, missing unsafe labels).

We need one canonical artefacts surface: deterministic metadata in Postgres plus reliable downloads via fresh signed URLs generated on demand.

## Goals

- A demo operator can view a matter's exported artefacts and download them successfully.
- Download links are refresh-safe: `GET /folders/:id/artefacts` always returns fresh signed URLs (never persisted).
- Artefacts are clearly labelled when `unsafe_override=true` was used upstream (filename + UI tag + metadata_json).
- Shared helpers exist for export slices to persist artefacts consistently (schema/template versioning, unsafe metadata).

## Non-goals

- Implementing any specific export formats (CSV in 0004, docx in 0005).
- Eval harness (0006) or demo tooling (0007).
- Any destructive reset/delete tooling.
- Building a general-purpose admin UI for artefacts beyond a simple list + download.

## Users

- Demo operator (internal): needs reliable "export history" and downloads during demos.
- Developer: needs one canonical persistence + listing contract to reuse across export slices.

## Solution

Implement the canonical artefacts contract:
- Persist exported bytes in object storage and persist one `artefacts` DB row per exported file.
- List artefacts per folder via `GET /folders/:id/artefacts`, returning fresh signed `download_url` values (not persisted).
- Render an artefacts list in the folder UI, including unsafe labels and basic metadata.

## Scope

In scope:
- Data model: `artefacts` table/entity (see `docs/03-architecture/30_data_model.md`).
- Storage integration:
  - upload bytes to object storage with a stable `storage_key`
  - generate fresh signed download URLs at read time (never persisted)
- API:
  - `GET /folders/:id/artefacts` returns artefacts for the folder, sorted newest-first, including a fresh `download_url` per row
  - errors use the standard safe envelope (ADR-0008)
- UI:
  - folder page shows an "Artefacts" list with filename, kind, created_at, and a Download button/link
  - unsafe artefacts are visibly labelled "UNSAFE"
- Logging/metrics:
  - artefacts list calls + signed URL generation outcomes include `folder_id` + `trace_id`
- Rollback/disable:
  - artefacts list UI is feature-flagged off by default until verified end-to-end

Out of scope:
- Any endpoint that allows arbitrary file upload to create artefacts (exports create artefacts; this slice is list/download).

## Success Metrics

- For a folder containing artefacts, downloads succeed and remain working after a hard refresh.
- No signed URLs are persisted anywhere in the DB.
- Export slices (0004/0005) can persist artefacts by calling one shared helper rather than duplicating metadata/persistence logic.

## Risks

- Signed URL TTL too short (operator clicks an expired link mid-demo).
- Caching layers accidentally cache `download_url` values (must be no-store).
- Storage provider differences (local vs cloud) create inconsistent download behaviour.

## Acceptance Criteria

- AC-001 (Example): `GET /folders/:id/artefacts` returns a list including `kind`, `filename`, `schema_version/template_version`, `source_run_id`, `created_at`, and a fresh `download_url` for each artefact.
- AC-002 (Example): UI renders the artefacts list for a folder and Download works for each artefact.
- AC-003 (Example): Re-loading the page generates new signed `download_url` values and downloads still work.
- AC-004 (Negative): Signed URLs are not persisted in Postgres (only `storage_key` + metadata are stored).
- AC-005 (Negative): When demo mode is off, the artefacts list is hidden/disabled if behind a feature flag (safe default).
- AC-006 (Negative): Unsafe-labelled artefacts are clearly marked (filename includes `.UNSAFE.` and UI displays an "UNSAFE" tag when `metadata_json.unsafe_override=true`).

## Verification Plan

- Automated:
  - unit/integration tests for `GET /folders/:id/artefacts` response shape and sorting
  - test that `download_url` is computed (not stored) and varies between calls
- Manual smoke (dev):
  - create a folder with at least one artefact (via an export slice once available or via a dev seed path)
  - confirm list renders and download works, then refresh and re-download

## Open Questions

- Should `download_url` include an explicit `expires_at` in the API for UI messaging, or keep it opaque for v1?
- Should artefacts list be available in all environments, or dev/demo-only for the PoC?

## Links

- `docs/04-projects/02-features/0004_csv-export/prd.md` (extracted shared artefacts list/persistence)
- `docs/04-projects/02-features/0005_word-export/prd.md` (extracted shared artefacts list/persistence)
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/50_api_surface.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0008)
