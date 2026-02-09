# Matter Chat Slice (0011_chat_interface) - Condensed Shaping Prompt

Note: This file is intentionally short enough to paste into the ChatGPT UI. The original Oracle bundle (full file map + full file contents) is preserved as:
`docs/04-projects/02-features/0011_chat_interface/tmp-oracle/oracle-prompt.full.md`

## What To Produce
Return a shaped packet in the same style/tone as:
- `docs/04-projects/02-features/0001_trust-substrate/*`
- `docs/04-projects/02-features/0002_quick-start-engine/*`
(`docs/04-projects/_templates/*` exists but is marked deprecated; use dossiers above as the real examples.)

Deliverables (as Markdown sections, each labeled with the target path):
- `docs/04-projects/02-features/0011_chat_interface/brief.md`
- `docs/04-projects/02-features/0011_chat_interface/prd.md` (or `prd-overall.md` if you split)
- `docs/04-projects/02-features/0011_chat_interface/breadboard-pack.md`
- `docs/04-projects/02-features/0011_chat_interface/risk-register.md`
- Optional: `docs/04-projects/02-features/0011_chat_interface/plan.md` (coherent implementation approach + sequencing)

## Task
Shape a 2-3 dev-day expansion of `orbital-poc` to add per-matter "chat with documents" (retrieval + citations) using Vercel AI SDK with an Anthropic provider, plus a UI that supports multiple Matters under a single Organization (no org switching in the UI for the PoC).

## Current Architecture (Facts + Pointers)
- Domain naming: DB/API uses `folders` as the workspace container; UI calls it a "Matter". See `docs/03-architecture/10_system_architecture.md` + `docs/03-architecture/20_state_model.md`.
- Stack/runtime:
  - Next.js App Router app in `apps/web`
  - Postgres runtime schema (DDL-on-boot) in `apps/web/lib/db.server.ts`
  - Local filesystem object store in `apps/web/lib/objectStore.server.ts`
- Ingest (implemented today):
  - pdf.js text extraction (not OCR/geometry) writing `document_pages` + `chunks` (one chunk per page)
  - Queue entrypoint: `apps/web/lib/ingest/ingestQueue.server.ts`
  - Processor: `apps/web/lib/ingest/ingestProcessor.server.ts`
- Evidence-first viewer UX (implemented today; fixture/seed-backed):
  - `/matters?pack=...` demo UI + `/citations/:id` API.
  - Snapshots under `tmp/fixture-seed`.
  - Viewer has fail-closed overlay/highlight behavior.
  - Key files: `apps/web/lib/fixtureSeed.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(app)/matters/viewer/*`.
- Matter detail (implemented today; DB-backed):
  - `/matters/[id]` reads `folders` and `documents` directly from Postgres and constructs signed PDF links.
  - File: `apps/web/app/(app)/matters/[id]/page.tsx`.
- Target architecture docs (aspirational, not fully implemented):
  - RAG retrieve->draft->lock->verify pipeline; hybrid retrieval (tsvector+pgvector); AI SDK as the single model interface; durable orchestration via WDK.
  - See `docs/03-architecture/*` (esp `40_rag_and_agents.md`, `50_api_surface.md`, `60_observability_and_evals.md`).

## DB Schema Snapshot (From `apps/web/lib/db.server.ts`)
- `folders` ("Matters"):
  - `state` is one of: `empty`, `ingesting`, `indexed`, `ready`, `failed`
  - `latest_index_version` default `v1`
- `documents`:
  - `parse_status`: `queued`, `parsing`, `parsed`, `failed`
  - `ocr_status`: `queued`, `running`, `done`, `failed`
  - `metadata_json` + `error_json`
- `document_pages`: per-page extracted `text` + `layout_json`
- `chunks`: per-doc, per-index-version chunks (currently 1 chunk per page)
- Durable run/trust spine tables exist: `jobs`, `runs`, `run_steps`, `report_rows`, `citations`, `artefacts`
  - `citations` row shape: `(id, report_row_id, document_id, page_number, snippet, snippet_hash, polygons_json, locked_at, created_at)`

Ingest specifics (from `apps/web/lib/ingest/ingestProcessor.server.ts`):
- `layout_json.has_geometry = false` (no polygons/geometry today)
- Document `metadata_json` includes: `extraction_method = "pdfjs"`, `extraction_has_geometry = false`, `extraction_quality_method = "pdfjs_text_chars_per_page_v2"`
- Chunking: one chunk per page (`chunks.page_start = page_end = page_number`); `chunks.metadata_json` includes `{ page_number }`

## Existing UI + API Surfaces (Key Files)
- Fixture-seeded Matter UI:
  - `apps/web/app/(app)/matters/page.tsx`
  - `apps/web/app/(app)/matters/MattersToolbar.tsx`
  - `apps/web/app/(app)/matters/viewer/page.tsx`
  - `apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx`
  - `apps/web/app/(app)/matters/actions.ts`
  - `apps/web/lib/fixtureSeed.server.ts`
- DB-backed Matter detail:
  - `apps/web/app/(app)/matters/[id]/page.tsx`
- Folder/doc HTTP API patterns (Zod validation + `safeErrorEnvelope`):
  - `apps/web/app/(api)/folders/route.ts`
  - `apps/web/app/(api)/folders/[id]/route.ts`
  - `apps/web/app/(api)/folders/[id]/documents/route.ts`
  - `apps/web/app/(api)/documents/[id]/*` (upload completion + signed render URL + signed PDF serving with Range support)
- Demo seeding:
  - `apps/web/app/(api)/demo/load-pack/route.ts` (dev-only + demo-mode gated) seeds a DB folder from fixture PDFs under `docs/08-example-data/*`
- Persistence + trust primitives:
  - `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/*` (canonical snippet hashing + integrity verifier semantics)

## Relationship Flows (Today)
- `/matters?pack=...` (fixture-seeded) -> citation chips -> `/matters/viewer?pack=...&citation=...` -> `GET /citations/:id` (fixture snapshot) -> `GET /documents/:id/render?page=N` -> `GET /documents/:id/pdf?...`
- `/matters/[id]` (DB-backed) reads `folders`+`documents` tables directly and uses object-store signing helpers to build `/documents/:id/pdf?...`
- Ingest populates `document_pages` and `chunks` for uploaded/seeded PDFs; there is not yet an implemented retrieval+draft+lock system over `chunks`.

## Known Ambiguities You Must Resolve In The Shaped Packet
- There are effectively two "Matter" experiences today:
  - fixture-seeded report/citation demo at `/matters?pack=...`
  - DB-backed folder/document detail at `/matters/[id]`
  Decide whether the multi-matter + chat UI should build on the DB-backed `/folders` APIs (and/or unify these surfaces) vs keep chat as another dev-only demo slice.
- No Organization concept exists in current DB schema (`apps/web/lib/db.server.ts`) or HTTP APIs; adding Org->Matters requires deciding minimal fields and whether to keep `folders` as the Matter table vs introduce `organizations` + FK.
- "Chat with documents" must supply citations; current implemented citations with polygons/snippets are fixture-backed, while DB ingested docs have no geometry (`has_geometry=false`), so citation UX needs a temporary strategy (page-level citations only, no polygons) or a narrow geometry approach.

## Fixture + Demo Context
- Fixture packs: `docs/08-example-data/README.md`, `docs/08-example-data/packs_summary.md`, `docs/08-example-data/pack_01_clean/manifest.json`
- Demo/copy currently de-emphasizes chat:
  - `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/walkthrough.md`
  - `docs/98-tmp/handoffs/handoff_2026-02-09_10-07-28_demo-setup-runbook-app.md` ("chat with documents is not implemented...")

## Guardrails
- Validate external inputs at boundaries (Zod) and return safe user-facing errors.
- Don't leak internal errors/details to clients.
- Unexpected issues: fail loudly (log/throw).
- Backwards compatibility usually not required.
