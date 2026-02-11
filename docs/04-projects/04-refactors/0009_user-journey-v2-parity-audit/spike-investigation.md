# Spike Investigation: 0009 User Journey V2 Parity Audit

Owner: marc  
Status: Decision-locked (6 resolved, implementation pending)
Date: 2026-02-11

## Purpose

Track spike decisions that were resolved in the oracle dossier and keep implementation sequencing explicit across slices `0009a`..`0009g`.

## Sources

- `docs/04-projects/04-refactors/0007_empty-text-sentinel-chunks/oracle-spike-response.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prd-overall.json`

## Spike Decision Register

| Spike ID | Question | Affected PRDs | Priority | Status | Locked decision | Decision output |
|---|---|---|---|---|---|---|
| SP-0009-01 | What is the exact `selected_run_id` vs `effective_run_id` fallback contract when chat receives stale/missing `run_id`? | `0009c`, `0009d` | P0 | Resolved (2026-02-11) | Soft fallback to deterministic `effective_run_id` with mandatory mismatch disclosure and reason code. | Contract includes `selected_run_id`, `effective_run_id`, `scope_mismatch`, `scope_reason`, and fallback to `effective_index_version` when no completed runs exist. |
| SP-0009-02 | What % of report/chat sources currently have resolvable anchors for jump-to-evidence? | `0009b`, `0009d` | P0 | Resolved (2026-02-11) | Strict anchor-only jump behavior in parity v1. | Chips are clickable only when anchor is ready; disabled copy otherwise; default clickable emphasis is gated by `>=80%` measured anchor coverage. |
| SP-0009-03 | Which document readiness states are required for setup UX without exposing backend pipeline internals? | `0009a` | P0 | Resolved (2026-02-11) | Canonical folder/document state model only. | Locked to `empty`, `ingesting`, `indexed`, `ready`, `failed` plus parse/ocr progress states in `0009a`. |
| SP-0009-04 | Which endpoint/target should own support escalation from ErrorBanner? | `0009f` | P1 | Resolved (2026-02-11) | Config-driven `mailto` support escalation with deterministic fallback. | `Need help?` uses safe context only; if unset, fallback guidance with copyable identifiers is required. |
| SP-0009-05 | Are existing run timestamps sufficient for coarse checklist elapsed-time display? | `0009e` | P1 | Resolved (2026-02-11) | Extend run read contracts with timestamps and compute coarse elapsed in UI. | `created_at` (or `started_at` when available) is the elapsed baseline; render minute-level only; show `Elapsed unavailable` when timestamps are missing. |
| SP-0009-06 | Which UI polish checks are mandatory across all surfaces while preserving wireframe exclusions? | `0009g` | P1 | Resolved (2026-02-11) | Lock a mandatory 3-check polish gate + exclusion guardrail audit. | Required checks: state clarity, ErrorBanner consistency, and interaction accessibility; guardrails enforce W-C3/W-C4/W-C5/W-C7/W-C11 cuts. |

## Exclusion Guardrails (Must Hold During Implementation)

- Do not reintroduce cut wireframe items:
  - `W-C3` hardcoded labels/IDs/dates
  - `W-C4` hardcoded ingest stats
  - `W-C5` unsupported upload capability promises
  - `W-C7` trust claims without source-backed fields
  - `W-C11` second-level precision timers
- Keep implementation design-system-first:
  - Use/extend Orbital components and tokens.
  - Use wireframes and magic patterns as interaction inspiration only.

## Implementation Sequence (Post-Spike)

1. Must land first: `N7` (`GET /api/folders/:id/runs`) for shared run selector inputs.
2. Must land first: chat scope metadata contract (`N11`) with deterministic fallback semantics from SP-0009-01.
3. Can proceed in parallel once 1-2 are stable: `0009a`, `0009f`, and most of `0009b`/`0009e`.
4. Then land source-jump wiring in `0009d` using strict anchor-only behavior from SP-0009-02.
5. Final wave: `0009g` mandatory polish gate + guardrail audit from SP-0009-06.

## Resolved Implementation Decisions (2026-02-11)

- Chat source persistence model: persist chat citations (`chat_message` + citation rows).
- Stream shape choice: emit dedicated early `scope` event (not folded into `meta`).

## Exit Criteria Per Decision

- The locked decision is reflected in both `prd.md` and `prd.json` for affected slices.
- Contract-level tests and negative cases are captured in acceptance criteria.
- `findings.md` keeps one canonical metric definition for anchor coverage.
- No blocking spike or implementation ambiguity remains before implementation starts.
