# 0002 Quick Start Engine: Where It’s Stuck + What You Need To Answer (Copy/Paste)

Source-of-truth pointers:
- Consolidated PRD + story list: `docs/04-projects/02-features/0002_quick-start-engine/prd.json`
- GO/NO-GO checklist: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Risk register (what’s still open): `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
- Spike instructions + report stubs: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Proof artefacts folder: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`

Current state (as of PRD date 2026-02-08):
- `prd.json` metadata is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are `status: open`.
- Most gating spikes are still marked `open` in `risk-register.md`.
- Only “docs-level” proof artefacts exist so far (not fixture-verifiable spike outputs).

---

## 1) Which Stories Are Stuck (And Why)

Story list (from `docs/04-projects/02-features/0002_quick-start-engine/prd.json`):
- `US-001` (Slice 0002a Run skeleton): blocked on closing SP-2.1 + SP-2.6 (and likely SP-2.12 if scan packs are in play).
- `US-002` (Slice 0002b Row payload + rendering): blocked on SP-2.7 + SP-2.11 (and SP-2.1).
- `US-003` (Slice 0002c Commitment parsing): blocked on SP-2.8 + SP-2.2A (and depends on `US-002`).
- `US-004` (Slice 0002d Exception matching): blocked on SP-2.3A (and depends on `US-003`).
- `US-005` (Slice 0002e Survey extraction): blocked on SP-2.4A (and depends on `US-002`).
- `US-006` (Slice 0002f Reconciliation honesty): blocked on SP-2.5 (and depends on `US-004` + `US-005`).

Why they’re stuck:
- The dossier defines explicit spike gates as NO-GO blockers in `brief.md` and `plan.md`.
- The risk register entries that correspond to those spike gates are still `open` in `risk-register.md`.
- The required fixture-verifiable proof artefacts (snapshots/diffs/results) have not been committed under `spike-proofs/`.

---

## 2) The Open Questions You Need To Answer (From PRD)

These are literally listed under `openQuestions` in `docs/04-projects/02-features/0002_quick-start-engine/prd.json` and map to spikes:

1. Payload representation decision (SP-2.7)
   - Question: where does the structured list payload live, and how does the API expose it (so UI renders tables without prose parsing)?
   - Where to answer:
     - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.7)
     - Decision note (already exists): `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`
     - Schema contract: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
     - Architecture docs (must align): `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`
   - What you still need to “close”:
     - Confirm Option 4 is final, and update `risk-register.md` RH-2.2 from `open` -> `closed` (or explicitly justify why it stays open).
     - Ensure `list_verification_policy_v1.md` isn’t contradicting the chosen payload (it currently says partial-failure policy is pending SP-2.11).

2. Retrieval Recall@K baseline (SP-2.8)
   - Question: are we retrieving the right evidence *before* blaming parsing/matching?
   - Where to answer:
     - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.8)
     - Inputs: `docs/08-example-data/pack_01_clean/truth/golden_questions.json`, `docs/08-example-data/pack_01_clean/layout/*.anchors.json`
   - What you must produce:
     - A written Recall@10 + Recall@25 result + a misses log (add to `spike-proofs/` or fill the report stub with links).
     - A decision: “patch retrieval” vs “accept baseline and move on”.

3. Scan torture honesty policy
   - Question: when do we downgrade to `missing_input` vs emit item-level `unknown` safely?
   - Where to answer:
     - Title parsing scan gate: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.2C)
     - Survey scan gate: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.4B)
     - Reconciliation honesty: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.5)
   - What you must decide/record:
     - The single threshold rule that flips (extract with 0 false positives + citations) vs (emit `missing_input` + remediation checklist).
     - Whether `not_depicted` is safe at all; if not, cut v1 to `depicted|unknown` (SP-2.5 allows this cut, but it must be written down).

4. Human-in-the-loop ambiguity resolution (v1 cut; future semantics)
   - Question: if later allowed, how do we re-verify without mutating immutable citations?
   - Where to answer:
     - The v1 cut note: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/RH-2.16_cut_note.md`
     - Optional spike if you un-cut: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.13)
   - What you need to confirm:
     - For v1: keep it cut (no “choose correct doc” flow). If you change this, you must pick a concrete mechanism (SP-2.13) and update PRDs accordingly.

---

## 3) The Concrete “Answers” Required To Flip From NO-GO -> GO

This is the practical checklist in `docs/04-projects/02-features/0002_quick-start-engine/brief.md` (“GO when all must be true”).
Below is the same list with direct file pointers and the exact outputs expected.

### A) Contracts Frozen (must be true)

- [ ] SP-2.1 Question set v1 is frozen and practitioner-reviewed
  - Files:
    - Question set: `docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json`
    - Practitioner review writeup: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.1_practitioner_review.md`
    - Spike plan + report stub to fill: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.1)
  - You must answer:
    - Who reviewed it, in what context?
    - What `question_set_version` string will runs pin?
    - Biggest gaps + biggest cuts to keep `<=25` questions?

- [ ] SP-2.7 Payload storage decision is locked (Option 4) and architecture docs match
  - Files:
    - Decision: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/SP-2.7_decision.md`
    - Schema: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
    - Architecture: `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`
  - You must answer:
    - Are we *still* choosing Option 4, and if yes, are the API + DB contracts written down and consistent everywhere?

- [ ] Comparator spec is the single source and spikes reference it
  - File: `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`
  - You must answer:
    - What normalisation rules are in v0 (instrument refs, dates, item numbering)?
    - If you change rules, did you update this spec first (so spikes don’t drift)?

### B) Fixture-Verifiable Spikes Passed (proof artefacts committed)

Note: spike expectations and exact proof artefact filenames are in `spike-investigation.md`.

- [ ] SP-2.8 Retrieval Recall@K measured + decision recorded
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.8)
  - Inputs:
    - `docs/08-example-data/pack_01_clean/truth/golden_questions.json`
    - `docs/08-example-data/pack_01_clean/layout/*.anchors.json`
  - You must answer:
    - Recall@10? Recall@25?
    - What are the misses and why (doc/page)?
    - Patch retrieval now, or accept baseline?

- [ ] SP-2.2A Commitment parsing baseline passes on `pack_01_clean`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.2A)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.2A_pack_01_clean.snapshot.json`
    - `SP-2.2A_pack_01_clean.result.json`
    - `SP-2.2A_pack_01_clean.diff.json`
  - You must answer:
    - Did B-I + B-II match truth key fields with 0 false positives?
    - What normalisation decisions were required (and where are they specified)?

- [ ] SP-2.3A Exception matching baseline passes on `pack_01_clean` + missing-doc journey passes on `pack_02_missing_rea`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.3A)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.3A_pack_01_02_matching.snapshot.json`
    - `SP-2.3A_pack_01_02_matching.result.json`
  - You must answer:
    - Is there any silent auto-pick? (must be “no”)
    - Is missing REA expressed as item-level `match_status: missing_doc` with checklist that includes `REA.pdf`?

- [ ] SP-2.4A Survey extraction baseline passes on `pack_01_clean` + `pack_03_mismatch_and_cert_gap`
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.4A)
  - You must answer:
    - What issue codes are emitted (e.g. `CERT_MISSING_LENDER`)?
    - Are all extracted parties/callouts backed by lockable citations (no fabrication)?

- [ ] SP-2.5 Reconciliation honesty policy is written + tested (and safe)
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.5)
  - You must answer:
    - What is the hard rule for `not_depicted` (positive evidence of absence), exactly?
    - If that rule is not safe, did you cut v1 to `depicted|unknown` and document it?

- [ ] SP-2.6 Idempotency + snippet_hash stability passes (including negative test)
  - Where: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.6)
  - You must produce (commit to `spike-proofs/`):
    - `SP-2.6_idempotency_pack_01.json`
    - `SP-2.6_negative_test.json`
  - You must answer:
    - Are two runs with pinned versions byte-identical after normalisation (except IDs/timestamps)?
    - Does the workflow continue after a forced `citation_failed` row and still reach `completed`?

- [ ] SP-2.11 List verification semantics are pinned and consistent with fail-closed + immutable citations
  - Where:
    - Spike plan/stub: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` (SP-2.11)
    - Policy doc to update: `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`
  - You must answer:
    - What is the unit of verification (item-level integrity, not just row shell)?
    - What happens on partial failures: strict fail row vs repair/downgrade?
    - If repair is allowed: where does repair happen (draft vs verify) and how do citations remain immutable?

---

## 4) Where To Record “Done” (So The Dossier Stops Being Perma-NO-GO)

When you close a gate/spike, update these in lockstep:
- Fill the spike report stub section in `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`.
- Add/commit the proof artefacts under `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`.
- Flip the corresponding risk row(s) in `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` from `open` -> `closed` (or explicitly justify why it stays open).
- Check the box in `docs/04-projects/02-features/0002_quick-start-engine/brief.md` under “GO when”.

Optional (but helpful):
- Add short links to proof artefacts in `docs/04-projects/02-features/0002_quick-start-engine/plan.md` under the relevant gate rows.

---

## 5) Copy/Paste Status Update (Short Version)

0002 Quick Start Engine is currently NO-GO by design: `prd.json` is `Draft (NO-GO until key spikes close)` and all stories `US-001..US-006` are still `open`.

What’s blocking “GO” is not implementation work; it’s closing the gating spikes with committed proofs:
- SP-2.1 (practitioner question set freeze + `question_set_version`)
- SP-2.8 (retrieval Recall@K baseline + decision)
- SP-2.2A (commitment parsing baseline vs truth on pack_01_clean)
- SP-2.3A (exception matching baseline + missing REA journey on pack_02_missing_rea)
- SP-2.4A (survey extraction baseline + cert gap issue code on pack_03)
- SP-2.5 (reconciliation honesty rules; `not_depicted` safety or cut)
- SP-2.6 (run idempotency + snippet_hash stability + negative test)
- SP-2.11 (list verification semantics: strict vs repair; pinned policy doc)

Pointers:
- GO checklist: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
- Spike plans + required proof filenames: `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- Proof folder: `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/`

