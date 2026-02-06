# Handoff-ready notes (shaping dossiers)

## Suggested lane + dossier naming
Lane: `docs/04-projects/02-features/`

Naming convention (breadboard dossiers):
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

(Example sequence, not a commitment.)

---

## Required order per shaping item
1) Brief + perimeter lock.
2) Breadboard pack.
3) Risk register.
4) Spikes (if any) + oracle pass.
5) PRD slicing after spikes, derived from the breadboard parts.

## For each shaping item, required outputs (wf-shape packet)
- `brief.md` (1–2 pager, perimeter locked)
- `breadboard-pack.md` (places/affordances/connections + parts list + rabbit holes + fit check)
- `risk-register.md` (every risk tagged Cut/Patch/Spike/Out-of-bounds)
- `spike-investigation.md` (only if any Spike items exist)
- PRD slice list (record in `brief.md` or `breadboard-pack.md`)
- One or more PRD dossiers created after spikes, each containing `prd.md` + `prd.json` (validated)

---

## Pickup / handoff boundaries (avoid context rot)
When a shaping item is complete, the handoff must include:
- Dossier path
- What’s in scope and explicitly out
- Top 3 risks and their treatments (and spike outcomes)
- PRD slice list and which slices were turned into PRD dossiers
- PRD status (`prd.json` validated y/n)
- Whether wf-plan is needed or we can go straight to wf-develop

Recommended practice:
- Start each shaping item in a fresh thread
- Run `/new` -> `pickup` with the dossier path -> then wf-shape -> then wf-plan/wf-develop
