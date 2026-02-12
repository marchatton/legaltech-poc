# Handoff - Demo Citations (WDK + DB-first)

1) Scope/status
- Scope: investigate why citations were not working in demo quick-start runs, implement fix, and verify end-to-end.
- Done:
  - Confirmed root cause: quick-start WDK step always wrote `citation_failed` placeholder rows even with docs.
  - Implemented seeded-row hydration for demo matters in `apps/web/steps/quickStartWriteRowV0.step.server.ts`:
    - Detect demo pack from folder name (`DEMO: pack_...`).
    - Load `tmp/fixture-seed/<pack>/snapshot.json`.
    - Use seeded row content where available.
    - Remap seed citation IDs to fresh DB `cit_*` IDs.
    - Persist locked citations into `citations` table linked to inserted `report_rows`.
  - Implemented DB-first citation resolution in `apps/web/app/(api)/citations/[id]/route.ts` even when `FEATURE_CITATIONS_API` is off, with fixture fallback only on DB miss.
  - Added regression test in `apps/web/lib/citations.routes.test.ts` for DB-first behavior with feature flag disabled.
  - Verified quick-start now produces citation-backed rows.
- Pending:
  - `TS-07` and `TS-08` still end up `citation_failed` for `pack_01_clean` because those questions are absent in `tmp/fixture-seed/pack_01_clean/snapshot.json`.
  - Decide whether to add seeded truth/citations for `TS-07`/`TS-08` or keep them as expected failures.
- Blockers: none (technical). Only product/data decision on expected status for TS-07/TS-08.

2) Working tree
- `git status -sb` at handoff:
  - Branch: `main...origin/main`
  - Modified files include prior UI work plus this citations fix:
    - `apps/web/steps/quickStartWriteRowV0.step.server.ts`
    - `apps/web/app/(api)/citations/[id]/route.ts`
    - `apps/web/lib/citations.routes.test.ts`
  - Untracked files observed (explicitly told to ignore by user):
    - `apps/web/test/realDataWorkflows.e2e.int.test.ts`
    - `docs/98-tmp/handoffs/handoff_2026-02-12_21-00-42_real-data-e2e-workflows.md`
- Local commits not pushed:
  - Upstream: `origin/main`
  - Ahead/behind: `0 0` (no local commits ahead).

3) Branch/PR
- Branch: `main`
- PR: none opened in this session.
- CI: not applicable (no commit pushed).

4) Running processes
- No known dev server left running on `127.0.0.1:3106` (`lsof -nP -iTCP:3106 -sTCP:LISTEN` returned empty).
- `tmux ls` could not be inspected in this environment (`Operation not permitted`), so no attach target confirmed.

5) Tests/checks
- Ran:
  - `pnpm --filter @orbital-poc/web typecheck` -> PASS
  - `pnpm --filter @orbital-poc/web lint` -> PASS (existing unrelated warnings only)
  - `pnpm --filter @orbital-poc/web build` -> PASS
  - `pnpm --filter @orbital-poc/web exec vitest run lib/citations.routes.test.ts` -> PASS (5/5)
- API smoke validation (dev mode with `DEMO_MODE=1`) showed:
  - `rows_total=9`
  - `rows_with_citations=7`
  - `citation_failed_rows=2` (TS-07, TS-08)
  - `/citations/<db-generated-cit-id>` now returns `200` (was `404` before DB-first route change).

6) Next steps
- 1. Decide expected behavior for `TS-07` and `TS-08` in demo packs:
  - If they should succeed, add those rows + citations into `tmp/fixture-seed/pack_01_clean/snapshot.json` (or seed pipeline source) and re-run quick-start smoke.
  - If expected to fail, leave as-is and ensure UI/wording clearly communicates expected demo limitation.
- 2. Re-run end-to-end smoke:
  - Start dev server with `DEMO_MODE=1`.
  - `POST /demo/load-pack` -> `POST /folders/:id/runs` -> `GET /folders/:id/report?run_id=...`.
  - Validate `rows_with_citations` and failed question IDs.
- 3. If desired, add a targeted test for quick-start seeded hydration in WDK step (integration-level) to lock behavior.

7) Risks/gotchas
- Demo seeded hydration depends on matter name parsing (`DEMO: pack_xxx ...`); non-demo/named matters will fall back to existing behavior.
- `tmp/fixture-seed` is the source of seeded truth for this demo path; drift/missing question rows directly impacts quick-start outputs.
- DB-first `/citations/:id` now always touches DB; in dev/demo this is intentional for newly persisted citations, with fallback preserved when DB miss occurs.
- Worktree contains many unrelated modified files from earlier UI iteration; avoid reverting unrelated user work.
