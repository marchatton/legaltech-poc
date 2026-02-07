# Orbital PoC Architecture: Overview + ADRs (Mental Model)

Date: 2026-02-07
Source docs:
- `docs/03-architecture/00_overview.md`
- `docs/03-architecture/DECISIONS.md`

## One-sentence mental model
This PoC is a "trustable report factory": it turns a PDF diligence pack into structured artefact rows where every claim is backed by a stable, inspectable citation ID (or it explicitly says "not found").

## The spine of the system (happy path)
1) Ingest PDFs
2) OCR/layout extraction for every PDF page (text + geometry)
3) Chunk + index (hybrid lexical + vector)
4) Retrieve evidence as **chunk IDs**, not prose
5) Draft report rows referencing those chunk IDs
6) Lock citations by creating immutable `citations` records `{snippet, snippet_hash, geometry}`
7) Verify citations (fail closed: mismatch => `citation_failed`)
8) Write artefacts (tables first; export later)

## Why "citation IDs" matter (ADR-0001)
- "Chunk IDs" are temporary: chunking can change as we improve extraction/chunk rules.
- "Citation IDs" are stable: once a snippet+hash+geometry is locked, we can always show the user exactly what supported the claim.
- This makes debugging and user trust possible without rerunning models.

## Fail-closed verification (ADR-0002)
- If evidence is missing or doesn't match, we mark the row blocked (`citation_failed`) instead of guessing.
- This increases early friction, but prevents a "confidently wrong" UX.

## Deterministic orchestration (ADR-0005)
- We prefer explicit, resumable workflow steps (`retrieve → draft → lock → verify → write`) over free-form agent loops.
- It makes progress observable and side effects (DB writes, storage writes) bounded and retryable.

## Fixture-driven evals (ADR-0006)
- Synthetic packs (`/docs`, `/truth`, `/layout`) let us regression-test retrieval/citation integrity before demos.
- Over time, these should become CI gates on "trust metrics" (schema correctness + citation integrity).

## Key constraints that shape everything
- No external web research inside runs (ADR-0007): provenance must be only the uploaded pack.
- OCR/layout for all PDFs (ADR-0003): highlighting requires geometry; scans are common.
- Retrieval returns IDs only (ADR-0004): downstream is measurable and schema-driven.

## Proposed decisions to confirm before building (status: proposed)
- Deployment posture (ADR-0009): Hetzner-first VM until proven otherwise.
- Object storage baseline (ADR-0010): S3-compatible; MinIO for local parity.
- Postgres posture (ADR-0011): Postgres is the truth store; local compose; self-host on VM initially.
- OCR adapter boundary (ADR-0012): one provider interface; default Azure DI Layout.
- LLM/embeddings boundary (ADR-0013): AI SDK only; gateway default.
- Minimal runnable scaffold (ADR-0014): tracer-bullet to validate citations + workflow plumbing.

## Common confusion to watch for
- Chunk ID != citation ID (chunk is input to a lock step; citation is immutable evidence).
- "Fail-closed" is not "error": it's a deliberate product contract.
- "No web research" applies to the PoC run itself; it doesn't block developer research.

