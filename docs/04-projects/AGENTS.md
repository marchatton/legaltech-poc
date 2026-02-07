# Projects (dossiers) + delivery

This folder tracks work items once implementation begins.

## Dossier conventions
- Work items live under `docs/04-projects/<lane>/<id>_<slug>/`.
- Within each work item:
  - `prd.md` and `prd.json`, which form handoff between shaping, planning and development.
    - `prd.md` is the dossier’s spine PRD. If the dossier also has slice PRDs, make the spine explicit in the H1 (e.g. `PRD (Spine): ...`).
  - Optional subfolders (use when helpful):
    - `prds/`: slice PRDs for the dossier (keep the spine PRD at the dossier root).
    - `specs/`: pinned contracts/spec artefacts referenced across PRDs/spikes (schemas, policies, question sets, comparator specs, UX copy).
    - `spike-proofs/`: committed spike evidence (JSON diffs, screenshots, short decisions). Link from `spike-investigation.md` and close items in `risk-register.md`.
  - Reviews for a work item live inside the dossier (e.g. `reviews/`).
  - Store oracle bundles + handoff notes in git-tracked dossier tmp folders (synced to GitHub):
    - `tmp-oracle/`
    - `tmp-handoffs/`
  - Store local-only scratch in the dossier’s `throwaway/` folder (gitignored; not synced).
  - Store other tmp files in `tmp/` folder (synced to GitHub).
  - If using file-based todos, store them in the dossier’s `todos/` folder.

## Workflow defaults
- Keep PRs small; one concern per PR.
- Bugs / behaviour changes: add a failing test (or repro) first, then fix to green.
- KISS / YAGNI: ship what the requirement needs, no speculative scaffolding.
- DRY only when it’s real reuse: shared logic belongs in `packages/*` (or shared components).

## Templates
- Treat `docs/04-projects/_templates/` as legacy reference.
- Prefer scaffolding/templates embedded in skills and workflows over copying from `_templates`.
