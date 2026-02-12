# Orbital UI Rebuild Execution Plan (Hardened)

Date: 2026-02-12  
Status: Ready for 3-agent parallel execution  
Scope: `apps/web` UI/IA rebuild aligned to wireframes, design-system standards, and parity-v1 behavior contracts.

> Superseded for execution by clean-room planning artifacts:
> - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild-cleanroom-detailed-implementation-plan-2026-02-12.md`
> - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild-cleanroom-wireframe-mapping-matrix-2026-02-12.md`
> - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild-cleanroom-parity-ledger-2026-02-12.md`
> - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/oracle-cleanroom-batching-plan-2026-02-12.md`

## Objective
Rebuild the `apps/web` information architecture and interaction model to mirror:

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`

while preserving visual standards from:

- `docs/02-guidelines/v5-final/design-system.html`

and behavior/contracts from:

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings-2026-02-12-implementation-closeout.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/sequencing-parallel-plan.md`

## Precedence Rules (to avoid acceptance ambiguity)
1. Behavior and backend contracts are non-negotiable in this pass.
2. Information architecture follows wireframes at 90%+ fidelity for in-scope surfaces. If wireframes conflict with behavior/backend contracts, contracts win and the delta is logged.
3. Visual language follows Orbital design-system tokens and standards (or extends on them) - `docs/02-guidelines/v5-final/design-system.html`
4. If references conflict, log decision in the parity ledger with rationale before implementation.

## Scope
1. Rework global shell/navigation, matters list, matter detail, row drawer, and evidence/PDF viewer. Including tables on those pages.
2. Update/ expand/refactor reusable UI building blocks into `apps/web/app/ui` with clear ownership boundaries.
3. Keep behavior parity for user-visible flows plus loading/error/empty states with existing contracts and route handlers.
4. Document all intentional deltas in a parity ledger.
5. Remove hard-coded example data in touched UI surfaces.
6. Simple UI polish changes are allowed when they do not add backend work or new product features.

## Out of Scope
1. Backend/API/schema changes.
2. New product features outside parity and simple UI polish.
3. Mandatory staged rollout or feature flags (not required for this pre-prod pass).

## Parallel Agent Lanes (3 Areas)
Use three lanes in parallel to reduce cycle time and keep merge boundaries explicit.

### Lane A: Shell + System
Owns:
- `apps/web/app/ui/WorkspaceSidebar.tsx`
- `apps/web/app/(app)/matters/layout.tsx`
- `apps/web/app/(app)/matters/[id]/layout.tsx`
- shared shell primitives in `apps/web/app/ui`
- token/preset consolidation in Wave 5

Must not own:
- detail business-surface structure in `apps/web/app/(app)/matters/[id]/page.tsx`
- drawer/viewer behavior code

### Lane B: Matters List + Detail IA
Owns:
- `apps/web/app/(app)/matters/page.tsx`
- `apps/web/lib/mattersList.server.ts` (parity-preserving only)
- `apps/web/app/(app)/matters/[id]/page.tsx`
- `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts`
- `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`

Must not own:
- shell primitives
- drawer/viewer component internals

### Lane C: Drawer + Viewer
Owns:
- `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
- `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`

Must not own:
- global shell/layout contracts
- list/detail top-level route structure

## Branch and Integration Strategy
1. Create integration branch: `refactor/ui-rebuild-integration`.
2. Create per-lane branches:
   - `refactor/ui-shell-system`
   - `refactor/ui-matters-list-detail`
   - `refactor/ui-drawer-viewer`
3. Rebase each lane branch on integration branch at least daily.
4. Merge lane branches one at a time into integration branch.
5. Merge integration branch to `main` only after Wave 6 Go/No-Go PASS.

## Risk and Rollback (Pre-Prod)
1. No mandatory feature flag requirement for this pass.
2. New dependencies are allowed when clearly useful and kept minimal; log rationale in parity ledger.
3. No strict performance budget gate; avoid obvious regressions in loading and interaction responsiveness.
4. Rollback path is direct revert of integration merge/commit(s) if parity or stability regresses.
5. Keep commits scoped by lane/wave to make rollback clean and fast.

## Execution Waves and Gates

### Wave 0 (all lanes): Fresh Context + Baseline Lock
Required inputs:
- `AGENTS.md`
- `apps/web/AGENTS.md`
- `docs/02-guidelines/AGENTS.md`
- wireframe source files
- closeout findings and sequencing notes

Tasks:
1. Capture baseline screenshots and DOM snapshots for:
   - `/matters`
   - `/matters/[id]`
   - open drawer
   - citation viewer
2. Create and seed parity ledger:
   - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild-plan.md`
   - Minimum columns: surface, current, wireframe, chosen implementation, rationale, owner, status, evidence.
3. Resolve unknowns using `ask-questions-if-underspecified` before code edits.

Exit gate:
- Baseline artifacts captured and linked.
- Parity ledger exists with initial entries for all in-scope surfaces.
- Conflicting reference decisions logged.

### Wave 1 (Lane A primary): Shell and Navigation Refactor
Tasks:
1. Replace sidebar behavior in `WorkspaceSidebar.tsx` with wireframe-style IA.
2. Merge Runs + Alerts + Settings should not be clickable (should show a disabled state with a hover over)
3. Introduce reusable shell primitives in `apps/web/app/ui`.
4. Adopt primitives in list/detail layouts.
5. Ensure active-state contrast and tokens-only styling.

Exit gate:
- `/matters` and `/matters/[id]` both use shared shell primitives.
- No route-local hardcoded design values introduced.
- Parity ledger updated for shell/nav decisions.

### Wave 2 (Lane B primary, Lane C parallel start): Matters List and Detail IA
Tasks:
1. Refactor `apps/web/app/(app)/matters/page.tsx` IA (header, search, filters, row scanability).
2. Preserve server-side filters and URL semantics from `apps/web/lib/mattersList.server.ts`.
3. Refactor detail top section and tab row in `apps/web/app/(app)/matters/[id]/page.tsx`.
4. Preserve query-param tab behavior and fixture-context panel functionality.

Exit gate:
- URL-driven tab behavior remains intact.
- Existing filter/query behavior remains intact.
- Fixture context and checklist still function with reduced visual prominence.
- Parity ledger updated for list/detail.

### Wave 3 (Lane C primary, Lane B support): Row Drawer + Split Viewer
Tasks:
1. Re-skin/reorganize `ReportTriagePanel.tsx` to wireframe-like table/drawer flow.
2. Preserve:
   - `mark_reviewed`
   - citation loading behavior
   - split-view lock persistence
3. Tighten hierarchy, spacing, metadata grouping.
4. Preserve trust metadata and provenance features.

Exit gate:
- No regressions in triage actions and evidence loading.
- Deep-link continuity remains intact for review workflows.
- Parity ledger updated for drawer decisions and deltas.

### Wave 4 (Lane C primary, Lane A support): PDF/Evidence Viewer Polish
Tasks:
1. Refine `CitationViewerClient.tsx` framing to match wireframe hierarchy.
2. Preserve integrity logic:
   - 100% zoom verification
   - snippet hash signaling
   - trust metadata behavior
3. Improve keyboard and microinteraction behavior.

Exit gate:
- Evidence integrity contract unchanged.
- Keyboard path validated for viewer interactions.
- Parity ledger updated for viewer changes.

### Wave 5 (Lane A primary): Design System Consolidation
Tasks:
1. Extract repeated classes into reusable components in `apps/web/app/ui`.
2. Align styling to tokens in:
   - `apps/web/app/tokens.css`
   - `apps/web/tailwind.preset.ts`
3. Remove one-off styling where token equivalents exist.

Exit gate:
- No duplicated UI patterns remain across touched surfaces.
- Token/preset changes are scoped and documented in parity ledger.
- No hardcoded color/timing/radius constants in touched route files.

### Wave 6 (Lane B primary, all lanes support): Verification and Regression Pass
Tasks:
1. Run verification ladder for touched surfaces.
2. Run baseline checks:
   - `pnpm lint`
   - `pnpm typecheck`
3. Run manual route smoke for `/matters`, `/matters/[id]`, row drawer, and citation viewer with clean browser console.
4. Validate dark/light themes, mobile/desktop behavior, and keyboard accessibility.
5. Produce final parity report listing intentional diffs:
   - Magic -> Orbital
   - Orbital -> Magic

Exit gate:
- Verification matrix passes.
- Go/No-Go report is explicit PASS or NO-GO.
- Final parity ledger is complete and linked.

## Verification Matrix (minimum)
| Surface | Typecheck/Lint | Route smoke | Keyboard/a11y | Theme (dark/light) | Deep-link checks | Evidence |
|---|---|---|---|---|---|---|
| `/matters` | Required | Required | Required | Required | N/A | screenshot + notes |
| `/matters/[id]` | Required | Required | Required | Required | `?tab=` coverage required | screenshot + notes |
| Report drawer | Required | Required | Required | Required | row/deeplink continuity required | screenshot + notes |
| Citation viewer | Required | Required | Required | Required | citation jump + verify state required | screenshot + notes |

## Definition of Done
1. `/matters` and `/matters/[id]` structurally follow wireframe IA at 90%+ fidelity, with logged contract-driven deltas.
2. Runs + Alerts are unified in left navigation.
3. Breadcrumb/topbar are reusable and shared.
4. Drawer and PDF viewer meet reference quality without behavior regressions.
5. Reusable components live in `apps/web/app/ui`; no route-level one-off design drift.
6. Parity includes user-visible flow states plus loading/error/empty states.
7. Verification matrix passes and parity ledger is complete.

## Proposed Commit Sequence
1. `feat(web-ui): rebuild workspace shell and unified sidebar IA`
2. `feat(web-ui): refactor matters list and detail IA with parity-preserving URL behavior`
3. `feat(web-ui): redesign report triage drawer with split evidence continuity`
4. `feat(web-ui): polish citation viewer while preserving evidence integrity contracts`
5. `feat(web-ui): consolidate shared ui primitives and token alignment`
6. `chore(web-ui): verification closeout and parity ledger`

## Decisions Locked (2026-02-12, clarified)
1. Parity scope: user-visible flows plus loading/error/empty states.
2. IA bar: 90%+ wireframe fidelity on in-scope surfaces; behavior/backend contracts win conflicts; deltas must be logged.
3. Verification gate: `pnpm lint` + `pnpm typecheck` + manual route smoke + keyboard/a11y + screenshots.
4. Scope boundary: no backend changes, no net-new features; simple UI polish is allowed.
5. Pre-prod risk posture: no mandatory feature flags, no strict perf budget gate (avoid obvious regressions), rollback via revert.
6. Dependencies: allowed when clearly useful and minimal.
7. Runs + Alerts stay unified in left navigation.

## Fixture Context Panel (Current App)
The fixture-context panel is the demo-specific card shown on matter detail report view, currently labeled "Fixture Context" and "Demo Sequence". It shows seeded-pack context (active pack, next step, loaded time, checklist). Current implementation lives in:

- `apps/web/app/(app)/matters/[id]/page.tsx`
- `apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts`
- `apps/web/app/(app)/matters/[id]/operatorChecklist.ts`
