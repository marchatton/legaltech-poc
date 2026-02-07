# Initiative 1: Trust substrate (citations, viewer, verification, failure states)

## 1.1 Matter + document viewer baseline (no AI, no highlights yet)
**Scope (1–2 sentences)**  
Create a matter (folder) and upload/view PDFs reliably. This is the baseline surface area everything else snaps onto.

**Done means (acceptance criteria)**  
- User can create a matter and upload the PDFs from `pack_01_clean/docs/`.  
- Document list shows processing state (even if it is “uploaded” only).  
- PDF viewer renders any uploaded PDF and supports page navigation.

**Cut-lines / de-scopes**  
- No citations, no highlights, no extraction, no Quick Start run.
- No auth/RBAC, no integrations.

**Risks/unknowns and treatment**  
- Viewer performance on big PDFs: **Patch** (use pdf.js, keep it boring).  
- Storage access patterns (signed URLs vs proxy): **Patch**.  

**Suggested spikes**  
- “Can we render and jump pages reliably on `pack_07_scans_rotated_low_quality/docs/TitleCommitment_SCANNED_ROTATED.pdf` without UI freezing?” Pass if navigation is <1s per jump on dev machine.

**Natural PRD seams (2–6 PRDs)**  
1) PRD: Matter CRUD + empty state UI  
2) PRD: Direct-to-storage upload flow + progress  
3) PRD: Document list + basic statuses  
4) PRD: PDF viewer component (page nav, zoom)

---

## 1.2 Citation chips → click-to-highlight (scaffolded via `/layout/*.anchors.json`)
**Scope**  
Make citation chips real in the UI: clicking a citation opens the right doc/page and overlays the highlight polygon. Use the provided `/layout` anchors as scaffolding.

**Done means**  
- In `pack_01_clean`, selecting a seeded row with citations shows citation chips.  
- Clicking a chip opens the target PDF and highlights the cited region (using anchors).  
- Viewer shows snippet text and snippet hash next to the highlight.

**Cut-lines / de-scopes**  
- No OCR geometry yet. We use anchor JSON.  
- No LLM, no retrieval. Seed citations from test fixtures.

**Risks/unknowns and treatment**  
- Coordinate transforms between PDF space and viewport: **Spike** (this is a classic rabbit hole).  
- Anchor naming consistency across packs: **Patch** (standardise manifest mapping).

**Suggested spikes**  
- “Can we map anchor bbox to highlight overlay correctly across zoom levels?” Pass if highlight still aligns at 50%, 100%, 150% zoom on one commitment PDF and one survey PDF.

**Natural PRD seams**  
1) PRD: Citation chip UI component + interaction states  
2) PRD: Viewer jump-to-page API (from citation payload)  
3) PRD: Highlight overlay layer (bbox/polygon rendering)  
4) PRD: Fixture loader to seed rows + citations from `/truth` + `/layout`

---

## 1.3 Citation data model + citations API (authoritative snippets + hashes)
**Scope**  
Introduce a canonical citation object: doc_id + page + geometry + snippet + snippet_hash. Expose via an API used by the viewer and report table.

**Done means**  
- Report row stores citations as IDs (not free text).  
- `GET /citations/:id` returns `{document_id, page_number, polygons, snippet, snippet_hash}`.  
- Viewer uses only this API for evidence display.

**Cut-lines / de-scopes**  
- No entailment verification yet (that’s 1.4).  
- Geometry can still be from anchors for now.

**Risks/unknowns and treatment**  
- Snippet canonicalisation (exact substring vs line-join): **Spike** (hash mismatch risk).  
- Keeping citations stable across re-ingestion: **Patch** (store snippet_hash and anchor_id).

**Suggested spikes**  
- “What is the canonical snippet representation?” Pass if snippet hashes remain stable when reprocessing the same PDF twice (idempotency).

**Natural PRD seams**  
1) PRD: DB schema for report_rows + citations + documents  
2) PRD: Citations API (fetch by ID)  
3) PRD: Snippet hashing util + canonicalisation rules  
4) PRD: Viewer evidence sidebar (snippet + hash + ‘copy snippet’)

---

## 1.4 Verification gate (fail-closed) + row status transitions
**Scope**  
Implement row-level verification so the system can only mark rows `needs_review` if citations pass. Otherwise it must set `citation_failed` or `missing_input`.

**Done means**  
- For a known-good seeded row in `pack_01_clean`, verifier passes and row becomes `needs_review`.  
- For a known-bad row (inject a mismatching snippet hash), verifier fails and row becomes `citation_failed`.  
- UI surfaces “citation check failed” and blocks export by default (with override toggle if we choose).

**Cut-lines / de-scopes**  
- Not implementing “materiality” or legal judgement. This is purely “does evidence support the statement”.  
- No external web research.

**Risks/unknowns and treatment**  
- Over-strict vs under-strict entailment: **Spike** (tune rubric).  
- Latency/cost if verifier uses a large model: **Patch** (route to stronger model only for verification).

**Suggested spikes**  
- “Can we get verifier precision high enough to avoid false passes?” Pass if 0 false passes on 20 hand-curated bad examples across packs.

**Natural PRD seams**  
1) PRD: Row status state machine + UI badges  
2) PRD: Code-based checks (page exists, hash match, bbox exists)  
3) PRD: LLM entailment verifier prompt + structured verdict  
4) PRD: Export gate behaviour (block on citation_failed; override UX)

---

## 1.5 Failure journeys as first-class UX (missing docs, OCR quality, retrieval miss, citation mismatch)
**Scope**  
Make failures explicit and actionable. Users should see what’s missing and what to do next, not a silent blank.

**Done means**  
- `pack_02_missing_rea` produces rows tagged `missing_input` with a clear “missing referenced docs” list.  
- `pack_07_scans_rotated_low_quality` surfaces extraction/OCR quality warnings at doc level (even if simulated early).  
- Citation mismatch shows a visible error and a user action: “flag citation wrong”.

**Cut-lines / de-scopes**  
- Not building a full monitoring dashboard. Just visible UX + structured logs.

**Risks/unknowns and treatment**  
- Users ignoring warnings if too noisy: **Patch** (limit to top actionable warnings).  
- False attribution of “missing” due to matching bugs: **Spike** (doc matching heuristics).

**Suggested spikes**  
- “Can we reliably detect ‘referenced but missing’ docs from commitment exceptions?” Pass if it works on `pack_02_missing_rea` and doesn’t false-flag on `pack_01_clean`.

**Natural PRD seams**  
1) PRD: Missing-doc checklist component (per matter + per row)  
2) PRD: Doc quality indicator (extraction_quality placeholder now, real later)  
3) PRD: ‘Flag citation wrong’ action + capture feedback  
4) PRD: Failure taxonomy logging (enum + structured logs)

---

## 1.6 Provenance and traceability (minimum viable audit trail)
**Scope**  
Capture provenance that allows you to answer “what produced this row”. Keep it minimal but real.

**Done means**  
- Every run and row stores `agent_bundle_version` (prompt versions, retrieval pipeline version).  
- Store model + prompt version + retrieved chunk IDs for each row generation.  
- Ability to export a “run trace” JSON for a single run.

**Cut-lines / de-scopes**  
- No fancy UI for traces. It can be a developer-facing endpoint or admin panel stub.

**Risks/unknowns and treatment**  
- Log volume and PII concerns: **Patch** (redact; store minimal).  
- Incomplete trace makes it useless: **Patch** (define a required schema).

**Suggested spikes**  
- “What’s the minimum trace that still answers ‘why’?” Pass if a stranger can debug one citation_failed row using only stored trace.

**Natural PRD seams**  
1) PRD: Provenance schema + version stamping  
2) PRD: Store LLM calls metadata (cost, latency, model, prompt hash)  
3) PRD: Trace export endpoint (per run)  
4) PRD: Minimal run-step progress model (plan/retrieve/draft/verify/write)

---
