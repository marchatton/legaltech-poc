# Frontend Audit — Pass 1 & 2 Consolidated Report

**Date:** 2026-02-13
**Scope:** Accessibility (WCAG 2.2) + Visual Design (Rams, Baseline UI, Web Guidelines)
**Codebase:** `apps/web/` — Next.js App Router, V5 design system

---

## CRITICAL (8 unique findings)

### C1. Modal: No focus trap
**Files:** `ui/Modal.tsx:106-127`
**Sources:** WCAG, Fixing-A11y, Web Guidelines
**Issue:** Modal has `aria-modal="true"` but no focus trap. Tab escapes to background content. No initial focus management or body scroll lock.
**Fix:** Add focus-trap logic (manual or `focus-trap-react`), move focus to first focusable on open, restore on close, lock body scroll.

### C2. Row drawer: No focus trap
**File:** `matters/[id]/ReportTriagePanel.tsx:759-983`
**Sources:** WCAG, Fixing-A11y
**Issue:** Drawer has `role="dialog" aria-modal="true"` but no focus trap. Focus return on close exists, but focus-on-open and trapping are missing.
**Fix:** Trap focus within drawer while open. Auto-focus close button on open.

### C3. No skip-to-content link
**File:** `layout.tsx`
**Sources:** Fixing-A11y
**Issue:** WCAG 2.4.1 failure. Keyboard users must tab through topbar + sidebar on every page.
**Fix:** Add `<a href="#main-content" className="sr-only focus:not-sr-only ...">Skip to main content</a>` as first child of `<body>`. Add `id="main-content"` to `<main>`.

### C4. No mobile navigation
**File:** `ui/WorkspaceSidebar.tsx:104`
**Sources:** Web Guidelines
**Issue:** Sidebar is `hidden lg:flex` — completely gone below 1024px. No hamburger, drawer, or bottom tabs. App is unusable on mobile/tablet.
**Fix:** Add mobile nav pattern (slide-out drawer triggered by hamburger in topbar).

### C5. ProgressBar: No ARIA semantics
**File:** `ui/ProgressBar.tsx:3-24`
**Sources:** WCAG, Fixing-A11y
**Issue:** Pure `<div>` with no `role="progressbar"`, `aria-valuenow/min/max`, or `aria-label`. Invisible to screen readers.
**Fix:** Add `role="progressbar"` with proper ARIA attributes on the outer div.

### C6. Hardcoded `text-white`/`bg-white` in operator checklist
**File:** `matters/[id]/page.tsx:573-583`
**Sources:** Baseline UI
**Issue:** `text-white` and `bg-white` bypass tokens. `bg-white` renders jarring bright dot in dark mode.
**Fix:** `text-white` → `text-success-foreground`/`text-warning-foreground`. `bg-white` → `bg-background`.

### C7. Sidebar active state uses raw `cyan-*` outside token system
**File:** `ui/WorkspaceSidebar.tsx:156-159`
**Sources:** Rams, Web Guidelines
**Issue:** `cyan-50/500/800` hardcoded — only nav element using a completely different color language from the rest of the app. Won't adapt to theme changes.
**Fix:** Add `--sidebar-active`/`--sidebar-active-foreground` semantic tokens, or align to existing `primary`/`secondary`.

### C8. ExportsPanel uses non-existent `bg-secondary-100 text-secondary-700`
**File:** `matters/[id]/ExportsPanel.tsx:108,126,147,170`
**Sources:** Rams, Baseline UI
**Issue:** `secondary-100/700` not in preset (only `secondary.DEFAULT`/`.foreground`). Likely resolves to nothing or wrong color. Breaks in dark mode.
**Fix:** Use `bg-secondary/10 text-secondary` or `bg-cyan-100 text-cyan-700` (explicit scale).

---

## MAJOR (19 unique findings)

### Keyboard Navigation

| # | Finding | File | Fix |
|---|---------|------|-----|
| M1 | Tabs: No arrow-key nav, no roving tabindex | `ui/Tabs.tsx:9-54` | Add `onKeyDown` for ArrowLeft/Right, `tabIndex={active ? 0 : -1}` |
| M2 | SegmentedControl: Same as M1 | `ui/SegmentedControl.tsx:33-102` | Same fix |
| M3 | DropdownMenu: No arrow-key nav between items | `ui/DropdownMenu.tsx:7-62` | Add ArrowUp/Down handler, or switch to `role="listbox"` |
| M4 | Row trigger button invisible to keyboard users | `ReportTriagePanel.tsx:736` | Add `focus-visible:opacity-100` |

### ARIA Semantics

| # | Finding | File | Fix |
|---|---------|------|-----|
| M5 | Tabs: No `aria-controls`/`aria-labelledby` linking Tab↔TabPanel | `ui/Tabs.tsx:26-54` | Wire up `id` + `aria-controls`/`aria-labelledby` |
| M6 | CommandPalette: `role="option"` without `role="listbox"` parent | `ui/CommandPalette.tsx:60-100` | Add `role="listbox"` to group/container |
| M7 | CommandPalette: Missing `aria-modal` and `aria-label` | `ui/CommandPalette.tsx:9-21` | Add `aria-modal="true" aria-label="Command palette"` |
| M8 | Tooltip: No `aria-describedby`, not keyboard-accessible on non-focusable children | `ui/Tooltip.tsx:29-78` | Add `id` + `aria-describedby`, use `useId()` |
| M9 | ModalContent: Missing `aria-labelledby` to ModalTitle | `ui/Modal.tsx:41-72` | Link via `id`/`aria-labelledby` (or context + `useId`) |
| M10 | Toggle: `<label>` wrapping `<button>` — incorrect association | `ui/Toggle.tsx:14-44` | Replace `<label>` wrapper with `<div>`, use `aria-labelledby` |
| M11 | StatusDot without label: Invisible to screen readers | `ui/StatusDot.tsx:26-36` | Add `role="img" aria-label={status}` when no label |
| M12 | Accordion chevron SVG: Missing `aria-hidden` | `ui/Accordion.tsx:33-44` | Add `aria-hidden="true"` |
| M13 | ToastStack: Missing `aria-live` region | `ui/Toast.tsx:105-112` | Add `aria-live="polite" aria-relevant="additions"` |
| M14 | ThemeToggle: Missing accessible label | `ui/ThemeToggle.tsx:52-77` | Add `aria-label`, `aria-haspopup`, `aria-expanded` |
| M15 | Expand sidebar button: `title` only, no `aria-label` | `ui/WorkspaceSidebar.tsx:212` | Add `aria-label="Expand sidebar"` |

### Color Contrast

| # | Finding | File | Fix |
|---|---------|------|-----|
| M16 | `text-2xs` + `text-muted-foreground` = ~3.7:1 (needs 4.5:1) | Multiple files | Darken `--muted-foreground` from `122 117 110` to ~`95 90 84` |
| M17 | `text-warning` on light bg = ~3.1:1 | `tokens.css` | Darken `--warning` text variant to ~`160 110 8` |

### Typography & Token Drift

| # | Finding | File | Fix |
|---|---------|------|-----|
| M18 | Raw `text-2xl`/`text-xl`/`text-lg` instead of heading tokens | `page.tsx:513`, `WorkspaceSidebar:120`, `ReportTriagePanel:800` | Use `text-heading-lg`/`text-heading-md`/`text-heading-sm` |
| M19 | `text-[17px]` arbitrary size in CardTitle + Avatar | `ui/Card.tsx:37`, `ui/Avatar.tsx:16` | Use `text-heading-sm` or document as intentional escape |

---

## MINOR (21 unique findings, grouped)

### Responsive/Mobile
- **m1.** Report triage table `min-w-[640px]` — needs card fallback on mobile (`ReportTriagePanel.tsx:680`)
- **m2.** Matters list table — no responsive card alternative (`matters/page.tsx:177-240`)
- **m3.** Chat send button 38px — below 44px touch target (`ChatPanel.tsx:443`)
- **m4.** DemoToolbar fixed 48px height wraps/clips on narrow screens (`DemoToolbar.tsx:71`)
- **m5.** Row drawer lacks mobile close affordance / swipe-to-dismiss (`ReportTriagePanel.tsx:783`)
- **m6.** Chat panel no max-height constraint — may push input off-screen (`ChatPanel.tsx:308`)

### Token Compliance
- **m7.** `shadow-sm` instead of `shadow-ui-sm` on filter pill (`matters/page.tsx:148`)
- **m8.** `rounded-md`/`rounded-2xl` instead of `rounded-ui-md`/`rounded-ui-2xl` in ChatPanel (`ChatPanel.tsx:294,325`)
- **m9.** `text-[15px]` in UploadZone — literally `text-base` (`ui/UploadZone.tsx:32`)
- **m10.** `bg-white` on Toggle thumb — use `bg-card` (`ui/Toggle.tsx:34`)
- **m11.** `bg-black/25` on Modal overlay — consider `bg-foreground/15` (`ui/Modal.tsx:18`)
- **m12.** `size-[38px]` arbitrary — use `size-9` or `size-10` (`ChatPanel.tsx:446`)
- **m13.** Logo ring `ring-purple-200` hardcoded (`WorkspaceSidebar.tsx:116`)

### Consistency & DRY
- **m14.** Filter pill duplicated across 2 pages — extract `FilterPill` component (`matters/page.tsx:146`, `[id]/page.tsx:642`)
- **m15.** Operator checklist hand-drawn instead of using `Steps` primitive (`[id]/page.tsx:558-598`)
- **m16.** Inconsistent card/section wrapping across detail tabs (`[id]/page.tsx:556-725`)
- **m17.** Chat send button bypasses `Button` component (`ChatPanel.tsx:443`)
- **m18.** Chat warning banner bypasses `Alert` component (`ChatPanel.tsx:431`)
- **m19.** Inconsistent overlay styles — Modal `bg-black/25 blur-[4px]` vs drawer `bg-background/45 blur-[1px]` (`Modal.tsx:18`, `ReportTriagePanel.tsx:755`)
- **m20.** Heading weight drift — `font-semibold` in detail page vs `font-normal` in Page primitive (`[id]/page.tsx:513`)
- **m21.** Responsive padding breakpoint mismatch — `lg:px-8` vs `sm:px-8` between pages

### Other A11y
- **m22.** `html` lacks `dir="ltr"` (`layout.tsx:36`)
- **m23.** UploadZone: no `role="button"`, `tabIndex`, or keyboard handler (`ui/UploadZone.tsx:14-41`)
- **m24.** Steps component: no `aria-current="step"` or state announcements (`ui/Steps.tsx:16-66`)
- **m25.** Pagination disabled state uses `<span>` not `<button disabled>` (`matters/page.tsx:263`)
- **m26.** Skeleton shimmer doesn't fully respect `prefers-reduced-motion` (should be flat `bg-muted`)
- **m27.** Tooltip not portalled — clipped by `overflow:hidden` ancestors (`ui/Tooltip.tsx`)

---

## Summary

| Severity | Count |
|----------|-------|
| Critical | 8 |
| Major | 19 |
| Minor | 27 |
| **Total** | **54** |

### Top 5 highest-impact actions (bang for buck)

1. **Focus traps** (C1, C2) — Fix Modal + drawer. Unblocks keyboard/SR users from core workflows.
2. **Mobile navigation** (C4) — Add hamburger/drawer nav. Currently 0% mobile usability.
3. **Contrast tokens** (M16, M17) — Single CSS var change fixes contrast across entire app.
4. **Keyboard patterns** (M1-M3) — Arrow nav for Tabs/SegmentedControl/Dropdown. Standard ARIA patterns.
5. **Extract FilterPill + use primitives** (m14, m15, m17, m18) — Reduces ~20% ad-hoc code, ensures consistency.

---

## Next: Pass 3 & 4

- **Pass 3:** `interaction-design` + `fixing-motion-performance` (microinteractions, animation quality)
- **Pass 4:** `composition-patterns` (React component architecture)
