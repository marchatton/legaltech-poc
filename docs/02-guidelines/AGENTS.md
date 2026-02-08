# Product + UI guidelines

## Purpose
- Keep product tone + interaction consistent.

## Brand guidelines
Foundational design system `docs/02-guidelines/v5-final`, including:
- `design-system.html` (for easy viewing)
- `tailwind.preset.ts`
- `tokens.css`

If missing, search within `docs/02-guidelines/`.

## Accessibility baseline (minimum)
- Keyboard support + visible focus.
- Targets >= 24px (>= 44px on mobile).
- Inline errors with aria-live="polite"; focus first invalid on submit.
- Confirm destructive actions (or Undo).
- Honor prefers-reduced-motion (opacity/transform only).
- Never block paste, rely on color-only, or disable zoom.

## Key Skills
- `generating-tailwind-brand-config` for brand tokens/config
- `baseline-ui`, `interface-design`, `frontend-design` and `web-design-guidelines` for UI
