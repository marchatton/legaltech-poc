# Web App Design Language (Brand DNA 2026-02-06)

This is the app-facing interpretation of the Brand DNA outputs in this folder.

Scope: authenticated/product UI (web app). Not marketing pages. Interactions should be simpler than the website: fewer “wow” moments, more clarity and speed.

## One-line direction

An engineered tool with editorial clarity: calm surfaces, sharp hierarchy, disciplined high-chroma accents, and fast tactile motion.

## Tokens (what they mean in the UI)

Source of truth: `design_tokens.json` (`composite_tokens`).

### Colour roles

- `background`: the default app canvas in light mode. Warm-neutral, not pure white.
- `text`: default text colour on `background`.
- `primary`: the “action” colour. Use for primary CTAs, key highlights, and “active” states.
- `secondary`: the “selection/highlight” colour. Use for subtle emphasis (chips, selection, hover backgrounds), not as a primary text colour.
- `accent`: the “spark” colour. Use sparingly for links, focus rings, and small moments of delight.

Practical rule: one screen should read as “neutral + one accent”. If you can see orange + cyan + purple all at once, you probably over-used accents.

### Typography roles

- Body: UI sans stack (Switzer/Inter) for readability and density.
- Headings: editorial serif stack (Signifier-ish) for hierarchy.
- Monospace: GeistMono/FT System Mono/Berkeley Mono for code-like UI, IDs, and technical data.

Use serif primarily for headings and long-form explanations. Keep forms/tables in sans.

### Spacing and layout

- Base spacing step: 4px.
- Prefer simple scales: 4/8/12/16/24/32/48/64.
- Layout rhythm: strong container widths, generous whitespace around the most important CTA and the most important number.

### Shape and elevation

- Default radius: small (6-10px) for most controls and surfaces.
- Allow pills (9999) for tags/chips and auth-style buttons.
- Elevation is “rare”: mostly flat surfaces, with a small set of shadows reserved for overlays (dropdowns, modals, toasts).

### Motion (keep it simple)

- Durations: 150ms (micro), 200ms (standard), 400ms (large transitions only).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` or `ease-in-out`.
- No bounce by default. Prefer subtle changes in colour, opacity, and small transforms (1-2px).

## Components (defaults for the web app)

### Buttons

- Primary button: filled `primary` background; text should be high contrast (usually white).
- Secondary button: neutral background (near `background`) with a subtle border/stroke; text in `text`.
- Tertiary button/link: text-only; use underline-on-hover, or `accent` on hover.

### Inputs and forms

- Keep inputs visually quiet: 1px border, small radius, clear focus ring.
- Focus rings should be visible and consistent; use `accent` rather than `primary` so CTAs remain dominant.
- Error states: use colour plus copy. Don’t rely on colour alone.

### Cards and lists

- Prefer flat cards with border over heavy shadows.
- Use spacing + type weight for hierarchy before colour.

### Tables and data density

- Default to compact density with clear row separators.
- Use monospace for IDs, timestamps, and code-like fields.

## Accessibility baseline (non-negotiable)

- Contrast: keep body text comfortably readable on both light and dark themes.
- Focus: always visible for keyboard users.
- Reduced motion: respect `prefers-reduced-motion` (motion becomes instant or minimal).

## How to use these files in the app

- `brand_guidelines.md`: the narrative “why” and the intended posture.
- `design_tokens.json`: the machine-readable “what” (tokens you can translate to CSS variables / Tailwind theme).
- `prompt_library.json`: prompts for generating new UI/copy that stays inside the same design language.

