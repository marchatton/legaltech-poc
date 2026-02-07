I don’t have the actual shaping packet text in this thread, so I can’t do line-level callouts. I’m going to treat this as a gate review: the contradictions/missing decisions that routinely break “demo-grade + repeatability”, plus concrete edits to make in each dossier artefact so it stays consistent with the canonical architecture set (state model, API surface, data model, observability/evals, ADRs) and stays thin-tailed.

## 1) Findings (ordered by severity)

### 1. Repeatability is usually asserted, not defined (BLOCKER)

* **What’s wrong:** “Repeatable” often means three different things in shaping packets:

  1. bitwise identical output, 2) semantically equivalent, 3) “close enough for demo”.
     If the packet doesn’t pin a single definition and metric, everything downstream is hand-wavy.
* **Why it matters:** You cannot design state, caching, evals, or debugging without a measurable definition. And you’ll ship something that *looks* stable until the first rerun in front of a customer.
* **Patch (Brief + ADRs + Spike plans):**

  * **Brief:** add a section **“Definition of repeatability”** with:

    * repeatability window (e.g., “within same prompt pack + model pin”),
    * measurement (e.g., structured JSON equality, or section-level diff thresholds),
    * number of reruns (e.g., 10/10 pass rate on a golden set).
  * **ADRs:** add an ADR “Determinism strategy” that records the chosen approach (pin model, temperature, tool determinism, caching policy).
  * **Spike plans:** add a success criterion that is numeric (see Spike Review section below).

### 2. Output “demo-grade” quality bar is usually unscoped (BLOCKER)

* **What’s wrong:** “Demo-grade outputs” commonly expands to: formatting polish, legal tone, citations, completeness, jurisdiction nuance, edge cases, and UX. That’s a long tail.
* **Why it matters:** You’ll end up optimising prose rather than building a stable, testable pipeline. Repeatability becomes impossible if the output is freeform and not schema-backed.
* **Patch (Brief + Breadboard pack):**

  * **Brief:** define “demo-grade” as *a constrained artefact*:

    * a fixed template,
    * fixed section ordering,
    * fixed citation/quote behaviour,
    * explicit non-goals (no full legal advice, no broad jurisdiction coverage, no perfect completeness).
  * **Breadboard pack:** ensure there is a dedicated **Output Assembly** component (structured schema → renderer). If the breadboard currently implies “LLM writes the final doc directly”, change it to “LLM produces structured fields + deterministic renderer”.

### 3. Export gating and demo reset safety not represented as first-class state transitions (BLOCKER)

* **What’s wrong:** These often appear as UI toggles or “we’ll add a warning modal”, rather than being enforced by the state model + API contract.
* **Why it matters:** You will eventually bypass the UI (API calls, retries, background jobs). If gating/reset is not in state + server-side policy, it will be violated.
* **Patch (State model doc + Data model doc + ADRs + Brief):**

  * **State model:** add explicit states/flags for:

    * `draft_ready`,
    * `export_blocked` / `export_eligible`,
    * `export_acknowledged` (with who/when),
    * `exported` (with artefact id),
    * `reset_epoch` or equivalent to prevent stale exports post-reset.
  * **Data model:** store export acknowledgements and reset events as immutable audit records.
  * **ADRs:** add ADRs for “Export gating policy” and “Demo reset semantics”.
  * **Brief:** call these “non-negotiable” and specify behaviour (no export without acknowledgement; reset wipes all artefacts and disables old links).

### 4. Perimeter likely too wide: “repeatability” gets interpreted as “general agent reliability” (BLOCKER)

* **What’s wrong:** Packets often include agentic loops, open-ended chat, multi-document workflows, or optional integrations “because demo”. That explodes variance and surface area.
* **Why it matters:** Repeatability fails first in tool-calling loops, retrieval variance, and multi-step planning. Also the testing matrix balloons.
* **Patch (Brief + Breadboard pack + Spike plans):**

  * **Brief:** lock to a single workflow: **US CRE Title + Survey Quick Start** with a single output artefact.
  * **Breadboard:** constrain orchestration to a fixed DAG, not an unconstrained agent loop (or hard-cap the loop to a deterministic number of steps).
  * **Spike plans:** explicitly test determinism with tool calls turned on, not just “LLM-only”.

### 5. Canonical API surface drift risk (HIGH)

* **What’s wrong:** Shaping packs frequently propose new “convenience endpoints” (e.g., “/export”, “/reset”, “/rerun-with-seed”) that aren’t in the canonical API surface.
* **Why it matters:** You get architecture divergence before the PoC even exists. Also you create hidden coupling between UI and backend.
* **Patch (Spike plans + Brief):**

  * **Brief:** “Prefer existing API contracts; no new endpoints unless the canonical API cannot express the state transition.”
  * **Spike:** include a “contract mapping” deliverable: each user action maps to an existing API call + state transition.

### 6. State model missing the “repro context” needed for repeatability (HIGH)

* **What’s wrong:** Many state models track `run_id/status/output`, but not the full reproducibility context: model version, prompt pack version, retrieval snapshot, input hashes, tool versions.
* **Why it matters:** You can’t explain or reproduce changes. And you can’t defend a “repeatable” claim.
* **Patch (State model + Data model):**

  * Add immutable fields: `input_bundle_hash`, `prompt_pack_hash/version`, `model_id/version`, `retrieval_config_hash`, `toolchain_version`, `created_at`.
  * Store outputs as versioned artefacts; never “edit in place”.

### 7. Data model probably conflates “draft” with “final” (HIGH)

* **What’s wrong:** If the packet suggests editing generated outputs, or overwriting drafts, it conflicts with reproducibility and audit.
* **Why it matters:** Repeatability becomes meaningless if outputs mutate. Export gating becomes unsafe if “what was exported” can change.
* **Patch (Data model doc + Brief):**

  * **Data model:** enforce immutability of exported artefacts.
  * **Brief:** if edits are needed later, scope them out for this initiative (or treat edits as new artefacts linked to parent).

### 8. Observability/evals are often treated as “nice to have” (HIGH)

* **What’s wrong:** Repeatability without tracing and eval gates is theatre.
* **Why it matters:** Without structured traces and regression evals, you can’t stabilise the system or prove it stayed stable.
* **Patch (Observability/evals doc + Risk register + Spike plans):**

  * Add a minimal eval harness requirement: golden set + rerun comparator + threshold gate.
  * Add tracing requirements: correlated run_id across steps, prompt pack version recorded, export gating events logged.

### 9. Risk register likely misses the top repeatability failure modes (MED)

* **What’s wrong:** Risk registers often focus on generic AI risks, not repeatability-specific ones.
* **Why it matters:** You won’t mitigate the actual causes of demo failure.
* **Patch (Risk register):** ensure explicit risks + mitigations for:

  * LLM nondeterminism even at temperature 0,
  * retrieval nondeterminism (ordering, chunking),
  * tool-call nondeterminism and retries,
  * model/provider silent upgrades,
  * caching causing stale exports or cross-demo leakage,
  * reset incompleteness (artefacts in object storage, logs, caches).

### 10. Spike success criteria likely not tight enough (MED)

* **What’s wrong:** “Investigate repeatability” or “spike export gating” without pass/fail metrics.
* **Why it matters:** Spikes become research projects and don’t collapse uncertainty.
* **Patch (Spike plans):** each spike must end with:

  * a decision,
  * an artefact (ADR update, schema, state transition diagram),
  * a measurable acceptance threshold.

### 11. Naming drift across docs (LOW but corrosive)

* **What’s wrong:** “Run”, “job”, “session”, “workflow”, “report” used interchangeably.
* **Why it matters:** You’ll get mismatched state/data/API semantics.
* **Patch (Brief + canonical docs):**

  * Add a “Glossary” section to the brief and enforce the canonical names.

---

## 2) Perimeter lock recommendation (first buildable slice)

### In scope

* Single workflow: **US CRE Title + Survey Quick Start**.
* Inputs: a constrained doc bundle (whatever the canonical intake supports today, but keep it to 1–3 docs typical for the demo).
* Output: one **fixed-format Quick Start report** generated via **structured schema + deterministic renderer**.
* Repeatability: defined metric + golden set regression gate.
* **Export gating** enforced server-side as a state transition, with audit record.
* **Demo reset** wipes all artefacts for the demo tenant/workspace and invalidates prior export links.

### Out of scope

* Open-ended chat, “agent mode”, or unconstrained iterative loops.
* Multi-workflow support, multi-template support, or jurisdiction expansion.
* External integrations (DMS, email, third-party title systems).
* Human-in-the-loop editing inside the product (treat as future; for demo use “download and edit offline” if you must).
* Any “smart” personalisation or learning across runs (it breaks repeatability and reset).

---

## 3) Spike review

Since I can’t see your planned spike list, here’s the set I would require for Initiative 0003, with tightened questions and success criteria. If you already have equivalents, map yours to these.

### Spike A: Repeatability definition + measurement harness

* **Right question:** “What does repeatability mean for this artefact, and can we measure it automatically?”
* **Tight success criteria:**

  * Define comparator: structured JSON equality, or section-level diff thresholds.
  * Golden set: at least 5 representative input bundles.
  * Run each bundle 10 times. Pass condition: **≥ 9/10** meet threshold for each bundle (or stricter if feasible).
  * Produce an ADR with the agreed metric and threshold.
* **Missing add-on:** If tool-calling/retrieval is in scope, the harness must include it. Not LLM-only.

### Spike B: Determinism strategy (model, prompts, retrieval, tool calls)

* **Right question:** “What are we pinning, and what do we do when the provider still isn’t deterministic?”
* **Tight success criteria:**

  * Decision on: model pinning strategy, prompt pack versioning, retrieval determinism knobs, retry policy.
  * Decide whether a **cache-by-hash** mechanism is required to guarantee repeatability for demos.
  * Document how reset interacts with caches (reset must purge).
  * Output: ADR(s) + updated state/data model fields for reproduc context.

### Spike C: Output schema + deterministic renderer feasibility

* **Right question:** “Can we force the model to produce a stable schema that renders to a demo-grade report?”
* **Tight success criteria:**

  * A single JSON schema for the Quick Start report.
  * Renderer spec: deterministic ordering, stable formatting rules.
  * At least 3 golden inputs successfully produce renderable output with no manual fixes.
  * Any “free text” fields are bounded (max length, controlled headings).

### Spike D: Export gating policy + enforcement

* **Right question:** “How do we make export gating impossible to bypass?”
* **Tight success criteria:**

  * Export requires explicit acknowledgement captured server-side (actor + timestamp + run_id + artefact_id).
  * System prevents export if output is not in `draft_ready` and `export_eligible`.
  * Export event is logged and traceable.
  * Reset invalidates export eligibility for pre-reset artefacts.

### Spike E: Demo reset semantics + completeness test

* **Right question:** “When we reset, what exactly is deleted/invalidated and how do we prove it?”
* **Tight success criteria:**

  * Enumerate all storage locations (DB, object store, caches, indexes, logs with payloads).
  * Define reset scope (tenant/workspace) and irreversibility.
  * Provide a reset checklist test: after reset, previous run artefacts cannot be fetched or exported.
  * Add safety rail: reset requires elevated permission + confirmation.

### Spike F: Observability + eval integration

* **Right question:** “Can we debug variance and enforce regression gates from day one?”
* **Tight success criteria:**

  * Traces include: run_id, input hash, prompt pack version, model id, tool steps, export events.
  * Minimal dashboard/query for: rerun variance, failure modes, latency.
  * Evals can be run locally/CI against the golden set with a clear pass/fail.

**One missing spike I often see:**

### Spike G: Contract mapping to canonical API surface

* **Right question:** “Can every UI action be expressed using existing endpoints and state transitions?”
* **Success criteria:** A mapping table: UIs → API calls → state transitions. And an explicit “no new endpoints” call unless a gap is proven.

---

## 4) PRD slices (AFTER spikes)

Because I can’t see your breadboard numbering, I’m going to use a standard mapping so the slices are explicit. Swap the IDs to match your breadboard pack.

**Assumed breadboard parts**

* **F1** Workflow runner/orchestrator (fixed DAG)
* **F2** State store (runs, artefacts, transitions)
* **F3** Prompt pack + policy layer (versioned)
* **F4** Doc intake + normalisation (whatever canonical intake supports)
* **F5** Structured output builder (schema)
* **F6** Deterministic renderer (report assembly)
* **F7** Export gate + export service
* **F8** Reset service
* **F9** Observability/evals (traces, metrics, golden set runner)

**Assumed affordances**

* **U1** Upload/select input bundle
* **U2** Start Quick Start run
* **U3** View run status + logs (lite)
* **U4** View draft report
* **U5** Export (gated)
* **U6** Demo reset (admin)
* **N1** Repeatability contract
* **N2** Auditability (export + reset)
* **N3** Data deletion guarantees
* **N4** Latency budget (demo-friendly)
* **N5** Deterministic formatting rules

### PRD 0003-01: “Quick Start Run Skeleton (state + fixed DAG)”

**Maps to:** F1, F2, F4 | U1, U2, U3 | N4
**Acceptance criteria:**

1. User can create a run from an input bundle (U1 → U2).
2. Run transitions follow the canonical state model and are persisted (F2).
3. The workflow is a fixed DAG (no open-ended loops) (F1).
4. Each run records immutable `input_bundle_hash` and `created_at` (F2).
5. Status polling/view shows current state and basic step list (U3).
6. Failures are explicit and terminal states are distinguishable (e.g., `failed_validation`, `failed_generation`).
7. No export path exists yet (explicit non-goal, prevents premature bypass).

### PRD 0003-02: “Structured Quick Start Output (schema + deterministic render v0)”

**Maps to:** F5, F6, F2 | U4 | N5
**Acceptance criteria:**

1. There is a single versioned JSON schema for the Quick Start report (F5).
2. The system produces schema-valid output for the golden inputs (F5).
3. Rendering is deterministic: same schema input → identical rendered artefact (F6).
4. Report section ordering is fixed and documented (F6).
5. The rendered artefact is stored as an immutable artefact linked to the run (F2).
6. User can view the draft report (U4).
7. Renderer handles missing optional fields gracefully (no broken layout).

### PRD 0003-03: “Repeatability Gate (golden set + rerun comparator)”

**Maps to:** F3, F5, F9, F2 | N1
**Acceptance criteria:**

1. Prompt pack is versioned and referenced by runs (F3/F2).
2. Runs record `prompt_pack_version/hash` and `model_id/version` (F2).
3. Golden set exists (at least 5 input bundles) and is runnable on demand (F9).
4. Comparator is defined and automated (schema equality or defined diff threshold) (F9).
5. Repeatability target is enforced: rerun 10x per input and report pass rate (F9).
6. Variance is reported with enough detail to debug (which fields/sections differ) (F9).
7. Any caching strategy required for demo repeatability is documented and wired into reset semantics (F2/F9).

### PRD 0003-04: “Export gating (server-side) + audit trail”

**Maps to:** F7, F2 | U5 | N2
**Acceptance criteria:**

1. Export is blocked unless the run is in `draft_ready` and `export_eligible` (F2/F7).
2. Export requires an explicit acknowledgement (U5) stored server-side with actor + timestamp (F2).
3. Export produces a new immutable exported artefact id (F7/F2).
4. Export events are traceable from run → artefact → export record (F2).
5. Export gating cannot be bypassed via direct API calls (policy enforced server-side) (F7).
6. Export logs do not store unsafe payloads, only references/hashes as per canonical observability rules (align to your observability doc).
7. Export behaviour is documented in an ADR (“Export gating policy v1”).

### PRD 0003-05: “Demo reset (safe wipe + invalidation)”

**Maps to:** F8, F2 | U6 | N3, N2
**Acceptance criteria:**

1. Admin can trigger demo reset (U6) with a confirmation step.
2. Reset deletes/invalidates all run artefacts for the demo scope (tenant/workspace as defined) (F8/F2).
3. After reset, prior run ids/artefact ids cannot be fetched or exported (hard invalidation) (F2/F8).
4. Reset events are audit logged (who/when/scope) (F2).
5. Reset purges any repeatability caches tied to the demo scope (F8).
6. Reset leaves the system in a known “clean demo” state with a simple health check.
7. Reset semantics are captured in an ADR (“Demo reset semantics v1”).

### PRD 0003-06: “Observability + eval reporting for demo ops”

**Maps to:** F9, F1, F2 | U3 | N2, N4
**Acceptance criteria:**

1. Every run has correlated trace IDs across steps (F1/F9).
2. Traces include reproduc context: input hash, prompt pack version, model id, tool steps (F9).
3. Export and reset events appear in traces/audit logs (F9/F2).
4. Basic metrics exist: run success rate, step latency, repeatability pass rate (F9).
5. There is a minimal runbook: “How to rerun golden set”, “How to interpret variance”, “How to reset demo safely”.
6. Evals can be executed in CI or a repeatable local process (even if manual at first).
7. Logs follow the canonical redaction/PII handling rules (no raw doc content unless explicitly allowed in the architecture docs).

---

## 5) GO / NO-GO

**NO-GO** as-is (because the packet content isn’t here, and because these are the common blockers that must be explicitly resolved in shaping before you build anything and accidentally expand the perimeter).

**Minimal conditions to flip to GO**

1. Brief explicitly defines **repeatability** (metric + threshold + window) and **demo-grade output** (fixed template + non-goals).
2. Canonical state model and data model include the **repro context** fields (input hash, prompt pack version, model id, retrieval/tooling config hashes).
3. Export gating and demo reset are represented as **server-enforced state transitions** with audit records (not just UX).
4. Spike plans have tight pass/fail success criteria (especially for repeatability and reset completeness).
5. A perimeter lock exists that forbids open-ended agent loops and multi-workflow expansion for this initiative.

If you paste (or upload) the brief, breadboard pack, risk register, spike plans, plus the canonical state/API/data/observability/ADR docs, I can redo the same output with exact contradictions and specific doc edits (section-by-section) rather than gate-style patches.
