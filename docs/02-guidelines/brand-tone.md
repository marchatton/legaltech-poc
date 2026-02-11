# Brand Tone (V5 Final)

This is the writing and microcopy standard for Orbital product UI and docs, distilled from:
- `docs/02-guidelines/v5-final/design-system.html`
- `docs/02-guidelines/v5-final/tokens.css`

## Voice traits
- Direct and practical: say what happened, what it means, and what to do next.
- Evidence-first: claims should be traceable to citations, documents, or explicit system state.
- Calm and precise: no hype language, no legal overreach, no vague confidence.
- Structured by default: use short headings, lists, and concrete labels.

## Core writing principles
- Lead with the outcome in plain language.
- Follow with the reason or count (for example: `3 citations could not be matched`).
- Offer a safe next action when work is blocked.
- Prefer specific nouns over adjectives.
- If evidence is missing, state that explicitly.

## Product vocabulary
- Primary user-facing object: `Matter`.
- Technical identifiers can remain explicit (`folder_id`, source sections, page references).
- Status labels should stay canonical and repeated consistently.

## Canonical status language
Use these terms exactly when possible:
- `Reviewed`
- `Needs review`
- `Missing input`
- `Citation failed`
- `In progress`
- `Pending`
- `Failed`
- `Missing`

## CTA style
- Verb-first and concrete.
- Keep labels short and scannable.
- Good patterns from V5:
  - `Run Quick Start`
  - `View Evidence`
  - `Export CSV`
  - `Upload documents`
  - `Clear filters`
  - `Verify missing items`

## Error and warning style
- Start with a short, unambiguous title.
- Include a concrete count or scope when available.
- Explain the recovery path.

Preferred patterns:
- `Verification failed` + `3 citations could not be matched.`
- `Export blocked` + `2 rows failed verification. Resolve before exporting.`
- `3 documents need review` + `Missing source instruments for referenced commitments.`

## Evidence language
- Never imply certainty without a traceable source.
- For unresolved extraction/search results, use the canonical phrase:
  - `Not found in provided documents.`
- When possible, include concrete anchors (for example: section, page, source name).

## Empty states and guidance copy
- Be specific about what is missing.
- Tell the user exactly what to do next.

Patterns:
- `No documents yet` + `Upload PDFs to get started with document analysis.`
- `No results found` + `Try different search terms or adjust your filters.`

## Conversation style (assistant)
- Summarize findings with counts before detail.
- Use ordered lists for extracted results.
- Ask focused follow-up questions that unblock the next action.
- Keep assistant responses compact and operational.

## Do / Don't
Do:
- `Found 12 unverified carbon commitments.`
- `Upload the referenced document or mark as reviewed with a note.`
- `Ingestion started. Processing 14 documents.`

Don't:
- `Everything looks good` without verification.
- `Probably` or `we think` without source-backed context.
- Long promotional tone in system feedback.
