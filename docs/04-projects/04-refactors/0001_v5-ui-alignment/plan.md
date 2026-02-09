# Plan: Align `apps/web` UI With `docs/02-guidelines/v5-final`

## Goal
Make `apps/web` look as polished and professional as `docs/02-guidelines/v5-final/design-system.html`. Replace all hardcoded Tailwind defaults and bespoke styling with V5 semantic tokens, shared primitives, and consistent patterns. The result: warm cream canvas, Crimson Pro serif headings, restrained orange accents, dark mode ready.

## Non-goals (for this refactor)
- No functional changes to features (trust substrate, quick start engine, exports, eval harness, demo reliability, artefacts).
- No full component library migration (Radix/shadcn) unless explicitly chosen as a follow-up.
- No repo-wide token repackaging on day 1 (shared `packages/design-system/` can come later).

## Current State
- **PR 1 (wiring) is DONE**: `apps/web/app/globals.css` imports `./tokens.css`, `apps/web/tailwind.config.ts` consumes `./tailwind.preset.ts`. V5 semantic utilities are available.
- **Font loading is DONE**: `apps/web/app/head.tsx` loads Inter, Crimson Pro, JetBrains Mono via Google Fonts `<link>`.
- **Root layout is DONE**: `apps/web/app/layout.tsx` applies `bg-background font-sans text-foreground`.
- **Overlay highlight is DONE**: `apps/web/lib/overlayHighlight.ts` uses `--secondary` tokens.

## Key Constraints
- Minimize merge pain: land small, mechanical PRs. One concern per PR.
- Keep class-string edits only where possible to reduce conflict surface.
- No regressions: verification ladder after every PR.

## Architectural Decisions (lock before starting)

### 1. Token source strategy
Keep `apps/web/app/tokens.css` as an **unlayered** vendored copy of `docs/02-guidelines/v5-final/tokens.css` (avoids Next.js `@layer` build issues). Sync manually when docs tokens change.

### 2. Button "primary" variant
**Decision: Option B (flip now).** Make `variant="primary"` use `bg-primary text-primary-foreground` (orange) to match V5. The current `bg-foreground` behavior becomes a new `variant="neutral"`. This gives immediate V5 cohesion.

### 3. Font loading
Keep Google Fonts `<link>` approach (already working in `head.tsx`). Migrate to `next/font/google` later if needed for performance.

---

## Work Breakdown (PR-sized slices)

### PR 2: Token/Preset Parity
**Intent:** Bring vendored design pack to full V5 parity without changing UI.

**Files:**
- `apps/web/app/tokens.css`
- `apps/web/tailwind.preset.ts`

**Changes:**

`apps/web/app/tokens.css` — add shadow tokens:
```css
/* Light mode additions */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
--shadow-md: 0 4px 14px rgba(0,0,0,0.07);
--shadow-lg: 0 8px 28px rgba(0,0,0,0.10);

/* Dark mode additions */
--shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
--shadow-md: 0 4px 14px rgba(0,0,0,0.4);
--shadow-lg: 0 8px 28px rgba(0,0,0,0.5);
```

`apps/web/tailwind.preset.ts`:
- Tokenize shadows: `"ui-sm": "var(--shadow-sm)"`, `"ui-md": "var(--shadow-md)"`, `"ui-lg": "var(--shadow-lg)"`
- Add typography micro-size: `"2xs": ["0.6875rem", { lineHeight: "1rem" }]` (11px, replaces `text-[10px]`/`text-[11px]`)
- Optional: add `colors["border-strong"]` mapped to `--border-strong` if added to tokens

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck && pnpm --filter @orbital-poc/web build`

---

### PR 3: New Shared UI Primitives
**Intent:** Create reusable building blocks matching `design-system.html` recipes so route refactors become mechanical.

**New files:**
- `apps/web/app/ui/Alert.tsx`
- `apps/web/app/ui/Chip.tsx`
- `apps/web/app/ui/Table.tsx`
- `apps/web/app/ui/InlineStatus.tsx`

#### Alert (maps to `.alert alert-*`)
```tsx
type AlertVariant = "info" | "success" | "warning" | "destructive";

// Base classes:
"flex gap-3 items-start rounded-ui-md border p-4 text-sm"

// Variant classes:
info:         "bg-info/[0.06] border-info/20"
success:      "bg-success/[0.06] border-success/20"
warning:      "bg-warning/[0.06] border-warning/20"
destructive:  "bg-destructive/[0.06] border-destructive/20"

// Title: "font-semibold"
// Body:  "text-muted-foreground text-xs mt-1"
```

#### Chip (maps to `.chip`, `.chip-citation`)
```tsx
type ChipVariant = "filter" | "citation";
type ChipDot = "success" | "warning" | "destructive" | "muted";

// Base:
"inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1 text-sm font-medium transition-colors duration-micro ease-brand-standard hover:border-foreground/20"

// Active state:
"bg-primary/10 border-primary text-primary font-semibold"

// Citation variant:
"font-mono text-2xs px-2 py-0.5"

// Dot element:
"h-1.5 w-1.5 rounded-full" + bg-{success|warning|destructive|muted-foreground}
```

#### Table (maps to `.table-wrap` + `.table`)
```tsx
// TableFrame (wrapper):
"overflow-hidden rounded-ui-lg border border-border bg-card"

// Table element:
"min-w-full border-collapse text-sm"

// TH cells:
"px-3 py-2 bg-muted font-mono text-2xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border"

// TD cells:
"px-3 py-2.5 border-b border-border/60"

// Hover row:
"hover:bg-muted/50"
```

#### InlineStatus (standardized status messages + aria-live)
```tsx
type InlineStatusKind = "idle" | "loading" | "success" | "error" | "warning";

// Idle: renders nothing
// Loading: <div role="status" aria-live="polite"> text-muted-foreground text-xs
// Success: <div role="status" aria-live="polite"> text-success font-medium text-xs
// Error:   <div role="alert" aria-live="assertive"> text-destructive font-medium text-xs
// Warning: <div role="status" aria-live="polite"> text-warning font-medium text-xs
```

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: confirm no hydration errors, primitives render correctly

---

### PR 4: Button + Badge Upgrades
**Intent:** Align primitives with V5 button/badge recipes from `design-system.html`.

**Files:**
- `apps/web/app/ui/Button.tsx`
- `apps/web/app/ui/Badge.tsx`

#### Button changes
Extend `ButtonVariant`:
```
"primary" | "neutral" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link"
```

Class mapping:
```
primary:     bg-primary text-primary-foreground hover:bg-primary/90
neutral:     bg-foreground text-background hover:bg-foreground/90          (was "primary")
secondary:   border border-border bg-card text-foreground hover:bg-muted   (keep)
ghost:       bg-transparent text-foreground hover:bg-muted                 (keep)
destructive: bg-destructive text-destructive-foreground hover:bg-destructive/90
success:     bg-success text-success-foreground hover:bg-success/90
outline:     border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground
link:        bg-transparent p-0 h-auto text-foreground underline underline-offset-4 hover:text-primary
```

Add `size: "lg"` option: `h-11 px-5 text-base`

#### Badge changes
Add `variant: "primary"`: `bg-primary/10 text-primary ring-primary/20`
Add `size?: "sm" | "md"` (sm uses `text-2xs py-0 px-1.5`)

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: existing button usages still render (the old "primary" callers may need updating — see migration note)

**Migration note:** After this PR, grep for `variant="primary"` on Button. Calls that intend the "dark neutral" look should switch to `variant="neutral"`. Calls that intend the V5 orange CTA keep `variant="primary"`.

---

### PR 5: ExportMemoButton Refactor (worst offender)
**Intent:** Remove the most inconsistent styling in the app. Replace bespoke slate/red/emerald with primitives.

**Files:**
- `apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx`

**Hardcoded values to replace:**

| Current | Replacement |
|---------|-------------|
| `<button className="rounded bg-slate-900 ...">` | `<Button variant="outline" size="sm">` |
| `rounded border border-red-200 bg-red-50 p-3 text-xs text-red-900` | `<Alert variant="destructive" title="Export blocked">` |
| `text-red-800` | removed (Alert handles color) |
| `rounded border border-red-200 bg-white p-2` (unsafe section) | `<Card className="mt-3 p-3">` or nested Alert |
| `text-[10px] font-semibold uppercase ... text-red-700` | `<Badge variant="destructive">UNSAFE</Badge>` |
| `<input className="h-8 w-44 rounded border border-slate-300 bg-white px-2 font-mono text-xs text-slate-900">` | `<Input uiSize="sm" type="password" className="w-44 font-mono" />` |
| `rounded bg-red-700 px-3 py-2 text-xs font-semibold text-white` | `<Button variant="destructive" size="sm">` |
| `text-[11px] text-red-700` | `<InlineStatus kind="warning">` or body text in Alert |
| `text-xs text-slate-600` | `text-xs text-muted-foreground` |
| `text-xs font-medium text-red-700` | `<InlineStatus kind="error">` |
| `text-xs font-medium text-emerald-700` | `<InlineStatus kind="success">` |

**Accessibility:**
- Wrap blocked/error/success messages with `InlineStatus` (provides `aria-live`)
- Admin token input already has visible label; add `aria-label` for redundancy

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: navigate to matter with blocked export, confirm styling + screen reader announcement

---

### PR 6: Matter Detail `[id]/page.tsx` — Exports Section
**Intent:** Eliminate high-visibility hardcoded section.

**Files:**
- `apps/web/app/(app)/matters/[id]/page.tsx`

**Changes (line ~265):**

| Current | Replacement |
|---------|-------------|
| `rounded border border-slate-200 bg-white p-4` | `rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm` |
| `text-sm font-semibold text-slate-900` | `text-sm font-semibold text-foreground` |
| `text-xs text-slate-600` | `text-xs text-muted-foreground` |

All other sections on this page are already V5-tokenized.

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: `/matters/:id` Exports section matches adjacent card styling

---

### PR 7: Matters List Page — Badge/Chip Dedup
**Intent:** Reduce duplication in largest surface. Replace `statusClass()`/`matchStatusClass()` with `Badge`, replace bespoke citation chips with `Chip`.

**Files:**
- `apps/web/app/(app)/matters/page.tsx`

**Changes:**

1. Replace `statusClass()` / `matchStatusClass()` with mapping functions:
```tsx
function statusVariant(status: string): BadgeVariant {
  if (status === "reviewed") return "success";
  if (status === "needs_review") return "warning";
  if (status === "citation_failed") return "destructive";
  return "muted"; // missing_input, etc.
}

function matchStatusVariant(match: string): BadgeVariant {
  if (match === "matched") return "success";
  if (match === "ambiguous") return "warning";
  return "muted"; // missing_doc, missing_attachment
}
```

2. Replace inline badge divs:
```tsx
// Before:
<div className={`rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${statusClass(row.status)}`}>
  {row.status}
</div>

// After:
<Badge variant={statusVariant(row.status)}>{row.status}</Badge>
```

3. Replace `CitationChips` bespoke styling:
```tsx
// Before:
<a className="inline-flex items-center rounded-pill border border-border bg-card px-3 py-1 font-mono text-[11px] font-medium text-foreground transition-colors duration-micro ease-brand-standard hover:border-foreground/20" ...>

// After:
<Chip variant="citation" as="a" href={...}>{cid}</Chip>
```

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: `/matters` renders badges + chips consistently, focus rings visible on chips

---

### PR 8: ArtefactsList — Table Primitive + Badge Cleanup
**Intent:** Migrate bespoke table to shared `Table`, standardize pills.

**Files:**
- `apps/web/app/(app)/matters/ArtefactsList.tsx`

**Changes:**
- Replace local table wrapper with `<TableFrame>`, `<Table>`, etc.
- Replace header `font-medium` with `Table` TH recipe (mono, uppercase, 2xs)
- Replace `text-[10px]` UNSAFE pill with `<Badge variant="destructive">UNSAFE</Badge>`
- Replace download anchor with `<Button variant="secondary" size="sm" asChild><a href={...}>Download</a></Button>` or keep as styled anchor

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: `/matters` with `FEATURE_ARTEFACTS_LIST=1` — table looks correct

---

### PR 9: Export/QuickStart Feedback — InlineStatus
**Intent:** Consistent, accessible status messaging across all action buttons.

**Files:**
- `apps/web/app/(app)/matters/ExportCsvButton.tsx`
- `apps/web/app/(app)/matters/ExportTraceButton.tsx`
- `apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx`

**Changes:**
- Replace per-component status divs (`text-xs font-medium text-destructive/success`) with `<InlineStatus kind="error|success|loading">`
- This adds `aria-live` semantics automatically

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: trigger each action, confirm status text renders + is announced

---

### PR 10: Viewer Chrome Alignment
**Intent:** Ensure viewer matches V5 surfaces and controls.

**Files:**
- `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`

**Changes:**
- Replace any bespoke error panels with `<Alert variant="destructive">`
- Ensure select controls use `<Select uiSize="sm">` from `ui/Input`
- Verify overlay highlight uses `--secondary` tokens (already done in `overlayHighlight.ts`)
- Add `aria-hidden="true"` to decorative SVG overlay

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck`
- Manual: `/matters/viewer` — highlight is cyan, errors show as standard alerts

---

### PR 11: Typography + Theme Toggle (dark / light / system)
**Intent:** Full V5 feel with serif headings and a three-way theme toggle (dark / light / system).

**Files:**
- `apps/web/app/layout.tsx` (add `suppressHydrationWarning` to `<html>`, inject inline theme script)
- `apps/web/app/page.tsx` (home page heading style)
- `apps/web/app/ui/ThemeToggle.tsx` (new client component)
- `apps/web/app/ui/ThemeProvider.tsx` (new client component — context + logic)

**Changes:**

#### Theme system architecture
1. **Three modes:** `"light"` | `"dark"` | `"system"` (default: `"system"`)
2. **Persist in `localStorage`** key `"orbital-theme"`
3. **Inline script in `<head>`** to avoid FOUC:
   ```tsx
   // In layout.tsx, before </head> or via dangerouslySetInnerHTML on <script>:
   (function(){
     try {
       var t = localStorage.getItem("orbital-theme");
       var d = document.documentElement;
       if (t === "dark" || (!t && matchMedia("(prefers-color-scheme:dark)").matches)) {
         d.classList.add("dark");
       } else {
         d.classList.remove("dark");
       }
     } catch(e){}
   })()
   ```
4. **`<html>` needs `suppressHydrationWarning`** because the inline script may toggle `.dark` before React hydrates.

#### ThemeProvider (React context)
```tsx
"use client";
// Provides: { theme: "light" | "dark" | "system", setTheme: (t) => void, resolvedTheme: "light" | "dark" }
// On mount: read localStorage, listen for matchMedia changes when mode is "system"
// On setTheme: write localStorage, toggle .dark on <html>
```

#### ThemeToggle (UI component)
- **Three-way segmented control or cycling button** matching `design-system.html` `.theme-toggle` recipe
- Position: fixed top-right (like design-system.html) or in a toolbar/header
- Accessible: `<button aria-label="Switch to dark mode">` with icon (sun / moon / monitor)
- Classes: `fixed top-5 right-5 z-50 flex items-center gap-2 rounded-pill border border-border bg-card px-4 py-2 text-sm font-medium shadow-ui-sm transition-all duration-standard ease-brand-standard hover:border-foreground/20 hover:shadow-ui-md`
- Icons: inline SVG sun/moon/monitor (no icon library needed, matches design-system.html approach)

#### Typography polish
- Use `font-serif` for main `<h1>` elements where appropriate
- Use `text-heading-*` sizes from the preset for key headings

**Verification:**
- `pnpm --filter @orbital-poc/web build`
- Manual: check all routes in light, dark, and system mode
- Toggle persists across page refreshes
- No FOUC (flash of unstyled/wrong-theme content)
- System mode reacts to OS preference change
- Toggle is keyboard-accessible with focus ring

---

### PR 12: Final Sweep + AGENTS.md
**Intent:** Catch remaining hardcoded values, update documentation.

**Files:**
- Any remaining `apps/web/app/**` with hardcoded palette
- `apps/web/AGENTS.md` — update to match reality (Tailwind + V5 tokens + hand-rolled UI)
- `apps/web/app/DemoToolbar.tsx` — ensure token compliance

**Mechanical class mapping:**
```
bg-white           → bg-card
border-slate-200   → border-border
bg-slate-50/100    → bg-muted
text-slate-900     → text-foreground
text-slate-600/700 → text-muted-foreground
text-emerald-*     → text-success
text-red-*         → text-destructive
text-amber-*       → text-warning
```

**Verification:**
- `pnpm --filter @orbital-poc/web typecheck && pnpm --filter @orbital-poc/web build && pnpm --filter @orbital-poc/web test`
- Full manual smoke: `/`, `/matters`, `/matters/:id`, `/matters/viewer`

---

## Verification Ladder (for every PR)
1. `pnpm --filter @orbital-poc/web typecheck`
2. `pnpm --filter @orbital-poc/web test`
3. `pnpm --filter @orbital-poc/web build`
4. Manual smoke:
   - `/`
   - `/matters`
   - `/matters/:id` (with seeded data)
   - `/matters/viewer`
5. A11y quick pass:
   - Keyboard tab: focus rings visible on all interactive elements
   - No color-only status meaning (badges have text labels)
   - Status messages announced (aria-live on InlineStatus)
   - Errors readable without hover

## Contingencies
- If Button variant flip causes widespread breakage, revert to Option A (keep `primary` as `bg-foreground`, add `brand` variant for orange) and migrate incrementally.
- If `postcss-import` is needed later for layered tokens, add it then — keep unlayered copy for now.
- If external teams need shared tokens, create `packages/design-system/` after this refactor stabilizes.

## Available Skills for Implementation
Use these skills during development and review:
- `generating-tailwind-brand-config` — validate token/config alignment
- `baseline-ui`, `interface-design`, `frontend-design`, `web-design-guidelines` — UI quality gates
- `interaction-design`, `12-principles-of-animation`, `fixing-motion-performance` — motion polish
- `fixing-accessibility`, `wcag-audit-patterns` — a11y validation
- `tailwind-css-patterns`, `composition-patterns`, `react-best-practices` — patterns/structure
- `rams` — backup design critique
