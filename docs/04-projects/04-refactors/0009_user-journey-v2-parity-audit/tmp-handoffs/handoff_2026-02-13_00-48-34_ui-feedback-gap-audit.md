# Handoff: UI feedback gap audit

## 1) Scope/status
- Scope: verify whether the Claude pickup UI plan was fully implemented in `apps/web` and list exact remaining gaps.
- Done in this chat:
  - Located and reviewed planning docs:
    - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/ui-rebuild/ui-rebuild-claude-pickup-plan-2026-02-12.md`
    - `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-handoffs/handoff_2026-02-12_23-07-19_claude-pickup-ui-feedback-plan.md`
  - Compared plan expectations against current code and produced exact not-yet-done list.
- Pending (not yet done):
  1. Redundant demo environment badge still shown in list/detail context bars.
     - `apps/web/app/(app)/matters/page.tsx:128`
     - `apps/web/app/(app)/matters/[id]/layout.tsx:73`
  2. Quick Start "already running" detail still shown inline (no concise status + tooltip pattern).
     - `apps/web/app/(app)/matters/[id]/page.tsx:405`
     - `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx:71`
     - `apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx:85`
  3. Internal document ID still exposed on filename hover title.
     - `apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx:431`
  4. Matters search is still constrained to `max-w-sm/sm:max-w-md` and not explicitly the half-width target from plan.
     - `apps/web/app/(app)/matters/page.tsx:141`
  5. Phase 2 shared primitive/token polish is not evident as a dedicated pass in key files.
     - `apps/web/app/ui/DropdownMenu.tsx`
     - `apps/web/app/ui/Badge.tsx`
     - `apps/web/app/ui/Chip.tsx`
     - `apps/web/app/ui/Skeleton.tsx`
     - `apps/web/app/tokens.css`
     - `apps/web/app/ui/WorkspaceTabs.tsx`
- Blockers: none.

## 2) Working tree
- `git status -sb`: `## main...origin/main`
- Working tree appears clean.
- Local commits not pushed: none (`git rev-list --left-right --count origin/main...HEAD` => `0 0`).

## 3) Branch/PR
- Branch: `main` (tracking `origin/main`).
- PR: none linked in this thread.
- CI status: not checked in this audit pass.

## 4) Running processes
- tmux session detected:
  - `0: 1 windows (attached)`
- Panes:
  - `0:1.0 codex-aarch64-a`
  - `0:1.1 codex-aarch64-a`
  - `0:1.2 codex-aarch64-a`
- Attach/capture commands:
  - `tmux attach -t 0`
  - `tmux capture-pane -p -J -t 0:1.0 -S -200`
  - `tmux capture-pane -p -J -t 0:1.1 -S -200`
  - `tmux capture-pane -p -J -t 0:1.2 -S -200`

## 5) Tests/checks
- In this audit pass: docs/code inspection only; no tests executed.
- Earlier in thread (already completed before this audit): lint/typecheck + targeted tests + full web suite were run and reported passing, and prior changes were committed/pushed.

## 6) Next steps
1. Implement the 4 concrete UI gaps above in `apps/web/app/(app)/matters*` files.
2. Decide and execute a scoped Phase 2 primitive/token pass for listed shared UI files.
3. Run targeted sync tests first, then `pnpm --filter @legaltech-poc/web typecheck`, then broader web tests if UI primitives change.
4. Capture before/after screenshots for list, documents, and detail header to verify parity with the plan.

## 7) Risks/gotchas
- Some remaining items are UX-intent-sensitive (especially tooltip behavior and search width interpretation); small copy/layout changes can cause sync-test string contract drift.
- Shared primitive/token edits can create broad visual regressions; keep scope explicit and verify affected tabs (`documents`, `chat`, `exports`).
- Do not remove backend/internal IDs from logic paths; only remove them from user-visible labels/tooltips.
