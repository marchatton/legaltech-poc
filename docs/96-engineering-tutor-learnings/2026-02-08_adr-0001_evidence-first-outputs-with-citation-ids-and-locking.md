# ADR-0001: Evidence-first outputs with citation IDs and locking

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first (plain English)
Assumption: you want an onboarding-friendly explanation for engineers building the RAG pipeline and UI highlighting around citations.

ADR-0001 says: every material claim we output must come with evidence you can inspect, and that evidence must stay stable over time.

So we do two things:
- During drafting, the model can only point at chunk IDs returned by retrieval (no made-up or free-text citations).
- Then we lock those candidate citations into a durable, immutable citation record and refer to it forever by `citation_id`.

## Metaphor / analogy (mapping)
Think "warehouse vs receipt":
- `chunk_id` is a warehouse shelf location ("Aisle 3, Row 2"). Useful now, but shelves get reorganized when we change chunking/indexing.
- `citation_id` is a notarized receipt that contains what you bought: `{snippet, snippet_hash, geometry}`. Even if the warehouse reorganizes, the receipt still proves what the evidence was and where it was on the page.

Where it breaks: a real receipt does not include geometry, but here geometry matters because the UI needs to highlight the exact region in the document.

## Visual explanation (diagram)
Note: `beautiful-mermaid` is not installed in this repo, so the diagram is hand-rendered ASCII.

```text
PDF -> OCR/layout -> pages w/ polygons
            |
         chunk+index
            |
         retrieve
            |
   [chunk_id, score]...
            |
         draft rows
   (claims + chunk_id refs)
            |
            v
        LOCK step
  chunk_id -> citations row:
    { snippet, snippet_hash, geometry }
            |
         citation_id
            |
         verify
 (hash/geometry match, etc.)
            |
            v
   final report rows
 (claims + citation_id refs)
            |
            v
   UI highlights via geometry
```

## Step-by-step breakdown
Typical RAG often does: "answer + some quoted text + page numbers". That is fuzzy, easy to fake, and breaks when indexing changes.

This ADR's flow:
- Retrieval returns IDs, not prose.
- Drafting produces structured rows with `candidate_citation_chunk_ids` (chunk IDs only).
- A separate lock step turns candidate chunk references into immutable citation objects.
- Report rows store only `citation_id`, so old outputs stay stable even if chunking changes later.

## Common misunderstandings
- "Why not just store `chunk_id` forever?"
Chunking/indexing can change; the same content might move to different chunks, or chunk IDs might be regenerated. Locking prevents old outputs from silently drifting.

- "Why store `snippet` and `snippet_hash`?"
So you can replay/debug provenance without re-running the model, and detect drift/tampering (hash mismatch).

- "What's `geometry` for?"
Highlighting. Without geometry, you cannot reliably show the exact place in the PDF that supports a claim.

## Check understanding (teach-back question)
In your own words: what's the difference between a `chunk_id` and a `citation_id`, and what problem does the lock-citations step solve when we change chunking/indexing later?

