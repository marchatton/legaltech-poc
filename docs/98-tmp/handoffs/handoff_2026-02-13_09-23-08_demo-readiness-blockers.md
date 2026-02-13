# Handoff: Demo Readiness Blockers

## 1) Scope/status
- Scope: assess whether the app is demo-ready for this flow: upload docs -> process -> view citations -> mark reviewed -> chat with docs -> export.
- Done:
  - Reviewed key upload/processing/report/chat/export code paths.
  - Ran verification commands for web app (`typecheck`, `build`, `lint`, `test:push`) and one integration workflow test.
  - Live-checked API behavior against running dev server on `:3001`.
- Pending:
  - Repair current dev runtime state (500s caused by missing Next vendor chunk).
  - Decide/patch desired behavior for uploaded-doc quick-start rows so they are reviewable/exportable in demo flow.
  - Re-run targeted verification after fixes.
- Blockers identified:
  - Runtime blocker: 500s with `Cannot find module './vendor-chunks/@opentelemetry+api@1.9.0.js'` on key folder/doc/report routes.
  - Product-logic blocker: uploaded docs currently map to `citation_failed` rows in quick start, which blocks export and bypasses mark-reviewed flow.
  - Potential env blocker: chat requires `AI_GATEWAY_API_KEY`.

## 2) Working tree
- `git status -sb`: branch is dirty with many tracked modifications and a few untracked files.
- Notable modified paths include:
  - `apps/web/app/(api)/demo/load-pack/route.ts`
  - `apps/web/app/(api)/folders/route.ts`
  - `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
  - `apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx`
  - `apps/web/lib/db/schema/core.server.ts`
  - `apps/web/package.json`
- Untracked includes:
  - `apps/web/.next-dev.lock`
  - `apps/web/app/ui/Page.test.tsx`
  - `apps/web/app/ui/SegmentedControl.tsx`
  - `apps/web/scripts/dev.ts`
  - prior handoff notes under `docs/.../tmp-handoffs/` and `docs/98-tmp/handoffs/`.
- Local commits not pushed: none (ahead/behind vs upstream is `0/0`).

## 3) Branch/PR
- Current branch: `main`
- Upstream: `origin/main`
- Divergence: `0` behind, `0` ahead.
- Relevant PR: none (working directly on `main` in current state).
- CI status: unknown from local session.

## 4) Running processes
- tmux sessions:
  - `0` (1 window, attached)
- tmux panes:
  - `0:1.0 bun 78627`
  - `0:1.1 codex-aarch64-a 38589`
  - `0:1.2 codex-aarch64-a 17885` (active)
  - `0:1.3 bun 27683`
- Active dev server process observed:
  - `pnpm --filter @orbital-poc/web dev -p 3001`
  - Next dev server PID tree includes `next-server (v15.5.12)`.
- Copy/paste tmux commands:
  - `tmux attach -t 0`
  - `tmux list-panes -a -F '#S:#I.#P #{pane_current_command} #{pane_pid} #{pane_active}'`
  - `tmux capture-pane -p -J -t 0:1.2 -S -200`

## 5) Tests/checks
- Commands run (current session context):
  - `pnpm --filter @orbital-poc/web typecheck` -> PASS (after `.next` types existed)
  - `pnpm --filter @orbital-poc/web build` -> PASS
  - `pnpm --filter @orbital-poc/web lint` -> PASS with warnings
  - `pnpm --filter @orbital-poc/web test:push` -> FAIL (4 tests)
  - `cd apps/web && pnpm exec vitest run test/realDataWorkflows.e2e.int.test.ts --reporter=basic` -> FAIL/SKIP due DB connect error (`EPERM 127.0.0.1:5432`)
- Not yet re-run after runtime cleanup/fixes:
  - targeted flow checks for upload -> process -> citation -> mark reviewed -> chat -> export
  - full `test:push` stabilization

## 6) Next steps
1. Stop and clean-restart web dev runtime to remove stale `.next` artifact state causing `@opentelemetry` vendor-chunk 500s.
2. Validate core APIs manually (`/folders`, `/folders/:id/documents`, `/folders/:id/report`, citation route) after restart.
3. Patch quick-start row generation for uploaded docs so demo path can reach reviewable/exportable states (or explicitly use seeded demo path only).
4. Confirm env vars for demo chat/export path (at minimum `AI_GATEWAY_API_KEY`; object-store secret/dev fallback).
5. Re-run smallest verification set for demo confidence, then re-run `test:push` and document remaining failures.

## 7) Risks/gotchas
- Dirty working tree is substantial; avoid accidental rollback/revert of unrelated edits.
- Existing `apps/web/.next-dev.lock` and dev runtime state suggest stale artifacts can produce misleading 500s.
- Integration tests needing Postgres fail locally without DB access (`127.0.0.1:5432`).
- Export endpoints intentionally block on `citation_failed` rows unless unsafe override; this can make the “full happy-path” demo fail unless row state logic is adjusted or seeded data is used.
