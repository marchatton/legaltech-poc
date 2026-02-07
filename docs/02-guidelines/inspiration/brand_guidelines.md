# Overview

Note: this file is the canonical "latest" Brand DNA output for the current run.
Archived snapshot copies live under `docs/02-guidelines/inspiration/brand-dna-2026-02-06/`.

- Run: `brand-dna-2026-02-06`
- Timestamp (UTC): `2026-02-06T16:27:35+00:00`
- Inspiration input: `docs/02-guidelines/inspiration/brand-dna-2026-02-06/brand-apps-inspiration.md`
- Sites analysed: amp, coinshift, parallel, every, firecrawl, raycast
- Coverage: Firecrawl (branding+markdown) on 7 pages; Parallel excerpts on 23 pages; browser probe on 8 pages (desktop+mobile, light+dark, base/hover/focus).
- Key limitations: probes only sampled body/h1/link/primary-cta/input; no full CSS rule extraction; some sources are content-heavy (Every) so homepage signals may be article-shaped.
- Web app implementation notes: `web-app-design-language.md`.

# Composite Brand DNA

## Personality
- Developer-first, direct, minimal hype. [amp:home:voice.traits] [parallel:home:voice.traits] [firecrawl:home:voice.traits]
- Polished, tool-like, premium. [raycast:home:voice.traits]
- Editorial when explaining (long-form clarity; clear opinions). [every:home:voice.traits]
- Trust-forward and ops-aware where money/data is involved. [coinshift:home:voice.traits]

## Visual stance
- High-contrast hierarchy with disciplined colour: warm neutrals + one vivid primary + one cool secondary.
- Flat surfaces, minimal decoration; shadows are rare and purposeful. [firecrawl:home:elevation.shadows]

## Experience stance
- Density: compact but readable; typography does the work. [every:home:typography.body.font_family] [raycast:home:typography.body.font_family]
- Motion posture: quick, tactile transitions (150-400ms), mostly easing curves, not bouncy springs. [amp:home:motion.transition_durations_ms] [raycast:home:motion.transition_durations_ms]

# Composite Design Tokens

## Colour
- Primary: `#FB631B` (from Parallel). [parallel:home:colour.primary]
- Secondary highlight: `#C0F0FB` (from Every). [every:home:colour.primary]
- Accent: `#D8ACFF` (from Raycast). [raycast:home:colour.accent]
- Background/Text (light): `#DFDFC1` / `#0B0D0B` (from Amp). [amp:home:colour.background] [amp:home:colour.text]
- Background/Text (dark): `#07080A` / `#FFFFFF` (from Raycast). [raycast:home:colour.background] [raycast:home:colour.text]
- Contrast: treat cyan as a background/selection highlight, not primary text.

## Typography
- Body: Switzer/Inter family stack (clean UI), with serif moments for long-form. [every:home:typography.body.font_family] [raycast:home:typography.body.font_family]
- Headings: Signifier-like serif for editorial hierarchy; allow a display swap for hero moments (Sagittaire Display). [every:home:typography.headings.font_family] [amp:home:typography.headings.font_family]
- Monospace: GeistMono/FT System Mono/Berkeley Mono for code tokens and tiny UI.

## Spacing and layout
- Base step: 4px; scale in 4/8/12/16/24/32 cadence. [amp:home:spacing.step] [parallel:home:spacing.step]

## Shape, borders, shadows
- Radius: small radii (4-10px) by default; allow pills (9999) for chips/auth buttons. [firecrawl:signin:radius.scale] [coinshift:home:components.buttonPrimary.borderRadius]
- Elevation: mostly flat; one soft shadow token; optional inset glow for primary buttons. [firecrawl:home:elevation.shadows]

## Motion and interaction
- Durations: 150ms (micro), 200ms (standard), 400ms (large). [amp:home:motion.transition_durations_ms] [parallel:home:motion.transition_durations_ms] [raycast:home:motion.transition_durations_ms]
- Easing: cubic-bezier(0.4,0,0.2,1), ease-in-out.

# Composite Voice & Copy

## Tone traits
- Direct, specific, minimally salesy; use evidence when making claims. [amp:home:voice.traits] [firecrawl:home:voice.traits]
- Editorial clarity for explainers (structure, headings, examples). [every:home:voice.traits]

## Do and don't
- Do: name the user + the job-to-be-done; state constraints; show proof (benchmarks, screenshots, citations).
- Don't: vague slogans; fluffy abstractions; unjustified superlatives.

## Microcopy patterns
- CTAs: verb-first, concrete: Get started, Try, Install, Read more.
- Errors/help: calm, precise, short; reveal details progressively.

# Composite Prompt Pack

## Brand style prompt

Brand style (composite). [parallel:home:colour.primary] [every:home:typography.headings.font_family] [raycast:home:colour.accent] [firecrawl:home:motion.transition_durations_ms]
Palette: primary #FB631B, secondary #C0F0FB, accent #D8ACFF.
Background #DFDFC1 with text #0B0D0B.
Type: body Switzer, Inter, system-ui, -apple-system, sans-serif, headings Signifier, ui-serif, Georgia, serif, mono GeistMono, FT System Mono, Berkeley Mono, ui-monospace, SFMono-Regular, monospace.
Spacing step 4; radius scale [4, 6, 8, 10, 32, 9999].


## Visual direction prompt

Visual direction: crisp, engineered UI with occasional editorial moments. [parallel:home:colour.primary] [every:home:typography.headings.font_family] [raycast:home:colour.accent] [firecrawl:home:motion.transition_durations_ms]
Prefer flat surfaces; use elevation sparingly (sample: ['0px 1px 2px rgba(0,0,0,0.05)']).
Accents are high-chroma but disciplined.


## UI direction prompt

UI direction: compact but readable, strong hierarchy, confident CTAs. [parallel:home:colour.primary] [every:home:typography.headings.font_family] [raycast:home:colour.accent] [firecrawl:home:motion.transition_durations_ms]
Motion: [150, 200, 400]ms with ['cubic-bezier(0.4, 0, 0.2, 1)', 'ease-in-out', 'ease'].
Focus rings visible (not neon). Hover states subtle but obvious.


## Copywriting prompt

Copywriting: developer-first, direct, evidence-led, confident, polished, minimal hype, editorial when explaining. [parallel:home:colour.primary] [every:home:typography.headings.font_family] [raycast:home:colour.accent] [firecrawl:home:motion.transition_durations_ms]
Be specific. Avoid buzzwords. Use short sentences.
CTAs: verb-first, concrete (Get started, Try, Install, Read more).


## Negative prompt

Negative: generic purple-on-white SaaS, empty slogans, unjustified superlatives, cluttered components.

## Token set

- colour:
  - Primary: #FB631B
  - Secondary: #C0F0FB
  - Accent: #D8ACFF
  - BG/Text: #DFDFC1 / #0B0D0B

- type:
  - Body: Switzer, Inter, system-ui, -apple-system, sans-serif
  - Headings: Signifier, ui-serif, Georgia, serif
  - Mono: GeistMono, FT System Mono, Berkeley Mono, ui-monospace, SFMono-Regular, monospace

- layout:
  - Spacing step: 4
  - Radius scale: [4, 6, 8, 10, 32, 9999]

- imagery:
  - Prefer product-first visuals, UI screenshots, sparse illustrations.

- voice:
  - developer-first
  - direct
  - evidence-led
  - confident
  - polished
  - minimal hype
  - editorial when explaining

- motion:
  - Durations: [150, 200, 400]
  - Easing: ['cubic-bezier(0.4, 0, 0.2, 1)', 'ease-in-out', 'ease']

# Provenance Map

- Weights: equal (1/6 each).
- Composite palette provenance: primary=Parallel, secondary=Every, accent=Raycast, background/text=Amp, dark theme=Raycast + Firecrawl.
- Evidence anchors use `[site_id:page_id:signal_key]`. Example: [amp:home:colour.primary].

# Conflicts & Resolutions

- Conflict (theme_split): Some sources are strongly dark-mode (Every/Raycast) while others present as light (Amp/Parallel/Firecrawl/Coinshift). Sources: every, raycast, amp, parallel, firecrawl, coinshift
- Conflict (accent_clash): Multiple high-chroma accents compete (orange vs purple/cyan). Sources: coinshift, parallel, firecrawl, raycast, every
- Resolution: Include explicit dark theme variant, keep light theme as default. (harmonise)
- Resolution: Assign roles: orange=primary, cyan=secondary highlight, purple=accent; enforce usage limits. (harmonise)

# Per-site Appendices

## amp

### Brand DNA (site)
- Voice traits: modern, medium energy, developer-first, direct
- Palette: {'primary': '#DFDFC1', 'secondary': '#D0D0B4', 'accent': '#171917', 'background': '#DFDFC1', 'text': '#0B0D0B'}
- Type: body `system-ui, -apple-system, "system-ui", "Segoe UI", Roboto, sans-serif`, headings `"Sagittaire Display", serif`

### Evidence highlights
- [amp:home:colour.primary]
- [amp:home:typography.body.font_family]
- [amp:home:motion.transition_durations_ms]

### Per-site limitations
- Probe sampled only a small set of elements (body/h1/link/primary-cta/input).

## coinshift

### Brand DNA (site)
- Voice traits: modern, medium energy, trust-forward, ops-focused
- Palette: {'primary': '#F0F8FF', 'secondary': '#FEFDFC', 'accent': '#FA3812', 'background': '#FEFDFC', 'text': '#000000'}
- Type: body `"ABC ROM", sans-serif`, headings `"ABC ROM", sans-serif`

### Evidence highlights
- [coinshift:home:colour.primary]
- [coinshift:home:typography.body.font_family]
- [coinshift:home:motion.transition_durations_ms]

### Per-site limitations
- Probe sampled only a small set of elements (body/h1/link/primary-cta/input).

## parallel

### Brand DNA (site)
- Voice traits: modern, medium energy, developer-first, direct
- Palette: {'primary': '#FB631B', 'secondary': '#858483', 'accent': '#0D6EA5', 'background': '#FFFFFF', 'text': '#000000'}
- Type: body `gerstnerProgramm, "gerstnerProgramm Fallback", "sans-serif"`, headings `gerstnerProgramm, "gerstnerProgramm Fallback", "sans-serif"`

### Evidence highlights
- [parallel:home:colour.primary]
- [parallel:home:typography.body.font_family]
- [parallel:home:motion.transition_durations_ms]

### Per-site limitations
- Probe sampled only a small set of elements (body/h1/link/primary-cta/input).

## every

### Brand DNA (site)
- Voice traits: modern, medium energy, editorial, opinionated
- Palette: {'primary': '#C0F0FB', 'secondary': '#FFFFFF', 'accent': '#03120F', 'background': '#020202', 'text': '#FFFFFF'}
- Type: body `Switzer, Signifier, "Hoefler Text", "Baskerville Old Face", Garamond, Georgia, "Times New Roman", serif`, headings `Signifier, ui-serif, Georgia, Cambria, "Times New Roman", Times, serif`

### Evidence highlights
- [every:home:colour.primary]
- [every:home:typography.body.font_family]
- [every:home:motion.transition_durations_ms]

### Per-site limitations
- Firecrawl homepage scrape captured an article view; treat some copy signals as editorial rather than product UI.

## firecrawl

### Brand DNA (site)
- Voice traits: modern, high energy, developer-first, direct
- Palette: {'primary': '#FF4C00', 'secondary': '#FF4D00', 'accent': '#FF4C00', 'background': '#F9F9F9', 'text': '#262626'}
- Type: body `suisse, "suisse Fallback", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`, headings `suisse, "suisse Fallback", ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"`

### Evidence highlights
- [firecrawl:home:colour.primary]
- [firecrawl:home:typography.body.font_family]
- [firecrawl:home:motion.transition_durations_ms]

### Per-site limitations
- Probe sampled only a small set of elements (body/h1/link/primary-cta/input).

## raycast

### Brand DNA (site)
- Voice traits: modern, medium energy, polished, tool-like
- Palette: {'primary': '#FF6363', 'secondary': '#9C9C9D', 'accent': '#D8ACFF', 'background': '#07080A', 'text': '#FFFFFF'}
- Type: body `Inter, "Inter Fallback", sans-serif`, headings `Inter, "Inter Fallback", sans-serif`

### Evidence highlights
- [raycast:home:colour.primary]
- [raycast:home:typography.body.font_family]
- [raycast:home:motion.transition_durations_ms]

### Per-site limitations
- Probe sampled only a small set of elements (body/h1/link/primary-cta/input).

# Limitations

## Global limitations
- No full CSS rule parsing; cssVariables are sampled (first 50).
- Hover/focus diffs only attempted on a heuristically-tagged 'primary CTA'.
- No screenshots captured; treat visual claims as token-level, not pixel-perfect.

## Per-site limitations
- amp: limited to sampled pages; some pages may be personalised/geo-variant.
- coinshift: limited to sampled pages; some pages may be personalised/geo-variant.
- parallel: limited to sampled pages; some pages may be personalised/geo-variant.
- every: limited to sampled pages; some pages may be personalised/geo-variant.
- firecrawl: limited to sampled pages; some pages may be personalised/geo-variant.
- raycast: limited to sampled pages; some pages may be personalised/geo-variant.
