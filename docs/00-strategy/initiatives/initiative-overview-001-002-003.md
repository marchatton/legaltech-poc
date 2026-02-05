# Initiative map — Orbital Copilot PoC (US CRE Title + Survey Quick Start)

## Assumptions used for this breakdown (can be changed later)
- **Export target:** Title & Survey memo (not objection/cure letter)
- **OCR approach:** OCR everything (consistent geometry)
- **Verification strictness:** Conservative fail-closed
- **Audience:** internal demo + 1 friendly practitioner
- **Timebox:** 2-week PoC mindset (but shaping items are still independent)

## Initiatives
- 001: Trust substrate (citations, viewer, verification, failure states)
- 002: Quick Start engine (Title Commitment + Exception instruments + Survey → 3 artefacts)
- 003: Demo-grade outputs and repeatability (exports, eval harness, regression safety)

# Initiative map — Orbital Copilot PoC (US CRE Title + Survey Quick Start)

## Assumptions used for this breakdown (can be changed later)
- **Export target:** Title & Survey memo (not objection/cure letter)
- **OCR approach:** OCR everything (consistent geometry)
- **Verification strictness:** Conservative fail-closed
- **Audience:** internal demo + 1 friendly practitioner
- **Timebox:** 2-week PoC mindset (but shaping items are still independent)

---

## Initiative 1: Trust substrate (citations, viewer, verification, failure states)

**Objective**  
Deliver the “trust moment” end-to-end: citation chips that jump to highlighted evidence in a PDF viewer, with strict “cite-or-not-found” behaviour and row-level failure states.

**Why it’s coherent**  
This is one tight user promise. If it fails, everything else is noise. Grouping UI + data model + verification here prevents the classic failure mode of building content generation before trust.

**Key dependencies**  
- Minimal “matter” container (folder) + document storage + doc viewer
- Basic persistence for citations and rows (can be lightweight in PoC)

**Primary risks it burns down**  
- Citation correctness (and how we fail)
- Geometry/highlighting reliability (even on ugly PDFs)
- “Not found” and missing-doc journeys actually being usable

---

## Initiative 2: Quick Start engine (Title Commitment + Exception instruments + Survey → 3 artefacts)

**Objective**  
Implement the deterministic-ish pipeline that turns a pack into:
1) B-I Requirements tracker  
2) B-II Exceptions table linked to instruments  
3) Survey reconciliation issues list  
All outputs are evidence-backed and written into the report table.

**Why it’s coherent**  
It’s the core product wedge. And it’s mostly “workflow logic” that can be iterated independently once trust substrate exists.

**Key dependencies**  
- Trust substrate (Initiative 1) for citations, verification, viewer
- Pack ingestion/indexing and retrieval primitives (can start scaffolded)

**Primary risks it burns down**  
- Commitment parsing robustness (Schedule A/B-I/B-II structure varies)
- Linking exceptions → instruments (recording refs and exhibit chase)
- Survey extraction and reconciliation is messy and easy to over-promise

---

## Initiative 3: Demo-grade outputs and repeatability (exports, eval harness, regression safety)

**Objective**  
Make the PoC demoable and testable: exports (CSV + Word), golden-set driven evals, and “demo reliability” controls.

**Why it’s coherent**  
These are finishing moves that protect against context rot and brittle demos. They should not contaminate core workflow logic, but they are essential for confidence.

**Key dependencies**  
- Initiative 1 and 2 outputs exist (rows + citations + statuses)

**Primary risks it burns down**  
- “It works on my laptop” syndrome
- Regression in citations/retrieval that no-one notices until demo day
- Export producing unusable junk that lawyers reject instantly
