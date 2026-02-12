# UI Rebuild Clean-Room Detailed Implementation Plan

Date: 2026-02-12  
Branch: `refactor/ui-wireframe-cleanroom`  
Status: Prep complete, implementation not started

## 1) What "mapping" means in this project

Mapping is a strict crosswalk from each wireframe source file to the exact production target file(s), plus the behavior contracts that must remain unchanged.

Each mapping row contains:
1. Wireframe source file path.
2. Production target file path(s).
3. Fresh-build component(s) to create.
4. Contract anchors (URL/query semantics, actions, route handlers, tests).
5. Acceptance checks for parity.

This removes ambiguity and prevents ad-hoc rebuilding.

## 2) Clean-room rules (locked)

1. `orbital-ui-wireframes/src` is the only UI/IA source of truth.
2. Existing `apps/web` UI code is reference-only for behavior contracts, not visual/layout source.
3. Rebuild touched UI as fresh component code (no incremental class patching).
4. Keep server behavior and URL contracts stable; if wireframe and behavior contracts conflict, pause and ask before proceeding, then log the decision.
5. Styling follows `docs/02-guidelines/v5-final/design-system.html`, but token/component mechanics should be built from wireframe patterns and relevant skills even when they differ from generic defaults.
6. Overwriting existing `apps/web` UI components is expected when needed to hit clean-room parity.
7. Every intentional delta is logged in the clean-room parity ledger before coding.
8. Oracle bundles must stay under 5000 total lines (see batching plan).

## 3) Prep completed on 2026-02-12

1. Snapshot commit on `main`: `096ef68` (`chore(ui-rebuild): snapshot pre-cleanroom state`).
2. Snapshot pushed to remote `origin/main`.
3. Archive tag pushed: `archive/pre-cleanroom-ui-rebuild-2026-02-12`.
4. New branch created: `refactor/ui-wireframe-cleanroom`.
5. Detailed planning artifacts created (this file + mapping + oracle batching + clean-room ledger).

## 4) Detailed implementation phases

## Phase 0: Baseline lock and guardrails

Objective: lock references before edits.

Files:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-parity-ledger-2026-02-12.md`
2. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-cleanroom-wireframe-mapping-matrix-2026-02-12.md`

Tasks:
1. Mark all in-scope rows as `planned` in parity ledger.
2. Add owner + acceptance test IDs for each row.
3. Lock wireframe reference list (no ad-hoc source additions).

Exit criteria:
1. Every in-scope surface has a mapping row and parity row.
2. No coding starts until mapping + parity rows exist.

## Phase 1: Foundation audit (tokens, spacing, responsive behavior)

Objective: address your token/responsiveness concern before page rebuild.

Files:
1. `apps/web/app/tokens.css`
2. `apps/web/tailwind.preset.ts`
3. `apps/web/app/ui/WorkspaceShell.tsx`
4. `apps/web/app/ui/WorkspaceSidebar.tsx`

Tasks:
1. Compare wireframe spacing/radius/typography intent against current Orbital token set.
2. Add missing semantic spacing/layout tokens (if needed) without introducing hardcoded route-level values.
3. Ensure mobile/tablet/desktop container behavior is explicit and reusable.
4. Define one canonical page shell spacing contract used by list/detail/new-matter.
5. Replace existing shell primitives where needed rather than preserving legacy styling structures.

Exit criteria:
1. No hardcoded page-level spacing constants in route files for rebuilt surfaces.
2. Shared shell primitives encode responsive padding + layout behavior.
3. Token changes are documented in parity ledger with rationale.

## Phase 2: Shell + navigation clean rebuild

Objective: rebuild shell from wireframe `GlobalShell` + `Sidebar`.

Primary wireframe sources:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/shell/GlobalShell.tsx`
2. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/shell/Sidebar.tsx`

Target files:
1. `apps/web/app/ui/WorkspaceShell.tsx`
2. `apps/web/app/ui/WorkspaceSidebar.tsx`
3. `apps/web/app/(app)/matters/layout.tsx`
4. `apps/web/app/(app)/matters/[id]/layout.tsx`

Tasks:
1. Rebuild sidebar structure and collapse behavior from wireframe semantics.
2. Keep `Runs + Alerts` and `Settings` as explicit disabled affordances.
3. Rebuild top bar breadcrumb/context area from wireframe hierarchy.
4. Keep environment/run context labels aligned with existing behavior contracts.

Exit criteria:
1. `/matters` and `/matters/[id]` both use rebuilt shared shell primitives.
2. Sidebar and topbar visually/structurally match wireframe intent at >=90% IA fidelity.
3. Disabled nav destinations are visually and behaviorally explicit.

## Phase 3: Matters list + new matter clean rebuild

Objective: rebuild list/new-matter surfaces from wireframe pages.

Primary wireframe sources:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/MattersListPage.tsx`
2. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/NewMatterPage.tsx`

Target files:
1. `apps/web/app/(app)/matters/page.tsx`
2. `apps/web/app/(app)/matters/CreateMatterForm.tsx`
3. `apps/web/app/(app)/matters/MattersToolbar.tsx`

Contract anchors (must stay):
1. `apps/web/lib/mattersList.server.ts`
2. URL query semantics used by list state (`q`, `state`, `view`).

Tasks:
1. Rebuild list header, toolbar, filter chips, and scanable table layout from wireframe.
2. Rebuild new-matter form/upload layout from wireframe.
3. Keep search/filter/create behavior contracts unchanged.

Exit criteria:
1. List page structure follows wireframe page hierarchy.
2. New matter flow remains fully functional.
3. URL semantics and server filtering behavior remain stable.
4. Search, filters, and table structure reach >=90% IA fidelity to wireframe.

## Phase 4: Matter detail top-level clean rebuild

Objective: rebuild detail page frame and tab strip from wireframe.

Primary wireframe source:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/pages/MatterDetailPage.tsx`

Target files:
1. `apps/web/app/(app)/matters/[id]/page.tsx`
2. `apps/web/app/ui/WorkspaceTabs.tsx`
3. `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts`
4. `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`

Contract anchors (must stay):
1. `?tab=` routing behavior.
2. report deep-link query continuity (`run_id`, `row_tab`, row selection state).

Tasks:
1. Rebuild summary header, progress/quick-start cluster, and tab layout.
2. Rebuild fixture context/checklist presentation with reduced prominence.
3. Keep tab/content switching semantics intact.

Exit criteria:
1. Detail frame and tab hierarchy align with wireframe at >=90% IA fidelity.
2. Existing deep-link behavior remains intact.

## Phase 5: Report table + drawer clean rebuild

Objective: rebuild report triage flow from `ReportTab` + `RowDrawer`.

Primary wireframe sources:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ReportTab.tsx`
2. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/RowDrawer.tsx`

Target files:
1. `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
2. `apps/web/app/ui/Chip.tsx`
3. `apps/web/app/ui/ErrorBanner.tsx`

Contract anchors (must stay):
1. `mark_reviewed` triage action.
2. row status semantics.
3. citation open behavior.

Tasks:
1. Rebuild row table hierarchy and filter rail from wireframe.
2. Rebuild row drawer sections and action footer.
3. Preserve keyboard/focus + escape behavior for accessibility.

Exit criteria:
1. Triage table and filter rail match wireframe information hierarchy at >=90% IA fidelity.
2. No regression in triage actions or row selection behavior.

## Phase 6: Evidence viewer clean rebuild

Objective: rebuild viewer from wireframe `EvidenceViewer`.

Primary wireframe source:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/EvidenceViewer.tsx`

Target files:
1. `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
2. `apps/web/app/(app)/matters/viewer/page.tsx`
3. `apps/web/app/(app)/evidence/[id]/page.tsx`

Contract anchors (must stay):
1. zoom/verification integrity behavior.
2. citation highlight and metadata.
3. deep-link reliability.

Tasks:
1. Rebuild toolbar, canvas framing, and footer state hierarchy.
2. Keep integrity indicators explicit and deterministic.
3. Preserve keyboard controls and focus behavior.

Exit criteria:
1. Viewer UX follows wireframe hierarchy at >=90% IA fidelity.
2. Evidence integrity behavior remains unchanged.

## Phase 7: Chat, artefacts, exports clean rebuild

Objective: rebuild remaining tabs from wireframe tab components.

Primary wireframe sources:
1. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ChatTab.tsx`
2. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ArtefactsTab.tsx`
3. `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/matter/ExportsTab.tsx`

Target files:
1. `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
2. `apps/web/app/(app)/matters/ArtefactsList.tsx`
3. `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`
4. `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`
5. `apps/web/app/(app)/matters/ExportCsvButton.tsx`

Contract anchors (must stay):
1. run scoping behavior.
2. export block/review deep-link flow.
3. artefact provenance + unsafe labeling behavior.

Tasks:
1. Rebuild layout and hierarchy for chat/artefacts/exports tabs.
2. Preserve contract logic while replacing styling/composition.
3. Rebuild tab-level empty/error/loading states to match wireframe tone.

Exit criteria:
1. All tab surfaces follow mapped wireframe structure at >=90% IA fidelity.
2. Behavior contracts remain stable.

## Phase 8: Verification and closeout

Objective: ship only after parity + regression checks pass.

Required verification:
1. `pnpm -C apps/web lint`
2. `pnpm -C apps/web typecheck`
3. `pnpm -C apps/web test -- test/shellWayfinding.sync.test.ts`
4. `pnpm -C apps/web test -- test/reportTriage.sync.test.ts test/reportRowDrawer.sync.test.ts test/reportEvidenceViewer.sync.test.ts`
5. `pnpm -C apps/web test -- test/demoChecklist.sync.test.ts test/demoHistoryShortcuts.sync.test.ts`
6. Manual smoke: `/matters`, `/matters/[id]`, drawer, viewer, chat, artefacts, exports.
7. Keyboard checks + mobile/desktop responsive checks.

Exit criteria:
1. Verification result is PASS.
2. Parity ledger rows marked `done` with evidence links.
3. Intentional deltas logged with rationale.

## 5) Commit sequence (implementation stage)

1. `refactor(web-ui): establish cleanroom shell primitives and spacing contracts`
2. `refactor(web-ui): rebuild matters list and new matter from wireframe mapping`
3. `refactor(web-ui): rebuild matter detail frame and tabs from wireframe mapping`
4. `refactor(web-ui): rebuild report triage table and row drawer from wireframe mapping`
5. `refactor(web-ui): rebuild citation viewer from wireframe mapping`
6. `refactor(web-ui): rebuild chat artefacts exports from wireframe mapping`
7. `chore(web-ui): cleanroom parity verification and evidence closeout`

## 6) No-build prep boundary

This document and associated planning files are prep-only artifacts.
No UI rebuild implementation has started yet.

## 7) Definition of done alignment

1. `/matters` and `/matters/[id]` structurally follow wireframe IA at >=90% fidelity with logged deltas.
2. Runs + Alerts remain unified in left navigation with disabled affordances.
3. Breadcrumb and topbar are reusable/shared and at >=90% wireframe IA fidelity.
4. Drawer and evidence viewer are at >=90% wireframe IA fidelity with no behavior regressions.
5. Reusable components live in `apps/web/app/ui` with minimal route-level style drift.
6. Parity includes user-visible states: loading, empty, and error.
7. Verification matrix passes and parity ledger is complete.
8. Core tables (matters/report/artefacts) meet >=90% wireframe IA fidelity.
9. Core filters and search affordances meet >=90% wireframe IA fidelity.
