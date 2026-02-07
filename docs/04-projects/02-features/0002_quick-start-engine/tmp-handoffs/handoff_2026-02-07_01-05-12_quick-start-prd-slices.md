# Handoff: 0002 Quick Start Engine PRD Slices + Architecture Alignment

Time: 2026-02-07 01:05:12 (local)

## 1) Scope/status
- Goal: Update 0002 dossier shaping docs to align with `docs/03-architecture/*` + `docs/03-architecture/DECISIONS.md` (ADRs), and split Initiative 0002 into multiple thin PRDs with schema-valid JSON PRDs.
- Done:
  - Updated shaping packet:
    - `docs/04-projects/02-features/0002_quick-start-engine/brief.md`
    - `docs/04-projects/02-features/0002_quick-start-engine/breadboard-pack.md`
    - `docs/04-projects/02-features/0002_quick-start-engine/risk-register.md`
    - `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
  - Architecture alignment highlights:
    - Evidence-first + ID-only citations (ADR-0001): candidate `chunk_id` -> lock -> row refers to `citation_id` only.
    - Fail-closed verification (ADR-0002): mismatches -> `citation_failed` w/ taxonomy reason codes.
    - WDK boundaries (ADR-0005): `"use workflow"` controller + `"use step"` side effects; step idempotency via deterministic `step_key`.
    - API + error envelope (ADR-0008): safe errors w/ `trace_id`; UI reads state through API, not DB.
    - Observability: correlate failures using `{trace_id, run_id, step_key, question_id}`.
  - Created PRD spine + slice PRDs (each has a matching JSON PRD that validates against `docs/04-projects/_templates/json-prd.schema.json`):
    - `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
    - `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.json`
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002a_run-skeleton/prd.md` (+ `.json`)
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002b_row-payload-contract/prd.md` (+ `.json`)
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002c_commitment-parsing-pack-01-clean/prd.md` (+ `.json`)
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002d_exception-matching-pack-01-02/prd.md` (+ `.json`)
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002e_survey-extraction-pack-01-03/prd.md` (+ `.json`)
    - `docs/04-projects/02-features/0002_quick-start-engine/prds/0002f_reconciliation-honesty-pack-03-07/prd.md` (+ `.json`)
  - Proof capture tooling notes added to spikes:
    - `agent-browser` (`pnpm dlx agent-browser ...`)
    - `browser-use` (`uvx "browser-use[cli]" ...`)
- Pending:
  - Run spikes and fill report stubs (especially SP-2.1 question set + SP-2.7 payload representation).
  - Create/commit `question_set_v1.json` (owned by SP-2.1) and pin `question_set_version` semantics end-to-end.
  - If moving to execution: run `wf-plan` off the slice PRDs.
- Blockers: None in docs. Implementation depends on Initiative 0001 trust substrate primitives (viewer/citations/verification UX).

## 2) Working tree
`git status -sb`:
```text
## main...origin/main [ahead 1]
?? docs/04-projects/02-features/0003_demo-grade-outputs/tmp-handoffs/handoff_2026-02-07_01-05-10_0003-prd-dossiers.md
```

Local commits not pushed:
```text
d50f50e docs(projects): add 0002 handoff note
```

Latest commit:
```text
d50f50e docs(projects): add 0002 handoff note
5e33d22 docs(projects): update 0002 PRD slices and spike notes
```

## 3) Branch/PR
- Branch: `main` (ahead of `origin/main` by 1 commit).
- PR: none.
- CI: not checked in this session.

## 4) Running processes
- tmux: none (`tmux ls` returned "no tmux sessions").
- dev servers: none running.

## 5) Tests/checks
- Ran:
  - JSON PRD schema validation via `python3` + `jsonschema` against `docs/04-projects/_templates/json-prd.schema.json` (PASS).
- Not run:
  - `pnpm` checks (`lint`, `test`, `build`) or `scripts/verify*` (docs-only work).

## 6) Next steps
1. Read the spine and slice PRDs, confirm slice ordering and any missing seams:
   - `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
2. Run spikes SP-2.1 and SP-2.7 first; they gate most downstream build work:
   - `docs/04-projects/02-features/0002_quick-start-engine/spike-investigation.md`
3. Create `question_set_v1.json` and decide/pin `question_set_version` string format for `runs.question_set_version`.
4. Choose UI proof capture tool for spikes:
   - `pnpm dlx agent-browser ...` (simplest)
   - `uvx "browser-use[cli]" ...` (persistent sessions; writes to `~/.cache/uv`)

## 7) Risks/gotchas
- Human-in-the-loop ambiguity resolution is explicitly cut for v1; if reintroduced later it must re-verify and must not mutate locked citations.
- `browser-use` via `uvx` will write to `~/.cache/uv` and download dependencies; in sandboxed agent contexts this may require escalation.
- ADR-0013 (AI SDK) is still marked proposed; treat as guidance unless/until implementation locks it in.
