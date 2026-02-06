# Spike investigation — Initiative 0003: Demo-grade outputs and repeatability

> Status: planned only. No spikes executed yet.

Per `docs/00-strategy/initiatives/prd-slicing-rules.md`: spikes come before PRDs.

## Spike plan — CSV export format usability

## Question

Is the CSV export format usable for a paralegal who needs to paste into an existing tracker?

## Context

- Feature / concept: 3.1 CSV exports (requirements, exceptions, survey issues)
- Related requirement(s): R1
- Why now: Export usability is the core promise for "demo-grade outputs"

## Success criteria

Proof looks like:

- A paralegal says "yes, I can paste this into our tracker" with minimal cleanup.
- Column names and ordering are judged acceptable (or we get a precise change list).

## Timebox

- Start: TBD
- Hard stop: TBD (1-2 hours of practitioner time, max)

## Scope

Include:

- Sample CSVs for requirements, exceptions, and survey issues.
- Citations and row statuses included (as doc name + page, plus status code).

Exclude:

- Any Excel formatting, formulas, or per-firm customisation.

## Approach

- Step 1: Generate 3 sample CSVs from `pack_01_clean`.
- Step 2: Hand to a practitioner for a quick paste/import test.
- Step 3: Capture feedback and lock (or revise) the column schema.

## Artefacts

Keep:

- Feedback notes.
- Final column schema (header list + ordering).

Throw away:

- Any prototype formatting beyond CSV.

## Expected outcomes

- If straight shot: lock the column schema and add fixture-based export snapshots.
- If tangle: cut optional columns and re-test with a minimal schema.
- If fog: focus only on requirements CSV first, then expand to the other two.

## Oracle pass

Pending (bundle created after shaping; see `tmp/oracle-bundles/`).

---

## Spike plan — Export gating behaviour (trust posture vs demo utility)

## Question

When any row is `citation_failed`, do we:
1) block export by default (per state model), and
2) allow a demo-only override (explicit + visibly unsafe)?

## Context

- Feature / concept: 3.1/3.2 exports
- Related requirement(s): R5
- Why now: This is a product trust decision; exporting "partial truth" is dangerous if underspecified.

## Success criteria

Proof looks like:

- A single crisp default that matches `docs/03-architecture/20_state_model.md`.
- If override exists, it is strictly scoped (demo-only) and impossible to trigger accidentally.
- UX copy is unambiguous about what is missing/excluded.

## Timebox

- Start: TBD
- Hard stop: TBD (30-60 minutes)

## Scope

Include:

- Default behaviour and exact UX messaging for `EXPORT_BLOCKED`.
- Decision on whether override exists, and if so: how it is guarded.

Exclude:

- Any attempt to "fix" citation_failed rows inside export.

## Approach

- Step 1: Restate canonical rule from state model and API surface docs.
- Step 2: Draft 2 options (block-only vs demo-only override) with a concrete UI + API shape.
- Step 3: Choose and lock the perimeter.

## Artefacts

Keep:

- The chosen rule and the UX copy for blocked export.
- If override exists: an explicit guardrail design (demo-only).

Throw away:

- Any design that silently drops `citation_failed` rows.

## Expected outcomes

- If straight shot: implement exactly as specified and write fixture tests for the blocked case.
- If tangle: cut override entirely; ship block-only export.
- If fog: defer exports until trust substrate is stable (unlikely; but call it out).

## Oracle pass

Pending (bundle created after shaping; see `tmp/oracle-bundles/`).

---

## Spike plan — Word artefact choice (memo vs objection/cure letter)

## Question

Which single Word artefact is most compelling for the demo audience: memo or objection/cure letter?

## Context

- Feature / concept: 3.2 Word export
- Related requirement(s): R2
- Why now: Template choice drives narrative and avoids wasted build effort.

## Success criteria

Proof looks like:

- Stakeholder picks one template in 15 minutes.
- We get 3-5 bullet requirements about what "must be in the Word export".

## Timebox

- Start: TBD
- Hard stop: TBD (15-30 minutes)

## Scope

Include:

- A paper mock outline for each template option (no formatting yet).
- A decision and a list of must-have sections.

Exclude:

- Any attempt at per-firm customisation.
- Any "perfect formatting" work.

## Approach

- Step 1: Draft two 1-page outlines (memo vs objection letter).
- Step 2: Ask stakeholder to choose (and say why).
- Step 3: Lock the template choice and section list.

## Artefacts

Keep:

- Chosen template name + section list.
- Any copy notes that materially affect what we render.

Throw away:

- Any formatting experiments beyond proving feasibility.

## Expected outcomes

- If straight shot: implement the chosen template only.
- If tangle: cut Word export entirely from the first demo-grade slice.
- If fog: pick memo by default (simpler) and move on.

## Oracle pass

Pending (bundle created after shaping; see `tmp/oracle-bundles/`).

---

## Spike plan — Minimal eval metrics that predict demo readiness

## Question

What 3-5 metrics are predictive enough for demo readiness without becoming a time sink?

## Context

- Feature / concept: 3.3 eval harness
- Related requirement(s): R3
- Why now: We want regression safety without building a full eval platform.

## Success criteria

Proof looks like:

- A small metric set maps directly to the trust UX:
  - schema validity
  - citation integrity
  - expected failure journeys (missing docs, bad citations)
- Metrics can be computed deterministically from fixtures without heavy model calls.

## Timebox

- Start: TBD
- Hard stop: TBD (2-4 hours)

## Scope

Include:

- At least 2 packs (happy path + missing-doc pack).
- At least one negative test pack (bad citation or deliberate failure).

Exclude:

- Complex scoring models or subjective "quality" metrics.
- Large-scale sampling.

## Approach

- Step 1: Implement metric computation on `pack_01_clean`.
- Step 2: Validate that it flags expected failures on `pack_02_missing_rea`.
- Step 3: Add one deliberate bad-citation fixture and ensure it fails closed.

## Artefacts

Keep:

- Final metric definitions.
- Example report output (JSON + Markdown).

Throw away:

- Extra metrics that don’t correlate with demo success.

## Expected outcomes

- If straight shot: lock metrics and wire into report-only CI.
- If tangle: cut down to schema validity + citation integrity only.
- If fog: stop and re-scope eval harness to a single "hard gates only" check.

## Oracle pass

Pending (bundle created after shaping; see `tmp/oracle-bundles/`).

---

## Spike plan — Demo repeatability controls and reset safety

## Question

Do we actually need demo mode, and if we do, what guardrails make reset provably safe?

## Context

- Feature / concept: 3.4 demo reliability pack (pack selector + reset + checklist)
- Related requirement(s): R4
- Why now: Reset is high-risk; demo mode can pollute UX if sloppy.

## Success criteria

Proof looks like:

- A clear justification for demo mode (or a decision to cut it).
- A reset design that cannot delete non-demo data:
  - demo-only allowlist
  - explicit confirmation flow
  - obvious audit/logging output

## Timebox

- Start: TBD
- Hard stop: TBD (2-3 hours)

## Scope

Include:

- Pack selector shape (loads fixture packs only).
- Reset endpoints shape (demo-only).

Exclude:

- Production onboarding wizard behaviours.
- Any "admin" surface beyond what demos need.

## Approach

- Step 1: Identify the minimum UI affordances needed for the operator.
- Step 2: Draft reset guardrails (allowlist + confirmation).
- Step 3: Decide "demo mode required?" and lock the perimeter.

## Artefacts

Keep:

- Guardrails design.
- Demo checklist first draft.

Throw away:

- Any attempts to generalise demo tooling into production onboarding.

## Expected outcomes

- If straight shot: build demo mode behind a feature flag and keep it isolated.
- If tangle: cut demo mode; rely on a written checklist and fixture scripts only.
- If fog: timebox a second spike; otherwise cut to avoid safety risk.

## Oracle pass

Pending (bundle created after shaping; see `tmp/oracle-bundles/`).
