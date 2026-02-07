# PRD: 0001f Provenance + Run Trace Export (Developer-Facing)

Owner: marc
Status: Draft
Date: 2026-02-07
Slug: 0001f-provenance-trace-export

## Introduction / Overview

### Problem
This PoC lives or dies on debuggability. When a run fails or export is blocked, we need a deterministic way to answer:
- what happened (runs + steps)
- what evidence was used (chunk_ids + citation_ids)
- why a row landed in its terminal status (reason codes)

### Goal
Implement minimal provenance capture and a downloadable run trace JSON.

### Slice
Developer-facing trace export only. No dashboards.

### Primary Observable Effect
A reviewer/dev can click "Export trace" and download a safe JSON file that ties together `trace_id`, `run_id`, `step_key`, `question_id`, and `citation_id`.

### In Scope
- Provenance fields per data model:
  - `report_rows.provenance_json` includes retrieval chunk IDs + scores, model ids + prompt hashes, verification verdict + reason codes, and locked citation IDs.
  - `run_steps.metrics_json` includes timings, token/cost usage, chunk counts (no raw PDF text).
  - `run_steps.error_json` is safe (no stack traces, no provider payloads).
- Correlation identifiers and safety rules per `docs/03-architecture/60_observability_and_evals.md`.
- A trace export affordance:
  - UI button on Matter detail (or admin panel) downloads a JSON trace for the selected `run_id`.
  - API path to be defined during implementation; must use the standard error envelope on failures.

## Goals
- Make failures debuggable without re-running the workflow.
- Keep logs/traces safe (prefer IDs + hashes over raw content).

## User Stories

### US-001: Download run trace JSON
As a developer, I want to download a run trace so that I can debug failures deterministically.

#### Acceptance Criteria
- AC-001: Trace export includes:
  - run metadata: `run_id`, `folder_id`, `state`, `index_version`, `agent_bundle_version`, `question_set_version`
  - step records: `step_key`, `step_type`, `state`, `attempt`, `duration_ms`, safe `error_json`
  - per-row provenance: `question_id`, retrieved `{chunk_id, score}` list, verification verdict + reason codes, `citation_id`s
- AC-002: Trace export is safe:
  - no raw PDF bytes
  - avoid full extracted document text
  - no provider payload dumps
- AC-003: Failures return the standard error envelope with `trace_id`.

#### Verification
- Manual checks: download trace JSON and spot-check keys + safety rules.

## Functional Requirements
- FR-001: Use consistent identifiers across trace/provenance:
  - `trace_id`, `folder_id`, `run_id`, `step_key`, `question_id`, `citation_id`
- FR-002: Reason codes align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md`.
- FR-003: Never persist signed download URLs; persist storage keys and generate fresh signed URLs as needed (data model rule).

## Non-Goals (Out of Scope)
- Any monitoring dashboard UI.
- Storing raw prompts/doc text in trace exports by default.

## Failure States & UX
- Trace export unavailable: show safe error message and the `trace_id`.
- Permission/auth (if enabled): return `UNAUTHENTICATED` / `UNAUTHORISED` per API conventions.

## Metrics / Logging
- Events:
  - `trace_export.requested`, `trace_export.succeeded`, `trace_export.failed`
- Metrics:
  - trace export size (bytes) and latency

## Rollback / Disable Plan
- Feature flag: `FEATURE_TRACE_EXPORT` (default off).
- Safe fallback: hide the button; keep debug via DB inspection.

## Risks & Dependencies
- Depends on having persisted `runs`, `run_steps`, and `report_rows` with provenance fields.
- Risk: accidental PII leakage; enforce safety rules and review trace shape carefully.

## Success Metrics
- A blocked export or failed run can be debugged using only the trace JSON + DB IDs.

## Open Questions
- What is the minimal trace export API path, and should it be considered "admin-only"?

## Sources
- Initiative shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md` (U13/N11)
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
- Canonical architecture/contracts:
  - `docs/03-architecture/30_data_model.md` (provenance_json, immutability, URLs)
  - `docs/03-architecture/50_api_surface.md` (error envelope, trace_id)
  - `docs/03-architecture/60_observability_and_evals.md`

