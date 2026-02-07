# Handoff-ready notes (shaping dossiers)

## Suggested lane + dossier naming
Lane: `docs/04-projects/02-features/`

Naming convention:
- Dossiers live under `docs/04-projects/<lane>/<id>_<slug>/`.
- `<id>` is a 4-digit, sequential number within the lane.
- Don’t reserve/skip IDs; take the next available number so the folder list stays scannable.

Current feature dossiers (as of 2026-02-07):
- `0001_trust-substrate`
- `0002_quick-start-engine`
- `0003_demo-grade-outputs`
- `0004_csv-export`
- `0005_word-export`
- `0006_eval-harness`
- `0007_demo-reliability`

Example conceptual backlog (slugs only; IDs TBD):
- `trust-viewer-basics`
- `citations-click-to-highlight`
- `citation-model-and-api`
- `verification-gate`
- `failure-journeys`
- `provenance-traceability`
- `qset-and-report-schema`
- `commitment-parsing`
- `exception-instrument-matching`
- `survey-parsing`
- `title-survey-reconciliation`
- `run-orchestration`

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
