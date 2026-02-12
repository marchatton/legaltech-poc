# UI Parity Report + Final Pass Plan

Date: 2026-02-11
Status: Plan + implementation kickoff notes
Primary references:
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes`
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`

Approved implementation options (2026-02-11):
- `1a`: UI-only default; flag backend-required items case-by-case.
- `2b`: Stronger art direction while staying compatible with v5-final tokens.
- `3a`: URL-driven tabs via `?tab=` as canonical detail-workspace state.
- `4a`: Keep `Runs`/`Alerts`/`Settings` visible as disabled placeholders.
- `5a`: Headless browser validation.
- `6a`: Keep and refine existing uncommitted UI edits.

## Objective

Redesign information architecture and microinteractions across the app to match the structure, clarity, and polish level of the Orbital wireframes, while respecting real app constraints and preserving behavioral consistency.

## Constraints and quality bar

- Use existing Tailwind setup and token system.
- Extend brand config via `generating-tailwind-brand-config` only where required.
- Keep design system UI in reusable components under `apps/web/app/ui`.
- No hardcoded configuration values (tokens/config only).
- No one-off styling patterns.
- Respect:
  - `baseline-ui`
  - `interface-design`
  - `frontend-design`
  - `web-design-guidelines`
- Do not change spike functionality (`rh1`, `rh2`) beyond UI polish.

## Current parity snapshot

Structural parity to wireframes: ~78-84%
Visual parity to `v5-final`: ~68-75%

Main remaining gaps:
- Cross-route shell contract is not fully normalized.
- Matter detail tab/workspace patterns are not fully harmonized.
- Typography rhythm + spacing density still vary by route.
- Microinteraction semantics are improved but not yet fully standardized.

## Preflight sanity check on uncommitted UI work

Validated on current branch:
- `pnpm -C apps/web typecheck`: PASS
- `pnpm -C apps/web lint`: PASS (2 existing warnings in unrelated files)

Resolved in kickoff implementation:
1. `apps/web/app/(app)/matters/[id]/page.tsx`
   Fixed tab count typo path (`artefactsListEnabled ? null : null`) to explicit `artefacts: null`.
2. `apps/web/app/(app)/evidence/[id]/page.tsx`
   State/error layouts moved to shared `StatePage`; unused-import risk removed.
3. `apps/web/app/(app)/matters/viewer/page.tsx`
   State/error layouts moved to shared `StatePage`; unused-import risk removed.
4. `apps/web/app/(app)/matters/[id]/page.tsx`
   Detail tab rail now uses shared `WorkspaceTabs` with nav semantics (`aria-current`), replacing link-as-tab role misuse.

## Implementation plan (approved scope target)

### Phase 0: Freeze baseline and scoring rubric

1. Capture screenshots for:
   - `/`
   - `/matters`
   - `/matters/[id]?tab=overview`
   - `/matters/[id]?tab=documents`
   - `/matters/[id]?tab=report`
   - `/matters/[id]?tab=chat`
   - `/matters/[id]?tab=exports`
   - `/matters/[id]?tab=artefacts`
   - `/evidence/[id]`
   - `/matters/viewer`
2. Score each route on:
   - IA parity
   - Visual parity
   - Interaction parity
3. Use this as before-state for final parity delta report.

### Phase 1: IA normalization

1. Establish one shell contract across route groups:
   - top destination behavior
   - context header and breadcrumb cadence
   - section rhythm and density
2. Normalize matter detail workspace:
   - clear tab contracts
   - stable run/filter persistence where expected
   - canonical empty/loading/error placement
3. Normalize state pages:
   - invalid
   - not found
   - request failure
   - deterministic retry/back actions

### Phase 2: Reusable UI system pass (`apps/web/app/ui`)

Refactor and consolidate reusable primitives/compositions rather than route-local styles:
- Shell and framing:
  - `WorkspaceShell` composition (header rail + context rail + page rhythm)
  - `StateCard` composition (invalid/not found/failure/loading)
- Matter surfaces:
  - `WorkspaceTabs`
  - `SectionRail` / `ActionRail`
  - `RunScopeBadge` / `RunScopeWarning`
- Review surfaces:
  - report table header/row composition
  - row detail shell (drawer-ready contract)
  - source chip states (ready/disabled/reason)
- Feedback surfaces:
  - unified `ErrorBanner` contract
  - loading/skeleton presets
  - consistent empty-state CTA framing

Rule: if repeated twice across routes, promote to `apps/web/app/ui`.

### Phase 3: Brand + Tailwind config hardening

1. Review token coverage against current surfaces and add missing semantic roles only if needed:
   - surface tiers
   - border tiers
   - focus ring and interactive emphasis tiers
2. Keep Tailwind defaults unless a new semantic token is required.
3. Ensure no hardcoded colors/timings/radii in route files where tokenized alternatives exist.
4. Record any config changes in this dossier as an architecture decision note.

### Phase 4: Microinteraction parity pass

1. Standardize hover/focus/pressed/disabled/loading semantics.
2. Unify transition durations/easing by interaction class:
   - feedback transitions
   - structural entrance transitions
3. Validate keyboard and accessibility behavior:
   - tab navigation and focus visibility
   - no hover-only discoverability
   - button/link semantics on every critical path

### Phase 5: Verification and closeout

1. Run targeted test set:
   - sync tests around shell/matters/viewer/report/chat surfaces
2. Run `typecheck` and `lint`.
3. Run `test-browser` click-through on key journeys:
   - matter creation/load
   - setup to run
   - report triage
   - evidence jump
   - export and artefact flow
4. Produce final parity report:
   - before/after scores
   - explicit deviations from wireframes
   - confirmation of no behavioral regressions

## Planned deviations from wireframes

Intentional differences we keep:
1. `Runs`, `Alerts`, `Settings` remain visible placeholders (disabled).
2. No hardcoded sample IDs/timestamps/counts from wireframes.
3. Trust and viewer metadata must remain source-backed and dynamic.
4. No backend-heavy workflow additions in this pass.

## Deliverables

1. Refactored IA structure with normalized shell/workspace behavior.
2. Updated/new reusable UI components in `apps/web/app/ui`.
3. Tailwind/token updates only where needed, with no hardcoded config values.
4. Parity closeout report with score deltas and documented deviations.
5. Validation evidence from test suite + `test-browser` journey checks.

## Must-have clarifications before implementation

Reply with `defaults` to accept recommended options.

1) Visual direction strictness?
- a) Match current v5-final tokens and hierarchy exactly (Recommended)
- b) Push a stronger art direction while keeping same tokens

2) Matter detail tabs behavior?
- a) URL-driven tabs (`?tab=`) as canonical state (Recommended)
- b) Local state tabs only, no URL state

3) Placeholder nav behavior (`Runs`, `Alerts`, `Settings`)?
- a) Keep disabled placeholders visible (Recommended)
- b) Hide placeholders until functional

4) Validation mode for browser pass?
- a) Headless test-browser run + screenshots (Recommended)
- b) Headed test-browser run (watch mode)
