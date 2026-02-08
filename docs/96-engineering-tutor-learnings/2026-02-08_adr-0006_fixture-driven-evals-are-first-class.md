# ADR-0006: Fixture-driven evals are first-class

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Assumption: you are changing extraction, retrieval, citations, or export logic and you want demos to stop breaking in surprising ways.

The problem is drift. Small changes can make outputs subtly wrong while everything still "runs". That is how you ship a demo regression.

Fixture-driven evals make correctness measurable by keeping a small set of synthetic, version-controlled fixture packs (each with inputs and an answer key) and running `fixture:eval` to compare what the system produced against `/truth`. This starts as report-only and later becomes a CI gate on hard trust checks like schema validity and citation integrity.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: calibrating a scale with certified weights.

| Scale calibration | Fixture-driven evals |
| --- | --- |
| The scale | The end-to-end pipeline (ingest -> retrieve -> extract -> cite -> export) |
| Certified weights | Fixture pack `docs/` (known inputs) |
| The label on the weight | Fixture pack `truth/` (expected structured outputs and expected failures) |
| A measuring jig to check alignment | Fixture pack `layout/` (anchors/polygons to validate evidence geometry) |
| Calibration procedure | `fixture:eval` (compare produced vs truth, compute gates/metrics) |
| "Do not ship" stamp | CI gating once the suite is stable |

Where it breaks:
- A scale outputs one number; this system outputs structured data plus evidence and can include nondeterministic components.
- Some checks are hard invariants (schema, citation integrity). Other checks are better as trends at first (recall@K, duration, cost), so we start report-only and gate later.

## Visual explanation (small ASCII diagram)
```text
docs/08-example-data/pack_x/
  manifest.json   (what to load; no inference)
  docs/           (inputs)
  layout/         (optional early; anchors/polygons)
  truth/          (expected outputs + expected failure journeys)
        |
        v
 run pipeline -> produced outputs (rows, citations, exports, ...)
        |
        v
 fixture:eval compares produced vs truth
        |
        v
 per-pack report + cross-pack summary  ->  (later) CI hard gate
```

## Step-by-step breakdown
1. Create or update a fixture pack under `docs/08-example-data/<pack_id>/` with `manifest.json`, `docs/`, `truth/`, and optionally `layout/`.
2. Produce outputs for that pack (either by running the pipeline or using saved snapshots, depending on the phase of the harness).
3. Run `pnpm fixture:eval <pack_id>` (or `pnpm fixture:eval:all`) to generate a per-pack report and a cross-pack summary.
4. If the report fails, decide whether the system regressed (fix code) or intended behavior changed (update `/truth` deliberately, like a golden test).
5. Keep it report-only until stable, then gate CI on hard trust metrics first; promote softer metrics to gates only after the fixture suite and chunking stabilize.

Inputs (what `fixture:eval` needs):
- `docs/08-example-data/<pack_id>/manifest.json`
- `docs/08-example-data/<pack_id>/docs/` (source documents)
- `docs/08-example-data/<pack_id>/truth/` (expected outputs and expected failure journeys)
- `docs/08-example-data/<pack_id>/layout/` (anchors/layout JSON when evidence geometry is in play)
- Produced snapshots for the pack (when using snapshot-first evals)

Outputs:
- Per-pack eval report (often JSON, paired with a human-readable summary)
- Cross-pack summary table
- Optional non-zero exit for CI gating once enabled

Constraints:
- Pack loading and evals must be manifest-driven. No inferring file paths.
- Hard trust checks must fail closed (especially citation integrity).
- CI should start report-only, then gate once fixtures and thresholds are stable.

Trade-offs:
- You spend time maintaining packs and truth files.
- You gain fast, repeatable regression detection and clearer debugging than ad hoc demo checks.

Failure modes to watch for:
- Flaky evals due to nondeterminism (leads to ignored failures).
- Truth drift where `/truth` is updated to match a bug instead of fixing the bug.
- Overfitting to synthetic packs and missing real-world edge cases.
- Gating too early on unstable metrics (like recall@K before chunking stabilizes).

Why this design vs alternatives:
- Manual demos: fixtures catch regressions earlier and deterministically.
- Unit tests only: fixtures cover end-to-end integration where most demo failures happen.
- LLM-judge-only evals: fixtures give reproducible failures tied to concrete truth artifacts.
- Monitoring-only: fixtures give a tight local feedback loop before changes reach a demo or deployment.

## Common misunderstandings
- "Fixtures are just sample data." They are an executable contract: inputs plus expected outputs plus expected failures.
- "Only success cases matter." Packs should encode expected failure journeys (`missing_input`, `citation_failed`, etc).
- "We can infer paths from folder structure." The system must read `manifest.json` and fail loudly if it is missing.
- "Recall@K should be a hard gate immediately." Start report-only; gate hard invariants first, then promote thresholds once stable.
- "Layout is required for everything." `layout/` is optional early, but becomes important when you need evidence geometry and overlays to be trustworthy.

## Check understanding (teach-back question)
If you change the citation snippet hashing rule, what do you expect `fixture:eval` to report, and why should that failure block CI once hard gating is enabled?

