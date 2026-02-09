# Plan: Align `apps/web` UI With `docs/02-guidelines/v5-final`

## Goal
Make `apps/web` consistently use the v5-final design system (tokens + Tailwind preset + typography) so UI work is semantic and cohesive (not Tailwind-default + hard-coded styling).

## Non-goals (for this refactor)
- No functional changes to the already-implemented feature set (trust substrate, quick start engine, exports, eval harness, demo reliability, artefacts foundation).
- No full component library migration (Radix/shadcn) unless explicitly chosen as a follow-up.
- No repo-wide token repackaging on day 1 (we can do a shared package later).

## Key Constraints
- Other machines may have pending local/branch changes, likely touching the same high-churn UI files.
- We want to minimize merge pain by landing small, low-conflict PRs first and deferring high-churn file rewrites.

## Decisions To Make Up Front (fast)
1. Source of truth for the app integration:
   - Default recommendation: vendor v5 pack into `apps/web` to avoid Next “external dir” import constraints.
2. Font loading approach:
   - Fastest: add Google Fonts `<link>`s in `apps/web/app/layout.tsx` to match v5 reference HTML.
   - Most “Next-idiomatic”: `next/font/google` plus a small adjustment to how `fontFamily` is defined (either patch preset or override).
3. Scope sequencing:
   - Land “wiring” first, then migrate one page/component at a time.

## Coordination Plan (anticipate pending changes on other machines)
1. Identify conflict hotspots and announce a short freeze window for them:
   - `apps/web/tailwind.config.ts`
   - `apps/web/app/globals.css`
   - `apps/web/app/layout.tsx`
2. Ask anyone with local/unpushed changes that touch those files to:
   - Commit them to a branch or share diffs.
   - Rebase after the “wiring PR” lands.
3. Keep all UI refactor PRs:
   - Small and mechanical (class string swaps; avoid unrelated formatting).
   - One concern per PR.
   - With clear “rebase notes” in the PR description.
4. For files likely being edited elsewhere (especially `apps/web/app/(app)/matters/page.tsx`):
   - Defer large styling sweeps until after feature work merges.
   - Prefer isolated changes first (export button, viewer overlay highlight) that touch fewer lines.

## Work Breakdown (PR-sized slices)

### PR 1: Add v5 Design Pack + Tailwind Wiring (lowest conflict, minimal visible change)
**Intent:** enable v5 semantics without forcing a full visual flip immediately.

Files to add:
- `apps/web/app/tokens.css` (copy from `docs/02-guidelines/v5-final/tokens.css`)
- `apps/web/tailwind.preset.ts` (copy from `docs/02-guidelines/v5-final/tailwind.preset.ts`)

Files to edit:
- `apps/web/tailwind.config.ts`
  - Add `presets: [preset]`
  - Keep `content` as-is
- `apps/web/app/globals.css`
  - Add `@import "./tokens.css";` above Tailwind directives
  - Temporarily keep the existing `body { background/color }` override if we want to avoid an immediate canvas flip for other in-flight branches.

Implementation note (Next.js + Tailwind):
- If `tokens.css` contains Tailwind `@layer` rules, Next can fail builds unless imports are inlined via `postcss-import`.
- Lowest-risk approach is to keep the app’s vendored `apps/web/app/tokens.css` unlayered (no `@layer base` wrapper), or to inline tokens directly into `globals.css`.

Optional (recommended for confidence without UI churn):
- Add a small “v5 smoke” route under `apps/web/app/spikes/v5-ui/page.tsx` that uses `bg-background`, `text-foreground`, `rounded-ui-lg`, `shadow-ui-md`, `font-serif`.

Verification:
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web build`
- `pnpm --filter @orbital-poc/web test`
- Manual: open `/spikes/v5-ui` and confirm semantic classes render.

Merge notes:
- Land this PR ASAP. It becomes the base that other branches rebase onto.

### PR 2: Global Typography + Base Semantic Root (small but user-visible)
**Intent:** make the app “feel v5” with minimal page edits.

Files to edit:
- `apps/web/app/layout.tsx`
  - Load fonts (either Google Fonts `<link>`s matching v5 reference, or `next/font/google` approach).
  - Apply root classes:
    - `html`: `bg-background text-foreground`
    - `body`: `min-h-dvh font-sans antialiased`
- `apps/web/app/globals.css`
  - Remove hard-coded `body` background/text so v5 tokens drive the canvas.

Verification:
- Run dev server and check `/` and `/matters` for obvious contrast regressions.
- Keyboard tab through links/buttons and ensure focus is visible.

Coordination note:
- This PR will cause the largest “global diff” visually. Land it when other machines are least likely to be actively styling pages.

### PR 3: Viewer Overlay Alignment (low conflict, high perceived polish)
**Intent:** remove the “random blue” and align highlight to v5 secondary token.

Files to edit:
- `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
  - Replace hard-coded highlight `fill/stroke` with semantic token-based values:
    - `fill="rgb(var(--secondary) / 0.35)"`
    - `stroke="rgb(var(--secondary) / 0.7)"`
  - Migrate viewer surfaces from `bg-white/border-slate-*` to `bg-card/border-border` where it’s low risk.

Verification:
- Open `/matters/viewer` and confirm overlay renders and remains readable on both light and dark (if dark is toggled).

### PR 4: Export Button + Feedback Colors (isolated component)
**Intent:** make export controls match v5 component hierarchy and a11y focus rules.

Files to edit:
- `apps/web/app/(app)/matters/ExportCsvButton.tsx`
  - Update button classes to a v5 outline or secondary style.
  - Add focus-visible ring (`ring-ring` + `ring-offset-background`) pattern.
  - Replace `text-red-*`/`text-emerald-*` with `text-destructive`/`text-success`.

Verification:
- Click export; confirm loading state, error state, success state.

### PR 5: Matters Page Semantic Migration (highest churn; schedule carefully)
**Intent:** convert the largest surface to semantic tokens so future work stays aligned.

Files to edit:
- `apps/web/app/(app)/matters/page.tsx`
  - Convert surfaces:
    - `bg-white` -> `bg-card`
    - `border-slate-200` -> `border-border`
    - `bg-slate-50` -> `bg-muted`
  - Convert text:
    - `text-slate-900` -> `text-foreground`
    - `text-slate-600/700` -> `text-muted-foreground`
  - Convert badges:
    - `statusClass()` and `matchStatusClass()` to semantic:
      - reviewed/matched -> success
      - needs_review/ambiguous -> warning
      - citation_failed -> destructive
      - missing_* -> muted
  - Convert chips from black-filled to a v5-informed style (primary or secondary).

Merge conflict mitigation:
- Do this after other functional work that touches the same file is merged.
- Keep edits strictly to class strings and helper functions where possible.

Verification:
- Spot check all major sections (exceptions table, missing docs checklist, review buttons).
- Ensure focus rings show on interactive elements.

### PR 6 (optional): Resolve `apps/web/AGENTS.md` Drift
Two valid outcomes:
1) Update `apps/web/AGENTS.md` to match reality (Tailwind + v5 tokens/preset, hand-rolled components).
2) Adopt the claimed stack (Radix/shadcn/lucide/RHF) and make the doc true.

Recommendation for minimizing churn:
- Do (1) now, and consider (2) later as a separate project once the visual system is stable.

## Verification Ladder (for each PR)
1. `pnpm --filter @orbital-poc/web typecheck`
2. `pnpm --filter @orbital-poc/web test`
3. `pnpm --filter @orbital-poc/web build`
4. Manual smoke:
   - `/`
   - `/matters`
   - `/matters/viewer`
5. A11y quick pass:
   - Keyboard tab focus visible
   - No color-only status meaning
   - Errors are readable and do not require hover

## Contingencies
- If PR 1 introduces build issues (Tailwind preset import path, TS module resolution), revert to a “local preset” approach in `apps/web/tailwind.config.ts` first, then reintroduce preset file wiring.
- If external teams insist on single-source-of-truth tokens, create `packages/design-system/` later and migrate `apps/web` to import from that package, then regenerate/adjust docs accordingly.
