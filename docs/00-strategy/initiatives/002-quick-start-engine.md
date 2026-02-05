# Initiative 2: Quick Start engine (Title + Survey → 3 artefacts)

## 2.1 Question set v1 + report schema freeze (what rows exist, what columns exist)
**Scope**  
Define the PoC question set and row schema so engineering can build deterministic pipelines without scope creep.

**Done means**  
- Question set v1 (20–25 max) exists with IDs and expected outputs mapping to:
  - B-I requirements extraction
  - B-II exceptions table
  - Survey issues list
- Schema is stable: `{question_id, question, answer, citations[], status, confidence?, docs_searched[]}`

**Cut-lines / de-scopes**  
- No “research agent” web browsing.  
- No auto strategy decisions (cure vs endorse vs accept). Only prompts / flags.

**Risks/unknowns and treatment**  
- Question set too broad becomes untestable: **Cut** (cap to 25).  
- Misaligned with real lawyer expectations: **Spike** (1 practitioner review).

**Suggested spikes**  
- “Do these 25 questions match how a senior associate reads a commitment?” Pass if practitioner says “yes, I’d use this table”.

**Natural PRD seams**  
1) PRD: Question set JSON + versioning  
2) PRD: Report row schema + migrations  
3) PRD: UI table columns + row drawer layout

---

## 2.2 Commitment parsing (Schedule A / B-I / B-II extraction)
**Scope**  
Extract Schedule A facts and generate Requirements + Exceptions indices from commitment PDFs.

**Done means**  
- For `pack_01_clean` and `pack_04_multi_parcel_complex`, parser outputs:
  - Requirements list with item numbers
  - Exceptions list with item numbers + recording refs where present
- Output matches `/truth/expected_requirements_tracker.csv` and `/truth/expected_exceptions_table.csv` at least on key fields (not wording).

**Cut-lines / de-scopes**  
- Not solving every title company formatting variant. PoC aims at “good enough for these packs” with a clear “parser uncertainty” flag.

**Risks/unknowns and treatment**  
- Formatting variability across commitments: **Spike** (pattern robustness).  
- Scanned commitments: **Patch** (OCR everything assumption helps).

**Suggested spikes**  
- “Can we parse B-I/B-II reliably from scanned PDFs?” Pass if `pack_06_noisy_scans_rotated_page` yields the right item counts within ±1.

**Natural PRD seams**  
1) PRD: Commitment doc-type classifier + parser routing  
2) PRD: B-I extraction logic (items, requirement text, owner placeholder)  
3) PRD: B-II extraction logic (items, instrument refs, doc request list)  
4) PRD: ‘Parser confidence’ UI and override notes

---

## 2.3 Exception instruments matching + per-instrument summary extraction
**Scope**  
Link each exception item to the correct instrument PDF and extract a short summary + risk tags, with citations.

**Done means**  
- `pack_01_clean` exceptions link to their correct PDFs (by instrument number).  
- `pack_05_duplicate_instrument_exhibit_missing` shows ambiguity handling (duplicate instrument number flagged; missing exhibit flagged).  
- For each exception summary row, citations point to the instrument clause location.

**Cut-lines / de-scopes**  
- No deep semantic understanding of easement scope. Keep summaries short and evidence-backed.  
- No auto “materiality”.

**Risks/unknowns and treatment**  
- Exception → instrument matching fails silently: **Spike** (matching heuristics).  
- Missing exhibits inside a provided PDF: **Patch** (flag and continue).

**Suggested spikes**  
- “What matching rules minimise false matches?” Pass if no false matches across 8 packs, and ambiguous cases surface as “needs_review”.

**Natural PRD seams**  
1) PRD: Instrument matching service (instrument number, book/page heuristics)  
2) PRD: Exception summary extractor (structured JSON + citations)  
3) PRD: Risk tagging rubric (access/use/parking/utility/monetary/boundary)  
4) PRD: Ambiguity UI (multiple matches) + user selection

---

## 2.4 Survey parsing (certification, key callouts, encroachments, access) with citations
**Scope**  
Extract survey facts needed for reconciliation: certification parties, labelled easements, access callouts, encroachments, legal description notes.

**Done means**  
- `pack_01_clean` yields a non-empty survey extract that matches `/truth/expected_survey_issues.csv` on major callouts.  
- `pack_03_mismatch_and_cert_gap` flags missing certification party and legal desc mismatch.  
- Works on scanned survey too (since OCR everything).

**Cut-lines / de-scopes**  
- Not interpreting graphics perfectly. We focus on text callouts and obvious labels first.  
- No property visualiser.

**Risks/unknowns and treatment**  
- Surveys are heavily visual and OCR can be messy: **Spike** (can we get sufficient signal).  
- Rotated scanned page: **Patch** (auto-rotate or tolerate with weaker extraction).

**Suggested spikes**  
- “Can we extract certification parties and at least 3 callouts reliably?” Pass if extracted on `pack_06_noisy_scans_rotated_page` and `pack_01_clean`.

**Natural PRD seams**  
1) PRD: Survey doc-type classifier + extraction routing  
2) PRD: Certification extraction (parties, surveyor, date)  
3) PRD: Callout extraction (encroachment/easement/access strings + citations)  
4) PRD: Survey extraction quality indicator + ‘needs manual review’ flag

---

## 2.5 Title ↔ survey reconciliation (easements shown/not shown, access, mismatch flags)
**Scope**  
Cross-check commitment exceptions against survey depiction and produce a survey reconciliation issues list.

**Done means**  
- `pack_01_clean` shows “easements depicted” vs “not depicted” for a subset, consistent with truth.  
- `pack_05_duplicate_instrument_exhibit_missing` flags “survey notes incomplete plotting”.  
- Issues list includes citations to both (instrument clause + survey callout) where possible.

**Cut-lines / de-scopes**  
- Not doing precise geometry overlays of easement corridors. Just evidence-backed flags and links.

**Risks/unknowns and treatment**  
- False positives (saying something is not shown when it is): **Spike** (calibrate).  
- Over-reliance on text callouts misses visual-only survey labels: **Patch** (allow “unknown”).

**Suggested spikes**  
- “Can we keep reconciliation honest?” Pass if we can produce an ‘unknown’ state rather than incorrect ‘not shown’ when uncertain.

**Natural PRD seams**  
1) PRD: Reconciliation rules engine (exception types → what to check on survey)  
2) PRD: Issues list generator (structured, citation-backed)  
3) PRD: UI for reconciliation issues (filtering, status, notes)  
4) PRD: ‘Unknown’ handling and guidance copy

---

## 2.6 Run orchestration and incremental report population (step machine)
**Scope**  
Implement the Quick Start run worker that executes the pipeline deterministically and writes rows incrementally with step progress.

**Done means**  
- User clicks “Quick Start: Title & Survey” and sees steps: selecting questions → searching docs → drafting answers → verifying citations.  
- Rows appear progressively and have correct statuses.  
- Run completes on `pack_01_clean` and surfaces failures on `pack_02_missing_rea` without crashing.

**Cut-lines / de-scopes**  
- No freeform chat.  
- No long-running agent loops. This is fixed question set with fixed steps.

**Risks/unknowns and treatment**  
- Spaghetti orchestration: **Cut** (force explicit step machine).  
- Retry/idempotency issues: **Patch** (idempotent writes by question_id).

**Suggested spikes**  
- “Can we make runs idempotent?” Pass if restarting a run doesn’t duplicate rows and doesn’t change stable snippet hashes.

**Natural PRD seams**  
1) PRD: Runs API + run state model (created/running/partial/completed/failed)  
2) PRD: Worker job runner + step model  
3) PRD: Incremental UI updates (polling or server-sent events)  
4) PRD: Row upsert behaviour + provenance stamping
