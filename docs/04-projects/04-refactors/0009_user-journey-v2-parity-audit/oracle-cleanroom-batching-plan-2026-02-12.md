# Oracle Clean-Room Batching Plan (<5000 lines)

Date: 2026-02-12  
Constraint: Any oracle bundle must stay below 5000 total lines.

## Line-budget rule

1. Every oracle run must include a pre-check line count.
2. If total lines >= 5000, split into smaller bundles before running oracle.
3. Keep each bundle focused on one implementation phase.

## Current baseline line counts (key files)

1. Wireframe TS/TSX total: `2426` lines.
2. Common app target set sampled for rebuild: `4645` lines.
3. Token alignment set (`index.css` + `tailwind.config.js` + `tokens.css` + `tailwind.preset.ts`): `817` lines.

## Planned bundle sets

## Bundle A: Shell + list + new matter

Goal: Phase 1-3 guidance.

Estimated lines: ~1500

Wireframe references:
1. `orbital-ui-wireframes/src/components/shell/GlobalShell.tsx`
2. `orbital-ui-wireframes/src/components/shell/Sidebar.tsx`
3. `orbital-ui-wireframes/src/pages/MattersListPage.tsx`
4. `orbital-ui-wireframes/src/pages/NewMatterPage.tsx`
5. `orbital-ui-wireframes/src/components/demo/DemoToolbar.tsx`
6. `orbital-ui-wireframes/src/components/demo/DemoHistory.tsx`

App targets:
1. `apps/web/app/ui/WorkspaceShell.tsx`
2. `apps/web/app/ui/WorkspaceSidebar.tsx`
3. `apps/web/app/ui/WorkspaceTabs.tsx`
4. `apps/web/app/(app)/matters/layout.tsx`
5. `apps/web/app/(app)/matters/page.tsx`
6. `apps/web/app/(app)/matters/CreateMatterForm.tsx`
7. `apps/web/app/DemoToolbar.tsx`

## Bundle B: Detail + report + drawer

Goal: Phase 4-5 guidance.

Estimated lines: ~2600

Wireframe references:
1. `orbital-ui-wireframes/src/pages/MatterDetailPage.tsx`
2. `orbital-ui-wireframes/src/components/matter/ReportTab.tsx`
3. `orbital-ui-wireframes/src/components/matter/RowDrawer.tsx`
4. `orbital-ui-wireframes/src/components/demo/OperatorChecklist.tsx`
5. `orbital-ui-wireframes/src/components/ui/StatusChip.tsx`
6. `orbital-ui-wireframes/src/components/ui/ErrorBanner.tsx`

App targets:
1. `apps/web/app/(app)/matters/[id]/page.tsx`
2. `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
3. `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`
4. `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts`
5. `apps/web/app/ui/Chip.tsx`
6. `apps/web/app/ui/ErrorBanner.tsx`

## Bundle C: Evidence viewer

Goal: Phase 6 guidance.

Estimated lines: ~1700

Wireframe references:
1. `orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx`

App targets:
1. `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
2. `apps/web/app/(app)/matters/viewer/page.tsx`
3. `apps/web/app/(app)/evidence/[id]/page.tsx`
4. `apps/web/lib/overlayHighlight.ts`
5. `apps/web/lib/httpRange.server.ts`

## Bundle D: Chat + artefacts + exports

Goal: Phase 7 guidance.

Estimated lines: ~1800

Wireframe references:
1. `orbital-ui-wireframes/src/components/matter/ChatTab.tsx`
2. `orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx`
3. `orbital-ui-wireframes/src/components/matter/ExportsTab.tsx`

App targets:
1. `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
2. `apps/web/app/(app)/matters/ArtefactsList.tsx`
3. `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`
4. `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`
5. `apps/web/app/(app)/matters/ExportCsvButton.tsx`
6. `apps/web/app/(app)/matters/artefactsFilters.ts`
7. `apps/web/app/(app)/matters/runScope.ts`

## Bundle E: Tokens + responsive spacing

Goal: Phase 1 token/layout validation.

Estimated lines: ~900

Wireframe references:
1. `orbital-ui-wireframes/src/index.css`
2. `orbital-ui-wireframes/tailwind.config.js`

App targets:
1. `apps/web/app/tokens.css`
2. `apps/web/tailwind.preset.ts`
3. `apps/web/app/ui/WorkspaceShell.tsx`
4. `apps/web/app/ui/WorkspaceSidebar.tsx`

## Pre-oracle check command template

```bash
wc -l <file1> <file2> ... <fileN> | tail -n1
```

Expected result:
1. Final total line count in last row must be `<5000`.
2. If not, split the bundle further by surface.
