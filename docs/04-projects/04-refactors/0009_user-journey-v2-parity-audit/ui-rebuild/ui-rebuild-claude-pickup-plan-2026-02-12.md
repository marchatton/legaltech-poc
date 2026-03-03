# Claude Pickup Plan: Consolidated UI Feedback Pass

Date: 2026-02-12  
Status: Ready for implementation (plan only, no code changes)  
Primary target: `apps/web` matters list + matter detail (`To-do`, `Documents`, `Chat`, `Reports`)

## Objective
Apply the full consolidated operator feedback to simplify the UI, fix layout/sticky behavior, remove internal IDs from user-facing surfaces, and align styling closer to `v5-final` while preserving existing backend contracts and tab/route behavior.

## Inputs
- User feedback transcript (consolidated in Appendix A).
- Screenshots:
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.13.26.png`
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.14.39.png`
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.22.43.png`
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.23.52.png`
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.28.16.png`
  - `/Users/marc/Documents/Screenshots/Screenshot 2026-02-12 at 22.30.19.png`
- Style references:
  - `docs/02-guidelines/v5-final/design-system.html`
  - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`

## Decisions Locked
1. Delivery is two phases: Phase 1 (layout/navigation/copy cleanup), Phase 2 (interaction/style polish).
2. Sidebar behavior must be consistent across matters list and matter detail tabs.
3. Matters search is half-width, and `All` filter pill exists and is default-selected.
4. Quick Start remains in Documents flow; hide internal run IDs from operator-facing UI.
5. Use `v5-final` for chat/report polish direction and wireframes for shell/layout behavior.

## Constraints
1. No backend/schema/API contract changes in this pass.
2. Preserve current URL-driven behavior (`tab`, `run_id`, `row_tab`) and existing workflows.
3. Remove internal IDs from visible UI where requested (do not remove backend identity usage).
4. Keep existing accessibility baseline (focus states, keyboard reachability, readable statuses).

## Implementation Plan

### Phase 1 (P0): Layout, Sticky, IA, and Copy Cleanup
1. Normalize top rows and sticky offsets on matters list.
   - Files: `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/ui/WorkspaceShell.tsx`, `apps/web/app/layout.tsx`.
   - Actions:
     - Remove the confusing extra top row effect between demo toolbar and content.
     - Ensure `Matters` heading is visible and not visually hidden behind sticky rows.
     - Remove list-page subtitle: "Manage your legal review projects."
   - Acceptance:
     - No perceived duplicate/stray row above list content.
     - Heading and top controls remain visible on load and scroll.

2. Enforce consistent fixed sidebar behavior across list/detail/tabs.
   - Files: `apps/web/app/ui/WorkspaceSidebar.tsx`, `apps/web/app/ui/WorkspaceShell.tsx`.
   - Actions:
     - Keep `Orbital` anchored top-left.
     - Keep operator card anchored bottom-left.
     - Ensure `Runs`, `Alerts`, `Settings` render full-width rows, each on its own line.
     - Ensure disabled-item hover behavior reads left-to-right and not compressed/wrapped.
   - Acceptance:
     - Sidebar structure and anchoring look identical on matters list, detail, documents, chat, reports.

3. Matters list simplification and scanability.
   - Files: `apps/web/app/(app)/matters/page.tsx`.
   - Actions:
     - Add `All` saved-view pill and make it default state.
     - Keep search placeholder text, set search container width to half layout target.
     - Remove system ID display from each row.
     - Remove created time, keep date only.
     - Remove right-side "Recent Demo Matters" panel.
     - Move row hover arrow affordance to far-right edge of row.
   - Acceptance:
     - Table is visibly more minimal and free of internal IDs/time granularity.
     - Hover chevron appears at right-most action position.

4. Matter detail header/breadcrumb cleanup.
   - Files: `apps/web/app/(app)/matters/[id]/layout.tsx`, `apps/web/app/(app)/matters/[id]/page.tsx`.
   - Actions:
     - Realign breadcrumb row to top shell geometry.
     - Remove system ID from breadcrumb.
     - Remove visible internal run ID badges in header context.
     - Remove demo-environment pill where redundant.
   - Acceptance:
     - Breadcrumb and heading alignment is consistent with shell top row.
     - No internal IDs shown in breadcrumb/header badges.

5. To-do panel readability improvements.
   - Files: `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`.
   - Actions:
     - Convert current checklist chip cluster toward a clearer vertical stepper presentation.
   - Acceptance:
     - Progress is understandable at a glance without dense inline chips.

6. Documents tab workflow clarity and spacing consistency.
   - Files: `apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx`, `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx`.
   - Actions:
     - Remove tab-specific top gap/offset inconsistency.
     - Keep Quick Start visible and obvious (not hidden).
     - Hide internal run ID feedback after starting Quick Start.
     - Replace verbose "already running" message with concise status and tooltip for detail.
     - Match visual size of `Upload documents` and `Refresh readiness` buttons.
     - Move "PDF only - max 50 MB" helper closer to action controls.
     - Replace ambiguous "continue" wording with explicit "run Quick Start" wording.
   - Acceptance:
     - Documents tab top alignment matches other tabs.
     - Flow is explicit: upload -> indexed-ready -> run Quick Start.

### Phase 2 (P1): Visual and Interaction Polish (v5-final-inspired)
1. Chat panel style and density pass.
   - Files: `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`, `apps/web/app/(app)/matters/[id]/page.tsx`.
   - Actions:
     - Remove intro line above chat card: "Ask evidence-grounded questions about this matter."
     - Remove header "Status: Ready" and long evidence-first helper sentence.
     - Keep "Ask about this matter" empty state copy.
     - Improve streaming affordances in the assistant bubble/header region.
     - Re-layout suggested prompts to a cleaner vertical stack style.
     - Retain core send/composer behavior.
   - Acceptance:
     - Chat feels closer to preferred v5 pattern and has less instructional clutter.

2. Reports tab run selector and metadata simplification.
   - Files: `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/(app)/matters/[id]/page.tsx`.
   - Actions:
     - Remove visible raw run IDs from user-facing labels.
     - Remove duplicate "Selected run..." line.
     - Use concise option label format: datetime + latest marker + status.
   - Acceptance:
     - No duplicated run metadata blocks; selector is concise and readable.

3. Reports download cards.
   - Files: `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`, `apps/web/app/ui/Card.tsx` (if needed).
   - Actions:
     - Replace flat download control row with card-based report download blocks.
   - Acceptance:
     - Reports actions read as clear, scannable cards.

4. Reuse preferred components and tokens from v5-final.
   - Files: `apps/web/app/ui/DropdownMenu.tsx`, `apps/web/app/ui/Badge.tsx`, `apps/web/app/ui/Chip.tsx`, `apps/web/app/ui/Skeleton.tsx`, `apps/web/app/tokens.css`.
   - Actions:
     - Apply slick icon-forward dropdown feel.
     - Tighten badge/chip styles (including mono citation/filter variants).
     - Keep and extend skeleton/loader affordances.
     - Evaluate color emphasis shift from 500 to 600 where contrast and hierarchy benefit.
   - Acceptance:
     - Shared primitives reflect a cohesive visual system and avoid ad hoc one-off styling.

## File Touchpoints (Expected)
- `apps/web/app/layout.tsx`
- `apps/web/app/(app)/matters/page.tsx`
- `apps/web/app/(app)/matters/[id]/layout.tsx`
- `apps/web/app/(app)/matters/[id]/page.tsx`
- `apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx`
- `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx`
- `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
- `apps/web/app/(app)/matters/[id]/ExportsPanel.tsx`
- `apps/web/app/ui/WorkspaceSidebar.tsx`
- `apps/web/app/ui/WorkspaceShell.tsx`
- `apps/web/app/ui/WorkspaceTabs.tsx`
- `apps/web/app/ui/DropdownMenu.tsx`
- `apps/web/app/ui/Badge.tsx`
- `apps/web/app/ui/Chip.tsx`
- `apps/web/app/ui/Skeleton.tsx`
- `apps/web/app/tokens.css`

## Verification Plan
1. Update sync tests impacted by contract copy/labels/structure:
   - `apps/web/test/mattersList.sync.test.ts`
   - `apps/web/test/shellWayfinding.sync.test.ts`
   - `apps/web/test/setupDocuments.sync.test.ts`
   - `apps/web/test/quickStartReadiness.sync.test.ts`
   - `apps/web/test/demoHistoryShortcuts.sync.test.ts`
   - `apps/web/test/exportBlockingState.sync.test.ts`
2. Run targeted checks:
   - `pnpm --filter @legaltech-poc/web test -- mattersList.sync.test.ts shellWayfinding.sync.test.ts setupDocuments.sync.test.ts quickStartReadiness.sync.test.ts demoHistoryShortcuts.sync.test.ts exportBlockingState.sync.test.ts`
   - `pnpm --filter @legaltech-poc/web typecheck`
3. Manual smoke:
   - `/matters`
   - `/matters/[id]?tab=report`
   - `/matters/[id]?tab=documents`
   - `/matters/[id]?tab=chat`
   - `/matters/[id]?tab=exports`
   - Check light/dark, desktop/mobile widths, and sticky behavior.

## Suggested Commit Slices
1. `feat(web-ui): simplify matters list shell and filters`
2. `feat(web-ui): align detail header/sidebar and remove internal ids`
3. `feat(web-ui): clarify documents quick-start workflow and controls`
4. `feat(web-ui): restyle chat surface with improved streaming affordances`
5. `feat(web-ui): simplify reports selector and add card-based download actions`
6. `chore(web-ui): sync tests and closeout verification`

## Appendix A: Consolidated Feedback (Operator)

### A1. Global and Matters List
1. There is a confusing random row between the demo toolbar row and the top content with `Orbital`.
2. Matters breadcrumb/header region currently hides or obscures the main heading.
3. Remove list-page subtitle: "Manage your legal review projects."
4. Keep search text concept ("Search matters by name or ID"), but set search width to half-width target.
5. Add `All` filter pill and make it the default selected filter.
6. Remove system ID from matters table.
7. Remove time from created column in matters table (date-only for minimalism).
8. Remove right-side "Recent Demo Matters" panel completely.
9. On row hover/click, move the arrow affordance to the far right side (not center-aligned inside row content).

### A2. Left Sidebar / Nav Behavior
1. Sidebar must feel fixed to the left.
2. `Orbital` must stay fixed top-left.
3. `Ruth Bader Ginsburg` profile block must stay fixed bottom-left.
4. Nav rows should be full-width and left-to-right.
5. `Runs` should align like `Matters`; `Alerts` and `Settings` should each be their own rows.
6. Hover behavior for `Alerts` and `Settings` should be full-row left-to-right, not cramped.
7. Positive note: current detail-page sidebar behavior is close/correct.

### A3. Matter Detail Header/Breadcrumb
1. Breadcrumb row is vertically off and not aligned to top shell row.
2. Matter heading is not clearly visible due to top spacing/alignment.
3. Remove system ID from breadcrumb.
4. Remove redundant demo-environment pill where it adds noise.
5. Remove internal run ID badge from top-right context area.

### A4. To-do Panel
1. Current to-do layout feels messy.
2. Replace chip-heavy representation with a clearer vertical stepper concept.

### A5. Documents Tab
1. Documents tab has slight top-gap/scroll offset mismatch versus chat/reports tabs.
2. Quick Start entry point is hard to see; should be obvious.
3. After Quick Start, internal run ID is shown; do not expose internal ID.
4. "Quick Start already running..." copy should be much shorter in-line.
5. Detailed running explanation should be moved to tooltip/hover helper.
6. `Upload documents` and `Refresh readiness` button sizes should match.
7. "PDF only - max 50 MB" helper should sit closer to action controls.
8. "Upload source documents and continue once at least one is indexed-ready" is confusing; use explicit run wording.
9. Overall process needs clearer progression from documents to run.

### A6. Chat Tab
1. Chat is generally acceptable but too text-heavy.
2. Remove outer helper line: "Ask evidence-grounded questions about this matter."
3. Remove "Status: Ready" line.
4. Remove long "Evidence-first..." sentence in header.
5. Keep empty-state "Ask about this matter" text.
6. Improve layout of 3 suggested prompts; likely vertical stack.
7. Prefer styling closer to `v5-final` chat.
8. Keep send flow and basic controls.

### A7. Reports Tab
1. Reports heading/subtext are okay.
2. "Source run" plus extra selected-run detail is duplicative.
3. Remove internal ID exposure in run selector and selected-run summary.
4. Label run choices with date/time plus status plus latest marker (no raw IDs).
5. Use card-style report download actions (preferred over current flat button grouping).

### A8. v5-final Elements to Reuse
1. Entire chat interface direction (with added streaming affordances).
2. Dropdown menu styling with icons.
3. Badges/chips style for statuses and filters, including citation chips and mono text treatment.
4. Progress steps design language.
5. Loaders and skeleton loaders.
6. PDF citation viewer blue geometry highlight behavior.
7. Cards (where useful).
8. Stronger, more consistent typography character.
9. Heading accent with small vertical orange line.
10. Consider stronger primary usage at `600` over `500` when appropriate.

### A9. Wireframe Elements to Reuse
1. Left menu rows are full-width and visually clear.
2. Overall layout direction is liked and considered close.

### A10. Defaults Confirmed by User
1. Use two-phase plan (cleanup first, polish second).
2. Make sidebar behavior identical across list/detail/tabs.
3. Use half-width search plus default `All` pill.
4. Keep Quick Start in Documents and hide internal IDs.
5. Use `v5-final` as style reference for chat/reports polish.

