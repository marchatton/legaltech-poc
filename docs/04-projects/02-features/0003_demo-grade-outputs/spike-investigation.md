# Spike investigation — Initiative 0003: Demo-grade outputs and repeatability

> Status: outcomes locked (assumption-driven where explicitly marked).
> Note: Practitioner/stakeholder time can still be used to falsify the assumptions, but the contracts below are now the working v1.

Per `docs/00-strategy/initiatives/prd-slicing-rules.md`: spikes come before PRDs.

## Locked outcomes (2026-02-07)

### CSV export format usability (RH1) — CLOSED (ASSUMPTION)

ASSUMPTION:
- The v1 CSV schemas below are usable enough for demo paste/import (<5 minutes of cleanup).

Falsified if:
- Practitioner says columns or ordering are unusable, or citations format needs a different shape.

Deliverables (locked):
- CSV schemas v1 (headers + ordering):
  - requirements_tracker.csv:
    1) requirement_id
    2) requirement_text
    3) source_question_id
    4) row_status
    5) source_answer
    6) failure_code
    7) citations
    8) citation_ids
    9) notes
  - exceptions_table.csv:
    1) exception_id
    2) exception_text
    3) source_question_id
    4) row_status
    5) source_answer
    6) failure_code
    7) citations
    8) citation_ids
    9) notes
  - survey_issues.csv:
    1) issue_id
    2) issue_text
    3) source_question_id
    4) row_status
    5) source_answer
    6) failure_code
    7) citations
    8) citation_ids
    9) notes

- Deterministic row ordering rule (all kinds):
  - sort by source_question_id asc
  - then by *_id asc
  - tie-breaker: citations asc
  - citations within a row sorted by (document.filename asc, page_number asc, citation_id asc)

- Citation rendering:
  - citations = unique doc/page pairs as "filename:page" joined by "; "
  - citation_ids = all citation IDs joined by "; "

Smallest falsification action:
- 60 minute practitioner paste/import test using sample exports from pack_01_clean.

### Export gating behaviour (RH5) — CLOSED

Default rule (locked):
- Exports allowed only when runs.state = completed.
- If any row is citation_failed and unsafe_override != true, return EXPORT_BLOCKED.

Unsafe override (locked, demo-only):
- unsafe_override exists but is guarded by DEMO_MODE + ALLOW_UNSAFE_EXPORTS.
- If unsafe_override=true when not allowed, return 403 UNAUTHORISED.
- Unsafe artefacts must be visibly labelled in filename and metadata_json.

UX copy (locked, required strings):
- Blocked banner title: "Export blocked"
- Body: "This run contains {n} row(s) with failed citation verification. Fix the citations or re-run. By default we do not export when any row is citation_failed."
- Demo-only button label: "Export anyway (UNSAFE)"
- Confirmation title: "Create an unsafe export?"
- Confirmation body: "This will export even though some rows failed citation verification. The file will be labelled UNSAFE and may contain unverified content. Do not share this outside internal demos."
- Confirm button: "I understand, export UNSAFE"

### Word artefact choice (RH3) — CLOSED (ASSUMPTION)

Outcome (locked):
- Single Word artefact kind = memo.

ASSUMPTION:
- Memo is the best demo narrative artefact.

Falsified if:
- Stakeholder explicitly requires objection/cure letter and provides must-have sections.

Deliverables (locked):
- Memo deterministic section order:
  1) Title
  2) Matter metadata (folder name, run_id, generated_at, versions)
  3) Deal snapshot (optional)
  4) Requirements
  5) Exceptions
  6) Survey issues
  7) Missing inputs
  8) Evidence index (optional)

- Citation rendering:
  - Inline, no footnotes:
    - "Sources: <filename>:<page> (<citation_id>); ..."

### Minimal eval metrics (RH7) — CLOSED

Hard-gate metrics (locked):
1) schema_validity (100%)
2) citation_integrity (100%)
3) failure_journeys (expected failures match)
4) export_truth_match (CSV outputs match /truth)

Report shape (locked):
- per-pack JSON + per-pack Markdown summary + cross-pack summary table

pack_09_bad_citation (locked minimum):
- pack folder contains /docs, /truth (expected failure journeys), and /produced snapshots with at least one citation_failed row.

### Demo repeatability controls and reset safety — CLOSED

Outcome (locked):
- Demo toolbar (dev-only) + checklist.
- Slice 1 reset semantics: no deletion via HTTP. Reset means loading the pack again to create a fresh matter.
- Pack loader does not auto-start runs by default (operator clicks Run Quick Start).

---

## Spike plan — CSV export format usability

## Question

Is the CSV export format usable for a paralegal who needs to paste into an existing tracker?

## Context

- Feature / concept: 3.1 CSV exports (requirements, exceptions, survey issues)
- Related requirement(s): R1
- Why now: Export usability is the core promise for "demo-grade outputs"

## Success criteria

Proof looks like:

- Practitioner can paste/import in **<5 minutes** of cleanup.
- They explicitly sign off (or give a precise change list):
  - required columns present
  - column names acceptable
  - column ordering acceptable
- Output includes:
  - row `status`
  - citations rendered as `filename:page` (and optionally `citation_id` for audit/debug)
- A decision is recorded on the export **source of truth**:
  - PASS only if the CSV can be produced from structured row payloads (`payload_schema_version` + `payload_json`) (no prose parsing), or we explicitly cut “tracker-grade CSVs” until Initiative 002 provides structure.

## Timebox

- Start: TBD
- Hard stop: TBD (1-2 hours of practitioner time, max)

## Scope

Include:

- Sample CSVs for requirements, exceptions, and survey issues.
- Citations and row statuses included (as doc name + page, plus status code).

Exclude:

- Any Excel formatting, formulas, or per-firm customisation.

## Approach

- Step 0: Confirm Initiative 002 persists structured `payload_json` + `payload_schema_version` for each artefact row (see `docs/03-architecture/50_api_surface.md`).
- Step 1: Generate 3 sample CSVs from `pack_01_clean`.
- Step 2: Hand to a practitioner for a quick paste/import test.
- Step 3: Capture feedback and lock (or revise) the column schema:
  - locked header list + ordering
  - deterministic row ordering rule (sort keys)

## Artefacts

Keep:

- Feedback notes.
- Final column schema (header list + ordering).

Throw away:

- Any prototype formatting beyond CSV.

## Expected outcomes

- If straight shot: lock the column schema and add fixture-based export snapshots.
- If tangle: cut optional columns and re-test with a minimal schema.
- If fog: focus only on requirements CSV first, then expand to the other two.

## Oracle pass

Completed (see `tmp-oracle/oracle_response_0003_1.md` and `tmp-oracle/oracle_response_0003_2.md`).

---
