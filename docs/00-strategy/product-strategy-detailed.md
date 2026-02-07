# Product Strategy (Detailed, PoC)

This expands `docs/00-strategy/product-strategy-1-pager.md` with additional detail.
Keep it decision-oriented: what we are doing, what we are not doing, and why.

Framework reference (optional): keep definitions clean (vision vs strategy vs segmentation vs roadmap) and use explicit segmentation tests.

## Product stage
Explore (PoC). Goal: validate wedge + trust posture, not scale operations.

## Vision (near-term)
Practitioners can run a “first pass” Title + Survey analysis and get:
- a table of outputs that is actually usable
- every material claim backed by clickable evidence
- explicit failure states where the pack is missing inputs or verification fails

## Strategy (how we win)
Strategy is the function of segmentation and differentiation.

### Segmentation
See `docs/00-strategy/segmentation-notes.md` for hypotheses and validation plan.

### Differentiation (PoC)
We differentiate on trust and repeatability:
- Evidence-first contract (locked citations, snippet hashing, verification)
- Deterministic-ish workflows (explicit steps, replayable)
- Fixture-driven evaluation (synthetic packs + `/truth`)

## Strategic pillars
1) Trust substrate
- Evidence model, citation locking, viewer jump-to-highlight, fail-closed row statuses.

2) Quick Start engine
- Fixed question set v1.
- Hybrid retrieval and drafting from evidence only.
- Explicit failure journeys (`missing_input`, `citation_failed`).

3) Demo-grade outputs
- Exports (CSV + one Word memo).
- Evals and regression safety.
- Demo repeatability controls (dev-only).

## Key trade-offs (non-goals)
- No legal advice / materiality judgement.
- No external web research inside runs.
- No “agent autonomy” beyond the workflow’s constrained steps.
- No integrations or multi-tenant features in the PoC.

## Roadmap detail (thin slices)
Use the initiative docs as the authoritative plan:
- Initiative map: `docs/00-strategy/initiatives/initiative-overview-001-002-003.md`
- Dependency ordering: `docs/00-strategy/initiatives/001-003_dependency_plan.md`

Add finer-grained “Now/Next/Later” once spikes resolve open rabbit holes.

## Metrics and launch gates (PoC)
Leading:
- Citation integrity pass rate (hash + geometry + page exists).
- Time-to-verify.
- Fixture pack pass rates (start with `pack_01_clean` + one failure pack).

Gates:
- Any “un-cited material claim” is a NO-GO.
- Export remains blocked by default if any row is `citation_failed`.

## Open questions (to resolve before implementation)
- Chunking strategy: target chunk size, overlap, boundary rules.
- Embedding model + dimension + index parameters.
- Question set storage: file vs DB, version pinning, edit flow.
- Auth posture for PoC demos (even if “none”, be explicit).
