# Handoff Checklist

## 1) Scope/Status
- Scope: Enable true semantic retrieval for chat (not lexical-only fallback), make host-native local dev + Sprite guidance explicit, and align runtime with pgvector support.
- Done:
  - Added embedding priming service for chunks (folder and document scopes):
    - `apps/web/lib/retrieval/embedChunks.server.ts`
    - `apps/web/lib/retrieval/vectorLiteral.ts`
  - Wired chat route to prime missing embeddings before hybrid retrieval:
    - `apps/web/app/(api)/folders/[id]/chat/route.ts`
  - Wired ingest processor to prime document embeddings after chunk writes:
    - `apps/web/lib/ingest/ingestProcessor.server.ts`
  - Updated retrieval module to reuse shared vector literal logic:
    - `apps/web/lib/retrieval/hybridSearch.server.ts`
  - Updated chat tests to mock embedding priming and verify call path:
    - `apps/web/lib/chat.routes.test.ts`
  - Added embedding tuning env vars to example:
    - `apps/web/.env.example`
  - Updated Compose images to PG17:
    - `docker-compose.yml`
    - `docker-compose.demo-prod.yml`
  - Added explicit agent/runbook guidance that local dev and Sprite dev are host-native (non-Docker):
    - `apps/web/AGENTS.md`
    - `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md`
  - Local machine runtime switched from Homebrew `postgresql@16` to `postgresql@17`; `orbital` DB has `vector` + `pgcrypto` extensions.
- Pending:
  - No commit created yet.
  - Fresh PG17 DB currently has no app data (chunk count = 0); need load-pack/ingest to populate embeddings.
  - Sprite VM runtime migration to PG17 must be done per-VM (not automatic from code changes).
- Blockers: none.

## 2) Working Tree
- `git status -sb` shows very dirty tree with many unrelated frontend/docs changes already present.
- Branch is `main` and status is `main...origin/main [ahead 2]`.
- `git rev-list --left-right --count @{upstream}...HEAD` => `0 2` (ahead by 2 local commits already).
- New files from this semantic work:
  - `apps/web/lib/retrieval/embedChunks.server.ts`
  - `apps/web/lib/retrieval/vectorLiteral.ts`
- Edited files from this semantic + docs work:
  - `apps/web/.env.example`
  - `apps/web/AGENTS.md`
  - `apps/web/app/(api)/folders/[id]/chat/route.ts`
  - `apps/web/lib/chat.routes.test.ts`
  - `apps/web/lib/ingest/ingestProcessor.server.ts`
  - `apps/web/lib/retrieval/hybridSearch.server.ts`
  - `docker-compose.yml`
  - `docker-compose.demo-prod.yml`
  - `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md`

## 3) Branch/PR
- Current branch: `main`.
- PR: none opened from this session.
- CI status: unknown (no PR).

## 4) Running Processes
- tmux sessions:
  - `0: 1 windows (attached)`
- tmux panes:
  - `0:1.0 pid=78627 cmd=codex-aarch64-a active=0`
  - `0:1.1 pid=27683 cmd=codex-aarch64-a active=0`
  - `0:1.2 pid=5447 cmd=codex-aarch64-a active=0`
  - `0:1.3 pid=58383 cmd=codex-aarch64-a active=1`
- Postgres services:
  - `postgresql@16 none`
  - `postgresql@17 started`
- Useful commands:
  - Attach tmux: `tmux attach -t 0`
  - Capture recent logs: `tmux capture-pane -p -J -t 0:1.3 -S -300`

## 5) Tests/Checks
- Passed:
  - `pnpm --filter @orbital-poc/web test lib/chat.routes.test.ts`
  - `pnpm --filter @orbital-poc/web typecheck`
  - `pnpm --filter @orbital-poc/web lint` (warnings only, pre-existing unrelated)
  - `pnpm --filter @orbital-poc/web build`
  - `pnpm --filter @orbital-poc/web test test/chunksRetrievalSchema.int.test.ts`
  - `pnpm --filter @orbital-poc/web test test/ingestDocumentStepIdempotency.int.test.ts`
- DB semantic readiness snapshot:
  - server_version: `17.8 (Homebrew)`
  - `vector` extension: `true`
  - `chunks.embedding` column exists: `true`
  - `chunks total`: `0`
  - `chunks embedded`: `0`

## 6) Next Steps
1. Run normal dev flow to seed fresh PG17 DB (`load pack` -> `run analysis` -> chat), then verify `chunks.embedding` count increases.
2. If using Sprite VM host Postgres, migrate each VM to PG17 and enable `vector`/`pgcrypto`.
3. Commit only intended files from this work (avoid unrelated dirty-tree files).
4. Optional: add a semantic-health endpoint/command to show pending vs embedded chunk counts.

## 7) Risks/Gotchas
- Very dirty working tree; high risk of accidental staging.
- Local PG17 cluster is fresh; prior local PG16 data is not present in current runtime.
- Semantic priming depends on `AI_GATEWAY_API_KEY` + `EMBED_MODEL` being set at runtime.
- `docker-compose.demo-prod.yml config` cannot be validated without required env interpolation variables (`BASIC_AUTH_PASS`, `OBJECT_STORE_SIGNING_SECRET`, etc.).
- Repo docs now treat local/Sprite as host-native; old notes elsewhere may still mention local Docker patterns.
