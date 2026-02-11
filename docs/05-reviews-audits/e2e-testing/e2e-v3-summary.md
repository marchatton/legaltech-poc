# E2E V3 PRD Pair Summary

Date: 2026-02-11
Scope source:
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`

## What this set contains

10 E2E slices, each as a pair:
- `prd.md`
- `prd.json`

All slices use:
- Given/When/Then acceptance style
- At least one Example criterion
- At least one Negative criterion
- Shared quality gates: `pnpm lint`, `pnpm typecheck`, `pnpm test`

## Priority Order

### P0 (run first)
1. `0005_trust-viewer-loop` (F5: evidence trust + fail-closed citation path)
2. `0006_run-scoped-export-loop` (F6: safe exports + failed-row return loop)
3. `0010_cross-surface-error-contract` (F10: deterministic error/retry/support behavior)

### P1
1. `0002_matter-discovery-setup-lane` (F2)
2. `0003_run-readiness-triage-core` (F3)
3. `0004_drawer-first-review-decisions` (F4)
4. `0008_l1-run-scoped-chat` (F8)
5. `0009_demo-operator-loop` (F9)

### P2
1. `0001_shell-wayfinding-baseline` (F1)
2. `0007_artefact-provenance-retrieval` (F7)

## Slice Inventory

| Slice | Priority | Folder | Journey Part |
|---|---|---|---|
| E2E-V3-0001 | P2 | `0001_shell-wayfinding-baseline` | F1 Shell wayfinding baseline |
| E2E-V3-0002 | P1 | `0002_matter-discovery-setup-lane` | F2 Discovery + setup lane |
| E2E-V3-0003 | P1 | `0003_run-readiness-triage-core` | F3 Run readiness + triage core |
| E2E-V3-0004 | P1 | `0004_drawer-first-review-decisions` | F4 Drawer-first decisions |
| E2E-V3-0005 | P0 | `0005_trust-viewer-loop` | F5 Trust viewer loop |
| E2E-V3-0006 | P0 | `0006_run-scoped-export-loop` | F6 Run-scoped export loop |
| E2E-V3-0007 | P2 | `0007_artefact-provenance-retrieval` | F7 Artefact provenance retrieval |
| E2E-V3-0008 | P1 | `0008_l1-run-scoped-chat` | F8 L1 run-scoped chat |
| E2E-V3-0009 | P1 | `0009_demo-operator-loop` | F9 Demo operator loop |
| E2E-V3-0010 | P0 | `0010_cross-surface-error-contract` | F10 Cross-surface error contract |

## Notes

- Existing prior slices `0001`..`0003` were replaced as requested.
- No overall PRD was created; this summary is a map/index only.
