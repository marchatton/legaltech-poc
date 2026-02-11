# 0009 Sequencing and Parallelization Note

Date: 2026-02-11

## Cross-PRD blockers (hard gates)

- `0009b` depends on setup/data readiness from `0009a`; practical unblocker is `0009a/US-003` before starting `0009b/US-001`.
  - Source: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.md:165`
- `0009d` depends on run selector contract from `0009c` and evidence viewer route integration from `0009b`.
  - Practical unblockers: `0009c/US-001` and `0009b/US-003`.
  - Source: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009d_chat-run-scoping/prd.md:164`
- `0009g` is a final consolidation wave and depends on core surfaces from `0009a`..`0009f` being in place.
  - Source: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009g_ui-polish-sweep/prd.md:161`

## Intra-PRD story dependencies

- `0009a`: `US-001 -> US-002 -> US-003 -> US-004`
- `0009b`: `US-001 -> US-002 -> (US-003 -> US-004)` and `US-005` after `US-002`
- `0009c`: `US-001 -> (US-002 || US-003)` and `US-004` after `US-003`
- `0009d`: `US-001 -> US-002 -> (US-003 || US-004)` and `US-005` after `US-001`
- `0009e`: `US-001 -> US-002 -> US-003`
- `0009f`: `US-001 -> US-002 -> (US-003 || US-004)`
- `0009g`: `US-001 -> (US-002 || US-003) -> US-004`

`||` means these stories can run in parallel once their dependency is complete.

## Suggested execution waves (max parallel while respecting blockers)

1. Wave 1 (parallel start): `0009a`, `0009c`, `0009f` (and `0009e` if required run metadata is already available).
2. Wave 2: start `0009b/US-001` immediately after `0009a/US-003` is done.
3. Wave 3: start `0009d` as soon as `0009c/US-001` is done; prioritize `0009d/US-001`, `0009d/US-002`, `0009d/US-005`.
4. Wave 4: start `0009d/US-003` only after both `0009d/US-002` and `0009b/US-003` are complete.
5. Final wave: run `0009g` after `0009a`..`0009f` are complete.

## Earliest-start triggers by blocker story

- `0009a/US-003` complete -> `0009b/US-001` can start.
- `0009c/US-001` complete -> `0009d/US-001`/`US-002`/`US-005` can start.
- `0009b/US-003` + `0009d/US-002` complete -> `0009d/US-003` can start.
- `0009a..0009f` complete -> `0009g` can start.
