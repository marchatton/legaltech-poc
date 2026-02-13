# Frontend Audit — Full Consolidated Report

**Date:** 2026-02-13
**Scope:** `apps/web/` — Accessibility, Visual Design, Interaction Design, Motion Performance, Component Architecture
**Skills used:** wcag-audit-patterns, fixing-accessibility, rams, baseline-ui, web-design-guidelines, interaction-design, fixing-motion-performance, composition-patterns

---

## CRITICAL (13 findings)

### Accessibility & Focus Management

| ID | Finding | File | Fix |
|----|---------|------|-----|
| C1 | **Modal: No focus trap** | `ui/Modal.tsx:106-127` | Add focus-trap logic, move focus to first focusable on open, restore on close, lock body scroll |
| C2 | **Row drawer: No focus trap** | `ReportTriagePanel.tsx:759-983` | Trap focus within drawer while open; auto-focus close button on open |
| C3 | **No skip-to-content link** | `layout.tsx` | Add `<a href="#main-content" class="sr-only focus:not-sr-only">` as first child of `<body>`, add `id="main-content"` to `<main>` |
| C5 | **ProgressBar: No ARIA semantics** | `ui/ProgressBar.tsx:3-24` | Add `role="progressbar"` with `aria-valuenow/min/max` and `aria-label` |

### Visual Design & Tokens

| ID | Finding | File | Fix |
|----|---------|------|-----|
| C4 | **No mobile navigation** | `ui/WorkspaceSidebar.tsx:104` | Add hamburger/drawer nav for < 1024px |
| C6 | **Hardcoded `text-white`/`bg-white` in operator checklist** | `[id]/page.tsx:573-583` | `text-white` → `text-success-foreground`; `bg-white` → `bg-background` |
| C7 | **Sidebar active state uses raw `cyan-*`** | `ui/WorkspaceSidebar.tsx:156-159` | Add `--sidebar-active` semantic token or use `primary`/`secondary` |
| C8 | **ExportsPanel uses non-existent `bg-secondary-100 text-secondary-700`** | `ExportsPanel.tsx:108,126,147,170` | Use `bg-secondary/10 text-secondary` |

### Interaction Design & Motion

| ID | Finding | File | Fix |
|----|---------|------|-----|
| I1 | **Modal: No exit animation** — content pops out in one frame | `ui/Modal.tsx:106-127` | Introduce `closing` state + `animate-fade-out` before unmounting, or use `<dialog>` with `[open]` transitions |
| I2 | **Row drawer: No enter/exit transition** — hard cut appearance | `ReportTriagePanel.tsx:758-759` | Slide-in via `translate-x-full` → `translate-x-0`; manage closing state for exit animation |
| I3 | **Toast: No auto-dismiss and no exit animation** | `ui/Toast.tsx:52-101` | Add `duration` prop (default ~5s) with auto-dismiss timer; exit animation before removal |
| P1 | **Theme transition on `<html>` causes full-page repaint** (400ms `background` + `color`) | `globals.css:17-18` | Remove the transition — CSS var swaps are effectively instant |

### Component Architecture

| ID | Finding | File | Fix |
|----|---------|------|-----|
| A1 | **ReportTriagePanel is a 988-line God Component** (table + drawer + viewer + citations + shortcuts + 10 useStates + 8 useEffects) | `ReportTriagePanel.tsx:1-988` | Extract into ReportTriageTable, RowDetailDrawer, EvidenceViewerSplit, CitationChipList + ReportTriageContext |
| A2 | **MatterPage is a 730-line monolith** mixing SQL, helpers, and JSX | `[id]/page.tsx:267-729` | Extract DB types/queries to `matterDetail.server.ts`, tab content to sub-components, helpers to `matterDetailHelpers.ts` |

---

## MAJOR (38 findings)

### Keyboard Navigation (Pass 1)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| M1 | Tabs: No arrow-key nav, no roving tabindex | `ui/Tabs.tsx:9-54` | Add `onKeyDown` for ArrowLeft/Right, `tabIndex={active ? 0 : -1}` |
| M2 | SegmentedControl: Same as M1 | `ui/SegmentedControl.tsx:33-102` | Same fix |
| M3 | DropdownMenu: No arrow-key nav between items | `ui/DropdownMenu.tsx:7-62` | Add ArrowUp/Down handler |
| M4 | Row trigger button invisible to keyboard | `ReportTriagePanel.tsx:736` | Add `focus-visible:opacity-100` |

### ARIA Semantics (Pass 1)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| M5 | Tabs: No `aria-controls`/`aria-labelledby` | `ui/Tabs.tsx:26-54` | Wire up `id` + `aria-controls`/`aria-labelledby` |
| M6 | CommandPalette: `role="option"` without `role="listbox"` parent | `ui/CommandPalette.tsx:60-100` | Add `role="listbox"` to container |
| M7 | CommandPalette: Missing `aria-modal` and `aria-label` | `ui/CommandPalette.tsx:9-21` | Add `aria-modal="true" aria-label="Command palette"` |
| M8 | Tooltip: No `aria-describedby` | `ui/Tooltip.tsx:29-78` | Add `id` + `aria-describedby` via `useId()` |
| M9 | ModalContent: Missing `aria-labelledby` | `ui/Modal.tsx:41-72` | Link via `id`/`aria-labelledby` |
| M10 | Toggle: `<label>` wrapping `<button>` — incorrect association | `ui/Toggle.tsx:14-44` | Replace `<label>` with `<div>`, use `aria-labelledby` |
| M11 | StatusDot without label invisible to SR | `ui/StatusDot.tsx:26-36` | Add `role="img" aria-label={status}` |
| M12 | Accordion chevron SVG missing `aria-hidden` | `ui/Accordion.tsx:33-44` | Add `aria-hidden="true"` |
| M13 | ToastStack: Missing `aria-live` region | `ui/Toast.tsx:105-112` | Add `aria-live="polite"` |
| M14 | ThemeToggle: Missing accessible label | `ui/ThemeToggle.tsx:52-77` | Add `aria-label`, `aria-haspopup`, `aria-expanded` |
| M15 | Sidebar expand button: `title` only, no `aria-label` | `ui/WorkspaceSidebar.tsx:212` | Add `aria-label="Expand sidebar"` |

### Color Contrast (Pass 1)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| M16 | `text-2xs` + `text-muted-foreground` = ~3.7:1 (needs 4.5:1) | Multiple files | Darken `--muted-foreground` from `122 117 110` to ~`95 90 84` |
| M17 | `text-warning` on light bg = ~3.1:1 | `tokens.css` | Darken `--warning` text variant |

### Typography & Token Drift (Pass 1)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| M18 | Raw `text-2xl`/`text-xl`/`text-lg` instead of heading tokens | `page.tsx:513`, `WorkspaceSidebar:120`, `ReportTriagePanel:800` | Use `text-heading-lg/md/sm` |
| M19 | `text-[17px]` arbitrary size | `ui/Card.tsx:37`, `ui/Avatar.tsx:16` | Use `text-heading-sm` or document as intentional |

### Missing Focus-Visible Rings (Pass 3a)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| I4 | Toast close button: no focus-visible ring | `Toast.tsx:88-98` | Add `focus-visible:ring-2 focus-visible:ring-ring` |
| I5 | SegmentedControl: no focus-visible ring | `SegmentedControl.tsx:48-53` | Add standard focus ring classes |
| I6 | Accordion summary: no focus-visible ring | `Accordion.tsx:31` | Add `focus-visible:ring-2 focus-visible:ring-ring` |
| I7 | Tab buttons: no focus-visible ring | `Tabs.tsx:26-47` | Add standard focus ring classes |
| I10 | Sidebar expand button: no focus-visible ring | `WorkspaceSidebar.tsx:211` | Add standard focus ring classes |
| I11 | Sign-out button: no focus-visible ring | `WorkspaceSidebar.tsx:234-238` | Add focus ring + `rounded-ui-md p-1` |
| I14 | CommandInput: no focus-visible ring | `CommandPalette.tsx:31` | Add `focus-visible:ring-2 focus-visible:ring-ring` |

### Missing Exit Animations (Pass 3b)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| P-M1 | Tooltip: enter animation but instant exit | `ui/Tooltip.tsx:60-66` | Manage `leaving` state + fade-out, or opacity toggle instead of unmount |
| P-M2 | DropdownMenu: enter-only animation | `ui/DropdownMenu.tsx:13` | Add exit animation |
| P-M3 | CommandPalette: enter-only animation | `ui/CommandPalette.tsx:15` | Add exit animation |
| P-M4 | Card transitions `background-color` on ALL variants (unnecessary repaint) | `ui/Card.tsx:15,23` | Move transition to `interactive` variant only |
| P-M5 | Infinite animations (Spinner, OrbitalLoader, shimmer) lack `will-change: transform` | Multiple | Add `will-change-transform` class |

### Motion Performance (Pass 3b)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| P2 | Drawer has no entry/exit animation — instant mount/unmount | `ReportTriagePanel.tsx:759` | Slide via `transform: translateX` with `duration-standard` |
| P3 | ProgressBar transitions `width` (layout trigger) | `ui/ProgressBar.tsx:18` | Use `transform: scaleX()` with `origin-left` instead |
| P-M7 | Table padding shifts 42-70rem with no transition | `ReportTriagePanel.tsx:676` | Transition padding or use `translateX` |

### Component Architecture (Pass 4)

| ID | Finding | File | Fix |
|----|---------|------|-----|
| A-M1 | **10 independent useStates for related drawer/viewer state** | `ReportTriagePanel.tsx:315-325` | Use `useReducer` with discriminated union actions |
| A-M2 | **6 useEffect hooks with overlapping Escape handlers** | `ReportTriagePanel.tsx:351-425` | Consolidate into `useKeyboardShortcuts` hook |
| A-M3 | **Tooltip stores setTimeout ID in useState** (unnecessary re-renders) | `ui/Tooltip.tsx:37-38` | Use `useRef` instead |
| A-M4 | **Chip `as` prop with unsafe type cast** | `ui/Chip.tsx:38-49` | Use discriminated union or separate ChipButton/ChipLink exports |
| A-M5 | **DropdownItem uses `<div>` with `role="menuitem"` instead of `<button>`** | `ui/DropdownMenu.tsx:23-62` | Change to `<button>` with `ButtonHTMLAttributes` |
| A-M6 | **WorkspaceSidebar localStorage hydration flash** | `ui/WorkspaceSidebar.tsx:79-99` | Use `useSyncExternalStore` with `getServerSnapshot` |
| A-M7 | **ExportsPanel: 4 near-identical export row blocks** | `ExportsPanel.tsx:105-186` | Extract `ExportRow` component |
| A-M8 | **Filter chip pattern duplicated across 2 pages** | `matters/page.tsx:136-155`, `[id]/page.tsx:630-659` | Use `SegmentedControl` with `href` mode |
| A-M9 | **Tabs: No shared state or context for keyboard nav** | `ui/Tabs.tsx:20-48` | Add `TabsProvider` context with `activeIndex` and `id` generation |

---

## MINOR (52 findings)

### Responsive/Mobile (Pass 2)
- m1. Report triage table `min-w-[640px]` needs card fallback on mobile (`ReportTriagePanel.tsx:680`)
- m2. Matters list table: no responsive card alternative (`matters/page.tsx:177-240`)
- m3. Chat send button 38px — below 44px touch target (`ChatPanel.tsx:443`)
- m4. DemoToolbar fixed 48px height wraps/clips on narrow screens (`DemoToolbar.tsx:71`)
- m5. Row drawer lacks mobile close affordance / swipe-to-dismiss (`ReportTriagePanel.tsx:783`)
- m6. Chat panel no max-height constraint (`ChatPanel.tsx:308`)

### Token Compliance (Pass 2)
- m7. `shadow-sm` instead of `shadow-ui-sm` on filter pill (`matters/page.tsx:148`)
- m8. `rounded-md`/`rounded-2xl` instead of `rounded-ui-md`/`rounded-ui-2xl` in ChatPanel
- m9. `text-[15px]` in UploadZone — literally `text-base` (`ui/UploadZone.tsx:32`)
- m10. `bg-white` on Toggle thumb — use `bg-card` (`ui/Toggle.tsx:34`)
- m11. `bg-black/25` on Modal overlay — consider `bg-foreground/15` (`ui/Modal.tsx:18`)
- m12. `size-[38px]` arbitrary — use `size-9` or `size-10` (`ChatPanel.tsx:446`)
- m13. Logo ring `ring-purple-200` hardcoded (`WorkspaceSidebar.tsx:116`)

### Consistency & DRY (Pass 2)
- m14. Filter pill duplicated across 2 pages — extract `FilterPill` component
- m15. Operator checklist hand-drawn instead of using `Steps` primitive (`[id]/page.tsx:558-598`)
- m16. Inconsistent card/section wrapping across detail tabs
- m17. Chat send button bypasses `Button` component (`ChatPanel.tsx:443`)
- m18. Chat warning banner bypasses `Alert` component (`ChatPanel.tsx:431`)
- m19. Inconsistent overlay styles — Modal `bg-black/25 blur-[4px]` vs drawer `bg-background/45 blur-[1px]`
- m20. Heading weight drift — `font-semibold` in detail page vs `font-normal` in Page primitive
- m21. Responsive padding breakpoint mismatch — `lg:px-8` vs `sm:px-8`

### Other A11y (Pass 2)
- m22. `html` lacks `dir="ltr"` (`layout.tsx:36`)
- m23. UploadZone: no `role="button"`, `tabIndex`, or keyboard handler
- m24. Steps: no `aria-current="step"` or state announcements
- m25. Pagination disabled state uses `<span>` not `<button disabled>` (`matters/page.tsx:263`)
- m26. Skeleton shimmer doesn't fully respect `prefers-reduced-motion`
- m27. Tooltip not portalled — clipped by `overflow:hidden` ancestors

### Interaction Polish (Pass 3a)
- I15. Interactive Card has no active/pressed state (unlike Button)
- I16. Toggle: knob `duration-standard` vs track `duration-micro` timing mismatch
- I17. Checkbox/Radio: no `hover:border-foreground/40` affordance
- I18. UploadZone: no focus-visible ring, needs `tabIndex={0}`
- I19. SearchInput icon color doesn't change on focus
- I20. ProgressBar: no `will-change-[width]` hint for frequent updates
- I21. StatusDot: no pulse animation for active/warning states
- I22. `html` theme transition 400ms too long — consider 200ms or remove `color`
- I23. Filter pills: no `active:*` press state on inactive variant
- I24. Disabled pagination uses `<span>` with `opacity-50` — should be `<button disabled>` with `cursor-not-allowed`
- I25. DemoToolbar error message: no enter animation or auto-dismiss
- I26. ThemeToggle dropdown: no exit animation
- I27. Skeleton: `aria-hidden` without `="true"`, lacks `role="presentation"`
- I28. Steps dots: no transition on state change
- I29. Export buttons: no visual success acknowledgment after download

### Motion Polish (Pass 3b)
- P-m1. SegmentedControl uses `transition-all` — scope to `transition-[background-color,color,box-shadow]`
- P-m2. `animate-fade-in` lacks `both` fill mode (inconsistent with `animate-fade-in-up`)
- P-m3. Accordion content has no height transition — instant appear/disappear
- P-m4. PulseLoader dots flash at full scale before animation-delay expires
- P-m5. OrbitalLoader rings need `will-change-transform` for compositor layer promotion

### Architecture Polish (Pass 4)
- Toggle/Checkbox/Radio: inconsistent label association patterns
- Select exported from `Input.tsx` — violates one-component-per-file convention
- Toast and Alert duplicate near-identical icon resolver functions
- StatCard: hardcoded hover effect with no `interactive` prop opt-out
- Steps: `key={step.label}` — duplicate labels cause key collisions
- ChatPanel send button: raw `<button>` instead of `Button` primitive
- ChatPanel: `&hellip;` entity renders as literal string in JSX
- DemoToolbar: hardcoded `text-orange-600 dark:text-orange-300` bypasses tokens
- ExportCsvButton/ExportMemoButton: duplicate `isRecord()`, `LoadState`, and fetch logic — extract `useExportAction` hook
- ThemeToggle: manual outside-click + Escape handlers — extract `useClickOutside` / `useEscapeKey` hooks
- Breadcrumb: raw `<a>` instead of Next.js `<Link>` (full page loads)
- WorkspaceSidebar nav items: 3 levels of conditional nesting — extract `SidebarNavItem`

---

## Summary

| Severity | Pass 1-2 | Pass 3a | Pass 3b | Pass 4 | Total |
|----------|----------|---------|---------|--------|-------|
| Critical | 8 | 3 | 1 | 2 | **14** |
| Major | 19 | 11 | 8 | 9 | **38** (deduplicated) |
| Minor | 27 | 15 | 5 | 14 | **52** (deduplicated) |
| **Total** | | | | | **104** |

*Note: Some findings overlap across passes (e.g., Modal exit animation appears in both interaction-design and motion-performance). Counts above are deduplicated.*

---

## Top 10 Highest-Impact Actions (bang for buck)

1. **Decompose ReportTriagePanel** (A1) — Single biggest maintainability win. Unblocks all other fixes to the drawer/viewer.
2. **Focus traps for Modal + Drawer** (C1, C2) — Unblocks keyboard/SR users from core workflows.
3. **Exit animations for overlays** (I1, I2, I3, P-M1–M3) — Modal, drawer, toast, tooltip, dropdown, command palette all enter-only. Fixing the pattern once (shared `useAnimatedPresence` hook) fixes 6 components.
4. **Mobile navigation** (C4) — Currently 0% mobile usability.
5. **Contrast token fix** (M16, M17) — Single CSS var change fixes contrast across entire app.
6. **Focus-visible rings** (I4–I7, I10, I11, I14) — 7 interactive elements with no keyboard focus indicator. Batch fix with a shared ring class.
7. **Arrow-key keyboard patterns** (M1–M3, A-M9) — Tabs, SegmentedControl, Dropdown need roving tabindex. Fix Tabs with context, others follow.
8. **ProgressBar ARIA + scaleX** (C5, P3) — Accessibility + performance in one pass.
9. **Extract shared hooks** (A-M1, A-M2, export buttons) — `useReducer` for drawer state, `useExportAction` for export buttons, `useKeyboardShortcuts` for Escape handlers.
10. **Token cleanup** (C6, C7, C8, m7–m13) — Hardcoded colors and non-existent token references. Batch search-and-replace.

---

## Recommended Fix Order

### Phase 1: Foundation (enables everything else)
- [ ] A1: Decompose ReportTriagePanel
- [ ] A2: Decompose MatterPage
- [ ] P1: Remove html theme transition

### Phase 2: Accessibility Critical
- [ ] C1+C2: Focus traps (Modal + Drawer)
- [ ] C3: Skip-to-content link
- [ ] C5: ProgressBar ARIA
- [ ] M16+M17: Contrast token fixes

### Phase 3: Interaction Quality
- [ ] Exit animations (shared `useAnimatedPresence` hook → Modal, Toast, Tooltip, Dropdown, CommandPalette, ThemeToggle)
- [ ] I2+P2: Drawer slide-in/out animation
- [ ] Focus-visible rings (batch)
- [ ] Arrow-key keyboard patterns (Tabs context → SegmentedControl → Dropdown)

### Phase 4: Visual & Token Cleanup
- [ ] C4: Mobile navigation
- [ ] C6–C8: Token drift fixes
- [ ] m7–m13: Minor token compliance
- [ ] P3: ProgressBar scaleX

### Phase 5: Architecture Polish
- [ ] A-M1: useReducer for drawer state
- [ ] A-M7+A-M8: Extract ExportRow, use SegmentedControl for filter pills
- [ ] Shared hooks: useExportAction, useClickOutside, useEscapeKey
- [ ] Minor component fixes (Toggle label, Select file, Breadcrumb Link, etc.)
