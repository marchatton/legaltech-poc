# Handoff: 0001 Trust Substrate shaping (PRD slices)

## 1) Scope/status
- Scope: shaping dossier `docs/04-projects/02-features/0001_trust-substrate/` into a buildable packet aligned to `docs/03-architecture/*` + `docs/03-architecture/DECISIONS.md`, incorporating the RH2 overlay guidance from `tmp-oracle/`.
- Done: updated shaping artefacts: `brief.md`, `breadboard-pack.md`, `risk-register.md`, `spike-investigation.md`.
- Done: updated initiative PRD spine: `prd.md` + `prd.json`.
- Done: created thin slice PRDs under `prds/` (each with `prd.md` + `prd.json`) plus index: `prds/README.md`.
- Slice status: `0001b_pdf-viewer`: Draft (NO-GO until RH1 spike executed)
- Slice status: `0001c_citations-api-locking`: Draft (NO-GO until RH3 spike executed)
- Slice status: `0001d_citation-chip-highlight`: Draft (NO-GO until RH2 spike executed)
- Slice status: `0001e_row-status-export-failures`: Draft (NO-GO until RH4/RH5 spikes executed)
- Pending: execute spikes RH1-RH5 in `spike-investigation.md` and update GO/NO-GO decisions accordingly.
- Pending: decide next workflow step: `wf-plan` (preferred if multiple slices) vs `wf-develop` (if only doing the smallest slice first).

## 2) Working tree
- Repo: `/Users/marc/Code/personal-projects/orbital-poc`
- `git status -sb`: `## main...origin/main [ahead 1]`
- Dirty working tree (unrelated dossiers):
- Dirty: modified: `docs/04-projects/02-features/0002_quick-start-engine/tmp-handoffs/handoff_2026-02-07_01-05-12_quick-start-prd-slices.md`
- Dirty: untracked: `docs/04-projects/02-features/0003_demo-grade-outputs/tmp-handoffs/handoff_2026-02-07_01-05-10_0003-prd-dossiers.md`
- Dirty: untracked: `docs/98-tmp/oracle/oracle-bundles/oracle-bundle_next-followups_2026-02-07.md`
- Local commits not pushed: `d50f50e docs(projects): add 0002 handoff note`

## 3) Branch/PR
- Branch: `main` (ahead of `origin/main` by 1 commit)
- PR: none
- CI: not checked in this session

## 4) Running processes
- tmux: none (`tmux ls` -> no sessions)
- Dev servers: none started in this session

## 5) Tests/checks
- Not run in this session.
- Recommended next: run repo verification before/after spike work (see `./scripts/verify_repo.sh`).

## 6) Next steps
1. Start a fresh thread and run `pickup` against `docs/04-projects/02-features/0001_trust-substrate/`.
2. Execute spikes (RH1-RH5) from `spike-investigation.md` and attach evidence (screenshots + notes) into the dossier.
3. For RH2 evidence capture, prefer `browser-use` (persistent open -> state -> act -> screenshot loop); note `browser-use` CLI is not currently on PATH in this environment (`command -v browser-use` -> not found).
4. Update `risk-register.md` treatments (Cut/Patch/Spike/Out-of-bounds) based on spike outcomes and lock perimeter in `brief.md`.
5. Flip slice PRD statuses from Draft/NO-GO once risks are closed; then proceed with `wf-plan` to generate commit-ready plan(s) per slice PRD.

## 7) Risks/gotchas
- Fail-closed is non-negotiable (ADR-0002): never render “best-effort” evidence highlights when invariants fail.
- State model invariant: `missing_input` rows must use answer exactly `Not found in provided documents.` and must have zero citations.
- Canonical `snippet_hash` rule (in `docs/03-architecture/30_data_model.md`) must be implemented once and reused everywhere: `normalise()` = trim leading/trailing whitespace; convert CRLF -> LF; collapse whitespace runs to a single space.
- RH2 overlay gotchas: page numbers are 1-indexed; polygon coordinates should be treated as normalized `[0..1]` top-left, mapped via pdf.js viewport/viewBox conversion; rotation + zoom must be handled or fail closed.
- Tooling: `agent-browser` is also not on PATH in this environment (`command -v agent-browser` -> not found). Use Playwright only if it is already wired in-repo, or install `browser-use` in a non-restricted environment.
