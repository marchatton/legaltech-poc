# PRD: 0001a Matter + Documents (Folder CRUD + Upload + Ingest Status)

Owner: marc
Status: Draft (Ready to implement; no open spikes required)
Date: 2026-02-07
Slug: 0001a-matter-documents

## Introduction / Overview

### Problem
We need a stable "Matter workspace" foundation: create a Matter (Folder), upload PDFs, and observe ingest status so the rest of the trust UX has somewhere real to land.

### Goal
Implement Folder + Document APIs and a minimal UI surface that supports:
- create/list/open a Matter
- upload PDFs into a Matter
- observe document ingest state (`parse_status`, `ocr_status`, `extraction_quality`, `page_count`) and derived folder state (`empty|ingesting|indexed|ready|failed`)

### Slice
Folder + document upload/ingest surface only. No viewer, no citations, no runs.

### Primary Observable Effect
- A user can create a Matter and upload PDFs, then watch ingest progress and failures per document.

### In Scope
- HTTP API endpoints from `docs/03-architecture/50_api_surface.md`:
  - `GET /folders`, `POST /folders`, `GET /folders/:id`
  - `POST /folders/:id/documents` (init upload)
  - `POST /documents/:id/complete` (enqueue ingest)
  - `GET /folders/:id/documents`
- Persist and expose folder/document states per `docs/03-architecture/20_state_model.md`.
- OCR/layout extraction is enqueued as part of ingest (ADR-0003).
- Minimal UI (server-first) to exercise the APIs: Matter list + Matter detail with document upload + list.

## Goals
- Folder and document state machines are monotonic and consistent with invariants.
- Failures are visible and actionable (no silent "stuck" states).

## User Stories

### US-001: Create and open a Matter
As a reviewer, I want to create and open a Matter so that I can review a diligence pack.

#### Acceptance Criteria
- AC-001: `POST /folders` creates a folder with `state = empty`.
- AC-002: `GET /folders` lists folders including `state` and `latest_index_version`.
- AC-003: `GET /folders/:id` returns folder state and timestamps.

#### Verification
- Manual checks: create a Matter, confirm it appears in the list, open its detail page.

### US-002: Upload PDFs and observe ingest status
As a reviewer, I want to upload PDFs into a Matter so that the system can ingest them for later evidence workflows.

#### Acceptance Criteria
- AC-004: `POST /folders/:id/documents` returns a `document` record plus an `upload` target (signed URL + headers + storage_key).
- AC-005: `POST /documents/:id/complete` enqueues ingest and transitions document state out of `queued` as work starts.
- AC-006: `GET /folders/:id/documents` returns documents with:
  - `parse_status` (`queued|parsing|parsed|failed`)
  - `ocr_status` (`queued|running|done|failed`)
  - `page_count` set when `parse_status = parsed`
  - `extraction_quality` set when `ocr_status = done`
- AC-007: Folder state transitions are derivable and consistent:
  - `empty` -> `ingesting` once the first document upload is completed
  - `ingesting` -> `indexed` once all documents reach terminal ingest state and indexing for `latest_index_version` is built
  - `indexed` -> `ready` once health checks pass (thresholds defined in state model)
  - any terminal ingest failure can transition folder to `failed`

#### Verification
- Pack/fixture/script: upload PDFs from:
  - `docs/08-example-data/pack_01_clean/docs/`
  - `docs/08-example-data/pack_07_scans_rotated_low_quality/docs/`
- Manual checks: upload 2+ PDFs; confirm statuses progress; confirm failures show a safe error code/message.

## Functional Requirements
- FR-001: Validate all route params and JSON bodies with Zod; return the standard error envelope (ADR-0008).
- FR-002: Store raw PDFs in S3-compatible storage (ADR-0010 proposed) and persist `storage_key` on the document record.
- FR-003: Ingest enqueues parse + OCR/layout extraction and persists per-page records (`document_pages`) when OCR completes (ADR-0003, data model).
- FR-004: Never leak provider payloads/stack traces; store safe `error_json` fields for documents and use safe error envelopes for clients.

## Non-Goals (Out of Scope)
- PDF viewer UX.
- Citation locking + verification.
- Quick Start runs/workflows.
- Export.

## Failure States & UX
- Upload init fails: show error envelope `INTERNAL` or `VALIDATION_ERROR` (as appropriate) and allow retry.
- Upload complete called with wrong/missing `storage_key`: return `VALIDATION_ERROR`.
- OCR/layout fails: set `documents.ocr_status = failed`, persist safe `error_json`, and reflect folder state `failed` where required by invariants.

## Metrics / Logging
- Structured events:
  - `folder.created`, `document.upload.initiated`, `document.upload.completed`
  - `document.ingest.started`, `document.ingest.completed`, `document.ingest.failed`
- Metrics:
  - ingest duration per document (p50/p95)
  - `extraction_quality` distribution per pack
  - failure taxonomy counts: `OCR_FAIL`, `LAYOUT_FAIL`, `CHUNKING_FAIL`

## Rollback / Disable Plan
- Feature flag: `FEATURE_MATTERS` (default: off until end-to-end smoke passes).
- Safe fallback: hide upload UI and prevent ingest endpoints from enqueueing work.

## Risks & Dependencies
- Dependencies:
  - Postgres schema/migrations (data model).
  - Object storage contract (signed URLs).
  - OCR/layout provider adapter (ADR-0012 proposed).
- Risks:
  - ingest cost/latency on scanned packs; keep work queued and observable.

## Success Metrics
- A fresh Matter can ingest `pack_01_clean` and `pack_07_scans_rotated_low_quality` PDFs with clear progress and failure visibility.

## Open Questions
- OCR provider choice (Azure DI vs Textract) and local dev story for credentials.
- Local storage contract: MinIO vs filesystem for earliest dev (ADR-0010).

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md`
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md`
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md` (ADR-0003, ADR-0008)
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`

