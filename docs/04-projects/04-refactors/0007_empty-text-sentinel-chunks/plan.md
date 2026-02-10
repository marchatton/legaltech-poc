# Plan: Empty-Text Sentinel Chunks

Owner: marc
Status: draft
Date: 2026-02-10

## Context

Today, chunking in the PoC has two responsibilities:

- Content: produce page-bounded `chunks` rows used for retrieval and citations.
- Progress: satisfy the `indexed` invariant ("chunks exist for each document for folders.latest_index_version") so folder state can advance. See `docs/03-architecture/20_state_model.md`.

The current `char_window_v0` chunker returns a single empty span for empty text (`packages/core/src/chunking/char_window_v0.ts`). That can cause:

- One empty chunk per empty page (and one empty chunk per remaining page after total-text caps).
- Unnecessary storage/compute, and potential downstream retrieval/embedding noise.

If we change the chunker to return zero chunks for empty text, we must still satisfy the `indexed` invariants so the matter can become runnable (Quick Start gates on `indexed|ready`).

## Decisions (Defaults)

- Chunker semantics in `@orbital-poc/core` should be "pure":
  - Empty text => zero chunks.
  - Param validation should run even when text is empty.
- Ingest owns progress semantics:
  - If a document produces zero real chunks for a given `(document_id, index_version)`, write exactly 1 sentinel chunk for that doc+version.
  - Sentinel is doc-level (not per-page) to avoid row explosions.
- Persist a doc-level extraction summary:
  - Persist `documents.metadata_json.extraction_total_chars` (integer; total extracted chars across all pages). Treat `0` as "no extracted text".
- Folder state:
  - Sentinel counts as "chunks exist" for the `indexed` invariant.
  - `ready` health checks remain unchanged (low/empty extraction stays `indexed`, not `ready`).
- Retrieval:
  - No query changes initially; sentinel has empty `text` and will not match lexical queries and will never be embedded, so semantic branch won’t surface it.
- UI:
  - Show a minimal `No text extracted` badge/message when `documents.metadata_json.extraction_total_chars = 0`.
- Quality gates:
  - `pnpm test`
  - `pnpm typecheck`

## Implementation Steps

1. Core chunker: remove implicit sentinel span
   - Update `packages/core/src/chunking/char_window_v0.ts`
     - Validate `maxChars` / `overlapChars` before any early returns.
     - Change empty-text behavior: `charWindowV0Spans("")` returns `[]` (not `[{0,0}]`).
   - Update `packages/core/src/chunking/char_window_v0.test.ts`
     - Replace the “single empty chunk” test with “returns []”.
     - Add a test that invalid params still throw even when text is empty.

2. Ingest: add doc-level sentinel chunk when needed
   - Update `apps/web/lib/ingest/ingestProcessor.server.ts`
     - After building `chunksToWrite`, if it’s empty, push 1 sentinel chunk:
       - `chunk_index = 0`
       - `page_start = NULL`, `page_end = NULL`
       - `text = ""`
       - `metadata_json` includes a sentinel marker, e.g.:
         - `{ chunker_id: "char_window_v0", sentinel: "no_extracted_text" }`
       - `text_hash = hashSnippet("")`
     - Persist `documents.metadata_json.extraction_total_chars = totalChars` on successful write.
     - Widen the local `metadata_json` typing to accommodate both normal page chunks and sentinels.
     - Keep `ON CONFLICT (document_id, index_version, chunk_index) DO UPDATE` and stale-tail delete; the sentinel ensures stale old chunks get deleted (`chunk_index >= 1`).

3. Tests: prove behavior end-to-end
   - Update `apps/web/test/ingestDocumentStepIdempotency.int.test.ts`
     - Refactor pdfjs mock to use a mutable `mockPages` array.
     - Add a new test where all mocked pages have `text=""`.
     - Assert:
       - `document_pages` count matches page count.
       - Exactly 1 chunk exists for `(document_id, index_version)` and it is the sentinel (`text=""`, sentinel metadata).
       - Folder state can reach `indexed` (not stuck `ingesting`).

4. UI: show `No text extracted` badge/message
   - Update `apps/web/app/(app)/matters/[id]/page.tsx`
     - Fetch `documents.metadata_json.extraction_total_chars`.
     - Show a minimal informational badge/message when `extraction_total_chars === 0`.
     - Do not show the badge/message when the field is missing (older data), to avoid false positives.

5. Optional follow-up (perf)
   - If total text cap is reached, consider short-circuiting per-page text extraction for remaining pages. (Keep page_count/layout invariants in mind.)

## Verification

- `pnpm test`
- `pnpm typecheck`

Manual spot-check (optional):

- Upload a scanned/no-text PDF pack, confirm the matter reaches `indexed` (not permanently `ingesting`), and Quick Start becomes enabled.

## Rollback / Disable Path

- Rollback: revert the change and re-ingest (bump `folders.latest_index_version` / reload pack in demo flows) to rebuild chunks under the prior behavior.
- Disable path (if needed later): add an env-var switch to choose empty-text handling mode (`doc_sentinel` vs `page_sentinel` vs `off`).
