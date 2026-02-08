# ADR-0004: Hybrid retrieval returning chunk IDs (lexical + vector)

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
When you ask a question about a CRE diligence pack, you want the system to first find the right evidence, then write an answer that is tied to that evidence.

This ADR says retrieval should behave like a search engine that returns addresses, not like a writer that returns paragraphs.

Hybrid retrieval means we run two searches:
- Lexical search (tsvector) finds chunks that share the same words.
- Vector search (embeddings) finds chunks that mean something similar, even if the words differ.

The output is a ranked list of `chunk_id`s plus scores. Downstream steps can then fetch the actual text and geometry deterministically, and later lock citations.

Why the IDs-only part matters: if retrieval returns prose, you blur the boundary between finding evidence and generating content. That makes it harder to measure retrieval quality (Recall@K), harder to detect drift, and easier for downstream steps to become non-deterministic.

## Metaphor/analogy (with mapping + where it breaks)
Metaphor: two librarians help you find the right page in a huge binder, but they only give you page tabs, not summaries.

Mapping:
- Your question text: what you ask the librarians.
- Lexical (tsvector) librarian: looks up exact words in an index.
- Vector (embeddings) librarian: thinks in "aboutness" and synonyms.
- `chunk_id`: the page tab / shelf address.
- Score: how confident that librarian is that the tab is relevant.
- Hybrid merge: combine both librarians' tabs into one ranked list.
- Optional rerank: a stricter librarian re-orders the same tabs, but still hands you only tabs.
- Hydration: you walk to the tab and read the actual page text and highlights.

Where the metaphor breaks:
- Embeddings approximate meaning and can be confidently wrong.
- `chunk_id`s are only stable within an `index_version` (change chunking, and addresses can change).
- Retrieval scores are ranking signals, not truth.

## Visual explanation (small ASCII diagram)
```text
question_text
    |
    v
+-------------------+
| Hybrid retrieval  |
|  - lexical (FTS)  |
|  - vector (embed) |
+-------------------+
   |          |
   | hits     | hits
   v          v
 (chunk_id, score)  (chunk_id, score)
        \          /
         \        /
          v      v
     merge + dedupe
          |
          v
 ordered hits: [{chunk_id, score, ...}]   <-- IDs-only contract
          |
          v
      hydration
          |
          v
evidence: [{chunk_id, snippet, polygons, ...}]
```

## Step-by-step breakdown
Inputs (retrieval contract):
- `folder_id`
- `index_version`
- `question_id`
- `question_text`
- `filters?` (optional constraints like doc_type)

Outputs (retrieval contract):
- Ordered hits like `{ chunk_id, score, document_id, page_start, page_end }`

Constraints:
- Retrieval is hybrid: lexical (tsvector) plus vector (embeddings).
- Retrieval returns chunk IDs and scores, not prose.
- Optional rerank is allowed, but must preserve the IDs-only output shape.
- Retrieval is scoped to a specific `index_version` so results are comparable over time and across evals.

Trade-offs:
- More moving parts (two indexes, score merging, and versioning).
- Scores are not naturally comparable across lexical and vector search, so merging can be wrong.
- You need a hydration step to fetch text/geometry by ID.

Failure modes:
- Boilerplate trap: lexical search over-weights common terms and returns generic sections.
- Semantic lookalike: vector search returns a chunk that is about the topic but not the exact needed clause.
- Score mixing bug: merge strategy makes one modality dominate.
- Index drift: changing chunking or embeddings without bumping `index_version` makes retrieval hard to compare across runs/fixtures.

Why this design vs alternatives:
- Lexical-only misses paraphrases and meaning matches.
- Vector-only misses exact term matches and identifiers (names, section numbers, defined terms).
- Returning prose/snippets from retrieval weakens determinism and observability because "what was retrieved" becomes content-dependent instead of ID-dependent.

## Common misunderstandings
- "Chunk IDs are citations." Chunk IDs are candidates; citations are locked later as immutable records.
- "IDs-only means we cannot show evidence." IDs-only is just the retrieval contract; hydration turns IDs into snippets and polygons.
- "Scores are probabilities." Scores are ranking signals; treat them as relative, not absolute truth.
- "Rerank can just rewrite the evidence." Rerank can re-order candidates, but must not invent new evidence or change the IDs-only contract.

## Check understanding (teach-back question)
If a teammate asked "Why not have retrieval return the top 3 snippets as text?", how would you explain what we gain by returning only `chunk_id`s with scores, and how you would measure whether hybrid retrieval is working (e.g., Recall@K and drift detection)?

