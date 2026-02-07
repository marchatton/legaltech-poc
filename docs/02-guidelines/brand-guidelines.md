# Brand Guidelines (Distilled)

These are the human-readable brand guidelines for this repo (web app + docs where relevant).

They are distilled from the generated Brand DNA outputs in:
- `docs/02-guidelines/inspiration/brand_guidelines.md` (current run: `brand-dna-2026-02-06`)
- `docs/02-guidelines/inspiration/design_tokens.json`
- `docs/02-guidelines/inspiration/prompt_library.json`

Archived run snapshots live under `docs/02-guidelines/inspiration/brand-dna-YYYY-MM-DD/`.

## One-line direction
An engineered tool with editorial clarity: calm surfaces, sharp hierarchy, disciplined high-chroma accents, and fast tactile motion.

## Visual stance (defaults)
- High contrast hierarchy; typography does most of the work.
- Flat surfaces by default; elevation is rare and purposeful.
- Compact-but-readable density (especially tables).
- One-screen rule: “neutral + one accent”. If you can see orange + cyan + purple all at once, you probably over-used accents.

## Colour roles (reference)
Source of truth for exact tokens: `docs/02-guidelines/inspiration/design_tokens.json`.

Role mapping used across docs and UI:
- **Primary (action):** `#FB631B` (primary CTAs, active states)
- **Secondary (selection/highlight):** `#C0F0FB` (chips, selection, subtle emphasis backgrounds; not primary text)
- **Accent (spark):** `#D8ACFF` (focus rings, links, occasional delight; use sparingly)

Suggested canvases:
- Light: background `#DFDFC1`, text `#0B0D0B`
- Dark: background `#07080A`, text `#FFFFFF`

## Typography roles
- Body: clean UI sans (Switzer/Inter-like stack).
- Headings: editorial serif (Signifier-like) for hierarchy and long-form explainers.
- Monospace: GeistMono/FT System Mono/Berkeley Mono for IDs, code-like UI, timestamps.

Rule of thumb:
- Tables/forms: sans.
- Headings/long explanation: serif is allowed.

## Spacing, layout, and shape
- Base spacing step: 4px (4/8/12/16/24/32/48/64).
- Default radius: small (6-10px); pills are allowed for chips/tags.
- Borders > shadows for most components.

## Motion posture
- Durations: 150ms (micro), 200ms (standard), 400ms (large transitions only).
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)` or `ease-in-out`.
- No bounce by default; prefer subtle opacity/colour shifts and 1-2px transforms.

## Component guidance (app UI)
Buttons:
- Primary: filled primary; high-contrast text.
- Secondary: neutral surface with subtle border.
- Tertiary: text-only; underline-on-hover allowed.

Inputs and forms:
- Quiet styling; clear focus ring (prefer accent over primary).
- Error states: colour + copy (never colour-only).

Tables and “trust surfaces”:
- Compact density with clear row separators.
- Ensure citations and evidence are visually scannable (chips, consistent placement).
- Prefer “Not found” / “Needs review” honesty over speculative completeness.

## Anti-style (avoid)
- Generic purple-on-white SaaS defaults.
- Empty slogans and unjustified superlatives.
- Over-decorated UIs (shadows everywhere, gradients without purpose).

## Canonical sources
- Brand DNA (generated): `docs/02-guidelines/inspiration/*`
- App interpretation (generated): `docs/02-guidelines/inspiration/brand-dna-2026-02-06/web-app-design-language.md`
