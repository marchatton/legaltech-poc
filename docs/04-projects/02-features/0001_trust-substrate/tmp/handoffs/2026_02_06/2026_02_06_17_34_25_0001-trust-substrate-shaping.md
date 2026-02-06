# Handoff: 0001 Trust Substrate shaping

## 1) Scope/status
- Goal of this thread: re-run wf-shape for initiative `0001` using `docs/03-architecture/*` + initiative overview context, and delete prior `prd.md`/`prd.json` for `0001` so the packet starts with brief/breadboard/risks/spikes.
- Done:
  - Updated shaping packet docs under `docs/04-projects/02-features/0001_trust-substrate/` to align with architecture contracts (Folders API naming, state model, packs list).
  - Deleted `docs/04-projects/02-features/0001_trust-substrate/prd.md` and `docs/04-projects/02-features/0001_trust-substrate/prd.json`.
  - Created a manual “oracle render” bundle for Spike RH2 (highlight overlay transform) at:
    - `tmp/oracle-bundles/oracle_bundle_0001_trust-substrate_RH2_highlight-overlay.md`
- Pending:
  - Execute the spikes in `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (especially RH2).
  - After spikes are closed, slice PRDs per `docs/00-strategy/initiatives/prd-slicing-rules.md`.
- Blockers:
  - `npx -y @steipete/oracle --render` failed due to no npm registry network access (`ENOTFOUND registry.npmjs.org`). Use the manual paste bundle instead.

## 2) Working tree
```
## main...origin/main [ahead 8]
 M .agents/skills/00-utilities/brand-dna-extractor/SKILL.md
 M .agents/skills/00-utilities/brand-dna-extractor/assets/sample_config.json
 M .agents/skills/00-utilities/oracle/SKILL.md
 M .agents/skills/02-shape/wf-shape/SKILL.md
 M .gitignore
 M docs/02-guidelines/AGENTS.md
 M docs/03-architecture/decisions.md
 M docs/AGENTS.md
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/brand_guidelines.md
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/design_tokens.json
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/prompt_library.json
?? docs/02-guidelines/inspiration/brand-dna-2026-02-06/web-app-design-language.md
?? docs/96-engineering-tutor-learnings/
?? docs/97-throwaway/
```

## 3) Branch/PR
- Branch: `main`
- PR: none
- Local commits not pushed: `main...origin/main [ahead 8]`

Commits ahead of origin:
```
5d2271c shape(0003): re-shape packet; remove prd files
aac0a09 shape(0002): refresh packet; remove prd files
5f8c56a shape(0001): refresh packet; remove prd files
088bf39 Draft onboarding research plan
af4d61c chore: ignore .env files
57ee581 docs(agents): update engineering-tutor skill
34ac585 docs: add start-here links; prune brand-dna artefacts
0962e11 docs: add onboarding checklist
```

Relevant commit for this thread:
- `5f8c56a shape(0001): refresh packet; remove prd files`

## 4) Running processes
- No tmux sessions found (`tmux ls` returned nothing).
- No dev servers started in this thread.

## 5) Tests/checks
- No tests or typechecks run in this thread.

## 6) Next steps (ordered)
- Read the dossier:
  - `docs/04-projects/02-features/0001_trust-substrate/brief.md`
  - `docs/04-projects/02-features/0001_trust-substrate/breadboard-pack.md`
  - `docs/04-projects/02-features/0001_trust-substrate/risk-register.md`
  - `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md`
- Run Spike RH2 (highlight overlay transform). Use the manual oracle bundle to get an external review:
  - Paste `tmp/oracle-bundles/oracle_bundle_0001_trust-substrate_RH2_highlight-overlay.md` into ChatGPT Pro.
- Capture spike results back into `docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md` (add a “report” section per spike).
- Once spikes are closed (or cut/patch decided), slice thin PRDs from the breadboard parts list.

## 7) Risks/gotchas
- Highlight overlays are a classic rabbit hole (rotation, devicePixelRatio, viewport vs PDF coordinate space). Treat RH2 as a real spike with pass/fail.
- Make sure pack references use the canonical names from `docs/08-example-data/packs_summary.md` (not older names).
- Store bundles/handoffs under the dossier `tmp/` so they are committed (avoid `throwaway/`).
- Repo is currently ahead of `origin/main` and working tree is dirty with many unrelated doc/skill changes; be deliberate about staging/committing.
