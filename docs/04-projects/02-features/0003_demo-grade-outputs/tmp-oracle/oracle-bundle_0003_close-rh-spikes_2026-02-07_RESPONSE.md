## Spike closures

### Summary table

| Spike                        | Risk IDs      | Locked outcome                                                                                                                   | Needs external human?                | Status                  |
| ---------------------------- | ------------- | -------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------ | ----------------------- |
| CSV export format usability  | RH1           | Lock CSV schemas v1 (3 kinds) + deterministic ordering + citations format                                                        | Practitioner sign‑off would be ideal | **Closed (ASSUMPTION)** |
| Export gating behaviour      | RH5           | Default **block** on any `citation_failed` unless `unsafe_override=true` (demo‑only). Also require `runs.state=completed`        | No                                   | **Closed**              |
| Word artefact choice         | RH3           | **Memo** is the single Word export. Fixed section list + deterministic ordering + citation rendering                             | Stakeholder choice would be ideal    | **Closed (ASSUMPTION)** |
| Minimal eval metrics         | RH7           | 4 hard gates + stable report shape + define `pack_03_bad_citation` minimal contents                                              | No                                   | **Closed**              |
| Demo controls + reset safety | RH10/RH11-ish | **Toolbar (dev-only) + checklist**. Reset semantics slice 1: **no deletion via HTTP**, “reset” = seed fresh matter from fixtures | No                                   | **Closed**              |

---

## Spike 1: CSV export format usability

### Outcome (locked)

We ship **three CSV artefacts** with **locked v1 headers**, stable citation rendering, and deterministic row ordering.

And we do it without parsing prose: exporters consume **structured `export_payload`** (per brief dependency on Initiative 002) and fail closed if missing.

### ASSUMPTION (to close RH1)

**ASSUMPTION:** This v1 schema is “usable enough” for demo paste/import workflows (paralegal tracker style), with <5 minutes of cleanup.

**Falsified if:**

* A practitioner says any of:

  * “Columns missing” (they need a field we don’t have)
  * “Column names don’t work” (they can’t map/import)
  * “Ordering is wrong” (import templates expect different order)
  * “Citations format is unusable” (needs separate doc/page columns)
* Or they cannot paste/import within 5 minutes on the sample pack.

**Smallest next action (if you want to de-risk):**

* 60 minutes with a practitioner + 10 minutes to write a one-page “change list”.
* Artefact to capture: “CSV schema feedback notes” with explicit *keep/change* per column + ordering.

### CSV v1 schemas (locked)

Common rules for all three CSVs:

* Encoding: UTF‑8
* Newlines: `\n` (LF) for determinism
* RFC4180 quoting (quote on commas/quotes/newlines)
* `citations` format: **unique doc/page pairs**, sorted, joined with `; `
  Example: `Title Commitment.pdf:12; Survey.pdf:3`
* `citation_ids` format: all citation IDs, sorted, joined with `; `
  Example: `cit_123; cit_124`
* `row_status` must be one of: `needs_review|reviewed|missing_input|citation_failed`
* `source_answer`:

  * if `row_status=missing_input`, must be exactly `Not found in provided documents.`
  * otherwise blank
* `failure_code`:

  * if `row_status=citation_failed`, set to provenance reason code (e.g. `CITATION_MISMATCH`, `ENTAILMENT_FAIL`)
  * otherwise blank

#### 1) `requirements_tracker.csv`

Header order (v1):

1. `requirement_id`
2. `requirement_text`
3. `source_question_id`
4. `row_status`
5. `source_answer`
6. `failure_code`
7. `citations`
8. `citation_ids`
9. `notes`

#### 2) `exceptions_table.csv`

Header order (v1):

1. `exception_id`
2. `exception_text`
3. `source_question_id`
4. `row_status`
5. `source_answer`
6. `failure_code`
7. `citations`
8. `citation_ids`
9. `notes`

#### 3) `survey_issues.csv`

Header order (v1):

1. `issue_id`
2. `issue_text`
3. `source_question_id`
4. `row_status`
5. `source_answer`
6. `failure_code`
7. `citations`
8. `citation_ids`
9. `notes`

### Deterministic row ordering rule (locked)

For each CSV kind:

1. Build rows from the run by aggregating `export_payload.items` for that `kind` across all report rows in the run.
2. For each item:

   * `source_question_id` is required (comes from the report row).
   * If item has no explicit `*_id`, generate deterministically:

     * `requirement_id = "${source_question_id}-REQ-${pad3(item_index+1)}"`
     * `exception_id = "${source_question_id}-EXC-${pad3(item_index+1)}"`
     * `issue_id = "${source_question_id}-ISS-${pad3(item_index+1)}"`
3. Sort exported rows by:

   1. `source_question_id` (ascending, string)
   2. `*_id` (ascending, string)
   3. tie-breaker: `citations` (ascending, string)
4. Within `citations` and `citation_ids`, sort deterministically:

   * `citations`: by `(document.filename asc, page_number asc, citation_id asc)` with doc/page uniqueness
   * `citation_ids`: by `citation_id asc`

---

## Spike 2: Export gating behaviour

### Outcome (locked)

Default is **fail‑closed** and matches the canonical state model and API surface:

* Export allowed only when **`runs.state = completed`**.
* Export **blocked** (`EXPORT_BLOCKED`) if **any** row in the run is `citation_failed`, **unless** `unsafe_override=true` is used.
* `unsafe_override` exists, but is **demo‑only** and must be guarded.

### Default rule (locked)

**Rule:**
If `runs.state != completed` → `409 CONFLICT` (`error.code="CONFLICT"`).
If any `report_rows.status == citation_failed` and `unsafe_override != true` → non‑2xx (`error.code="EXPORT_BLOCKED"`).
Else → proceed, generate artefact, persist, return `{ artefact: { …, download_url } }`.

### `unsafe_override` decision (locked)

**unsafe_override exists** (because the canonical contracts already reserve it), but it is tightly scoped:

Server-side guardrails (exact):

1. `DEMO_MODE` must be enabled (same gate as demo toolbar).
2. `ALLOW_UNSAFE_EXPORTS` must be enabled (second, explicit opt-in).
3. If either is false and request has `unsafe_override=true` → `403 UNAUTHORISED`.

Artefact labelling (exact):

* `artefact.metadata_json.unsafe_override = true`
* `artefact.metadata_json.unsafe_reason = "citation_failed_present"`
* filename is labelled:

  * `requirements_tracker.UNSAFE.csv`
  * `exceptions_table.UNSAFE.csv`
  * `survey_issues.UNSAFE.csv`
  * `memo.UNSAFE.docx`

Behaviour under unsafe export (exact):

* Export proceeds even if `citation_failed` rows exist.
* Any exported rows/items derived from a `citation_failed` report row must:

  * have `row_status=citation_failed`
  * have `failure_code` populated from provenance
  * have empty `citations` and `citation_ids` (do not export untrusted evidence)
  * have `notes` prefixed with `UNSAFE: `

### UX copy requirements (exact)

Blocked banner (when `EXPORT_BLOCKED`, always shown):

* Title: `Export blocked`
* Body: `This run contains {n} row(s) with failed citation verification. Fix the citations or re-run. By default we do not export when any row is citation_failed.`
* Detail line: `Run must be completed. Exports are only available for completed runs.`
* CTA (normal): `Review failed rows`

Unsafe override CTA (only when `DEMO_MODE && ALLOW_UNSAFE_EXPORTS`):

* Button label: `Export anyway (UNSAFE)`
* Confirmation modal title: `Create an unsafe export?`
* Confirmation body: `This will export even though some rows failed citation verification. The file will be labelled UNSAFE and may contain unverified content. Do not share this outside internal demos.`
* Confirm button: `I understand, export UNSAFE`
* Cancel button: `Cancel`

---

## Spike 3: Word artefact choice

### Outcome (locked)

We ship **one Word artefact: `memo`**.

Rationale (why memo wins here):

* Matches existing brief + PRD direction.
* Lowest formatting and tone risk vs an objection/cure letter.
* Lets us include all three artefact sections without pretending to be a final legal letter.

### ASSUMPTION (to close RH3)

**ASSUMPTION:** Memo is the best demo narrative artefact for the intended audience.

**Falsified if:**

* A stakeholder explicitly says the demo story requires a letter format (objection/cure), and they can articulate why the memo fails.

**Smallest next action (if you want to de-risk):**

* 15 minute stakeholder decision.
* Artefact: 5 bullets of “must include” and “must not include” for the memo.

### Memo sections v1 (locked)

Deterministic section order:

1. **Title**

   * `Memo: Title + Survey Summary`
2. **Matter metadata**

   * Matter name (folder name)
   * Run ID
   * Generated at (UTC ISO timestamp)
   * Versions: `index_version`, `agent_bundle_version`, `question_set_version`
3. **Deal snapshot** (optional, if available in structured payload)
4. **Requirements**
5. **Exceptions**
6. **Survey issues**
7. **Missing inputs**

   * Only rows with `row_status=missing_input`
8. **Evidence index** (optional, but recommended if low effort)

   * Unique list of citations used (doc + page + citation_id), sorted

Item ordering within sections:

* Requirements: by `requirement_id` ascending
* Exceptions: by `exception_id` ascending
* Survey issues: by `issue_id` ascending
* Missing inputs: by `source_question_id` ascending

### Citation rendering format v1 (locked)

Inline at end of each bullet (no footnotes to avoid docx viewer weirdness):

* Format for each citation: `<filename>:<page_number> (<citation_id>)`
* Multiple citations joined with `; `
* Example: `Sources: Title Commitment.pdf:12 (cit_123); Survey.pdf:3 (cit_456)`

Missing input representation:

* Show the question label (or short identifier) then: `Not found in provided documents.`
* Include `notes` content (missing-doc checklist) as a sub-bullet.

Docx viewer sanity bar (locked):

* We only require “not broken” in:

  * Word
  * Google Docs
  * macOS Preview (or equivalent)
* Formatting constraints:

  * no complex tables
  * no floating text boxes
  * no footnotes for v1
  * use simple headings + bullet lists only

---

## Spike 4: Minimal eval metrics

### Outcome (locked)

We define **4 hard gates** and a stable report shape.

Hard gates (3–5 requested, we’re doing 4):

1. **Schema validity (100%)**
2. **Citation integrity (100%)**
3. **Failure journeys (expected failures must match)**
4. **Export truth match (CSV snapshots match `/truth`)**

### Metric definitions (hard gates)

1. **Schema validity**

   * Every produced `report_row` validates against the Zod schema.
   * Enforce state-model invariants as part of the check:

     * `missing_input` answer exactly `Not found in provided documents.`
     * `needs_review|reviewed` have ≥1 citation_id
   * Every `export_payload` validates against the v1 export schemas for the relevant kind.

2. **Citation integrity**
   For every citation referenced by a `needs_review|reviewed` row:

   * cited document exists
   * `page_number` within bounds
   * polygons exist and are non-empty
   * `snippet_hash` matches canonical normalisation rule (single shared implementation)

3. **Failure journeys**
   For packs designed to demonstrate failures:

   * `pack_02_missing_rea`: designated questions must be `missing_input`
   * `pack_03_bad_citation`: designated questions must be `citation_failed` with a safe reason code in provenance

4. **Export truth match**

   * Generate CSV exports (via the CSV mappers, not HTTP).
   * Compare output CSV (normalising line endings to LF) to:

     * `/truth/expected_requirements_tracker.csv`
     * `/truth/expected_exceptions_table.csv`
     * `/truth/expected_survey_issues.csv`
   * Header order must exactly match locked header list.
   * Row order must match deterministic sort.

### Report shape (locked)

Per-pack JSON report (stable shape, v1):

* `pack_id`
* `versions` (index_version, agent_bundle_version, question_set_version)
* `hard_gates`:

  * `schema_validity`
  * `citation_integrity`
  * `failure_journeys`
  * `export_truth_match`
    Each includes: `{ pass: boolean, failures: number, details: [...] }`
* `taxonomy_counts` (from failure taxonomy codes)
* `metrics` (optional, report-only): recall@k, run duration, tokens, etc

Per-pack Markdown summary:

* Header with pack + versions
* Hard-gate table (pass/fail + counts)
* Top failures list (first N details)

Cross-pack summary:

* Table: each pack row with the 4 gate results.

Exit code:

* Non-zero if any pack fails any hard gate (relative to what that pack expects).

### `pack_03_bad_citation` minimal contents (locked)

Minimum directory contents under `docs/08-example-data/pack_03_bad_citation/`:

* `/docs/`

  * the smallest set of PDFs needed to support at least one row reaching citation lock/verify
* `/truth/`

  * `expected_failure_journeys.json` (or equivalent) containing:

    * `question_id`
    * `expected_status="citation_failed"`
    * `expected_failure_code` (e.g., `CITATION_MISMATCH`)
  * expected CSVs (can be minimal or empty, but must exist if export_truth_match is enforced for this pack)
* `/produced/` (Phase 0 harness reads snapshots)

  * `report_rows.json` (must include at least one row with `status="citation_failed"` and provenance reason code)
  * `citations.json` (only if any rows reference citations)
  * `documents.json` (page_count + filenames so citation integrity can validate)
* `/layout/` (optional for evals, but include if your tooling expects it)

---

## Spike 5: Demo controls and reset safety

### Outcome (locked)

* We keep **demo toolbar** (dev-only, feature-flagged) plus the markdown checklist.
* We do **not** add any deletion/reset endpoints in slice 1.
* “Reset” for demos means: **load the pack again** which seeds a **fresh** matter/run.

### Decision: toolbar vs checklist-only

**Toolbar wins** because:

* It removes brittle operator knowledge around “how to seed packs”.
* It enforces allowlisting and guardrails in one place.
* It still keeps demo-mode isolated behind a flag.

Checklist stays, because it enforces the human sequence and sanity checks.

### Reset semantics (slice 1, locked)

* No deletion via HTTP.
* Loading a pack always creates a new folder (matter) with a name prefix (recommended): `DEMO: <pack_id> <timestamp>`
* Pack loader:

  * seeds documents only
  * does **not** auto-start a run by default (operator clicks “Run Quick Start”)

### Guardrails (locked)

* Demo toolbar and pack loader are available only when `DEMO_MODE` is on.
* Pack ID must be allowlisted (`pack_01_clean`, `pack_02_missing_rea`) for slice 1.
* Pack loader must reject any path traversal or free-form filesystem paths (only pack IDs).

---

# Doc patch list

Below is a tight file-by-file patch plan, with exact replacement text blocks.

---

## 1) `docs/04-projects/02-features/0003_demo-grade-outputs/risk-register.md`

### Edits

* Update RH statuses to reflect closed spikes (RH1, RH3, RH5, RH7).
* Record closure decisions in the mitigation column (including ASSUMPTION where used).
* Close the reset safety risk (RH10) by recording “no deletion via HTTP” perimeter.

`docs/04-projects/02-features/0003_demo-grade-outputs/risk-register.md`

```md
# Risk register (rabbit holes)

Use this during shaping to capture tail risks and choose mitigations.

| ID | Rabbit hole | Type | Why it’s risky | Mitigation | Status |
|---|---|---|---|---|---|
| RH1 | Is the CSV export format actually usable for a paralegal paste/import workflow? | product | If the first practitioner reaction is "this is unusable", exports fail as a demo story. | CLOSED (ASSUMPTION): lock CSV schemas v1 (headers + ordering) + deterministic row ordering + citations format. Falsifier: practitioner paste/import test cannot be done in <5 minutes or requests column/order changes. | closed (assumption) |
| RH2 | How do we prevent CSV column ordering drift as schemas evolve? | data | Drift makes exports hard to diff, import, and trust. | CLOSED (decision): lock headers in code; enforce deterministic row ordering; snapshot exports per fixture pack; record `schema_version` in artefact metadata. | closed |
| RH3 | Which Word artefact best supports the demo narrative (memo vs objection/cure letter)? | product | Wrong artefact can make the demo feel contrived or low value. | CLOSED (ASSUMPTION): ship single Word artefact = `memo` with fixed section list + deterministic ordering + inline citation rendering. Falsifier: stakeholder insists on letter format and provides must-have requirements. | closed (assumption) |
| RH4 | Docx formatting inconsistencies across viewers (Word, Google Docs, preview) | technical | "Looks broken" erodes trust immediately. | patch: constrain docx formatting (headings + bullets only), avoid complex tables/footnotes; add viewer sanity check (Word + Google Docs + Preview) as a release gate for memo v1 | open |
| RH5 | Export behaviour when any row is `citation_failed` (block vs partial export) | design | This is a trust posture decision. Getting it wrong undermines the product promise. | CLOSED: default block export (`EXPORT_BLOCKED`) when any row is `citation_failed`. Demo-only `unsafe_override` exists behind strict guardrails and produces clearly labelled UNSAFE artefacts. | closed |
| RH6 | Where do exports live (download-only vs stored artefacts + list)? | dependency | A wrong storage decision creates churn and demo unreliability. | patch: persist artefacts (`storage_key` + metadata); never persist signed URLs; generate fresh `download_url` on demand | open |
| RH7 | Minimal eval metrics: which 3-5 metrics predict demo readiness? | product | Too shallow = false confidence. Too deep = time sink. | CLOSED: hard gates = schema validity, citation integrity, failure journeys, export truth match. Report shape locked (per-pack JSON + MD + cross-pack summary). `pack_03_bad_citation` minimal contents locked. | closed |
| RH8 | Citation integrity checks are expensive/flaky | technical | If the eval harness is brittle, it will be ignored. | patch | open |
| RH9 | CI eval runtime is too slow for iteration | technical | Slow CI creates friction and encourages bypassing tests. | cut | open |
| RH10 | Demo reset tool can delete non-demo data | safety | Data loss is unacceptable even in a PoC. | CLOSED (perimeter): slice 1 has no destructive HTTP reset/delete endpoints. “Reset” = create a fresh demo matter from fixtures. | closed |
| RH11 | Demo mode pollutes the real UX or bypasses trust gates | design | Confuses users and creates hidden behaviour paths. | patch | open |
| RH12 | Fixture packs and `/truth` drift without ownership | dependency | Evals become meaningless if fixtures are not maintained. | patch | open |
| RH13 | Do we have structured export payloads (or are we forced to parse prose)? | dependency | Prose parsing is brittle and contaminates workflow logic; export quality will collapse under real inputs. | patch: require Initiative 002 to persist `export_payload` + `schema_version`; fail closed until present (or cut “tracker-grade” CSVs) | open |

## Notes

- Prefer writing rabbit holes as questions.
- If a rabbit hole is really a product decision, treat it as a shaping question (don’t hide it as “tech risk”).
- Spikes must happen before PRDs are sliced (see `docs/00-strategy/initiatives/prd-slicing-rules.md`).
- Status reflects “decision closure”, not implementation status.
```

---

## 2) `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`

### Edits

* Change status from “planned only” to “locked outcomes recorded”.
* Insert a “Locked outcomes” section containing the decisions and concrete deliverables (CSV schemas, gating, memo sections, eval metrics, demo controls).

`docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`

```md
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

pack_03_bad_citation (locked minimum):
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
  - PASS only if the CSV can be produced from structured `export_payload` (no prose parsing), or we explicitly cut “tracker-grade CSVs” until Initiative 002 provides structure.

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

- Step 0: Confirm Initiative 002 persists structured `export_payload` + `schema_version` for each artefact in a stable location (recommended: `report_rows.provenance_json.export_payload`).
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
```

---

## 3) `docs/04-projects/02-features/0013_csv-export/prd.md`

### Edits

* Update status line to remove “NO-GO until spikes close”.
* Lock CSV schemas v1 and deterministic ordering.
* Lock export gating and unsafe override guardrails + UX copy.
* Remove the now-resolved Open Questions.

#### Replace the Status line

`docs/04-projects/02-features/0013_csv-export/prd.md`

```md
Owner: TBD
Status: DRAFT (GO: spike outcomes locked; remaining dependency is Initiative 002 export_payload persistence)
Date: 2026-02-07
```

#### Insert a new section after “## Goals”

`docs/04-projects/02-features/0013_csv-export/prd.md`

```md
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
- unsafe_override=true is demo-only and requires DEMO_MODE + ALLOW_UNSAFE_EXPORTS; otherwise 403 UNAUTHORISED.
- Unsafe exports must be visibly labelled in filename (e.g. requirements_tracker.UNSAFE.csv) and recorded in artefact metadata_json.
```

#### Replace the “## Non-goals” section

`docs/04-projects/02-features/0013_csv-export/prd.md`

```md
## Non-goals

- Word export (.docx) (handled in 0014).
- Eval harness + CI integration (handled in 0015).
- Demo reset/delete UI (handled in 0016; slice 1 has no deletion via HTTP).
- Excel formatting beyond CSV.
- Any prose-parsing fallback if `export_payload` is missing (exports must fail closed).
```

#### Replace the “## Functional Requirements” section

`docs/04-projects/02-features/0013_csv-export/prd.md`

```md
## Functional Requirements

- FR-001: `POST /export/csv` accepts `{ folder_id, run_id, kind, unsafe_override }` per `docs/03-architecture/50_api_surface.md`.
- FR-002: Supported CSV `kind` values are exactly: `requirements_tracker`, `exceptions_table`, `survey_issues`.
- FR-003: Export only allowed when `runs.state = completed`; otherwise return `409` with `error.code = "CONFLICT"`.
- FR-004: If any row in the run is `citation_failed` and `unsafe_override != true`, export returns non-2xx with `error.code = "EXPORT_BLOCKED"`.
- FR-005: If `unsafe_override = true`:
  - when demo mode is not enabled (or `ALLOW_UNSAFE_EXPORTS` is not enabled), return `403` with `error.code = "UNAUTHORISED"`.
  - when allowed, export must label the artefact as unsafe (filename + metadata_json.unsafe_override=true).
- FR-006: CSV mapper consumes structured `export_payload` (no prose parsing). If `export_payload` is missing, export fails closed with `409 CONFLICT` and a safe message pointing to the Initiative 002 dependency.
- FR-007: CSV headers + ordering are locked (v1 schemas) and drift is prevented by snapshot tests against fixture packs.
- FR-008: Deterministic row ordering is enforced in code (no DB ordering assumptions).
- FR-009: Artefact metadata includes `kind`, `schema_version`, `filename`, `source_run_id`, `created_at`, and `unsafe_override` (when applicable).
- FR-010: `GET /folders/:id/artefacts` returns a list with fresh `download_url` values (do not persist signed URLs).
- FR-011: UI disables export until run completion, shows blocked banner on `EXPORT_BLOCKED`, and renders artefacts list.
- FR-012: Logging exists for export attempt + success/blocked/fail: `folder_id`, `run_id`, `kind`, `artefact_id` (if created), `trace_id`.
- FR-013: CSV rows include `row_status`, citations as `filename:page`, and `citation_ids`.
- FR-014: For `missing_input`, `source_answer` must be exactly `Not found in provided documents.` and citations columns must be empty.
```

#### Replace the “## Open Questions” section

`docs/04-projects/02-features/0013_csv-export/prd.md`

```md
## Open Questions

- None for slice 0013 (spike outcomes locked).
- Dependency remains: Initiative 002 must persist structured `export_payload` + `schema_version` for all three artefacts.
```

---

## 4) `docs/04-projects/02-features/0014_word-export/prd.md`

### Edits

* Update status line.
* Lock memo section list + ordering + citation rendering.
* Align export gating with unsafe override guardrails (demo-only) instead of “reject true”.

#### Replace the Status line

`docs/04-projects/02-features/0014_word-export/prd.md`

```md
Owner: TBD
Status: DRAFT (GO: spike outcomes locked; remaining dependency is Initiative 002 export_payload persistence)
Date: 2026-02-07
```

#### Insert a new section after “## Goals”

`docs/04-projects/02-features/0014_word-export/prd.md`

```md
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
```

#### Replace the “Export gating” bullets in Scope

Find the block under “Export gating” and replace with:

`docs/04-projects/02-features/0014_word-export/prd.md`

```md
- Export gating (per `docs/03-architecture/20_state_model.md`):
  - require `runs.state = completed` (else `409 CONFLICT`)
  - block export if any row is `citation_failed` unless `unsafe_override = true` is provided
  - `unsafe_override = true` is demo-only and requires DEMO_MODE + ALLOW_UNSAFE_EXPORTS; otherwise return `403 UNAUTHORISED`
  - unsafe exports must be visibly labelled (filename `memo.UNSAFE.docx` + metadata_json.unsafe_override=true)
```

#### Replace the “## Open Questions” section

`docs/04-projects/02-features/0014_word-export/prd.md`

```md
## Open Questions

- None for slice 0014 (spike outcomes locked).
- Dependency remains: Initiative 002 must persist structured `export_payload` + `schema_version` (no prose parsing).
```

---

## 5) `docs/04-projects/02-features/0015_eval-harness/prd.md`

### Edits

* Update status line.
* Lock the 4 hard gates and report shape.
* Fix the contradiction in AC-003 (failure packs should pass when they fail in the expected way).
* Specify `pack_03_bad_citation` minimal contents.

#### Replace the Status line

`docs/04-projects/02-features/0015_eval-harness/prd.md`

```md
Owner: TBD
Status: DRAFT (GO: spike outcomes locked; pack_03_bad_citation still needs to be added to the repo)
Date: 2026-02-07
```

#### Replace the “## Goals” section

`docs/04-projects/02-features/0015_eval-harness/prd.md`

```md
## Goals

- `fixture:eval` produces per-pack reports (JSON + Markdown) for:
  - `docs/08-example-data/pack_01_clean`
  - `docs/08-example-data/pack_02_missing_rea`
  - `docs/08-example-data/pack_03_bad_citation` (to be added)
- Hard gates align with `docs/03-architecture/60_observability_and_evals.md` (plus export determinism for Initiative 0003):
  1) schema validity (100%)
  2) citation integrity (100%)
  3) expected failure journeys (must fail in the expected way)
  4) export truth match (CSV outputs match `/truth`)
- Runner exits non-zero when any hard gate fails (relative to the pack’s expected outcomes).
- Failure outputs use the canonical failure taxonomy codes.
```

#### Replace the “## Acceptance Criteria” section

`docs/04-projects/02-features/0015_eval-harness/prd.md`

```md
## Acceptance Criteria

- AC-001: `fixture:eval pack_01_clean` produces per-pack JSON + Markdown reports and a summary table.
- AC-002: `fixture:eval pack_02_missing_rea` produces reports and confirms expected `missing_input` journeys (answer must be exactly `Not found in provided documents.`).
- AC-003: `fixture:eval pack_03_bad_citation` produces reports and confirms the expected `citation_failed` journey (including a safe failure reason code in provenance / report details).
- AC-004: Citation integrity checks validate (at minimum):
  - cited page exists
  - polygons exist
  - `snippet_hash` matches canonical normalization rule
- AC-005: Export truth match validates that generated CSV outputs match `/truth/expected_*.csv` (normalising line endings to LF), including locked header order and deterministic row ordering.
- AC-006: Runner exits non-zero if any hard gate fails for any pack.
- AC-007 (optional CI): CI job runs evals and uploads JSON/MD reports as build artefacts, but does not block merges beyond hard gates until explicitly enabled.
```

#### Replace the “## Scope” pack_03_bad_citation bullet with minimal definition

`docs/04-projects/02-features/0015_eval-harness/prd.md`

```md
- Add fixture pack `pack_03_bad_citation` under `docs/08-example-data/`:
  - minimally:
    - `/docs/` smallest PDF set required for the pack
    - `/truth/expected_failure_journeys.json` identifying at least one `question_id` expected to be `citation_failed`
    - `/truth/expected_*.csv` files as required by export truth match (can be minimal/empty but must exist)
    - `/produced/report_rows.json` containing at least one row with `status="citation_failed"` and a safe failure reason code
    - `/produced/documents.json` with filenames + page_count so citation checks can validate bounds
    - `/produced/citations.json` if any produced rows reference citations
```

---

## 6) `docs/04-projects/02-features/0016_demo-reliability/prd.md`

### Edits

* Update status line.
* Lock “toolbar vs checklist-only” as toolbar + checklist.
* Lock pack loader semantics: seed only, do not auto-start run.
* Lock demo flag mechanism (env var is fine for PoC).

#### Replace the Status line

`docs/04-projects/02-features/0016_demo-reliability/prd.md`

```md
Owner: TBD
Status: DRAFT (GO: spike outcomes locked)
Date: 2026-02-07
```

#### Replace the “## Solution” section

`docs/04-projects/02-features/0016_demo-reliability/prd.md`

```md
## Solution

Add a dev-only demo surface that is isolated and explicit:

- Demo toolbar (dev-only) is controlled by a demo flag (PoC default: env var `DEMO_MODE=1`).
- Pack loading reads fixture packs from `docs/08-example-data/` and seeds the system deterministically.
- Pack loader is allowlisted to known pack IDs only.
- Slice 1 reset semantics: no deletion via HTTP. Running the demo twice means loading the pack again, which creates a fresh matter each time.
- Pack loader seeds documents only by default and does not auto-start runs (operator clicks “Run Quick Start”).
```

#### Replace the “## Open Questions” section

`docs/04-projects/02-features/0016_demo-reliability/prd.md`

```md
## Open Questions

- None for slice 0016 (spike outcomes locked).
```

---

# Sanity check

These are the contradictions / blockers I see that would prevent a clean GO if left unresolved:

1. **Export payload dependency is still unproven**

* The brief is explicit: exports must map from structured `export_payload` and must not parse prose.
* None of the canonical architecture docs actually lock the `export_payload` shape/location (they only recommend a general provenance shape).
* If Initiative 002 does not deliver `report_rows.provenance_json.export_payload` (plus `schema_version`) in time, PRDs 0013/0014 will build “correctly” but exports will fail closed forever.

Smallest fix path:

* Add (or confirm) a thin Initiative 002 slice that persists export_payload for the 3 artefacts, validated by Zod, with stable item ordering keys.

2. **PRD 0015 had a failure-pack wording bug**

* It said `pack_03_bad_citation` “fails the hard gate” for failure journeys.
* Canonical posture is the opposite: failure packs should **pass** when they fail in the expected way.
* Patch above resolves this.

3. **Unsafe override consistency**

* Canonical state model + API surface reserve `unsafe_override`.
* The PRDs previously mixed “no override” with including the field.
* The locked decision above makes it consistent: override exists but is demo-only and strongly guarded and labelled.

4. **Any deletion/reset endpoint in slice 1 remains a hard NO-GO**

* Your brief already states “no deletion via HTTP” for slice 1.
* If any PRD or implementation proposal introduces delete/reset over HTTP without provable guardrails, that’s a GO blocker on safety grounds.

If you apply the patch list above, there’s no remaining “contract ambiguity” on the spikes. The only real remaining blocker to actually shipping exports is the structured export_payload dependency.
