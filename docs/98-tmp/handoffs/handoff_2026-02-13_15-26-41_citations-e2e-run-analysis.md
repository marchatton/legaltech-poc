# Handoff: citations-e2e-run-analysis

## 1) Scope/status
- Scope: finalize E2E coverage for real-document citation flow and adjust UI copy from "Quick Start" to "Run analysis".
- Done:
  - Added/updated `apps/web/test/citationsFromUpload.e2e.int.test.ts` to cover one end-to-end flow: upload pack docs -> ingest -> run -> citations/render -> chat -> download all uploaded docs.
  - Removed hardcoded TS/doc assumptions in that test; assertions now map report rows to `docs/08-example-data/pack_01_clean/truth/golden_questions.json`.
  - Renamed user-facing UI copy to "Run analysis" across matter pages/readiness/error states and aligned docs/tests.
- Pending:
  - Decide whether to unify chat+export into one single E2E file (currently split across two tests).
  - Commit/stage selection (working tree has unrelated local changes too).
- Blockers: none.

## 2) Working tree
- `git status -sb`:
  - Modified:
    - `apps/web/.env.example`
    - `apps/web/app/(api)/folders/[id]/runs/route.ts`
    - `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx`
    - `apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx`
    - `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
    - `apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx`
    - `apps/web/app/(app)/matters/[id]/page.tsx`
    - `apps/web/lib/readinessContract.server.ts`
    - `apps/web/lib/runFailureEnvelope.ts`
    - `apps/web/test/demoChecklist.sync.test.ts`
    - `apps/web/test/fixtureContextBanner.test.ts`
    - `apps/web/test/foldersRunsRoute.wdk.int.test.ts`
    - `apps/web/test/quickStartReadiness.sync.test.ts`
    - `apps/web/test/reportRowsFromStepOutputs.int.test.ts`
    - `docs/04-projects/02-features/0007_demo-reliability/demo-checklist.md`
  - Untracked:
    - `apps/web/test/citationsFromUpload.e2e.int.test.ts`
    - `docs/04-projects/04-refactors/0010_quick-start-real-citations/`
- Local commits not pushed: none (`main` is at `origin/main`, HEAD `9e6efda`).

## 3) Branch/PR
- Branch: `main`
- Upstream: `origin/main`
- PR: none for this local work yet.
- CI status: not checked in this session.

## 4) Running processes
- tmux sessions:
  - `0` (attached)
- tmux panes:
  - `0:1.0 codex-aarch64-a` (cwd repo root)
  - `0:1.1 bun` (active)
  - `0:1.2 codex-aarch64-a`
  - `0:1.3 codex-aarch64-a`
- Useful commands:
  - Attach: `tmux attach -t 0`
  - Capture active pane: `tmux capture-pane -p -J -t 0:1.1 -S -200`
  - List panes: `tmux list-panes -a -F '#S:#I.#P #{pane_current_command} #{pane_active} #{pane_dead} #{pane_current_path}'`
- Other notable running processes:
  - Multiple Next dev servers (`pnpm dev` + `pnpm --filter @orbital-poc/web dev -p 3001`) are running.
  - `agent-browser` daemons are running.

## 5) Tests/checks run
- `pnpm --filter @orbital-poc/web exec vitest run test/citationsFromUpload.e2e.int.test.ts`
  - Result: PASS (`1 passed`).
- `pnpm --filter @orbital-poc/web exec vitest run test/quickStartReadiness.sync.test.ts test/demoChecklist.sync.test.ts test/fixtureContextBanner.test.ts test/foldersRunsRoute.wdk.int.test.ts test/reportRowsFromStepOutputs.int.test.ts`
  - Result: PASS (`5 files, 12 tests`).
- Not run:
  - Full web test suite
  - Lint/typecheck/build checks

## 6) Next steps
1. Decide scope for commit: include only E2E (`citationsFromUpload`) vs include copy rename set too.
2. If keeping rename set, stage changed UI/tests/docs files and commit with a clear scope.
3. If desired, merge chat+export assertions into one canonical E2E (currently split between `citationsFromUpload.e2e.int.test.ts` and `realDataWorkflows.e2e.int.test.ts`).
4. Optionally run a broader gate before merge:
   - `pnpm --filter @orbital-poc/web exec vitest run`
   - project lint/typecheck command(s).

## 7) Risks/gotchas
- There is an unrelated local diff in `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx` present in working tree; it was not part of this requested rename/E2E scope.
- `apps/web/.env.example` is modified and unrelated to the E2E/copy changes.
- Integration tests require local Postgres; logs include benign notices (`relation already exists`, `pgvector_disabled`, PDF standard font warnings).
- Chat assertions in `citationsFromUpload.e2e.int.test.ts` use `vi.mock("ai")` and a temporary `AI_GATEWAY_API_KEY` env set during chat assertions for deterministic stream behavior.
