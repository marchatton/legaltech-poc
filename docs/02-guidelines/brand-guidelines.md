# Brand Guidelines (V5 Final)

This is the human-readable brand system for Orbital, distilled from the canonical V5 files:
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`

## One-line direction
Calm, evidence-first product UI: near-white cream surfaces, sharp editorial hierarchy, and restrained orange used only for high-signal actions.

## Visual stance
- Default to a warm, low-noise canvas (`#FFFEFB`) and white cards (`#FFFFFF`).
- Keep hierarchy typographic first, decorative second.
- Use orange sparingly for only the most important action/state.
- Prefer neutral structure (borders, spacing, rhythm) over heavy effects.

## Core color roles
- `Primary` (high signal): `#FB631B`
- `Secondary` (support/select): `#C0F0FB`
- `Accent` (focus/ring): `#D8ACFF`
- `Background`: `#FFFEFB`
- `Foreground`: `#1A1A1A`
- `Muted`: `#F5F3F0`

## Semantic colors
- `Success`: `#2D8A5F`
- `Warning`: `#D4920B`
- `Destructive`: `#DC4A4A`
- `Info`: `#0D6EA5`

## Dark mode baseline
- `Background`: `#0A0A0A`
- `Foreground`: `#F5F5F5`
- `Card`: `#171717`
- `Muted`: `#242424`
- `Primary` boost for contrast: `#FF5A14`
- Keep `Secondary` and `Accent` consistent (`#C0F0FB`, `#D8ACFF`).

## Color scale policy
- Brand and semantic colors ship with full `50-900` ramps.
- The base semantic token maps to the `500` step.
- Use `50-200` for subtle surfaces/tints, `400-700` for actionable states, `800-900` for deep contrast cases.

## Typography roles
- Heading/display: `Crimson Pro` (editorial emphasis, section anchors, major numbers).
- Body/UI: `Inter` (clarity and compact readability).
- Data/IDs/code-like UI: `JetBrains Mono`.

## Type scale (reference)
- Display: `48px`
- Heading XL: `36px`
- Heading LG: `28px`
- Heading MD: `22px`
- Heading SM: `18px`
- Body: `15px`
- Body small/metadata: `13px`
- Overline/meta labels: `11px` mono uppercase

## Shape, borders, and elevation
- Radius tokens: `6px`, `8px`, `12px`, `16px`, `pill`.
- Borders are default structure (`--border`) before shadows.
- Shadows are light and sparse (`ui-sm`, `ui-md`, `ui-lg`) and should support depth, not style-for-style.

## Motion posture
- Durations:
  - `150ms` micro
  - `200ms` standard
  - `400ms` large transitions only
- Easing: `cubic-bezier(0.4, 0, 0.2, 1)`.
- Motion should feel precise and calm; avoid bounce-heavy or ornamental movement.

## Component usage rules
- Buttons:
  - Primary (orange) for one dominant action in view.
  - Secondary/ghost/outline for supportive paths.
  - Destructive uses semantic red, never primary orange.
- Inputs:
  - Quiet default states; clear visible focus ring using accent/ring token.
  - Errors must include text, not color-only cues.
- Tables and evidence surfaces:
  - Compact layout, strong row rhythm, and easy status scanning.
  - Show uncertainty explicitly (`Needs review`, `Missing input`, `Citation failed`).

## Chat-specific rules
- User bubble uses soft cyan tint (`secondary-100` / `#DCF4FB` in light mode).
- Reserve orange for assistant identity and action emphasis only.
- In dark mode, user bubble shifts to deep teal (`#14262E`) with high-contrast text.

## Anti-style
- Do not turn accent colors into competing primaries in one screen.
- Do not use orange for low-priority controls.
- Do not hide uncertainty with optimistic copy or decorative noise.

## Canonical source
Treat the V5 files as source of truth for implementation details:
- `docs/02-guidelines/v5-final/tokens.css`
- `docs/02-guidelines/v5-final/tailwind.preset.ts`
- `docs/02-guidelines/v5-final/design-system.html`
