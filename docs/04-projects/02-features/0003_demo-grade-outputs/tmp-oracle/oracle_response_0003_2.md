## 1) Findings (ordered by severity)

### 1. Export API contract can’t support the stated UX (3 CSV buttons + optional override)

**What’s wrong**

* `POST /export/csv` in `docs/03-architecture/50_api_surface.md` has no way to specify *which* CSV (`requirements_tracker` vs `exceptions_table` vs `survey_issues`).
* `docs/03-architecture/20_state_model.md` says “unless an explicit override flag is provided”, but the API surface doesn’t define that flag.
* Breadboard N1 implies `{artefact, download_url}` while the API surface nests `download_url` inside `artefact`.

**Why it matters**
You can’t implement U2 (3 CSV buttons) without either inventing new endpoints or inventing new request fields. And the override path is currently a ghost contract, which is exactly how trust gates get bypassed accidentally.

**Concrete patch**

* Patch **`docs/03-architecture/50_api_surface.md`** (Export section) to make the request explicit and minimal, without adding endpoints:

  * `POST /export/csv` request becomes:

    * `{ "folder_id": "...", "run_id": "...", "kind": "requirements_tracker" | "exceptions_table" | "survey_issues", "unsafe_override": false | true }`
  * `POST /export/docx` request becomes:

    * `{ "folder_id": "...", "run_id": "...", "kind": "memo", "unsafe_override": false | true }` (if you truly keep one template, `kind` can be optional, but I’d still include it for future-proofing)
  * Define that `unsafe_override` is **ignored / rejected** unless demo mode is enabled (see Finding 3).
  * Align the response shape with the API doc: `download_url` lives under `artefact`.
* Patch **`docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`** N1 row to match the canonical response shape.

---

### 2. The export mappers don’t have a defined “source of truth” shape (risk of brittle parsing)

**What’s wrong**
The shaping packet assumes you can “map row sets to stable CSV schemas” (F2/N3), but the canonical data model only guarantees:

* `report_rows.answer` is a string
* `report_rows.provenance_json` exists but is not specified as an export payload
* `GET /folders/:id/report` returns rows with `answer` + `citation_ids` only

For `exceptions_table` and `requirements_tracker`, “lawyer-usable CSV” usually implies structured fields (instrument ref, recording info, requirement type, etc). If those aren’t already persisted by Initiative 2 in a structured way, Initiative 3 either:

* parses prose back into structure (brittle, contaminates workflow logic), or
* ships weak CSVs that will fail RH1 immediately.

**Why it matters**
This is the highest-probability hidden rework loop: exports look “easy” until you realise you’re missing structured data, then you end up rewriting Initiative 2 outputs to unblock Initiative 3.

**Concrete patch**

* Patch **`docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`** (Constraints/dependencies + Open questions) to add a load-bearing dependency:

  * “Initiative 2 must persist structured export payloads for the 3 artefacts (validated by Zod) in a stable location (recommended: `report_rows.provenance_json.export_payload` with a `schema_version`), so Initiative 3 exports are deterministic and do not parse prose.”
* Patch **`docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`** Parts F2/N3 to state explicitly what N3 consumes:

  * “N3 consumes `export_payload` (not `answer` prose) and fails closed if missing.”

If you can’t guarantee structured payloads, then the honest perimeter cut is: **first CSV export is a “report rows CSV” only** (question_id, question, answer, status, citations) and you drop the claim that it mirrors paralegal trackers until Initiative 2 is updated.

---

### 3. Demo reset + demo tooling are specified without a canonical contract, and the tail risk is massive

**What’s wrong**
Breadboard includes:

* N10 reset endpoint
* N11 allowlist guard
* U8 reset button

But `docs/03-architecture/50_api_surface.md` defines no delete/reset endpoints at all. And the shaping docs haven’t locked *how* demo-only boundaries are enforced (beyond “feature flag”).

**Why it matters**
This is the single most dangerous capability in the PoC. If you ship an endpoint that deletes data and the guard is anything less than provably strict, you’ll eventually delete the wrong thing.

**Concrete patch**
Pick one now, and write it down as the perimeter:

**Option A (recommended for thin-tail): no deletion in the first buildable slice**

* “Reset” means: create a new demo matter from fixtures; never delete via HTTP.
* Devs can run a local CLI script to wipe demo data, but it’s not a UI button.
* Patch **`brief.md`** and **`breadboard-pack.md`** to:

  * remove U8/N10/N11 from the first slice
  * keep the checklist (F9) and pack loader (N8) only

**Option B (if you insist on UI reset): add explicit dev-only endpoints + ADR**

* Patch **`docs/03-architecture/50_api_surface.md`** with a small “Dev-only” section (clearly marked non-prod), e.g.:

  * `POST /dev/demo/load_pack` (pack name → returns folder_id/run_id)
  * `POST /dev/demo/reset` (deletes allowlisted demo folders only)
* Patch **`docs/03-architecture/decisions.md`** with an ADR: “Demo-only destructive endpoints are gated by env + allowlist + explicit typed confirmation; never enabled by default.”
* Patch **`breadboard-pack.md`** to show the guardrails as first-class constraints, not “notes”.

---

### 4. Export readiness is underspecified (run state, partial runs, and UX)

**What’s wrong**
Nothing states whether export is allowed when a run is `running`, `partial`, or `failed`. The UI currently implies “export from the selected run”, but there’s no readiness rule.

**Why it matters**
If a demo operator exports mid-run, you’ll generate inconsistent artefacts and then spend time debugging “why are half the rows missing?” That also makes eval runs flaky.

**Concrete patch**

* Patch **`docs/03-architecture/20_state_model.md`** (Export gating section) to add:

  * “Exports are only allowed for `runs.state = completed` (PoC default).”
* Patch **`docs/03-architecture/50_api_surface.md`**:

  * define the error behaviour when run isn’t completed (use `CONFLICT` with a clear message)
* Patch **`breadboard-pack.md`** U1/U2/U3:

  * disable export buttons until run is completed; show copy if not ready.

---

### 5. Artefacts list contract is incomplete (download URLs are ephemeral)

**What’s wrong**
Breadboard expects artefacts list with download links (U5), but API surface doesn’t define the response shape for `GET /folders/:id/artefacts`. Also, storing `download_url` in the DB is a trap because signed URLs expire.

**Why it matters**
You’ll ship something that works once, then links expire, then demos fail (“why is download broken?”). Also you’ll end up inventing an endpoint later under pressure.

**Concrete patch**

* Patch **`docs/03-architecture/50_api_surface.md`** to define `GET /folders/:id/artefacts` response, including:

  * `id`, `format` (`csv`|`docx`|`eval_report`), `kind`, `filename`, `created_at`, `source_run_id`, and a freshly generated `download_url`
* Patch **`docs/03-architecture/30_data_model.md`** artefacts notes:

  * “Do not persist signed URLs; persist only `storage_key` + metadata.”

---

### 6. Export override path is “optional” but not bounded (trust posture risk)

**What’s wrong**
Multiple docs mention a demo-only override as “optional”, but there’s no bounded spec for:

* whether override includes citation_failed rows or excludes them
* what warnings appear
* whether artefacts are watermarked / tagged as unsafe
* how it’s prevented outside demo mode

**Why it matters**
This is exactly where trust gets diluted. A hand-wavy override ends up becoming the default when under demo pressure.

**Concrete patch**

* Patch **`spike-investigation.md`** (Export gating spike) to require an output that includes:

  * exact API field name
  * exact UI copy
  * exact behaviour (block vs export-with-explicit-unsafe labelling)
  * explicit rule: override is impossible unless demo mode is on
* Patch **`brief.md`** to state one of:

  * “No override in PoC exports” (simplest), or
  * “Override exists only in demo mode and produces an UNSAFE artefact type/kind.”

---

### 7. Eval harness scope is still foggy (“runs or reads outputs”)

**What’s wrong**
Breadboard says the runner “runs or reads outputs”. That’s a fork:

* orchestrating ingestion + run in CI is big and brittle early
* reading existing outputs is smaller and still valuable

**Why it matters**
If you don’t lock this, PRD 0015 becomes a platform build by accident.

**Concrete patch**

* Patch **`breadboard-pack.md`** F6/F7 and **`spike-investigation.md`** metrics spike to lock Phase 0:

  * `fixture:eval` consumes an already-produced `folder_id/run_id` plus `/truth` and computes hard gates + report artefacts
  * CI is report-only, uploads JSON+MD as build artefacts
* Make “orchestrate runs in CI” an explicit Phase 1 out-of-scope item.

---

### 8. Fixture pack storage/selection isn’t decided (will leak into every slice)

**What’s wrong**
Brief open question: “filesystem vs object storage?” Breadboard N9 says “fixture store” but doesn’t lock where.

**Why it matters**
CI and demo repeatability depend on this. If it’s not locked, you’ll redesign pack loading mid-build.

**Concrete patch**

* Patch **`brief.md`** Open questions to answer:

  * “Fixture packs live in-repo (filesystem) for PoC and CI determinism; object storage later only if needed.”
* Patch **`breadboard-pack.md`** N9 notes accordingly.

---

### 9. CSV drift treatment is noted but not specified as a mechanism (RH2)

**What’s wrong**
RH2 is “open” with “patch”, but there’s no mechanism.

**Why it matters**
You will ship CSVs that change column order silently. That kills diffs, imports, and trust.

**Concrete patch**

* Patch **`risk-register.md`** RH2 mitigation to:

  * “Lock header lists in code, snapshot exports per fixture pack, and enforce deterministic column/row ordering. Add `schema_version` in metadata_json.”
* Patch **`breadboard-pack.md`** F2 notes to include snapshot tests as non-negotiable.

---

### 10. Word export spike covers “which artefact” but not “can we generate a stable docx across viewers?”

**What’s wrong**
Template choice spike is product-focused, but RH4 is technical (viewer differences). You’ve got a patch note (“keep template simple”) but no proof step.

**Why it matters**
Docx that looks broken in Google Docs is demo death.

**Concrete patch**

* Add a sub-spike (or extend the Word spike) in **`spike-investigation.md`**:

  * Generate a minimal docx with the chosen template approach and open it in Word + Google Docs + Preview. Pass/fail is visual sanity, not perfection.

---

## 2) Perimeter lock recommendation (first buildable slice)

### In scope (first slice I’d lock)

* **CSV export for one artefact first**: `requirements_tracker` only.
* **Strict gating**:

  * export only allowed when `run.state = completed`
  * export blocked if any row is `citation_failed` (no override in slice 1)
* **Artefact persistence + listing** on the matter:

  * create artefact record + storage key
  * list and download from UI
* **UI affordances** on matter detail:

  * one export button, blocked banner, artefacts list
* **Logging**: export success/blocked/fail with trace_id

### Out of scope (for slice 1)

* Word export (docx)
* Eval harness + CI
* Demo toolbar, pack selector, and **any** reset/delete UI
* Any export override path

And if appetite is higher, the only safe expansion for slice 1 is: add the other two CSVs once the structured payload shape is confirmed.

---

## 3) Spike review

### Spike: CSV export format usability

**Right question?** Yes. It’s the fastest way to kill or validate the “lawyer-usable” claim.

**Tighten success criteria**

* Practitioner can paste/import in **<5 minutes** of cleanup.
* They explicitly sign off:

  * required columns present
  * column names acceptable
  * ordering acceptable
* Output includes:

  * row `status`
  * citations as `filename:page` (and optionally `citation_id` for audit)
* Deliverable is a locked header list + ordering + “row ordering rule” (sort key).

**Add**

* Explicitly require a decision on whether the CSV is driven by a structured `export_payload`. If it’s prose-parsing, the spike should fail and trigger a dependency fix in Initiative 2.

---

### Spike: Export gating behaviour (trust posture vs demo utility)

**Right question?** Yes. This is a trust spine decision.

**Tighten success criteria**

* Output must include:

  * the exact API request flag name (or explicit “no override”)
  * the exact UX copy for blocked state
  * the exact behaviour for override (if it exists): include/exclude citation_failed rows, and how they are labelled
* Guardrails requirement if override exists:

  * impossible unless demo mode is enabled
  * artefact metadata marks it as unsafe
  * UI warns loudly and permanently for that artefact

**Missing spike?**

* A micro “contract lock” step: update state model + API surface docs in the same spike outcome so override isn’t hand-wavy.

---

### Spike: Word artefact choice (memo vs objection/cure letter)

**Right question?** Mostly, but it’s already implicitly memo in `initiative-overview-001-002-003.md`.

**Tighten success criteria**

* Decision is made in 15 minutes and recorded as:

  * chosen artefact
  * section list + must-have fields
  * how citations are rendered (format)
  * how missing_input rows appear

**Add**

* Fold in a docx feasibility check (see Finding 10) so you don’t choose a template you can’t render sanely.

---

### Spike: Minimal eval metrics that predict demo readiness

**Right question?** Yes, and it aligns well with `docs/03-architecture/60_observability_and_evals.md`.

**Tighten success criteria**

* Metrics set must include the hard gates already defined in architecture:

  * schema validity (100%)
  * citation integrity (100%)
  * expected failure journeys (must fail in the expected way)
* Runner produces:

  * per-pack JSON + per-pack Markdown summary
  * a cross-pack summary table
  * non-zero exit code when hard gates fail (even if CI is report-only initially)

**Add missing spike**

* Define (and name) the third fixture pack: a deliberate bad-citation pack (e.g. `pack_03_bad_citation`) so the failure-journey gate is real.

---

### Spike: Demo repeatability controls and reset safety

**Right question?** Yes, but it currently mixes two decisions: “do we need demo mode?” and “how do we delete safely?”

**Tighten success criteria**

* First output is a binary decision: **demo mode required vs not required**.
* If demo mode is required:

  * pack loading behaviour is specified (where packs live, what gets seeded, what gets returned)
* For reset:

  * either you explicitly decide “no deletion via UI in PoC” (preferred), or
  * you provide a provable guardrail design and an integration test plan that demonstrates non-demo data cannot be touched.

**Missing spike**

* If you keep reset endpoints: add a security review step (even in PoC) that checks the guard can’t be bypassed by folder naming, user input, or query params.

---

## 4) PRD slices (AFTER spikes)

Below is a thin slicing plan that stays close to the breadboard (F#) and affordances (U#/N#). Names follow the existing handoff numbering, with suffixes to keep slices thin.

### PRD 0013a: CSV export (requirements tracker) + artefact persistence + list

**Maps to**: F1, F2, F4, F5
**Affordances**: U1, U2 (requirements only), U4, U5
**Code**: N1, N2, N3, N5, N6

**Acceptance criteria**

1. From `pack_01_clean`, operator can click “Export Requirements CSV” and receive a stored artefact with a working download link.
2. `POST /export/csv` supports `kind=requirements_tracker` and validates request with Zod; errors use the standard envelope.
3. Export is **blocked** with error code `EXPORT_BLOCKED` if any row in the run is `citation_failed`; UI shows blocked banner with counts and next action.
4. Export returns `CONFLICT` (or equivalent) if `run.state != completed`; UI disables export until completed.
5. Artefact record is persisted (`artefacts` table) with `source_run_id`, `storage_key`, and metadata including `kind` + `schema_version`.
6. `GET /folders/:id/artefacts` returns the new artefact and a fresh `download_url` (not persisted).
7. CSV header list and order match the spike outcome and are snapshot-tested for `pack_01_clean`.
8. Logging exists for export success/blocked/fail including `folder_id`, `run_id`, `kind`, `artefact_id` (if created), and `trace_id`.

---

### PRD 0013b: CSV exports (exceptions + survey issues)

**Maps to**: F2, F5 (and reuses F1/F4 already shipped)
**Affordances**: U2 (remaining two buttons), U4, U5
**Code**: N1, N2, N3

**Acceptance criteria**

1. Operator can export `exceptions_table.csv` and `survey_issues.csv` from `pack_01_clean`.
2. Both exports use the same `POST /export/csv` endpoint with `kind=exceptions_table|survey_issues`.
3. Both CSV schemas are locked (headers + ordering) from the spike and snapshot-tested.
4. Row ordering is deterministic and documented (no “whatever order the DB returns”).
5. Citations render as `filename:page` (plus optional `citation_id`) consistently across all CSVs.
6. Missing input rows (from `pack_02_missing_rea`) export as status `missing_input` with the canonical answer text preserved.
7. Any `citation_failed` in the run blocks export (same behaviour as 0013a).

---

### PRD 0014: Word export (single memo template) + artefact list integration

**Maps to**: F1, F3, F4, F5
**Affordances**: U1, U3, U4, U5
**Code**: N1, N2, N4, N5, N6

**Acceptance criteria**

1. `POST /export/docx` generates a `.docx` memo for `pack_01_clean` and persists it as an artefact with a working download link.
2. The memo includes the spike-locked sections (deal snapshot if available, requirements, exceptions, survey issues) and renders citations in the agreed format.
3. Export is blocked with `EXPORT_BLOCKED` when any row is `citation_failed` (unless the override decision explicitly allows demo-only unsafe export, and then it must be visibly labelled).
4. Document renders acceptably in Word and Google Docs for a representative sample (basic visual sanity gate, not pixel-perfect).
5. Artefact metadata records `kind=memo` and any template version identifier.
6. Failure mode: if template render fails, API returns `INTERNAL` with safe message and logs `EXPORT_FAIL`.

---

### PRD 0015a: Eval harness (hard gates + per-pack reports)

**Maps to**: F6
**Affordances**: (no UI)
**Code**: N12

**Acceptance criteria**

1. `fixture:eval` runs on `pack_01_clean`, `pack_02_missing_rea`, and `pack_03_bad_citation` and produces per-pack JSON + Markdown summary.
2. Hard gates enforced in the report output:

   * schema validity (100%)
   * citation integrity (100%)
   * failure journeys match expectations (`missing_input`, `citation_failed`)
3. Runner exits non-zero if any hard gate fails, but CI may initially be configured report-only (next PRD).
4. Report includes failure taxonomy codes consistent with `docs/03-architecture/60_observability_and_evals.md`.
5. Citation integrity check uses the canonical `snippet_hash` normalisation rule (no duplicate implementations).

---

### PRD 0015b: CI integration for eval reports (report-only first)

**Maps to**: F7
**Affordances**: (no UI)
**Code**: N13

**Acceptance criteria**

1. CI job runs `fixture:eval` and uploads JSON+MD outputs as build artefacts.
2. CI posts (or prints) a concise cross-pack summary table (pass/fail + key counts).
3. CI is report-only initially, but wiring supports flipping to gating on hard gates later without refactor.
4. Runtime is bounded (explicit pack count/time budget); if it exceeds budget, job fails with clear output.
5. Failure output includes traceability: commit hash, agent bundle version, pack name.

---

### PRD 0016: Demo reliability pack (dev-only) with pack loader + checklist (and safe reset decision)

**Maps to**: F8, F9
**Affordances**: U6, U7, (U8 optional per perimeter decision), U9
**Code**: N7, N8, N9, (N10/N11 optional)

**Acceptance criteria**

1. Demo toolbar is available only when demo flag is enabled (dev-only / feature-flagged); otherwise it does not render.
2. Pack selector can load `pack_01_clean` and `pack_02_missing_rea` and lands the operator in the created matter/run context.
3. Pack loader uses the locked fixture storage location (in-repo filesystem for PoC) and is deterministic.
4. Demo checklist exists in `docs/` and covers the exact operator steps to run the demo twice.
5. If reset is included:

   * it cannot delete non-demo data (provable guardrails)
   * requires explicit confirmation (typed or multi-step)
   * logs the deleted IDs + counts
   * has an automated safety test that attempts to delete a non-demo folder and proves it fails
6. If reset is excluded (recommended first pass):

   * “run demo twice” is achieved by creating a fresh demo matter each time (no deletion required)

---

## 5) GO / NO-GO

**NO-GO** to slice PRDs and start build work *as-is*.

**Minimal conditions to flip to GO**

1. Patch the export API contract in `docs/03-architecture/50_api_surface.md`:

   * add `kind` for CSVs
   * define the override flag (or explicitly remove it)
   * define artefacts list response shape
2. Lock the export input shape:

   * confirm where structured export payloads live (recommended: `report_rows.provenance_json.export_payload` + Zod + schema_version), or explicitly cut “tracker-grade CSVs” until Initiative 2 provides structure
3. Make the demo reset decision explicit (no deletion vs dev-only endpoints with provable guardrails) and update breadboard accordingly
4. Complete (or cut) the listed spikes, with written outcomes that directly update the docs (especially gating + CSV schema)

If those four are done, this becomes a clean **GO** with a thin-tailed PRD plan.
