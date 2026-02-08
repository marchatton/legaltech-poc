# PRD: 0001b-f Trust Substrate Slices (Viewer + Citations + Highlights + Fail-Closed Export + Trace)

Owner: marc
Status: Draft (Reconciled snapshot; excludes 0001a scope)
Date: 2026-02-08
Slug: 0001b-f-trust-substrate-slices

## Introduction / Overview

### Problem
The trust moment requires evidence-first UX that is fast enough to use, deterministic enough to debug, and strict enough to fail closed:

- click a citation -> jump to PDF viewer -> see a verified highlight overlay + snippet/hash
- when evidence is missing or wrong, show explicit, actionable failures
- exports must be blocked by default when evidence fails
- developers must be able to debug failures without rerunning a workflow

### Goal
Consolidate slices `0001b`-`0001f` into one implementable PRD:

- `0001b` PDF viewer (render_url contract + perf gates)
- `0001c` locked citations API/contract (snippet + snippet_hash + geometry)
- `0001d` citation chips + click-to-highlight overlay (anchors-first; fail-closed)
- `0001e` row status machine + export gate + failure journeys (fail-closed)
- `0001f` provenance + run trace export (developer-facing; redacted by default)

This PRD is explicitly derived from:
- `docs/04-projects/02-features/0001_trust-substrate/plan.md`
- `docs/04-projects/02-features/0001_trust-substrate/prd-overall.md` (+ `.json`)
minus the scope owned by `0001a` Matter + Documents.

### Slice
Trust UX layers only. Matter/Document foundations are prerequisites (see below).

### Primary Observable Effect
On fixture packs:
- `pack_01_clean`: citation chip click jumps to PDF + highlight works; a deliberate bad citation yields `citation_failed` and blocks export.
- `pack_02_missing_rea`: missing docs yield `missing_input` with an actionable checklist (FP=0 on `pack_01_clean`).
- `pack_07_scans_rotated_low_quality`: viewer remains usable; highlight behavior is honest (aligned or explicitly cut/patch).

### In Scope
- Viewer route and render contract:
  - `/viewer/:documentId` (pdf.js, page nav, zoom re-render)
  - `GET /documents/:id/render?page=N` -> `{ document_id, page, render_url }` (page is 1-indexed)
  - RH1 perf harness `/spikes/rh1-pdf-perf` + evidence recording
- Locked citation contract:
  - `GET /citations/:id` -> `{ citation: { id, document_id, page_number, polygons, snippet, snippet_hash } }`
  - canonical `normaliseSnippet()` + `hashSnippet()` in `packages/core` (single source of truth) + RH3 harness evidence
- Matter detail enhancements (on an existing Matter detail surface):
  - seeded report rows table (fixture-backed scaffold)
  - citation chips derived from `citation_id` only (no free-text citations)
  - status badges and explicit failure journeys (missing_input, citation_failed)
  - export button + server-enforced export gate (`EXPORT_BLOCKED`)
  - trace export button (developer-facing)
- Highlight overlay mapping and RH2 proof:
  - highlight overlay rendered from locked citation polygons
  - alignment verified at 100% zoom only (cut; ADR-0020)
  - fail-closed overlay behavior + reason codes
  - RH2 overlay harness `/spikes/rh2-overlay` (+ `/spikes/local-pdf`) + evidence capture
- Row status machine + export gate:
  - terminal statuses: `needs_review|reviewed|missing_input|citation_failed`
  - missing-doc checklist (`missing_input`)
  - export blocked by default if any row is `citation_failed`
  - unsafe export override is demo-only and admin-token gated (ADR-0019)
  - RH4/RH5 harnesses + evidence recording
- Provenance + trace export:
  - persist safe provenance + step metrics/error envelopes
  - `GET /runs/:id/trace` trace export (admin-token gated; redacted allowlist schema)

### Prereqs (Owned by 0001a; Out of Scope Here)
This PRD assumes the Matter + Documents baseline exists and is stable. This PRD must not re-implement it.

- Folder/Matter baseline:
  - Matter list + Matter detail route shells exist (and can be extended)
  - documents can be uploaded into a Matter and have stable `document_id`s
- Document ingest populates (at minimum):
  - `documents.page_count` for bounds/validation
  - `documents.storage_key` (object storage) to enable signed render URLs
- Object storage posture is already in place (S3-compatible, signed URL generation helpers)

## Goals
- Viewer works for `pack_01_clean` and remains usable for `pack_07_scans_rotated_low_quality` (RH1 evidence).
- Zoom is crisp and stable (no devicePixelRatio drift; re-render not CSS scaling).
- Citation payload is sufficient for highlighting and integrity checks.
- Hashing is stable and single-sourced (RH3 evidence).
- Prove the trust moment on fixture packs with evidence capture (screenshots + HUD/bbox logs) (RH2 evidence).
- Make trust failures explicit and actionable (no silent failures; no best-effort highlights).
- Exports are blocked by default on evidence failure (server-enforced).
- Failures are debuggable via a safe trace export (no secrets, signed URLs, or raw content).

## Security Posture (Non-Negotiables)
These apply across viewer, citations, exports, and traces.

- Signed URLs (`render_url`, `download_url`):
  - generate on demand with short TTL (target 5-15 minutes)
  - never persist in DB
  - never include in provenance or trace exports
  - never log; treat `X-Amz-*` query params as secrets
- Admin-token gating (ADR-0018/ADR-0019):
  - require `X-Orbital-Admin-Token` to match env `ORBITAL_ADMIN_TOKEN`
  - missing/mismatched returns `403` with the standard error envelope
  - token must never be stored, returned, or logged
- Dev-only endpoints:
  - must live under `/spikes/*`
  - gated to dev environment; return `404` outside dev
  - validate inputs with Zod; avoid filesystem traversal patterns
- Trace/provenance redaction:
  - trace exports are shareable artifacts
  - default export contains only ids, timings, counts, code enums, and hashes
  - do not export raw PDF bytes, extracted text, prompts, provider payloads/headers, file paths, signed URLs, auth tokens, PII
- Storage/logging posture:
  - extracted text in Postgres is sensitive
  - object storage holds raw PDFs and artefacts
  - logs/traces/analytics must redact tokens and signed URLs and avoid raw document content

## Next.js App Router Boundaries (Server-First)
- Default to RSC for route shells under `apps/web/app/(app)/**`. Client components are small islands.
- Client components talk to the server via Route Handlers under `apps/web/app/(api)/**/route.ts` (treat Server Actions like public endpoints).
- pdf.js is client-only: keep all pdf.js imports behind a dedicated client-component boundary and use dynamic import.
- Avoid passing large payloads through RSC props (polygons, page text, etc). Prefer ids + client/server fetch as appropriate.

## Spike Gates (Blocked-By Dependencies)
These gates must be closed (PASS or explicit cut/patch) before the affected stories can be considered GO.

- RH1 (pdf.js perf on scans): blocks US-001/US-002
- RH2 (overlay transforms): blocks US-005/US-006
- RH3 (snippet hash stability): blocks US-003/US-004
- RH4 (verification precision/latency): blocks US-008
- RH5 (missing-doc heuristics): blocks US-007

### Gate Pass Criteria (Perf + Evidence)
This section is intentionally redundant with PRDs so spike closure is consistent (source: `plan.md`).

RH1 PASS (pdf.js perf on scans) requires:
- Range precondition: the target PDF URL returns `Accept-Ranges: bytes` and honors `Range: bytes=0-10` with `206 Partial Content` (record header proof).
- Define `totalMs` as time from "request page N" to `renderTask.promise` resolve (exclude initial PDF load).
- Serial test (N=20, 100% zoom): `p95(totalMs) < 1000ms` and `max(totalMs) < 1500ms`.
- Spam test (N=30 @ 200ms): `maxLongTaskMs < 250ms` and final requested page completes `< 1500ms` after its request timestamp.
- Cancellation requirement: `>= 70%` intermediate renders are cancelled (define cancellation rate from harness output).
- Evidence committed: downloaded run JSON(s) + summary table in `spike-investigation.md`.
- Important: Range proof must be for the actual URL used by the viewer (`render_url` target), not just `/spikes/local-pdf`.

RH2 PASS (overlay transforms) requires:
- `pack_01`: one commitment anchor and one survey anchor align at 100% zoom.
- Cut: highlight overlay is verified at 100% zoom only (ADR-0020). Viewer enforces 100% zoom while highlight is active.
- Rotation: at least one rotated/scanned case in `pack_07`, or an explicit cut/patch is recorded.
- Fail-closed proof: invalid polygon and wrong page show explicit failure UI and render no overlay.
- Evidence committed: screenshots with HUD + bbox log JSON.

RH3 PASS (snippet hash stability) requires:
- `hashSnippet()` and `normaliseSnippet()` are single-sourced (core) and unit tested.
- Harness `packages/core/src/spikes/rh3_snippet_hash_harness.ts` run twice yields identical hashes across runs for the same extracted snippets.
- Evidence committed: the two JSON outputs + a stability note/table in `spike-investigation.md`.

RH4 PASS (verification precision/latency) requires:
- Dataset: `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json` (>= 20 bad examples).
- Pass criteria (integrity-only): `false_passes = 0`.
- Latency budget: `p95 <= 8s` per row on dev machine (record p50/p95/max).
- Evidence committed: results summary + raw results JSON (and any rubric/prompt notes if used later).

RH5 PASS (missing-doc heuristics) requires:
- `pack_02_missing_rea`: flags `REA.pdf` as missing with an actionable checklist.
- `pack_01_clean`: false positives are zero (`FP=0`).
- Only high-confidence candidates shown by default (`confidence >= 0.8`).
- Evidence committed: harness output + a short note describing signals and candidate confidence.

## User Stories

### US-001: Open and view a PDF
As a reviewer, I want to open a PDF so that I can inspect evidence.

#### Acceptance Criteria
- AC-001: From Matter detail, I can open a viewer route for a selected document.
- AC-002: Viewer fetches `render_url` via `GET /documents/:id/render?page=N` (1-indexed `page`) and renders via pdf.js.
- AC-003: Viewer shows an explicit error state if `render_url` is unavailable or the document is not found.
- Example: Open commitment and survey PDFs from `pack_01_clean` and confirm they render.
- Negative case: Unknown `document_id` returns `NOT_FOUND` (safe envelope) and the UI shows an explicit error + retry/back affordance.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/docs/`
- Manual checks: open at least two PDFs; confirm page renders and controls are usable.

### US-002: Page navigation and zoom stays responsive on scans
As a reviewer, I want to page-jump and zoom on scanned PDFs so that I can inspect evidence in low-quality packs.

#### Acceptance Criteria
- AC-004: PDFs served to pdf.js support Range requests (`Accept-Ranges: bytes`; `Range: bytes=...` returns `206 Partial Content`). Without this, RH1 perf numbers are invalid.
- AC-004a: Range precondition proof is captured for the viewer's actual `render_url` target: `Range: bytes=0-10` returns `206 Partial Content`.
- AC-005: Define `totalMs` as time from request page N to `renderTask.promise` resolve (exclude initial PDF load). Serial test (N=20, 100% zoom): `p95(totalMs) < 1000ms` and `max(totalMs) < 1500ms`.
- AC-006: Spam test (N=30 @ 200ms): viewer remains responsive (`maxLongTaskMs < 250ms`) and final requested page completes `< 1500ms` after its request timestamp; intermediate renders are cancelled (`>= 70%` cancellation rate).
- AC-007: Zoom 50/100/150 re-renders consistently (no CSS-scaling drift).
- Example: Run `/spikes/rh1-pdf-perf` against `pack_07` and record results JSON + summary stats in `spike-investigation.md` (RH1).
- Negative case: If Range support is missing (no `Accept-Ranges` or Range does not return `206` for the viewer's actual `render_url`), the harness reports the precondition failure and RH1 is NO-GO.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_07_scans_rotated_low_quality/docs/`
- Harness: `/spikes/rh1-pdf-perf` (serial + spam); commit/attach results JSON to spike proofs and summarize in `spike-investigation.md`.

### US-003: Fetch a locked citation by ID
As a reviewer, I want to fetch a citation payload so that I can inspect evidence reliably.

#### Acceptance Criteria
- AC-001: `GET /citations/:id` returns `{ citation: { id, document_id, page_number, polygons, snippet, snippet_hash } }` (response shape per API surface).
- AC-002: Errors use the standard error envelope with safe code/message (no leaks).
- Example: Fetch a known seeded `citation_id` from `pack_01_clean` and confirm the response contains snippet + snippet_hash + geometry.
- Negative case: Unknown `citation_id` returns `404 NOT_FOUND` using the standard error envelope.
- Negative case: Invalid id format returns `VALIDATION_ERROR` using the standard error envelope.

#### Verification
- Manual: call the endpoint and confirm the payload matches contracts and includes expected fields.

### US-004: Canonical snippet hashing is stable
As a developer, I want one canonical hashing implementation so that citation integrity checks are reliable.

#### Acceptance Criteria
- AC-003: `normaliseSnippet()` + `hashSnippet()` are implemented once in `packages/core` and reused everywhere (no duplicate implementations); unit tests cover whitespace invariance per the canonical rule.
- AC-004: RH3 harness (`packages/core/src/spikes/rh3_snippet_hash_harness.ts`) produces identical hashes across two runs (run1 vs run2) using snippets from `pack_01_clean`.
- AC-004a: Evidence committed: the two harness JSON outputs + a stability note/table in `spike-investigation.md` (RH3).
- Example: A snippet with CRLF newlines and multiple whitespace runs hashes identically to the normalized LF + single-space form.
- Negative case: Attempting to introduce a second hashing implementation is blocked by tests or code review (single source of truth).

#### Verification
- Harness: `packages/core/src/spikes/rh3_snippet_hash_harness.ts` run twice; commit outputs and summarize stability in `spike-investigation.md` (RH3).

### US-005: Click citation chip -> open viewer at cited evidence
As a reviewer, I want to click a citation chip and jump to the cited PDF page so that I can inspect evidence quickly.

#### Acceptance Criteria
- AC-001: Seeded report rows render citation chips derived from `citation_id` values only (ADR-0001) (no free-text citations).
- AC-002: Clicking a chip navigates to the viewer with the correct `document_id` and `page` (1-indexed) and includes the `citation` id in the URL/search params.
- Example: In `pack_01_clean`, click chips across at least two documents (commitment + survey) and confirm navigation lands on the correct page.
- Negative case: If the citation fetch fails or is invalid, the viewer renders an explicit `citation_failed` state and does not attempt best-effort overlay.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/`
- Manual: click multiple chips; confirm correct doc/page + stable URL.

### US-006: Evidence highlights align across zoom + rotation
As a reviewer, I want the highlight to stay glued to the clause across zoom and rotation so that I can trust what I am seeing.

#### Acceptance Criteria
- AC-003: Highlight aligns at 100% zoom for at least one commitment anchor and one survey anchor (`pack_01`).
- AC-004: Highlight overlay is verified at 100% zoom only (cut). Viewer enforces this by:
  - snapping to 100% and disabling zoom while highlight is active, OR
  - showing "Highlight verified at 100% zoom only" and requiring a one-click reset to 100% before overlay renders.
- AC-005: Highlight remains aligned on at least one rotated/scanned page (`pack_07`) or an explicit cut/patch is enforced and documented.
- AC-006: Fail-closed: deliberate invalid polygon or wrong page yields explicit failure UI and no overlay.
- AC-006a: Evidence committed: screenshots with HUD + bbox log JSON (RH2).
- Example: Use `/spikes/rh2-overlay` to capture screenshots at 100% with HUD visible for at least two `pack_01` anchors.
- Negative case: Inject an out-of-range polygon (violates `[0..1]`) or wrong page and confirm the viewer shows `citation_failed` and renders no overlay.

#### Verification
- Harness: `/spikes/rh2-overlay` (+ `/spikes/local-pdf`) (dev-only)
- Evidence: screenshots + HUD/bbox logs recorded in `spike-proofs/` and summarized in `spike-investigation.md` (RH2).

### US-007: Missing docs yields missing_input with checklist
As a reviewer, I want missing inputs to be explicit and actionable so that I can upload the right documents.

#### Acceptance Criteria
- AC-001: Rows with no supporting evidence resolve to `missing_input`.
- AC-002: `missing_input` rows must have:
  - answer exactly `Not found in provided documents.`
  - zero citations
  - provenance/notes containing a missing-doc checklist with concrete evidence signals (`{label, confidence, signals[]}`)
  - only show high-confidence candidates by default (`confidence >= 0.8`)
- AC-003: Missing-doc detection flags `REA.pdf` in `pack_02_missing_rea` and produces no missing-doc flags in `pack_01_clean` (FP=0).
- AC-003a: Evidence committed: harness output + short note describing signals and candidate confidence (RH5).
- Example: On `pack_02_missing_rea`, open the report table and confirm the missing-doc checklist is visible and actionable for the missing instrument.
- Negative case: On `pack_01_clean`, no rows are marked `missing_input` due to false missing-doc detection (FP=0).

#### Verification
- Packs: `docs/08-example-data/pack_02_missing_rea/`, `docs/08-example-data/pack_01_clean/`
- Harness: `packages/core/src/spikes/rh5_missing_docs_harness.ts` (or successor harness); evidence recorded in `spike-investigation.md` (RH5).

### US-008: Bad evidence yields citation_failed and blocks export
As a reviewer, I want evidence failures to block export so that we don't ship untrusted outputs.

#### Acceptance Criteria
- AC-004: A deliberate bad citation (`snippet_hash` mismatch, invalid polygons, or deterministic integrity failure) yields `citation_failed` with a safe `reason_code`.
- AC-004a: Integrity checks are fail-closed: any invariant failure yields `citation_failed`. No entailment model is used in 0001.
- AC-005: Export is blocked by default when any row is `citation_failed`:
  - `POST /export/csv` returns non-2xx with `error.code = EXPORT_BLOCKED`
  - export gating is implemented server-side, not just in UI
- AC-005a: `POST /export/csv` matches API surface:
  - request: `{ folder_id, run_id, kind, unsafe_override }`
  - success: `{ artefact: { id, kind, filename, storage_key, download_url, created_at } }`
- AC-006: Unsafe override is demo-only and admin-token gated:
  - when `unsafe_override=true` is provided and demo mode is not enabled, return `403 UNAUTHORISED`
  - if demo mode allows unsafe export, the artefact is visibly labelled unsafe and metadata records the override
- AC-006a: Export is only allowed when `runs.state = completed` (PoC default); otherwise return a conflict (and the UI shows a not-ready state).
- AC-007: "Flag citation wrong" action records a safe feedback event with `citation_id` + reason code (no sensitive payloads).
- AC-007a: RH4 PASS criteria are met and evidence is recorded (integrity-only: `false_passes = 0`; latency `p95 <= 8s` per row; dataset >= 20 bad examples; results summary + raw results JSON committed).
- Example: In `pack_01_clean`, a deliberately corrupted citation yields `citation_failed` and export attempts return `EXPORT_BLOCKED`.
- Negative case: When `runs.state != completed`, export requests are rejected (conflict) and no artefact is created.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean/` with one deliberately corrupted citation fixture.
- Dataset (RH4): `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json` (>= 20 bad examples).
- Harness: `apps/web/app/(api)/spikes/rh4-verify/route.ts` and/or `packages/core/src/spikes/rh4_verification_harness.ts` (or successor harness).
- Evidence: RH4 results summary + raw results JSON committed and summarized in `spike-investigation.md` (RH4).

### US-009: needs_review -> reviewed is explicit and persisted
As a reviewer, I want to mark a row as reviewed so that the table reflects what I've checked.

#### Acceptance Criteria
- AC-008: Rows can transition `needs_review` -> `reviewed` only via explicit user action.
- AC-009: Status invariants hold: `needs_review` and `reviewed` rows have `>= 1` locked citation (ADR-0001).
- Example: Click "Mark reviewed" on a `needs_review` row and confirm the status persists after refresh.
- Negative case: Attempt to mark reviewed on a row with zero citations is rejected and the UI shows an explicit safe reason.

#### Verification
- Manual: exercise the transition on fixture rows and confirm persistence and invariants.

### US-010: Download run trace JSON
As a developer, I want to download a run trace so that I can debug failures deterministically.

#### Acceptance Criteria
- AC-001: Trace export includes:
  - run metadata: `run_id`, `folder_id`, `state`, `index_version`, `agent_bundle_version`, `question_set_version`
  - step records: `step_key`, `step_type`, `state`, `attempt`, `duration_ms`, safe `error_json`
  - per-row provenance: `question_id`, retrieved `{chunk_id, score}` list, verification verdict + reason codes, `citation_id`s
- AC-002: Trace export is safe by default:
  - no raw PDF bytes
  - avoid full extracted document text
  - no provider payload dumps
  - no signed URLs or auth tokens
- AC-003: Failures return the standard error envelope and include `trace_id`.
- Example: Download a trace JSON for a known `run_id` and spot-check required keys + safety rules.
- Negative case: Request trace export for an unknown `run_id` returns `NOT_FOUND` (safe envelope) and the UI surfaces the `trace_id`.

#### Verification
- Manual: download trace JSON and spot-check for allowlisted keys; review for leakage (signed URLs, tokens, raw content).

## Functional Requirements
- FR-001: Canonical contracts must not drift:
  - API surface: `docs/03-architecture/50_api_surface.md`
  - state model + invariants: `docs/03-architecture/20_state_model.md`
  - data model: `docs/03-architecture/30_data_model.md`
  - trust ADRs: `docs/03-architecture/DECISIONS.md`
- FR-002: Validate all external inputs at route/API boundaries with Zod and return safe user-facing errors (standard envelope); do not leak internals.
- FR-003: Viewer is client-only; keep pdf.js imports behind a client boundary and cancel in-flight renders on navigation.
- FR-003a: Viewer rendering rules:
  - use viewport CSS pixels (`viewport.width/height`) for layout
  - keep canvas backing store scaled by `devicePixelRatio` for crispness
  - handle rotation safely: omit explicit rotation and let pdf.js apply `page.rotate`, or compute `totalRotation` including `page.rotate`
  - render a single page at a time in this slice (no continuous scroll)
- FR-004: Citation fixture convention: fixtures may reference documents by filename; the fixture seeder maps filename -> `documents.id` and citations persist `documents.id` in `citations.document_id` (never persist filename in `citations.document_id`).
- FR-005: Highlight renderer is a pure mapping util (unit-testable) and reused in viewer overlay rendering.
- FR-006: Canonical polygon coordinate spec:
  - store citation polygons as normalized `[0..1]` page coordinates, origin top-left, relative to unrotated page `viewBox`
  - map to viewport CSS pixels via `viewBox` -> `viewport.convertToViewportPoint()`
  - render overlay in viewport CSS pixel space (`viewport.width/height`), not canvas backing store pixels
- FR-007: Fail-closed highlight overlay:
  - if any citation invariants fail (doc mismatch, wrong page, invalid polygons, snippet_hash mismatch), render no overlay and show explicit `citation_failed` UI.
- FR-008: Reason codes recorded in provenance align with the failure taxonomy in `docs/03-architecture/60_observability_and_evals.md` where possible.
- FR-009: Export gating is server-enforced and fail-closed by default on `citation_failed`.
- FR-010: Trace export schema is an explicit allowlist; default is redacted and safe.
- FR-011: Errors include `trace_id` in the standard envelope for debugging.

## Non-Goals (Out of Scope)
- All `0001a` scope: create/list/open Matter; upload/init/complete ingest; document ingest pipelines and state machines.
- Auth/RBAC, sharing, multi-tenant admin.
- External web research inside runs.
- Quick Start run/workflow orchestration (Initiative 0002).
- Entailment verification beyond deterministic integrity/fail-closed checks.
- Monitoring dashboards.

## Failure States & UX
- Viewer render_url fetch fails: explicit safe error + retry/back.
- Page out of range: safe error and allow navigation to valid page.
- Citation invariant failure: explicit `citation_failed` panel with safe `reason_code`; no overlay.
- Missing docs: `missing_input` checklist with concrete evidence signals and upload guidance.
- Export blocked: show blocked state, count failing rows, and link to failing rows.
- Trace export denied/unavailable: show safe error message and the `trace_id`.

## Metrics / Logging
- Events:
  - `viewer.opened`, `viewer.page.rendered`, `viewer.page.render_failed`
  - `citation.fetched`, `citation.fetch_failed`
  - `citation_chip.clicked`
  - `highlight_overlay.rendered`, `highlight_overlay.failed` (reason_code)
  - `row.status_changed` (from/to + actor)
  - `export.blocked`, `export.unsafe_override_requested`, `export.unsafe_override_denied`
  - `trace_export.requested`, `trace_export.succeeded`, `trace_export.failed`
- Metrics:
  - `viewer_page_render_ms` (p50/p95 per pack), `viewer_page_jump_ms`
  - p50/p95 latency for `GET /citations/:id`
  - blocked export rate (by reason code)
  - counts of `missing_input` and `citation_failed` per pack
  - trace export size (bytes) and latency

## Rollback / Disable Plan
- Feature flags:
  - `FEATURE_PDF_VIEWER` (default off until RH1 evidence is recorded)
  - `FEATURE_CITATIONS_API` (default off until RH3 evidence is recorded)
  - `FEATURE_CITATION_HIGHLIGHTS` (default off until RH2 evidence is recorded)
  - `FEATURE_EXPORTS` (default off)
  - `FEATURE_TRACE_EXPORT` (default off)
- Safe fallbacks:
  - viewer links hidden/disabled
  - citation chips hidden or show snippet/hash without overlay (honest "highlight not available" state)
  - export hidden or read-only
  - trace export hidden; debug via DB inspection

## Risks & Dependencies
- Blocked by spikes RH1-RH5 (see `plan.md`).
- Coordinate transform drift across devicePixelRatio/rotation/zoom could create false trust; must remain fail-closed.
- False passes undermine trust; prefer more `citation_failed` rows over exporting untrusted outputs.
- Missing-doc false positives confuse users; enforce FP=0 on `pack_01_clean`.
- PII/secrets leakage risk in exports/traces/logs; enforce redaction allowlists and review.

## Success Metrics
- `pack_01_clean`: click-to-highlight works; deliberate bad citation blocks export.
- `pack_02_missing_rea`: missing-doc checklist shown; missing_input invariant holds; FP=0 on `pack_01_clean`.
- `pack_07_scans_rotated_low_quality`: viewer usable; RH1 perf evidence recorded; highlight behavior honest.

## Open Questions
- None (cuts/patches are explicitly allowed and must be documented when used).

## Sources
- `docs/04-projects/02-features/0001_trust-substrate/plan.md`
- `docs/04-projects/02-features/0001_trust-substrate/prd-overall.md`
- Slice PRDs:
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001b_pdf-viewer/prd.md`
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001c_citations-api-locking/prd.md`
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001d_citation-chip-highlight/prd.md`
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001e_row-status-export-failures/prd.md`
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.md`
- Shaping packet:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md`
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md`
- Canonical architecture/contracts:
  - `docs/03-architecture/DECISIONS.md`
  - `docs/03-architecture/20_state_model.md`
  - `docs/03-architecture/30_data_model.md`
  - `docs/03-architecture/50_api_surface.md`
  - `docs/03-architecture/60_observability_and_evals.md`

