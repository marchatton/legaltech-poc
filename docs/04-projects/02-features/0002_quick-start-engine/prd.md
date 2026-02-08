# PRD (Consolidated): 0002 Quick Start Engine (Quick Start: Title + Survey)

Owner:
Status: Draft (NO-GO until key spikes close)
Date: 2026-02-08
Slug: 0002-quick-start-engine

This doc consolidates the initiative spine (`prd-overall.md`) plus all slice PRDs under `prds/` into one place so a single Ralph loop can reference one canonical PRD. Slice PRDs remain the thin executable units and are still the most precise “what to build” references.

## Summary

Implement the deterministic-ish “Quick Start: Title + Survey” run that turns a fixture pack into three evidence-backed artefacts:
1. Schedule B-I requirements tracker
2. Schedule B-II exceptions table (linked to instruments)
3. Survey reconciliation issues list (title ↔ survey)

## Non-Negotiable Constraints (From Architecture)

From `docs/03-architecture/*` and `docs/03-architecture/DECISIONS.md`:
- Evidence-first (ADR-0001): drafting uses candidate `chunk_id`s; rows refer to locked `citation_id`s only.
- Verification is fail-closed (ADR-0002): integrity/invariant failures → `citation_failed`; blocked from export by default. (ADR-0017: v1 is integrity-only.)
- OCR/layout extraction is default for all PDFs (ADR-0003) for geometry highlights.
- Retrieval returns IDs (ADR-0004): chunk IDs + scores; provenance stores IDs, not prose.
- Orchestration via WDK (ADR-0005): `"use workflow"` controller; `"use step"` side effects; step idempotency via deterministic `step_key`.
- Fixtures + evals are first-class (ADR-0006): success is measurable vs `/truth`.
- No external web research inside runs (ADR-0007).
- APIs use a safe error envelope with `trace_id` (ADR-0008); never leak internal errors/provider payloads.

## Dependencies

- Initiative 0001 “trust substrate” must exist for:
  - citation locking + immutable citations
  - click-to-jump PDF viewer highlights
  - report-row status invariants and export gating UX

## Acceptance Anchors (Fixtures)

Canonical pack list: `docs/08-example-data/packs_summary.md`.

Primary near-term anchors for this initiative:
- `pack_01_clean`
- `pack_02_missing_rea`
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Global Non-Goals (Do Not Re-Introduce In Slices)

These were previously spread across slices; they are single-sourced here to avoid drift.

- Any external web research inside runs (ADR-0007).
- Any approach that weakens fail-closed verification or evidence-first contracts.
- Freeform chat / open-ended “research agent” browsing.
- Legal advice, negotiation posture, or materiality decisions.
- Universal coverage of all title company formats or survey styles (fixture-first scope).
- Geometry overlays for easements (link to evidence; do not render corridors).
- Human-in-the-loop ambiguity resolution / selection persistence (v1 shows candidates only; no “choose correct doc” flow).
- Any prose-parsing fallback when structured payload is missing/invalid for list-shaped artefacts (fail safely; stay honest).

## Dependency Map (Slices)

```mermaid
graph TD
  S1[0002a Run skeleton]
  S2[0002b Row payload contract + rendering]
  S3[0002c Commitment parsing (pack_01_clean)]
  S4[0002d Exception -> instrument matching (pack_01_clean + pack_02_missing_rea)]
  S5[0002e Survey extraction (pack_01_clean + pack_03)]
  S6[0002f Reconciliation honesty (pack_03 + pack_07)]

  S1 --> S2
  S2 --> S3
  S3 --> S4
  S2 --> S5
  S4 --> S6
  S5 --> S6
```

## Spike Gates (Implementation Is NO-GO Until Closed)

These gates come from `brief.md`, `risk-register.md`, and `spike-investigation.md`.

Contracts frozen:
- SP-2.1 question set v1 (<=25) + practitioner review: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json`
- SP-2.7 payload storage decision (Option 4) + schema doc: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Comparator spec v0 is canonical and referenced everywhere: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

Fixture-verifiable spikes passed (proof artefacts committed under `spike-proofs/`):
- SP-2.8 Retrieval Recall@K baseline on `pack_01_clean`
- SP-2.2A Commitment parsing baseline on `pack_01_clean` (truth comparators)
- SP-2.3A Exception matching baseline + missing-doc journey on `pack_02_missing_rea`
- SP-2.4A Survey extraction baseline + cert gap issue code on `pack_03_mismatch_and_cert_gap`
- SP-2.5 Reconciliation honesty policy proven on `pack_03` + `pack_07`
- SP-2.6 Idempotency + snippet_hash stability; run continues and can still reach `completed` with a `citation_failed` row
- SP-2.11 List verification semantics pinned (policy doc) consistent with fail-closed + immutable citations

Explicit cut (must remain cut in v1):
- RH-2.16 human-in-loop ambiguity resolution is cut (v1). See `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md`

---

# Consolidated Slice Details

The sections below are the slice PRDs reassembled into a single doc. Where the same concept repeats across slices (architecture constraints, “no web research”, evidence-first), it is intentionally single-sourced above.

## Slice 0002a: Run Skeleton + Version Pinning + Incremental Progress

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md`

### Introduction / Overview

#### Problem
We need a durable, resumable, observable Quick Start run surface (API + workflow + UI) before we can safely iterate on parsing/matching/extraction logic.

#### Goal
Ship the canonical run API + WDK workflow skeleton that:
- pins versions (`index_version`, `agent_bundle_version`, `question_set_version`)
- writes rows incrementally with correct terminal statuses and invariants
- is fully debuggable (`trace_id`, `step_key`, reason codes)

#### Slice
Implement the run skeleton only:
- Question set v1 is loaded and pinned per run.
- Workflow executes the step machine (`retrieve -> draft -> lock -> verify -> write`) but may return placeholder `missing_input` rows until parsing/matching slices ship.

#### Primary Observable Effect
On a Matter built from a fixture pack, a user can click "Quick Start: Title + Survey" and see:
- a running progress indicator (questions_total/questions_done)
- rows appearing in the report table as each question completes
- stable, terminal statuses per row

#### In Scope
- API endpoints (canonical): `POST /folders/:id/runs`, `GET /runs/:id`, `GET /folders/:id/report?run_id=...`
- Error envelope + `trace_id` on non-2xx (ADR-0008)
- Run + step correlation: `{trace_id, run_id, step_key, question_id}` (observability doc)
- WDK workflow/step boundaries (`"use workflow"`, `"use step"`) and deterministic step idempotency via `step_key`
- Unique `(run_id, question_id)` enforcement (no duplicate rows on retries)

### Goals

- A run can start, progress, and complete deterministically on fixture Matters without producing duplicate rows.
- Every produced row obeys `docs/03-architecture/20_state_model.md` invariants.
- Debugging is possible from persisted state and logs (no “black box” runs).

### User Stories

#### US-001: Start Quick Start run and observe progress
As a user, I can start a Quick Start run and watch progress so I know it’s working and can inspect partial results.

Acceptance criteria:
- `POST /folders/:id/runs` only allows start when `folders.state in {indexed, ready}`; otherwise returns `409` with `error.code="CONFLICT"` and the standard error envelope including `trace_id`.
- The created run pins `index_version`, `agent_bundle_version`, and `question_set_version` and returns them in the response.
- `GET /runs/:id` returns progress counts and failure taxonomy counts (shape per `docs/03-architecture/50_api_surface.md`).

Verification:
- Packs: `docs/08-example-data/pack_01_clean`, `docs/08-example-data/pack_02_missing_rea`
- Manual: start run from UI; observe progress updates; refresh mid-run and confirm state is consistent.

#### US-002: Rows appear incrementally and always obey invariants
As a user, I can see rows appear in the report table as they finish, and every row is in a terminal status with correct evidence behavior.

Acceptance criteria:
- `GET /folders/:id/report?run_id=...` returns rows for the selected run; UI never reads Postgres directly.
- `completed` runs have exactly one row per `question_id` for the run’s `question_set_version`.
- If a row is `missing_input`, `answer` is exactly `Not found in provided documents.`, citations are empty, and `notes` (or provenance) includes an actionable checklist.
- If a row is `citation_failed`, provenance includes a safe taxonomy reason code (e.g. `CITATION_MISMATCH`, `NO_CITATIONS`).
- Row-level failures do not crash the run: if a question yields `citation_failed`, the workflow continues and the run can still reach `completed` after writing terminal rows for all questions (exports remain blocked by default).

Verification:
- Packs: `pack_01_clean`, `pack_02_missing_rea`
- Automated: DB constraint for unique `(run_id, question_id)`; row invariant audit helper (if present).

### Functional Requirements

- API layer validates external inputs with Zod and returns the safe error envelope (ADR-0008).
- `POST /folders/:id/runs` supports `Idempotency-Key` (for safe retries).
- Workflow controller contains no side effects; all side effects occur in steps.
- Steps record a deterministic `step_key` in `run_steps` and short-circuit repeats.
- Workflow and steps use the WDK directive string literal as the first statement (`"use workflow"`, `"use step"`).
- Logs/events are correlate-able with `{trace_id, run_id, step_key, question_id}` and avoid raw PDF/text logging (logging safety rules).

### Non-Goals (Slice-Specific)

- Correct parsing/matching/extraction outputs (handled in later slices).

### Failure States & UX

- Folder not runnable (`empty|ingesting|failed`): disable CTA + show safe error reason (no stack traces).
- Run step failure: run becomes `partial` with a visible failure banner; completed rows remain inspectable.
- Row failure: write a terminal `citation_failed` row with reason code and guidance, then continue to the next question; run may still reach `completed`.

### Metrics / Logging

- `run_duration_ms` (p50/p95), retries per step, counts by row status, counts by failure taxonomy code.

### Rollback / Disable Plan

- Feature flag: `quick_start_enabled` (default off until slice 2+ ship).

### Slice Sources

- `docs/03-architecture/50_api_surface.md` (canonical endpoints + error envelope)
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` (WDK conventions)
- `docs/03-architecture/20_state_model.md` (row/run invariants)
- `docs/03-architecture/60_observability_and_evals.md` (taxonomy + correlation)
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`

## Slice 0002b: Row Payload Contract + Artefact Table Rendering

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md`

### Introduction / Overview

#### Problem
The Quick Start UX is “artefacts-first”, but the canonical report row model is a flat `{answer, citation_ids[], status}` shell. Without a stable, versioned structured payload contract, we can’t:
- render B-I/B-II/issues as tables deterministically
- diff outputs for evals
- keep item-level evidence honest without inventing new row statuses

#### Goal
Introduce a versioned, list-shaped payload contract for artefact rows and make it renderable in the UI from locked citations only.

#### Slice
Ship the payload contract + storage + API exposure + UI rendering for list-shaped artefacts.

#### Primary Observable Effect
In the report table, list-shaped artefact rows render as tables backed by structured `payload_json` (not prose parsing), with item-level citations that jump-to-evidence.

#### In Scope
- A single, stable “list payload v0” schema with:
  - stable `item_id`
  - item-level `citation_ids[]`
  - optional item-level states (`match_status`, `item_classification`) that do not change report-row statuses
  - canonical schema doc: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Storage + versioning for structured payload (see decision below)
- API returns payload + schema version alongside the existing row shell
- UI renders artefact tables from payload (table view + row drawer)

### Decision (Pinned by SP-2.7)

Implement Option 4:
- Add `report_rows.payload_json` (JSONB) and `report_rows.payload_schema_version` (string)
- Keep `report_rows.answer` as a human-readable summary string
- Keep `report_rows.provenance_json` as debug-only (do not rely on it as a product contract)

### Goals

- List-shaped artefacts can be rendered deterministically from structured payload (no prose parsing).
- Payload is stable and versioned for eval comparators and UI.
- Item-level evidence is honest: unsupported fields/items are downgraded (no fabrication).

### User Stories

#### US-001: Artefact rows have a versioned list payload
As a user, I want B-I/B-II/issues to be structured so that the UI can render them as tables and evals can compare them reliably.

Acceptance criteria:
- Artefact rows include `payload_schema_version = "list_payload_v0"` and `payload_json.items[]`.
- Each item has a stable `item_id` and item-level `citation_ids[]` for any claimed fields.
- Item-level states do not invent new report-row statuses.

Verification:
- Packs: `pack_01_clean` (seeded payload acceptable for this slice)
- Automated: Zod schema validation for payload_json; JSON round-trip stability.

#### US-002: UI renders artefact tables from payload and locked citations
As a user, I can view B-I/B-II/issues as tables, open a row drawer, and click citations to jump to evidence.

Acceptance criteria:
- UI renders artefact rows from `payload_json` only (no parsing `answer` prose).
- Clicking an item’s citation chip uses locked citations (`GET /citations/:id`) and highlights evidence in the viewer (dependency: Initiative 0001).
- If payload is missing or invalid, UI shows a safe error state (no internal leak) and the row remains inspectable.

Verification:
- Manual: seeded fixture run shows tables render; citations click-to-highlight.

### Functional Requirements

- Payload schemas live in `packages/core/schemas` (Zod) and are validated at the step boundary (see `docs/03-architecture/06_frameworks_agents_rag_evals.md`).
- Add DB columns `report_rows.payload_json` (JSONB) and `report_rows.payload_schema_version` (string).
- `GET /folders/:id/report?run_id=...` includes payload fields (nullable) in each row response, without breaking existing clients.
- Item-level citations are locked `citation_id`s only; no chunk IDs are exposed to the UI (ADR-0001).
- Error handling uses the standard error envelope with `trace_id` (ADR-0008).

### Non-Goals (Slice-Specific)

- Defining the final set of fields for each artefact (owned by later parsing/matching/survey slices and truth comparators).
- Any human-in-the-loop editing or mutation of row content.

### Failure States & UX

- Invalid payload schema: show “row payload invalid” banner with safe `error.code=INTERNAL` and `trace_id`.
- Missing payload for an artefact row: show “payload not available yet” guidance; do not attempt prose parsing.

### Metrics / Logging

- Count of payload schema validation failures (hard gate in evals).
- UI render failures by payload_schema_version (should be 0 for v0).

### Rollback / Disable Plan

- Feature flag: `artefact_table_rendering_enabled` (default off until seeded payload renders correctly).

### Slice Sources

- SP-2.7: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- State invariants: `docs/03-architecture/20_state_model.md`
- API contract: `docs/03-architecture/50_api_surface.md`
- Evidence-first ADRs: `docs/03-architecture/DECISIONS.md` (ADR-0001, ADR-0002)

## Slice 0002c: Commitment Parsing Baseline (pack_01_clean)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md`

### Introduction / Overview

#### Problem
We need deterministic, fixture-verifiable extraction of commitment structure (B-I requirements + B-II exceptions) before we can claim the Quick Start artefacts are real.

#### Goal
For `pack_01_clean`, produce B-I + B-II structured payloads that match `/truth` key fields with locked citations and fail-closed verification.

#### Slice
Implement commitment parsing for the clean pack only:
- Identify the commitment doc(s)
- Extract B-I and B-II items into the list payload contract
- Attach lockable citations per item and verify fail-closed

#### Primary Observable Effect
On `pack_01_clean`, the report table shows:
- a B-I requirements tracker artefact row with items matching truth key fields
- a B-II exceptions table artefact row with items matching truth key fields
Both rows are `needs_review` with lockable citations; no extra hallucinated items.

#### In Scope
- `pack_01_clean` only
- Output comparison vs:
  - `truth/expected_requirements_tracker.csv`
  - `truth/expected_exceptions_table.csv`
- Item normalisation rules for item numbering and instrument reference canonical form (when present in truth)

### Goals

- 0 false positives: never emit an item that is not present in truth by item number.
- Evidence-backed items: claimed fields have lockable citations; verification passes.
- Comparator-driven proof: diffs vs truth are computed, not eyeballed.

### User Stories

#### US-001: Extract B-I requirements tracker (clean pack)
As a user, I can see a B-I requirements tracker table derived from the commitment and backed by evidence.

Acceptance criteria:
- For `pack_01_clean`, extracted requirements item count equals truth item count.
- Every extracted item has the correct truth item number and required key fields as defined by the comparator.
- Precision rule: no extra items not present in truth by item number.
- Each extracted item has item-level `citation_ids[]` that lock and verify (no header-only evidence for item content).

Verification:
- Pack: `docs/08-example-data/pack_01_clean`
- Automated: comparator diffs vs `truth/expected_requirements_tracker.csv` (rules single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`); row invariant audit; citation integrity checks.

#### US-002: Extract B-II exceptions table (clean pack)
As a user, I can see a B-II exceptions table derived from the commitment and backed by evidence.

Acceptance criteria:
- For `pack_01_clean`, extracted exceptions item count equals truth item count.
- Every extracted exception has the correct item number and required key fields as defined by the comparator.
- Instrument references are normalised to a single canonical form (declared once and reused everywhere).
- Each extracted exception item has item-level `citation_ids[]` that lock and verify.

Verification:
- Pack: `pack_01_clean`
- Automated: comparator diffs vs `truth/expected_exceptions_table.csv` (rules single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`); citation integrity checks.

### Functional Requirements

- Retrieval returns chunk IDs + scores (ADR-0004) and stores retrieved IDs/scores in row provenance (debug-only).
- Drafting output includes candidate citations as chunk IDs (ADR-0001), which are then locked into immutable citations before verification.
- Verification is fail-closed (ADR-0002). Any mismatch yields `citation_failed` with taxonomy reason code.
- Step boundaries follow WDK conventions (`"use workflow"`, `"use step"`), and step inputs/outputs are JSON-serialisable and Zod-validated.
- The list payload contract from slice 0002b is used (`payload_schema_version=list_payload_v0`, stable `item_id`).
- Any model calls (draft/verify/embed) go through AI SDK per the repo’s provider posture; do not call provider SDKs directly without an explicit reason.

### Non-Goals (Slice-Specific)

- Scan torture behavior (`pack_07_scans_rotated_low_quality`).
- Multi-parcel scoping (`pack_04_multi_parcel`).
- Exception → instrument PDF matching (slice 0002d).

### Failure States & UX

- If evidence cannot be locked for an item field, downgrade that field/item to `unknown` rather than fabricating it; keep row `needs_review`.
- If verification fails for the row, row becomes `citation_failed` with reason code and guidance.

### Metrics / Logging

- Comparator pass rate for B-I and B-II on pack_01_clean.
- Failure taxonomy counts (`RETRIEVAL_MISS`, `NO_CITATIONS`, `CITATION_MISMATCH`).

### Rollback / Disable Plan

- Feature flag: `quick_start_commitment_parsing_enabled` (default off until pack_01_clean passes).

### Slice Sources

- `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/20_state_model.md`, `docs/03-architecture/60_observability_and_evals.md`
- SP-2.2A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Comparator spec: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

## Slice 0002d: Exception -> Instrument Matching (pack_01_clean + pack_02_missing_rea)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md`

### Introduction / Overview

#### Problem
Even if we extract a correct B-II exceptions list, it’s not useful unless each exception can be linked to the correct instrument PDF (or explicitly marked missing/ambiguous) without silent false matches.

#### Goal
For `pack_01_clean` and `pack_02_missing_rea`, deterministically match exceptions to instrument docs and surface missing/ambiguous states explicitly, backed by locked citations.

#### Slice
Implement matching baseline + missing-doc journey:
- Deterministic matching rules (instrument number, book/page, filename hints)
- Item-level `match_status` with candidates (no silent auto-pick)
- Missing-doc checklist behavior for `pack_02_missing_rea`

#### Primary Observable Effect
In the B-II exceptions table:
- Each exception item shows a match badge (`matched|ambiguous|missing_doc`) and matched doc name (or candidates list)
- Missing docs show an actionable checklist

#### In Scope
- Packs: `pack_01_clean`, `pack_02_missing_rea`
- Item-level match states: `matched|ambiguous|missing_doc`
- Candidate display (no selection/persistence in v1)

### Goals

- No silent false matches: ambiguous cases are surfaced, not auto-picked.
- Missing-doc journey is explicit and actionable.
- Matching evidence is inspectable (citations point to the reference fields used for matching).

### User Stories

#### US-001: Match exceptions to instrument PDFs (clean pack)
As a user, I can click an exception item and see which instrument it matched to, with evidence.

Acceptance criteria:
- For `pack_01_clean`, exception items with truth-linked instruments resolve to `match_status=matched`.
- Each matched item includes citations that support the match (e.g. instrument no / recording reference).
- No silent auto-pick: if >1 candidate matches, the item is `match_status=ambiguous` with candidates listed.

Verification:
- Pack: `docs/08-example-data/pack_01_clean`
- Automated: spot-check candidate lists vs expected; ensure no items are marked matched when multiple candidates exist.

#### US-002: Surface missing-doc journey (pack_02_missing_rea)
As a user, I see missing instrument docs called out explicitly with a checklist so I can fix the pack.

Acceptance criteria:
- For `pack_02_missing_rea`, exceptions referencing the missing REA are `match_status=missing_doc`.
- Row notes include an actionable checklist, including the expected filename when known (e.g. `REA.pdf`).
- Row status uses `missing_input` only when an answer truly cannot be supported; otherwise row remains `needs_review` with item-level missing states.

Verification:
- Pack: `docs/08-example-data/pack_02_missing_rea`
- Manual: verify checklist copy is actionable and specific (no generic “upload doc” only).

### Functional Requirements

- Matching runs as a workflow step (`"use step"`) and is idempotent via deterministic `step_key`.
- Item-level match state is stored in the list payload (not as a report-row status).
- Evidence-first: matching references are backed by locked citations; if citations can’t be locked, downgrade to `ambiguous` or `missing_doc` (no fabricated match).
- Errors use the standard error envelope with `trace_id` (ADR-0008) and avoid leaking provider payloads.
- Reason codes align with the failure taxonomy when matching fails in a row-blocking way (e.g. `RETRIEVAL_MISS`).

### Non-Goals (Slice-Specific)

- Missing attachment detection (`pack_06_overlapping_easements`) and exhibit chase (`pack_08_defined_terms_and_cross_refs`) (handled in later slices/spikes).
- Human-in-the-loop “choose correct doc” persistence (v1 cut; must re-verify and must not mutate immutable citations if added later).

### Failure States & UX

- Ambiguous match: show candidates + guidance; keep row `needs_review`.
- Missing doc: show checklist; keep row inspectable; allow upload + re-run.

### Rollback / Disable Plan

- Feature flag: `exception_matching_enabled` (default off until `pack_01_clean` and `pack_02_missing_rea` pass).

### Slice Sources

- SP-2.3A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/40_rag_and_agents.md`

## Slice 0002e: Survey Extraction Baseline + Cert Gap (pack_01_clean + pack_03)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md`

### Introduction / Overview

#### Problem
Survey reconciliation is only as honest as the underlying survey extraction. If we can’t reliably extract certification parties and baseline text callouts with evidence, reconciliation will drift into hallucinations.

#### Goal
For `pack_01_clean` and `pack_03_mismatch_and_cert_gap`, extract:
- certification parties (including lender presence/absence where truth supports it)
- baseline text callouts (where truth supports them)
with locked citations and fail-closed verification.

#### Slice
Implement survey extraction baseline:
- Survey doc classification/routing
- Structured output for certification + callouts in list payload
- `CERT_MISSING_LENDER` (or equivalent) issue code for cert gap pack

#### Primary Observable Effect
In the survey artefact row drawer:
- certification section shows extracted parties with citations
- issues include a cert gap issue code for `pack_03_mismatch_and_cert_gap` with evidence

#### In Scope
- Packs: `pack_01_clean`, `pack_03_mismatch_and_cert_gap`
- Outputs compared to `truth/expected_survey_issues.csv` where applicable (key fields, not wording)
- Comparator rules are single-sourced in `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

### Goals

- No invented callouts: if evidence can’t be locked, downgrade or fail safely.
- Cert gap is explicit and machine-readable (issue code), not just prose.
- Outputs are fixture-verifiable and support later reconciliation safely.

### User Stories

#### US-001: Extract certification parties with citations
As a user, I can see certification parties (where present) backed by evidence so I can trust the survey extraction.

Acceptance criteria:
- For `pack_01_clean`, certification parties extracted match truth key fields where truth supports them.
- Each extracted party field has lockable citations; row is `needs_review` when verification passes.

Verification:
- Pack: `pack_01_clean`
- Automated: comparator against truth key fields; citation integrity checks.

#### US-002: Flag certification gap as structured issue code
As a user, I see a structured cert gap issue (missing lender) backed by evidence, not a vague note.

Acceptance criteria:
- For `pack_03_mismatch_and_cert_gap`, missing lender certification is surfaced as a structured issue code (e.g. `CERT_MISSING_LENDER`) with citation to the certification block.
- No fabricated lender name is emitted when lender is missing; field is absent/unknown.

Verification:
- Pack: `pack_03_mismatch_and_cert_gap`
- Manual: open row drawer and confirm issue code + evidence jump.

### Functional Requirements

- Survey extraction runs in steps (`"use step"`) and records deterministic `step_key` and provenance (retrieved chunk IDs + scores) safely.
- Candidate citations are chunk IDs; citations are locked and immutable before verification (ADR-0001).
- Verification is fail-closed (ADR-0002) and uses taxonomy reason codes from `docs/03-architecture/60_observability_and_evals.md`.
- Model calls go through the repo’s AI gateway posture; do not leak provider payloads to clients/logs.
- On low-quality behavior where no citations can be locked, row must fall back safely to `missing_input` with remediation checklist (no invented callouts).

### Non-Goals (Slice-Specific)

- Scan torture survey behavior (`pack_07_scans_rotated_low_quality`) beyond the safe fallback policy (handled in follow-up slice/spike).
- Geometry-only callouts without text support.

### Rollback / Disable Plan

- Feature flag: `survey_extraction_enabled` (default off until `pack_01_clean` and `pack_03_mismatch_and_cert_gap` pass).

### Slice Sources

- SP-2.4A: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/60_observability_and_evals.md`
- Comparator spec: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`

## Slice 0002f: Reconciliation Issues List Honesty Policy (pack_03 + pack_07)

Source: `docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md`

### Introduction / Overview

#### Problem
Reconciliation is high-trust and high-risk. A confident but wrong “not depicted” claim is worse than “unknown”. We need an explicit, evidence-thresholded policy that keeps outputs honest under uncertainty.

#### Goal
Generate a reconciliation issues list with item-level classifications and strict evidence rules:
- bias to item-level `unknown` when evidence is weak
- only emit item-level `not_depicted` when there is positive evidence of absence (narrowly defined and cited)

#### Slice
Ship the reconciliation issues list generator + UI guidance copy under the list payload contract, proven on:
- `pack_03_mismatch_and_cert_gap` (forces mismatch issues)
- `pack_07_scans_rotated_low_quality` (forces uncertainty)

#### Primary Observable Effect
In the reconciliation issues artefact row drawer:
- issues are classified as `depicted|not_depicted|unknown`
- “unknown” issues include guidance about what evidence is missing
- the row remains `needs_review` (unless it truly must be `missing_input` or `citation_failed`)

#### In Scope
- Explicit evidence thresholds and downgrade rules
- Item-level classification only (no new report-row statuses)
- Guidance copy generation for “unknown”

### Goals

- No hallucinated negatives: `not_depicted` is rare and requires strong evidence.
- Under scan/noisy evidence, issues downgrade to `unknown` or `missing_input` safely.
- Outputs remain verifiable (locked citations) and fail-closed.

### User Stories

#### US-001: Produce honest reconciliation classifications (unknown bias)
As a user, I can trust that “not depicted” is only emitted when strongly supported, and uncertainty is surfaced as “unknown”.

Acceptance criteria:
- Reconciliation items use item-level classification `depicted|not_depicted|unknown`.
- `not_depicted` requires positive evidence of absence that is narrowly defined and cited.
- When evidence is weak or ambiguous, items are downgraded to `unknown` (no fabricated “not shown”).

Verification:
- Packs: `pack_03_mismatch_and_cert_gap`, `pack_07_scans_rotated_low_quality`
- Manual: review a small set of issues and confirm evidence thresholds are applied consistently.

#### US-002: Unknown issues are actionable (guidance copy)
As a user, when an issue is “unknown”, I see what evidence is missing and what to do next.

Acceptance criteria:
- Issue drawer includes guidance copy explaining what evidence is missing (survey callout text, instrument match, etc).
- Guidance does not leak internal errors/provider payloads and avoids vague “try again” copy; it points to concrete remediation.

Verification:
- Manual: run on `pack_07_scans_rotated_low_quality` and confirm guidance is specific to the observed failure mode.

### Functional Requirements

- Reconciliation runs as steps (`"use step"`) and is idempotent; step outputs are JSON-serialisable and Zod-validated.
- Issues payload uses list payload contract v0 with stable `item_id` and item-level `citation_ids[]` for claimed fields.
- Cross-evidence citations (instrument clause + survey callout) are required for “depicted” classifications when the claim spans both sources; if either can’t be locked, downgrade to `unknown`.
- Verification is fail-closed and uses taxonomy reason codes (e.g. `NO_CITATIONS`, `CITATION_MISMATCH`).
- On low-quality scan behavior where no citations can be locked, row must fall back safely to `missing_input` with remediation checklist.
- If any model fallback is used, it must run via the repo’s AI gateway posture with strict schemas and safe telemetry; determinism-first rules remain the default.

### Non-Goals (Slice-Specific)

- Geometry overlays or corridor plotting.
- Human-in-the-loop mutation of existing citations/rows.

### Rollback / Disable Plan

- Feature flag: `reconciliation_enabled` (default off until `pack_03` and `pack_07` pass).

### Slice Sources

- SP-2.5: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/60_observability_and_evals.md`

## Sources

- Spine PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
- Brief: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Breadboard: `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
- Risks: `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
- Spikes: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Slice PRDs: `docs/04-projects/02-features/0002_quick-start-engine/prds/`
