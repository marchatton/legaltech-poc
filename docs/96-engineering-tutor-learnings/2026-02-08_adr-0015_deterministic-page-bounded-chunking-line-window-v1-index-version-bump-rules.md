# ADR-0015: Deterministic page-bounded chunking (line window v1) + index_version bump rules

Status: accepted  
Date: 2026-02-07  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
We need citations and highlights to stay stable and debuggable.

If retrieval returns `chunk_id`s, and the UI needs click-to-highlight on the PDF page, then a citable unit must be:
- Deterministic (same input yields same chunks).
- Page-bounded (a citation maps to one page's geometry).
- Versioned (when we change chunking or indexing, we do not mutate old chunks; we bump `index_version`).

This ADR pins the chunking strategy (`line_window_v1`) and the rules for when to bump `folders.latest_index_version`, so "what is a citable unit?" and "when do we reindex?" do not drift and silently break evals or UX.

## Metaphor/analogy (with mapping + where it breaks)
Analogy: cutting each page into overlapping highlight strips with a fixed pair of scissors, and labeling the whole batch with an edition number.

Mapping:
| Real thing | Analogy thing |
| --- | --- |
| `document_pages.layout_json` OCR lines | The printed lines on a page |
| Page-bounded chunk | A strip cut from a single page |
| `max_lines`, `max_chars` | How long a strip is allowed to be |
| `overlap_lines` | How much two neighboring strips overlap |
| Header and blank-line boundaries | Natural tear lines you refuse to cut through |
| `chunks.metadata_json` (`page_number`, `line_start`, `line_end`, `chunker_id`, `chunk_params`) | The label you stick on each strip |
| `index_version` | The edition number for the whole batch (chunks + indices) |
| `CHUNKING_FAIL` | Refusing to mix strips cut with different settings in the same edition |

Where it breaks:
- OCR lines are not sentences; chunk boundaries can be semantically awkward.
- Some meaning spans pages, but this design forbids cross-page chunks.
- OCR/canonicalization changes can change the line list, which is why versioning matters.

## Visual explanation (small ASCII diagram)
```text
Page N (OCR lines are the canonical unit)
Lines:  1  2  3  ... 16 17 18 19 20 21 22 ... 36 37 38 39 40

Chunk A: [ 1..............................................20]  (max_lines=20)
Chunk B:                     [17........................................36]  (overlap_lines=4)
Chunk C:                                            [33.................40]  (tail)

Rules:
- Chunks never cross page boundaries.
- Never split inside a line.
- Prefer blank lines as split points.
- Headers are hard boundaries.

Folder F (retrieval substrate is versioned)
latest_index_version = 3
  v3 = chunks + indices built with chunker_id=line_window_v1 and pinned params
  v2 = older chunks + indices (kept as-is)
```

## Step-by-step breakdown
Inputs:
- Canonical OCR/layout lines per page from `document_pages.layout_json`.
- Chunker identity and parameters.
- Indexing configuration (lexical rules, embedding model and dimension).

Outputs:
- `chunks` rows that are page-bounded and labeled with required metadata.
- Retrieval indices for the folder tied to a specific `index_version`.
- Stable `chunk_id`s within an `index_version`.

Constraints (what must always be true):
- A chunk never spans multiple pages (`page_start = page_end = page_number`).
- Hard limits: `max_lines = 20`, `max_chars = 1500`, `overlap_lines = 4` (overlap within a page only).
- Never split inside an OCR line.
- Prefer splitting on blank lines.
- Treat section headers as hard boundaries (e.g. `/^(SCHEDULE|EXHIBIT|SECTION)\\b/i` plus all-caps header heuristics).
- Every chunk must store required metadata in `chunks.metadata_json`:
- `chunker_id`: `line_window_v1`
- `chunk_params`: `{ max_lines, max_chars, overlap_lines, header_regexes_version }`
- `page_number`
- `line_start` and `line_end` (inclusive indices in the canonical OCR line list)

Algorithm (line window v1, per page):
1. Take the canonical line list for a single page.
2. Walk forward assembling a chunk until adding another whole line would exceed `max_lines` or `max_chars`.
3. When you need to cut, choose the best boundary you can without violating constraints: do not cut inside a line; prefer blank lines; respect header boundaries.
4. Emit the chunk with required metadata.
5. Start the next chunk `overlap_lines` earlier (within the same page) to preserve seam context.

Index version bumping (when to change `folders.latest_index_version`):
- You MUST bump `folders.latest_index_version` when any of these change:
- OCR canonicalization schema or adapter version (ADR-0012).
- `chunker_id` or any `chunk_params` (including header regex version).
- Lexical indexing config (tsvector build rules).
- Embedding model ID or embedding dimension.

Fail-closed safety (prevent silent drift):
- Each chunk stores `chunker_id` + `chunk_params`.
- The ingestion/indexing pipeline must refuse to write chunks into an existing `index_version` if current chunker id/params do not match stored metadata for that version.
- Failure code: `CHUNKING_FAIL`.

Trade-offs:
- Pro: highlights are straightforward because a citation's polygons are always on a single page.
- Pro: `chunk_id`s are stable within an `index_version`; drift is handled by bumping versions, not mutating old data.
- Con: cross-page clauses require retrieving/citing multiple chunks.

Why this design vs alternatives:
- Token-based/semantic chunking can be better for retrieval, but makes page-geometry highlighting harder because boundaries drift independently of layout.
- Cross-page chunks improve continuity but complicate click-to-highlight (one citation would span two pages).
- Content-hash chunk IDs still drift with OCR/canonicalization changes unless you version the substrate and fail closed.

Failure modes:
- Changing chunking/OCR without bumping `index_version` causes old `chunk_id`s to effectively point at different text, breaking citations, overlays, and eval comparability.
- Mixed chunk params in one `index_version` breaks determinism and replay semantics.

## Common misunderstandings
- "`chunk_id` is globally stable forever." It is stable within an `index_version`.
- "Overlap can cross pages." Overlap is within a page only.
- "We only bump `index_version` when embeddings change." We also bump for OCR canonicalization changes, chunk params changes, and lexical indexing changes.
- "Header detection is a soft hint." Headers are hard boundaries in this ADR.
- "If chunker changes, we can rewrite chunks in place for the same `index_version`." The pipeline must fail closed with `CHUNKING_FAIL`.

## Check understanding (teach-back question)
If you change `max_lines` from 20 to 30 for a folder that already has chunks, what exact things must happen (including `folders.latest_index_version` and the ingestion safety check), and what breaks if you do not do them?

