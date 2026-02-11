# Spike Investigation: 0009 User Journey V2 Parity Audit

Owner: marc  
Status: Active (2 resolved, 4 open)  
Date: 2026-02-11

## Purpose

Track high-leverage unknowns and resolved decisions that can cause scope drift or rework across the `0009a`..`0009g` PRD slices.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.json`

## Spike Backlog

| Spike ID | Question | Affected PRDs | Priority | Status | Recommended Method | Decision Output |
|---|---|---|---|---|---|---|
| SP-0009-01 | What is the exact `selected_run_id` vs `effective_run_id` fallback contract when chat receives stale/missing `run_id`? | `0009c`, `0009d` | P0 | Open | API contract spike with fixtures for valid/missing/stale run IDs + stream metadata assertions | Final request/response contract + mismatch UX copy rules |
| SP-0009-02 | What % of report/chat sources currently have resolvable anchors for jump-to-evidence? | `0009b`, `0009d` | P0 | Open | Data sampling spike on current citation payloads + viewer jump simulation | Anchor coverage metric + enable/disable threshold + fallback copy standard |
| SP-0009-03 | Which document readiness states are required for setup UX without exposing backend pipeline internals? | `0009a` | P0 | Resolved (2026-02-11) | Completed via canonical folder/document state-model review + setup contract alignment. | Locked to canonical states (`empty`,`ingesting`,`indexed`,`ready`,`failed` + parse/ocr progression) in `0009a` PRD JSON. |
| SP-0009-04 | Which endpoint/target should own support escalation from ErrorBanner? | `0009f` | P1 | Resolved (2026-02-11) | Completed via parity-v1 support path decision with safe payload constraints. | Locked to config-driven `mailto` target + fallback guidance in `0009f` PRD JSON; no ticketing endpoint in v1. |
| SP-0009-05 | Are existing run timestamps sufficient for coarse checklist elapsed-time display? | `0009e` | P1 | Open | Telemetry feasibility spike over run metadata and timing edge cases | Go/No-go for minute-level elapsed display and fallback behavior |
| SP-0009-06 | Which UI polish checks are mandatory across all surfaces while preserving wireframe exclusions? | `0009g` | P1 | Open | Design-system audit spike using `v5-final` tokens/preset + parity checklist pass | Mandatory polish checklist and guardrail matrix |

## Exclusion Guardrails (Must Hold During Spikes)

- Do not reintroduce cut wireframe items:
  - `W-C3` hardcoded labels/IDs/dates
  - `W-C4` hardcoded ingest stats
  - `W-C5` unsupported upload capability promises
  - `W-C7` trust claims without source-backed fields
  - `W-C11` second-level precision timers
- Keep implementation design-system-first:
  - Use/extend Orbital components and tokens.
  - Use wireframes and magic patterns as interaction inspiration only.

## Remaining Execution Order

1. SP-0009-01 (chat run-scope contract)
2. SP-0009-02 (anchor coverage threshold)
3. SP-0009-05 (checklist elapsed feasibility)
4. SP-0009-06 (final polish checklist lock)

## Resolved Decisions

- SP-0009-03 resolved in `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.json`.
- SP-0009-04 resolved in `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.json`.

## Exit Criteria Per Spike

- A one-page decision note is produced with:
  - decision taken
  - alternatives rejected
  - affected PRD/story references
  - explicit cut line
- Relevant PRDs are patched in the same dossier after each spike closes.
