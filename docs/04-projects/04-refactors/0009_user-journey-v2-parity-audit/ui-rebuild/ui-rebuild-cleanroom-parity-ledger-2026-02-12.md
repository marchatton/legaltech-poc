# UI Rebuild Clean-Room Parity Ledger

Date: 2026-02-12  
Branch: `refactor/ui-wireframe-cleanroom`  
Purpose: Track clean-room rebuild decisions against wireframe parity.

## Status values

1. `planned`
2. `in_progress`
3. `blocked`
4. `done`

## Decision protocol

1. If wireframe IA conflicts with behavior/backend contracts, pause and ask before implementation.
2. Log the final decision and rationale in this ledger before marking a surface done.
3. Styling direction follows design system while mechanics are driven by wireframe parity.

## Skills to use for ledger decisions and evidence

1. `ask-questions-if-underspecified` - required before logging any conflict-driven delta as final.
2. `oracle` - use for deep review when parity rationale is non-obvious or high-risk.
3. `fixing-accessibility`, `wcag-audit-patterns`, `web-design-guidelines` - include a11y/UX evidence before setting a row to `done`.
4. `test-browser` - capture route/drawer/viewer behavior evidence for row closeout.
5. `verify` - run the verification ladder and attach PASS/NO-GO evidence to closeout notes.

## Parity table

| Surface | Wireframe source(s) | Production target(s) | Contract anchors | Status | Evidence |
|---|---|---|---|---|---|
| Shell + nav | `components/shell/GlobalShell.tsx`, `components/shell/Sidebar.tsx` | `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/ui/WorkspaceSidebar.tsx`, `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` | matters route behavior, disabled nav affordances, breadcrumb/topbar >=90% IA fidelity | planned | pending |
| Matters list | `pages/MattersListPage.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/MattersToolbar.tsx` | `mattersList.server.ts`, URL query semantics, search/filter/table >=90% IA fidelity | planned | pending |
| New matter | `pages/NewMatterPage.tsx` | `apps/web/app/(app)/matters/CreateMatterForm.tsx` | create action + validation behavior | planned | pending |
| Detail frame + tabs | `pages/MatterDetailPage.tsx` | `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/ui/WorkspaceTabs.tsx` | `?tab=` semantics + deep-link continuity | planned | pending |
| Report triage table | `components/matter/ReportTab.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row filters and triage actions, table/filter-rail >=90% IA fidelity | planned | pending |
| Row drawer | `components/matter/RowDrawer.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row open/close, mark reviewed, citation open | planned | pending |
| Evidence viewer | `components/matter/EvidenceViewer.tsx` | `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`, `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/evidence/[id]/page.tsx` | verification integrity + highlight behavior, viewer framing >=90% IA fidelity | planned | pending |
| Chat tab | `components/matter/ChatTab.tsx` | `apps/web/app/(app)/matters/[id]/ChatPanel.tsx` | run scope and source-jump gating | planned | pending |
| Artefacts tab | `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/ArtefactsList.tsx` | artefact filters, provenance, unsafe semantics | planned | pending |
| Exports tab | `components/matter/ExportsTab.tsx` | `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx` | blocked-export to review deep-link behavior | planned | pending |
| Demo toolbar/history/checklist | `components/demo/DemoToolbar.tsx`, `components/demo/DemoHistory.tsx`, `components/demo/OperatorChecklist.tsx` | `apps/web/app/DemoToolbar.tsx`, `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`, `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts` | demo pack flow and checklist loop behavior | planned | pending |
| Error + status primitives | `components/ui/ErrorBanner.tsx`, `components/ui/StatusChip.tsx` | `apps/web/app/ui/ErrorBanner.tsx`, `apps/web/app/ui/Chip.tsx` | safe error envelope + status vocabulary | planned | pending |
| Tokens + responsive spacing | `src/index.css`, `tailwind.config.js` | `apps/web/app/tokens.css`, `apps/web/tailwind.preset.ts` | design-system styling constraints + wireframe-driven token mechanics + responsive shell spacing | planned | pending |
| Tables fidelity checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx` | tables meet >=90% IA fidelity without behavior regressions | planned | pending |
| Filters + search checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/MattersToolbar.tsx`, `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/artefactsFilters.ts` | search and filter affordances meet >=90% IA fidelity with existing query/logic contracts | planned | pending |
