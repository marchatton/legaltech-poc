# Ralph Loop Note: Journey Grouping + Granular Stories

Date: 2026-02-11
Owner: marc

## Decision

Use journey-grouped decomposition with granular stories for Ralph execution.

- Prior shape: 10 separate E2E slices (`0001`..`0010`)
- New default: 1 consolidated PRD with 14 stories across 4 core journeys
- Granularity is preserved through explicit scenario-step checklists in each story

## Why

- Story-level granularity was preferred over fewer broad slices.
- Core journeys provide planning/reporting structure without reducing detail.
- Ralph still runs one story per iteration.

## Canonical Files

- `docs/05-reviews-audits/e2e-testing/e2e-v3-summary.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.md`
- `docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json`

## Run Command

```bash
ralph build 1 --agent=codex --prd docs/05-reviews-audits/e2e-testing/prd-ralph-v3.json --no-commit
```

Run once per completed story (14 total for full pass).

## Reference

Legacy slice PRDs under `docs/05-reviews-audits/e2e-testing/0001_*` through `0010_*` remain available for targeted regression isolation.
