# Handoff Checklist

## 1) Scope/Status
- Scope: Investigate user report that chat only answers citation-like prompts (weak reasoning on broad prompts) and appears not to stream after `load pack` + `run analysis`.
- Done:
  - Reproduced exact flow on fresh pack load.
  - Confirmed broad prompt behavior: direct retrieval could return zero hits and route emitted one-token fallback (`Not found in provided documents.`).
  - Confirmed streaming is active at API level (`token` NDJSON events), but one-token fallback can make UI feel non-streaming.
  - Implemented server fix in `apps/web/app/(api)/folders/[id]/chat/route.ts`:
    - Abort/disconnect-safe stream handling.
    - Retrieval fallback: if direct hybrid search has no hits, pull recent locked citation snippets from latest run and use them as source context.
    - Prompt tweak to synthesize across sources for broad prompts.
  - Added regression tests in `apps/web/lib/chat.routes.test.ts` for fallback behavior and stream cancellation safety.
- Pending:
  - Optional quality polish: refine prompt/output schema so broad answers do not include awkward lines like `Not found in provided documents.` inside synthesized bullets.
  - Optional retrieval upgrade: enable semantic retrieval (`pgvector`) for better broad-question recall.
- Blockers: none.

## 2) Working Tree
- `git status -sb`:
  - Branch `main...origin/main [ahead 2]`.
  - Large dirty tree with many unrelated existing edits.
  - Files specifically touched for this chat task:
    - `apps/web/app/(api)/folders/[id]/chat/route.ts`
    - `apps/web/lib/chat.routes.test.ts`
    - (previous in-thread infra guard work also present)
      - `apps/web/scripts/build.ts`
      - `apps/web/package.json`
      - `apps/web/tsconfig.json`
- Local commits not pushed:
  - Ahead/behind summary `0 2` from `git rev-list --left-right --count @{upstream}...HEAD` (local branch ahead by 2).

## 3) Branch/PR
- Current branch: `main`.
- PR: none opened from this session.
- CI status: unknown (not run via PR).

## 4) Running Processes
- No active `apps/web` dev server at handoff time (stopped via Ctrl-C).
- tmux state:
  - `tmux list-sessions` -> `0: 1 windows (attached)`
  - `tmux list-panes -a -F '#S:#I.#P pid=#{pane_pid} cmd=#{pane_current_command} active=#{pane_active}'` shows only codex panes.
- Useful commands:
  - Attach: `tmux attach -t 0`
  - Capture recent pane output: `tmux capture-pane -p -J -t 0:1.3 -S -300`

## 5) Tests/Checks
- Ran and passed:
  - `pnpm --filter @orbital-poc/web test lib/chat.routes.test.ts`
  - `pnpm --filter @orbital-poc/web lint` (existing unrelated warnings remain)
  - `pnpm --filter @orbital-poc/web build`
- Manual repro/verification done:
  - `POST /demo/load-pack` with `pack_01_clean` -> folder `fld_045b1e37-7a08-4b73-9f66-99a2ef870b40`
  - Ran analysis -> run `run_ea74cd5d-a9d7-47ad-9b3b-d892a9bca73a`
  - Chat specific prompt succeeded.
  - Broad prompt now returns synthesized answer with multiple token events and source chips after fix.

## 6) Next Steps
1. Decide whether to commit only chat-focused files now or include prior in-thread infra/build-guard edits.
2. If committing narrowly, stage only:
   - `apps/web/app/(api)/folders/[id]/chat/route.ts`
   - `apps/web/lib/chat.routes.test.ts`
3. Re-run quick manual UI smoke (`load pack` -> `run analysis` -> ask 1 specific + 1 broad question).
4. Optional: tighten model prompt/output formatting for cleaner broad-summary bullets.
5. Optional: enable semantic retrieval (`pgvector`) in dev/prod environment for stronger broad-query recall.

## 7) Risks/Gotchas
- Repo is heavily dirty; avoid accidental staging of unrelated files.
- In this environment, retrieval logs indicate semantic path can be unavailable (`retrieval.pgvector_disabled`), making lexical hit coverage brittle for general prompts.
- Broad summarization quality still depends on model behavior; fallback improves coverage but may need stricter formatting constraints.
