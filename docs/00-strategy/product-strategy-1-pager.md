# Product Strategy One-Pager (PoC)

This is a working strategy snapshot for the Orbital Copilot PoC. Treat it as editable.
If you need a full strategy pack, start here then expand `product-strategy-detailed.md`.
Template: one-sentence strategy, segments, pillars, roadmap shape, metrics, decisions.

## One-sentence strategy
Build a defensible “Quick Start: Title + Survey” workflow for US CRE diligence that produces evidence-backed artefacts fast enough to be useful and strict enough to be trusted.

## Positioning (internal)
- Where to play: US CRE title + survey due diligence workflows (law firm practitioners).
- Macro problem: packs are large and messy; verification is costly; errors are expensive.
- Key alternatives/competitors:
  - Manual review + checklists + Word templates
  - Generic chat/RAG tools that don’t lock citations
  - Purpose-built diligence tools (varies by firm and deal type)

## Target segments
- Segmentation dimensions (hypotheses):
  - Role: associate/paralegal vs partner/reviewer
  - Deal cadence: high-volume diligence vs occasional
  - Pack quality: clean digital PDFs vs scans/rotations/missing exhibits
  - Workflow maturity: process-driven teams vs ad hoc
- P0 segments:
  - Internal demo operator + 1 friendly practitioner reviewer
  - Teams doing repeatable “first pass” diligence where speed-to-trust matters
- P1 segments:
  - Mid-size firms doing frequent CRE deals with standard deliverable expectations
- Non-targets:
  - Consumer real estate
  - “Fully automated legal judgement” expectations
- Why (tests + bias checkers):
  - Needs are consistent and product-specific (evidence-first, repeatable outputs).
  - Targetable and winnable in a PoC (we can validate with fixtures + practitioner feedback).

## Market context & map
- Market direction: “workflow AI” wins where it produces defensible artefacts, not just answers.
- Strategic themes:
  - Trust and auditability (evidence locking, verification)
  - Deterministic workflow orchestration
  - Fixture/eval-driven reliability
- Market map summary: TBD (add when competitors are mapped in `docs/01-insights/competitors/`).
- B/T/D decisions: TBD (below / table-stakes / differentiate per theme).

## Strategic pillars (2–6)
1) Evidence-first trust substrate (citations, viewer, verification, failure states)
2) Deterministic-ish Quick Start engine (retrieve -> draft -> lock -> verify -> write)
3) Repeatability (fixtures, evals, exports, demo reliability controls)

## Non-priorities (trade-offs)
- What will not be built or will be deprioritised:
  - Freeform chat as the primary UX
  - External web research inside runs
  - Materiality judgement / negotiation posture
  - Multi-tenant admin, SSO/RBAC, integrations
  - Property visualisation / boundary plotting (stretch only)
- Why:
  - These either expand the surface area too early or undermine the trust posture.

## Roadmap shape (Now / Next / Later)
- Now:
  - Initiative 001 (trust substrate): viewer + citations + fail-closed row statuses
- Next:
  - Initiative 002 (Quick Start engine): fixed question set v1, pack parsing, run orchestration
- Later:
  - Initiative 003 (demo-grade outputs): exports, eval harness, demo repeatability

## Metrics
- Leading indicators:
  - Time-to-first-row (from run start)
  - Time-to-verify (click citation -> confirm evidence)
  - % rows with locked citations (vs missing_input/citation_failed)
  - Fixture eval pass rate on `pack_01_clean` + one failure pack
- Lagging indicators:
  - Practitioner “would use” signal for the table outputs
  - Export usefulness (CSV/Word accepted with minimal edits)
- Guardrails:
  - False certainty: any un-cited material claim is a bug
  - “Citation failed” rows must block export by default

## Recommended decisions & actions
- Open questions:
  - How do we represent table-shaped artefacts inside the report-row model without breaking invariants?
  - What is the question set v1 (<=25) and who signs it off?
  - What is the “good enough” OCR quality gate for `ready` vs “runnable at indexed”?
- Dependencies:
  - Fixture packs and `/truth` must remain canonical and stable.
  - Architecture contracts must stay small and consistent.
- Staffing/alignment asks:
  - Identify one practitioner reviewer for question set + output review.
