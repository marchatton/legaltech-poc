# Handoff — Initiative 003 wf-shape refresh

1) Scope/status
- Updated initiative 003 dossier in `docs/04-projects/02-features/0003_demo-grade-outputs` per wf-shape (breadboard/risk/spikes before PRDs).
- Applied decisions: memo template, exclude `citation_failed` rows with warning, demo mode dev-only/feature-flagged.
- Spikes are planned only (CSV usability, minimal eval metrics); oracle pass pending.

2) Working tree
- `git status -sb`:
  - `## main...origin/main [ahead 1]`
  - Modified: `docs/00-strategy/initiatives/001-003_dependency_plan.md`, `docs/00-strategy/initiatives/001-003_handoff.md`, `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`, `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
  - Added (untracked): `docs/00-strategy/initiatives/prd-slicing-rules.md`, `docs/04-projects/02-features/0003_demo-grade-outputs/prd.md`, `docs/04-projects/02-features/0003_demo-grade-outputs/prd.json`, `docs/04-projects/02-features/0003_demo-grade-outputs/risk-register.md`, `docs/04-projects/02-features/0003_demo-grade-outputs/spike-investigation.md`
  - Note: existing untracked/added files in `docs/04-projects/02-features/0002_quick-start-engine/` pre-existed; not modified here.

3) Branch/PR
- Branch: `main` (ahead 1).
- PR: none.
- CI: not run.

4) Running processes
- None.

5) Tests/checks
- `prd.json` validated against `docs/04-projects/_templates/json-prd.schema.json` via python jsonschema (PASS).
- No other tests run.

6) Next steps
- Run the two planned spikes and capture outcomes in `spike-investigation.md`.
- If spikes resolve, update breadboard/PRD fit check and mark GO/NO-GO.
- Decide export artifact storage location (download-only vs stored list).

7) Risks/gotchas
- Spikes not executed yet; oracle pass pending per spike.
- Demo reset safety is a patch, not yet proven by spike.
