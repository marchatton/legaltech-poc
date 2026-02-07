# Integration Notes (Tailwind)

This folder is a generated “design system pack” from Brand DNA.

Required files:
- `tokens.css`
- `tailwind.preset.ts`
- `component-recipes.md`

## Tailwind config (app)

Config-first preset (recommended default):

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";
import preset from "./tailwind.preset";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx}", "./app/**/*.{ts,tsx}"],
} satisfies Config;
```

## Tailwind config (marketing)

Use the same preset but a different `content` glob.

```ts
// tailwind.config.ts (marketing)
import type { Config } from "tailwindcss";
import preset from "./tailwind.preset";

export default {
  presets: [preset],
  content: ["./src/**/*.{ts,tsx,mdx}"],
} satisfies Config;
```

## CSS import order

Ensure `tokens.css` is loaded before any Tailwind utilities are used.

Example (global CSS):

```css
@import "./tokens.css";
```

If your app already has Tailwind layers in a global file, keep `tokens.css` before the first use of the variables.

## Dark mode

Default is class-based dark mode. Toggle by applying `.dark` on a root element:
- `html.dark` or `body.dark`

