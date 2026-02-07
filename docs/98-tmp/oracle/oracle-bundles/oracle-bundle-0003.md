## Canonical architecture contracts (extracted, as the baseline “truth”)

These are the load‑bearing rules the 0003 spine + child dossiers have to line up with.

### Trust posture and evidence contracts

* **Evidence-first + locked citations**: drafting produces candidate citations as **chunk IDs**, then we **lock** to immutable `citation_id`s containing `{snippet, snippet_hash, geometry}`. Rows reference **citation_id only** (ADR-0001; `docs/03-architecture/30_data_model.md`; `docs/03-architecture/40_rag_and_agents.md`).
* **Fail-closed**: any citation mismatch or verification failure makes the row `citation_failed`; `citation_failed` rows are **non-exportable by default** (ADR-0002; `docs/03-architecture/20_state_model.md`).
* **Verification v1 is integrity-only**: no entailment verifier model at runtime; integrity + invariants only (ADR-0017; `docs/03-architecture/60_observability_and_evals.md`).
* **Exact missing input string**: `missing_input.answer` must be exactly `Not found in provided documents.` and must have **zero citations** (`docs/03-architecture/20_state_model.md`).

### Determinism, version pinning, and workflow boundaries

* **Deterministic-ish orchestration** via WDK steps: route handlers should stay thin; side effects live in steps (ADR-0005; `docs/03-architecture/10_system_architecture.md`).
* **Indexing is versioned**: chunking is deterministic and page-bounded; changes to OCR/chunking/index config/embedding model must bump `index_version` (ADR-0015; `docs/03-architecture/30_data_model.md`).
* **Runs pin versions**: `index_version`, `agent_bundle_version`, `question_set_version` are pinned per run; completed invariants require one terminal row per pinned question (ADR-0016; `docs/03-architecture/20_state_model.md`).

### API and security contracts

* **Standard error envelope** for all non-2xx responses (ADR-0008; `docs/03-architecture/50_api_surface.md`).
* **Signed URLs are ephemeral**: never persist signed URLs, only `storage_key` + metadata; generate fresh download URLs (data model + API surface).
* **Admin token**: some endpoints/actions require `X-Orbital-Admin-Token` matching `ORBITAL_ADMIN_TOKEN` (API surface; ADR-0018/0019).
* **Unsafe export override guardrails** (canonical): `unsafe_override=true` allowed only when **DEMO_MODE=1**, **ALLOW_UNSAFE_EXPORTS=1**, and a **valid admin token** is provided (API surface + ADR-0019). ADR-0019 also states UI policy: **unsafe override is API-only** (no Trust Substrate UI affordance).

### Observability and evals

* **Taxonomy is tiered**:

  * Tier 1: step-level `failure_code` (run_steps)
  * Tier 2: row-level `reason_code` (report_rows provenance for `citation_failed`)
    And they must not be mixed (`docs/03-architecture/60_observability_and_evals.md`).
* **Fixture packs must have a manifest**: eval runners must read `docs/08-example-data/<pack>/manifest.json` and not infer (explicit in `docs/03-architecture/60_observability_and_evals.md`).

---

## Findings by severity

### Blockers

1. **Unsafe export override is inconsistent across ADRs, API contract, and feature dossiers**

* Canonical: `unsafe_override` requires **DEMO_MODE + ALLOW_UNSAFE_EXPORTS + admin token**, and ADR-0019 says **API-only, no UI affordance**.
* Feature docs (0003 spike + 0004 + 0005) currently:

  * omit the **admin token** requirement in several places
  * specify an **unsafe override UI** (“Export anyway (UNSAFE)” + modal copy) as if it is a normal UI affordance
* Why this is a blocker:

  * It is a trust and security boundary. If the docs disagree here, implementation will drift and likely leak an “easy bypass” path.

2. **Demo pack loader is an implicit API decision that currently violates the canonical dev-only endpoint conventions**

* `docs/03-architecture/50_api_surface.md` says dev-only endpoints must live under `/spikes/*`, gated by `SPIKES_ENABLED=1`, and return 404 otherwise.
* 0007 introduces a pack loader controlled by `DEMO_MODE=1`, but does not pin:

  * endpoint path(s)
  * whether this is a spike endpoint vs a supported dev-only endpoint
  * whether it is **admin-token gated**
* Why this is a blocker:

  * This is a filesystem-reading feature. Without a pinned contract, it is easy to ship something unsafe or inconsistent (and it will definitely drift).

### Important

3. **Export “failure_code” column conflicts with the canonical taxonomy terms**

* Canonical: row-level is `reason_code`; `failure_code` is step-level only.
* CSV schema v1 hard-locks a header named `failure_code`. That’s fine externally, but feature docs should explicitly state that this column contains the **row-level reason code**, not the step failure code.
* Otherwise you’ll end up mixing tiers, and `docs/03-architecture/60_observability_and_evals.md` explicitly warns against that drift.

4. **Eval harness and demo loader don’t consistently enforce the fixture pack manifest contract**

* `docs/03-architecture/60_observability_and_evals.md` says manifest is required and runners must read it.
* 0006 eval harness PRD and 0007 demo reliability PRD describe reading pack folders, but don’t explicitly say “read manifest, do not infer”.
* This is a determinism contract. It should be repeated once in the feature docs as a strict dependency, or better, referenced with a single canonical line.

5. **Hard gates drift: export truth match is treated as a hard gate in 0006/0003, but not clearly included in canonical `60_observability_and_evals.md`**

* 0006 makes `export_truth_match` a hard gate.
* The canonical hard gates list in `60_observability_and_evals.md` does not clearly include export truth match in the “must be 100%” set (it’s implied in Initiative 0003 docs, but not pinned as canonical eval posture).
* This is not fatal, but it will cause “what are hard gates?” drift.

6. **0006 “snapshot-first” is underspecified for export truth match**

* 0006 says it reads `/produced` snapshots and enforces CSV truth match, but doesn’t explicitly say whether:

  * it compares **produced CSV files** under `/produced/*.csv`, or
  * it regenerates CSVs from `report_rows` snapshots using the same CSV mappers as the export endpoint (better DRY), then compares to `/truth`.
* Either can work, but the doc needs to pin one. Otherwise you will duplicate mapping logic or fail to test the actual exporter.

7. **0007 wording drift: “fresh matter/run each time” vs “seeds documents only (no auto-start run)”**

* 0007 says pack loader seeds documents only, but summary language implies a run is created.
* Small, but this is exactly how demo operator expectations get confused.

### Nice-to-have

8. **Duplicate restatement of canonical rules (risk of drift)**

* Export gating, missing_input exact string, and error envelope are restated across 0003/0004/0005/0006.
* Better: feature docs should reference canonical sections, and only include deltas (like CSV headers/order).

9. **UI copy location**

* The “Export blocked” and unsafe override modal copy lives in spike docs and PRDs.
* If you keep copy specs, centralise them in one place (either a single “Export UX copy v0” doc or fold into `failure_ux_copy_v0.md` with a clearly separate section), otherwise it will drift.

---

## Per-feature alignment table

| Feature dossier                          |  Aligned? | Issues (summary)                                                                                                                                                                     | Proposed fix (smallest)                                                                                                                                                      |
| ---------------------------------------- | --------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0003_demo-grade-outputs/prd.md` (spine) |    Mostly | Unsafe override guardrails referenced but not fully pinned to ADR-0019 + admin token; hard gates set includes export truth match but canonical eval doc doesn’t reflect it           | Add explicit references to ADR-0019 + API surface for unsafe override; link hard gates definition to updated `60_observability_and_evals.md`                                 |
| `0004_csv-export/prd.md`                 | Partially | Unsafe override missing admin token; UI unsafe CTA conflicts with ADR-0019 (API-only); taxonomy term confusion (`failure_code` vs `reason_code`)                                     | Update unsafe override section to require admin token and clarify API-only; define CSV `failure_code` column semantics (row reason code)                                     |
| `0005_word-export/prd.md`                | Partially | Same unsafe override mismatch; UI assumptions; needs explicit “no UI unsafe” alignment                                                                                               | Same as 0004; keep memo formatting constraints, just align guardrails                                                                                                        |
| `0006_eval-harness/prd.md`               |    Mostly | Manifest requirement not explicit; export truth match mechanism underspecified; hard gates drift vs `60_observability_and_evals.md`                                                  | Require manifest use; pin export truth match computation method; update `60_observability_and_evals.md` to include export truth match as hard gate when exports are in scope |
| `0007_demo-reliability/prd.md`           | Partially | Demo loader endpoint path and gating not pinned and conflicts with `/spikes/*` convention; admin token not mentioned; manifest usage not explicit; wording about run creation drifts | Add canonical API section (or align to `/spikes/*`); require DEMO_MODE + admin token; require manifest; tighten wording (“creates folder + documents only”)                  |

---

## Proposed changes list (explicit diffs with file paths)

### 1) Fix unsafe override guardrails and UI policy drift

**File:** `docs/04-projects/02-features/0004_csv-export/prd.md`
**Edits:**

* In **“Export gating + unsafe override (locked)”**:

  * Change guardrails to match canonical: `DEMO_MODE && ALLOW_UNSAFE_EXPORTS && X-Orbital-Admin-Token`.
  * Add a hard line: **unsafe override is API-only** (per ADR-0019).
* In **“Failure States + UX (no silent failures)”**:

  * Remove the unsafe override CTA + modal copy from the main UI flow, or move it under a clearly labelled “Out of scope / future slice (if ADR changes)”.
  * Keep “Export blocked” banner copy if you want, but do not include a UI bypass path if ADR-0019 stands.
* In **“Locked decisions… CSV schemas v1”** section:

  * Add a sentence defining column 6 (`failure_code`) as: **the row-level `reason_code` when `row_status=citation_failed`, otherwise empty**.
  * And explicitly state it is not Tier 1 step `failure_code`.

**File:** `docs/04-projects/02-features/0005_word-export/prd.md`
**Edits:**

* Mirror the same changes in:

  * **“Locked decisions… Export gating”**
  * **“Scope / FR / AC”** where unsafe override is described
* Ensure the doc does not promise a UI unsafe override affordance unless you plan to supersede ADR-0019.

**File:** `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`
**Edits:**

* In **“Export gating behaviour (RH5) — CLOSED”**:

  * Update unsafe override guardrails to include **admin token**.
  * Remove the “demo-only button label / confirmation modal copy” from the locked outcomes if ADR-0019 remains “API-only”.
  * If you really want to keep the copy text, relocate it into a new section labelled: “Operator runbook copy (only if we add an admin-auth UI surface)”, and mark as **not a shipped UI affordance**.

**File:** `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md` and `docs/04-projects/02-features/0003_demo-grade-outputs/prd.md`
**Edits:**

* In the parts describing unsafe overrides:

  * Add a single canonical reference: “Unsafe override is demo-only and admin-token gated per ADR-0019 and API surface.”
  * Avoid any implication it is a normal UI escape hatch.

### 2) Pin demo pack loader endpoint conventions and gating

**File:** `docs/03-architecture/50_api_surface.md`
**Add a new section**, suggested heading: **“Demo controls (dev-only)”**
Include:

* Endpoint path decision (pick one and stick to it):

  * Option A (align to existing convention): `/spikes/demo/load-pack` and require `SPIKES_ENABLED=1` and `DEMO_MODE=1`
  * Option B (new convention): `/demo/load-pack` and require `DEMO_MODE=1`
* In either option, include:

  * admin token requirement (`X-Orbital-Admin-Token`)
  * allowlisted `pack_id` only (no filesystem paths)
  * response shape: `{ folder: { id, name, ... } }` or `{ folder_id }`
  * errors use standard envelope
  * never return file paths or signed URLs
  * explicit statement: pack loader reads `manifest.json`, not directory inference

**File:** `docs/04-projects/02-features/0007_demo-reliability/prd.md`
**Edits:**

* In **“Solution”** and/or **“Scope”**:

  * Reference the new API section (single source of truth).
  * State explicitly: endpoint is admin-token gated.
  * State explicitly: loader reads `docs/08-example-data/<pack>/manifest.json`.
* In **“Goals”** and **“Acceptance Criteria”**:

  * Replace “fresh matter/run” wording with “fresh matter” (run starts when operator clicks Run Quick Start).

### 3) Bring eval contracts into line (manifest + export truth match + DRY)

**File:** `docs/04-projects/02-features/0006_eval-harness/prd.md`
**Edits:**

* Add a requirement under **“Solution”** or **“Key design constraints”**:

  * “Eval runner must read `manifest.json` and fail if missing; no inference.”
* Under **“Scope”** and **AC-005 / export truth match**:

  * Pin how export truth match is computed. Suggested heading: **“Export truth match mechanism (v1)”**
  * Choose one:

    1. **Generate CSV via shared mappers** from `produced/report_rows.json` + `produced/citations.json`, then compare to `/truth/expected_*.csv` (best DRY).
    2. Compare committed `produced/*.csv` to `/truth/expected_*.csv` (simpler but less coverage of exporter code).
* Add one small taxonomy clarification:

  * “Row failure reason is `reason_code` (Tier 2). If exported as `failure_code` column, it is still the Tier 2 value.”

**File:** `docs/03-architecture/60_observability_and_evals.md`
**Edits:**

* In **“Hard gates (must be 100%)”**:

  * Add `export_truth_match` as a hard gate *when export features are in scope* (Initiative 0003). Keep it conditional if you want to preserve broader applicability.
* In **“Evals (fixture-driven)”**:

  * Re-emphasise the manifest requirement (already present, but you can add a callout line: “Demo loader and eval harness must both read manifest.”)
* Optional but helpful:

  * Add a one-liner note under taxonomy mapping rules clarifying the export CSV header naming mismatch if you keep `failure_code` header.

---

## Minimal reconciliation plan (smallest set of edits to make everything consistent)

1. **Pick one canonical unsafe override story and apply it everywhere**

* Minimal + architecture-safe: keep ADR-0019 as-is (unsafe override is admin-token gated and API-only).
* Update 0003 spike + 0004 + 0005 to:

  * include admin token
  * remove unsafe override UI affordance language/copy from the main UI flows

2. **Add a tiny “Demo controls” section to `50_api_surface.md`**

* Pin endpoint path + gating flags + admin token + allowlist + manifest usage.
* Then update 0007 to reference it and stop re-explaining.

3. **Make manifest.json a hard dependency in both 0006 and 0007**

* One sentence each, plus a fail-fast behaviour statement.
* This protects determinism and stops “infer files from directory listing” creep.

4. **Clarify export truth match implementation in 0006**

* Choose: generate CSV using shared mappers (recommended DRY).
* Document required produced snapshot inputs.

5. **Align canonical eval hard gates**

* Add export truth match to `60_observability_and_evals.md` as conditional hard gate (only when exports exist).
* That prevents future “0006 says hard gate, 60 doesn’t” drift.

---

## Proposed `docs/03-architecture/DECISIONS.md` updates (new ADR titles + rationale)

These are the missing decisions that the feature docs are currently making implicitly.

1. **ADR-0022: Demo controls endpoints are dev-only, admin-token gated, and manifest-driven**

* Rationale: 0007 introduces a pack loader that reads from the repo filesystem. This needs a pinned API path, gating flags, admin-token requirement, allowlist policy, and a manifest requirement to prevent drift and security footguns.

2. **ADR-0023: Fixture pack contract v1 (manifest + produced snapshot conventions)**

* Rationale: Both eval harness (0006) and demo loader (0007) depend on consistent fixture structure. Pin what files are required (`manifest.json`, `/docs`, `/truth`, `/produced` expectations) and make “no inference” explicit.

3. **ADR-0024: Export truth match is a hard gate once export features ship**

* Rationale: 0006/0003 treat this as hard gate, but the canonical eval posture doesn’t clearly include it. Pin it to keep trust posture and regression detection deterministic.

4. **ADR-0025: Export CSV `failure_code` column carries row-level `reason_code`**

* Rationale: Preserves the spike-locked CSV header while preventing taxonomy drift (Tier 1 vs Tier 2) in implementation and reporting.

Optional (only if you don’t want to change spike docs and you truly want UI unsafe override later):

5. **ADR-0026: If unsafe override ever has a UI affordance, it must not require exposing the admin token in the browser**

* Rationale: current canonical admin token is a header. If UI needs unsafe export, you need an alternative admin-auth mechanism (server-side session, gated admin page, etc). This ADR keeps you from casually putting `ORBITAL_ADMIN_TOKEN` in client code.

---

If you want the absolute smallest edit set with lowest blast radius: align all feature docs to ADR-0019 (admin token + API-only unsafe override), add the demo controls section to `50_api_surface.md`, and add manifest + export truth match clarifications to 0006 plus a small update to `60_observability_and_evals.md`. And done.
