# Handoff: Initiative 002 shaping packet refresh

Time: 2026-02-06 17:34:56 (local)

## 1) Scope/status
- Goal: Re-run `wf-shape` for Initiative 002 ("Quick Start Engine") using `docs/03-architecture/*` + strategy docs, and remove `prd.md`/`prd.json` until brief/breadboard/risks/spikes are ready.
- Done:
  - Updated shaping packet under `docs/04-projects/02-features/0002_quick-start-engine/`:
    - `brief.md`
    - `breadboard-pack.md`
    - `risk-register.md`
    - `spike-investigation.md`
  - Corrected acceptance pack names to match `docs/08-example-data/packs_summary.md`.
  - Deleted `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md` and `prd.json`.
  - Commit created: `aac0a09` ("shape(0002): refresh packet; remove prd files").
- Pending:
  - Run the spikes in `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md` and fill the report stubs.
  - After each spike: run an Oracle pass (per `wf-shape` expectations) and update the shaping docs.
- Blockers: none.

## 2) Working tree
`git status -sb`:
```text
## main...origin/main [ahead 8]
 M .agents/skills/00-utilities/brand-dna-extractor/SKILL.md
 M .agents/skills/00-utilities/brand-dna-extractor/assets/sample_config.json
 M .agents/skills/00-utilities/oracle/SKILL.md
 M .agents/skills/02-shape/wf-shape/SKILL.md
 M .gitignore
 M docs/03-architecture/DECISIONS.md
 M docs/AGENTS.md
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/brand_guidelines.md
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/design_tokens.json
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/prompt_library.json
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/web-app-design-language.md
?? docs/96-engineering-tutor-learnings/
?? docs/97-throwaway/
```

Local commits not pushed:
```text
5d2271c (HEAD -> main) shape(0003): re-shape packet; remove prd files
aac0a09 shape(0002): refresh packet; remove prd files
5f8c56a shape(0001): refresh packet; remove prd files
088bf39 Draft onboarding research plan
af4d61c chore: ignore .env files
57ee581 docs(agents): update engineering-tutor skill
34ac585 docs: add start-here links; prune brand-dna artefacts
0962e11 docs: add onboarding checklist
```

## 3) Branch/PR
- Branch: `main` (ahead of `origin/main` by 8 commits).
- PR: none.
- CI: not checked.

## 4) Running processes
- tmux: none (`tmux ls` returned "no tmux sessions").

## 5) Tests/checks
- Not run in this thread: unit tests, typecheck, lint, or `scripts/verify.sh`.

## 6) Next steps
1. Start a fresh thread and run `pickup` for dossier: `docs/04-projects/02-features/0002_quick-start-engine/`.
2. Run spikes in order (suggested): SP-2.7 payload representation -> SP-2.2 parsing -> SP-2.3 matching -> SP-2.4 survey -> SP-2.5 reconciliation -> SP-2.6 idempotency -> SP-2.1 practitioner review.
3. After each spike, fill the report stub and update `brief.md` / `breadboard-pack.md` / `risk-register.md`.
4. If you want an Oracle "manual paste" bundle for ChatGPT Pro:
  - Oracle CLI render (ready to paste): `docs/04-projects/02-features/0002_quick-start-engine/tmp-oracle/oracle-bundle_0002_quick-start-engine_wf-shape_2026-02-06_oracle-cli.md`
  - Manual fallback: `docs/04-projects/02-features/0002_quick-start-engine/tmp-oracle/oracle-bundle_0002_quick-start-engine_wf-shape_2026-02-06.md`
5. Once GO criteria in `brief.md` are met, proceed to `wf-plan` (or create PRDs if explicitly desired).

## 7) Risks/gotchas
- The repo is not clean and `main` has multiple local commits ahead of `origin/main`; be careful not to accidentally commit unrelated doc/skill changes when continuing work.
- Initiative 002 depends on Initiative 001 trust substrate primitives (citation locking, fail-closed verification, viewer jump-to-evidence); don't weaken those contracts to "make progress".
- "unknown" is an item-level classification inside list-shaped payloads; do not invent new report-row statuses (must stay aligned with `docs/03-architecture/20_state_model.md`).
