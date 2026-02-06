# Spike investigation - Quick Start Engine (Initiative 002)

This doc captures planned spikes for the rabbit holes in `risk-register.md`.

How to use:
- Each spike has a plan and a small report stub.
- After running a spike: fill in the report stub and update `brief.md`, `breadboard-pack.md`, and `risk-register.md`.
- Do not write PRDs until the spike outcomes remove the biggest rabbit holes (see `brief.md` GO criteria).

Fixture sources:
- Pack list (canonical): `docs/08-example-data/packs_summary.md`
- Truth comparators: `docs/08-example-data/<pack>/truth/*`
- Viewer anchors: `docs/08-example-data/<pack>/layout/*.anchors.json`

---

# SP-2.1 Practitioner question set review

## Question
Does question set v1 (<=25) match how a senior associate wants to consume a "first pass" title + survey report?

## Why now
If question set v1 is wrong, the rest of Initiative 002 can "work" while producing the wrong artefacts.

## Success criteria (proof)
- Practitioner says: "Yes, I'd use this table as a first pass."
- >=80% of questions survive with only wording/order edits.
- Any missing must-haves are either:
  - added by cutting elsewhere to keep <=25, or
  - explicitly pushed to "later" with rationale.

## Timebox
- <= 0.5 day (one pass)

## Approach
1) Start from the union of `golden_questions.json` across packs.
2) Present the output shapes:
  - scalar rows (Schedule A facts, etc.)
  - list-shaped artefacts (B-I/B-II/issues) rendered as tables.
3) Record feedback and apply cuts/reorder/rename (no scope expansion beyond 25).

## Artefacts to keep
- Notes + updated question-set diff.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Cuts/patches:

---

# SP-2.2 Commitment parsing (clean + multi-parcel + scan torture)

## Question
Can we extract Schedule A facts, B-I requirements, and B-II exceptions matching `/truth` key fields across clean + multi-parcel + scan torture packs?

## Packs
- `pack_01_clean`
- `pack_04_multi_parcel`
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
- For `pack_01_clean` and `pack_04_multi_parcel`, key fields match truth CSVs (not wording):
  - `truth/expected_requirements_tracker.csv`
  - `truth/expected_exceptions_table.csv`
- For `pack_07_scans_rotated_low_quality`:
  - either key fields match truth within an explicitly recorded tolerance, or
  - output stays honest as `needs_review` with reason codes (no hallucinated items).

## Timebox
- <= 1 day

## Approach
1) Use truth CSVs as comparator (diffs, not eyeballing).
2) Record failures precisely: missing headers, item numbering drift, date formats, instrument ref extraction.
3) Decide treatment: Patch heuristics vs Cut formats vs Out-of-bounds.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Parsing heuristics:
- Cuts/patches:

---

# SP-2.3 Exception -> instrument matching + missing doc/attachment handling

## Question
Can we avoid false matches, surface ambiguity, and handle missing docs/attachments explicitly?

## Packs
- `pack_01_clean` (happy path matches)
- `pack_02_missing_rea` (missing exception doc)
- `pack_06_overlapping_easements` (disambiguation + missing attachment)
- `pack_08_defined_terms_and_cross_refs` (defined terms + exhibit chase)

## Success criteria (proof)
- No false matches on the above packs.
- Ambiguity surfaces as `needs_review` and requires user selection (never silent auto-pick).
- Missing exception doc:
  - produces an explicit missing-doc checklist in row notes/provenance, and
  - uses `missing_input` when an answer truly cannot be supported.
- Missing attachment:
  - detected and flagged (no fabricated summaries).

## Timebox
- <= 1 day

## Approach
1) Start with deterministic matching (instrument number, book/page, filename).
2) Add bounded reference following for exhibit chase (max depth; record the chain).
3) Catalog ambiguous cases and the minimal UI affordance to resolve them.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Matching rules:
- Ambiguity UX notes:

---

# SP-2.4 Survey extraction (certification + baseline callouts)

## Question
Can we reliably extract certification parties and baseline text callouts with citations on scan packs?

## Packs
- `pack_01_clean`
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
- Matches `truth/expected_survey_issues.csv` on major callouts where present (not wording).
- Flags the missing lender certification party in `pack_03_mismatch_and_cert_gap`.
- On scan torture:
  - either extracts >=3 callouts with citations, or
  - stays honest as `needs_review` + guidance (no made-up callouts).

## Timebox
- <= 1 day

## Approach
1) Focus on text callouts and certification blocks first; ignore pure graphics.
2) Compare against truth and `golden_questions.json`.
3) Decide extraction quality threshold behavior (ready vs needs_review).

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Threshold decisions:
- Cuts/patches:

---

# SP-2.5 Reconciliation honesty (unknown bias)

## Question
Can we keep reconciliation honest by biasing to "unknown/needs_review" instead of incorrect "not depicted"?

## Packs
- `pack_01_clean`
- `pack_03_mismatch_and_cert_gap`
- `pack_07_scans_rotated_low_quality`

## Success criteria (proof)
- When evidence is weak, item classification is `unknown` (item-level) and report row stays `needs_review`.
- Drawer guidance copy explains what evidence is missing and what to do next.

## Timebox
- <= 0.5 day

## Approach
1) Define explicit evidence thresholds for depicted/not depicted/unknown.
2) Prove thresholds on scan torture.
3) If we cannot keep it honest, cut reconciliation to "unknown only" in v1.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Threshold decisions:
- Cuts/patches:

---

# SP-2.6 Run idempotency + snippet_hash stability

## Question
On restart/retry, do we avoid duplicate rows and keep stable citation `snippet_hash` values (same `index_version`)?

## Success criteria (proof)
- Unique `(run_id, question_id)` holds and no duplicates appear after restart.
- Citation locking produces stable `snippet_hash` values across reruns (same inputs + pinned versions).
- Failure taxonomy counts are stable across reruns (no new "mystery failures").

## Timebox
- <= 0.5 day

## Approach
1) Run `pack_01_clean` twice with pinned versions.
2) Compare row payloads + citation hashes + eval reports.
3) Identify nondeterminism sources and patch with deterministic idempotency keys.

## Oracle notes
- Pending.

## Report (fill after running)
- Outcome:
- Proof links:
- Idempotency keys:

---

# SP-2.7 Payload representation decision (rows vs tables)

## Question
Where do we store and version the structured payload for list-shaped artefacts (B-I/B-II/issues) so UI can render it and evals can compare it?

Constraints:
- Must obey the report-row status invariants in `docs/03-architecture/20_state_model.md`.
- Citations must be lockable/immutable and attached to rows (and ideally to item-level entries).

## Options to decide between
1) Store structured payload in `report_rows.provenance_json` and render from it in UI.
2) Store structured payload as JSON in `report_rows.answer` (string) and treat `answer` as machine-readable.
3) Introduce first-class artefact tables and keep report rows as summaries.

## Success criteria (proof)
- Can represent `truth/expected_requirements_tracker.csv` and `truth/expected_exceptions_table.csv` faithfully:
  - item fields
  - item-level citations
  - item-level status (without inventing new report-row statuses)
- Does not weaken fail-closed verification or citation locking.

## Timebox
- <= 0.5 day

## Report (fill after running)
- Decision:
- Why:
- Follow-up schema/UX implications:

