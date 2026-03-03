# PRD: Empty-Text Sentinel Chunks (Indexed Progress Without Per-Page Empties)

Owner: marc
Status: draft
Date: 2026-02-10

## Summary

Change empty-text handling so that documents with no extracted text can still reach `indexed` without generating per-page empty chunks. Core chunking becomes semantically clean (empty text => zero chunks), and ingest writes a single doc-level sentinel chunk when needed to satisfy the `indexed` invariant.

## Problem

Some documents (scanned PDFs, broken extraction, post-cap pages) produce empty extracted text. Today, `char_window_v0` returns a single empty chunk for empty text, which can:

- Create one empty chunk per empty page (and per page after the total-text cap).
- Waste storage/compute and risk downstream noise.

If we instead make empty text produce zero chunks, folder state can get stuck in `ingesting` because the `indexed` invariant requires “chunks exist for each document for `folders.latest_index_version`” (`docs/03-architecture/20_state_model.md`).

## Goals

- Documents with no extracted text should still allow the folder to reach `indexed` (runnable), not remain permanently `ingesting`.
- Avoid writing per-page empty chunks for empty-text documents or post-cap pages.
- Keep chunking semantics in `@legaltech-poc/core` clean and reusable (no app-specific progress hacks).
- Preserve idempotent re-ingest behavior for chunks.

## Non-goals

- Implementing OCR/layout “line window v1” chunking (`line_window_v1`) or geometry-backed citations.
- Changing the `ready` health checks or the extraction quality heuristic/threshold.
- Building an embedding job or changing retrieval ranking/tuning.

## Users

- End users: matter state should become `indexed` (Quick Start enabled) even for low/zero text extraction, while staying out of `ready` if quality is low.
- Engineers: chunking and folder state behavior should be deterministic, debuggable, and avoid accidental row explosions.

## Solution

- Core chunking (`packages/core`):
  - Empty text returns **no chunks**.
  - Param validation runs even when text is empty.
- Ingest (`apps/web`):
  - If a document produces zero real chunks for a given `(document_id, index_version)`, write exactly **one sentinel chunk** for that doc+version.
  - Sentinel is doc-level (not per-page) to avoid row explosions.
  - Sentinel’s `text` is empty, and `metadata_json` includes a marker (e.g. `sentinel: "no_extracted_text"`).
  - Persist `documents.metadata_json.extraction_total_chars` (integer; total extracted chars across all pages). Treat `0` as "no extracted text".
  - UI shows a `No text extracted` badge/message when `documents.metadata_json.extraction_total_chars` is `0`.
- Folder state:
  - Sentinel counts as “chunks exist” for `indexed`.
  - `ready` remains a quality gate; scanned/no-text docs are expected to remain `indexed`.
- Retrieval:
  - No immediate query changes; lexical branch won’t match empty text and semantic branch requires embeddings.

## Scope

In scope:

- `packages/core/src/chunking/char_window_v0.ts` and tests.
- Ingest writing behavior for empty-text documents:
  - write doc-level sentinel chunk when needed
  - ensure no per-page empty chunk spam
- Persist `documents.metadata_json.extraction_total_chars` and surface a `No text extracted` badge/message when it is `0`.
- Add integration tests proving the behavior and folder-state progression.

Out of scope:

- UI work beyond a minimal `No text extracted` badge/message.
- Backfilling existing DBs beyond what re-ingest naturally does.

## User Stories

- US-001: Core chunker returns zero chunks for empty text (and still validates params).
- US-002: Ingest writes exactly one doc-level sentinel chunk when a doc would otherwise have zero chunks for an index version.
- US-003: Tests cover empty-text docs end-to-end and prevent regressions (including folder state reaching `indexed`).

## Functional Requirements

- FR-001: `charWindowV0Spans("")` returns `[]`.
- FR-002: Chunking param validation throws for invalid params even when text is empty.
- FR-003: For each `(document_id, index_version)`, ingest writes either:
  - one or more real chunks, or
  - exactly one sentinel chunk (empty text + sentinel metadata).
- FR-004: Sentinel chunk must be safe for retrieval:
  - lexical queries should not return it
  - semantic retrieval should not return it (no embedding)
- FR-005: Write a structured log when a sentinel is written (no extracted text content).
- FR-006: Persist `documents.metadata_json.extraction_total_chars` (total extracted chars across all pages); `0` means "no extracted text".
- FR-007: UI shows a `No text extracted` badge/message for documents where `documents.metadata_json.extraction_total_chars = 0`.

## Risks

- Sentinel chunks could accidentally be embedded/retrieved later if an embedding job doesn’t filter empty text.
- State model drift: callers may incorrectly assume “indexed implies usable retrieval quality”. (This is already handled by `ready`.)
- If `chunk_index` is used as a stable identifier, upsert semantics must rely on `text_hash` for change detection downstream.

## Acceptance Criteria

- Example: A 2-page document with empty extracted text results in:
  - `document_pages` rows for both pages
  - `documents.metadata_json.extraction_total_chars = 0`
  - exactly 1 sentinel chunk for `(document_id, latest_index_version)`
  - UI shows a `No text extracted` badge/message for the document
  - folder reaches `indexed` (and stays out of `ready` if extraction quality is low)
- Negative: When a document produces any non-empty chunks, ingest writes **no** sentinel chunk.
- Negative: Invalid chunk params still throw even when text is empty (unit test).
- Negative: Retrieval does not return sentinel chunks for a non-empty query (by construction or via test).

## Verification Plan

Quality gates (must pass):

- `pnpm test`
- `pnpm typecheck`

Verification tests to add/update:

- `packages/core/src/chunking/char_window_v0.test.ts`
- `apps/web/test/ingestDocumentStepIdempotency.int.test.ts` (add empty-text case)

## Failure States + UX

- Empty-text documents are expected to remain `indexed` rather than `ready` due to extraction quality and/or health checks.
- UI surfaces a `No text extracted` badge/message for these documents.
- Any true ingest/write failure remains `failed` with safe user-facing errors (no internal leakage).

## Metrics / Logging

- Add one structured log when writing the sentinel (e.g. `ingest.no_extracted_text_sentinel_written`) including:
  - `document_id`, `index_version`, `page_count`, `total_chars`, `sentinel_written: true`

## Rollback / Disable Path

- Rollback: revert the change and re-ingest (bump `folders.latest_index_version` / reload pack) to rebuild chunks.
- Disable path (if needed later): environment-controlled empty-text behavior mode (`doc_sentinel` vs `page_sentinel` vs `off`).

## Open Questions

- None (decision locked): persist `documents.metadata_json.extraction_total_chars` and surface a `No text extracted` badge/message when it is `0`.

## Links

- `docs/03-architecture/20_state_model.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0015 pre-geometry bridge + index_version rules)
- `apps/web/lib/ingest/ingestProcessor.server.ts`
- `apps/web/lib/folderState.server.ts`
- `packages/core/src/chunking/char_window_v0.ts`
