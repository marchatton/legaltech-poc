Yeah. And we can do it in a way that actually unblocks implementation, not just “fill the stubs with vibes”.

But I’m going to be blunt: there are **two types of spikes** in your 0002 dossier.

1. **Decision spikes** (we can answer right now by choosing the safest contract/policy and fixing drift).
2. **Proof spikes** that only close when you **run something and commit artefacts** (Recall@K numbers, parsing/matching results, idempotency proofs). I can’t magic the results without running your packs, but I can tell you **exactly what to implement** so those spikes become straightforward “run script → commit files → close risk”.

So yes. Here’s the bottom of it.

---

## The call: what to do first

Since you’re WDK-first: **treat 0004 as “must be clean + final” but tiny**, then go hard on 0002 spikes.

And the key insight from your own repo: you’re already *halfway* there. Your `POST /folders/:id/runs` route is already scheduling a WDK workflow (`startQuickStartTitleSurveyWorkflow`) and your step handler is writing rows. So 0004 is basically “finish the cutover properly and delete the corpse”, not a big migration.

So sequencing is effectively:

1. **Finish 0004 cleanup + doc drift** (1–2 tight PRs)
2. **Close 0002 “contracts + harness” spikes** (mostly code + docs, still no extraction magic)
3. **Implement the minimum deterministic extractors to make the remaining spikes pass** (pack_01/02/03 only)

---

## What we can “answer” right now (decisions you should lock)

### SP-2.7 Payload representation decision

**Answer: Option 4 is correct and already the only sane option.**
Keep structured payload in `report_rows.payload_json` with `payload_schema_version`, keep `answer` human-readable, keep provenance debug-only.

What’s blocking you isn’t the decision. It’s **drift**:

* `docs/.../list_payload_v0.schema.md` does **not** match `packages/core/src/schemas/list_payload_v0.ts`.
* Comparator spec implies `ExceptionItem.item_status` exists, code has it, doc doesn’t.

**Cut + fix:** make **the TS Zod schema canonical** and update the markdown spec to match it (or delete the markdown spec and generate it from Zod, but that’s optional).

Concrete doc fix (minimum):

* Update `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md` to include:

  * `exceptions_table_item.item_status: "needs_review" | "missing_input"`
  * the extra kind `survey_certification_parties` **or explicitly mark it as “reserved/unused by qs v1”**.

That closes RH-2.2 class drift.

### SP-2.11 List verification semantics

You need a policy that does **not** turn one weak item into a whole-row `citation_failed`, while staying fail-closed.

**Answer: choose “repair in draft, strict in verify”.**

* Draft step is allowed to *drop or downgrade* items that cannot be backed by citations.
* Verify step is integrity-only and dumb:

  * every remaining item must have `citation_ids.length > 0`
  * every `citation_id` must exist and match `snippet_hash` rules
  * geometry sanity if present (fixtures)
* If after repair you have **zero items** and you cannot honestly claim “none exist”, then row becomes `citation_failed` with reason `NO_CITATIONS` or `PARSE_FAIL` (not `missing_input`, because docs exist).

And define “material claim” simply:

* **If an item exists in the payload, it is a claim**. So it needs a citation.
* “Unknown” is allowed, but it still needs a citation to what triggered the uncertainty (eg the block you inspected).

This keeps you honest and avoids hand-wavy “unknown” with no evidence.

Update `list_verification_policy_v1.md` accordingly. Right now it still reads like a fork.

### SP-2.5 Reconciliation honesty policy

This is the one that can quietly destroy trust.

**Answer: cut `not_depicted` for v1.**
Only emit `depicted | unknown` (keep schema field but never output `not_depicted` yet).

Why: “not depicted” is a negative claim. In title/survey land it’s nearly always unsafe unless the survey literally states something like “no encroachments observed” in a clearly scoped way.

If you insist on keeping `not_depicted`, the hard rule must be:

* only allowed when there is an explicit statement of absence
* citation must point to that statement
* and the statement must be scoped to the relevant category (encroachments, easements shown, etc)

But I’d still cut it. Your own spike text says it’s ok to cut.

---

## What needs proof (but I can make it boring to prove)

### SP-2.1 Practitioner question set review

You can’t “oracle” a practitioner interview.

But you can still unblock implementation by reframing it:

* Freeze the current set (it’s only 9 questions, already under the <=25 cap).
* Record a doc: “v1 is an internal baseline, practitioner review pending, any changes bump `question_set_version`”.

Deliverable:

* Fill `spike-proofs/SP-2.1_practitioner_review.md` with:

  * “No practitioner review yet”
  * “We proceed with internal v1; revise with version bump after review”
  * list of intended questions for review (“would you add/remove any?”)

This is a pragmatic “accept risk” move. If you keep SP-2.1 as a hard GO gate, you’re blocked on scheduling a human.

### SP-2.8 Retrieval Recall@K

You need numbers. But the answer is: **measure it against anchors, and if it’s bad, don’t touch parsing yet.**

Practical pass criteria for pack_01_clean:

* Recall@10: target >= 0.80
* Recall@25: target >= 0.90

If Recall@25 is < 0.90, you patch retrieval or chunking before you do any parsing work.

What to implement to make this measurable:

* A script that:

  * reads `truth/golden_questions.json`
  * reads `layout/*.anchors.json`
  * runs your current retrieval for each question
  * checks if any retrieved chunk overlaps expected anchor page(s)
  * writes `spike-proofs/SP-2.8_pack_01_clean.result.json` (you don’t currently list a filename, but you should add one)

And: do **not** use anchors as input to retrieval. Anchors are for evaluation only.

### SP-2.6 Idempotency + snippet_hash stability

This is mostly engineering discipline, not AI.

You already have:

* deterministic step keys per question in the workflow
* `ON CONFLICT (run_id, question_id) DO NOTHING` in row insert
* run progress increments safely

What you need to do:

* define `snippet_hash` canonicalisation exactly once (whitespace normalisation etc)
* ensure citation snippets are generated deterministically
* provide a negative test hook that forces a mismatch

Proof artefacts you must produce (per spike doc):

* `SP-2.6_idempotency_pack_01.json`
* `SP-2.6_negative_test.json`

How to make it easy:

* Implement a script that runs the same pack twice with pinned versions, exports a “normalised snapshot” using the comparator’s `normalise_row_for_idempotency_v0()`, and diffs them.
* For negative test: have a debug flag that corrupts one citation snippet before verify, so verify emits `CITATION_MISMATCH` but workflow continues and run still reaches completed.

### SP-2.2A / SP-2.3A / SP-2.4A

These are the real meat. They aren’t “write a doc”, they are “build the first deterministic extractors”.

Here’s how you unblock them without boiling the ocean:

#### Baseline strategy that will actually pass spikes

* **Don’t use an LLM for parsing.** Not yet. You want deterministic diffs.
* Use text extraction you already have (`document_pages.text`).
* Start with pack_01_clean only.
* Parse only what truth expects (“key fields”), and explicitly cut the rest.

Minimum key fields you should commit to in comparator spec v0 (make it explicit):

* Requirements (B‑I): `bi_item`, `requirement`, `item_status`
  (cut or ignore `owner` if it turns out to be inferential)
* Exceptions (B‑II): `bii_item`, `type`, `instrument_no`, `recorded_date`, `doc`, `match_status`, `item_status`
* Survey: certification parties string for TS-05, and issue code for cert gap (in TS‑09)

And do not compare `risk_tags`, `parcel_scope`, defined terms chase, etc. That’s later spikes.

For citations:

* Until DB-backed citations for real uploads exist, it is acceptable to generate citations in snapshots using **fixture anchor geometry** *as the citation polygon*, as long as:

  * snippet text is still extracted from the underlying page text
  * snippet_hash is computed from that snippet deterministically
  * the system clearly marks it “fixture-citation geometry bridge”

That lets you produce proof artefacts now, without pretending you have OCR polygons on real uploads.

---

## The smallest deliverables that unblock implementation

If you do nothing else, ship these and you can start actually closing spikes by running commands.

### 1) Kill drift so everyone stops arguing with the repo

**Docs**

* Update `docs/03-architecture/07_current_poc_runtime.md`
  It should state Quick Start is WDK-owned (route schedules WDK steps) and treat the legacy jobs runtime as unused/pending removal.

* Reconcile `list_payload_v0` doc with `packages/core/src/schemas/list_payload_v0.ts`

* Standardise `question_set_version`:

  * Treat the hashed version from `loadQuestionSetV1()` as canonical
  * Update any fixture manifests that expect `qs:quick_start_title_survey:v1` (or allow pattern matching in fixtures)

**Code**

* Remove/disable legacy Quick Start jobs path:

  * stop creating `execute_run` jobs for Quick Start
  * remove handler for it or make it error loudly
  * delete jobs runtime unless another producer is explicitly needed

### 2) Add a spike runner that produces the required proof files

Add a script, something like:

* `scripts/spikes/run_0002.ts`

It should:

* accept `--pack pack_01_clean --spike SP-2.2A` etc
* seed/load the pack (reuse existing fixture tooling)
* run a Quick Start run (WDK worker loop or direct function call)
* export a snapshot JSON in the exact shape comparator expects
* run:

  * `scripts/fixtures/assert_row_invariants.ts`
  * `scripts/fixtures/compare_truth.ts`
* write artefacts to `docs/.../spike-proofs/` with the canonical filenames in the spike doc

Without this, you’ll never “close spikes” because there’s no conveyor belt.

### 3) Implement the “producer layer” the investigation report says is missing

Add a small module that returns “rows” for a given pack/run/question:

* `packages/core/src/quick_start/` (pure parsing + normalisers)
* `apps/web/lib/quick_start/` (DB + document access + building citations map)

Even if you only support pack_01_clean at first, that’s fine. That’s the point of spikes.

---

## Is it acceptable to close spikes using fixture layout/anchors first?

**Yes, but only under strict conditions.**

Acceptable:

* Anchors are used for **evaluation** (Recall@K checks, citation overlap checks).
* Anchors are used as a **temporary geometry bridge** to generate citation polygons in proof snapshots, because real OCR geometry isn’t in the runtime yet.

Not acceptable (that’s basically cheating):

* Using anchors to *find the answer* (eg “extract the requirement by reading the anchor label”). That invalidates the parsing/matching spikes.

So: fixture-first is fine for **proof harness + citation geometry**, not for **actual extraction logic**.

---

## The “do this now” plan (first 3 steps)

No fluff. Each step should end in committed files.

### Step 1: Close drift and make WDK truth official

Deliverables:

* Update `docs/03-architecture/07_current_poc_runtime.md` to match reality (Quick Start is WDK now)
* Update `list_payload_v0.schema.md` to match TS schema
* Decide canonical `question_set_version` string (hashed) and update fixtures/manifests accordingly
* Remove/disable legacy Quick Start jobs enqueue/worker path

Decision point:

* After this, there is only one story: Quick Start runs are WDK. No “maybe jobs” anywhere.

Safe cut if messy:

* If you can’t delete jobs yet, make it impossible for Quick Start to use it (hard error if execute_run is invoked).

### Step 2: Add spike runner + snapshot exporter

Deliverables:

* `scripts/spikes/run_0002.ts` (or similar)
* A snapshot exporter that emits exactly what `comparator_spec_v0.md` expects:

  * pinned versions
  * relevant report rows
  * citation materialisation map `{citation_id -> {document_filename,page_number,polygons,snippet_hash}}`
* Wire it to write:

  * `SP-2.2A_pack_01_clean.snapshot.json`
  * `SP-2.2A_pack_01_clean.result.json`
  * `SP-2.2A_pack_01_clean.diff.json`
    (even if they currently fail)

Decision point:

* Once this exists, “closing spikes” becomes repeatable. If you can’t generate the files, you’re not ready to implement anything else.

Safe cut:

* Use fixture anchor polygons as citation polygons for now, but keep snippet text/hash real.

### Step 3: Implement the smallest real extractor to get one spike passing

Start with SP‑2.2A on pack_01_clean.

Deliverables:

* Deterministic parser for:

  * Schedule B‑I requirements list
  * Schedule B‑II exceptions list
* It must populate `list_payload_v0` items with stable `item_id`s and citations
* Run spike runner and commit the three SP‑2.2A proof files

Decision point:

* If it’s too brittle, you cut the compared fields (update comparator spec) and keep going.
* If it’s working, move to SP‑2.3A (matching) next.

Safe cut:

* Do not do multi-parcel, defined terms chase, or risk_tags. Not yet.

---

## The safe cuts I’d lock right now

* No entailment verifier (already cut by ADR-0017).
* No not_depicted in v1 (depicted|unknown only).
* No human-in-the-loop ambiguity resolution (already cut).
* No multi-parcel scoping in v1 unless you’re explicitly working pack_04.
* No defined terms / exhibit chase (SP‑2.3C) until you have baseline passing on clean packs.
* No “owner” inference for requirements if it’s not explicit. If it’s inferential, cut it from comparator and treat as UI-only later.

---

If you want, I can go one level deeper and write the “spike runner” design as actual TS module boundaries (what functions exist, what they return, and how you serialise snapshot JSON). That’s the bit that turns spikes from scary to boring.
