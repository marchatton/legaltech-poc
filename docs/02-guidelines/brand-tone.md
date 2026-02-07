# Brand Tone (Distilled)

This is the writing/voice guide for the Orbital Copilot PoC (docs + product UI).

Source material (generated Brand DNA):
- `docs/02-guidelines/inspiration/brand_guidelines.md` (current run: `brand-dna-2026-02-06`)
- `docs/02-guidelines/inspiration/prompt_library.json`

## Voice traits
- Developer-first: direct, specific, minimally salesy.
- Evidence-led: “show your work” (citations, examples, concrete steps).
- Polished and tool-like: calm confidence, not hype.
- Editorial when explaining: use structure, headings, and crisp opinions.

## Writing principles
- Prefer nouns and verbs over adjectives.
- State constraints up front (what’s in scope / out of scope).
- When unsure, say so and surface the next step to resolve it.
- Use consistent domain terms:
  - API/DB: **Folder**
  - UI: **Matter**

## Microcopy patterns
CTAs:
- Verb-first, concrete: “Run Quick Start”, “Export CSV”, “Open evidence”, “Retry ingest”.

Statuses (use the canonical words):
- “Needs review”, “Reviewed”, “Missing input”, “Citation failed”.

Errors:
- Calm, short summary first.
- Provide a safe next action (retry, view details, contact).
- Never leak provider internals or stack traces.

Evidence language:
- If there is no evidence, do not imply certainty.
- Prefer “Not found in provided documents.” when evidence is missing (canonical string; see `docs/03-architecture/20_state_model.md`).

## Do / Don’t
Do:
- “We couldn’t find supporting evidence for this in the uploaded documents.”
- “This exception references an instrument we don’t have. Upload the referenced document or mark as reviewed.”
- “Export blocked: 2 rows failed citation verification.”

Don’t:
- “All clear” (unless proven)
- “We think…” without evidence
- “This is legally compliant” / legal advice framing

## Docs posture
Docs should read like a practical playbook:
- One decision per section.
- Link to the canonical contract/doc (state model, API surface, ADRs).
- If a doc is a summary/TL;DR, say so explicitly and link to the canonical source.
