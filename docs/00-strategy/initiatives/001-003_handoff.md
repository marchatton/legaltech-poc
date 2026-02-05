# Handoff-ready notes (shaping dossiers)

## Suggested lane + dossier naming
Lane: `docs/04-projects/cre-copilot/`

Naming convention:
- `0001_trust-viewer-basics`
- `0002_citations-click-to-highlight`
- `0003_citation-model-and-api`
- `0004_verification-gate`
- `0005_failure-journeys`
- `0006_provenance-traceability`
- `0007_qset-and-report-schema`
- `0008_commitment-parsing`
- `0009_exception-instrument-matching`
- `0010_survey-parsing`
- `0011_title-survey-reconciliation`
- `0012_run-orchestration`
- `0013_csv-export`
- `0014_word-export`
- `0015_eval-harness`
- `0016_demo-reliability`

(That’s an example sequence, not a commitment.)

---

## For each shaping item, required outputs (wf-shape packet)
Each shaping item should create:
- `brief.md` (1–2 pager, perimeter locked)
- `prd.md` (user stories + measurable acceptance criteria)
- `prd.json` (recommended, validated)  
- `breadboard-pack.md` (places/affordances/connections + parts list + rabbit holes + fit check)
- `risk-register.md` (every risk tagged Cut/Patch/Spike/Out-of-bounds)
- `spike-investigation.md` (only if any Spike items exist)

---

## Pickup / handoff boundaries (avoid context rot)
When a shaping item is complete, the handoff must include:
- dossier path
- what’s in scope and explicitly out
- top 3 risks and their treatments (and spike outcomes)
- PRD status (`prd.json` validated y/n)
- whether wf-plan is needed or we can go straight to wf-develop

Recommended practice:
- start each shaping item in a fresh thread
- run `/new` → `pickup` with the dossier path → then wf-shape → then wf-plan/wf-develop
