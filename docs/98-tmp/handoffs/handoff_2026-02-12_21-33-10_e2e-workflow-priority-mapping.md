# Handoff: e2e-workflow-priority-mapping

## 1) Scope/status
- Scope: user asked to assess key backend/user workflows for a full real-data E2E suite, rank priorities, map workflows to `docs/08-example-data` packs, and clarify current Quick Start/chat implementation status.
- Done:
  - Created workflow strategy doc:
    - `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
  - Confirmed current Quick Start behavior and limitation:
    - WDK orchestration is implemented, but full real-data `retrieve -> draft -> lock -> verify` is not yet fully implemented in Quick Start.
  - Confirmed matter chat status:
    - Chat is implemented using Vercel AI SDK (`streamText`) in `apps/web/app/(api)/folders/[id]/chat/route.ts` with UI in `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`.
    - Current limitations noted (dev/demo gating, no persisted chat messages/citations from this route, no run-scope contract fields).
- Pending:
  - Implement the planned full E2E suite (P0 first) with reusable workflow modules parameterized by pack.
  - Optionally update architecture docs if you want current runtime docs to explicitly include the new 2D suite plan.
- Blockers:
  - No hard blocker for planning/docs.
  - Execution still depends on reachable local DB/worker for integration runs.

## 2) Working tree
- `git status -sb`: `## main...origin/main` with many existing modified files and untracked files.
- New file from this session:
  - `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
- Other notable untracked files already present:
  - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
  - `docs/98-tmp/handoffs/handoff_2026-02-12_21-00-42_real-data-e2e-workflows.md`
  - `docs/98-tmp/handoffs/handoff_2026-02-12_21-09-46_demo-citations-wdk-db-first.md`
- Local commits not pushed: none (`git log @{u}..HEAD | wc -l` => `0`).

## 3) Branch/PR
- Branch: `main`
- Upstream: `origin/main`
- Ahead/behind: `0/0`
- PR: none created in this session.

## 4) Running processes
- `tmux ls` check could not be completed in sandbox (`Operation not permitted` on `/private/tmp/tmux-501/default`).
- No verified live tmux sessions from this environment snapshot.
- If needed locally, run:
  - `tmux ls`
  - `tmux attach -t <session-name>`
  - `tmux capture-pane -p -J -t <session-name>:0.0 -S -200`

## 5) Tests/checks
- In this session: no new typecheck/test command was run.
- Most recent known related result (from prior handoff context):
  - `pnpm --filter @legaltech-poc/web typecheck` passed.
  - `pnpm --filter @legaltech-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts` failed in sandbox due DB socket access (`connect EPERM 127.0.0.1:5432`).

## 6) Next steps
1. Start with P0 suite implementation using the 2D matrix in:
   - `docs/05-reviews-audits/real-data-e2e-suite/workflow-pack-2d-suite-model.md`
2. Build reusable E2E modules for:
   - entry/readiness, run lifecycle/report, trust/export gating, citation evidence path.
3. Parameterize by packs:
   - PR smoke: `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation`.
4. Ensure local Postgres + worker availability and re-run:
   - `pnpm --filter @legaltech-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts`
5. Decide whether to update current runtime docs with this new suite strategy and any changed reality around citations/chat.

## 7) Risks/gotchas
- Quick Start remains partially placeholder-oriented for real uploaded docs (not yet full retrieve/draft/lock/verify for all real-data paths).
- Chat route is implemented but currently dev/demo gated and not yet run-scoped/persisted as a full production contract.
- Several APIs still have dev/demo gating and feature flags (`FEATURE_CITATIONS_API`, `FEATURE_TRACE_EXPORT`, demo-mode unsafe export controls).
- Working tree is broadly dirty; avoid broad staging/commits without strict file selection.
