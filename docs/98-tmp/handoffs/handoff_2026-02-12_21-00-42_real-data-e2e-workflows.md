# Handoff: real-data-e2e-workflows

## 1) Scope/status
- Scope: user asked whether we can run backend-inclusive E2E workflows using real example data from `docs/08-example-data`, and requested tests based on that data.
- Done:
  - Mapped implemented core backend workflows and confirmed current runtime caveat (fixture-heavy evidence behavior).
  - Added a new backend integration E2E test using real pack PDF data:
    - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
  - Test flow implemented:
    - create matter
    - init upload + signed upload + complete upload
    - ingest via WDK
    - start Quick Start + wait for completion
    - fetch report
    - citation + render/pdf endpoints
    - export gating (`EXPORT_BLOCKED`) + unsafe override export + artefact download
- Pending:
  - Run the new E2E test in an environment where Postgres is reachable on `127.0.0.1:5432`.
- Blocker:
  - Sandbox environment denied DB socket access (`connect EPERM 127.0.0.1:5432`), so runtime verification is incomplete.

## 2) Working tree
- `git status -sb`: `## main...origin/main` with many existing modified files (pre-existing UI/workflow changes) plus one new file from this task.
- New file from this task:
  - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
- Local commits not pushed: none created in this session.

## 3) Branch/PR
- Branch: `main`
- Upstream: `origin/main`
- Ahead/behind: `0/0`
- PR: none for this task yet.

## 4) Running processes
- `tmux ls`: no tmux sessions.
- No long-running dev server/worker was left running by this session.

## 5) Tests/checks
- Ran:
  - `pnpm --filter @legaltech-poc/web typecheck`
    - Result: PASS
  - `pnpm --filter @legaltech-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts`
    - Result: FAIL (environmental)
    - Error: `connect EPERM 127.0.0.1:5432 - Local (0.0.0.0:0)`
- Earlier accidental command:
  - `pnpm --filter @legaltech-poc/web test -- test/realDataWorkflows.e2e.int.test.ts`
  - This ran the broader suite and surfaced unrelated failures/skips; not used as acceptance signal for this task.

## 6) Next steps
1. Ensure local Postgres is reachable at `127.0.0.1:5432` (or provide `DATABASE_URL`).
2. Re-run:
   - `pnpm --filter @legaltech-poc/web exec vitest run test/realDataWorkflows.e2e.int.test.ts`
3. If passing, optionally add a second real-data E2E case for `pack_02_missing_rea`.
4. Decide whether to keep manual citation seeding in this test or split citation/render/export assertions into a separate test once DB-first citation locking from real runs lands.

## 7) Risks/gotchas
- Current Quick Start runtime is still placeholder-oriented for real uploaded docs; full retrieve->draft->lock pipeline is not implemented yet.
- The new E2E test intentionally inserts one locked citation row directly in DB to exercise citation/render path against real ingested chunks.
- Dev-only route gating applies to parts of the flow; test sets:
  - `NODE_ENV=development`
  - `ALLOW_DEV_OBJECT_STORE_SECRET=1`
  - `FEATURE_CITATIONS_API=1`
- Repo working tree is already dirty with many unrelated modified files; avoid broad staging/commits without careful file selection.
