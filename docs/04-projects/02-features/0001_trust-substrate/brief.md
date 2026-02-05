# Brief: Trust substrate (initiative 1)

## Problem / why now
We need a trustworthy evidence layer before any AI or reporting can be credible. Today there is no reliable way to create matters, view documents, attach citations, or verify evidence. This initiative establishes the baseline surface area (matter + viewer) and the trust mechanics (citations, verification, failure UX, provenance) that everything else will snap onto.

## Goals
- Users can create a matter, upload PDFs, and view them reliably.
- Citations are first-class objects that link rows to document evidence.
- Clicking a citation opens the correct doc/page and shows a highlight + snippet.
- Row verification is fail-closed and blocks export when citations fail.
- Failure states are explicit and actionable.
- Provenance is captured so we can answer “why did this row exist?”.

## Non-goals
- Auth/RBAC, integrations, sharing.
- Retrieval, generation, or “Quick Start” runs.
- Full OCR pipeline or advanced extraction beyond anchor scaffolding.
- Legal/materiality judgement.
- Monitoring dashboards.

## In scope (perimeter)
- 1.1 Matter + document viewer baseline (upload, list, view PDFs).
- 1.2 Citation chips -> click-to-highlight via `/layout/*.anchors.json` scaffolding.
- 1.3 Canonical citation data model + citations API.
- 1.4 Verification gate + row status transitions + export gate.
- 1.5 Failure journeys UX (missing docs, OCR quality warning, citation mismatch).
- 1.6 Minimal provenance/trace export.

## Out of scope (explicit)
- OCR geometry extraction (beyond anchor JSON).
- External web research or third-party data sourcing.
- Advanced analytics or audit UI beyond a basic trace export endpoint.

## Success (done means)
- Matter creation + uploads are reliable; viewer supports page navigation.
- Citation chips open the correct doc/page and highlight the cited region.
- Citations are stored as IDs with a canonical snippet + hash.
- Verifier passes known-good and fails known-bad rows, blocking export by default.
- Failure states show actionable UI with structured logs.
- Provenance includes model + prompt versions + retrieved chunk IDs.

## Constraints / dependencies
- Seed packs in `docs/08-example-data` (e.g., `pack_01_clean`, `pack_02_missing_rea`, `pack_06_noisy_scans_rotated_page`).
- Anchor scaffolding in `/layout/*.anchors.json`.
- Target web app (Next.js) but current app surface is minimal.

## Risks / unknowns (with treatment)
| Risk | Why it matters | Treatment |
|---|---|---|
| PDF viewer performance on noisy scans | Could make baseline unusable | Patch (pdf.js) + Spike on worst-case scan |
| Coordinate transforms for highlights | Classic rabbit hole | Spike (multi-zoom alignment) |
| Snippet canonicalisation + hash stability | Breaks verification + idempotency | Spike |
| Verifier strictness (false passes) | Trust break | Spike (calibration set) |
| Missing doc detection heuristics | False alarms or missed gaps | Spike |
| PII/log volume in provenance | Compliance risk | Patch (redaction + minimal schema) |

## Open questions
- What is the appetite/timebox for the full initiative and for each sub-initiative?
- Should we build a minimal “matter list” or go straight to a single matter detail?
- Which storage path is preferred (signed URLs vs proxy)?
- Which model(s) are allowed for verification and what is the latency budget?
- What is the minimum trace schema required by compliance?

## PRD seams
Each sub-initiative can be broken into 2–6 PRDs. This dossier captures the umbrella PRD plus seam recommendations so we can spin out per-sub-initiative PRDs when planning.

## Shaping decision (GO/NO-GO)
NO-GO until spikes are executed and reviewed (oracle pass) for the identified rabbit holes.
