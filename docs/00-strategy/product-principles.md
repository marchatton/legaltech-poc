# Product Principles (PoC)

These principles are the “default posture” for product decisions in this repo.
They should align with the architecture defaults in `docs/03-architecture/*`.

## Principles
1) Evidence-first
- No evidence, no claim.
- “Not found” is a valid output and must be explicit.

2) Trust UX is the wedge
- A reviewer should be able to verify an answer in ~10 seconds:
  citation chip -> highlighted clause -> snippet hash -> row status.

3) Deterministic-ish over clever
- Prefer explicit workflows + steps over free-running agent loops.
- Structured outputs and versioned schemas beat prose.

4) Fail closed, fail loud
- If citations cannot be locked/verified, the row must not be exportable by default.
- Surface failure reasons with actionable next steps.

5) Artefacts-first UX
- The report table (and its exports) is the centre of gravity.
- Chat is optional tooling, not the product.

6) Fixture-driven reliability
- Treat `docs/08-example-data/*` packs + `/truth` as acceptance anchors.
- Regressions should be caught before demo day.

7) Keep contracts small and explicit
- Prefer a small canonical state model + API surface over implicit behaviours.
- Version anything that becomes an interface (question sets, index versions, prompt bundles).

8) Be honest about scope and non-goals
- No legal advice / materiality judgement.
- No external web research inside runs.
- Avoid overpromising on OCR/messy pack coverage until proved by fixtures.

## When these conflict
Default ordering:
Evidence-first -> Trust UX -> Determinism -> Fixture reliability -> Speed.

## Canonical references
- State invariants: `docs/03-architecture/20_state_model.md`
- API contract: `docs/03-architecture/50_api_surface.md`
- Decisions/ADRs: `docs/03-architecture/DECISIONS.md`
