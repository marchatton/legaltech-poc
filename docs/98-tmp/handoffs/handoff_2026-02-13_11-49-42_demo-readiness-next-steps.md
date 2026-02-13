# Handoff: Demo Readiness Next Steps

## 1) Scope/status
- Scope: demo-readiness recovery for upload -> process -> citations -> review -> chat -> export flow.
- Done:
  - Implemented docs-ready quick-start fallback rows as `needs_review` (instead of default `citation_failed`) in both paths:
    - `apps/web/steps/quickStartWriteRowV0.step.server.ts`
    - `apps/web/lib/quickStartRunProcessor.server.ts`
  - Added deterministic chat fallback in demo/dev when `AI_GATEWAY_API_KEY` is missing:
    - `apps/web/app/(api)/folders/[id]/chat/route.ts`
    - test coverage in `apps/web/lib/chat.routes.test.ts`
  - Updated affected tests for new expected behavior:
    - `apps/web/test/reportRowsFromStepOutputs.int.test.ts`
    - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
  - Updated operator docs/runbook:
    - `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md`
  - Updated recovery plan with chat architecture + DB-test blocker handling:
    - `docs/98-tmp/demo-readiness-recovery-plan_2026-02-13.md`
  - Verification completed (partial): lint + typecheck + chat route tests pass.
- Pending:
  - Re-run DB-backed integration suites with local Postgres access.
  - Manual golden-path walkthrough twice on fresh matters.
  - Final go/no-go summary with evidence.
- Blockers:
  - In this sandboxed session, DB loopback access is blocked (`connect EPERM 127.0.0.1:5432`), causing `.int/.e2e.int` hook timeouts.

## 2) Working tree
- `git status -sb`:
  - Modified:
    - `apps/web/app/(api)/folders/[id]/chat/route.ts`
    - `apps/web/lib/chat.routes.test.ts`
    - `apps/web/lib/quickStartRunProcessor.server.ts`
    - `apps/web/steps/quickStartWriteRowV0.step.server.ts`
    - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
    - `apps/web/test/reportRowsFromStepOutputs.int.test.ts`
    - `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md`
  - Untracked:
    - `apps/web/.next-dev.lock`
    - `docs/98-tmp/demo-readiness-recovery-plan_2026-02-13.md`
- Local commits not pushed: none (`origin/main...HEAD = 0 behind / 0 ahead`).

## 3) Branch/PR
- Branch: `main`
- Upstream: `origin/main`
- Divergence: `0/0`
- Relevant PR: none
- CI status: unknown from local session

## 4) Running processes
- tmux sessions:
  - `0: 1 windows (attached)`
- tmux panes:
  - `0:1.0 codex-aarch64-a 78627`
  - `0:1.1 codex-aarch64-a 80877`
  - `0:1.2 bun 27683` (active)
  - `0:1.3 codex-aarch64-a 17885`
- Active dev server observed:
  - `pnpm --filter @orbital-poc/web dev -p 3001`
  - `next dev -p 3001` child process running.
- Copy/paste tmux commands:
  - `tmux attach -t 0`
  - `tmux list-panes -a -F '#S:#I.#P #{pane_current_command} #{pane_pid} #{pane_active}'`
  - `tmux capture-pane -p -J -t 0:1.2 -S -200`

## 5) Tests/checks
- Passed:
  - `pnpm --filter @orbital-poc/web lint`
  - `pnpm --filter @orbital-poc/web typecheck`
  - `pnpm --filter @orbital-poc/web test lib/chat.routes.test.ts`
- Blocked in this environment:
  - `pnpm --filter @orbital-poc/web exec vitest run test/reportRowsFromStepOutputs.int.test.ts`
  - `pnpm --filter @orbital-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts`
  - Result: suite hook timeout; direct probe showed `connect EPERM 127.0.0.1:5432`.

## 6) Next steps
1. Ensure local Postgres is running and reachable from host shell; export correct `DATABASE_URL`.
2. Re-run targeted DB-backed suites:
   - `pnpm --filter @orbital-poc/web exec vitest run test/reportRowsFromStepOutputs.int.test.ts`
   - `pnpm --filter @orbital-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts`
3. Clean-restart dev runtime and smoke core routes (`/matters`, `/api/folders`, `/api/folders/:id/documents`, `/api/folders/:id/report`).
4. Perform two manual golden-path runs on fresh matters and verify export downloads.
5. Append final PASS/NO-GO evidence to `docs/98-tmp/demo-readiness-recovery-plan_2026-02-13.md`.

## 7) Risks/gotchas
- `apps/web/.next-dev.lock` may block restart or hide stale dev-state issues.
- Runtime chunk issue can recur (`@opentelemetry` vendor-chunk missing) if `.next` state is stale.
- Chat behavior depends on mode:
  - With `AI_GATEWAY_API_KEY`: live model path.
  - Without key in dev/demo: deterministic fallback (`Not found in provided documents.`).
- `docs/98-tmp/demo-readiness-recovery-plan_2026-02-13.md` is untracked right now; remember to add/commit if you want the plan updates persisted.
