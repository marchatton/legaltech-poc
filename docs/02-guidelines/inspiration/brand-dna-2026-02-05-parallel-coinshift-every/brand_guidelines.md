# Overview

- Run summary:
  - Sites analysed: 3
  - Pages visited: 5
  - Blend mode: harmonise
  - Output style: standard
- High-level direction (3-6 bullets):
  - Purple-led, research-grade visual system with cool neutrals
  - Editorial serif headlines paired with clean UI labels
  - Clear product benchmarks and concise feature grids
  - Dreamlike illustrations balanced by crisp product UI
  - Warm clay accents used sparingly

# Composite Brand DNA

## Visual

### Colours
- Primary: #7B70E4 (usage: primary actions)
- Secondary: #101F2D (usage: dark UI and headings)
- Accent: #FA3812 (usage: sparingly for highlights)
- Background: #FEFDFC
- Text: #101F2D
- Notes:
  - Warm accents are optional; keep the overall palette cool and muted.

### Typography
- Body: Inter Tight (UI) or clean sans fallback
- Headings: PP Editorial New with optional Signifier for editorial blocks
- Weights: regular to medium for body, bold for hero
- Scale and hierarchy:
  - Short hero headlines, clear subheads, strong CTA labels

### Imagery
- Medium: surreal editorial illustrations and clean product UI
- Treatment:
  - dreamlike landscapes and gateway motifs
  - high-contrast UI screenshots
  - restrained use of warm accents

### Iconography
- Style: minimal marks and token/badge icons

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
  - benchmark callouts
  - feature grids
  - editorial narrative blocks

## Voice & Personality

### Voice traits
- precise
- confident
- editorial
- benefit led

### Microcopy patterns
- short action verbs (Start, Build, Speak, Subscribe)
- direct, outcome-oriented subheads
- minimal jargon

### Do / Don't
**Do**
- emphasize accuracy and control
- invite curiosity with short reflective lines

**Don't**
- overpromise or use vague hype
- over-decorate layouts

# Composite Design Tokens

Provide design tokens in human-readable form (these must match `design_tokens.json`):

- Spacing scale: not specified; recommend 8px base
- Radius scale: not specified; recommend 6-12px
- Shadow tokens: subtle, low elevation
- Border tokens: thin neutral borders
- Grid/layout rhythm: hero + benchmarks + feature grids + editorial blocks

# Composite Voice & Copy

- Summary:
  - Precise, benefit-led copy with occasional editorial framing.
- Example rewrites (paraphrased, not lifted):
  - Deliver higher-accuracy search results with predictable costs.
  - Consolidate your operations without adding complexity.
  - Explore what comes next, grounded in real outcomes.

# Composite Prompt Pack

## Brand style prompt
Create a modern, research-grade product brand with a purple-led palette, ivory background, and charcoal text. Use Inter Tight for UI and PP Editorial New for headings, with Signifier only for editorial blocks. Evidence: [parallel:brand:colours.primary] [coinshift:brand:colours.primary] [every:about:typography].

## Visual direction prompt
Blend surreal editorial illustrations with clean product UI imagery. Use minimal decoration and crisp, high-contrast layouts. Evidence: [parallel:brand:imagery] [coinshift:home:components].

## UI direction prompt
Structure pages with a focused hero, benchmark callouts, feature grids, and clear CTAs. Evidence: [parallel:home:components] [coinshift:home:components].

## Copywriting prompt
Write concise, technical copy about accuracy and control, with occasional reflective framing. Evidence: [parallel:home:voice] [coinshift:home:voice] [every:about:voice].

## Negative prompt / Avoid
Avoid vague hype, playful slang, or decorative clutter.

## Token set
{
  "colour": [
    "#7B70E4 primary",
    "#FEFDFC background",
    "#101F2D text",
    "#FA3812 accent"
  ],
  "type": [
    "Inter Tight UI",
    "PP Editorial New headings",
    "Signifier for long-form"
  ],
  "layout": [
    "Hero + benchmarks",
    "Feature grids",
    "Editorial blocks"
  ],
  "imagery": [
    "Dreamlike illustrations",
    "Product UI"
  ],
  "voice": [
    "Precise, benefit-led",
    "Reflective framing when needed"
  ]
}

# Provenance Map

Explain "what came from where", including weights and evidence anchors:

- Primary purple from Parallel brand colors (weight 0.5).
- Ivory base and clay accent from Coinshift media kit (weight 0.25).
- Editorial serif influence from Every colophon (weight 0.25).
- Voice balance from all three sites.

# Conflicts & Resolutions

## Conflicts
- Purple/blue palette vs warm clay accent.
- PP Editorial New + Inter Tight vs Signifier.
- Technical precision vs editorial curiosity.

## Resolutions
- Use purple as primary; keep clay accent sparing.
- Default to Inter Tight/PP Editorial New; allow Signifier for long-form blocks.
- Keep technical clarity with occasional reflective framing.

# Per-site Appendices

## Parallel

- Confidence: 0.82
- Brand DNA (condensed):
  - Voice: precise, technical, confident
  - Imagery: surreal, dreamlike illustrations plus product UI imagery
  - Components: primary_cta, secondary_cta, feature_sections
- Limitations:
  - No explicit spacing, radius, or shadow tokens in brand text.
  - Motion details not available in text extraction.

## Coinshift

- Confidence: 0.72
- Brand DNA (condensed):
  - Voice: confident, operational, direct
  - Imagery: not confidently inferred
  - Components: primary_cta, feature_sections
- Limitations:
  - Typography not specified in landing or brand pages.
  - Imagery details not available in text extraction.

## Every

- Confidence: 0.60
- Brand DNA (condensed):
  - Voice: editorial, curious, future focused
  - Imagery: not confidently inferred
  - Components: content_sections
- Limitations:
  - Landing page content not reliably accessible; used about page only.
  - Color palette not listed in accessible text.

# Limitations

- Global limitations:
  - Only landing and brand/press pages were analyzed.
  - No CSS variables or computed styles were captured.
  - Motion and interaction patterns were not observable in text extraction.
- Per-site limitations:
  - See per-site appendices.
