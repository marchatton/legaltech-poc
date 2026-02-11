# Spike Investigation: 0009 User Journey V2 Parity Audit

Owner: marc  
Status: Planned  
Date: 2026-02-11

## Purpose

Track the unresolved, high-leverage unknowns that can cause scope drift or rework across the `0009a`..`0009g` PRD slices.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.json`

## Spike Backlog

| Spike ID | Question | Affected PRDs | Priority | Recommended Method | Decision Output |
|---|---|---|---|---|---|
| SP-0009-01 | What is the exact `selected_run_id` vs `effective_run_id` fallback contract when chat receives stale/missing `run_id`? | `0009c`, `0009d` | P0 | API contract spike with fixtures for valid/missing/stale run IDs + stream metadata assertions | Final request/response contract + mismatch UX copy rules |
| SP-0009-02 | What % of report/chat sources currently have resolvable anchors for jump-to-evidence? | `0009b`, `0009d` | P0 | Data sampling spike on current citation payloads + viewer jump simulation | Anchor coverage metric + enable/disable threshold + fallback copy standard |
| SP-0009-03 | Which document readiness states are required for setup UX without exposing backend pipeline internals? | `0009a` | P0 | UX+API state-model spike over documents endpoint payloads | Minimal state taxonomy and mapping table for setup screens |
| SP-0009-04 | Which endpoint/target should own support escalation from ErrorBanner? | `0009f` | P1 | Product+ops decision spike (mailto/internal route/no-op fallback) + safe payload review | Escalation target spec + allowed context fields (`code`, `trace_id`, route) |
| SP-0009-05 | Are existing run timestamps sufficient for coarse checklist elapsed-time display? | `0009e` | P1 | Telemetry feasibility spike over run metadata and timing edge cases | Go/No-go for minute-level elapsed display and fallback behavior |
| SP-0009-06 | Which UI polish checks are mandatory across all surfaces while preserving wireframe exclusions? | `0009g` | P1 | Design-system audit spike using `v5-final` tokens/preset + parity checklist pass | Mandatory polish checklist and guardrail matrix |

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

## Recommended Execution Order

1. SP-0009-03 (setup state taxonomy)
2. SP-0009-01 (chat run-scope contract)
3. SP-0009-02 (anchor coverage threshold)
4. SP-0009-05 (checklist elapsed feasibility)
5. SP-0009-04 (support escalation ownership)
6. SP-0009-06 (final polish checklist lock)

## Exit Criteria Per Spike

- A one-page decision note is produced with:
  - decision taken
  - alternatives rejected
  - affected PRD/story references
  - explicit cut line
- Relevant PRDs are patched in the same dossier after each spike closes.
