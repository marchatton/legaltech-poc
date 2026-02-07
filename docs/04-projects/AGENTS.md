# Projects (dossiers) + delivery

This folder tracks work items once implementation begins.

## Dossier conventions
- Work items live under `docs/04-projects/<lane>/<id>_<slug>/`.
- Within each work item:
  - PRDs (handoff between shaping, planning and development):
    - Single-PRD dossier:
      - `prd.md`
      - `prd.json`
    - Multi-PRD dossier:
      - Overall / spine PRD at the dossier root:
        - `prd-overall.md` (H1 should be explicit, e.g. `PRD (Overall): ...`)
        - `prd-overall.json`
      - Slice PRDs under `prds/` (lowest-level PRDs):
        - `prds/<slice_id>_<slug>/prd.md`
        - `prds/<slice_id>_<slug>/prd.json`
        - Lowest-level PRD filenames are always `prd.md` / `prd.json` (no `prd-slice` filenames).
  - Optional subfolders (use when helpful):
    - `prds/`: slice PRDs for the dossier (folder-per-slice, each containing `prd.md` + `prd.json`).
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
