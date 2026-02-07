# Dependency graph and ordering recommendation

## Process rule
Breadboard + risk register + spikes come before PRDs. Each breadboard yields one or more PRDs after spikes are resolved.

## Earliest demoable vertical slice (day-1 demo)
Goal: show the trust UX without waiting for parsing/retrieval/LLM.

Slice: seeded report table + citation chips + click-to-highlight using `/layout/*.anchors.json`.
- Comes from shaping items: 1.1 + 1.2 + 1.3 (scaffolded).
- Data source: `/truth` + `/layout`.
- What it proves: “I can verify in 10 seconds” behaviour.

Note: Do not PRD-slice this demo until the breadboards for 1.1–1.3 are complete and the highlight + snippet hashing spikes are resolved.

## Suggested shaping order (breadboards + spikes)
1) 1.1 Matter + viewer baseline
2) 1.2 Click-to-highlight (anchors)
3) 1.3 Citations API + snippet hashing
4) 1.4 Verification gate (fail-closed)
5) 1.5 Failure journeys UX
6) 1.6 Provenance + traceability
7) 2.1 Question set + schema freeze
8) 2.6 Run orchestration skeleton (rows from fixtures)
9) 2.2 Commitment parsing
10) 2.3 Exception instruments matching + summaries
11) 2.4 Survey parsing
12) 2.5 Reconciliation logic
13) 3.1 CSV export
14) 3.2 Word export
15) 3.3 Eval harness
16) 3.4 Demo reliability pack

## Suggested PRD creation order (after shaping)
1) Viewer baseline PRDs (matter CRUD, upload, doc list, viewer)
2) Citation chips + highlight overlay PRDs
3) Citation model + API PRDs (schema, fetch API, snippet hashing)
4) Verification gate PRDs (status machine, checks, entailment)
5) Failure journeys PRDs (missing docs, quality warnings, flag action)
6) Provenance PRDs (trace schema, export endpoint)
7) Initiative 2 PRDs (qset, parsing, reconciliation, orchestration)
8) Initiative 3 PRDs (exports, eval harness, demo reliability)

## Dependencies (simple view)
- 1.1 is prerequisite for everything user-facing.
- 1.2 requires 1.1.
- 1.3 requires 1.1.
- 1.4 requires 1.3.
- 1.5 depends on 1.4 (to surface real failures).
- 2.6 (run orchestration) depends on 1.3 + 1.4 and 2.1.
- 2.2/2.3/2.4/2.5 feed into 2.6’s row writes.
- 3.1/3.2 depend on report rows existing (2.6) and statuses (1.4).
- 3.3 depends on stable outputs (2.x).
- 3.4 is optional but makes demo repeatable.

## Biggest rabbit holes to isolate as shaping spikes
- Highlight geometry transforms (viewer overlay accuracy).
- Survey parsing reliability (text vs visual callouts).
- Exception-to-instrument matching (duplicate instrument numbers, missing exhibits).
- Verification rubric (avoiding false passes).
