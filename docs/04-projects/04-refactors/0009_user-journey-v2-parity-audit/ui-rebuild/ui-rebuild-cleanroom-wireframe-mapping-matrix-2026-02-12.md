# UI Rebuild Clean-Room Wireframe Mapping Matrix

Date: 2026-02-12  
Branch: `refactor/ui-wireframe-cleanroom`  
Status: Planning baseline

## Mapping protocol

1. Do not start a surface until its mapping row is complete.
2. Rebuild target components fresh from wireframe hierarchy.
3. Use existing app files only for behavior contracts and data plumbing.
4. If wireframe and behavior contracts conflict, pause and ask before proceeding, then log the decision in parity ledger.
5. Overwriting existing `apps/web` UI components is allowed where needed for clean-room parity.
6. Tables, search, and filter affordances must target >=90% IA fidelity to wireframes.

## Mapping table

| Wireframe source | Production target file(s) | Fresh-build output | Contract anchors (must keep) | Status |
|---|---|---|---|---|
| `orbital-ui-wireframes/src/App.tsx` | `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` | Top-level shell composition for matters routes | Route segmentation and existing app router behavior | planned |
| `orbital-ui-wireframes/src/components/shell/GlobalShell.tsx` | `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/(app)/matters/layout.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx` | Rebuilt shell frame (top bar, breadcrumb, context areas) | Breadcrumb matter identity, environment/run context labels | planned |
| `orbital-ui-wireframes/src/components/shell/Sidebar.tsx` | `apps/web/app/ui/WorkspaceSidebar.tsx` | Rebuilt sidebar with collapse and nav affordances | `Matters` route active; `Runs+Alerts`, `Settings` disabled states | planned |
| `orbital-ui-wireframes/src/pages/MattersListPage.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/MattersToolbar.tsx` | Rebuilt matters list page hierarchy, search/filters, and table scanability | URL filters/search semantics, `mattersList.server.ts` behavior | planned |
| `orbital-ui-wireframes/src/pages/NewMatterPage.tsx` | `apps/web/app/(app)/matters/CreateMatterForm.tsx`, `apps/web/app/(app)/matters/page.tsx` | Rebuilt new matter/upload flow presentation | matter create action contract and validation behavior | planned |
| `orbital-ui-wireframes/src/pages/MatterDetailPage.tsx` | `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/ui/WorkspaceTabs.tsx` | Rebuilt detail header + tab architecture | `?tab=` behavior, deep-link continuity for report scope | planned |
| `orbital-ui-wireframes/src/components/matter/ReportTab.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | Rebuilt report table/filter rail hierarchy and scan flow | row filter semantics, triage action availability | planned |
| `orbital-ui-wireframes/src/components/matter/RowDrawer.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | Rebuilt row drawer sections + action footer | row open/close behavior, `mark_reviewed`, citation open behavior | planned |
| `orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx` | `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`, `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/evidence/[id]/page.tsx` | Rebuilt evidence viewer framing and controls | citation verification logic, highlight integrity, deep-link behavior | planned |
| `orbital-ui-wireframes/src/components/matter/ChatTab.tsx` | `apps/web/app/(app)/matters/[id]/ChatPanel.tsx` | Rebuilt chat layout and source-chip presentation | run scoping contract and source-jump gating behavior | planned |
| `orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/ArtefactsList.tsx`, `apps/web/app/(app)/matters/artefactsFilters.ts` | Rebuilt artefacts table/filter presentation and row scanability | provenance and unsafe badge behavior | planned |
| `orbital-ui-wireframes/src/components/matter/ExportsTab.tsx` | `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx` | Rebuilt exports tab layout and state blocks | blocked-export path and deep-link-to-review behavior | planned |
| `orbital-ui-wireframes/src/components/demo/DemoToolbar.tsx` | `apps/web/app/DemoToolbar.tsx` | Rebuilt demo mode toolbar hierarchy | demo mode controls and pack load actions | planned |
| `orbital-ui-wireframes/src/components/demo/DemoHistory.tsx` | `apps/web/app/(app)/matters/page.tsx` (history panel area) | Rebuilt demo history card/list as a dedicated component | reopen flow behavior in demo history shortcuts | planned |
| `orbital-ui-wireframes/src/components/demo/OperatorChecklist.tsx` | `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`, `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts` | Rebuilt fixture/checklist presentation | fixture context and demo loop contracts | planned |
| `orbital-ui-wireframes/src/components/ui/StatusChip.tsx` | `apps/web/app/ui/Chip.tsx` (or dedicated status chip in `ui/`) | Rebuilt canonical status chip primitive | status vocab and color semantics | planned |
| `orbital-ui-wireframes/src/components/ui/ErrorBanner.tsx` | `apps/web/app/ui/ErrorBanner.tsx` | Rebuilt reusable error banner presentation | safe error envelope and retry/support actions | planned |
| `orbital-ui-wireframes/src/hooks/useOrbitalState.ts` | `apps/web/lib/mattersList.server.ts`, `apps/web/app/(app)/matters/runScope.ts`, `apps/web/app/(app)/matters/artefactsFilters.ts` | Behavior cross-check reference only (not copied) | data shape + state transition expectations in production | planned |
| `orbital-ui-wireframes/src/index.css` + `tailwind.config.js` | `apps/web/app/tokens.css`, `apps/web/tailwind.preset.ts` | Token + utility reconciliation for clean rebuild using wireframe mechanics | maintain Orbital design system while matching wireframe structure | planned |

## Mapping QA checklist

1. Each rebuilt surface cites its wireframe source in PR notes.
2. Each rebuilt surface cites contract anchor files/tests in PR notes.
3. No surface can move to implementation without a `planned` row.
4. No surface can close without ledger evidence links.
5. Tables/search/filters are explicitly scored for >=90% IA fidelity during review.
6. Any wireframe-vs-contract conflict is explicitly logged with ask-before-proceed evidence.
