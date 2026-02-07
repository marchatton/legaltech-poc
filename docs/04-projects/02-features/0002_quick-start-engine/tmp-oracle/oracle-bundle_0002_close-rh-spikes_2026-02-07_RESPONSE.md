## 1) Closure table (RH-2.1 … RH-2.19)

> Status invariants + allowed row statuses are fixed: `needs_review|reviewed|missing_input|citation_failed` only. (ref: `docs/03-architecture/20_state_model.md`)
> Canonical pack names are fixed. (ref: `docs/08-example-data/packs_summary.md`)
> Spikes must be measurable vs `/truth` (CSV + anchors). (ref: `docs/03-architecture/06_frameworks_agents_rag_evals.md`, `docs/03-architecture/60_observability_and_evals.md`)

| RH id   | Spike(s) that close it (or Patch/Cut)  | Closure criteria (explicit, pass/fail)                                                                                                                                                                                                                                                                                                                                                                                                                                                                           | Artefacts to commit (exact paths)                                                                                                                                                                                                                                                  | Exact doc edits required                                                                                                                                                                                                                                                                                          |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| ------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------- |
| RH-2.1  | **SP-2.1**                             | ☐ `question_set_v1.json` is `<=25` questions  ☐ exactly **3** list-shaped questions (B‑I/B‑II/Issues)  ☐ practitioner sign-off captured (date + role + “usable first pass” yes/no)  ☐ any added Q offsets deletions to keep `<=25`                                                                                                                                                                                                                                                                               | `docs/04-projects/02-features/0002_quick-start-engine/question_set_v1.json`  `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.1_practitioner_review.md`                                                                                                     | Update GO gates + pin version semantics in `brief.md` (ref: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`)  Update SP-2.1 report stub in `spike-investigation.md` (ref: `.../spike-investigation.md`)  Mark RH-2.1 closed in `risk-register.md` (ref: `.../risk-register.md`)                   |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.2  | **SP-2.7** (Decision)                  | ☐ Choose option 1–4 and document why  ☐ `list_payload_v0` schema can represent **all columns** in `expected_requirements_tracker.csv`, `expected_exceptions_table.csv`, `expected_survey_issues.csv`  ☐ API surface can return payload + schema version without breaking row invariants                                                                                                                                                                                                                          | `docs/04-projects/02-features/0002_quick-start-engine/list_payload_v0.schema.md`  `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`                                                                                                           | Update canonical data model to add payload fields (ref: `docs/03-architecture/30_data_model.md`)  Update API response shape to include payload fields (ref: `docs/03-architecture/50_api_surface.md`)  Update SP-2.7 report stub + mark RH-2.2 closed (ref: `.../spike-investigation.md`, `.../risk-register.md`) |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.3  | **SP-2.2A + SP-2.2C**                  | ☐ `pack_01_clean`: B‑I payload matches `truth/expected_requirements_tracker.csv` (count + `bi_item` + key fields per comparator)  ☐ `pack_01_clean`: B‑II payload matches `truth/expected_exceptions_table.csv` (count + `bii_item` + key fields per comparator)  ☐ `pack_07_scans_rotated_low_quality`: either (a) 0 false positives with citations, **or** (b) row is `missing_input` with exact string + zero citations + remediation checklist (ref: invariants in `docs/03-architecture/20_state_model.md`) | `docs/04-projects/02-features/0002_quick-start-engine/comparator_spec_v0.md`  `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2A_pack_01_clean.json`  `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.2C_pack_07_scan_policy.json` | Add comparator spec reference into SP-2.2A/C sections (ref: `.../spike-investigation.md`)  Mark RH-2.3 closed + note any cuts (ref: `.../risk-register.md`)                                                                                                                                                       |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.4  | **SP-2.3A** (+ SP‑2.3B/2.3C as needed) | ☐ No silent false matches: ambiguous => `match_status: ambiguous` with candidates  ☐ `pack_02_missing_rea`: missing REA surfaced item-level with checklist naming `REA.pdf` (ref: `docs/08-example-data/packs_summary.md`)  ☐ Comparator run produces PASS/FAIL, no eyeballing                                                                                                                                                                                                                                   | `.../spike-proofs/SP-2.3A_pack_01_02_matching.json`                                                                                                                                                                                                                                | Update SP-2.3A report stub; close RH-2.4 in `risk-register.md` (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                        |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.5  | **SP-2.4A + SP-2.4B**                  | ☐ `pack_01_clean`: cert parties extracted and backed by lockable citations  ☐ `pack_03_mismatch_and_cert_gap`: lender omission surfaced as **issue code** with citation to cert block  ☐ `pack_07_scans_rotated_low_quality`: either cited callouts, or safe `missing_input` fallback with remediation checklist                                                                                                                                                                                                 | `.../spike-proofs/SP-2.4A_pack_01_03.json`  `.../spike-proofs/SP-2.4B_pack_07.json`                                                                                                                                                                                                | Update SP-2.4A/B stubs; close RH-2.5 (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                                                  |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.6  | **SP-2.5**                             | ☐ Item classification only: `depicted                                                                                                                                                                                                                                                                                                                                                                                                                                                                            | not_depicted                                                                                                                                                                                                                                                                       | unknown`(item-level; never new row status) (ref:`docs/03-architecture/20_state_model.md`)  ☐ `not_depicted`requires **positive evidence of absence** (rule written + test case)  ☐ If unsafe, cut to`depicted                                                                                                     | unknown` and document cut                                                                                                                                                             | `.../spike-proofs/SP-2.5_policy_and_examples.md` | Add the explicit evidence rules into SP-2.5 section; close RH-2.6 (ref: `.../spike-investigation.md`, `.../risk-register.md`) |
| RH-2.7  | **SP-2.6**                             | ☐ Two runs, same pinned versions: per-row normalised outputs identical, incl ordered `citation.snippet_hash` (ref: hashing rule `docs/03-architecture/30_data_model.md`)  ☐ Negative test: corrupt one citation => that row `citation_failed` with reason `CITATION_MISMATCH`, workflow continues, run reaches `completed` (ref: `docs/03-architecture/20_state_model.md`)                                                                                                                                       | `.../spike-proofs/SP-2.6_idempotency_pack_01.json`  `.../spike-proofs/SP-2.6_negative_test.json`                                                                                                                                                                                   | Update SP-2.6 stub; close RH-2.7 (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                                                      |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.8  | **SP-2.3B**                            | ☐ At least one ambiguous overlap => `ambiguous` with ≥2 candidates  ☐ Missing Exhibit B detected => `missing_attachment` with citation to clause referencing exhibit + checklist naming `Utility_Easement_10ft_ExhibitB.pdf` (ref: `docs/08-example-data/packs_summary.md`)                                                                                                                                                                                                                                      | `.../spike-proofs/SP-2.3B_pack_06_missing_attachment.json`                                                                                                                                                                                                                         | Update SP-2.3B stub; close RH-2.8 (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                                                     |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.9  | **Patch**                              | ☐ Reason-code → guidance copy table exists and is used consistently in row drawer  ☐ Drawer never suggests “turn off verification”  ☐ `citation_failed` rows show reason code + next action (ref: fail-closed posture `docs/03-architecture/DECISIONS.md` ADR‑0002)                                                                                                                                                                                                                                              | `docs/04-projects/02-features/0002_quick-start-engine/failure_ux_copy_v0.md`                                                                                                                                                                                                       | Add guidance affordance to breadboard (U4 drawer) (ref: `.../breadboard-pack.md`)  Close RH-2.9 in `risk-register.md`                                                                                                                                                                                             |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.10 | **Patch**                              | ☐ One script/CI check verifies pack directory names match `packs_summary.md`  ☐ docs reference canonical names only (grep proof)                                                                                                                                                                                                                                                                                                                                                                                 | `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.10_pack_name_audit.txt`  `scripts/fixtures/verify_pack_names.(ts                                                                                                                                           | py)`                                                                                                                                                                                                                                                                                                              | Add “packs_summary is canonical” note wherever pack names appear (already in dossier; ensure it’s also in fixture tooling docs if any) (ref: `docs/08-example-data/packs_summary.md`) |                                                  |                                                                                                                               |
| RH-2.11 | **SP-2.8**                             | ☐ Recall@10 + Recall@25 computed for `pack_01_clean` vs anchors (ref: anchors in `docs/08-example-data/<pack>/layout/*.anchors.json`)  ☐ Miss log includes `{question_id, doc, page}` + top retrieved chunks  ☐ Decide Patch vs accept baseline                                                                                                                                                                                                                                                                  | `.../spike-proofs/SP-2.8_recall_pack_01.json`                                                                                                                                                                                                                                      | Update SP-2.8 stub; close RH-2.11 (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                                                     |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.12 | **Patch (already mostly done)**        | ☐ `runs.question_set_version` is documented in state model + data model + API surface (it is) (ref: `docs/03-architecture/20_state_model.md`, `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`)  ☐ Dossier docs consistently refer to pinning semantics                                                                                                                                                                                                                         | `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.12_pin_audit.md`                                                                                                                                                                                           | Mark RH-2.12 closed in `risk-register.md` and link the audit note                                                                                                                                                                                                                                                 |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.13 | Fold into **SP-2.6**                   | ☐ Explicitly run the negative test described in SP-2.6 and record that run reaches `completed` with one `citation_failed` row                                                                                                                                                                                                                                                                                                                                                                                    | (covered by SP-2.6 proof artefacts above)                                                                                                                                                                                                                                          | In `risk-register.md`, set RH-2.13 “closed” once SP-2.6 negative test is captured                                                                                                                                                                                                                                 |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.14 | **SP-2.10** (and/or SP-2.2B)           | ☐ Payload has a concrete scoping field (`parcel_scope`) backed by citations  ☐ UI renders “Parcel 2 only” without new row statuses (ref: `docs/03-architecture/20_state_model.md`)  ☐ Comparator rule for scoping is defined (in comparator spec)                                                                                                                                                                                                                                                                | `.../spike-proofs/SP-2.10_pack_04_scoping.json`                                                                                                                                                                                                                                    | Update SP-2.10 stub; close RH-2.14 (ref: `.../spike-investigation.md`, `.../risk-register.md`)                                                                                                                                                                                                                    |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.15 | **SP-2.3C**                            | ☐ Bounded chase: `max_depth` recorded  ☐ Cycles terminate with reason code `REFERENCE_CYCLE` (or chosen code) in provenance  ☐ Chain recorded: ordered `{from_ref,to_doc,to_chunk_id}`  ☐ If can’t lock citations => `missing_input`                                                                                                                                                                                                                                                                             | `.../spike-proofs/SP-2.3C_pack_08_bounded_chase.json`                                                                                                                                                                                                                              | Update SP-2.3C stub; close RH-2.15                                                                                                                                                                                                                                                                                |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.16 | **Cut for v1** (optional later spike)  | ☐ Explicitly marked v1 cut: “no user resolution / selection persistence”  ☐ Future mechanism deferred to SP-2.13 (new run or rerun single question) (ref: SP-2.13 in `spike-investigation.md`)                                                                                                                                                                                                                                                                                                                   | `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md`                                                                                                                                                                                            | Update brief non-goals + breadboard (no “choose doc” affordance) (ref: `.../brief.md`, `.../breadboard-pack.md`)  Mark RH-2.16 closed-as-cut in `risk-register.md`                                                                                                                                                |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.17 | **SP-2.11**                            | ☐ Written v1 verification policy for list payloads  ☐ Defines unit of verification + partial failure behaviour  ☐ If “repair/downgrade”, step boundary is explicit and citations stay immutable (ref: immutability in `docs/03-architecture/30_data_model.md`, fail-closed in ADR‑0002 `docs/03-architecture/DECISIONS.md`)                                                                                                                                                                                      | `docs/04-projects/02-features/0002_quick-start-engine/list_verification_policy_v1.md`  `.../spike-proofs/SP-2.11_policy_pack_01.json`                                                                                                                                              | Update SP-2.11 stub; close RH-2.17                                                                                                                                                                                                                                                                                |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.18 | **Patch (SP-2.12)**                    | ☐ `POST /folders/:id/runs` allowed when folder is `indexed` or `ready` (ref: `docs/03-architecture/20_state_model.md`, `docs/03-architecture/50_api_surface.md`)  ☐ UI shows explicit warning when `indexed` but not `ready`  ☐ warning copy is safe + actionable                                                                                                                                                                                                                                                | `.../spike-proofs/SP-2.12_warning_copy.md`                                                                                                                                                                                                                                         | Update SP-2.12 stub; close RH-2.18                                                                                                                                                                                                                                                                                |                                                                                                                                                                                       |                                                  |                                                                                                                               |
| RH-2.19 | **Patch**                              | ☐ One comparator spec exists and all spikes reference it  ☐ Normalisers are implemented once and reused in spike harness + evals  ☐ Comparator emits deterministic PASS/FAIL + diff artefacts                                                                                                                                                                                                                                                                                                                    | `docs/04-projects/02-features/0002_quick-start-engine/comparator_spec_v0.md`  `scripts/fixtures/compare_truth.(ts                                                                                                                                                                  | py)`                                                                                                                                                                                                                                                                                                              | Add “Comparator spec v0” link at top of `spike-investigation.md` and in any PRD slice that mentions diffs (ref: `.../spike-investigation.md`, plus slices under `.../prd-slice-*.md`) |                                                  |                                                                                                                               |

(refs: `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`, `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`)

---

## 2) Spike edits to make `spike-investigation.md` runnable (smallest harness + measurable diffs)

These are **concrete edits** you can apply section-by-section inside `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`. (ref: that file)

### Global insert (near “Proof contract”): add an “Execution harness + comparator” block

Add:

* **Harness contract (single path for all spikes)**

  1. Produce a run output snapshot JSON for a `{pack_id, run_id}` containing:

     * pinned versions `{index_version, agent_bundle_version, question_set_version}` (ref: `docs/03-architecture/20_state_model.md`)
     * report rows for the spike’s `question_id`s, including `payload_schema_version`, `payload_json`, `status`, `citation_ids`, and `provenance_json` (ref: `docs/03-architecture/50_api_surface.md`)
     * a citation materialisation map `{citation_id -> {document_filename,page_number,polygons,snippet_hash}}` (ref: `docs/03-architecture/30_data_model.md`)
  2. Compare snapshot → `/truth/*.csv` using **one comparator**: `comparator_spec_v0.md` (new).
  3. Emit: `PASS` or `FAIL` plus a deterministic diff artefact (JSON + optional CSV).

* **Add these repo artefacts (new, referenced by all spikes)**

  * `docs/04-projects/02-features/0002_quick-start-engine/comparator_spec_v0.md`
  * `scripts/fixtures/compare_truth.(ts|py)` (single entrypoint; reads pack truth CSVs + snapshot JSON)
  * `scripts/fixtures/assert_row_invariants.(ts|py)` (SP‑2.9 helper; can also be called by every spike) (ref: row invariants `docs/03-architecture/20_state_model.md`)

### Comparator rules to add (in the new `comparator_spec_v0.md`)

Minimum “no arguing about diffs” rules:

**Normalisation (apply everywhere)** (ref: hashing normalise rule in `docs/03-architecture/30_data_model.md`)

* `norm_ws(s)`: trim; CRLF→LF; collapse whitespace runs to single space.
* `norm_int(s)`: parse int; reject non-numeric => fail.
* `norm_instrument_no(s)`: uppercase; remove spaces; keep `[A-Z0-9-]` only.
* `norm_date(s)`: parse common forms; output ISO `YYYY-MM-DD`; if empty => `null`.
* `norm_tags(s)`: split on `;`; trim; lowercase; sort; join with `;`.

**Citation-to-anchor check (measurable, fail-closed)**

* Truth rows give `(citation_doc, citation_anchor)` (ref: truth CSVs under each pack; eg `docs/08-example-data/pack_01_clean/truth/*.csv`).
* The comparator must assert: for each produced item, **at least one** `citation_id` maps to:

  * `document_filename == citation_doc`
  * `page_number == anchors[citation_anchor].page` (ref: `docs/08-example-data/<pack>/layout/*.anchors.json`)
  * and polygon bbox overlaps anchor bbox with IoU ≥ 0.05 (or, simpler: polygon bbox centre inside anchor bbox).
    If not, fail with `citation_failed` reason `CITATION_MISMATCH` in spike proof output (reason codes ref: `docs/03-architecture/60_observability_and_evals.md`).

**Item-status mapping (avoid confusing row statuses)**
Truth CSVs use `status` per item (e.g. exceptions include `needs_review` / `missing_input`) (ref: `docs/08-example-data/pack_02_missing_rea/truth/expected_exceptions_table.csv`). Treat this as **item-level** and map:

* payload `match_status in {missing_doc, missing_attachment}` ⇒ truth `status == "missing_input"`
* payload `match_status == matched|ambiguous` ⇒ truth `status == "needs_review"`
  This keeps report-row statuses untouched (ref: `docs/03-architecture/20_state_model.md`).

### Per-spike edits (add these subsections)

For each spike section, add:

1. **Smallest pack set** (already present in most; keep as-is, but enforce “only what proves the point”). (ref: `docs/08-example-data/packs_summary.md`)
2. **Harness command** (one-liner that produces the snapshot JSON)
3. **Comparator invocation** (one-liner)
4. **Proof artefacts** (paths and expected filenames)
5. **Explicit closure checkboxes** (what makes it “done”)

Example edits for the highest-gating spikes:

#### SP-2.2A add

* **Harness**

  * Output snapshot: `.../spike-proofs/SP-2.2A_pack_01_clean.snapshot.json`
  * Must include rows for `TS-03` (B‑I) and `TS-04` (B‑II) (ref: `docs/08-example-data/pack_01_clean/truth/golden_questions.json`)
* **Comparator**

  * Compare to:

    * `docs/08-example-data/pack_01_clean/truth/expected_requirements_tracker.csv`
    * `docs/08-example-data/pack_01_clean/truth/expected_exceptions_table.csv`
* **Proof capture**

  * `.../spike-proofs/SP-2.2A_pack_01_clean.diff.json`
  * `.../spike-proofs/SP-2.2A_pack_01_clean.result.json` containing `{pass: boolean, failing_rows: [...]}`

#### SP-2.2C add

* **Threshold decision is a constant** stored in proof output (not prose), e.g. `min_extraction_quality_for_items = 0.60` (aligning with folder “ready” health check default) (ref: `docs/03-architecture/20_state_model.md`).
* **Closure criteria** explicitly checks the row status and exact missing-input string. (ref: `docs/03-architecture/20_state_model.md`)

#### SP-2.3A add

* **Comparator** checks that `match_status` is never `matched` when there are multiple candidates within the heuristic threshold (hard fail).
* **Missing REA checklist** must include the literal filename `REA.pdf` (ref: `docs/08-example-data/packs_summary.md`).

#### SP-2.6 add

* Add a required function name in proof: `normalise_row_for_idempotency_v0()` and define it in `comparator_spec_v0.md`:

  * sort lists by `question_id`, then by `item_id`
  * normalise whitespace in answers
  * sort citation hashes list
  * drop timestamps + DB ids (allowed diffs already in SP-2.6) (ref: SP-2.6 text in `spike-investigation.md`).

---

## 3) `question_set_v1.json` proposal (<=25, 3 list-shaped)

Built from the union of the provided `truth/golden_questions.json` across packs, plus one explicit “issues list” artefact row. (refs: `docs/08-example-data/pack_01_clean/truth/golden_questions.json`, `.../pack_02_missing_rea/...`, `.../pack_03_mismatch_and_cert_gap/...`, `.../pack_04_multi_parcel/...`, `.../pack_05_partial_release/...`, `.../pack_06_overlapping_easements/...`, `.../pack_07_scans_rotated_low_quality/...`, `.../pack_08_defined_terms_and_cross_refs/...`)

**File to commit:** `docs/04-projects/02-features/0002_quick-start-engine/question_set_v1.json`

```json
{
  "question_set_id": "qs_0002_v1",
  "question_set_version_format": "qs:0002:v{major}.{minor}:sha256:{canonical_json_sha256}",
  "questions": [
    {
      "question_id": "TS-01",
      "group": "title_schedule_a",
      "question": "Who is the Proposed Insured?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-02",
      "group": "title_schedule_a",
      "question": "What is the Insured Estate?",
      "response_kind": "scalar_text"
    },

    {
      "question_id": "TS-03",
      "group": "artefacts",
      "question": "List Schedule B-I requirements.",
      "response_kind": "list_payload",
      "artefact_kind": "requirements_tracker",
      "payload_schema_version": "list_payload_v0"
    },
    {
      "question_id": "TS-04",
      "group": "artefacts",
      "question": "List the recorded exceptions in Schedule B-II.",
      "response_kind": "list_payload",
      "artefact_kind": "exceptions_table",
      "payload_schema_version": "list_payload_v0"
    },

    {
      "question_id": "TS-05",
      "group": "survey",
      "question": "Who is the survey certified to?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-06",
      "group": "survey",
      "question": "Are there any encroachments or protrusions noted on the survey?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-07",
      "group": "survey",
      "question": "Does the survey flag any mismatch with the record description?",
      "response_kind": "scalar_text"
    },
    {
      "question_id": "TS-08",
      "group": "reconciliation",
      "question": "Is any referenced exception document missing from the pack?",
      "response_kind": "scalar_text"
    },

    {
      "question_id": "TS-09",
      "group": "artefacts",
      "question": "List survey reconciliation issues and QC flags (title ↔ survey), including missing-doc, cert-gap, mismatch, encroachments, and scan-quality warnings.",
      "response_kind": "list_payload",
      "artefact_kind": "survey_issues",
      "payload_schema_version": "list_payload_v0"
    }
  ],
  "list_shaped_question_ids": ["TS-03", "TS-04", "TS-09"],
  "notes": {
    "pinning": {
      "runs.question_set_version": "Set to qs:0002:v1.0:sha256:{canonical_json_sha256} at run start; stored on run; must be returned by GET /runs/:id and in report responses.",
      "canonicalisation": "Before hashing, serialise JSON with stable key ordering and no insignificant whitespace; then sha256 the bytes."
    }
  }
}
```

**Pinning semantics (end-to-end)**

* `question_set_version` **must** be persisted on the run record and used to define “completed = exactly one row per question_id in that set”. (ref: `docs/03-architecture/20_state_model.md`, plus `runs.question_set_version` in `docs/03-architecture/30_data_model.md` and `docs/03-architecture/50_api_surface.md`)
* Recommended string format (matches the JSON above):
  `qs:0002:v1.0:sha256:<canonical_json_sha256>`
  Where `canonical_json_sha256` is the hash of the canonicalised `question_set_v1.json` bytes.
* Any time the question set changes (even wording), the hash changes, therefore comparisons are stable and “completed” is enforceable. (ref: `docs/03-architecture/20_state_model.md`)

---

## 4) SP-2.7 payload representation decision + `list_payload_v0` schema + examples

### Decision: **Option 4**

> **Pick:** `report_rows.payload_json` (JSONB) + `report_rows.payload_schema_version` columns, keep `answer` human-readable, `provenance_json` debug-only. (ref: SP‑2.7 options in `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`)

**Why (tight and practical)**

* UI rendering should be deterministic from a versioned contract, not from prose parsing. (ref: breadboard “List payload contract v0” section in `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`)
* `answer` stays stable for humans and export memo generation later; `payload_json` is the machine contract for tables/evals.
* Provenance must stay “debug-only” so we don’t accidentally create product dependencies on internal retrieval traces. (ref: `docs/03-architecture/30_data_model.md` on provenance + safety)
* Fits row invariants cleanly, without inventing new report-row statuses. (ref: `docs/03-architecture/20_state_model.md`)

### Minimal `list_payload_v0` schema (Zod-ish / JSON)

**File to commit:** `docs/04-projects/02-features/0002_quick-start-engine/list_payload_v0.schema.md`

```ts
// payload_schema_version = "list_payload_v0"

type ListPayloadV0 = {
  kind: "requirements_tracker" | "exceptions_table" | "survey_issues";
  items: Array<RequirementsItemV0 | ExceptionItemV0 | SurveyIssueItemV0>;
};

type BaseItemV0 = {
  item_id: string;                 // deterministic for diffing + idempotency
  citation_ids: string[];          // locked citations only (ADR-0001)
  notes?: string | null;
};

type ParcelScopeV0 =
  | { scope: "all" }
  | { scope: "parcels"; parcels: number[]; citation_ids: string[] };

type RequirementsItemV0 = BaseItemV0 & {
  kind: "requirements_tracker_item";
  bi_item: number;
  requirement: string;
  owner: string;
  item_status: "open" | "closed" | "waived";  // item-level only
  parcel_scope?: ParcelScopeV0;
};

type ExceptionMatchStatusV0 =
  | "matched"
  | "ambiguous"
  | "missing_doc"
  | "missing_attachment";

type ExceptionItemV0 = BaseItemV0 & {
  kind: "exceptions_table_item";
  bii_item: number;
  type: string;
  instrument_no?: string | null;
  recorded_date?: string | null;    // ISO YYYY-MM-DD
  doc?: string | null;              // expected filename
  risk_tags?: string[];             // normalised lower-case tags
  match_status: ExceptionMatchStatusV0;
  candidates?: Array<{ doc: string; instrument_no?: string | null }>;
  parcel_scope?: ParcelScopeV0;

  // Truth CSV has a "status" column. Keep it item-level, but map from match_status:
  item_status: "needs_review" | "missing_input";
};

type SurveyIssueItemV0 = BaseItemV0 & {
  kind: "survey_issue_item";
  issue_type: string;               // e.g. encroachment, ocr_quality, missing_input
  description: string;
  impact?: string | null;
  suggested_fix?: string | null;

  // optional linkage for reconciliation
  related_exception_item_id?: string | null;
  item_classification?: "depicted" | "not_depicted" | "unknown"; // item-level only
};
```

**Deterministic `item_id` rules (so idempotency + diffs are boring)**

* Requirements: `bi:<bi_item>`
* Exceptions: `bii:<bii_item>`
* Issues: `issue:<issue_type>:<citation_doc>:<citation_anchor>` if anchor-known, else `issue:<issue_type>:sha256:<desc_hash_12>`
  (ref: idempotency need in `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` SP-2.6; row uniqueness in `docs/03-architecture/20_state_model.md`)

### Example payload items (one each)

**B‑I requirement item** (columns mirror `expected_requirements_tracker.csv`) (ref: `docs/08-example-data/pack_01_clean/truth/expected_requirements_tracker.csv`)

```json
{
  "kind": "requirements_tracker_item",
  "item_id": "bi:1",
  "bi_item": 1,
  "requirement": "Payment of the full consideration to the Company for the policy(ies) to be issued and all applicable premiums and charges.",
  "owner": "Buyer",
  "item_status": "open",
  "citation_ids": ["cit_..."]
}
```

**B‑II exception item** (columns mirror `expected_exceptions_table.csv`) (ref: `docs/08-example-data/pack_01_clean/truth/expected_exceptions_table.csv`)

```json
{
  "kind": "exceptions_table_item",
  "item_id": "bii:15",
  "bii_item": 15,
  "type": "Reciprocal Easement Agreement (REA)",
  "instrument_no": "2021-218785",
  "recorded_date": "2021-10-22",
  "doc": "REA.pdf",
  "risk_tags": ["parking", "shared_costs"],
  "match_status": "matched",
  "item_status": "needs_review",
  "citation_ids": ["cit_..."]
}
```

**Survey issue item** (columns mirror `expected_survey_issues.csv`) (ref: `docs/08-example-data/pack_01_clean/truth/expected_survey_issues.csv`)

```json
{
  "kind": "survey_issue_item",
  "item_id": "issue:encroachment:ALTA_Survey.pdf:SURVEY_ENC_01",
  "issue_type": "encroachment",
  "description": "Chain-link fence encroaches approx. 0.4' over the north boundary line near the NW corner.",
  "impact": "May require cure, endorsement, or risk acceptance.",
  "suggested_fix": "Confirm materiality; consider survey revision, boundary agreement, or endorsement evidence package.",
  "citation_ids": ["cit_..."]
}
```

### Doc updates required for SP-2.7 (canonical, not just dossier)

* **`docs/03-architecture/30_data_model.md`**: extend `report_rows` with:

  * `payload_json` (jsonb, nullable)
  * `payload_schema_version` (string, nullable)
    (ref: existing `report_rows` description in `docs/03-architecture/30_data_model.md`)
* **`docs/03-architecture/50_api_surface.md`**: extend report row response shape to include `payload_json` + `payload_schema_version` (nullable) (ref: report endpoint in that doc).
* **`docs/04-projects/02-features/0002_quick-start-engine/prd-slice-02-row-payload-contract.md`** is already aligned with Option 4; keep it consistent (ref: that PRD slice).

---

## 5) GO checklist (what must be true to flip Initiative 0002 to GO and start `wf-plan`)

**Where to update:** append this checklist under “Shaping decision / GO when” in `docs/04-projects/02-features/0002_quick-start-engine/brief.md`. (ref: that file)

### GO gates (all must be true)

**Contracts frozen**

* ☐ **Question set v1 frozen**: `question_set_v1.json` committed, `<=25`, exactly 3 list-shaped rows (`TS-03`, `TS-04`, `TS-09`), practitioner review captured. (refs: `.../brief.md`, `.../spike-investigation.md` SP‑2.1)
* ☐ **Payload storage decision frozen**: SP‑2.7 selects Option 4; schema `list_payload_v0` committed; canonical architecture docs updated (`30_data_model.md`, `50_api_surface.md`). (refs: `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`, SP‑2.7 section in `.../spike-investigation.md`)
* ☐ **Comparator spec v0 exists** and all spikes reference it; normalisers are single-sourced. (ref: RH‑2.19 in `.../risk-register.md`)

**Fixture-verifiable spikes passed (proof artefacts committed)**

* ☐ SP‑2.8 Retrieval Recall@K baseline on `pack_01_clean` is measured, misses logged, and there is an explicit decision (patch vs accept). (ref: `.../spike-investigation.md` SP‑2.8)
* ☐ SP‑2.2A Commitment parsing on `pack_01_clean` passes CSV comparators for requirements + exceptions with 0 false positives. (refs: `docs/08-example-data/pack_01_clean/truth/expected_requirements_tracker.csv`, `.../expected_exceptions_table.csv`)
* ☐ SP‑2.3A Exception matching passes on `pack_01_clean` and missing-doc journey passes on `pack_02_missing_rea` (checklist includes `REA.pdf`). (refs: `docs/08-example-data/packs_summary.md`, `.../pack_02_missing_rea/truth/expected_exceptions_table.csv`)
* ☐ SP‑2.4A Survey extraction passes on `pack_01_clean` + `pack_03_mismatch_and_cert_gap` (cert gap issue code + citation). (ref: `docs/08-example-data/pack_03_mismatch_and_cert_gap/truth/expected_survey_issues.csv`)
* ☐ SP‑2.5 Reconciliation honesty policy is written + tested; `not_depicted` rule is safe (or cut to `depicted|unknown` and documented). (ref: SP‑2.5 in `.../spike-investigation.md`)
* ☐ SP‑2.6 Idempotency + snippet_hash stability passes, including negative test proving workflow continues and run can reach `completed` with one `citation_failed` row. (refs: SP‑2.6 in `.../spike-investigation.md`, hashing in `docs/03-architecture/30_data_model.md`, run invariants in `docs/03-architecture/20_state_model.md`)
* ☐ SP‑2.11 List verification semantics are pinned (policy doc committed) and consistent with fail-closed + immutable citations. (refs: ADR‑0001/0002 in `docs/03-architecture/DECISIONS.md`, plus `docs/03-architecture/30_data_model.md`)

**Explicit cuts / deferrals recorded**

* ☐ RH‑2.16 (human-in-loop ambiguity resolution) is marked **cut for v1** in brief + risk register; SP‑2.13 remains optional for later. (refs: RH‑2.16 in `.../risk-register.md`, SP‑2.13 in `.../spike-investigation.md`, brief non-goals in `.../brief.md`)

If you want, I can also draft the exact text blocks to paste into:

* `docs/03-architecture/30_data_model.md` (payload columns)
* `docs/03-architecture/50_api_surface.md` (payload fields in report rows)
* `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (the harness/comparator inserts)
