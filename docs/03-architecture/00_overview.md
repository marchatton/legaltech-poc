# Orbital Copilot PoC Architecture
US CRE Title + Survey Quick Start (evidence-first, artefact-first)

This is the top-level architecture summary. For deeper detail, see:
- System map + trust boundaries: `docs/03-architecture/10_system_architecture.md`
- State machines + invariants: `docs/03-architecture/20_state_model.md`
- Data + hashing + provenance: `docs/03-architecture/30_data_model.md`
- RAG + workflows + agents posture: `docs/03-architecture/40_rag_and_agents.md`
- Canonical HTTP contract: `docs/03-architecture/50_api_surface.md`
- Observability + evals: `docs/03-architecture/60_observability_and_evals.md`

## Purpose
Define a production-minded (but PoC-sized) architecture for a law-firm workflow that ingests a US CRE diligence pack and produces defensible artefacts with clause-level evidence.

Optimised for:
- Title commitment (Schedule A / B-I / B-II)
- Exception instruments (easements, REAs, CC&Rs, mortgages, plats)
- ALTA/NSPS survey (draft or final)
- Trust UX: click citation → see highlighted evidence in the PDF

## Product scope (what we will build)
A matter workspace that supports:
1) Upload + ingest a doc pack (PDF-first)
2) Run “Quick Start: Title + Survey”
3) Generate 3 artefacts (as report tables first, export later):
   - Schedule B-I Requirements tracker
   - Schedule B-II Exceptions table (linked to underlying instruments)
   - Survey reconciliation issues list (title ↔ survey)

Every material claim must have citations or “Not found in provided documents.”

## Non-goals (explicit)
- No legal advice / materiality decisions / negotiation posture
- No external web research inside the PoC run
- No integrations (iManage/NetDocs/SharePoint)
- No multi-tenant admin, SSO/RBAC, billing
- No property visualiser / boundary plotting (stretch only)

## Key architectural decisions (PoC defaults)
- Evidence-first with citation locking: citations are IDs, not free text (ADR-0001)
- Fail-closed verification: citation mismatch → row is `citation_failed` (ADR-0002)
- Artefacts-first UX: report table is the centre of gravity
- OCR/layout for all PDFs (PoC default): consistent geometry for highlights (ADR-0003)
- Deterministic page-bounded chunking + `index_version` bump rules (ADR-0015)
- File-backed, immutable question sets with run pinning (ADR-0016)
- Hybrid retrieval (RAG): lexical + vector search (optional rerank), then draft from evidence (ADR-0004)
- Deterministic-ish orchestration: explicit step machine, not free-running agents (ADR-0005)
- Fixture-driven reliability: synthetic packs + truth files used in CI-style evals (ADR-0006)
- Verification v1 is integrity-only (no entailment model) (ADR-0017)
- Trace export is admin-token gated (even in “no auth” PoC envs) (ADR-0018)
- Unsafe export override is API-only and demo-flag + admin-token gated (ADR-0019)
- Highlight overlay posture is “verified at 100% zoom only” in PoC v1 (ADR-0020)

Canonical ADRs for these defaults live in `docs/03-architecture/DECISIONS.md` (append-only).

## Where RAG fits
RAG is the engine inside Quick Start:
- Ingestion creates canonical page text + geometry, then chunks + indexes
- Retrieval returns chunk IDs (hybrid lexical + vector; optional rerank)
- Drafting uses only retrieved evidence
- Verification locks citations and fails closed on integrity/invariant failures. Semantic correctness is a reviewer responsibility in v1 (ADR-0017).

## Where evals fit
Evals are first-class because trust is the product:
- Compare outputs against `/truth` in the synthetic packs
- Validate citation integrity (hash + page + geometry)
- Spot retrieval misses and false passes before demos

## Tech stack and framework choices
See:
- `docs/03-architecture/05_tech_stack_and_dev_workflow.md` for stack, dev workflow, and fixtures
- `docs/03-architecture/06_frameworks_agents_rag_evals.md` for framework options and why we chose Workflow DevKit

## Security and data handling (PoC, explicit)
- Storage boundaries:
  - Raw PDFs and exports live in object storage.
  - Extracted text + geometry (OCR/layout), chunks, and citation snippets live in Postgres and must be treated as sensitive.
- Provider boundaries:
  - OCR/LLM/embeddings calls may transmit document content to third-party providers.
  - Default posture: send the minimum required text for the current step; do not persist provider request/response payloads by default.
- Client/API safety:
  - Client responses never include provider payloads or stack traces (safe error envelope; ADR-0008).
  - Admin-only endpoints (eg run trace export) must be gated by `X-Orbital-Admin-Token` matching `ORBITAL_ADMIN_TOKEN` (ADR-0018).
- Logging + telemetry redaction:
  - Never log raw PDFs, full extracted text, provider payload dumps, admin tokens, or signed URLs.
  - Prefer opaque IDs + hashes + counts + timings, with `trace_id` for correlation.
- Signed URL posture (shared/demo envs):
  - Generate short-TTL signed URLs on demand; never persist signed URLs; never log them.

Note: the detailed data-handling posture is currently captured as ADR-0021 (proposed). Until accepted, treat it as the default and evolve it explicitly.

## Open decisions to pin (before implementation)
These should become explicit (ideally as ADRs) before we build the relevant slices:
- Embeddings: model + dimension (and index parameters) to treat as the default for fixtures/evals.
- Auth posture for the PoC: what is (and is not) protected in demo environments.
- Data handling posture details: retention windows, provider data policies, and telemetry redaction defaults (ADR-0021 is proposed).
