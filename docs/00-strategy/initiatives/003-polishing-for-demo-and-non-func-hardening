# Initiative 3: Demo-grade outputs and repeatability (exports, eval harness, regression safety)

## 3.1 Export CSVs for 3 artefacts (requirements, exceptions, survey issues)
**Scope**
Export the report data into lawyer-friendly CSVs that mirror how teams actually work.

**Done means**
- One click exports:
  - `requirements_tracker.csv`
  - `exceptions_table.csv`
  - `survey_issues.csv`
- Exports include citation references (doc name + page) and row status.

**Cut-lines / de-scopes**
- No Excel formatting beyond CSV.
- No “closing checklist” export.

**Risks/unknowns and treatment**
- Exports missing fields lawyers expect: **Spike** (quick practitioner check).

**Suggested spikes**
- “Is CSV export format usable?” Pass if a paralegal says “yes, I can paste this into our tracker”.

**Natural PRD seams**
1) PRD: CSV export endpoint (per artefact)
2) PRD: Column mapping and stable ordering
3) PRD: Export includes citations and statuses

---

## 3.2 Word export (choose 1 template: memo OR objection/cure letter)
**Scope**
Generate one Word artefact from the report table using a single fixed template.

**Done means**
- Export produces a .docx with:
  - deal snapshot (from Schedule A fields if available)
  - requirements section (B-I)
  - exceptions table (B-II summaries + citations)
  - survey issues section
- For rows with `citation_failed`, template either excludes or includes with warning, depending on gate choice.

**Cut-lines / de-scopes**
- No per-firm template customisation.
- No “tone of voice” tuning.

**Risks/unknowns and treatment**
- Word formatting fragility: **Patch** (keep template simple).
- Template choice impacts product story: **Spike** (pick memo vs objection letter).

**Suggested spikes**
- “Which Word artefact is more compelling for the demo audience?” Pass if stakeholder chooses in 15 minutes.

**Natural PRD seams**
1) PRD: Template selection and storage
2) PRD: Docx generation service (from report rows)
3) PRD: Export UI + artefacts list + download link

---

## 3.3 Golden-set eval harness (regression safety on /truth)
**Scope**
Create a lightweight evaluation harness that compares produced outputs to `/truth` and tracks key quality metrics.

**Done means**
- For each pack, run a script that outputs:
  - coverage: % requirements and exceptions rows present
  - citation validity rate
  - missing_input correctness rate (especially pack_02)
- CI gate can be “soft” for PoC (report only) but must exist.

**Cut-lines / de-scopes**
- No elaborate scoring model. Keep it tight: schema + counts + citation checks.

**Risks/unknowns and treatment**
- Eval becomes a time sink: **Cut** (only 3–5 metrics).
- False confidence from shallow metrics: **Patch** (include negative tests).

**Suggested spikes**
- “What minimal metrics predict demo success?” Pass if metrics correlate with 1 practitioner review of 1 pack.

**Natural PRD seams**
1) PRD: Eval runner script (per pack)
2) PRD: Citation validity checker (hash + page + bbox existence)
3) PRD: CI integration (report artefact)

---

## 3.4 Demo reliability pack (guided demo flow + pack selector + reset)
**Scope**
Make it easy to run the same demo twice without fiddling.

**Done means**
- A “Demo mode” can:
  - load `pack_01_clean` and run Quick Start
  - load `pack_02_missing_rea` and show missing-doc flow
  - reset the environment (delete matter) safely
- Demo script checklist exists (human steps).

**Cut-lines / de-scopes**
- Not a full onboarding wizard. This is for demo repeatability.

**Risks/unknowns and treatment**
- Reset/delete risk: **Patch** (guard rails, only demo matters).
- “Demo mode” pollutes product: **Patch** (feature flag).

**Suggested spikes**
- “Do we actually need demo mode?” Pass if we cannot reliably demo twice in a row without it.

**Natural PRD seams**
1) PRD: Pack selector UI (loads from local fixtures)
2) PRD: Environment reset tool (dev only)
3) PRD: Guided demo checklist markdown in repo
