# Project Brief (1-2 pager)

**Quick Start Engine (Initiative 002)**

- One-line description: Deterministic pipeline that turns a Title commitment + Survey into Requirements, Exceptions, and Reconciliation artefacts with citations.
- Team:
- Contributors:
- Resources:
- Status: Draft
- Last updated: 2026-02-05

---

## Problem alignment

**Problem (1-2 sentences):**
We do not have a deterministic, testable path from Title + Survey documents to a first-pass report. Manual analysis is slow, inconsistent, and hard to validate against truth data.

**Why it matters (customers + business):**
A fast, reliable first pass reduces time-to-value for practitioners and creates a repeatable pipeline for the product to build on.

**Evidence:**
- Initiative 002 defines target packs and truth tables.
- Specific packs and CSVs provide concrete acceptance anchors.

**Success looks like:**
- A Quick Start run produces stable, citation-backed rows for the target packs.
- Users can see run progress and know when a row needs review vs is stable.

---

## High level approach

Shape each sub-initiative (2.1–2.6) into a breadboard, identify rabbit holes, plan spikes, then derive thin PRD slices from each breadboard. Build a deterministic step machine that routes docs, extracts facts, and upserts rows with citations and statuses.

---

## Narrative (optional)

- Common case: Clean commitment + survey yields requirements/exceptions and reconciliation issues with citations.
- Edge case: Duplicate instrument numbers or missing exhibits surface as "needs_review" without crashing.
- Failure case: Noisy scans still yield partial extraction and "unknown" states instead of wrong assertions.

---

## Goals

1. Deterministic, testable outputs for the target packs.
2. Evidence-backed rows with status, confidence, and citations.
3. Incremental run experience with visible step progress.

## Non-goals

- Freeform chat or open-ended research.
- Legal strategy recommendations.
- Universal coverage of all title formats.
- Geometric/visual overlay of easement corridors.

---

## Solution alignment

### Draw the perimeter (required)

**In scope:**
- Fixed question set (v1) with stable row schema.
- Commitment parsing for Schedule A / B-I / B-II on target packs.
- Exception-to-instrument matching with ambiguity flags.
- Survey extraction focused on text callouts and certifications.
- Title ↔ survey reconciliation with "unknown" state.
- Deterministic run orchestration with incremental row upserts.

**Out of scope (de-scope / cuts):**
- Web research agents or external browsing.
- Materiality or strategy decisions (cure/endorse/accept).
- Full support for all title company formats.
- Visual/geometry interpretation of surveys.

### Key features (plan of record)

- 2.1 Question set v1 + schema freeze
- 2.2 Commitment parsing (Schedule A / B-I / B-II)
- 2.3 Exception → instrument matching + summary extraction
- 2.4 Survey parsing with citations
- 2.5 Title ↔ survey reconciliation
- 2.6 Run orchestration + incremental UI updates

### Future considerations (later)

- Broader format support and more packs
- Deeper semantic interpretation and legal guidance
- Enhanced survey visual parsing

---

## Key flows

- Link: `breadboard-pack.md`
- Quick Start run initiation -> step progress -> row table -> row drawer with citations

---

## Key logic

- Every row has status and confidence; uncertainty surfaces as "needs_review" or "unknown".
- Citations are required for extracted assertions.
- Idempotent writes keyed by `question_id` to support safe retries.

---

## Risks + unknowns (top 10)

Link: `risk-register.md`

- Question set alignment with practitioner expectations
- Parser robustness on noisy scans
- Exception → instrument matching ambiguity
- Survey extraction signal quality
- Reconciliation false positives vs "unknown"
- Idempotent run restarts
- UI performance with incremental updates
- Schema stability vs future PRD seams

---

## Open questions (top 10)

- Appetite/timebox for initiative 002 and for each PRD slice
- Any acceptance packs beyond those named
- Definition of "key fields" for truth matching
- UI placement and ownership for Quick Start flows
- Confidence computation method for v1
- Snippet hash strategy for idempotency

---

## Review alignment

| Reviewer | Team/Role | Status |
|---|---|---|
|  |  |  |
|  |  |  |

---

## Shaping decision

- Decision: NO-GO (pending spikes + Oracle passes)
- Why: Multiple rabbit holes remain unproven across parsing, matching, survey extraction, and idempotency.
- Next step (if GO): wf-plan on this dossier after spikes and Oracle notes are complete.
