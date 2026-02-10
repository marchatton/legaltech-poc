# Drift Item 3: Geometry Drift (target OCR/layout geometry vs `has_geometry=false`)

Assumptions: you care about "click source and highlight" UX, and you want a pragmatic ladder that works even before full OCR/layout extraction exists.

## Sources (doc vs code)
- Docs (should): `docs/03-architecture/30_data_model.md`, `docs/03-architecture/40_rag_and_agents.md`, `docs/03-architecture/DECISIONS.md`
- Code (is): `apps/web/lib/ingest/ingestProcessor.server.ts`

## 1) Intuition first (plain English)
Docs describe citations that can point to the exact place on a page (polygons/geometry).

Code currently extracts text via PDF.js and explicitly writes `has_geometry=false` in the layout JSON.

That means any highlighting is either impossible or must be coarse (like "this page" instead of "these words").

## 2) Metaphor / analogy (mapping)
Think of directions on a map:
- With geometry: "the cafe is at 12 Oak Street, second door on the left."
- Without geometry: "the cafe is somewhere in this neighborhood."

Where the metaphor breaks: even coarse directions can be useful, but you must be honest about the precision so the UX and trust model match reality.

## 3) Visual explanation (diagram via beautiful-mermaid)
Mermaid source:
```mermaid
flowchart LR
  D[Docs: OCR/layout geometry] --> L["Precise highlights"]
  C[Code: pdf.js text; has_geometry=false] --> G["Coarse/no highlights"]
  G --> F[Fix: page-polygon fallback]
  F --> T[Target: geometry ladder (page->line->word)]
```

Rendered:
```text
┌───────────────────────────────────────┐     ┌────────────────────────┐     ┌────────────────────────────┐     ┌────────────────────────────────────────────┐
│                                       │     │                        │     │                            │     │                                            │
│       Docs: OCR/layout geometry       ├────►│  "Precise highlights"  │     │ Fix: page-polygon fallback ├────►│ Target: geometry ladder (page->line->word) │
│                                       │     │                        │     │                            │     │                                            │
└───────────────────────────────────────┘     └────────────────────────┘     └────────────────────────────┘     └────────────────────────────────────────────┘
                                                                                            ▲
                                                                                            │
                                                                                            │
                                                                                            │
                                                                                            │
┌───────────────────────────────────────┐     ┌────────────────────────┐                    │
│                                       │     │                        │                    │
│ Code: pdf.js text; has_geometry=false ├────►│ "Coarse/no highlights" ├────────────────────┘
│                                       │     │                        │
└───────────────────────────────────────┘     └────────────────────────┘
```

## 4) Step-by-step breakdown
What geometry is for (inputs/outputs):
- Input: a document page and some text range / snippet.
- Output: coordinates you can draw on a rendered page (polygons/bounding boxes).

What "has_geometry=false" implies:
- The ingest pipeline is not producing reliable coordinate data.
- Any downstream system (citations viewer, chat sources) cannot assume highlight precision exists.

Why this matters (failure modes):
- UI tries to highlight and fails silently (looks broken).
- You claim "locked citations with polygons" but deliver "trust me bro" links (undermines evidence-first posture).

Fix options, explained:
- Doc-only: add a geometry maturity ladder to docs:
  - v0: page-level polygon (whole page rectangle)
  - v1: line-level boxes
  - v2: word-level boxes
  - This sets expectations and prevents future engineers from assuming v2 exists.
- Code: add a canonical full-page polygon fallback when `has_geometry=false`:
  - The contract stays consistent: citations always have a polygon list, but sometimes it is coarse.
  - The UI can still highlight (the whole page) instead of breaking.

Trade-offs:
- Page-level highlighting is less satisfying than word-level, but it is honest and stable.
- It provides a stepping stone: later you can replace coarse geometry without changing the API shape.

## 5) Common misunderstandings
- "No geometry means no citations."
  - You can have citations without precise geometry; you just need to communicate precision.
- "We should wait for full OCR to do any of this."
  - Waiting blocks downstream work (chat grounding, export posture). A v0 ladder often unblocks progress.
- "PDF.js text extraction can't ever support geometry."
  - It can sometimes provide basic mapping, but it is not as robust as layout-aware OCR; treat it as an incremental step.

## 6) Check understanding (teach-back question)
If we add a page-level polygon fallback tomorrow, what user experience changes should we make so users understand the highlight is coarse, not "wrong"?

