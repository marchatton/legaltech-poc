## 1) Top 10 issues, gaps, inconsistencies (path + specific edit)

1. **Pack name drift (breaks the “packs_summary is canonical” constraint)**
   **File:** `docs/00-strategy/initiatives/002-quick-start-engine.md` (see `docs/08-example-data/packs_summary.md`)
   **Edit:** Replace non-canonical pack names everywhere:

   * Replace `pack_04_multi_parcel_complex` → `pack_04_multi_parcel`
   * Replace `pack_06_noisy_scans_rotated_page` → `pack_07_scans_rotated_low_quality`
   * Replace `pack_05_duplicate_instrument_exhibit_missing` → **remove** (does not exist) and instead reference:

     * missing attachment scenario: `pack_06_overlapping_easements`
     * partial release scenario: `pack_05_partial_release`
       This doc is currently contradicting the fixture source of truth. (`docs/08-example-data/packs_summary.md`)

2. **Row schema language is inconsistent with “citation IDs + locking”**
   **File:** `docs/00-strategy/initiatives/002-quick-start-engine.md`
   **Edit:** In section **2.1 Done means**, change:

   * `citations[]` → `citation_ids[]` (locked IDs, not free text)
   * Move `docs_searched[]` into provenance, not row schema (it belongs in `report_rows.provenance_json`).
     Suggested replacement line:
   * From: `Schema is stable: {question_id, question, answer, citations[], status, confidence?, docs_searched[]}`
   * To: `Schema is stable (API shape): {question_id, question, answer, citation_ids[], status, notes?} and provenance_json includes {docs_searched, retrieved_chunk_ids, scores, verification_reason_codes}.`
     This aligns with ADR-0001 and the report row invariants. (`docs/03-architecture/decisions.md`, `docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`)

3. **Run invariants mention “question set version used by the run”, but data model does not store it**
   **File:** `docs/03-architecture/30_data_model.md` (compare with `docs/03-architecture/20_state_model.md`)
   **Edit:** Under `runs`, add a pinned field:

   * Add bullet: `question_set_version` (string; pins the question set used by the run)
     And in `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` section 2.6, update the Runs API note to say it pins `question_set_version` too.
     This is required to enforce the “completed run” invariant. (`docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`)

4. **Global wiring diagram implies the UI polls Postgres directly**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
   **Edit:** In the Mermaid diagram, replace `UI -. poll/SSE .-> PG` with explicit API reads:

   * Add `Runs API` read endpoints: `GET /runs/:id` and/or `GET /runs/:id/rows` and optionally `GET /runs/:id/events` (SSE).
     And route UI reads through API, not DB. This keeps the wiring consistent with the stated “Next.js route handler” model and the explicit error envelope posture. (`docs/03-architecture/decisions.md` ADR-0008, plus the diagram itself)

5. **“Unknown -> needs_review” is currently unsafe without an explicit citation rule**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (sections 2.2, 2.3, 2.4)
   **Edit:** Add a small decision table near the first mention of `needs_review` that makes the invariant explicit:

   * **Only** write `needs_review` if at least one citation can be locked and verification passes.
   * If you cannot lock a citation for the answer, the row must be `missing_input` with `answer = "Not found in provided documents."` and empty citations, with an actionable checklist in notes.
     This is required by report row invariants. (`docs/03-architecture/20_state_model.md`)

6. **List-shaped artefacts need a concrete, stable item-level contract (IDs, item citations, item classification)**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md` (note under the wiring diagram + sections 2.2/2.3/2.5)
   **Edit:** Add a “List payload contract v0” snippet (even if SP-2.7 finalises storage location) that defines:

   * Each item has a stable `item_id` (deterministic, derived from pack+question+item number)
   * Each item carries `citation_ids[]` (locked), not chunk IDs
   * Each item carries `item_classification` where relevant (`depicted | not_depicted | unknown`) and match state (`matched | ambiguous | missing_doc | missing_attachment`) as item-level fields, not row status
     And clarify candidate citations are chunk IDs pre-lock, per ADR-0001. (`docs/03-architecture/decisions.md` ADR-0001, `docs/03-architecture/20_state_model.md`)

7. **Brief mentions the `missing_input` exact string but omits the other invariants (empty citations + checklist)**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
   **Edit:** Under “Key trust posture”, expand the `missing_input` bullet to include the full invariant:

   * `missing_input` requires `answer` exactly `Not found in provided documents.`
   * citations must be empty
   * `notes` must include an actionable missing-doc (and missing-evidence) checklist
     This matches the state model. (`docs/03-architecture/20_state_model.md`)

8. **Brief says “start with pack_01_clean + one failure pack” but doesn’t choose the failure pack**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
   **Edit:** Make the initial acceptance anchor explicit to avoid scope drift:

   * Change Goals #1 to: “Start with `pack_01_clean` and `pack_02_missing_rea` as the first failure pack.”
     Rationale: `pack_02_missing_rea` directly exercises the mandatory missing-input journey and checklist behaviour. (`docs/08-example-data/packs_summary.md`, `docs/03-architecture/20_state_model.md`)

9. **Risk register duplicates “missing attachment” as a patch, but it is already central to SP-2.3 scope**
   **File:** `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` and `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
   **Edit:** Consolidate RH-2.8 into SP-2.3:

   * In risk register RH-2.8, change Treatment from `Patch` → `Spike` (or “Covered by SP-2.3”)
   * Next step: “Fold into SP-2.3 success criteria and implement detector if spike proves value.”
     This prevents a “patch” sneaking into build before it’s proven on `pack_06_overlapping_easements`. (`docs/08-example-data/packs_summary.md`)

10. **Initiative overview doc is duplicated (same section appears twice), which increases shaping drift**
    **File:** `docs/00-strategy/initiatives/initiative-overview-001-002-003.md`
    **Edit:** Delete the duplicate “Initiative map” block (the entire repeated header + assumptions + initiatives list). Keep one canonical copy.
    This doc is referenced as “canonical” in the brief, so duplication is a real footgun. (`docs/04-projects/02-features/0002_quick-start-engine/brief.md`)

---

## 2) Missing rabbit holes, and better Cut/Patch/Spike treatments

Add these to `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` (and link to new spikes in `spike-investigation.md`).

### RH-2.11 Retrieval recall for golden questions

* **Risk question:** Do we reliably retrieve the expected evidence chunks for the golden questions (Recall@K) before drafting?
* **Why it’s risky:** If retrieval is weak, everything degenerates into `missing_input` (or unsafe guesses), and you will mis-diagnose it as “parsing failure”.
* **Treatment:** **Spike**
* **Next step:** New spike SP-2.8 (see below).
* **Why now:** This is a prerequisite for “draft → lock → verify” working as intended. (`docs/03-architecture/06_frameworks_agents_rag_evals.md`)

### RH-2.12 Question set version pinning and compatibility

* **Risk question:** Can we prove which question set produced a run’s rows (and compare runs deterministically)?
* **Treatment:** **Patch** (data model/doc fix) + small spike to validate
* **Next step:** Add `runs.question_set_version` (or explicitly define it as part of `agent_bundle_version`) and verify it appears in run records and eval reports. (`docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`)

### RH-2.13 Per-row failure handling vs run-level failure (continue semantics)

* **Risk question:** When a step fails for one question, do we still write a terminal row (usually `citation_failed` with reason code) and continue, so the run can still reach `completed`?
* **Treatment:** **Spike** (because it’s behavioural and easy to get wrong)
* **Why:** The state model allows `completed` with `citation_failed` rows, and export is gated anyway. If you instead crash the workflow, you’ll get lots of `partial` runs and no stable evals. (`docs/03-architecture/20_state_model.md`)

### RH-2.14 Multi-parcel scoping representation

* **Risk question:** Can the requirements/exceptions/issues payload represent parcel scoping cleanly (items that apply only to Parcel 2) without inventing new row statuses?
* **Treatment:** **Spike** (piggyback on pack_04)
* **Why:** `pack_04_multi_parcel` explicitly tests parcel scoping. If payload can’t express it, truth matching and UX will be messy. (`docs/08-example-data/packs_summary.md`)

### RH-2.15 Bounded exhibit chase (depth, cycles, and evidence logging)

* **Risk question:** Can we follow defined terms / exhibit references in a bounded way that is deterministic and auditable?
* **Treatment:** **Spike**
* **Why:** `pack_08_defined_terms_and_cross_refs` exists specifically to test exhibit chase, and “bounded chain logging” needs a concrete spec (depth limit, cycle handling, reason codes). (`docs/08-example-data/packs_summary.md`)

---

## 3) Spike plan edits (tighter success criteria, smallest pack sets, missing spikes)

Edits are all in: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`, and where relevant, linked in `risk-register.md`.

### Global spike tightening (apply to every spike)

Add this to the top of `spike-investigation.md` as a standard “proof contract”:

* For any row with status `needs_review` or `reviewed`:

  * Must have `>= 1` locked citation and verification must pass. (`docs/03-architecture/20_state_model.md`, ADR-0001/0002 in `docs/03-architecture/decisions.md`)
* For any row with status `missing_input`:

  * `answer` must be exactly `Not found in provided documents.`
  * citations must be empty
  * `notes` must include an actionable checklist. (`docs/03-architecture/20_state_model.md`)
* For any `citation_failed`:

  * provenance must include a safe reason code like `CITATION_MISMATCH` or `ENTAILMENT_FAIL`. (`docs/03-architecture/20_state_model.md`)

This makes spikes actually test the trust spine, not just extraction shape.

---

### SP-2.1 Practitioner question set review (small edit)

**Keep packs:** none required (it’s a product review), but show examples from `pack_01_clean` only to ground the conversation. (`docs/08-example-data/packs_summary.md`)
**Tighten success criteria:** Replace “>=80% survive” with a crisp table you can paste into the report stub:

* Questions total: `<=25`
* Changed wording only: `<=5`
* Deleted: `<=5`
* Added: `<=5` (must be offset by deletions to stay <=25)
* Practitioner “would use as first pass”: Yes/No, with 2 quotes max (paraphrased)

And add: “Any added question must map to one of the three artefacts (B-I, B-II, Issues) or a small set of scalar Schedule A facts that clearly support those artefacts.”

---

### SP-2.2 Commitment parsing (split it to keep it honest and smaller)

Right now SP-2.2 tries to do clean + multi-parcel + scan torture in one day. That’s three different failure modes.

**Edit:** Split into two spikes.

#### New SP-2.2A Commitment parsing (clean + multi-parcel)

**Packs:**

* `pack_01_clean`
* `pack_04_multi_parcel` (`docs/08-example-data/packs_summary.md`)

**Success criteria (proof):**

* Requirements table and exceptions table match truth on **item count and item identifiers** (item numbers), plus these key fields (define explicitly in the spike after inspecting truth headers):

  * For requirements: `bi_item` (or equivalent), requirement text normalised
  * For exceptions: `bii_item`, instrument reference fields (instrument number or book/page), recorded date if present
* Precision rule: **0 false positives** (no extra items not in truth by item number).
* Any unmatched truth item must either:

  * be absent (counted as recall loss), or
  * appear as an item flagged `unknown` with citations to the relevant section header, not fabricated text.

#### New SP-2.2B Scan torture gating for commitment parsing

**Packs:**

* `pack_07_scans_rotated_low_quality` only (`docs/08-example-data/packs_summary.md`)

**Success criteria (proof):**

* Either:

  1. Extracts items with **0 false positives** and attaches citations (even if recall is low), or
  2. Entire artefact row is `missing_input` with the exact answer string and a checklist that explicitly calls out low quality OCR / rotation remediation. (`docs/03-architecture/20_state_model.md`)
* And record a single threshold decision: what extraction-quality or heuristic signal triggers mode (1) vs (2). This must not invent new statuses.

---

### SP-2.3 Exception matching (split by risk, reduce pack sets per spike)

#### SP-2.3A Matching baseline + missing exception doc

**Packs:**

* `pack_01_clean`
* `pack_02_missing_rea` (`docs/08-example-data/packs_summary.md`)

**Success criteria (proof):**

* `pack_01_clean`: each exception item that has a truth-linked instrument matches exactly one document (by truth key), and the match state is `matched`.
* `pack_02_missing_rea`: the missing REA produces:

  * item match state `missing_doc`
  * and the relevant row(s) resolve to `missing_input` **only where a supported answer is impossible**, with checklist guidance (request doc, confirm naming, etc). (`docs/03-architecture/20_state_model.md`)

#### SP-2.3B Overlaps + missing attachment detection

**Packs:**

* `pack_06_overlapping_easements` only (`docs/08-example-data/packs_summary.md`)

**Success criteria (proof):**

* At least one ambiguous case is surfaced as:

  * item match state `ambiguous`
  * row stays `needs_review` (with citations) and requires user selection (no silent auto-pick).
* Missing attachment is detected and recorded as `missing_attachment` with:

  * citation to the clause referencing the exhibit, and
  * no fabricated summary of the missing exhibit content. (Fail-closed posture, ADR-0002 in `docs/03-architecture/decisions.md`)

#### SP-2.3C Defined terms / exhibit chase boundedness

**Packs:**

* `pack_08_defined_terms_and_cross_refs` only (`docs/08-example-data/packs_summary.md`)

**Success criteria (proof):**

* Reference following is bounded and logged:

  * `max_depth = 2` (or 3, but pick one and lock it)
  * cycles terminate with a reason code like `REFERENCE_CYCLE` in provenance
  * chain is recorded in provenance as an ordered list of `{from_ref, to_doc, to_chunk_id}`
* Retrieval for the “definition target” yields at least 1 locked citation for the resolved definition, or else returns `missing_input` honestly.

---

### SP-2.4 Survey extraction (keep packs, tighten comparator)

**Packs (already minimal):**

* `pack_01_clean`
* `pack_03_mismatch_and_cert_gap`
* `pack_07_scans_rotated_low_quality` (`docs/08-example-data/packs_summary.md`)

**Tighten success criteria:**

* Define two buckets in the expected comparator:

  1. **Certification parties**: lender present/absent, surveyor, date (whatever truth supports)
  2. **Callouts**: list of callout strings normalised, each with at least 1 citation
* For `pack_03_mismatch_and_cert_gap`: must explicitly flag missing lender certification (as a structured issue field), not just a note.
* For scan torture: same rule as SP-2.2B, either extract with 0 hallucinations or `missing_input` with a remediation checklist.

---

### SP-2.5 Reconciliation honesty (trim packs)

You don’t need all three packs to prove “unknown bias”.

**Packs (smaller):**

* `pack_03_mismatch_and_cert_gap` (has the mismatch)
* `pack_07_scans_rotated_low_quality` (forces uncertainty) (`docs/08-example-data/packs_summary.md`)

**Tighten success criteria:**

* For each reconciliation item, classification must be one of:

  * `depicted`, `not_depicted`, `unknown` (item-level only)
* Hard rule: `not_depicted` requires **positive evidence of absence** (for v1, define it narrowly, for example: survey has explicit “no easements shown” statement or explicit contradiction). Otherwise it must be `unknown`.
* Row status remains one of the four terminal statuses only. (`docs/03-architecture/20_state_model.md`)

---

### SP-2.6 Run idempotency + snippet_hash stability (tighten equality definition)

**Packs:** `pack_01_clean` only is fine. (`docs/08-example-data/packs_summary.md`)

**Tighten success criteria:**

* After two runs with the same pinned versions (`index_version`, `agent_bundle_version`, and `question_set_version`), the following must be byte-identical after normalisation:

  * report row `answer` (or payload JSON if you choose that route)
  * ordered list of `citation.snippet_hash` values per row
  * row `status` values
* Allowed differences: timestamps, run IDs, DB IDs.
  And record the normalisation function in the spike report.

This directly enforces ADR-0001 hashing and run pinning. (`docs/03-architecture/30_data_model.md`, ADR-0001 in `docs/03-architecture/decisions.md`)

---

### SP-2.7 Payload representation decision (tighten + reduce packs)

**Packs (smallest useful):**

* `pack_01_clean`
* `pack_04_multi_parcel` (forces scoping fields) (`docs/08-example-data/packs_summary.md`)

**Edits:**

* Add an explicit requirement: payload must support stable `item_id` for diffing and UI updates (idempotency and restart safety).
* Add Option 4 (worth considering):
  4) Add a dedicated `report_rows.payload_json` column (typed JSON) so `answer` stays human-readable and provenance stays provenance.
  This may be the cleanest separation if you want structured artefacts without polluting provenance.

And explicitly state: whichever option you pick, the API response should expose `citation_ids[]` and the UI must render from locked citations only. (ADR-0001 in `docs/03-architecture/decisions.md`)

---

### Missing spikes to add

#### New SP-2.8 Retrieval Recall@K (golden questions)

**Why:** You reference golden questions and fixture-driven evals, but there is no spike that proves retrieval is good enough before you tune parsing. (`docs/03-architecture/06_frameworks_agents_rag_evals.md`)
**Packs:** start with `pack_01_clean` only (smallest). (`docs/08-example-data/packs_summary.md`)
**Success criteria (proof):**

* For each question in `docs/08-example-data/pack_01_clean/truth/golden_questions.json` (or wherever it lives), retrieval returns at least one chunk that overlaps the expected anchor page range (use `layout/*.anchors.json`).
* Report Recall@K at K=10 and K=25. Set an initial bar like Recall@10 ≥ 0.8 for pack_01, and record misses with doc+page.

#### New SP-2.9 Row invariant audit script (used by every spike)

**Why:** Every spike currently risks “passing” while violating invariants (for example needs_review with zero citations). (`docs/03-architecture/20_state_model.md`)
**Packs:** none, it’s a validator.
**Success criteria:** A CLI or test helper that given a run ID asserts:

* Unique `(run_id, question_id)`
* `missing_input` answer exact string and zero citations
* `needs_review/reviewed` has at least one locked citation
* `citation_failed` has reason code
  This becomes the shared harness for spikes.

#### New SP-2.10 Multi-parcel scoping representation

**Why:** It’s a distinct domain requirement in `pack_04_multi_parcel`. (`docs/08-example-data/packs_summary.md`)
**Packs:** `pack_04_multi_parcel` only.
**Success criteria:** At least one extracted requirement or exception item is explicitly scoped to Parcel 2 (as truth indicates), and the UI rendering can show parcel scope without inventing new row statuses.

---

## 4) Concrete GO / NO-GO checklist for starting PRDs

Use this as a hard gate before any PRD work. (And it’s written to align with the invariants and ADRs.)

### Canonical fixtures and naming

* [ ] All docs in this packet reference only canonical pack names from `docs/08-example-data/packs_summary.md`. No stray names like `pack_04_multi_parcel_complex`.
* [ ] `docs/00-strategy/initiatives/002-quick-start-engine.md` is corrected so strategy and fixtures agree. (`docs/08-example-data/packs_summary.md`)

### Version pinning and determinism

* [ ] Run records pin `index_version`, `agent_bundle_version`, and `question_set_version` (or you explicitly define question set as part of agent bundle). (`docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`)
* [ ] SP-2.6 passes: re-run produces stable `snippet_hash` values and stable row outputs (ignoring timestamps/IDs). (`docs/03-architecture/30_data_model.md`)

### Row model and payload representation is decided

* [ ] SP-2.7 is completed with an explicit decision and consequences, including how list-shaped artefacts are stored, diffed, and rendered.
* [ ] Payload contract includes stable `item_id`, item-level `citation_ids[]`, and item-level classifications (depicted/not_depicted/unknown, match states) without inventing new row statuses. (`docs/03-architecture/20_state_model.md`)

### Trust spine invariants are proven, not assumed

* [ ] A row invariant audit (SP-2.9) exists and is run as part of every spike report. (`docs/03-architecture/20_state_model.md`)
* [ ] `missing_input` behaviour is correct everywhere:

  * answer is exactly `Not found in provided documents.`
  * citations empty
  * notes include an actionable checklist. (`docs/03-architecture/20_state_model.md`)
* [ ] Fail-closed verification is enforced:

  * any mismatch or entailment failure results in `citation_failed` with reason code. (ADR-0002 in `docs/03-architecture/decisions.md`)

### Retrieval and extraction are “good enough” on the smallest meaningful set

* [ ] SP-2.8 Retrieval Recall@K passes on `pack_01_clean` with an agreed threshold, and misses are logged by doc+page. (`docs/03-architecture/06_frameworks_agents_rag_evals.md`)
* [ ] Commitment parsing spike(s) pass:

  * SP-2.2A on `pack_01_clean` + `pack_04_multi_parcel`
  * SP-2.2B scan gating on `pack_07_scans_rotated_low_quality` with “no hallucinations” behaviour. (`docs/08-example-data/packs_summary.md`)
* [ ] Exception matching spikes pass on:

  * baseline + missing doc (`pack_01_clean`, `pack_02_missing_rea`)
  * overlaps + missing attachment (`pack_06_overlapping_easements`)
  * defined terms chase bounded (`pack_08_defined_terms_and_cross_refs`). (`docs/08-example-data/packs_summary.md`)

### Workflow boundaries and step idempotency

* [ ] Workflow code is constrained: controller has no side effects; all side effects in steps, with `"use workflow"` / `"use step"` directives enforced. (`docs/03-architecture/06_frameworks_agents_rag_evals.md`, ADR-0005 in `docs/03-architecture/decisions.md`)
* [ ] Steps have deterministic idempotency keys recorded in `run_steps`, and retries do not duplicate rows. (`docs/03-architecture/06_frameworks_agents_rag_evals.md`, `docs/03-architecture/20_state_model.md`)

If any checkbox is false, it’s a NO-GO for PRDs. The failure mode is predictable: you will write PRDs that bake in inconsistent fixtures, undefined payload contracts, and unverifiable row states.
