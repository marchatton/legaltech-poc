# Handoff: Browser Validation + IA Parity

## 1) Scope / status
- Objective in this session: implement IA + microinteraction parity updates (wireframe-structured) and thin backend scope (`N13` + deep-link), then run browser validation.
- Done:
  - Restructured `matters` shell to sidebar IA (`apps/web/app/(app)/matters/layout.tsx`, new `apps/web/app/ui/WorkspaceSidebar.tsx`).
  - Updated demo operator bar to closer wireframe structure (`apps/web/app/DemoToolbar.tsx`).
  - Refactored matters list layout/hierarchy (`apps/web/app/(app)/matters/page.tsx`).
  - Refactored matter detail IA and tab flow (`apps/web/app/(app)/matters/[id]/page.tsx`, `apps/web/app/(app)/matters/[id]/layout.tsx`, new `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx`).
  - Deep-link normalization to `row_tab` (with legacy `status=failed` mapping) (`apps/web/app/(app)/matters/runScope.ts`, `apps/web/lib/reportTriage.server.ts`, related tests).
  - Thin backend `N13` work: artefacts API supports `type`, `kind`, `source_run_id`, `safety`, `limit`, `cursor`, `include_summary`; returns `summary` and `next_cursor` (`apps/web/app/(api)/folders/[id]/artefacts/route.ts`).
  - Artefacts UI now includes source-run filter (`apps/web/app/(app)/matters/ArtefactsList.tsx`, `apps/web/app/(app)/matters/artefactsFilters.ts`).
- Pending:
  - Browser validation pass (`test-browser` flows) was intentionally deferred to a fresh context window.
  - Final polish/review for any visual deltas still needed after browser pass.
- Blockers: none.

## 2) Working tree
- `git status -sb`:
  - Branch `main...origin/main [ahead 2]`.
  - Repo is already dirty with many pre-existing changes outside this task (e.g., evidence/viewer/spikes/tailwind preset/docs files). Do not revert unrelated edits.
  - New files from this work:
    - `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx`
    - `apps/web/app/ui/WorkspaceSidebar.tsx`
- Local commits not pushed: yes (branch ahead by 2 existing commits).

## 3) Branch / PR
- Branch: `main`
- PR: none created in this session.
- Latest commits:
  - `3011b2c` chore(gemini): flatten skills for one-level discovery
  - `227c9b6` chore(agents): add GEMINI.md symlinks

## 4) Running processes
- No long-running dev server left running from this handoff.
- `tmux ls` is sandbox-restricted in this environment (`Operation not permitted`), so no attachable tmux session was validated.
- Start server fresh in next session:
  - `pnpm -C apps/web dev -p 3101`

## 5) Tests / checks
- Completed:
  - `pnpm -C apps/web typecheck` PASS
  - `pnpm -C apps/web test 'app/(app)/matters/runScope.test.ts' 'app/(app)/matters/artefactsFilters.test.ts' 'test/reportTriageFilters.test.ts' 'lib/artefacts.routes.test.ts'` PASS
  - `pnpm -C apps/web lint` PASS (2 existing unrelated warnings)
- Not completed:
  - Browser click-through validation via `test-browser` / `agent-browser`.

## 6) Next steps (ordered)
1. Start dev server:
   - `pnpm -C apps/web dev -p 3101`
2. Run headless browser validation (agent-browser):
   - `agent-browser open http://localhost:3101/matters`
   - Validate sidebar shell, list filters, create/open flow.
3. Validate detail tabs with query-state parity:
   - `http://localhost:3101/matters/<matter-id>?tab=report`
   - `?tab=documents`, `?tab=chat`, `?tab=artefacts`, `?tab=exports`
   - Confirm `row_tab` deep-links (especially `citation_failed`) from export-blocked links.
4. Exercise report drawer and evidence interactions:
   - Open row from report table, verify split viewer and state transitions.
5. Capture screenshots for before/after parity evidence and record explicit deviations.
6. If UI issues appear, patch minimally; rerun `typecheck`, targeted tests, lint.

## 7) Risks / gotchas
- Existing unrelated modifications are present in the working tree; treat this handoff as incremental on top of a dirty branch.
- `ReportTriagePanel` now expects explicit row tabs (`citation_failed`, `missing_input`) rather than `flagged/reviewed`; keep server/client tab contracts aligned.
- `runScope` keeps legacy compatibility by mapping old `status=failed` to `row_tab=citation_failed`.
- `N11`/`N12` backend work is still out-of-scope and intentionally flagged in UI copy.
- Browser validation is the key missing acceptance gate before closeout.
