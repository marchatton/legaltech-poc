## 1) Top 10 issues, gaps, inconsistencies (path + exact edit)

### 1) Pack naming drift (breaks the “packs_summary is canonical” rule)

**File:** `docs/00-strategy/initiatives/002-quick-start-engine.md`

**Problem:** This doc references non-existent packs (`pack_04_multi_parcel_complex`, `pack_06_noisy_scans_rotated_page`, `pack_05_duplicate_instrument_exhibit_missing`). That will cause silent confusion and wasted time as soon as anyone tries to run spikes/evals.

**Edit to make (specific replacements):**

* In **2.2 Done means**, replace:

  * `pack_04_multi_parcel_complex` → `pack_04_multi_parcel`
* In **2.2 Suggested spikes**, replace:

  * `pack_06_noisy_scans_rotated_page` → `pack_07_scans_rotated_low_quality`
* In **2.3 Done means**, replace the entire bullet:

  * Current: “`pack_05_duplicate_instrument_exhibit_missing` shows ambiguity handling … missing exhibit flagged.”
  * Replace with: “`pack_06_overlapping_easements` shows ambiguity handling (similar exceptions + disambiguation) and missing Exhibit B attachment flagged.”
* In **2.4 Suggested spikes**, replace:

  * `pack_06_noisy_scans_rotated_page` → `pack_07_scans_rotated_low_quality`
* In **2.5 Done means**, remove the line referencing `pack_05_duplicate_instrument_exhibit_missing` and replace with:

  * “`pack_03_mismatch_and_cert_gap` flags survey certification omission (missing lender) and survey vs record mismatch.”
  * And if you still want a “survey plotting incomplete” case, explicitly mark it as **not covered by current packs** (do not invent a pack).

---

### 2) Row schema in strategy doc violates ADR-0001 and the state-model invariants

**File:** `docs/00-strategy/initiatives/002-quick-start-engine.md`

**Problem:** In 2.1 it says:
`{question_id, question, answer, citations[], status, confidence?, docs_searched[]}`
That clashes with:

* ADR-0001: citations are locked records and rows refer by `citation_id` only
* `docs/03-architecture/20_state_model.md`: `needs_review|reviewed` rows must have >=1 locked citation; `missing_input` rows must have *no citations* and exact answer string

**Edit to make (replace the schema snippet in 2.1 Done means):**
Replace the schema line with:

> Schema is stable (v1):
> `{ question_id, question, answer, citation_ids: string[], status, notes?, payload_json?, payload_schema_version?, provenance_json }`
>
> * `citation_ids` are locked `citations.id` values (never free-text).
> * `docs_searched` lives under `provenance_json.retrieval.docs_searched`.
> * No `confidence` field in v1 (UX can show “needs_review reasons” from provenance instead).

(If you don’t want `payload_json` yet, at least fix `citations[]` → `citation_ids[]` and move `docs_searched` into provenance.)

---

### 3) The DB model is missing `question_set_version`, but the state model depends on it

**File:** `docs/03-architecture/30_data_model.md`

**Problem:** `docs/03-architecture/20_state_model.md` defines run invariants “for the question set version used by the run…”. But `runs` table schema has no `question_set_version`. That’s a real mismatch, not a wording nit.

**Edit to make (add field under `runs`):**
In the `runs` table section, add:

* `question_set_version` (string; pins the exact question set used by the run)

Optionally add (if you want to be explicit):

* `question_set_id` (string; e.g. `quick_start_title_survey_v1`)

---

### 4) Breadboard orchestration pins versions, but misses the question set version pin

**File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`

**Problem:** Breadboard 2.6 says Runs API pins `index_version` + `agent_bundle_version`, but not `question_set_version`. That’s the one you will absolutely want when you compare runs, rerun, and do fixture evals.

**Edit to make (Breadboard 2.6, Code affordances N1):**
Change:

* “Pins `index_version` + `agent_bundle_version`.”

to:

* “Pins `index_version` + `agent_bundle_version` + `question_set_version`.”

Also update **Breadboard 2.1 UI affordance U1** to explicitly read from `runs.question_set_version` (not a registry default that can drift).

---

### 5) Brief incorrectly uses `needs_review` as an ambiguity/matching state

**File:** `docs/04-projects/02-features/0002_quick-start-engine/brief.md`

**Problem:** In “Perimeter (in/out)”, it says:

* “Exception -> instrument matching with ambiguity surfaced as `needs_review` (never silent).”

That reads like you’re proposing to use report-row statuses as item-level match states. This will lead to someone accidentally inventing new row statuses or misusing them.

**Edit to make (rewrite that bullet):**
Replace that line with:

* “Exception → instrument matching: ambiguity is surfaced at **item-level** as `match_status: ambiguous` with candidate docs listed (never silent). The **report row** remains one of `needs_review|reviewed|missing_input|citation_failed`.”

---

### 6) `seedCitationsFromHeaderAnchors()` is a footgun for fail-closed verification

**File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`

**Problem:** In Breadboard 2.2, N4 proposes seeding citations from headers “even if item-level citation is weak”. That’s how you end up with citations that do not entail the item claim and you create `citation_failed` storms.

**Edit to make (Breadboard 2.2 Code affordances N4):**
Replace:

* `seedCitationsFromHeaderAnchors()` … “cite section headers even if item-level citation is weak.”

with:

* `seedSectionCitations()` … “Allowed only to support **section existence** (eg ‘Schedule B-II’) and never used as the sole evidence for item content. Item-level fields must cite item-local text. If item-local evidence can’t be locked, mark the item as `unknown` (or `missing_doc`) rather than citing headers.”

---

### 7) Ambiguity “choose correct doc” implies post-run edits without re-verification (not defined anywhere)

**File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`

**Problem:** Breadboard 2.3 says the user can “choose correct doc” when ambiguous and selection is persisted. But:

* report rows are terminal for the workflow
* user-driven transition is only `needs_review → reviewed`
* citations are immutable and verification is fail-closed
  So if a user selection changes the answer/citations, what re-verifies it? Where does it live in run semantics?

**Edit to make (Breadboard 2.3 Places/affordances + Parts list):**
Pick one (I’d strongly prefer option A for PoC clarity):

**Option A (Cut for v1):**
Change “choose correct doc” to “view candidates” and defer selection to later.

* Replace: “and ‘choose correct doc’ when ambiguous”
  With: “shows candidates when ambiguous (resolution is out of scope for v1; row stays `needs_review` with clear guidance).”

**Option B (Spike + defined mechanism):**
If you keep selection, add explicit mechanism text:

* “User selection creates a **new run** of type `quick_start_repair` for that `question_id` (or re-runs a single row via WDK) and writes a new verified row with new locked citations. We do not mutate existing citations.”

Either way, don’t leave it implied.

---

### 8) Output definition is fuzzy: “3 artefacts” vs “<=25 question set rows”

**File:** `docs/04-projects/02-features/0002_quick-start-engine/brief.md`

**Problem:** The initiative headline and “What we are building” says 3 artefacts. Breadboard 2.1 talks about a <=25 question set including scalar rows plus list-shaped rows. Strategy doc also leans into 20–25 questions. Right now, it’s ambiguous what shows up in the report table.

**Edit to make (Brief “What we are building (PoC scope)”):**
Replace the opening sentence with something explicit, for example:

* “A fixed question set v1 (<=25 rows) where **three rows are list-shaped artefacts** (B‑I tracker, B‑II table, reconciliation issues). Any additional scalar rows must be justified and stay within the <=25 cap.”

Or, if you want the UI to only show 3:

* “This run produces **exactly three report rows**, each row is a table-shaped artefact payload.”

Pick one and commit. Don’t leave it as “3 but also 25”.

---

### 9) Initiative overview doc has duplicated content

**File:** `docs/00-strategy/initiatives/initiative-overview-001-002-003.md`

**Problem:** The whole header + assumptions + initiative map appears twice. That’s the kind of doc drift that later becomes “which copy is correct”.

**Edit to make (surgical):**
Delete the first duplicate block so the doc has a single:

* “Initiative map…”
* “Assumptions…”
* “Initiatives…”

(Keep one copy, not both.)

---

### 10) Risk register treatment for missing attachments is inconsistent with spikes and breadboard

**File:** `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`

**Problem:** RH-2.8 is marked **Patch**, but Breadboard 2.3 includes missing-attachment detection as core behaviour, and SP-2.3 success criteria explicitly depends on it. You are already treating it like a Spike-worthy uncertainty.

**Edit to make (RH-2.8 row):**
Change:

* Treatment: `Patch`
* Next step: “Add missing-attachment detector + UX copy”

to one of:

* **Option A:** Treatment `Spike`, Next step `SP-2.3b missing-attachment detection on pack_06_overlapping_easements`
* **Option B:** Keep Treatment `Patch` but change Next step to:
  “Implement detector and validate inside SP-2.3 (pack_06_overlapping_easements). Close RH-2.8 only if spike report shows no fabricated summaries.”

Right now it’s neither fish nor fowl.

---

## 2) Missing rabbit holes, or better Cut/Patch/Spike treatments

These are the ones that will bite later if you don’t name them now.

### RH-2.11 Human-in-the-loop edits without breaking trust invariants

**Risk:** If users can resolve ambiguity, how do we re-run verification and keep citations immutable?
**Treatment:** Spike (design + minimal prototype)
**Why:** It touches run semantics, row immutability expectations, verification, and UX all at once.

### RH-2.12 Verification semantics for list-shaped rows

**Risk:** For a list payload, what counts as a “material claim” and what’s the unit of verification? If one item fails, does the whole row become `citation_failed`?
**Treatment:** Spike
**Likely mitigation:** verification step is allowed to *downgrade* unsupported items to `unknown` (or remove them) to keep the row verifiable rather than failing the whole row.

### RH-2.13 Run start gating vs folder state (`indexed` vs `ready`)

**Risk:** Scan packs may never be `ready` if the extraction-quality threshold is strict, but architecture explicitly says `indexed` is runnable. If the UI blocks runs until `ready`, you can’t even test scan torture behaviour.
**Treatment:** Patch (explicit gating rule + UX copy), validated by a small spike.

### RH-2.14 Truth comparator normalisation rules

**Risk:** Spikes say “match truth key fields (not wording)” but there is no declared normalisation contract (date formats, instrument ref parsing, item numbering). Without this, spikes will devolve into arguing about diffs.
**Treatment:** Patch (write comparator spec + implement normalisers), then use in spikes.

### RH-2.15 Retrieval recall baseline for golden questions

**Risk:** You can have perfect parsing logic and still fail because retrieval doesn’t find the right chunk reliably.
**Treatment:** Spike (Recall@K sanity on a tiny subset)

---

## 3) Spike plan edits (tighter success criteria, smallest pack set, add missing spikes)

I’d restructure spikes to isolate failure modes. You can still keep the same doc, just add sub-spikes.

### SP-2.1 Practitioner question set review (keep, but tighten outputs)

**Smallest pack set:** none (this is product review)

**Edits:**

* Add a concrete deliverable:

  * Create a shaping artefact file: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json` (or `.md` if you prefer) containing:

    * `question_set_version`
    * stable `question_id`s
    * mapping of question → output type (`scalar` or `list`)
* Tighten success criteria:

  * “<=25 questions, with no more than **3 list-shaped** (the artefacts).”
  * “Practitioner agrees the 3 artefact tables cover the first-pass need. Any extra scalar rows must justify why they aren’t just derived views of the artefacts.”

---

### SP-2.2 Commitment parsing (split to smallest meaningful packs)

#### SP-2.2a Commitment parsing baseline

**Packs:** `pack_01_clean` only

**Tightened success criteria:**

* Requirements tracker: key fields match `truth/expected_requirements_tracker.csv` with:

  * exact item count match
  * exact match on item numbers and any instrument refs present in truth
* Exceptions table: key fields match `truth/expected_exceptions_table.csv` with:

  * exact item count match
  * instrument references normalised to a canonical form (you define it once)

#### SP-2.2b Multi-parcel parsing behaviour

**Packs:** `pack_04_multi_parcel` only

**Tightened success criteria:**

* Output includes a parcel scoping field per relevant item (even if it’s `unknown`), and **never** silently assigns an easement to “all parcels” unless the evidence says so.
* Any parcel assignment must cite item-local text (not headers).

#### SP-2.2c Scan torture honesty behaviour

**Packs:** `pack_07_scans_rotated_low_quality` only

**Tightened success criteria:**

* No hallucinated items:

  * If the parser cannot lock item-local citations, it must not emit confident structured fields. It emits items as `unknown` with reason codes, or it keeps the whole row `needs_review` with explicit “low extraction quality” guidance.
* Declare the threshold rule in the spike:

  * If `extraction_quality < X`, row must include provenance reason `LOW_EXTRACTION_QUALITY` and skip any “not found” style negatives.

(Also: remove any “±1 item count” hand-waving. If you want tolerance, define it exactly and why.)

---

### SP-2.3 Exception → instrument matching (split)

#### SP-2.3a Matching baseline + missing exception doc

**Packs:** `pack_01_clean`, `pack_02_missing_rea`

**Tightened success criteria:**

* `pack_01_clean`: every exception item with an instrument ref either:

  * is `match_status: matched` and cites evidence for the match (recording reference or instrument no), or
  * is `match_status: ambiguous` with candidates listed (no auto-pick)
* `pack_02_missing_rea`: the specific missing doc `REA.pdf` is surfaced as:

  * item-level `match_status: doc_missing`
  * missing-doc checklist includes the exact filename `REA.pdf`
  * the row is **not** forced to `missing_input` unless the entire artefact can’t be supported

#### SP-2.3b Disambiguation + missing attachment

**Packs:** `pack_06_overlapping_easements`

**Tightened success criteria:**

* At least one ambiguous case is surfaced with >1 candidate, never auto-picked.
* Missing attachment is detected and flagged:

  * `missing_attachment: true`
  * references `Utility_Easement_10ft_ExhibitB.pdf` (exact string from `packs_summary.md`)
* Summary extraction must not fabricate exhibit content (if exhibit missing, summary must explicitly say it’s missing and cite the reference to the exhibit).

#### SP-2.3c Defined terms / exhibit chase boundedness

**Packs:** `pack_08_defined_terms_and_cross_refs`

**Tightened success criteria:**

* Reference following is bounded and recorded:

  * `reference_chain` captured in provenance with max depth (eg 2)
* If chase fails, item becomes `unknown` with reason `REFERENCE_CHAIN_BROKE` and no made-up definition.

---

### SP-2.4 Survey extraction (split)

#### SP-2.4a Baseline + cert gap

**Packs:** `pack_01_clean`, `pack_03_mismatch_and_cert_gap`

**Tightened success criteria:**

* Certification extraction outputs:

  * parties present (borrower, lender if present), surveyor, date if present
  * each party is backed by lockable citations
* `pack_03_mismatch_and_cert_gap`: missing lender is flagged as a specific machine-readable issue code (eg `CERT_MISSING_LENDER`) with citation to the certification block.

#### SP-2.4b Scan torture behaviour

**Packs:** `pack_07_scans_rotated_low_quality`

**Tightened success criteria:**

* If callouts are emitted, each has citations.
* If callouts cannot be supported, the row stays `needs_review` with reason `LOW_EXTRACTION_QUALITY` and guidance. No “invented callouts”.

---

### SP-2.5 Reconciliation honesty (recommend a deliberate cut unless proven)

**Smallest packs:** `pack_03_mismatch_and_cert_gap`, `pack_07_scans_rotated_low_quality`

**Edits:**

* Tighten rule:

  * **Never emit `not_depicted` in v1 unless you have explicit negative evidence on the survey** (and cite it).
* If you can’t meet that, make an explicit v1 cut:

  * v1 classifications are only `depicted | unknown`
  * `not_depicted` is out of scope until a later spike proves it’s safe.

This is one of those cases where cutting is the honest move.

---

### SP-2.6 Run idempotency + snippet_hash stability (tighten comparisons)

**Packs:** `pack_01_clean` only (keep)

**Edits:**

* Define exact comparison fields:

  * Ignore `updated_at` and other timestamps.
  * Compare:

    * `report_rows.answer` (or payload JSON canonical form)
    * `report_rows.status`
    * sorted `citation_ids`
    * each citation’s `snippet_hash`, `page_number`, `polygons` count
* Add a negative test:

  * Intentionally tamper one locked citation snippet (fixture or test hook) and prove row becomes `citation_failed` with reason `CITATION_MISMATCH`.

---

### SP-2.7 Payload representation decision (tighten and anchor)

**Smallest packs:** `pack_01_clean` (B‑I/B‑II truth) + `pack_03_mismatch_and_cert_gap` (issues truth)

**Edits:**

* Add explicit requirement:

  * “UI rendering uses this payload, eval comparator uses this payload, and provenance remains debug-only.”
* I’d add a missing option that is likely the cleanest:

  * **Option 4:** add `report_rows.payload_json` (JSONB) + `payload_schema_version` columns, keep `answer` as a human summary string.
  * This keeps provenance from becoming a product contract, and makes evals sane.

---

### Add missing spikes (these are the real gaps)

#### SP-2.8 Human-in-the-loop disambiguation without breaking trust invariants

**Packs:** `pack_06_overlapping_easements`

**Question:** When a user resolves ambiguity, do we re-run verification and keep citations immutable?
**Success criteria:**

* User action does not mutate existing citations.
* Result is a newly verified row (new citations) or a new run, with pinned versions recorded.
* Status invariants remain intact.

#### SP-2.9 Verification semantics for list-shaped rows

**Packs:** `pack_01_clean`

**Question:** What’s the smallest safe rule for verifying a list payload?
**Success criteria:**

* Unsupported items are downgraded to `unknown` (or removed) rather than causing silent passes.
* Row does not become `citation_failed` unless verification truly can’t make the row safe.

#### SP-2.10 Run gating vs folder state (`indexed` runnable)

**Packs:** `pack_07_scans_rotated_low_quality`

**Question:** Can we run Quick Start on `indexed` folders even if `ready` health checks fail, with sane UX?
**Success criteria:**

* Run start is allowed for `folders.state in {indexed, ready}`.
* UI shows explicit warning when health checks fail, but does not block.
* Behaviour matches architecture state model.

---

## 4) Concrete GO/NO-GO checklist before starting PRDs

If you can tick all of these, you’re ready to PRD. If not, don’t PRD yet because the PRDs will bake in guesses.

### Canonical inputs and naming

* [ ] A repo-wide grep shows only canonical pack names from `docs/08-example-data/packs_summary.md` (no phantom packs).
* [ ] `docs/00-strategy/initiatives/002-quick-start-engine.md` is updated to match canonical packs and scenarios.

### Contracts locked (so PRDs don’t churn)

* [ ] Row contract explicitly uses `citation_ids` (locked citations) and does not use free-text citations anywhere user-facing.
* [ ] `runs` schema is updated in docs to include `question_set_version` (and breadboards reflect that).
* [ ] Clear decision recorded for list payload storage (and schema versioning), including how UI renders and how evals compare it.
* [ ] Item-level states are clearly separated from report-row statuses (no reuse of `needs_review` or `missing_input` as item states).

### Trust spine behaviour is specified, not implied

* [ ] Verification semantics for list payloads are defined (what gets verified, what happens on partial failure).
* [ ] Missing-doc and missing-attachment behaviours are specified with exact strings and where they live (row vs item vs notes vs provenance).
* [ ] A reason-code taxonomy exists for `citation_failed` and “needs_review reasons” (even if small).

### Spike outcomes exist and are written up (not “pending”)

* [ ] SP-2.1 is complete with a committed `question_set_v1` artefact (<=25, stable IDs) and practitioner notes.
* [ ] Parsing spikes cover: baseline (`pack_01_clean`), multi-parcel (`pack_04_multi_parcel`), scan torture honesty (`pack_07_scans_rotated_low_quality`).
* [ ] Matching spikes cover: baseline + missing doc (`pack_01_clean`, `pack_02_missing_rea`), overlapping + missing attachment (`pack_06_overlapping_easements`), bounded cross refs (`pack_08_defined_terms_and_cross_refs`).
* [ ] Survey spikes cover: baseline + cert gap (`pack_01_clean`, `pack_03_mismatch_and_cert_gap`) and scan torture (`pack_07_scans_rotated_low_quality`).
* [ ] Reconciliation spike produces a safe v1 policy (either proven `not_depicted` rules or explicit cut to `depicted|unknown`).
* [ ] Idempotency spike proves stable `snippet_hash` and no duplicate `(run_id, question_id)` rows on rerun.
* [ ] All spike report stubs are filled with proof links and the risk register is updated (open/closed reflects reality).

### Run semantics and WDK boundaries

* [ ] The workflow/step boundary rules are explicitly reflected in the breadboard for any human-in-the-loop flows (no “and then user chooses” handwave).
* [ ] A decision exists for how “user choice” affects runs (new run vs re-run a row) without mutating immutable citations.

That’s the point where PRDs will be execution docs rather than discovery docs.
