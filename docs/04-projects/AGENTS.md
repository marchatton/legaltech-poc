# Projects (dossiers) + delivery

This folder tracks work items once implementation begins.

## Dossier conventions
- Work items live under `docs/04-projects/<lane>/<id>_<slug>/`.
- Within each work item:
  - `prd.md` and `prd.json`, which form handoff between shaping, planning and development.
  - Reviews for a work item live inside the dossier (e.g. `reviews/`).
  - Store once off files in `throwaway/` folder (not synced to Github) such as `oracle` skill bundles.
  - Store tmp files in `tmp/` folder (synced to Github)
  - If using file-based todos, store them in the dossier’s `todos/` folder.

## Workflow defaults
- Keep PRs small; one concern per PR.
- Bugs / behaviour changes: add a failing test (or repro) first, then fix to green.
- KISS / YAGNI: ship what the requirement needs, no speculative scaffolding.
- DRY only when it’s real reuse: shared logic belongs in `packages/*` (or shared components).
