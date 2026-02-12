Saved handoff: docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-handoffs/handoff_2026-02-12_23-07-19_claude-pickup-ui-feedback-plan.md

## 1) Scope and Status
- Scope: Prepare a Claude-pickup implementation plan from consolidated operator feedback for matters list/detail UI.
- Done:
  - Created implementation-ready plan with acceptance criteria and file touchpoints:
    - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-claude-pickup-plan-2026-02-12.md`
  - Included full consolidated feedback appendix in that plan.
- Pending:
  - No implementation work started yet.
  - Claude should execute Phase 1, then Phase 2 from the plan.
- Blockers:
  - None identified at planning stage.

## 2) Working Tree
- `git status -sb` summary:
  - Branch: `main...origin/main`
  - Existing untracked files were already present before this handoff:
    - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
    - `docs/05-reviews-audits/real-data-e2e-suite/`
    - `docs/98-tmp/handoffs/handoff_2026-02-12_21-00-42_real-data-e2e-workflows.md`
    - `docs/98-tmp/handoffs/handoff_2026-02-12_21-09-46_demo-citations-wdk-db-first.md`
    - `docs/98-tmp/handoffs/handoff_2026-02-12_21-33-10_e2e-workflow-priority-mapping.md`
- Local commits not pushed: none (`git rev-list --left-right --count HEAD...origin/main` => `0 0`).

## 3) Branch and PR
- Current branch: `main`
- PR: none for this planning-only pass.
- CI status: not applicable (no implementation commits in this handoff).

## 4) Running Processes
- tmux: none detected (`tmux ls` returned no sessions).
- Attach commands (if needed later):
  - `tmux attach -t <session>`
  - `tmux capture-pane -p -J -t <session>:0.0 -S -200`

## 5) Tests and Checks
- Commands run:
  - Read-only repo discovery, file inspection, and planning.
  - `git status -sb`
  - `git rev-list --left-right --count HEAD...origin/main`
- No test suite run yet in this handoff.
- Still needs to run during implementation:
  - Targeted sync tests listed in the plan doc.
  - `pnpm --filter @orbital-poc/web typecheck`
  - Manual multi-tab smoke checks.

## 6) Next Steps
1. Open and execute:
   - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-claude-pickup-plan-2026-02-12.md`
2. Implement Phase 1 (P0) first and validate with targeted sync tests.
3. Capture screenshot evidence for list, detail, documents, chat, reports after Phase 1.
4. Implement Phase 2 polish with v5-final alignment while preserving behavior contracts.
5. Run typecheck + targeted tests + manual smoke; publish PASS/NO-GO summary.

## 7) Risks and Gotchas
- Existing working tree is dirty with unrelated untracked files; avoid touching/reverting them.
- Several sync tests are string-contract based; copy changes can fail tests if not updated in lockstep.
- Sticky offset changes can regress differently per tab; verify `Documents` specifically due known mismatch.
- Internal IDs must remain in backend logic while being removed from user-facing labels.

