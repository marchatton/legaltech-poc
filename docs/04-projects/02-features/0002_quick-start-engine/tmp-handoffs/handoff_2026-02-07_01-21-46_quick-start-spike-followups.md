# Handoff: 0002 Quick Start Engine Spike Followups

Time: 2026-02-07 01:21:46 (local)

## 1) Scope/status
- Goal: Update the 0002 dossier based on `docs/03-architecture/*` + ADRs and apply remaining Oracle followups (esp. spike coverage), keeping the "multiple PRD slices" structure.
- Done:
  - Updated dossier shaping artefacts:
    - `docs/04-projects/02-features/0002_quick-start-engine/brief.md` (header last-updated)
    - `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md` (wired RH-2.13/2.16/2.17/2.18 to concrete spikes)
    - `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`:
      - made missing-doc/missing-attachment filenames explicit (`REA.pdf`, `Utility_Easement_10ft_ExhibitB.pdf`)
      - tightened SP-2.6 with a negative test + continue-on-row-failure semantics
      - adjusted SP-2.7 pack set to cover issues truth; clarified multi-parcel is SP-2.10
      - added new spikes: SP-2.11 (list verification semantics), SP-2.12 (indexed runnable + warning UX), SP-2.13 (human-in-the-loop semantics, optional)
  - Updated Slice 1 PRD to be explicit that row-level failures (`citation_failed`) do not crash the run, and runs can still reach `completed` with exports blocked:
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/prd-slice-01-run-skeleton.md`
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/prd-slice-01-run-skeleton.json`
  - Verified JSON PRDs still validate against `docs/04-projects/_templates/json-prd.schema.json` (PASS).
- Pending:
  - Run the gating spikes and fill report stubs:
    - SP-2.1 (question set freeze + practitioner review)
    - SP-2.7 (payload representation decision confirmation)
    - SP-2.11 (list verification semantics decision)
  - Create and commit `question_set_v1.json` once SP-2.1 is done.
- Blockers: none in docs; implementation still depends on Initiative 0001 primitives (citations/viewer/verification).

## 2) Working tree
`git status -sb`:
```text
## main...origin/main [ahead 15]
```

Local commits not pushed:
```text
4808b78 docs(projects): add 0001 oracle bundle
4d83276 docs(projects): add 0003 oracle bundle
9ea2979 docs(projects): clarify 0003 PRD dossier status
d4b5876 docs(projects): add 0002 oracle prompt
7628c96 docs(projects): clarify 0002 slice-01 failure semantics
27a6193 docs(projects): expand 0002 spike plan and risks
1a88b9a docs(tmp): add oracle bundle for next followups
25e4b50 docs(projects): refine 0014 word export verification notes
a984e0f docs(projects): add 0003 oracle prompt
de9f3e1 docs(projects): add 0003 handoff notes
86b8ad6 docs(projects): update 0003 spike notes
3967635 docs(projects): add 0003 spine PRD
0a2f759 docs(projects): add 0001 PRD-slices handoff note
fd5775d docs(projects): update 0002 handoff note
d50f50e docs(projects): add 0002 handoff note
```

## 3) Branch/PR
- Branch: `main` (local ahead of `origin/main` by 15 commits).
- PR: none.
- CI: not checked.

## 4) Running processes
- tmux: none.
- dev servers: none running.

## 5) Tests/checks
- Ran:
  - JSON PRD schema validation via `python3` + `jsonschema` against `docs/04-projects/_templates/json-prd.schema.json` (PASS for all 0002 JSON PRDs).
- Not run:
  - `pnpm` checks (`lint`, `test`, `build`) or `scripts/verify*` (docs-only work).

## 6) Next steps
1. Confirm whether you want these local commits on `main` or prefer moving 0002 changes to a `codex/0002-*` branch (commits include other dossiers: 0001/0003/0014).
2. Run SP-2.1 and produce `question_set_v1.json` + decide `question_set_version` string format.
3. Run SP-2.7 to lock the payload representation decision and update Slice 2 PRD if the decision changes.
4. Run SP-2.11 and document the chosen list verification policy (partial failures vs downgrade/repair) so slices don’t bake in ambiguity.
5. If moving to execution: start `wf-plan` using the slice PRDs under `docs/04-projects/02-features/0002_quick-start-engine/`.

## 7) Risks/gotchas
- Keep status invariants strict: `needs_review|reviewed` requires >=1 locked citation; do not invent new report-row statuses.
- Item-level states (`match_status`, `depicted/not_depicted/unknown`) must never be encoded as row statuses.
- Scan packs may remain `indexed` not `ready`; don’t accidentally block runs on `ready` only.
- Local `main` contains multiple dossier-related commits; if you want clean PRs, split by dossier before pushing.
