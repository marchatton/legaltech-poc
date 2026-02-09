<user_instructions>
<taskname="Arch drift audit"/>

<task>
Produce the requested deliverables:
1) Architecture Drift Report comparing `docs/03-architecture/*` vs actual implementation.
2) Prioritized action plan (Docs updates, Code refactors, Security fixes, Simplifications).
3) Security audit report (threat-model-lite + OWASP-ish scan) with finding IDs, file+line, evidence snippet, impact, exploit sketch, minimal-diff fix.
4) YAGNI/minimalism review using the `## Simplification Analysis` format.

This repo is a PoC; docs describe a target WDK-based architecture. The current code is a smaller in-process queue based scaffold; call drift explicitly.
</task>

<architecture>
Documented target (canonical docs):
- WDK durable orchestration: workflow controller + step boundaries for OCR/embed/retrieve/draft/lock/verify/write/export.
- Postgres + object storage as data plane; citations locked+immutable with snippet hashing and geometry.
- Thin Next.js route handlers validating inputs (Zod) + safe error envelope.

Actual implementation (current code):
- Next.js App Router with Node runtime route handlers under `apps/web/app/(api)/**/route.ts`.
- Durable-ish behavior is implemented via in-memory queues (not WDK):
  - `apps/web/lib/ingest/ingestQueue.server.ts` for ingest.
  - `apps/web/lib/quickStartRunQueue.server.ts` for “Quick Start run” placeholder rows.
- Data plane is Postgres + local filesystem “object store”:
  - Schema is created at runtime in `apps/web/lib/db.server.ts` (tables: folders, documents, document_pages, chunks, runs, run_steps, report_rows, citations, artefacts).
  - Object storage is `../../tmp/object-store` with path traversal protections + HMAC signatures in `apps/web/lib/objectStore.server.ts`.
- Shared core package provides snippet hashing + verifier:
  - `packages/core/src/citations/snippet.ts` defines `normaliseSnippet()` + `hashSnippet()`.
  - `packages/core/src/verify/verifier.ts` exposes `verifyRow()` with modes `deterministic-only` or `entailment` (docs claim PoC v1 is integrity-only; call drift).
</architecture>

<selected_context>
Docs (architecture claims):
- `docs/03-architecture/10_system_architecture.md`: target component map + trust boundaries + key sequences.
- `docs/03-architecture/20_state_model.md`: state machines + invariants, export gating rules.
- `docs/03-architecture/30_data_model.md`: canonical ERD/tables + citation immutability + snippet_hash rule.
- `docs/03-architecture/40_rag_and_agents.md`: retrieval/draft/lock/verify contracts + ADR alignment.
- `docs/03-architecture/50_api_surface.md`: HTTP contract, error envelope, admin token, spikes gating.
- `docs/03-architecture/60_observability_and_evals.md`: taxonomy, trace export redaction expectations.
- `docs/03-architecture/DECISIONS.md`: ADRs that harden “evidence-first” invariants.
- `docs/04-projects/03-fixes/0001_drift/arch_prd_impl_drift.md`: prior drift notes.

Web/API implementation (trust boundary + input validation + auth-ish gates):
- `apps/web/app/(api)/folders/route.ts`, `apps/web/app/(api)/folders/[id]/route.ts`, `apps/web/app/(api)/folders/[id]/documents/route.ts`, `apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/app/(api)/folders/[id]/report/route.ts`, `apps/web/app/(api)/folders/[id]/artefacts/route.ts`.
- Upload/render: `apps/web/app/(api)/documents/[id]/upload/route.ts`, `apps/web/app/(api)/documents/[id]/complete/route.ts`, `apps/web/app/(api)/documents/[id]/render/route.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`.
- Evidence/trace: `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/route.ts`, `apps/web/app/(api)/runs/[id]/trace/route.ts`.
- Exports: `apps/web/app/(api)/export/csv/route.ts`, `apps/web/app/(api)/export/csv/download/route.ts`, spike exporter `apps/web/app/(api)/spikes/export/csv/route.ts`.
- Demo/spikes: `apps/web/app/(api)/demo/load-pack/route.ts`, `apps/web/app/(api)/spikes/*`.

Server-side runtime modules (data plane, orchestration scaffold):
- `apps/web/lib/db.server.ts`: Postgres client + `ensureSchema()` DDL (note: citations table differs from docs; uses `polygons_json`, missing `index_version`, etc.).
- `apps/web/lib/objectStore.server.ts`: local fs object store; signed header generation + signature verification; strict storage_key regexes.
- `apps/web/lib/ingest/ingestQueue.server.ts`: pdf.js text extraction (not OCR provider), no geometry; chunks 1 per page; heuristic extraction_quality; writes document_pages + chunks.
- `apps/web/lib/quickStartRunQueue.server.ts`: in-memory run queue that currently writes `missing_input` or placeholder `citation_failed` rows (no retrieval/draft/lock pipeline yet).
- `apps/web/lib/folderState.server.ts`: derives folder states from DB facts.
- `apps/web/lib/questionSet.server.ts`: loads question set v1 from disk and hashes to a version string.
- `apps/web/lib/devOnlyApi.server.ts`, `apps/web/lib/demoMode.server.ts`, `apps/web/lib/spikes.server.ts`: gating helpers.
- `apps/web/lib/trace.server.ts`: creates `traceId` + response headers.

Core shared logic (hashing + verification + schemas):
- `packages/core/src/citations/snippet.ts`, `packages/core/src/verify/verifier.ts`, `packages/core/src/verify/verifier.schemas.ts`, `packages/core/src/safe-error.ts`, `packages/core/src/schemas/list_payload_v0.ts`.

Fixture utilities (used by docs/taxonomy alignment checks):
- `scripts/fixtures/assert_row_invariants.ts`, `scripts/fixtures/assert_citation_integrity.ts`, `scripts/fixtures/lib/*`, `scripts/fixtures/README.md`.

UI touchpoints (to understand end-to-end flows; not exhaustive):
- `apps/web/app/(app)/matters/actions.ts`, `apps/web/app/(app)/matters/QuickStartPanel.tsx`, `apps/web/app/(app)/matters/ExportCsvButton.tsx`, `apps/web/app/(app)/matters/ExportTraceButton.tsx`, `apps/web/app/(app)/matters/ArtefactsList.tsx`.
</selected_context>

<relationships>
- Schema/state backbone: `apps/web/lib/db.server.ts` tables are read/updated by route handlers + queues; folder state derived in `apps/web/lib/folderState.server.ts`.
- Upload flow:
  - init upload and metadata in folder/document routes (see `apps/web/app/(api)/folders/[id]/documents/route.ts`), then bytes PUT to `apps/web/app/(api)/documents/[id]/upload/route.ts` using HMAC signature headers from `apps/web/lib/objectStore.server.ts`.
  - completion triggers ingest queue via `apps/web/app/(api)/documents/[id]/complete/route.ts` -> `apps/web/lib/ingest/ingestQueue.server.ts`.
- Ingest writes `document_pages` + `chunks` (1 chunk per page, `hashSnippet(text)` for `text_hash`) and updates `documents.parse_status/ocr_status`.
- Quick Start run flow:
  - run creation endpoint(s) insert `runs` then enqueue `apps/web/lib/quickStartRunQueue.server.ts`.
  - queue writes `report_rows` + `run_steps` but does not implement retrieval/draft/lock/citations yet.
- Trace export:
  - `apps/web/app/(api)/runs/[id]/trace/route.ts` reads seeded snapshots (dev-only) and uses `packages/core/src/verify/verifier.ts:verifyRow()` in `deterministic-only` mode.
</relationships>

<ambiguities>
- WDK/workflow runtime described in docs does not appear in the selected code; current queues are process-memory only. Treat this as either (a) docs are aspirational/target state, or (b) a missing implementation slice.
- Docs specify OCR/layout providers and geometry-backed citations; current ingest uses pdf.js text extraction with `has_geometry: false` and cannot produce polygon highlights.
- Docs specify spikes gating with `SPIKES_ENABLED=1` and explicit admin token; current code often uses `assertDevOnlyApi()` (404 outside `NODE_ENV=development`) plus optional env flags per endpoint. Call drift and recommend a consistent policy.
</ambiguities>

<notes>
Omitted (not selected to stay under token budget): heavier fixture runner scripts like `scripts/fixtures/eval.ts`, `scripts/fixtures/compare_truth.ts`, `scripts/fixtures/seed.ts`, `scripts/fixtures/export_truth_match.ts` are present in repo but not fully included (some may appear as codemaps only).
</notes>

</user_instructions>
