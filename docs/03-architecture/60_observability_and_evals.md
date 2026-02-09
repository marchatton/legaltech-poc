# Observability and evals

> Note: This document describes the **target** observability/evals posture. For what is implemented today, see
> `docs/03-architecture/07_current_poc_runtime.md`.

This PoC lives or dies on debuggability and demo reliability. "Trust UX" requires that we can:
- explain what happened (runs + steps + rows)
- prove evidence integrity (citations + hashing)
- detect regressions quickly (fixture-driven evals)

See also:
- Failure-first state rules: `docs/03-architecture/20_state_model.md`
- Data + provenance shape: `docs/03-architecture/30_data_model.md`
- API error envelope + trace_id: `docs/03-architecture/50_api_surface.md`

## Correlation model (what IDs tie the system together)
Use these identifiers consistently across logs, DB provenance, and (where safe) UI debug panels:
- `trace_id`: per inbound request (API) and per workflow start. Include in error envelopes.
- `folder_id`: the Matter.
- `run_id`: one Quick Start attempt.
- `step_key`: deterministic idempotency key for a step execution.
- `question_id`: the row being processed.
- `citation_id`: locked evidence object (user-visible).

Rule of thumb:
- A log line without `{trace_id, run_id, step_key}` is usually not actionable.

## What we log
Run-level:
- run_id, folder_id, state, started/completed timestamps
- index_version, agent_bundle_version, question_set_version
- step timings and retry counts
- failure taxonomy counts (see below)

Row-level:
- question_id
- retrieved chunk IDs (and scores if available)
- verification verdict and reason codes
- final status and citation IDs

LLM calls:
- model, prompt version hash
- tokens, latency, cost
- retrieved chunk IDs used

### Logging safety (non-negotiable)
- Do not log raw PDF bytes.
- Avoid logging full extracted document text.
- For debugging, prefer stable identifiers (`chunk_id`, `citation_id`, `snippet_hash`) over raw content.
- `error_json` must be safe to show to a user when needed (no stack traces, no provider payload dumps).

### Telemetry redaction defaults
Default to redacting or hashing all user content and model I/O in logs, traces, and exports.
- Always redact: raw document text, extracted OCR text, model prompts, model responses, embeddings, provider headers, auth tokens, file paths, and any user PII.
- Prefer: stable identifiers, snippet hashes, page numbers, and aggregate metrics.
- If a snippet is required for debugging, include the minimum excerpt and attach a `snippet_hash` so it can be verified offline.

### Trace export redaction rules
Trace exports are shareable artifacts and must be safe-by-default.
- Redaction profile: `default` (no raw content, no prompts, no model outputs).
- Allowed fields: ids (`trace_id`, `run_id`, `step_key`, `question_id`), timings, counts, code enums (`failure_code`, `reason_code`), and hashes.
- Optional “debug” profile (explicitly gated): allow short snippets only if a reviewer opts in and the export is stored in a restricted location.

### Structured log shape (suggested)
Use JSON logs with consistent keys:
```json
{
  "level": "info",
  "event": "run.step.completed",
  "trace_id": "trc_...",
  "folder_id": "fld_...",
  "run_id": "run_...",
  "step_key": "quick_start:BII-01:verify",
  "question_id": "BII-01",
  "duration_ms": 1234,
  "failure_code": null
}
```

## Failure taxonomy (tiers + code sources)
We track two tiers to avoid mixing step failures with row verification outcomes.

Tier 1: step-level `failure_code`
- Scope: `run_steps.error_json` + run-level counters.
- Meaning: a step execution failed or produced unusable output.
- Examples (current): `OCR_FAIL`, `LAYOUT_FAIL`, `CHUNKING_FAIL`, `RETRIEVAL_MISS`, `RERANK_BAD`, `EXPORT_FAIL`.

Tier 2: row-level `reason_code`
- Scope: `report_rows.provenance_json.reason_code` when `row_status=citation_failed`.
- Meaning: deterministic verification failed for that row (safe for UI + exports).
- Current verifier/fixture codes (v1):
  - `VALIDATION_ERROR` (bad input or malformed row payloads)
  - `MISSING_INPUT_INVARIANT` (missing_input answers must have zero citations)
  - `NO_CITATIONS` (row has no evidence)
  - `CITATION_MISMATCH` (snippet/hash mismatch or wrong snippet)
  - `NO_ANCHORS_FILE` (fixture anchor list missing)
  - `ANCHOR_NOT_FOUND` (fixture anchor missing)

Mapping rules (to prevent drift):
- `failure_code` is for step execution failures (Tier 1). It must never be stored in row provenance.
- `reason_code` is for row-level verification outcomes (Tier 2). It must never be used as a step failure counter.
- If a CSV export schema uses a header named `failure_code`, that column must still carry the Tier 2 row `reason_code` (not Tier 1 step failure codes).

Reserved (not baseline; future use only):
- Entailment codes (`ENTAILMENT_*`) are explicitly reserved for a future semantic verifier and should not be used as baseline fixtures or dashboards.
- `VERIFICATION_FALSE_PASS` is eval-only and should never appear in row provenance.

Notes:
- Prefer adding new codes over reusing an existing code with broader meaning; taxonomy drift makes dashboards useless.

## Baseline metrics + thresholds (PoC defaults)
Start with a small set that directly supports “trust UX”.

Hard gates (must be 100% for a demo pack to pass):
- **Schema validity:** every produced report row validates against the Zod schema.
- **Citation integrity:** for every citation_id used by a `needs_review|reviewed` row:
  - cited page exists
  - polygons exist
  - `snippet_hash` matches canonical snippet hashing rule
- **Failure journeys:** fixture packs designed to fail must fail in the expected way:
  - missing docs → `missing_input`
  - bad citation → `citation_failed`
- **Export truth match (Initiative 0003 only):** when export features are in scope, generated CSV outputs must match `/truth` exactly (deterministic headers + row ordering).

Report-only (track, don’t gate yet):
- **Retrieval Recall@K** on golden questions (start at K=10). Suggested initial target: `>= 0.85` per pack.
- **Extraction quality distribution:** min/mean/p95 of `documents.extraction_quality` (watch for regressions when changing OCR/layout).
- **End-to-end duration:** ingest time and run time (p50/p95), for demo predictability.
- **Cost per run:** tokens and estimated $ (track before optimising).

## How metrics are used
- Phase 0 (default): `fixture:eval` always produces a JSON report + summary table. CI posts the summary (report-only).
- Phase 1: CI gates on the “hard gates” above (schema + citation integrity + failure journeys).
- Phase 1 (Initiative 0003): include export truth match in hard gating when export features are in scope.
- Phase 2: CI additionally gates on retrieval Recall@K thresholds once packs and chunking stabilise.

The goal is to move as little as possible into gating until the fixture suite is stable, but never compromise on citation integrity.

## Evals (fixture-driven)
Inputs:
- fixture pack manifest at `docs/08-example-data/<pack_id>/manifest.json` (required; eval runners must read manifests, not infer)
- synthetic packs with `/docs`, `/truth`, `/layout`
- golden questions JSON per pack
Callout:
- Any demo pack loader must also be manifest-driven (read manifest, fail if missing, no inference).

Minimum checks:
1) extraction correctness vs `/truth`
2) citation validity: page exists, polygons exist, snippet hash matches
3) retrieval recall@K on golden questions
4) failure journeys:
   - missing docs → `missing_input`
   - bad citation → `citation_failed`
5) export truth match (Initiative 0003 only): generated CSV outputs match `/truth` exactly (deterministic headers + row ordering)

Outputs:
- per-pack eval report JSON
- summary table across packs
- optional CI gate when stable

### Eval report JSON (suggested)
Example shape (not a strict schema yet):
```json
{
  "pack_id": "pack_01_clean",
  "versions": {
    "index_version": "v1",
    "agent_bundle_version": "git:abc123",
    "question_set_version": "qs:quick_start_title_survey:v1"
  },
  "hard_gates": {
    "schema_validity": { "pass": true, "failures": 0 },
    "citation_integrity": { "pass": true, "failures": 0 },
    "failure_journeys": { "pass": true, "failures": 0 },
    "export_truth_match": { "pass": true, "failures": 0 }
  },
  "metrics": {
    "retrieval_recall_at_k": { "k": 10, "value": 0.9 },
    "run_duration_ms": { "p50": 120000, "p95": 180000 },
    "tokens_total": 123456
  },
  "taxonomy_counts": {
    "RETRIEVAL_MISS": 2,
    "CITATION_MISMATCH": 0
  }
}
```

## Alignment checklist (docs + scripts)
These references should match the tiered taxonomy and v1 reason codes above:
- `packages/core/src/verify/verifier.ts`
- `packages/core/src/verify/verifier.schemas.ts`
- `scripts/fixtures/assert_row_invariants.ts`
- `scripts/fixtures/seed.ts`
- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/30_data_model.md`
- `docs/03-architecture/40_rag_and_agents.md`
- `docs/03-architecture/50_api_surface.md`
- `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md`
- `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`
- `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
- `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/prd.md`
- `docs/04-projects/02-features/0004_csv-export/prd.md`
- `docs/08-example-data/pack_09_bad_citation/truth/expected_failure_journeys.json`

## Debug playbook (fast path)
When a run fails or export is blocked, prefer a deterministic investigation:
1) Identify the failure taxonomy code and the step_key where it occurred.
2) Inspect the persisted provenance and citations for that row.
3) Use fixtures to reproduce the failure deterministically, then fix the smallest broken link.

Suggested SQL pivots (examples; adapt to actual schema/migrations):
```sql
-- Recent failed steps for a run
select step_key, step_type, state, attempt, error_json
from run_steps
where run_id = 'run_123' and state = 'failed'
order by created_at desc;
```
