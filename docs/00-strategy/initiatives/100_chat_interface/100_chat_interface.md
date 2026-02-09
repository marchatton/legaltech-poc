Yep on (1): I’m still suggesting Postgres + **pgvector**, just now explicitly as **IVFFlat first**, with an ADR note that **HNSW is a later swap** once we care more about recall/latency tradeoffs and we’ve got enough data and observability to tune it. pgvector documents both IVFFlat and HNSW, and calls out the “too little data for the number of lists” footgun for IVFFlat plus probes tuning. ([GitHub][1])

And yes on parallel work: you can split it cleanly into **(A) retrieval substrate + hybrid search** and **(B) chat UX + WDK durable execution**. The trick is a tiny “PR0” that creates the seam so the two PRs don’t fight each other in `ensureSchema()` and in shared library boundaries.

Below is the shaped packet split into **PR0 + PRD A + PRD B**, plus a small “after” mini‑PRD.

---

# PR0 (mini PRD) Shared foundations for hybrid retrieval + Matter chat

## Intent

Unblock two parallel workstreams by creating stable seams:

* One place for **AI SDK AI Gateway** config and model selection.
* One place for **schema evolution** (modules) so PRD A and PRD B can add tables/columns without merge hell.
* One retrieval interface contract that chat can call even while retrieval is still being built.

## Goals

* Introduce `apps/web/lib/ai/gateway.server.ts` that returns an AI SDK model handle via **AI Gateway**.
* Modularise schema creation so “retrieval schema” and “chat schema” can be appended independently.
* Add a thin retrieval interface (types only) so chat compiles against it.

## Non-goals

* No actual hybrid retrieval yet.
* No chat UI yet.

## Notes on AI Gateway (this is the exact decision you asked for)

* Use AI SDK’s **Gateway provider** (the one from `@ai-sdk/gateway`). It requires AI SDK ≥ **5.0.36**. ([Vercel][2])
* Local dev uses `AI_GATEWAY_API_KEY`; Vercel can use OIDC as an alternative (handy later). ([Vercel][3])
* Model ids we’ll pin:

  * default chat model: `anthropic/claude-haiku-4.5` ([Vercel][4])
  * later switch: `anthropic/claude-sonnet-4.5` ([Vercel][5])

## Deliverables

1. **AI Gateway wrapper**

* `apps/web/lib/ai/gateway.server.ts`

  * exports `chatModel()` and `embeddingModel()`
  * centralises model strings and any future toggles (haiku vs sonnet)

2. **Schema modularisation**

* Create `apps/web/lib/db/schema/*.server.ts`
* `ensureSchemaInner()` becomes:

  * `ensureCoreSchema(sql)`
  * `ensureRetrievalSchema(sql)`
  * `ensureChatSchema(sql)`
* PRD A owns `ensureRetrievalSchema`
* PRD B owns `ensureChatSchema`

3. **Retrieval contract placeholder**

* `apps/web/lib/retrieval/types.ts`

  * `HybridSearchHit { chunk_id, document_id, page_start, page_end, score, lex_score?, sem_score? }`
  * `hybridSearch(folderId, indexVersion, queryText, opts)` signature

## Risks / gotchas

* Dependency drift: lock `ai` and `@ai-sdk/gateway` versions together (gateway provider doc explicitly calls out the minimum). ([Vercel][2])
* If your refactor is removing dev-only gates, PR0 should not add new `assertDevOnly` usage. Everything here is production-safe.

## “Definition of done”

* Code compiles.
* `ensureSchema()` still idempotent, and there’s a clean place to add retrieval/chat bits without editing the same file.

---

# PRD A Hybrid search substrate v0 (tsvector + pgvector IVFFlat)

## One-liner

Make `chunks` actually searchable via hybrid lexical + vector search, with embeddings stored in Postgres and an IVFFlat index now (ADR note: HNSW later).

## User-facing outcome

On a Matter page, we can retrieve relevant chunks for a user query with:

* lexical matching (“find the exact term”)
* semantic matching (“same concept, different wording”)

Even before chat exists, this is usable via a simple debug endpoint and logs.

## Scope (what’s in)

* Store embeddings on `chunks`.
* Add a tsvector for lexical search on `chunks`.
* Implement a **hybrid search function** that returns **chunk IDs** (IDs-only contract, aligned with your target docs).
* Build pgvector IVFFlat index and GIN index.
* Add an ADR: “IVFFlat now, HNSW later”.

## Scope (explicitly out)

* Reranker model
* OCR geometry
* Entailment verification (we keep deterministic-only integrity posture)
* Cross-matter search (not needed)

---

## Architecture choices

### Why pgvector

Because you asked for hybrid and you already have Postgres as the persistence spine. pgvector supports the distance operators we need, and documents both IVFFlat and HNSW indexing options. ([GitHub][1])

### IVFFlat now, HNSW later

* IVFFlat is a good “cheap first” index, but it has the classic pitfall: if you create it with too little data for the number of lists, you can get fewer results and should drop/recreate later; probes tuning matters too. ([GitHub][1])
* So our v0 plan: **IVFFlat with conservative lists**, plus a knob for `ivfflat.probes`.

---

## Data model changes (concrete)

### 1) `chunks` table additions

Add columns:

* `text_tsv tsvector` (either generated stored or maintained by trigger; generated stored is simplest if supported)
* `embedding vector(1536)` (dimension pinned to embedding model)
* `embedding_model TEXT NOT NULL DEFAULT 'openai/text-embedding-3-small'`
* `embedded_at TIMESTAMPTZ NULL`

About the 1536: OpenAI’s embeddings guide documents `text-embedding-3-small` as **1536 dims**.
(And we’re using it through AI Gateway as `openai/text-embedding-3-small`.) ([Vercel][2])

### 2) New indexes

* Lexical:

  * `CREATE INDEX ... ON chunks USING gin (text_tsv);`
* Vector (IVFFlat cosine):

  * `CREATE INDEX ... ON chunks USING ivfflat (embedding vector_cosine_ops) WITH (lists = ...);` ([GitHub][1])

Note: cosine distance uses the `<=>` operator; similarity is `1 - cosine_distance`. ([GitHub][1])

### 3) ADR update

Add a new ADR (number as you see fit) under `docs/03-architecture/ADR-00xx_vector_indexing.md`:

* Decision:

  * Use `pgvector` with **IVFFlat** for v0
  * Use cosine distance
  * Tune via `lists` and `ivfflat.probes`
  * Revisit **HNSW** after we have:

    * query latency metrics
    * recall@K eval fixtures
    * a data size threshold where HNSW pays off
* Why:

  * simpler ops and cheaper early
  * HNSW tuning later

Call out pgvector’s warning about IVFFlat created with too little data and probe tuning. ([GitHub][1])

---

## Hybrid retrieval implementation (deep dive)

### Retrieval contract

Implement:

```ts
type HybridSearchOpts = {
  kLex?: number;    // default 20
  kSem?: number;    // default 20
  kFinal?: number;  // default 10
  lexWeight?: number; // default 0.55
  semWeight?: number; // default 0.45
  probes?: number;  // default computed
};

async function hybridSearch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
}): Promise<HybridSearchHit[]>;
```

### The query strategy (keep it simple and debuggable)

Do **two queries + merge in TS** first. It’s easier to reason about and easier to tune. SQL-only hybrid scoring is possible, but you’ll spend your time fighting normalisation and edge cases.

1. Lexical hits:

* `websearch_to_tsquery('english', query)`
* `ts_rank_cd` for scoring
* cap at `kLex`

2. Semantic hits:

* embed query via AI Gateway embeddings
* `ORDER BY embedding <=> $qvec`
* cap at `kSem`
* set `ivfflat.probes` for the session if using IVFFlat

pgvector explicitly calls out that IVFFlat results can be limited by `ivfflat.probes`. ([GitHub][1])

3. Merge:

* dedupe by `chunk_id`
* convert semantic distance to similarity (`1 - distance`) ([GitHub][1])
* final score: `lexWeight*lex + semWeight*sem`
* return top `kFinal`

### Probes and lists (the risky bit)

You asked for IVFFlat, so we need a plan that doesn’t rot:

* `lists` should not be a constant forever.
* v0 approach:

  * choose `lists = clamp(1, 100, floor(nVectors / 1000))`
  * for tiny datasets, `lists=1` essentially degenerates to brute force but keeps the path stable
* `probes` default:

  * `min(10, lists)` (simple) and adjustable per request in debug builds

And we should add a debug log line: `lists`, `probes`, `nVectors`, and hit counts from both branches.

---

## Ingest + embedding pipeline (deep dive)

### Why this is the real risk

Right now `ingestQueue.server.ts` writes **one chunk per page** with page text. That is too big for citations and too coarse for retrieval.

### Minimal upgrade path (still doable)

* Keep `document_pages.text` as-is.
* Replace “1 chunk per page” with “N chunks per page” using a **character window** chunker:

  * `max_chars = 1500`
  * `overlap_chars = 200`
  * split on whitespace boundaries when possible
  * deterministic for `(document_id, index_version)`
* Store in `chunks.metadata_json`:

  * `chunker_id: "char_window_v0"`
  * params
  * `page_number`
  * `char_start`, `char_end`

It’s not as pretty as the target line-based chunker, but it is:

* deterministic
* fast
* produces small citation snippets

Then embed each chunk:

* model: `openai/text-embedding-3-small` (via AI Gateway) ([Vercel][2])
* validate embedding length is 1536 (fail closed otherwise)
* store `embedding`, `embedded_at`, `embedding_model`

### Operational note for IVFFlat index creation

Because pgvector warns about IVFFlat built with too little data, we do not want to “always create IVFFlat with lists=100 on day 1”. That’s the path to weird behaviour. ([GitHub][1])

So v0 plan:

* Create the table and columns in schema.
* Create GIN index immediately.
* Create IVFFlat index in a small “ensureVectorIndex” function that:

  * checks `count(*) where embedding is not null`
  * computes lists
  * creates the index if missing and `nVectors >= 500` (tunable)

That gives you a safety valve.

---

## Testing / evals (keep it light but real)

* Unit test for chunker determinism (same input → same chunks).
* Integration test: insert 3-5 chunks, embed with a stub vector, verify:

  * lexical query returns expected chunk_id
  * semantic query returns expected chunk_id
  * hybrid merge stable ordering

---

## PRD A risks and mitigations

1. **pgvector extension availability**

* Mitigation: update docker image / compose to include pgvector, and fail with a safe error if extension missing.

2. **IVFFlat quality footguns**

* Mitigation: delay IVFFlat creation until there’s data, and compute conservative lists. pgvector explicitly calls out the “too little data” issue and probe limits. ([GitHub][1])

3. **Embedding cost drift**

* Mitigation: batch with `embedMany`, cap chunk count per doc, and record embedding model in DB for future reindex.

---

# PRD B Matter chat with documents v0 (WDK durable steps + streaming)

## One-liner

Per-Matter chat that streams answers and shows locked “Sources” (citations) backed by chunk IDs, using WDK for durability and AI SDK via AI Gateway with Claude Haiku 4.5.

## Scope (what’s in)

* Chat UI inside a Matter view (single matter context).
* Streaming assistant responses (delight feature).
* Retrieval per message using PRD A hybrid search.
* Locked citations per assistant message, using snippet hashing you already have.
* WDK durable steps for the chat run.

## Scope (out)

* Cross-matter chat
* Org switching UI
* Perfect highlight geometry (we’ll do “coarse highlight” until OCR lands)
* Entailment verification (integrity-only posture)

---

## Model choice

* v0 default: `anthropic/claude-haiku-4.5` via AI Gateway. ([Vercel][4])
* Later: switch to `anthropic/claude-sonnet-4.5` once UX and quality are proven. ([Vercel][5])

---

## Data model (chat persistence)

Add tables (minimal, purpose-built):

### `chat_threads`

* `id TEXT PK`
* `folder_id TEXT FK folders(id)`
* `title TEXT NULL`
* `created_at`, `updated_at`

### `chat_messages`

* `id TEXT PK`
* `thread_id TEXT FK chat_threads(id)`
* `role TEXT CHECK ('user','assistant')`
* `content TEXT NOT NULL`
* `status TEXT CHECK ('streaming','complete','citation_failed')`
* `created_at`

### `chat_citations`

* `id TEXT PK` (eg `ccit_...`)
* `chat_message_id TEXT FK chat_messages(id)`
* `document_id TEXT NOT NULL`
* `page_number INT NOT NULL`
* `snippet TEXT NOT NULL`
* `snippet_hash TEXT NOT NULL` (use your canonical `hashSnippet`)
* `polygons_json JSONB NOT NULL`
* `created_at`

Why a new citations table instead of reusing `citations`?

* Your existing `citations` table is hard-wired to `report_row_id NOT NULL`.
* Generalising it is a bigger refactor than this slice.

---

## Citations without geometry (risky/vague, so here’s the plan)

Right now your ingest has **no layout geometry** (pdf.js text extraction, `has_geometry=false`). So:

* We store **coarse polygons** as a full-page anchor box: `[0,0] [1,0] [1,1] [0,1]`
* This keeps the highlight overlay working and keeps the verifier happy (polygons are present and normalised).
* UI label it honestly as “page-level highlight” until OCR is integrated.

This is the smallest way to preserve your “evidence-first” interaction without pretending we have precise bounding boxes.

---

## WDK execution design (deep dive)

### Key constraint to respect

WDK streams can be passed in/out of steps, but **cannot be read/written in workflow context**. Only step functions can write to them. ([Workflow DevKit][6])

So we structure chat as:

* workflow orchestrates
* steps do DB + retrieval + model streaming

### Chat “run” shape

One WDK workflow per assistant response (simple and parallel-friendly).

Steps:

1. `load_thread_context`
   Fetch last N messages from `chat_messages` for the thread (N small, eg 20).

2. `hybrid_retrieve`
   Call PRD A `hybridSearch` using the latest user message as query.

3. `hydrate_chunks`
   Fetch chunk text + doc/page metadata for top K.

4. `stream_answer`
   Use AI SDK streaming to write to the WDK stream (this is where tokens flow to UI).

5. `lock_citations`
   Create `chat_citations` rows from the retrieved chunks (or from top M chunks) with:

* snippet = chunk text
* snippet_hash = `hashSnippet(snippet)` (your canonical)
* polygons = full page box

6. `finalise_message`
   Mark `chat_messages.status` complete, and optionally write a final `data-sources` chunk into the stream so the client can render sources without an extra fetch.

### Streaming implementation approach

For the actual response streaming, keep it boring:

* use AI SDK `streamText(...)` with model set to AI Gateway, and return a UI stream response.
* the AI SDK docs show direct `streamText` usage with `toUIMessageStreamResponse` and model ids in the `provider/model` format. ([AI SDK][7])

WDK side:

* Use the WDK Next.js integration (`start` + stream response helpers) so the stream is durable/resumable at the infra layer later if you want it. ([AI SDK][8])
* For local dev vs Vercel: WDK streams are backed by filesystem locally, and Redis on Vercel deployments. ([Workflow DevKit][6])

(If you want the reconnect endpoint now, it’s a small follow-up; I’m putting it in the “after” mini PRD to keep this from ballooning.)

---

## Prompt / behaviour (keep it aligned with your invariants)

System prompt for v0:

* “Answer using only the provided sources.”
* “If not supported, say: `Not found in provided documents.`”
* “Be concise.”

We will not rely on the model to format citations perfectly in-text. We show sources separately as chips, which keeps the streaming path simple and avoids “JSON-in-stream” headaches.

---

## UI breadboard

Inside `/matters/[id]`:

* Existing “Seeded documents / Quick Start / Exports” stays.
* Add `Chat` panel:

  * message list
  * streaming assistant bubble
  * “Sources” section under assistant bubble with chips:

    * `doc_id + page` label
    * opens a citation viewer page (reusing your `CitationViewerClient`) using `chat_citations/:id`

Delight features in this PRD:

1. **Streaming response**
2. **Clickable sources that open the PDF viewer with highlight (coarse for now)**

---

## API surface

New routes (production-safe, no dev-only):

* `POST /api/matters/:id/chat`

  * body: `{ thread_id?, message: string }`
  * returns: UI stream response

* `GET /api/chat-citations/:id`

  * returns: `{ citation: { id, document_id, page_number, polygons, snippet, snippet_hash } }`

New app routes:

* `/matters/[id]/chat` (optional, or embed in existing page)
* `/citations/[id]` (DB-backed citation viewer)

---

## PRD B risks and mitigations

1. **WDK stream wiring can be fiddly**

* Mitigation: keep one workflow per assistant response; don’t do multi-turn hooks yet.
* Respect “streams only writable in steps”. ([Workflow DevKit][6])

2. **No geometry**

* Mitigation: full-page polygon with honest UI label; keep evidence snippet + hash as the trust anchor.

3. **Chat persistence while streaming**

* Mitigation: create `chat_messages` row as `streaming` first, then update to `complete` after the model finishes; if the run fails, mark `citation_failed`.

---

# Mini PRD “after” Follow-ups (intentionally small)

## 1) Add reconnect/resume for streaming

WDK supports resumable streams and has guidance on Next endpoints to reattach to a run’s stream. ([Workflow DevKit][6])
This is the next “delight” once v0 is stable.

## 2) Switch IVFFlat → HNSW

Once you’ve got:

* latency metrics
* recall@K fixtures
* enough vector count per index

Then add an ADR update and implement an HNSW index (pgvector documents HNSW too). ([GitHub][1])

## 3) Replace coarse highlight with OCR geometry

When OCR/layout lands, lock real polygons per chunk and the viewer becomes genuinely evidence-first.

---

# Parallelisation plan

## PR0 (half day)

* gateway wrapper
* schema modularisation
* retrieval contract stub

## PRD A (Hybrid search)

* owned by one dev
* touches: chunking, embeddings, indexes, retrieval fn

## PRD B (Chat)

* owned by another dev
* touches: chat tables, chat route, viewer route, UI

The only shared file should be the schema entrypoint after PR0, and we explicitly designed it so each PR adds a new schema module rather than editing `db.server.ts` in-line.

---

# Sketch file tree

Here’s a concrete “what changes where” tree. I’m including both new files and the likely edits.

```txt
docs/
  03-architecture/
    ADR-00xx_vector_indexing_ivfflat.md          # new (IVFFlat now, HNSW later)
  04-projects/
    02-features/
      0011_chat_interface/
        0011-0_foundations.md                    # PR0 shaped packet
        0011A_hybrid_retrieval_v0.md             # PRD A shaped packet
        0011B_matter_chat_v0.md                  # PRD B shaped packet
        0011C_followups.md                       # mini after PRD

apps/web/
  lib/
    ai/
      gateway.server.ts                          # new (AI Gateway model helpers)
    db/
      schema/
        core.server.ts                           # new (existing tables extracted)
        retrieval.server.ts                      # new (chunks columns, indexes, pgvector ext)
        chat.server.ts                           # new (chat_* tables)
      db.server.ts                               # edit: call schema modules
    retrieval/
      types.ts                                   # new
      hybridSearch.server.ts                     # new
      hydrateChunks.server.ts                    # new
      embed.server.ts                            # new (embedMany wrapper + length checks)
    ingest/
      ingestQueue.server.ts                      # edit: new chunking + embed chunks
      chunkerCharWindow.server.ts                # new

  app/
    (api)/
      matters/
        [id]/
          chat/
            route.ts                             # new (POST stream)
      chat-citations/
        [id]/
          route.ts                               # new (GET citation payload)
    (app)/
      matters/
        [id]/
          ChatPanel.tsx                          # new (UI)
          page.tsx                               # edit: render ChatPanel
      citations/
        [id]/
          page.tsx                               # new (DB-backed citation viewer)
          CitationViewerClient.tsx               # reuse or import from existing viewer
```

---

If you want one more layer of concreteness, the two highest-risk “implementation detail” decisions that I’d bake in immediately are:

1. **IVFFlat creation strategy**: do not hardcode `lists=100` on day 1. Make it conditional on vector count, because pgvector explicitly warns about IVFFlat built with too little data and probe limits. ([GitHub][1])

2. **Streaming + persistence**: in v0 keep “one workflow per assistant response”, and only write to the stream inside a step (WDK constraint). ([Workflow DevKit][6])
   Once stable, then do the multi-turn durable agent session with reconnection (follow-up mini PRD).

If you want, next iteration I can write the exact step keys/idempotency scheme (down to string formats) and the SQL for both retrieval queries and the schema migration pattern (`ALTER TABLE ADD COLUMN IF NOT EXISTS` etc), but this should be enough to start cutting code without stepping on rakes.

[1]: https://github.com/pgvector/pgvector "https://github.com/pgvector/pgvector"
[2]: https://vercel.com/docs/ai-gateway/models-and-providers "https://vercel.com/docs/ai-gateway/models-and-providers"
[3]: https://vercel.com/docs/ai-gateway/getting-started "https://vercel.com/docs/ai-gateway/getting-started"
[4]: https://vercel.com/ai-gateway/models/claude-haiku-4.5 "https://vercel.com/ai-gateway/models/claude-haiku-4.5"
[5]: https://vercel.com/ai-gateway/models/claude-sonnet-4.5 "https://vercel.com/ai-gateway/models/claude-sonnet-4.5"
[6]: https://useworkflow.dev/docs/foundations/streaming "https://useworkflow.dev/docs/foundations/streaming"
[7]: https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream-response "https://ai-sdk.dev/docs/reference/ai-sdk-ui/create-ui-message-stream-response"
[8]: https://ai-sdk.dev/docs/getting-started/nextjs-pages-router "https://ai-sdk.dev/docs/getting-started/nextjs-pages-router"
