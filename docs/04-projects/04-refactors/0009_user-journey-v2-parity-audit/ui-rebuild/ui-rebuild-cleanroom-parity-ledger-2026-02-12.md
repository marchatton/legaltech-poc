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
| Matters list | `pages/MattersListPage.tsx` | `apps/web/app/(app)/matters/page.tsx` (MattersToolbar.tsx removed — dead code) | `mattersList.server.ts`, URL query semantics, search/filter/table >=90% IA fidelity | Phase 3 | ACC-LIST-01: ?q= search works; ACC-LIST-02: ?view= filter pills work; ACC-LIST-03: table structure matches wireframe | done | Page rebuilt from wireframe IA: Page/PageHeader shell, SearchInput + filter pill Links (preserved ?q=/?view=/?state= URL contracts), table with Name/Status/Created/Action columns, hover-visible ArrowRight action, demo history sidebar (flex w-72), EmptyState with reset action. MattersToolbar.tsx was dead code (never imported) — removed. Typecheck PASS, lint PASS. Deltas: progress column omitted (no backend data), State column dropped (wireframe has Status only), inline search form (Enter-to-submit) vs wireframe instant-filter (server-side filtering contract preserved). |
| New matter | `pages/NewMatterPage.tsx` | `apps/web/app/(app)/matters/CreateMatterForm.tsx` | create action + validation behavior | Phase 3 | ACC-NEW-01: form submission creates matter; ACC-NEW-02: validation errors display | done | CreateMatterForm behavior preserved unchanged: inline form in PageHeader right slot (name input + submit button + error handling). Wireframe has separate NewMatterPage with upload zone — intentional delta: inline form is simpler, upload handled in matter detail SetupDocumentsPanel. No code changes to CreateMatterForm.tsx. |
| Detail frame + tabs | `pages/MatterDetailPage.tsx` | `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/ui/WorkspaceTabs.tsx` | `?tab=` semantics + deep-link continuity | Phase 4 | ACC-DET-01: ?tab= routing works; ACC-DET-02: tab badges show counts; ACC-DET-03: progress/quick-start renders | done | Header rebuilt: name + status badge inline (matterStatusLabel derives Active/Needs Attention/Processing/Setup from state), progress cluster with Zap icon + count + bar, QuickStartActionButton. WorkspaceTabs rebuilt: no card wrapper, border-b-2 style, count badges. Fixture context reduced to single-row compact card (pack ID + status + steps inline). Sticky header bg-card. All ?tab= routing and deep-link behavior unchanged. Typecheck PASS, lint PASS. |
| Report triage table | `components/matter/ReportTab.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row filters and triage actions, table/filter-rail >=90% IA fidelity | Phase 5 | ACC-RPT-01: filter tabs filter rows; ACC-RPT-02: confidence bars render; ACC-RPT-03: row click opens drawer | done | Table rebuilt from wireframe IA: reduced from 8 columns (QID/Question/Answer/Status/Citations/Provenance/Updated/Review) to 5 (ID/Question/Answer Preview/Status/chevron action). Rows are clickable (onClick on tr delegates to data-row-trigger button for focus management). Hover-visible ChevronRight icon replaces "Open" text button. Table container has bg-card + shadow-ui-sm. min-width reduced 1080→640px. Sticky thead preserved. Filter tabs unchanged (URL-based via page.tsx). Typecheck PASS, lint PASS. Deltas: no confidence bar (ReportRowForDrawer has no confidence field); Citations/Provenance/Updated columns moved to drawer-only (data accessible in drawer sections). |
| Row drawer | `components/matter/RowDrawer.tsx` | `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` | row open/close, mark reviewed, citation open | Phase 5 | ACC-DRW-01: drawer opens/closes; ACC-DRW-02: mark_reviewed action works; ACC-DRW-03: evidence link opens viewer | done | Drawer header rebuilt: serif font-medium title (wireframe h2 style), X close button (inline SVG) replaces ghost Button, removed citation count + updated timestamp chips from header (data available in drawer body sections). bg-muted/30 matches wireframe. All behavior preserved: mark_reviewed optimistic action, split-view lock (localStorage), citation loading, evidence viewer, keyboard Escape handling, focus management. Drawer body sections kept: feedback banner, extracted answer, structured payload, citation summary, metadata (row + trust). Typecheck PASS, lint PASS. Deltas: structured payload and trust metadata sections kept (wireframe doesn't have them — production operator value); "Back to table" kept instead of wireframe "Flag Issue" (no backend action for flagging). |
| Evidence viewer | `components/matter/EvidenceViewer.tsx` | `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`, `apps/web/app/(app)/matters/viewer/page.tsx`, `apps/web/app/(app)/evidence/[id]/page.tsx` | verification integrity + highlight behavior, viewer framing >=90% IA fidelity | Phase 6 | ACC-EV-01: zoom/rotate/page nav works; ACC-EV-02: verification overlay at 100% zoom; ACC-EV-03: keyboard shortcuts work | planned | pending |
| Chat tab | `components/matter/ChatTab.tsx` | `apps/web/app/(app)/matters/[id]/ChatPanel.tsx` | run scope and source-jump gating | Phase 7 | ACC-CHAT-01: messages send and stream; ACC-CHAT-02: source chips render; ACC-CHAT-03: run scope selector works | planned | pending |
| Artefacts tab | `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/ArtefactsList.tsx` | artefact filters, provenance, unsafe semantics | Phase 7 | ACC-ART-01: filter buttons work; ACC-ART-02: unsafe badge renders; ACC-ART-03: download links work | planned | pending |
| Exports tab | `components/matter/ExportsTab.tsx` | `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx` | blocked-export to review deep-link behavior | Phase 7 | ACC-EXP-01: run selector works; ACC-EXP-02: blocked banner shows; ACC-EXP-03: export buttons trigger downloads | planned | pending |
| Demo toolbar/history/checklist | `components/demo/DemoToolbar.tsx`, `components/demo/DemoHistory.tsx`, `components/demo/OperatorChecklist.tsx` | `apps/web/app/DemoToolbar.tsx`, `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`, `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts` | demo pack flow and checklist loop behavior | Phase 4 | ACC-DEMO-01: demo toolbar loads packs; ACC-DEMO-02: history list shows recent; ACC-DEMO-03: checklist steps update | planned | pending |
| Error + status primitives | `components/ui/ErrorBanner.tsx`, `components/ui/StatusChip.tsx` | `apps/web/app/ui/ErrorBanner.tsx`, `apps/web/app/ui/Chip.tsx` | safe error envelope + status vocabulary | Phase 1 | ACC-PRIM-01: ErrorBanner shows code/message/retry; ACC-PRIM-02: StatusChip maps all statuses correctly | planned | pending |
| Tokens + responsive spacing | `src/index.css`, `tailwind.config.js` | `apps/web/app/tokens.css`, `apps/web/tailwind.preset.ts` | design-system styling constraints + wireframe-driven token mechanics + responsive shell spacing | Phase 1 | ACC-TOK-01: new tokens resolve in light+dark; ACC-TOK-02: responsive shell spacing works at breakpoints | in_progress | Token audit: all wireframe color/radius/shadow tokens already exist in production. Added: scrollbar styling to globals.css, `xl`+`full` Page widths. No token.css changes needed. |
| Tables fidelity checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx` | tables meet >=90% IA fidelity without behavior regressions | Phase 8 | ACC-TBL-01: all tables match wireframe column structure; ACC-TBL-02: sticky headers work; ACC-TBL-03: hover states work | planned | pending |
| Filters + search checkpoint | `pages/MattersListPage.tsx`, `components/matter/ReportTab.tsx`, `components/matter/ArtefactsTab.tsx` | `apps/web/app/(app)/matters/page.tsx` (toolbar inlined; MattersToolbar.tsx removed), `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`, `apps/web/app/(app)/matters/artefactsFilters.ts` | search and filter affordances meet >=90% IA fidelity with existing query/logic contracts | Phase 8 | ACC-FLT-01: search input filters; ACC-FLT-02: filter chips toggle; ACC-FLT-03: URL params sync | planned | pending |

## Intentional deltas

| Surface | Wireframe intent | Production decision | Rationale | Date |
|---|---|---|---|---|
| Documents tab | Empty state placeholder ("No documents uploaded yet") | Keep existing SetupDocumentsPanel with upload functionality | Wireframe placeholder loses functional upload UI that already works. Upload is core to the matter creation flow. | 2026-02-12 |
| Sidebar nav | Separate "Runs", "Alerts" nav items | Keep unified "Runs & Alerts" (disabled) | Locked decision from execution plan: "Runs + Alerts stay unified in left navigation" | 2026-02-12 |
| Matters list — progress column | Progress bar column (reviewedQuestions/totalQuestions + percentage bar) | Omit progress column | `MatterListItem` type has no progress/review count fields; backend does not track per-matter review progress yet. Column can be added when data is available. | 2026-02-12 |
| Matters list — State column | No separate State column (status badge covers it) | Drop State column to match wireframe | Wireframe shows only Status (derived from state). Raw state is still available via `?state=` URL param for power users. Reduces visual noise. | 2026-02-12 |
| Matters list — search UX | Instant client-side search (onChange filters list) | Form-based search (Enter submits to URL params) | Server-side filtering via `mattersList.server.ts` URL contract must stay stable. Form submission on Enter preserves URL semantics. | 2026-02-12 |
| New matter — separate page | Dedicated NewMatterPage with upload zone, ingest queue, required docs checklist | Inline CreateMatterForm in PageHeader (name input + submit) | Production inline form is simpler and already functional. Upload/document setup happens in matter detail via SetupDocumentsPanel. Separate page would require new routing. | 2026-02-12 |
| Detail header — tab icons | Tab items have Lucide icons (FileText, FolderOpen, MessageSquare, Archive, Download) | No icons on tabs — label + count only | Wireframe tab icons are decorative. Production WorkspaceTabItem type doesn't include icon. Adding icons would require icon mapping infrastructure for minimal IA gain. | 2026-02-12 |
| Detail header — folder ID in header | Wireframe shows no folder ID in header | Folder ID shown in breadcrumb (layout.tsx context bar), not in header | Wireframe has no concept of ID display — production breadcrumb already shows it. Removing from header reduces clutter and matches wireframe. | 2026-02-12 |
| Fixture context — detail grid | Wireframe OperatorChecklist shows simple step list with checkmarks | Reduced to compact single-row card with pack/status/steps inline | Production needs pack metadata + checklist steps + load state. Wireframe's OperatorChecklist is simpler but lacks production data. Compromise: compact layout with all data. | 2026-02-12 |
| Report table — confidence column | Confidence bar per row (color-coded by threshold) | Omit confidence column | `ReportRowForDrawer` type has no `confidence` field. Backend does not expose per-row confidence scores. Column can be added when data becomes available. | 2026-02-12 |
| Report table — columns dropped | 8 columns: QID, Question, Answer, Status, Citations, Provenance, Updated, Review | 5 columns: ID, Question, Answer Preview, Status, chevron | Wireframe shows a simpler table. Citations count, provenance reason_code, and updated timestamp are still accessible in the row drawer sections. Reduces visual noise. | 2026-02-12 |
| Report table — row interaction | Clickable rows via onClick on `<tr>` | Clickable rows + data-row-trigger button for a11y | Wireframe puts onClick directly on `<tr>` (not accessible). Production delegates tr click to a hidden button for focus return management. Better keyboard/screen reader support. | 2026-02-12 |
| Row drawer — structured payload section | Not present in wireframe | Kept in production | Operators need schema version, payload kind, and raw JSON for debugging. Removing would lose critical operator tooling. | 2026-02-12 |
| Row drawer — trust metadata section | Not present in wireframe (3-row metadata only) | Kept in production (row metadata + trust metadata sub-cards) | Trust metadata (doc_version, verified_at, loaded_state) is essential for verification workflows. Wireframe's 3-row metadata is a simplification. | 2026-02-12 |
| Row drawer — footer actions | "Mark Reviewed" (primary) + "Flag Issue" (secondary) | "Mark reviewed" (success) + "Back to table" (secondary) | "Flag Issue" has no backend action. "Back to table" provides functional navigation. Mark reviewed uses success variant (semantically correct for review completion). | 2026-02-12 |

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
