# Workflow Mode Implementation Matrix

Date: 2026-02-13
Scope: current implementation in `apps/web` for `dev` vs `demo-prod` vs `prod`.

## Legend
- `Working`: implemented end-to-end for the current contract in that mode.
- `Partial`: path exists but has known constraints, placeholders, or mode-dependent gaps.
- `Blocked`: intentionally unavailable in that mode (route/page gating) or no usable path.

## Core Priority Workflows

| # | Workflow | Dev | Demo-prod | Prod | Evidence |
|---|---|---|---|---|---|
| 1 | P0 Entry + readiness gate | Working | Partial | Blocked | Readiness states and Quick Start gating are wired in `apps/web/app/(app)/matters/[id]/page.tsx:425`; create/upload endpoints are dev-only in `apps/web/app/(api)/folders/route.ts:37`, `apps/web/app/(api)/folders/[id]/documents/route.ts:33`. |
| 2 | P0 Run lifecycle + report | Working | Partial | Blocked | Run scheduling and progress endpoints are live (`apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/app/(api)/runs/[id]/route.ts`), report rows are materialized from persisted step outputs (`apps/web/lib/reportRowsFromStepOutputs.server.ts`), and write-row failures now fail the run with explicit `ROW_WRITE_FAILED` instead of seeded fallback (`apps/web/steps/quickStartWriteRowV0.step.server.ts`). |
| 3 | P0 Trust + fail-closed export | Working | Partial | Blocked | `EXPORT_BLOCKED` contract is enforced in `apps/web/app/(api)/export/csv/route.ts:211`; artefact list/download are implemented in `apps/web/app/(api)/folders/[id]/artefacts/route.ts:198` and `apps/web/app/(api)/artefacts/[id]/download/route.ts:106`; unsafe path is environment-gated. |
| 4 | P0 Citation evidence path | Partial | Partial | Blocked | Citation -> render -> PDF path exists (`apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(api)/documents/[id]/render/route.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`); citation lookup is now DB-only fail-closed on miss, while render/pdf fixture pathways remain for non-prod support. |
| 5 | P1 Review workflow | Working | Working | Blocked | Triage tabs + drawer + mark-reviewed mutation are implemented in `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx:563` and `apps/web/app/(api)/report-rows/[id]/route.ts:94`. |
| 6 | P1 Chat workflow | Partial | Partial | Blocked | Matter-scoped chat and source-jump gating are live in `apps/web/app/(api)/folders/[id]/chat/route.ts:97` and `apps/web/app/(app)/matters/[id]/ChatPanel.tsx:376`, but persistence/run-scoped contract is not yet implemented. |
| 7 | P1 Demo/operator loop | Partial | Partial | Blocked | Pack load/reload exists via `apps/web/app/(api)/demo/load-pack/route.ts` with allowlist shared in `apps/web/lib/demoPackAllowlist.ts` (`pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`) and smoke tiers in `.github/workflows/real-data-smoke.yml`. |
| 8 | P2 Resilience workflow | Partial | Partial | Blocked | Retry/backoff/stale-step recovery exists (`apps/web/lib/wdk/wdkWorker.server.ts:25`, `apps/web/lib/wdk/stepQueue.server.ts:228`) and ingest timeout coverage exists (`apps/web/test/ingestDocumentTimeout.int.test.ts:46`), but no full cross-surface resilience matrix is in place. |

## Additional Workflow Gaps

| # | Workflow | Dev | Demo-prod | Prod | Evidence |
|---|---|---|---|---|---|
| 9 | Matter creation from UI | Working | Blocked | Blocked | UI posts to `/folders` (`apps/web/app/(app)/matters/CreateMatterForm.tsx:57`) but API is dev-only (`apps/web/app/(api)/folders/route.ts:37`). |
| 10 | Manual document setup (upload/complete/refresh) | Working | Blocked | Blocked | Documents APIs are dev-only (`apps/web/app/(api)/folders/[id]/documents/route.ts:33`, `apps/web/app/(api)/documents/[id]/upload/route.ts:47`, `apps/web/app/(api)/documents/[id]/complete/route.ts:27`) while UI expects them (`apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx:167`). |
| 11 | Demo operator controls (toolbar + load pack UX) | Working | Partial | Blocked | Toolbar is dev-only via `isDemoModeEnabled()` (`apps/web/lib/demoMode.server.ts:7`, `apps/web/app/layout.tsx:19`), while load-pack API itself can run in demo-prod (`apps/web/app/(api)/demo/load-pack/route.ts:63`). |
| 12 | Workspace nav parity (Runs/Alerts/Settings) | Partial | Partial | Blocked | Sidebar destinations are placeholders with disabled hints (`apps/web/app/ui/WorkspaceSidebar.tsx:36`, `apps/web/app/ui/WorkspaceSidebar.tsx:47`, `apps/web/app/ui/WorkspaceSidebar.tsx:58`). |
| 13 | Real-data Quick Start reasoning (retrieve/draft/lock/verify) | Partial | Partial | Blocked | Quick Start now avoids seeded fallback writes and fails closed on row-write errors (`apps/web/steps/quickStartWriteRowV0.step.server.ts`), but retrieval/draft/lock/verify remains unimplemented and emits deterministic `citation_failed` outcomes. |
| 14 | Chat production contract (run-scoped + persisted transcripts) | Partial | Partial | Blocked | Chat request schema is only `{ message }` (`apps/web/app/(api)/folders/[id]/chat/route.ts:20`) and chat schema module remains a stub (`apps/web/lib/db/schema/chat.server.ts:5`). |
| 15 | Trace export from persisted execution data | Partial | Blocked | Blocked | Route is dev-only and feature-flag/admin-token gated (`apps/web/app/(api)/runs/[id]/trace/route.ts:150`, `apps/web/app/(api)/runs/[id]/trace/route.ts:153`) and currently synthesizes traces from seed snapshots (`apps/web/app/(api)/runs/[id]/trace/route.ts:199`). |
| 16 | Citation correction loop (flagging persistence) | Partial | Partial | Blocked | Viewer supports UI-only flag acknowledgement (`apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx:668`) but no API mutation is called for persistence. |
| 17 | Artefacts exploration as a first-class matter tab | Partial | Partial | Blocked | `ArtefactsList` component exists (`apps/web/app/(app)/matters/ArtefactsList.tsx:58`) but the detail page intentionally excludes an artefacts tab (`apps/web/app/(app)/matters/[id]/page.tsx:121`) and parity test asserts removal (`apps/web/test/artefactsList.sync.test.ts:27`). |
| 18 | Pack coverage breadth for repeatable E2E/demos | Partial | Partial | Blocked | Full pack set exists under `docs/08-example-data`, but operator load flow is currently restricted to three packs (`apps/web/lib/demoPackAllowlist.ts`). |

## Mode Summary

| Mode | Working | Partial | Blocked | Notes |
|---|---|---|---|---|
| Dev | 7 | 11 | 0 | Main implementation mode; most workflows available, many still placeholder/partial. |
| Demo-prod | 1 | 14 | 3 | Core triage/report/chat/export surfaces are reachable, but manual setup and some operator loops are constrained. |
| Prod | 0 | 0 | 18 | Current posture is intentionally locked down for these workflows. |

## Key Clarification

The highest confusion source is that the UI allows paths (for example, "New Matter" and manual upload) whose backing APIs are still `dev-only`, while many other flows are `dev-or-demo-prod`. This makes demo-prod feel "almost working" but inconsistent unless operators stick to the pack-load-first path.

## Planned Direction (Dev-First)

1. Prioritize dev workflow closure before widening mode parity.
2. Keep demo-prod improvements constrained to fast operator wins.
3. Keep prod blocked for this entire implementation window.

## Phase 0 Quick Wins (Demo-prod Allowlist) - Completed

| Item | Current state | Planned change | Expected impact |
|---|---|---|---|
| Load-pack API allowlist | Shared allowlist includes `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation` (`apps/web/lib/demoPackAllowlist.ts`) | Done | Demo-prod trust/fail-closed scenario is directly loadable. |
| Demo toolbar pack options | Toolbar loads options from shared allowlist (`apps/web/app/DemoToolbar.tsx`) | Done | Allowlist expansion is reachable without manual API calls. |
| Operator smoke coverage | `pack_09_bad_citation` load -> run -> export-blocked path is covered (`apps/web/test/realDataWorkflows.e2e.int.test.ts`, `.github/workflows/real-data-smoke.yml`) | Done | Guards against allowlist and fail-closed regression. |

## Ralph Execution Model

- Large changes: run `3-4` parallel Ralph loops with orthogonal ownership.
- Small changes: run one-shot directly.
- Integration point: a single merge queue that requires loop-local verification plus `P0` smoke.

Detailed execution plan: `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`.
