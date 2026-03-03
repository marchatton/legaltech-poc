Saved handoff: docs/98-tmp/handoffs/handoff_2026-02-12_23-28-28_db-only-evidence-sources-mode.md

- Scope/status:
  - Reviewed workflow/mode gaps and previously authored `docs/05-reviews-audits/real-data-e2e-suite/workflow-mode-implementation-matrix.md`.
  - Implemented `db_only` evidence gate in citations path:
    - Added shared helper `isDbOnlyEvidenceMode()` in `apps/web/lib/runtimeMode.ts`.
    - Wired citations route to skip fixture fallback when `EVIDENCE_BACKEND=db_only` in `apps/web/app/(api)/citations/[id]/route.ts`.
    - Added test coverage in `apps/web/lib/citations.routes.test.ts`.
  - Updated chat copy to use “Sources” wording in `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`.
  - Started (but did not fully verify) `db_only` wiring for:
    - `apps/web/app/(api)/documents/[id]/render/route.ts`
    - `apps/web/app/(api)/documents/[id]/pdf/route.ts`
    - `apps/web/app/(api)/export/csv/route.ts`
  - Pending: docs/env updates + targeted tests for render/pdf/export `db_only` behavior.

- Working tree:
  - `git status -sb` currently: `main...origin/main [ahead 1]` (dirty tree with many pre-existing edits + untracked files).
  - Key modified files in this thread include:
    - `apps/web/lib/runtimeMode.ts`
    - `apps/web/app/(api)/citations/[id]/route.ts`
    - `apps/web/lib/citations.routes.test.ts`
    - `apps/web/app/(api)/documents/[id]/render/route.ts`
    - `apps/web/app/(api)/documents/[id]/pdf/route.ts`
    - `apps/web/app/(api)/export/csv/route.ts`
    - `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
  - Plus many pre-existing modified/untracked files outside this scope.

- Branch/PR:
  - Branch: `main`
  - Ahead/behind vs `origin/main`: ahead `1`, behind `0` (`git rev-list --left-right --count origin/main...HEAD` => `0 1`).
  - No PR link captured in this session.

- Running processes:
  - `tmux ls` could not be read in sandbox: `error connecting to /private/tmp/tmux-501/default (Operation not permitted)`.
  - Verified active dev server process:
    - `node ... next dev -p 3101` (PID `80439`).
  - No worker/test long-running process verified beyond that.
  - Useful commands:
    - Check dev server: `ps -ax | rg -i "next dev|scripts/worker|pnpm dev"`
    - Attempt tmux list (outside sandbox): `tmux ls`

- Tests/checks:
  - Ran: `pnpm test lib/citations.routes.test.ts` (from `apps/web`) twice.
  - Result: PASS (`7/7` tests).
  - Not yet run after latest broader `db_only` wiring:
    - Route tests for documents render/pdf fixture denial.
    - Route test for csv export fixture fallback denial.
    - Full `pnpm --filter @legaltech-poc/web test` / `typecheck`.

- Next steps:
  - 1. Confirm and keep/adjust current `db_only` route changes in render/pdf/export.
  - 2. Add targeted tests:
    - render route: fixture doc returns `404` when `EVIDENCE_BACKEND=db_only`.
    - pdf route: fixture doc returns `404` when `EVIDENCE_BACKEND=db_only`.
    - export csv route: when DB run is missing, `db_only` must return `NOT_FOUND` (no fixture snapshot fallback).
  - 3. Update docs/config:
    - `apps/web/.env.example` add `EVIDENCE_BACKEND=` docs.
    - `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md` add recommended `EVIDENCE_BACKEND=db_only` for no-fixture demos.
  - 4. Re-run targeted tests and summarize pass/fail.
  - 5. Decide whether to keep only chat wording changes or include broader local ChatPanel UI diff.

- Risks/gotchas:
  - Dirty working tree includes many unrelated changes; do not reset broadly.
  - `apps/web/app/(app)/matters/[id]/ChatPanel.tsx` currently shows a broader diff than wording-only; verify intent before shipping.
  - `EVIDENCE_BACKEND=db_only` now affects behavior but is not yet fully documented in env/runbook.
  - Demo/prod path confusion remains unless docs clearly separate `dev` demo tooling from `demo-prod` operator behavior.
