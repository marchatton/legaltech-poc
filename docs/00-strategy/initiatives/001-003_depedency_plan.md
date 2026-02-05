# Dependency graph and ordering recommendation

## Earliest demoable vertical slice (day-1 demo)
**Goal:** show the trust UX without waiting for parsing/retrieval/LLM.

**Slice:** Seeded report table + citation chips + click-to-highlight using `/layout/*.anchors.json`  
- Comes from shaping items: **1.1 + 1.2 + 1.3 (scaffolded)**  
- Data source: `/truth` + `/layout`  
- What it proves: “I can verify in 10 seconds” behaviour

### What can be scaffolded early
- Report rows can be seeded directly from `/truth/expected_*.csv`
- Citations geometry can come from `/layout/*.anchors.json`
- Verification can be simulated by injecting one intentionally bad hash to show `citation_failed`

### What must be real (even in the scaffolded demo)
- Citation object schema (doc_id, page, polygons, snippet, snippet_hash)
- Viewer page-jump and highlight overlay behaviour
- Row status badges and failure state UI (missing_input/citation_failed)

---

## Suggested build order (risk burn-down first)

1) **1.1 Matter + viewer baseline**  
2) **1.2 Click-to-highlight (anchors)**  
3) **1.3 Citations API + snippet hashing**  
4) **1.4 Verification gate (fail-closed)**  
5) **1.5 Failure journeys UX**  
6) **2.1 Question set + schema freeze**  
7) **2.6 Run orchestration skeleton** (write rows from fixtures first)  
8) **2.2 Commitment parsing**  
9) **2.3 Exception instruments matching + summaries**  
10) **2.4 Survey parsing**  
11) **2.5 Reconciliation logic**  
12) **3.1 CSV export**  
13) **3.2 Word export**  
14) **3.3 Eval harness**  
15) **3.4 Demo reliability pack**

---

## Dependencies (simple view)

- 1.1 is prerequisite for everything user-facing
- 1.2 requires 1.1
- 1.3 requires 1.1
- 1.4 requires 1.3
- 1.5 depends on 1.4 (to surface real failures)

- 2.6 (run orchestration) depends on 1.3 + 1.4 and 2.1
- 2.2/2.3/2.4/2.5 feed into 2.6’s row writes

- 3.1/3.2 depend on report rows existing (2.6) and statuses (1.4)
- 3.3 depends on stable outputs (2.x)
- 3.4 is optional but makes demo repeatable

---

## Biggest “rabbit holes” to explicitly isolate as shaping spikes
- Highlight geometry transforms (viewer overlay accuracy)
- Survey parsing reliability (text vs visual callouts)
- Exception-to-instrument matching (duplicate instrument numbers, missing exhibits)
- Verification rubric (avoiding false passes)
