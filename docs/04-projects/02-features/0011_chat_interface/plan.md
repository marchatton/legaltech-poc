# Plan: PR0 Foundations (Hybrid Retrieval + Matter Chat)

Owner: TBD  
Status: READY (plan only; implementation not started)  
Date: 2026-02-09

Source PR0 mini-PRD: `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md`.

## Decisions (locked)

1. Retrieval contract lives in `apps/web/lib/retrieval/types.ts`.
2. AI env is fail-closed: require `AI_GATEWAY_API_KEY` and `EMBED_MODEL`. Default chat model is `anthropic/claude-haiku-4.5`, overridable via `LLM_MODEL_CHAT`.
3. Pin exact versions (no `^`). Lock `ai` and `@ai-sdk/gateway` together. AI SDK must be `>= 5.0.36`.
4. Move `chunks` DDL into `ensureRetrievalSchema(sql)` in PR0.
5. Document env vars via `apps/web/.env.example`.

## Scope

In scope (PR0):

- `apps/web/lib/ai/gateway.server.ts` (AI SDK AI Gateway wrapper).
- Schema modularisation under `apps/web/lib/db/schema/*.server.ts` so PRD A and PRD B own different modules.
- `apps/web/lib/retrieval/types.ts` types-only contract so chat compiles before retrieval exists.

Out of scope (PR0):

- No hybrid retrieval implementation (no embeddings, indexes, search code).
- No chat UI/routes/workflows (no WDK durable execution).

## Deliverables + Acceptance Criteria

1. AI Gateway wrapper exists.
- File: `apps/web/lib/ai/gateway.server.ts`.
- Exports: `chatModel()` and `embeddingModel()`.
- Centralizes model IDs and toggle points (haiku now, sonnet later).
- Uses AI SDK Gateway provider from `@ai-sdk/gateway`.
- Production-safe: PR0 must not add new `assertDevOnly` usage.

2. Schema modularisation exists.
- New schema modules under `apps/web/lib/db/schema/`.
- `ensureSchemaInner()` delegates to `ensureCoreSchema(sql)`, `ensureRetrievalSchema(sql)`, `ensureChatSchema(sql)`.
- PRD A owns retrieval module; PRD B owns chat module.
- `ensureSchema()` remains idempotent and safe to call multiple times.

3. Retrieval contract placeholder exists.
- File: `apps/web/lib/retrieval/types.ts`.
- Defines `HybridSearchHit` exactly as PR0 specifies.
- Provides a placeholder callable signature `hybridSearch(folderId, indexVersion, queryText, opts)`.
- Types-only: no DB imports, no AI imports.

## Work Breakdown

### Step 1: Schema Modularisation (merge-conflict seam)

Goal: After PR0, PRD A and PRD B can evolve DB independently without editing the monolithic `apps/web/lib/db.server.ts`.

Create new files:

- `apps/web/lib/db/schema/core.server.ts`
- `apps/web/lib/db/schema/retrieval.server.ts`
- `apps/web/lib/db/schema/chat.server.ts`
- `apps/web/lib/db/schema/index.server.ts`

Define stable contracts:

- `ensureCoreSchema(sql)`
- `ensureRetrievalSchema(sql)`
- `ensureChatSchema(sql)`
- `ensureAllSchemas(sql)` calls core then retrieval then chat

Refactor `apps/web/lib/db.server.ts`:

- Preserve exports and caching semantics of `ensureSchema()`.
- Replace existing monolithic `ensureSchemaInner()` implementation with `await ensureAllSchemas(sql)`.

Lift-and-shift DDL blocks:

- `ensureCoreSchema(sql)` owns all current DDL except `chunks`.
- `ensureRetrievalSchema(sql)` owns `chunks` (as-is in PR0).
- `ensureChatSchema(sql)` is a no-op in PR0.

DDL ownership mapping (PR0):

- Core: `folders`, `documents`, `document_pages`, `jobs` (+ indexes), `runs`, `run_steps` (+ indexes), `report_rows` (+ indexes), `citations` (+ indexes), `artefacts` (+ indexes).
- Retrieval: `chunks`.
- Chat: none yet.

Hard rules:

- Idempotent DDL only: `CREATE TABLE IF NOT EXISTS`, `CREATE INDEX IF NOT EXISTS`.
- No destructive schema operations in PR0.
- Do not add runtime `CREATE EXTENSION` in PR0. Keep local dev extensions in `scripts/db/init.sql` + `docker-compose.yml`.

Merge-conflict guardrail (review rule):

- After PR0, PRD A only edits `apps/web/lib/db/schema/retrieval.server.ts` for retrieval schema changes.
- After PR0, PRD B only edits `apps/web/lib/db/schema/chat.server.ts` for chat schema changes.
- The only shared file should be `apps/web/lib/db/schema/index.server.ts` (and only if call order changes).

### Step 2: Retrieval Contract Placeholder (types-only)

Create:

- `apps/web/lib/retrieval/types.ts`

Add types:

- `HybridSearchHit` with fields:
- `chunk_id: string`
- `document_id: string`
- `page_start: number | null`
- `page_end: number | null`
- `score: number`
- `lex_score?: number`
- `sem_score?: number`

Add placeholder signature:

- `hybridSearch(folderId, indexVersion, queryText, opts)`

Constraints:

- Types-only module (no DB, no AI SDK imports).
- IDs-only posture (aligns with ADR-0004: retrieval returns addresses, not snippets).

### Step 3: AI Gateway Wrapper (server-only)

Update dependencies:

- Modify `apps/web/package.json`:
- Add `ai` (must be `>= 5.0.36`).
- Add `@ai-sdk/gateway`.
- Pin exact versions (no `^`) and lock them together.

Create:

- `apps/web/lib/ai/gateway.server.ts`

Implementation requirements:

- Server-only boundary: `import "server-only";`.
- Must not throw at import-time.
- Fail-closed config:
- Require `AI_GATEWAY_API_KEY`.
- Require `EMBED_MODEL`.
- Default `chatModel` id is `anthropic/claude-haiku-4.5`, overridable via `LLM_MODEL_CHAT`.
- Centralize “later switch” target (documented constant): `anthropic/claude-sonnet-4.5`.
- Production-safe: do not introduce new dev-only gates in PR0.

### Step 4: Env Example

Create:

- `apps/web/.env.example`

Include:

- `AI_GATEWAY_API_KEY=`
- `LLM_MODEL_CHAT=anthropic/claude-haiku-4.5`
- `EMBED_MODEL=`

## Verification Plan (when implementing)

Fast checks:

- `pnpm -r typecheck`
- `pnpm -r test`

Targeted smoke (dev):

- Call an existing endpoint that triggers `ensureSchema()` (e.g. `/folders`) twice; confirm no DDL errors.
- Upload/ingest a PDF; confirm `document_pages` and `chunks` still populate.
- Confirm folder state derivation still works (depends on `chunks` + `index_version`).

Boundary check:

- Ensure `apps/web/lib/ai/gateway.server.ts` is only imported from server code (routes, server libs).

## Risks + Mitigations

- Dependency drift: exact pins prevent PRD A/B from silently diverging.
- Schema module drift: enforce the ownership rule in code review (retrieval changes belong in retrieval schema module; chat changes in chat schema module).
- Env surprises: fail-closed in the gateway wrapper prevents partial configuration from producing undefined behavior later.
