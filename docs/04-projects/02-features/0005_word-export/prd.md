# PRD: Word Export (.docx) Single Memo Template

Owner: TBD
Status: DRAFT (GO: spike outcomes locked; remaining dependency is Initiative 002 structured row payload persistence: payload_json + payload_schema_version)
Date: 2026-02-07

## Summary

Generate one demo-grade Word artefact from a completed Quick Start run:
- `POST /export/docx` with `kind=memo`
- strict export gating (fail-closed on `citation_failed`, with demo-only unsafe override behind guardrails)
- artefact persistence + artefacts list/download (fresh signed URLs)
- minimal docx viewer sanity check across Word + Google Docs + Preview

## Problem

CSV exports cover tracker workflows, but a compelling demo also needs a single narrative artefact that feels like how practitioners communicate: a memo.

We need to export a defensible Word artefact without weakening the trust posture or introducing a long tail of formatting complexity.

## Goals

- From `docs/08-example-data/pack_01_clean`, operator can export `memo.docx` from a completed run and download it successfully.
- Memo includes the spike-locked sections in deterministic order, with inline citations.
- Export is only available when `runs.state = completed`.
- Export is blocked by default when any row is `citation_failed` (`EXPORT_BLOCKED`), unless demo-only `unsafe_override=true` is explicitly used.
- Docx renders acceptably (basic “not broken” gate) in:
  - Microsoft Word
  - Google Docs
  - macOS Preview (or equivalent)

## Locked decisions from spikes (2026-02-07)

### Artefact choice (locked)

- Single docx kind: `memo`

### Memo sections + ordering (locked)

Deterministic section order:
1) Title: "Memo: Title + Survey Summary"
2) Matter metadata (folder name, run_id, generated_at, versions)
3) Deal snapshot (optional)
4) Requirements
5) Exceptions
6) Survey issues
7) Missing inputs
8) Evidence index (optional)

Item ordering within sections:
- Requirements by requirement_id asc
- Exceptions by exception_id asc
- Survey issues by issue_id asc
- Missing inputs by source_question_id asc

### Citation rendering (locked)

Inline, no footnotes:
- "Sources: <filename>:<page> (<citation_id>); ..."

Viewer sanity constraints:
- Avoid complex tables/text boxes/footnotes. Use headings + bullets only.

## Non-goals

- Multiple templates, template editor UI, or per-firm customisation.
- “Perfect” formatting; this is a demo artefact, not a final deliverable.
- Eval harness and CI integration (handled in 0006).
- Demo toolbar and reset tooling (handled in 0007 / future).

## Users

- Demo operator (internal)
- Practitioner reviewer (friendly)

## Solution

Implement the canonical docx export contract from `docs/03-architecture/50_api_surface.md`:
- `POST /export/docx` with `{ folder_id, run_id, kind: "memo", unsafe_override }`

Renderer consumes structured row payloads (`payload_schema_version` + `payload_json`) (no prose parsing) plus locked citations and produces a single `.docx` byte stream, stored as an artefact in object storage with metadata in Postgres.

## Scope

In scope:
- API:
  - `POST /export/docx` supports `kind=memo`
  - validates inputs with Zod
  - errors use the standard envelope (ADR-0008)
- Export gating (per `docs/03-architecture/20_state_model.md`):
  - require `runs.state = completed` (else `409 CONFLICT`)
  - block export if any row is `citation_failed` unless `unsafe_override = true` is provided
  - `unsafe_override = true` is demo-only and requires DEMO_MODE + ALLOW_UNSAFE_EXPORTS; otherwise return `403 UNAUTHORISED`
  - unsafe exports must be visibly labelled (filename `memo.UNSAFE.docx` + metadata_json.unsafe_override=true)
- Word renderer:
  - one fixed memo template approach (spike outcome)
  - deterministic section ordering and stable formatting rules
  - citations rendered in a consistent format (spike outcome)
- Artefacts:
  - persist `storage_key` + metadata (`kind=memo`, template version id, filename, source_run_id)
  - do not persist signed URLs; generate fresh `download_url` via list endpoint
- UI:
  - “Export memo (Word)” button
  - disabled until run completes
  - blocked banner on `EXPORT_BLOCKED`

Out of scope:
- Any other docx kinds.
- Any editing of the memo in-app.

## Breadboard Mapping

From `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`:
- Parts: F1 (export endpoints), F3 (Word renderer + template), F4 (artefacts list), F5 (export UI states)
- Affordances: U1, U3, U4, U5
- Code affordances: N1, N2, N4, N5, N6

## User Stories

### US-001 Export Memo Docx
As a demo operator, I can export a Word memo from a completed run so I can share a narrative artefact outside the UI.

### US-002 See Not-Ready/Blocked States
As a demo operator, I can see when Word export is not ready or blocked so I don’t create inconsistent artefacts.

### US-003 View And Download Artefacts
As a demo operator, I can see and download the exported memo artefact reliably from the matter.

## Acceptance Criteria

- AC-001: From `docs/08-example-data/pack_01_clean`, operator can export `memo.docx` and download it successfully.
- AC-002: If `runs.state != completed`, export is disabled and API returns `409 CONFLICT` if called anyway.
- AC-003: If any row is `citation_failed` and `unsafe_override != true`, API returns `EXPORT_BLOCKED` and UI shows blocked banner with counts and next action.
- AC-004: Memo contains the spike-locked sections in deterministic order and renders citations in the agreed format.
- AC-005: Memo renders “not broken” in Word + Google Docs + Preview for the representative sample.
- AC-006: Artefact is persisted and appears in `GET /folders/:id/artefacts` with a fresh signed `download_url`.
- AC-007: When `DEMO_MODE` and `ALLOW_UNSAFE_EXPORTS` are enabled, operator can export with `unsafe_override=true` and the resulting filename is labelled `memo.UNSAFE.docx`.

## Verification Plan

- Fixture pack: `docs/08-example-data/pack_01_clean`
- Contract checks:
  - request/response shapes match `docs/03-architecture/50_api_surface.md`
  - export gating matches `docs/03-architecture/20_state_model.md`
- Manual viewer sanity:
  - open exported docx in Word, Google Docs, and Preview; capture pass/fail notes in the PR.
  - optional automation: `pnpm dlx agent-browser` (snapshot/refs) or `browser-use` (persistent session) to drive Google Docs upload/view + screenshot if it saves time.

## Risks

- Word formatting drift across viewers (RH4).
- Template choice mismatch with demo story (RH3).

## Open Questions

- None for slice 0005 (spike outcomes locked).
- Dependency remains: Initiative 002 must persist structured `payload_json` + `payload_schema_version` (no prose parsing).

## Links

- `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/50_api_surface.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0002, ADR-0008)
