# RAG + agents (Quick Start)

## Why RAG exists here
RAG is the mechanism that makes “evidence-first” possible:
- it finds evidence in the pack
- it turns evidence into stable references (chunk IDs)
- it supports citation locking and verification

## Ingestion (RAG substrate)
PoC default: OCR everything for consistent geometry
- store per-page text + polygons (layout_json)
- chunk into citeable units
- index:
  - lexical (tsvector)
  - semantic (pgvector)

## Retrieval (per question)
- hybrid search + filters (doc_type)
- rerank (optional)
- return chunk IDs, not prose

## Drafting (from evidence only)
- drafting step receives evidence snippets and chunk IDs
- outputs structured row JSON with candidate citations as chunk IDs

## Citation locking
- resolve chunk IDs to authoritative citation objects:
  `{doc_id, page, polygons, snippet, snippet_hash}`

## Verification (fail-closed)
- hash checks and entailment judgement
- assign row status:
  - `needs_review`
  - `missing_input`
  - `citation_failed`

## Agent mapping (PoC implementation)
- Orchestrator: WDK workflow controller
- Retrieval: retrieval step(s)
- Drafting: drafting step
- Verification: verification step
- Research: out-of-scope (no external web)
