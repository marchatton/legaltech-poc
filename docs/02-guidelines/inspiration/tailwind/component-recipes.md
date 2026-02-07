# Component Recipes (Tailwind)

Generated pack inputs:
- `docs/02-guidelines/inspiration/brand_guidelines.md`
- `docs/02-guidelines/inspiration/design_tokens.json`
- `docs/02-guidelines/inspiration/prompt_library.json`

This is intentionally “recipes, not components”.

## Button

Base
```txt
inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-ui-md px-3 py-2 text-sm font-medium
transition-colors duration-standard ease-brand-standard
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
disabled:pointer-events-none disabled:opacity-50
motion-reduce:transition-none
```

Primary (default CTA)
```txt
bg-primary text-primary-foreground hover:bg-primary/90 active:bg-primary/80
```

Secondary (quiet)
```txt
bg-card text-foreground border border-border/15 hover:bg-card/80 active:bg-card/70
```

Ghost
```txt
bg-transparent text-foreground hover:bg-muted/40 active:bg-muted/60
```

Link / tertiary
```txt
bg-transparent text-foreground underline-offset-4 hover:underline
```

## Input / textarea / select

```txt
w-full rounded-ui-md bg-background text-foreground
border border-border/15 px-3 py-2 text-sm
placeholder:text-foreground/50
focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background
disabled:cursor-not-allowed disabled:opacity-50
motion-reduce:transition-none
```

Error state (pair with copy, not colour-only)
```txt
border-primary/50 focus-visible:ring-primary
```

## Card / panel

```txt
rounded-ui-lg border border-border/10 bg-card text-card-foreground shadow-ui-sm
```

## Badge / chip

Neutral chip (default)
```txt
inline-flex items-center rounded-pill border border-border/15 bg-card px-2 py-1 text-xs text-foreground
```

Highlight chip (selection)
```txt
inline-flex items-center rounded-pill bg-secondary/50 px-2 py-1 text-xs text-secondary-foreground
```

## Table baseline (dense, trust surfaces)

Table
```txt
w-full text-sm
```

Header row
```txt
border-b border-border/15 bg-muted/20 text-foreground/80
```

Body rows
```txt
divide-y divide-border/10
```

Row hover (subtle)
```txt
hover:bg-muted/20
```

## Modal / popover baseline

Surface
```txt
rounded-ui-lg border border-border/15 bg-card text-card-foreground shadow-ui-lg
```

Overlay
```txt
bg-foreground/30 backdrop-blur-sm
```

## Focus + accessibility rules

- Prefer `ring` over `border` changes for focus.
- Use `ring-ring` so focus is distinct from primary CTAs.
- Keep keyboard parity with hover affordances.

## Reduced motion

Use Tailwind’s motion variants:
- `motion-reduce:transition-none`
- `motion-reduce:transform-none`

