# Overview

- Run summary:
  - Sites analysed: 8
  - Pages visited: 16
  - Blend mode: harmonise
  - Output style: standard
- High-level direction (3-6 bullets):
  - Blue-led, product-first visual system with neutral base
  - Concise, builder-focused voice with optional editorial depth
  - Generous whitespace and structured feature grids
  - Product UI screenshots, clean mockups, subtle depth accents
  - Warm accents reserved for small highlights only

# Composite Brand DNA

## Visual

### Colours
- Primary: #0055FF (usage: primary actions)
- Secondary: #222326 (usage: secondary UI and headings)
- Accent: #0099FF (usage: links and focus)
- Background: #F4F5F8
- Text: #222326
- Notes:
  - Warm accents are optional highlights, not core palette.

### Typography
- Body: clean sans (not specified)
- Headings: Signifier (editorial accent) or clean sans
- Weights: regular to medium for body, bold for hero
- Scale and hierarchy:
  - Short hero headlines, clear subheads, strong CTA labels

### Imagery
- Medium: product UI screenshots and clean mockups
- Treatment:
  - occasional editorial photography
  - limited 3D or glass accents
  - clean, high-contrast compositions

### Iconography
- Style: minimal monochrome icons with occasional badge motifs

### Motion / Interaction
- Style: subtle functional transitions
- Notes:
  - motion not directly observed in landing/brand pages

## UI and Components

- Density: medium, with generous whitespace
- Corner radius: subtle rounding (6-12px recommended)
- Elevation: low elevation, restrained shadows
- Components (top patterns):
  - hero CTA block
  - feature grids
  - pricing tables
  - metrics and testimonials

## Voice & Personality

### Voice traits
- builder focused
- confident
- concise
- benefit led
- trustworthy

### Microcopy patterns
- short action verbs (Start, Build, Deploy, Subscribe)
- direct, outcome-oriented subheads
- minimal jargon

### Do / Don't
**Do**
- be specific about outcomes
- keep sentences short and direct

**Don't**
- overhype or use slang-heavy copy
- over-decorate layouts

# Composite Design Tokens

Provide design tokens in human-readable form (these must match `design_tokens.json`):

- Spacing scale: not specified; recommend 8px base
- Radius scale: not specified; recommend 6-12px
- Shadow tokens: subtle, low elevation
- Border tokens: thin neutral borders
- Grid/layout rhythm: clear hero + feature grids + testimonials

# Composite Voice & Copy

- Summary:
  - Concise, benefit-led copy for builders with an optional editorial accent.
- Example rewrites (paraphrased, not lifted):
  - Build faster with a platform that removes friction.
  - Ship reliable experiences without excess complexity.
  - Subscribe for clear guidance on what comes next.

# Composite Prompt Pack

## Brand style prompt
Create a modern, builder-focused brand that feels fast, reliable, and outcome driven. Use a cool blue primary with neutral backgrounds and dark text. Keep the tone concise and benefit led, with a light editorial accent when needed. Evidence: [framer:brand:colours.primary] [linear:brand:colours.secondary] [every:about:typography] [vercel:home:voice].

## Visual direction prompt
Use clean product UI screenshots and browser mockups on light neutral surfaces. Add subtle 3D or glass accents sparingly, and occasional editorial photography with geometric motifs. Evidence: [framer:home:imagery] [vercel:home:imagery] [stripe:home:imagery] [raycast:home:imagery].

## UI direction prompt
Structure pages with a clear hero, primary CTA, feature grid, pricing comparison, metrics, and testimonials. Keep spacing generous and sections focused. Evidence: [linear:home:components] [vercel:home:components] [framer:home:components].

## Copywriting prompt
Use short, declarative sentences and action verbs like Start, Build, Deploy, and Subscribe. Keep claims specific and grounded in outcomes. Evidence: [linear:home:voice] [vercel:home:voice] [raycast:home:voice].

## Negative prompt / Avoid
Avoid noisy multi-color palettes, overly playful slang, heavy ornament, or long unstructured text blocks.

## Token set
{
  "colour": [
    "Primary #0055FF, accent #0099FF",
    "Background #F4F5F8, text #222326",
    "Reserve warm accents for small highlights only"
  ],
  "type": [
    "Clean sans for UI",
    "Optional editorial serif for long-form sections"
  ],
  "layout": [
    "Generous whitespace",
    "Feature grids and pricing tables"
  ],
  "imagery": [
    "Product UI screenshots",
    "Minimal 3D or glass accents",
    "Selective editorial photography"
  ],
  "voice": [
    "Builder focused and confident",
    "Concise, outcome driven copy"
  ]
}

# Provenance Map

Explain "what came from where", including weights and evidence anchors:

- Primary blue from Framer brand colors; neutral base from Linear brand colors.
- Editorial serif accent from Every colophon (Signifier).
- Imagery and UI structure blended from Linear, Framer, Vercel, Stripe, Raycast, Monzo.
- Voice balance from Linear, Vercel, Raycast, and Every.

# Conflicts & Resolutions

## Conflicts
- Warm coral/red accents conflict with cool blue/neutral palettes.
- Serif editorial type vs neutral sans product UI.
- Editorial long-form voice vs concise product voice.

## Resolutions
- Use blue primary with neutral base; warm accents optional only.
- Default to sans for UI; allow serif as editorial accent.
- Keep concise product voice with optional narrative framing.

# Per-site Appendices

## Monzo

- Confidence: 0.56
- Brand DNA (condensed):
  - Voice: friendly, reassuring, practical
  - Imagery: colorful lifestyle photography and playful illustrations
  - Components: primary_cta, plan_cards, security_badges
- Limitations:
  - No CSS or computed style data available from landing/press pages.
  - Color values are name-only without hex codes.

## Coinshift

- Confidence: 0.70
- Brand DNA (condensed):
  - Voice: confident, technical, operations focused
  - Imagery: product-focused visuals with badges and logos
  - Components: primary_cta, feature_sections, testimonials
- Limitations:
  - Typography not specified in landing or brand pages.
  - No CSS tokens available.

## Every

- Confidence: 0.70
- Brand DNA (condensed):
  - Voice: editorial, curious, future focused
  - Imagery: illustration-led with editorial accents
  - Components: primary_cta, editorial_lists, product_tiles
- Limitations:
  - Color palette not listed on landing/about pages.
  - No CSS tokens available.

## Linear

- Confidence: 0.75
- Brand DNA (condensed):
  - Voice: precise, product focused, craft driven
  - Imagery: product UI screenshots and avatars
  - Components: primary_cta, feature_sections
- Limitations:
  - Primary brand blue hex value not listed.
  - Typography not listed in extracted text.

## Vercel

- Confidence: 0.62
- Brand DNA (condensed):
  - Voice: confident, technical, benefit led
  - Imagery: product UI, browser mockups, abstract scenes
  - Components: primary_cta, feature_sections
- Limitations:
  - Brand assets page lacks explicit color or typography tokens.
  - No CSS tokens available.

## Framer

- Confidence: 0.75
- Brand DNA (condensed):
  - Voice: fast, creative, builder focused
  - Imagery: product UI, 3D renders, website showcases
  - Components: primary_cta, feature_grid
- Limitations:
  - Typography not specified in brand page text.
  - No CSS tokens available.

## Stripe

- Confidence: 0.68
- Brand DNA (condensed):
  - Voice: enterprise, reliable, infrastructure focused
  - Imagery: editorial photography with logo-shaped motifs
  - Components: primary_cta, case_studies, metrics
- Limitations:
  - No explicit hex values for wordmark colors on resources page.
  - No CSS tokens available.

## Raycast

- Confidence: 0.70
- Brand DNA (condensed):
  - Voice: direct, productivity focused, minimal
  - Imagery: product UI screenshots with glassy blue backdrop
  - Components: primary_cta, feature_sections
- Limitations:
  - Press kit page could not be fetched directly; used cached snippet from search results.
  - No CSS tokens available.

# Limitations

- Global limitations:
  - Only landing pages and brand/press pages were analyzed.
  - No CSS variables or computed styles were captured.
  - Motion and interaction patterns were not observable in text extraction.
- Per-site limitations:
  - See per-site appendices.
