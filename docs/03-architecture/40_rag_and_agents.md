# RAG + agents (Quick Start)

## Why RAG exists here
RAG is the mechanism that makes “evidence-first” possible:
- it finds evidence in the pack
- it turns evidence into stable references (chunk IDs)
- it supports citation locking and verification

## Ingestion (RAG substrate)
PoC default: OCR everything for consistent geometry
- store per-page text + polygons (`document_pages.layout_json`)
- chunk into citable units
- index:
  - lexical (tsvector)
  - semantic (pgvector)

## Retrieval (per question)
- hybrid search + filters (doc_type)
- rerank (optional)
- return chunk IDs, not prose

## Drafting (from evidence only)
- drafting step receives evidence snippets and chunk IDs
- outputs structured row JSON with candidate citations as chunk IDs (not free text)

## Citation locking (creates immutable citations)
- resolve chunk IDs to authoritative citation objects and persist them:
  `{citation_id, chunk_id?, document_id, page_number, polygons, snippet, snippet_hash, index_version}`
- replace “candidate citations” in the drafted row with `citation_id`s (IDs only)

## Verification (fail-closed)
- hash checks + entailment judgement
- assign row status (terminal for the workflow):
  - `needs_review`
  - `missing_input`
  - `citation_failed`

## Agent mapping (PoC implementation)
- Orchestrator: WDK workflow controller
- Retrieval: retrieval step(s)
- Drafting: drafting step
- Verification: verification step
- Research: out-of-scope (no external web)
