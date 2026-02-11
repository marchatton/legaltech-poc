## 1) Prioritised findings (blockers first)

1. **Verification scope is drifting (integrity-only vs entailment), and RH4 artefacts are confusing**

   * **Where:**

     * `docs/04-projects/02-features/0001_trust-substrate/brief.md` (open Q: code checks vs entailment)
     * `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (RH4 spike reads like entailment)
     * `docs/03-architecture/20_state_model.md` (PoC v1 reason codes are integrity-only; entailment reserved)
     * `docs/04-projects/02-features/0001_trust-substrate/prds/0001e_row-status-export-failures/prd.json` (mentions “UNSURE entailment verdict”)
     * `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json` (“bad_semantic_*” cases are semantic mismatches but `expected: "pass"`)
   * **Why it blocks a coding agent:** they won’t know whether to build (a) deterministic integrity checks only, or (b) an entailment verifier. And RH4 can’t be “PASS/FAIL measurable” if the dataset labelling reads like a lie.
   * **Fix:** pin PoC v1 verification to **integrity/invariant checks only**, and explicitly label semantic mismatch as a **known limitation** (or move it to a future spike).

2. **`document_id` meaning is inconsistent across fixtures vs contracts**

   * **Where:**

     * API contract examples: `docs/03-architecture/50_api_surface.md` and PRDs use `document_id: "doc_123"`
     * RH4 dataset uses `document_id: "TitleCommitment.pdf"` / `"ALTA_Survey.pdf"`: `fixtures/rh4_verification_cases.json`
   * **Why it blocks:** it breaks the mental model for the whole trust substrate. The viewer/citations API assumes `document_id` is a stable internal identifier, not a filename. A coding agent will either implement the wrong schema or add ad-hoc mapping glue everywhere.
   * **Fix:** define a single rule: **`document_id` is the Document record id**. If you want filenames in fixtures, add a separate field (or seed deterministic document ids derived from filename, but still shaped like ids).

3. **ReportRow ↔ Citation relationship is inconsistent with the canonical data model**

   * **Where:**

     * Canonical: `docs/03-architecture/30_data_model.md` says `citations.report_row_id -> report_rows.id` and relies on it for invariants
     * PRDs list `report_rows.citation_ids[]` as a field (overall + slices): `prd-overall.json`, `0001d/0001e/*.json`
   * **Why it blocks:** if a coding agent follows PRDs literally, they might add a `citation_ids[]` array column and skip `citations.report_row_id`, which makes integrity constraints and invariants hard or impossible to enforce.
   * **Fix:** keep the DB model canonical (`citations.report_row_id`). Treat `citation_ids[]` as **API/DTO shape derived via join**, not DB schema.

4. **No single “fixture seeding contract” is documented, but almost every AC assumes it**

   * **Where:**

     * `brief.md`, `breadboard-pack.md`, `prd-overall.json`, slice PRDs (acceptance criteria reference seeded rows/citations on packs)
   * **Why it blocks:** a coding agent can’t reproduce “pack_01_clean click-to-highlight” if there isn’t an explicit, deterministic way to get:

     * a Folder/Matter
     * Documents ingested or at least available to viewer
     * Report rows present
     * Citations present with known ids and polygons
   * **Fix:** document one canonical entrypoint (dev-only) to seed a pack into a matter (CLI or route handler), including stable IDs.

5. **ID format validation is required by acceptance criteria, but id formats aren’t defined**

   * **Where:**

     * `0001c` AC says invalid id format ⇒ `VALIDATION_ERROR`
     * Across docs you use example prefixes (`fld_`, `doc_`, `cit_`, `run_`) but there is no explicit rule
   * **Why it blocks:** you can’t implement Zod boundary validation consistently if “valid id” is undefined.
   * **Fix:** either (A) define a strict id pattern (recommended), or (B) remove “invalid id format” as a distinct behaviour and treat as NOT_FOUND.

6. **RH2 “100% zoom only” is stated as decided in one place, but not consistently reflected**

   * **Where:**

     * `docs/04-projects/02-features/0001_trust-substrate/prd-overall.md` (says it’s decided)
     * `risk-register.md` + `spike-investigation.md` still treat it as fallback/cut
     * `0001d` PRD AC still asks for 50/100/150 or cut
   * **Why it blocks:** agent won’t know whether to implement full zoom invariance or ship the 100%-only cut immediately.
   * **Fix:** reword as “pre-approved cut” not “final decision”, or fully commit to 100%-only and update success criteria accordingly.

7. **Feature flag story is muddled**

   * **Where:**

     * Overall PRD mentions `FEATURE_TRUST_SUBSTRATE`
     * Slices introduce `FEATURE_MATTERS`, `FEATURE_PDF_VIEWER`, `FEATURE_CITATIONS_API`, `FEATURE_CITATION_HIGHLIGHTS`, `FEATURE_EXPORTS`, `FEATURE_TRACE_EXPORT`
   * **Why it blocks:** the coding agent can implement gating in incompatible ways.
   * **Fix:** define flag precedence in one place (top-level umbrella flag vs per-slice flags).

8. **0001e requires “Mark reviewed” and “Flag citation wrong” but doesn’t specify mutation contracts**

   * **Where:**

     * `0001e_row-status-export-failures/prd.json` stories/acceptance criteria
   * **Why it blocks:** persistence requires either API routes or server actions. Not specifying means agent invents endpoints and breaks consistency with your API surface conventions.
   * **Fix:** add a minimal mutation contract (even if dev-only initially) and define error envelopes and reason codes.

9. **RH1 harness measurement: “maxLongTaskMs” + cancellation rate aren’t concretely defined**

   * **Where:** `spike-investigation.md` + `0001b_pdf-viewer/prd.json`
   * **Why it blocks:** the spike can’t actually be closed cleanly. Numbers become vibes.
   * **Fix:** define measurement method (PerformanceObserver longtask) and cancellation counting rules, and output JSON schema for spike-proofs.

---

## 2) Suggested document/PRD edits (minimally invasive, patch-style)

### A) Pin verification v1 scope and de-confuse RH4

**1) `docs/04-projects/02-features/0001_trust-substrate/brief.md`**
Make verification decision explicit so it doesn’t read like an open design fork.

```diff
 ## Open questions
-- Appetite/timebox: are we shaping the full trust substrate perimeter above, or do we want to cut to “trust moment only” (viewer + click-to-highlight) first?
-- Storage access pattern for pdf.js: signed URLs vs proxy endpoint?
-- Verification v1: code checks only, or include an entailment model from day one?
-- Minimum trace schema: what is required vs nice-to-have?
+- Appetite/timebox: DECIDED: cut to the trust moment first (viewer + click-to-highlight), then expand once spikes close.
+- Storage access pattern for pdf.js: DECIDED: signed render URLs via `GET /documents/:id/render?page=N` (Range support required).
+- Verification v1: DECIDED (PoC v1): deterministic integrity/invariant checks only (no entailment). Semantic correctness is reviewer-owned for now.
+- Minimum trace schema: defined by slice 0001f; keep safe-by-default (IDs + hashes, no raw PDF bytes, avoid full doc text).
```

**2) `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` RH4**
Rewrite RH4 to match “integrity-only” and keep it measurable.

```diff
 ## Spike plan — Verification precision (false passes)

 ### Question
-Can we achieve zero false passes on 20 hand-curated bad examples at acceptable latency?
+Can the deterministic integrity/invariant verifier produce zero false passes on a curated integrity-failure set?

 ### Success criteria
 Proof looks like:
-- 0 false passes on curated bad set (N>=20). `UNSURE` counts as `FAIL` (precision-first).
-- Latency budget: `p95 <= 8s` per row on dev machine (record p50/p95/max).
+- 0 false passes on curated integrity-failure set (N>=20). (PoC v1: no entailment model, so no `UNSURE` state.)
+- Latency budget: `p95 <= 250ms` per row on dev machine for integrity checks (record p50/p95/max).
 - Dataset location: `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json`
```

And add one clarifying paragraph under RH4 “Scope”:

```diff
 ### Scope
 Include:
-- Small curated dataset across packs
-- One verification prompt + rubric
+- Deterministic integrity checks:
+  - snippet_hash matches snippet (canonical normalise + sha256)
+  - citation polygons valid (non-empty, all points in [0..1])
+  - page_number in bounds when page_count known
+  - missing_input invariant enforced
+  - no-citation invariant enforced for non-missing_input answers
 Exclude:
-- Full UI integration
+- Any entailment/semantic verification (explicitly out of scope for PoC v1)
```

**3) `docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json`**
Two minimal changes:

* Add 5 integrity-failure cases for invalid polygons so RH4 can honestly claim N>=20 bad integrity examples.
* Re-label the semantic mismatch cases so they don’t read like failures that are expected to pass.

Patch concept (illustrative, not full file dump):

```diff
   {
-    "case_id": "bad_semantic_01",
+    "case_id": "known_limitation_semantic_mismatch_01",
     "question_id": "TS-01",
     "question": "Who is the Proposed Insured?",
     "answer": "ACME Holdings LLC",
     "citations": [
       {
-        "document_id": "TitleCommitment.pdf",
+        "document_id": "doc_title_commitment",
         "page_number": 1,
         "polygons": [[[0.1, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]],
         "snippet": "Proposed Insured: 18W18 Acquisition LLC",
         "snippet_hash": "sha256:5b5c20cf0e7881d25896ed50d7591f527f82790a087d2ae07cd41f00d3d9ed0d"
       }
     ],
-    "expected": "pass"
+    "expected": "pass",
+    "note": "Known limitation: PoC v1 verifier does not check entailment/semantic correctness."
   }
```

And add new cases like:

```json
{
  "case_id": "bad_polygon_01",
  "question_id": "TS-01",
  "question": "Who is the Proposed Insured?",
  "answer": "18W18 Acquisition LLC",
  "citations": [
    {
      "document_id": "doc_title_commitment",
      "page_number": 1,
      "polygons": [[[1.2, 0.2], [0.4, 0.2], [0.4, 0.25], [0.1, 0.25]]],
      "snippet": "Proposed Insured: 18W18 Acquisition LLC",
      "snippet_hash": "sha256:5b5c20cf0e7881d25896ed50d7591f527f82790a087d2ae07cd41f00d3d9ed0d"
    }
  ],
  "expected": "fail",
  "expected_reason_code": "VALIDATION_ERROR"
}
```

### B) Fix identity + schema drift (document_id + citation linkage)

**4) Define deterministic fixture IDs**
This can be done purely as documentation, but it needs to be written down once.

Add a short “Fixture identity rules” section in `breadboard-pack.md` (or `brief.md`, but breadboard is closer to wiring).

```diff
 ## Proposed solution
+### Fixture identity rules (to keep packs deterministic)
+- `folder_id`: `fld_<pack_slug>` (example: `fld_pack_01_clean`)
+- `document_id`: `doc_<slugified_filename_without_ext>` (example: `doc_title_commitment`)
+- `citation_id`: `cit_<anchor_id>` (example: `cit_SCHED_A_PROPOSED_INSURED`)
+- `run_id`: `run_<pack_slug>_seed_01`
+These ids are dev-only deterministic ids used for fixture seeding and spike harnesses.
```

And then update RH4 dataset `document_id` values to match, as shown above.

**5) Align PRDs to the canonical DB relationship (citations.report_row_id)**
This is “JSON PRD correctness” territory.

Minimal edits (do not change the intended API shape, just stop implying a DB array column).

* `docs/04-projects/02-features/0001_trust-substrate/prd-overall.json`

  * In `dataModel` for `ReportRow`, replace `"citation_ids[]"` with an explicit derived note.
* Same in `prds/0001e_row-status-export-failures/prd.json`.

Example patch fragment:

```diff
   {
     "entity": "ReportRow",
     "fields": [
       "id",
       "folder_id",
       "run_id",
       "question_id",
       "answer",
       "status (needs_review|reviewed|missing_input|citation_failed)",
-      "citation_ids[]",
+      "citations (DB: via citations.report_row_id; API may expose citation_ids[])",
       "provenance_json / notes (missing-doc checklist, reason codes)"
     ]
   }
```

And in `prds/0001c_citations-api-locking/prd.json`, add the missing internal foreign key field so it matches `docs/03-architecture/30_data_model.md`:

```diff
   {
     "entity": "Citation",
     "fields": [
       "id",
+      "report_row_id (FK; internal, not returned by GET /citations/:id)",
       "document_id",
       "page_number",
       "polygons",
       "snippet",
       "snippet_hash",
       "index_version",
       "chunk_id (optional)",
       "created_at"
     ]
   }
```

### C) Make RH2 decision consistent and reduce accidental scope

**6) `docs/04-projects/02-features/0001_trust-substrate/prd-overall.md`**
Reword the “DECIDED” line so it reads like an agreed fallback, not a contradictory instruction.

```diff
-- DECIDED: RH2 regression proof is artifact-based (screenshots + bbox/HUD logs) with manual review; overlay is "verified at 100% zoom only" (ADR-0020).
+DECIDED: RH2 regression proof is artifact-based (screenshots + bbox/HUD logs) with manual review.
+Pre-approved cut: if 50/150% zoom invariance is not proven quickly, enforce "highlight verified at 100% zoom only" when a citation is active.
```

And mirror that same idea in `prds/0001d_citation-chip-highlight/prd.json` by tightening AC-004 wording so it’s obvious what to ship if RH2 is hard:

```diff
- "AC-004: Highlight remains aligned at 50/100/150% zoom ... (or an explicit cut is enforced: highlights verified at 100% only).",
+ "AC-004: Either (A) highlight remains aligned at 50/100/150% zoom ... OR (B) enforce the honest cut: when a citation is active, lock to 100% zoom and show 'Highlight verified at 100% only'.",
```

### D) Make the PRDs executable: add the missing glue contracts

**7) Add explicit “fixture seed” entrypoint**
Put it in one place in the PRDs so an agent knows how to reproduce results.

* Add to `prd-overall.json` routes:

```diff
   "routes": [
+    {
+      "path": "/spikes/seed-pack",
+      "name": "Seed Fixture Pack (Dev-Only)",
+      "purpose": "Create a matter + seed docs/rows/citations for a named pack (deterministic IDs) so spike harnesses and demos are reproducible."
+    },
```

And add a rule to keep it safe:

* dev-only gated (NODE_ENV === development)
* never exposes signed URLs in logs
* returns ids and a summary only

**8) Add explicit mutation contract(s) for 0001e**
Update `prds/0001e_row-status-export-failures/prd.json` routes with two endpoints (or state clearly it’s implemented as Next.js server actions, but pick one).

```diff
   "routes": [
     {
       "path": "/matters/:folderId",
       "name": "Matter Detail",
       "purpose": "Render report table with status badges, missing-doc checklist, and export button with gating reasons."
     },
+    {
+      "path": "/report_rows/:id/reviewed",
+      "name": "Mark Row Reviewed API",
+      "purpose": "Persist needs_review -> reviewed transition (explicit user action only)."
+    },
     {
       "path": "/export/csv",
       "name": "CSV Export API",
       "purpose": "Server-enforced export gating: block when any row is citation_failed unless an explicit demo-only unsafe override is enabled."
     }
   ],
```

And add the “Flag citation wrong” endpoint (even if it just logs for now):

```diff
+    {
+      "path": "/feedback/citation",
+      "name": "Flag Citation Wrong API",
+      "purpose": "Record a safe feedback event {citation_id, reason_code, optional note} with trace_id."
+    }
```

**9) Tighten ID validation requirement**
Pick one approach and reflect it consistently.

Option A (preferred): add a rule in each PRD that mentions id format validation. Example for `0001c`:

```diff
   "rules": [
+    "ID format: citation ids must match /^cit_[a-z0-9_\\-]+$/ (lowercase; deterministic fixture ids allowed).",
     "Citations are immutable after insert; fixing a citation creates a new citation and updates the owning row to reference the new id.",
```

Option B (less strict, but removes ambiguity): change acceptance criteria to not require format validation. Example for `US-001` in `0001c`:

```diff
- "Negative case: Invalid id format returns VALIDATION_ERROR using the standard error envelope."
+ "Negative case: Unknown or invalid citation id returns 404 NOT_FOUND using the standard error envelope."
```

### E) RH1 harness measurability

**10) Define “maxLongTaskMs” and cancellation rate in `spike-investigation.md` RH1**
Minimal addition:

```diff
 ### Success criteria
 Proof looks like:
 ...
 - Spam test (N=30 @ 200ms): viewer remains responsive (no visible freezes; max long task < 250ms) ...
+
+Measurement notes:
+- maxLongTaskMs: captured via `PerformanceObserver` for `longtask` entries; record the max `entry.duration`.
+- cancellation rate: `cancelledRenders / requestedRenders` where a render is "cancelled" if a previous in-flight `renderTask.cancel()` is called due to navigation before it resolves.
```

---

## 3) Final implementation checklist (safe, reproducible, agent-friendly)

### Pre-flight alignment (do this before writing feature code)

* [ ] **Pin PoC v1 verifier scope** in docs: integrity/invariant checks only, no entailment. Update RH4 plan + dataset labels accordingly.
* [ ] **Define deterministic fixture identity rules** (folder_id/document_id/citation_id/run_id) and use them consistently in:

  * seed logic
  * RH4 dataset
  * spike harnesses
* [ ] **Clarify ReportRow ↔ Citation DB model**: use `citations.report_row_id` as canonical; treat `citation_ids[]` as derived API shape only.
* [ ] **Decide id validation approach** (strict prefix regex vs treat unknown as NOT_FOUND) and apply it across all endpoints in PRDs.
* [ ] **Write down feature flag precedence**: either one umbrella flag or a table mapping umbrella → slice flags.

### Shared “core” utilities (these unblock multiple slices)

* [ ] Implement in `packages/core` (single source of truth):

  * [ ] `normaliseSnippet(snippet: string): string` (trim; CRLF→LF; collapse whitespace runs incl newlines/tabs to single space)
  * [ ] `hashSnippet(snippet: string): "sha256:<lowercase_hex>"`
  * [ ] `validateCitationPolygons(polygons)` (non-empty; points in [0..1]; no NaN)
  * [ ] Overlay mapping util per oracle guidance (norm → viewBox → `convertToViewportPoint`) as a pure function
* [ ] Implement a shared **safe error envelope** helper (server-only), matching `docs/03-architecture/50_api_surface.md`:

  * `error.code`, `error.message`, optional `details`, optional `trace_id`
* [ ] Ensure **trace_id propagation** exists on all API handlers (generated per request and returned in error envelope).

### 0001a Matter + Documents (foundation)

* [ ] DB migrations for `folders`, `documents`, `document_pages` consistent with state model and `30_data_model.md`.
* [ ] Implement APIs:

  * [ ] `POST /folders` (creates folder in `empty`)
  * [ ] `GET /folders` and `GET /folders/:id`
  * [ ] `POST /folders/:id/documents` (returns upload target + document record)
  * [ ] `POST /documents/:id/complete` (enqueues ingest, transitions statuses)
  * [ ] `GET /folders/:id/documents` (includes parse_status, ocr_status, page_count, extraction_quality, safe error_json)
* [ ] UI routes:

  * [ ] `/matters` list + create
  * [ ] `/matters/:folderId` detail with upload + doc list
* [ ] Safety checks:

  * [ ] Never leak provider payloads/stack traces to clients
  * [ ] Never log signed URLs or admin tokens

### Fixture seeding (this is the “make it executable” glue)

* [ ] Implement **dev-only** `/spikes/seed-pack` (or CLI) that:

  * [ ] creates a folder with deterministic `folder_id`
  * [ ] registers documents with deterministic `document_id` derived from filenames
  * [ ] seeds report rows + citations for pack_01 (and later pack_02/pack_07)
  * [ ] returns a small summary payload (ids only, no signed URLs, no raw text dumps)
* [ ] Document how to run it in the trust substrate docs (one canonical command/URL).

### RH1 + 0001b PDF viewer

* [ ] Implement `GET /documents/:id/render?page=N` that returns a signed URL to the whole PDF.
* [ ] Verify the signed URL supports Range requests (Accept-Ranges and 206 responses).
* [ ] Build `/viewer/:documentId` (server component fetches render_url server-first; client component renders pdf.js).
* [ ] Build `/spikes/rh1-pdf-perf` harness:

  * [ ] serial + spam tests
  * [ ] record `totalMs` per request, cancellation counts, and maxLongTaskMs via PerformanceObserver
  * [ ] output JSON into `docs/.../spike-proofs/` with deterministic ordering

### RH3 + 0001c Citations API

* [ ] Add `citations` table per `30_data_model.md` (immutable; includes report_row_id, document_id, page_number, polygons, snippet, snippet_hash, index_version).
* [ ] Implement `GET /citations/:id` returning `{id, document_id, page_number, polygons, snippet, snippet_hash}`.
* [ ] Implement RH3 harness that proves stable snippet hashing across repeated runs.
* [ ] Add an integrity self-check: recompute hash from snippet and compare to stored snippet_hash (used by verifier and viewer fail-closed path).

### RH2 + 0001d click-to-highlight

* [ ] Implement RH2 spike harness `/spikes/rh2-overlay` with:

  * pack/doc/page/anchor controls
  * debug HUD showing scale, totalRotation, viewport dims, canvas CSS vs backing dims, DPR
  * bbox log and screenshots at 100% (plus 50/150 if attempting invariance)
* [ ] Implement fail-closed overlay:

  * no overlay when invariants fail
  * explicit user-visible failure panel (safe reason code)
* [ ] If zoom invariance is not proven quickly, enforce the approved cut:

  * when citation active, lock to 100% zoom and message it plainly

### RH5 + 0001e statuses, export gate, failure journeys

* [ ] Implement row status machine and invariants:

  * [ ] missing_input answer must be exactly `Not found in provided documents.` and must have zero citations
  * [ ] needs_review/reviewed must have ≥1 locked citation
  * [ ] citation_failed stores safe reason_code (CITATION_MISMATCH, NO_CITATIONS, VALIDATION_ERROR, etc)
* [ ] Implement export gate in `POST /export/csv`:

  * [ ] require `runs.state = completed` else `CONFLICT`
  * [ ] block when any row is citation_failed ⇒ `EXPORT_BLOCKED`
  * [ ] unsafe_override guarded behind DEMO_MODE + ALLOW_UNSAFE_EXPORTS + admin token
* [ ] Implement mutation contracts:

  * [ ] mark reviewed endpoint or server action (needs_review → reviewed only)
  * [ ] flag citation wrong endpoint (logs/stores safe feedback event)
* [ ] Implement RH5 harness for missing-doc heuristics (FP=0 on pack_01, flags REA.pdf in pack_02).

### 0001f provenance + trace export

* [ ] Implement `GET /runs/:id/trace` admin-token gated:

  * includes run metadata, run_steps, per-row provenance (ids + hashes, no raw PDFs, avoid full doc text)
  * errors return standard envelope with trace_id
* [ ] Ensure signed download URLs are never persisted, only storage_key.

### Final invariants + regression checks

* [ ] Run SQL invariant checks from `docs/03-architecture/20_state_model.md` (1:1 run/question, missing_input exact string + no citations, completed runs have only terminal statuses).
* [ ] `pnpm verify` and `pnpm typecheck` for each slice.
* [ ] Store spike proof artefacts under `spike-proofs/` with stable naming and deterministic ordering.
* [ ] Update `risk-register.md` statuses (PASS/FAIL/Cut/Patch) and link to proof artefacts.

If you implement the fixes in sections A–D above, the packet becomes much more “agent-executable” without changing the product intent. And you’ll stop tripping over identity and verification semantics at the exact moment you’re trying to prove trust.
