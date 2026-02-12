# Handoff: Real-Data E2E Plan Docs

- Saved: `docs/98-tmp/handoffs/handoff_2026-02-12_23-13-56_real-data-e2e-plan-docs.md`
- Timestamp: `2026-02-12 23:13:56`

## 1) Scope/Status

- Objective: Create a detailed dev-priority implementation plan for real-data E2E workflows, include demo-prod allowlist quick wins, and capture execution policy for large vs small changes.
- Done:
  - Updated `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md` with:
    - dev-first mode posture
    - quick-win allowlist direction (`pack_09_bad_citation`)
    - explicit parallel Ralph loop policy (`3-4` loops for large work)
  - Updated `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md` with:
    - planned dev-first direction
    - phase-0 allowlist quick-win table
    - ralph execution model summary
  - Added `docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md` with:
    - phased implementation strategy (Phase 0-3)
    - loop ownership/topology (A/B/C/D)
    - acceptance criteria, risks, verification ladder, definition of done
- Pending:
  - Implement Phase 0 code changes in app code:
    - add `pack_09_bad_citation` allowlist in API schema
    - add `pack_09_bad_citation` toolbar option
    - add operator smoke coverage for load -> run -> export-blocked path
- Blockers: none for docs; code changes not started in this handoff.

## 2) Working Tree

- `git status -sb`:

```text
## main...origin/main
 M apps/web/app/(app)/matters/page.tsx
 M apps/web/app/ui/WorkspaceSidebar.tsx
?? apps/web/test/realDataWorkflows.e2e.int.test.ts
?? docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-handoffs/handoff_2026-02-12_23-07-19_claude-pickup-ui-feedback-plan.md
?? docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-claude-pickup-plan-2026-02-12.md
?? docs/05-reviews-audits/real-data-e2e-suite/
?? docs/98-tmp/handoffs/handoff_2026-02-12_21-00-42_real-data-e2e-workflows.md
?? docs/98-tmp/handoffs/handoff_2026-02-12_21-09-46_demo-citations-wdk-db-first.md
?? docs/98-tmp/handoffs/handoff_2026-02-12_21-33-10_e2e-workflow-priority-mapping.md
```

- Local commits ahead of upstream: `0`
- Upstream behind count: `0`

## 3) Branch/PR

- Branch: `main`
- Upstream: `origin/main`
- PR: none linked from this thread
- CI status: unknown/not checked in this handoff

## 4) Running Processes

- tmux sessions:

```text
0: 1 windows (created Wed Feb 11 17:19:04 2026) (attached)
```

- tmux panes:

```text
0:1.0 codex-aarch64-a 0
0:1.1 node 0
0:1.2 codex-aarch64-a 1
0:1.3 codex-aarch64-a 0
0:1.4 codex-aarch64-a 0
```

- attach/capture commands:
  - `tmux attach -t 0`
  - `tmux capture-pane -p -J -t 0:1.2 -S -200`
  - `tmux capture-pane -p -J -t 0:1.1 -S -200`

- notable active processes observed:
  - Next dev server instances via `pnpm --filter @orbital-poc/web dev` (`next dev -p 3101` also visible)
  - Additional `pnpm dev` / `next dev` process chain on `ttys002`

## 5) Tests/Checks

- Commands run:
  - `test -f docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md && test -f docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md && test -f docs/05-reviews-audits/real-data-e2e-suite/workflow-dev-priority-implementation-plan.md`
  - `test -f apps/web/app/(api)/demo/load-pack/route.ts && test -f apps/web/app/DemoToolbar.tsx`
- Results:
  - PASS for file existence and referenced path existence checks.
- Not run:
  - No unit/integration test suites were run for app behavior in this docs-only pass.

## 6) Next Steps (Ordered)

1. Implement Phase 0 quick-win code changes in one-shot:
   - `apps/web/app/(api)/demo/load-pack/route.ts`
   - `apps/web/app/DemoToolbar.tsx`
2. Add/update smoke test coverage for operator flow with `pack_09_bad_citation`.
3. If scope expands beyond Phase 0, split into `3-4` parallel Ralph loops per plan topology.
4. Re-run/update workflow matrix evidence lines after code merges to keep docs truthful.

## 7) Risks/Gotchas

- Working tree has unrelated modified/untracked files; avoid accidental staging/reverts while implementing quick wins.
- `docs/05-reviews-audits/real-data-e2e-suite/` currently appears as untracked directory in this repo state.
- There may be multiple dev servers running; confirm the intended one before executing smoke flows.
- Keep demo-prod changes constrained to allowlist quick wins unless explicitly re-scoped.
