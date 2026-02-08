# ADR-0003: OCR/layout extraction is the default for all PDFs

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
If the product must let a user click a claim and see the exact evidence highlighted in the PDF, we need two things at the same time:
1. The words (text).
2. Where those words are on the page (geometry).

PDFs are not reliably "text documents". Many diligence packs include scans that are just images. Even when a PDF has embedded text, the mapping from text to on-screen coordinates can be inconsistent across PDFs and viewers.

So we pick one boring, reliable rule: every uploaded PDF gets OCR and layout extraction, and we store the result as the canonical per-page truth in `document_pages` (text plus polygons). Everything downstream (chunking, citations, highlighting) builds on that single representation.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: turning every page into a labeled map.

Mapping:
- PDF page: a photo of a city.
- OCR: writing street names onto the photo.
- Layout extraction: drawing the street outlines (shapes) around each label.
- Polygons: the drawn outlines you can point to.
- `document_pages`: the map book we store and treat as the source of truth.
- Highlighting: putting a transparent marker on the exact street outline.
- Chunking: grouping nearby streets into neighborhoods so you can search/retrieve efficiently.

Where it breaks:
- A map is an abstraction; OCR/layout is imperfect and can be wrong (tables, multi-column pages, rotated pages, low-quality scans).
- Geometry is only meaningful in the coordinate system of the page; viewer zoom/rotation and rendering quirks can still cause overlay alignment issues.

## Visual explanation (small ASCII diagram)
```text
PDF bytes
  |
  v
OCR + layout extraction
  |
  v
document_pages (per page)
  - canonical text
  - polygons/geometry
  |
  v
page-bounded chunking (from layout lines)
  |
  v
retrieve chunk_id -> lock citation -> UI highlight (polygons)
```

## Step-by-step breakdown
1. User uploads a PDF; we treat it as bytes, not "probably text".
2. We run OCR and layout extraction on the PDF (even if it looks like a normal text PDF).
3. We persist a canonical per-page representation in `document_pages`: text plus geometry (polygons).
4. We build chunks from canonical OCR/layout lines in `document_pages.layout_json`, and keep chunks page-bounded so highlights stay on one page.
5. Retrieval returns `chunk_id`s; drafting and citation-locking can refer to stable, deterministic units.
6. When the UI needs to show evidence, it uses the stored polygons to draw an overlay that matches what the user sees on the page.

Inputs/outputs:
- Input: uploaded PDF bytes.
- Output: `document_pages` rows containing canonical extracted text and polygons (page geometry).

Key constraints:
- Click-to-highlight requires geometry that maps back to page coordinates.
- Chunking needs stable boundaries that match the geometry; chunks must not split inside a line.
- Provider swaps and schema changes must be versioned; downstream indices must be treated as a new version when canonicalization changes.

Trade-offs:
- Higher ingest cost and latency, because we do OCR for all PDFs.
- Simpler system behavior and fewer edge-case branches, because every PDF goes through the same pipeline.
- More consistent highlighting and chunking, because the same canonical schema drives both.

Failure modes:
- OCR misreads text (numbers, legal terms, small fonts), leading to bad retrieval or wrong snippets.
- Layout extraction mis-orders content (multi-column, headers/footers, tables), leading to confusing chunks.
- Provider outages, throttling, or slow responses increase ingest time.
- Geometry mismatches can cause overlays to look precise but be wrong if coordinates and viewer rendering are not aligned.

Why this design vs alternatives:
- Extract embedded text for "text PDFs" and only OCR scans creates two pipelines and downstream drift ("has geometry" vs "no geometry").
- Lazy OCR on click makes the trust moment slow and flaky, and complicates reproducibility and evals.

## Common misunderstandings
- "OCR is only for scanned PDFs." Not here; OCR/layout is the normalization step so downstream logic has one stable contract.
- "If the PDF already has text, OCR is redundant." Sometimes it is, but the geometry contract is the point; consistency beats conditional optimization in the PoC.
- "Polygons are overkill, a bounding box is enough." Boxes often fail for skewed scans, rotated text, or tight line spacing.
- "We can highlight by searching for the snippet text in the viewer." That breaks when extraction differs from what the user sees, text repeats, or scans have no searchable text.

## Check understanding (teach-back question)
How would you justify doing OCR/layout for a PDF that already has embedded text, and what downstream feature breaks first if we skip storing polygons in `document_pages`?

