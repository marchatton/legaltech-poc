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

| Surface | Wireframe source(s) | Production target(s) | Contract anchors | Owner | Acceptance | Status | Evidence |
|---|---|---|---|---|---|---|---|
| Shell + nav | `components/shell/GlobalShell.tsx`, `components/shell/Sidebar.tsx` | `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/ui/WorkspaceSidebar.tsx`, `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` | matters route behavior, disabled nav affordances, breadcrumb/topbar >=90% IA fidelity | Phase 2 | ACC-SHELL-01: shell renders on /matters and /matters/[id]; ACC-SHELL-02: sidebar collapse/expand works; ACC-SHELL-03: disabled nav items show tooltip | in_progress | Shell frame: overflow-hidden + flex-col + overflow-auto main. Sidebar: client component with collapse (w-64↔w-16), purple ring logo, cyan active state, ChevronsLeft/Right toggle, logout icon. Context bar: h-14 sticky header bg-card. Detail layout: Home icon breadcrumb, folder ID next to name. Active state uses cyan tokens per wireframe (not info/blue). |
| Matters list | `pages/MattersListPage.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/MattersToolbar.tsx` | `mattersList.server.ts`, URL query semantics, search/filter/table >=90% IA fidelity | Phase 3 | ACC-LIST-01: ?q= search works; ACC-LIST-02: ?view= filter pills work; ACC-LIST-03: table structure matches wireframe | planned | pending |
| New matter | `pages/NewMatterPage.tsx` | `apps/web/app/(app)/matters/CreateMatterForm.tsx` | create action + validation behavior | Phase 3 | ACC-NEW-01: form submission creates matter; ACC-NEW-02: validation errors display | planned | pending |
| Detail frame + tabs | `pages/MatterDetailPage.tsx` | `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/ui/WorkspaceTabs.tsx` | `?tab=` semantics + deep-link continuity | Phase 4 | ACC-DET-01: ?tab= routing works; ACC-DET-02: tab badges show counts; ACC-DET-03: progress/quick-start renders | planned | pending |
| Report triage table | `components/matter/ReportTab.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row filters and triage actions, table/filter-rail >=90% IA fidelity | Phase 5 | ACC-RPT-01: filter tabs filter rows; ACC-RPT-02: confidence bars render; ACC-RPT-03: row click opens drawer | planned | pending |
| Row drawer | `components/matter/RowDrawer.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row open/close, mark reviewed, citation open | Phase 5 | ACC-DRW-01: drawer opens/closes; ACC-DRW-02: mark_reviewed action works; ACC-DRW-03: evidence link opens viewer | planned | pending |
| Evidence viewer | `components/matter/EvidenceViewer.tsx` | `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`, `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/evidence/[id]/page.tsx` | verification integrity + highlight behavior, viewer framing >=90% IA fidelity | Phase 6 | ACC-EV-01: zoom/rotate/page nav works; ACC-EV-02: verification overlay at 100% zoom; ACC-EV-03: keyboard shortcuts work | planned | pending |
| Chat tab | `components/matter/ChatTab.tsx` | `apps/web/app/(app)/matters/[id]/ChatPanel.tsx` | run scope and source-jump gating | Phase 7 | ACC-CHAT-01: messages send and stream; ACC-CHAT-02: source chips render; ACC-CHAT-03: run scope selector works | planned | pending |
| Artefacts tab | `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/ArtefactsList.tsx` | artefact filters, provenance, unsafe semantics | Phase 7 | ACC-ART-01: filter buttons work; ACC-ART-02: unsafe badge renders; ACC-ART-03: download links work | planned | pending |
| Exports tab | `components/matter/ExportsTab.tsx` | `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx` | blocked-export to review deep-link behavior | Phase 7 | ACC-EXP-01: run selector works; ACC-EXP-02: blocked banner shows; ACC-EXP-03: export buttons trigger downloads | planned | pending |
| Demo toolbar/history/checklist | `components/demo/DemoToolbar.tsx`, `components/demo/DemoHistory.tsx`, `components/demo/OperatorChecklist.tsx` | `apps/web/app/DemoToolbar.tsx`, `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`, `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts` | demo pack flow and checklist loop behavior | Phase 4 | ACC-DEMO-01: demo toolbar loads packs; ACC-DEMO-02: history list shows recent; ACC-DEMO-03: checklist steps update | planned | pending |
| Error + status primitives | `components/ui/ErrorBanner.tsx`, `components/ui/StatusChip.tsx` | `apps/web/app/ui/ErrorBanner.tsx`, `apps/web/app/ui/Chip.tsx` | safe error envelope + status vocabulary | Phase 1 | ACC-PRIM-01: ErrorBanner shows code/message/retry; ACC-PRIM-02: StatusChip maps all statuses correctly | planned | pending |
| Tokens + responsive spacing | `src/index.css`, `tailwind.config.js` | `apps/web/app/tokens.css`, `apps/web/tailwind.preset.ts` | design-system styling constraints + wireframe-driven token mechanics + responsive shell spacing | Phase 1 | ACC-TOK-01: new tokens resolve in light+dark; ACC-TOK-02: responsive shell spacing works at breakpoints | in_progress | Token audit: all wireframe color/radius/shadow tokens already exist in production. Added: scrollbar styling to globals.css, `xl`+`full` Page widths. No token.css changes needed. |
| Tables fidelity checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx` | tables meet >=90% IA fidelity without behavior regressions | Phase 8 | ACC-TBL-01: all tables match wireframe column structure; ACC-TBL-02: sticky headers work; ACC-TBL-03: hover states work | planned | pending |
| Filters + search checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/MattersToolbar.tsx`, `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/artefactsFilters.ts` | search and filter affordances meet >=90% IA fidelity with existing query/logic contracts | Phase 8 | ACC-FLT-01: search input filters; ACC-FLT-02: filter chips toggle; ACC-FLT-03: URL params sync | planned | pending |

## Intentional deltas

| Surface | Wireframe intent | Production decision | Rationale | Date |
|---|---|---|---|---|
| Documents tab | Empty state placeholder ("No documents uploaded yet") | Keep existing SetupDocumentsPanel with upload functionality | Wireframe placeholder loses functional upload UI that already works. Upload is core to the matter creation flow. | 2026-02-12 |
| Sidebar nav | Separate "Runs", "Alerts" nav items | Keep unified "Runs & Alerts" (disabled) | Locked decision from execution plan: "Runs + Alerts stay unified in left navigation" | 2026-02-12 |

## Wireframe reference list (locked)

No ad-hoc source additions beyond the following locked set:

1. `orbital-ui-wireframes/src/App.tsx`
2. `orbital-ui-wireframes/src/index.css`
3. `orbital-ui-wireframes/src/hooks/useOrbitalState.ts`
4. `orbital-ui-wireframes/src/components/shell/GlobalShell.tsx`
5. `orbital-ui-wireframes/src/components/shell/Sidebar.tsx`
6. `orbital-ui-wireframes/src/pages/MattersListPage.tsx`
7. `orbital-ui-wireframes/src/pages/NewMatterPage.tsx`
8. `orbital-ui-wireframes/src/pages/MatterDetailPage.tsx`
9. `orbital-ui-wireframes/src/components/matter/ReportTab.tsx`
10. `orbital-ui-wireframes/src/components/matter/RowDrawer.tsx`
11. `orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx`
12. `orbital-ui-wireframes/src/components/matter/ChatTab.tsx`
13. `orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx`
14. `orbital-ui-wireframes/src/components/matter/ExportsTab.tsx`
15. `orbital-ui-wireframes/src/components/demo/DemoToolbar.tsx`
16. `orbital-ui-wireframes/src/components/demo/DemoHistory.tsx`
17. `orbital-ui-wireframes/src/components/demo/OperatorChecklist.tsx`
18. `orbital-ui-wireframes/src/components/ui/StatusChip.tsx`
19. `orbital-ui-wireframes/src/components/ui/ErrorBanner.tsx`
20. `orbital-ui-wireframes/tailwind.config.js`
