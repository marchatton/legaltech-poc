# ADR-0012: OCR/layout extraction is abstracted behind a single provider adapter

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
Assumption: you are building features like click-to-highlight, chunking, and citations on top of extracted PDF text.

We need OCR/layout extraction to produce:
- Text we can chunk, search, and cite.
- Geometry (bounding polygons) so the UI can highlight the exact words on a page.

Different OCR providers return different response shapes. If that leaks into the rest of the system, every downstream step becomes provider-specific.

So we put one adapter in front. Downstream code talks to one interface and receives one canonical per-page schema, regardless of which provider we use.

Inputs:
- PDF bytes

Outputs:
- Canonical per-page layout schema with text plus geometry

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: a travel plug adapter. You keep the same device and charger. Only the plug conversion changes based on the country.

Mapping:
| Travel world | This ADR |
| --- | --- |
| Different wall outlets | Different OCR providers (Azure Document Intelligence vs AWS Textract) |
| Travel plug adapter | OCR provider adapter |
| Standard charger input | Canonical per-page schema (the one format downstream expects) |
| Your device | Downstream features (chunking, citations, UI highlights) |

Where the metaphor breaks:
- A physical plug adapter is mostly passive. Our adapter normalizes data, handles errors, and enforces versioning expectations.
- A canonical schema may drop provider-specific fields unless we intentionally include them.

## Visual explanation (small ASCII diagram)
```text
                 provider chosen by config
                 +----------------------+
                 | Azure DI (default)   |
                 | AWS Textract (opt)   |
                 +----------+-----------+
                            |
                            v
+----------+     +----------------------+     +------------------------+
| PDF bytes| --> | OCR Provider Adapter | --> | Canonical per-page     |
+----------+     | (single interface)   |     | schema: text + geometry|
                 +----------+-----------+     +-----------+------------+
                                                    |
                                                    v
                                          chunking, citations, viewer
```

## Step-by-step breakdown
1. A PDF enters the system as raw bytes.
2. The app selects an OCR/layout provider.
3. Default provider: Azure Document Intelligence (Layout), unless an AWS-first posture is chosen.
4. The adapter calls the chosen provider and receives provider-specific output.
5. The adapter converts that output into a canonical per-page schema.
6. Downstream consumers read only the canonical schema.

Constraints this design satisfies:
- Highlight overlays require geometry.
- Provider choice should stay reversible (Azure vs AWS).
- Downstream chunking/citations should not be rewritten when provider changes.

Trade-offs:
- Adds a translation layer that can have bugs.
- You may lose provider-specific features unless the canonical schema is extended intentionally.
- The canonical schema becomes a contract; changing it requires coordination and versioning discipline.

Failure modes:
- Provider outage, timeouts, rate limits, or auth issues.
- Provider response format changes that break parsing.
- Geometry mismatches (rotated pages, coordinate differences, missing polygons) that cause bad highlights.
- OCR quality variance that changes chunking and retrieval quality.
- Silent drift if the adapter changes but downstream data is not re-derived.

Why this design vs alternatives:
- Calling Azure/AWS directly from downstream code causes vendor lock-in and duplicated parsing logic.
- Storing raw provider output and normalizing later spreads normalization logic and forces each consumer to understand provider quirks.
- A single adapter makes provider swaps a bounded change and keeps downstream behavior stable.

## Common misunderstandings
- "Adapter means we support multiple providers at once." It means downstream depends on one interface; runtime can still be single-provider.
- "Canonical schema means perfect fidelity." It means stable and useful for our product needs; it can be intentionally lossy.
- "If we swap providers, everything stays identical." Text and polygons can shift; plan for reprocessing/versioning.
- "This only affects OCR." It affects citations and UI highlighting because they depend on stable geometry and line identities.

## Check understanding (teach-back question)
If we replaced Azure Document Intelligence with AWS Textract tomorrow, what parts of the system should change, and what parts should not change, assuming ADR-0012 is implemented correctly?

