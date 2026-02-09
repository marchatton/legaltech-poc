# Plan.ms: 0011b Matter Chat v0 (WDK Durable Steps + Streaming + Locked Sources)

Last updated: 2026-02-09

Split source:
- `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md` (PRD B section)

Repo grounding:
- Target WDK conventions: `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- Target API contract + spike rules: `docs/03-architecture/50_api_surface.md`
- Current runtime reality (WDK + retrieval not implemented yet): `docs/03-architecture/07_current_poc_runtime.md`
- Current Matter UI is dev-only today: `apps/web/app/(app)/matters/*`

Assumptions / prerequisites:
- PRD0 is already implemented (AI Gateway wrapper + schema seams + retrieval types contract).
- Slice `0011a` exists and exports a callable `hybridSearch()` returning IDs-only hits.
- Dev-only API routes still exist but are being migrated; proceed without blocking, but avoid deepening drift.

## One-liner
Per-matter chat that streams answers and shows locked “Sources” backed by chunk IDs.

## Scope

In:
- Chat UI inside a Matter view.
- Streaming assistant responses.
- Per-message retrieval using `hybridSearch()` (slice 0011a).
- Locked citations per assistant message.
- WDK durable steps for the chat run (target posture).

Out:
- Cross-matter chat.
- Perfect OCR geometry highlights.
- Rerankers.
- Entailment verification.

## Model Choice

- v0 default chat model (via AI Gateway): `anthropic/claude-haiku-4.5`
- Later upgrade: `anthropic/claude-sonnet-4.5`

## Data Model (Chat Persistence)

Add minimal, purpose-built tables:

### `chat_threads`
- `id TEXT PK`
- `folder_id TEXT FK folders(id)`
- `title TEXT NULL`
- `created_at`, `updated_at`

### `chat_messages`
- `id TEXT PK`
- `thread_id TEXT FK chat_threads(id)`
- `role TEXT CHECK ('user','assistant')`
- `content TEXT NOT NULL`
- `status TEXT CHECK ('streaming','complete','citation_failed')`
- `created_at`

### `chat_citations`
- `id TEXT PK` (e.g. `ccit_...`)
- `chat_message_id TEXT FK chat_messages(id)`
- `document_id TEXT NOT NULL`
- `page_number INT NOT NULL`
- `snippet TEXT NOT NULL`
- `snippet_hash TEXT NOT NULL` (canonical `hashSnippet(snippet)`)
- `polygons_json JSONB NOT NULL`
- `created_at`

Why not reuse the existing `citations` table?
- Current `citations.report_row_id` is `NOT NULL` and hard-wired to quick-start report rows.
- Generalising it is a larger refactor than this slice.

## Citations Without Geometry (Honest v0)

Current ingest has `layout_json.has_geometry=false` (pdf.js text extraction). For v0:
- Store **coarse polygons** as a full-page box:
  - `[[[0,0],[1,0],[1,1],[0,1]]]`
- UI labels highlight honestly as “page-level highlight” until OCR geometry lands.

## WDK Execution Design (Deep Dive)

Key constraint:
- WDK streams can be passed in/out of steps, but **cannot be read/written in workflow context**. Only step functions can write to them.

v0 shape:
- **One WDK workflow per assistant response** (simple and parallel-friendly).

Steps (suggested):

1) `load_thread_context`
- Fetch last N messages from `chat_messages` (e.g. N=20).

2) `hybrid_retrieve`
- Call `hybridSearch()` using the latest user message as the query.

3) `hydrate_chunks`
- Fetch chunk text + doc/page metadata for the top K hits.

4) `stream_answer`
- Call the model (AI Gateway) and stream tokens to the WDK stream.

5) `lock_citations`
- Persist `chat_citations` rows from the chosen source chunks:
  - `snippet = chunk.text`
  - `snippet_hash = hashSnippet(snippet)`
  - `polygons_json = full-page box` (v0)

6) `finalise_message`
- Mark assistant `chat_messages.status='complete'`.
- Optionally emit a final “sources” payload chunk so the client can render sources without an extra fetch.

Idempotency:
- Each step must have deterministic `step_key` so retries do not duplicate messages/citations.

## Streaming Implementation (Keep It Boring)

- Use AI SDK streaming (`streamText(...)`) with the AI Gateway model.
- Do not require the model to produce structured citation JSON in-stream.
  - Render sources out-of-band under the assistant bubble.

## Prompt / Behaviour (Pinned)

System behavior for v0:
- “Answer using only the provided sources.”
- “If not supported, say exactly: `Not found in provided documents.`”
- “Be concise.”

## UI Breadboard (v0)

Inside `/matters/[id]` (Matter detail view):
- Keep existing doc list / quick-start / exports.
- Add a `Chat` panel:
  - message list
  - streaming assistant bubble
  - “Sources” section under assistant message as chips:
    - label: `{document_id} p.{page_number}`
    - click -> evidence viewer

Evidence viewer:
- Do not use `/citations/:id` for the page route (that path is already an API route).
- Recommended:
  - UI: `/evidence/:id` (page)
  - API: `GET /chat-citations/:id`

## API Surface (Repo-adapted)

New routes (target, production-safe paths; feature-flagged):
- `POST /folders/:id/chat`
  - body: `{ thread_id?, message: string }`
  - returns: streamed response + `thread_id`

- `GET /chat-citations/:id`
  - returns locked citation payload

## Notes On Dev-only Route Migration

- Today, Matter UI and some evidence endpoints are dev-only and fixture-backed.
- This slice should be compatible with dev-only operation, but must not add new “dev-only at target path” endpoints.
- If a hard requirement emerges to enable chat in demo-prod/prod, that becomes a separate gating/mode PRD (or a cut that expands this slice).

## Follow-ups (Intentionally Small)

1) Add reconnect/resume for streaming (once v0 stable).
2) Swap IVFFlat -> HNSW once metrics + recall fixtures exist.
3) Replace full-page highlights with OCR geometry when available.

## Risks + Mitigations

- WDK integration risk:
  - Mitigation: keep integration thin; one workflow per assistant response; avoid refactoring the existing job queue in this slice.
- No geometry:
  - Mitigation: honest page-level box, label it.
- Persistence + streaming correctness:
  - Mitigation: create assistant message as `streaming`, update to `complete` only on success; mark terminal failure on errors.

## Open Questions

1) Where should chat be enabled first?
- A. Dev-only first (behind existing gates)
- B. Enable in demo-prod mode as part of a production-build demo journey

2) One thread per matter or multiple threads?
- A. One thread per matter (simplest)
- B. Multiple threads with a list UI

3) How to show sources?
- A. Chips under the assistant bubble (recommended)
- B. Inline citations in generated text (brittle)
