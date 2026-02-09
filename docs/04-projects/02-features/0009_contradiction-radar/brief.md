# Brief: 0009 Contradiction Radar (Evidence-Backed Consistency Checks)

- Dossier: `docs/04-projects/02-features/0009_contradiction-radar/`
- Status: Draft
- Appetite: 2-3 days (PoC slice)
- Owner:

## Context (why this, why now)
In US CRE diligence, the scary failures are often not "missed a clause", but "two documents disagree and nobody noticed". The manual workflow is a cross-document scavenger hunt: title vs survey, commitment vs exception instruments, survey revisions vs certifications.

Orbital's PoC already proves a key wedge: trust is checkable in the UI (locked citations + click-to-highlight evidence; fail closed when invariants break). Contradiction Radar extends that wedge from "check the evidence for a row" to "find the rows you should be checking".

## Problem
Today, contradictions are found by humans (late) or not found (ever). The PoC surfaces evidence for seeded rows, but it does not proactively detect and present cross-document inconsistencies as first-class, auditable issues.

## Goals (what "wow" looks like)
- One click runs a deterministic **Consistency Scan** for a matter and produces a ranked list of contradictions.
- Each contradiction is a structured object with at least two cited values (A vs B) and a severity.
- Clicking a contradiction opens a side-by-side evidence view: each side can jump to the exact highlighted clause in the PDF viewer.
- Evidence posture is preserved:
  - if a value is not backed by a **verified** citation, it is rendered as `missing_evidence` (not guessed)
  - contradictions are not exportable as "verified" unless both sides verify (fail closed)

## Non-goals (explicit cuts)
- Not a full "Quick Start" workflow or report generator.
- Not a semantic truth model (no entailment/NLI judge in v1).
- Not a broad extraction engine for every field in every doc format.
- No external web research, integrations, or multi-tenant auth work.

## Perimeter lock (in scope)
Thin slice (2-3 days):
- New UI surface: `Consistency` tab for a matter, showing a list of contradictions + filters (severity, category, doc pair).
- Minimal fact set (start small, high signal, fixture-driven):
  - Survey certification gaps / mismatches
  - Title vs survey mismatches that already exist as fixture truth (e.g. `pack_03_mismatch_and_cert_gap`)
- Data contract for contradictions (typed, testable):
  - `EvidenceBackedValue = { value_raw, value_normalized, citation_ids[], snippet_hashes[] }`
  - `Contradiction = { id, key, left: EvidenceBackedValue, right: EvidenceBackedValue, severity, status }`
- Comparator rules (deterministic): dates, currency, percent, string equivalence, "missing vs present".
- Viewer integration: click a value -> jump to citation(s) and highlight.

## Explicit out of scope (for this slice)
- Persisting contradictions to DB (compute from fixture snapshot for now).
- Exporting a polished "Exceptions Memo" document (OK to add a JSON/CSV export later once the core loop is proven).
- Fuzzy entity matching beyond fixture-provided stable IDs.

## Demo script (panel-friendly)
1. Open `pack_03_mismatch_and_cert_gap` and click `Consistency`.
2. See 3-8 contradictions ranked by severity.
3. Click one contradiction: A vs B values appear with citation chips.
4. Click the left citation chip: viewer jumps and highlights the exact clause.
5. Click the right citation chip: viewer jumps and highlights the conflicting clause.
6. Switch to `pack_01_clean`: contradictions list is empty (or low-severity only), proving determinism and low-noise.

## Acceptance signals (fixture-driven)
- `pack_03_mismatch_and_cert_gap`: expected contradiction IDs render with verified highlight overlays.
- `pack_01_clean`: zero high-severity contradictions.
- `pack_02_missing_rea`: contradictions that depend on missing docs show `missing_evidence` and never "invent" values.
- Any `citation_failed` value disables "verified" posture and shows an explicit reason (no best-effort).

## Constraints / guardrails
- Must preserve evidence-first posture (locked citations; fail closed verification). See `docs/03-architecture/DECISIONS.md`.
- Must preserve state model invariants (e.g. `missing_input` semantics). See `docs/03-architecture/20_state_model.md`.
- Validate inputs at boundaries with Zod; return safe error envelopes. See `docs/03-architecture/50_api_surface.md`.
- No external web research inside runs (ADR-0007).

## Top risks / unknowns (treatments)
- Extraction rabbit hole: keep v1 fixture-driven + small fact set. (Cut for now.)
- False positives from normalization: show normalized + raw values and the comparator rule used. (Patch.)
- UX overwhelm: severity ranking + filters + dedupe rules. (Patch.)
- Overlap with Initiative 0002 "survey reconciliation issues": treat Contradiction Radar as a generic engine that can later feed those artefacts; do not fork logic. (Patch via shared contracts.)

## Open questions
- Which 5-10 fact keys are the highest-signal v1 set for title + survey (to stay relevant and low-noise)?
- Should contradictions live as a standalone tab (recommended) or inside the report table as special rows?
- Do we need an "operator override" (mark as equivalent / accepted) in PoC v1, or keep it read-only?

## Shaping decision (GO/NO-GO)
- GO when the demo script above is deterministic on fixture packs and every contradiction is fully evidence-backed (or explicitly `missing_evidence`).
- NO-GO if contradictions require broad extraction work or produce noisy false positives without a crisp mitigation.

