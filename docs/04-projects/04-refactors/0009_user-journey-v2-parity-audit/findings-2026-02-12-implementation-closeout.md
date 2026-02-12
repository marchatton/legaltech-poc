# User Journey V2 Parity Audit Findings (Implementation Closeout)

Date: 2026-02-12  
Status: Closeout snapshot from implemented PRD slices  
Supersedes: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md` (2026-02-11 baseline audit)

## Source set

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009d_chat-run-scoping/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009e_demo-operator-loop/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009g_ui-polish-sweep/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009g_ui-polish-sweep/prds/0009g1_shell-setup-demo-polish/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009g_ui-polish-sweep/prds/0009g2_detail-surfaces-and-guardrails/prd.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-handoffs/handoff_2026-02-12_00-23-00_blocker-resolution-inline-wdk.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-handoffs/handoff_2026-02-12_00-11-00_browser-validation-parity-closeout.md`

## Executive summary

- All parity slices (`0009a` through `0009g2`) are treated as implemented for this closeout.
- U1-U52 now map to implemented behavior for parity v1, with scoped cut-lines explicitly preserved.
- No open parity-v1 blockers remain in this dossier; remaining items are intentional v1 deferrals, not misses.

## Status legend

- `Implemented`: delivered in parity v1 behavior.
- `Implemented (retained baseline)`: already present before slice delivery and retained.
- `Implemented (v1 scoped)`: delivered with an explicit v1 cut-line/defer decision.

## U1-U52 parity closeout checklist

| Affordance | Closeout status | Implemented via | Notes |
|---|---|---|---|
| U1 | Implemented (v1 scoped) | `0009a/US-001` | `Matters` is functional; `Runs`/`Alerts`/`Settings` are intentionally visible disabled placeholders. |
| U2 | Implemented | `0009a/US-001` | Explicit environment badge contract (`demo-dev` / `demo-prod`). |
| U3 | Implemented | `0009a/US-001` | Breadcrumb chain is present on list/detail surfaces. |
| U4 | Implemented | `0009a/US-001` | Sticky shell context identifier is present. |
| U5 | Implemented | `0009a/US-002` | Matters list search (`q`) is implemented. |
| U6 | Implemented | `0009a/US-002` | Saved-view/state chips (`Active`, `Needs Attention`, `Demo Packs`) are implemented. |
| U7 | Implemented | `0009a/US-002` | Primary `New Matter` CTA is implemented. |
| U8 | Implemented | `0009a/US-002` | Row-level `Open` action is implemented. |
| U9 | Implemented | `0009a/US-002` | Matter creation requires explicit name validation. |
| U10 | Implemented | `0009a/US-003` | Setup upload handoff uses init/upload/complete contracts. |
| U11 | Implemented | `0009a/US-003` | Documents readiness workflow is first-class in setup. |
| U12 | Implemented (v1 scoped) | `0009a/US-004` | Readiness reasons implemented; no new pre-run checklist persistence/state machine. |
| U13 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Quick Start start action retained. |
| U14 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Run progress meter retained. |
| U15 | Implemented | `0009b/US-001` | Row triage tabs (`All`, `Needs Review`, `Reviewed`, `Flagged`) implemented. |
| U16 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Row status chips retained. |
| U17 | Implemented | `0009b/US-002` | Row drawer is primary review surface. |
| U18 | Implemented | `0009b/US-002` | Structured payload detail is in drawer workflow. |
| U19 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Citation chips to evidence were retained and extended in chat/report flows. |
| U20 | Implemented | `0009b/US-003` | Split-view lock behavior is implemented. |
| U21 | Implemented | `0009b/US-003` | Explicit evidence loading skeleton is implemented. |
| U22 | Implemented | `0009b/US-003` | Page controls are implemented in evidence viewer. |
| U23 | Implemented | `0009b/US-003` | Verification state is explicit, not implicit. |
| U24 | Implemented | `0009b/US-003` | Explicit `Reset to 100% to verify` behavior is implemented. |
| U25 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Highlight overlay rendering retained. |
| U26 | Implemented | `0009b/US-004` | Trust metadata rail/footer fields are source-backed. |
| U27 | Implemented | `0009b/US-005` | `citation_failed` recovery checklist flow is implemented. |
| U28 | Implemented (v1 scoped) | `0009b/US-005` | `Flag citation wrong` shipped as UI-only acknowledgement flow (no persistence endpoint). |
| U29 | Implemented | `0009c/US-001`, `0009c/US-002` | Run selector contract is shared across exports/report. |
| U30 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Export actions remained available and were integrated with scoped run behavior. |
| U31 | Implemented | `0009c/US-002` | Blocked export uses standardized panel pattern. |
| U32 | Implemented | `0009c/US-002` | `Review failed rows` deep-link continuity is implemented. |
| U33 | Implemented | `0009c/US-003` | Artefact kind/type filtering implemented. |
| U34 | Implemented | `0009c/US-003` | Provenance visibility (`source_run_id`) implemented. |
| U35 | Implemented | `0009c/US-004` | Download loading/completion/freshness feedback implemented. |
| U36 | Implemented | `0009c/US-004` | `UNSAFE` explanation tooltip/panel pattern implemented. |
| U37 | Implemented (v1 scoped) | `0009d/US-001`, `0009d/US-002` | L1 run scoping shipped (run chip + picker + metadata); L2/L3 intentionally out-of-scope. |
| U38 | Implemented (retained baseline) | `0009d` compatibility constraint | Composer retained. |
| U39 | Implemented (retained baseline) | `0009d` compatibility constraint | Streaming response state retained. |
| U40 | Implemented (v1 scoped) | `0009d/US-003` | Source chips jump only when anchor is ready; disabled reason messaging for non-ready sources. |
| U41 | Implemented | `0009d/US-004` | Selected-message sources rail implemented. |
| U42 | Implemented | `0009d/US-004` | Run scope mismatch warning implemented. |
| U43 | Implemented | `0009d/US-005` | No-context disable + guidance implemented. |
| U44 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Persistent demo mode bar retained. |
| U45 | Implemented (retained baseline) | Pre-0009 baseline (retained) | Allowlisted pack selector retained. |
| U46 | Implemented (retained baseline) | Pre-0009 baseline (retained) | `Load demo pack` CTA retained. |
| U47 | Implemented | `0009e/US-002` | Fixture context banner and guidance mode implemented. |
| U48 | Implemented (v1 scoped) | `0009e/US-001` | Operator checklist + coarse elapsed minutes shipped; second-level precision intentionally deferred. |
| U49 | Implemented | `0009e/US-003` | `Load pack again` + demo history reopen shortcuts implemented. |
| U50 | Implemented | `0009f/US-001`, `0009f/US-002` | Shared deterministic error envelope + reusable banner implemented. |
| U51 | Implemented | `0009f/US-004` | Retry semantics aligned to `retryable` state across surfaces. |
| U52 | Implemented | `0009f/US-003` | Support escalation action pattern implemented with safe fallback behavior. |

## Wireframe addenda closeout (W-A*)

| Addendum | Closeout status | Implemented via | Notes |
|---|---|---|---|
| W-A1 | Implemented | `0009a/US-003` | First-class Documents setup workflow. |
| W-A2 | Implemented | `0009a/US-002`, `0009e/US-003` | Demo history side surface + reopen loop. |
| W-A3 | Implemented | `0009a/US-004`, `0009e/US-002` | Explicit readiness reasons and state copy alignment. |
| W-A4 | Implemented | `0009b/US-002` | Row-drawer decision workflow. |
| W-A5 | Implemented | `0009b/US-002` | Drawer metadata contract (`schema field`, `data type`, `model/version`). |
| W-A6 | Implemented | `0009b/US-002` | Copy extracted answer action. |
| W-A7 | Implemented | `0009b/US-001` | Sticky header + dense triage scan behavior. |
| W-A8 | Implemented | `0009c/US-002` | Deep-link contract carries `run_id` + `row_tab` failed state. |
| W-A9 | Implemented | `0009d/US-005` | Chat suggested-prompt empty-state onboarding. |
| W-A10 | Implemented | `0009b/US-003`, `0009d/US-003` | Viewer/focus interaction contract guardrails. |
| W-A11 | Implemented | `0009b/US-004` | Trust footer field contract. |
| W-A12 | Implemented | `0009f/US-001`, `0009f/US-002`, `0009f/US-003` | Standardized cross-surface ErrorBanner + support path. |

## Guardrail and cut-line closeout (W-C*)

| Guardrail | Closeout status | Source |
|---|---|---|
| W-C3 | Enforced | `0009g/US-003`, `0009g2/US-004` |
| W-C4 | Enforced | `0009g/US-003`, `0009g2/US-004` |
| W-C5 | Enforced | `0009a/US-003`, `0009g/US-003`, `0009g2/US-004` |
| W-C7 | Enforced | `0009b/US-004`, `0009g/US-003`, `0009g2/US-004` |
| W-C11 | Enforced | `0009e/US-001`, `0009g/US-003`, `0009g2/US-004` |

## Intentional parity-v1 deferrals (non-blocking)

- Functional `Runs`/`Alerts`/`Settings` destinations remain out-of-scope; placeholders are intentional.
- Pre-run checklist persistence/state machine remains out-of-scope (readiness reasons shipped instead).
- Citation wrong flag persistence endpoint/workflow remains out-of-scope (UI acknowledgement shipped).
- Chat `L2` strict isolation and `L3` multi-run compare/merge remain out-of-scope.
- Fuzzy anchor recovery for non-ready citation jumps remains out-of-scope (strict anchor gating shipped).
- Sub-minute/second-level elapsed timer precision remains out-of-scope.

## Verification and evidence anchors

- Browser and URL deep-link validation:
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/01-matters-list.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/02-detail-report.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/03-detail-documents.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/04-detail-chat.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/05-detail-artefacts.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/06-detail-exports.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/07-deeplink-row-tab-citation-failed.png`
- Export blocked -> review deep-link fix evidence:
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12-fix/exports-blocked-review-link.png`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12-fix/report-citation-failed-deeplink.png`
- Verification command outcomes (captured in handoff):
  - `pnpm -C apps/web typecheck`: PASS
  - `pnpm -C apps/web lint`: PASS

