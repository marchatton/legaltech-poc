# UI Rebuild Parity Ledger

Date: 2026-02-12  
Purpose: Single source of truth for wireframe parity decisions during the UI rebuild.

## How to use
1. Add/update a row before implementing changes for a surface.
2. Record any conflict between wireframes, design-system standards, and existing behavior contracts.
3. Link concrete evidence (screenshots, notes, PR links) before marking a row done.

## Status values
- `planned`
- `in_progress`
- `blocked`
- `done`

## Parity Table
| Surface | Current behavior | Wireframe target | Chosen implementation | Rationale | Owner lane | Status | Evidence |
|---|---|---|---|---|---|---|---|
| Shell + nav (`/matters`, `/matters/[id]`) | Baseline shell parity-v1 implemented | Unified wireframe IA, merged Runs+Alerts | Added `WorkspaceShellFrame` + `WorkspaceContextBar`; rebuilt sidebar IA with `Matters` active route and non-clickable `Runs + Alerts` / `Settings` placeholders with tooltip affordance | Matches wireframe IA while preserving route contracts and explicit out-of-scope destinations | Lane A | done | `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/ui/WorkspaceSidebar.tsx`, `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` |
| Matters list (`/matters`) | Existing filters/query behavior live | Cleaner hierarchy and table scanability | Refined filter toolbar layout, active-filter summary, clearer row metadata (`index`) and table scanability while preserving `q` / `state` / `view` URL semantics | Improves operator scanning speed without backend or query-contract deltas | Lane B | done | `apps/web/app/(app)/matters/page.tsx`; browser smoke: `tmp-evidence/browser-validation-2026-02-12-ui-rebuild-followup/01-matters-list.png` |
| Matter detail header + tabs | URL-driven tabs and fixture context live | Cleaner summary + aligned tab layout | Polished top summary/progress and tab spacing; reduced fixture/checklist visual prominence into compact context strip; kept `?tab=` and report `run_id` / `row_tab` behavior | Preserves parity behavior and deep-link continuity while reducing visual noise | Lane B | done | `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts`, `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`; browser smoke: `tmp-evidence/browser-validation-2026-02-12-ui-rebuild-followup/02-detail-report.png` |
| Report drawer | Existing triage + mark reviewed flow live | Wireframe triage hierarchy + drawer sections | Kept row table + `mark_reviewed` mutation; improved drawer semantics (`role="dialog"`), focus return, Escape handling, and grouped metadata sections | Raises review UX quality without changing triage behavior contracts | Lane C | done | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`; browser smoke: `tmp-evidence/browser-validation-2026-02-12-ui-rebuild-followup/03-report-drawer.png`; targeted tests: `test/reportTriage.sync.test.ts`, `test/reportRowDrawer.sync.test.ts` |
| Citation viewer | Existing integrity behavior live | Wireframe-like framing polish | Preserved evidence integrity rules; added keyboard controls (`←/→`, `+/-`, `0`, `R`), zoom/rotation quick controls, and explicit snippet-hash match state | Keeps verification contract unchanged while improving operator speed and accessibility | Lane C | done | `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`; browser smoke: `tmp-evidence/browser-validation-2026-02-12-ui-rebuild-followup/04-citation-viewer.png`; targeted test: `test/reportEvidenceViewer.sync.test.ts` |
| Shared UI primitives (`apps/web/app/ui`) | Mixed reusable + route-local styling | Consolidated primitives and composition | Introduced shared shell primitives in `WorkspaceShell.tsx` and reused them in list/detail layouts | Reduces route-level duplication and keeps shell styling centralized | Lane A | done | `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` |
| Tokens and preset | Existing token set | Remove one-off values and align to tokens | Replaced shell/header hardcoded accent usage with semantic token classes (`info`, `warning`, `muted`, `sidebar-*`) in touched surfaces | Aligns lane-owned UI to token system and lowers one-off style drift | Lane A | done | `apps/web/app/ui/WorkspaceSidebar.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx`; lint/typecheck PASS in `apps/web` |
