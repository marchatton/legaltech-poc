# Walkthrough: Orbital Copilot PoC (Trust Substrate)

Scope: **US only**. This is a dev-only PoC slice to prove a “trust substrate” (evidence locking + verification posture), not a production system.

## The user (and what “better” feels like)

Organisation: US CRE law firm (title + survey diligence).

Buyer: partner / practice lead / ops lead.
Success metric: faster turnaround without increasing miss risk or liability.

End user: junior associate / paralegal doing first-pass diligence under time pressure.

Job to be done: turn a messy diligence pack (title commitment, exception instruments, survey) into **reviewable work product** a senior can sign off without hunting for evidence.

Starting feelings: rushed, uncertain, “too many tabs”, worried about being wrong.

Desired feelings: confident, clear, faster, fewer guesses, an audit trail when challenged.

Business success outcome (target): reduce first-pass diligence time from hours to **<30 minutes per matter** while keeping **zero uncited material claims** in outputs (measured on fixture packs first, then pilot matters).

## The problem (why the status quo fails)

CRE diligence is time-sensitive, but a single miss can blow up insurability, lender comfort, or value.

The bottleneck is not drafting prose. It is:
- finding the right clause in messy PDFs
- turning it into artefacts that match the firm’s deliverables
- giving a senior reviewer a fast path to verify evidence without re-reading the whole pack

In practice, the strongest competitor is often “no decision”: teams stick with manual workflows because adopting a tool feels riskier than living with the pain.

## The solution approach (the “trust substrate”)

The PoC is built around one wedge: **make trust checkable in the UI**.

Instead of treating citations as an afterthought (“here are some quotes and page numbers”), we treat evidence as a **first-class object** with explicit integrity properties. This is the core idea:

- Retrieval finds evidence and returns **IDs**, not prose.
- Drafting can reference only those retrieved IDs.
- We then **lock** citations into immutable records with explicit fields: snippet (what we claim the evidence is), `snippet_hash` (tamper/drift detection), and geometry polygons (so the UI can highlight the clause on the page).
- Verification runs before anything is exportable.
- If integrity breaks, we **fail closed** (explicit `citation_failed`, no highlight overlay, export blocked by default).
- If evidence is missing, that is a first-class outcome (`missing_input` with a checklist), not “best effort”.

Two IDs matter (and it is intentional):
- `chunk_id`: a retrieval address within a specific `index_version` (useful for ranking, evals, and repeatability, but not stable across reindexing).
- `citation_id`: an immutable evidence “receipt” created by the lock step (stores snippet + hash + geometry and stays stable even if chunking/indexing changes later).

Why start here (instead of “full automation”)?
- In high-stakes workflows, a fluent answer with weak provenance creates **false trust**.
- If the trust moment is not solid, everything downstream is noise.
- Evidence locking + fail-closed verification gives you a stable spine to build larger workflows on top of (more packs, more artefacts, more automation).

What this looks like end-to-end (conceptually):
- Ingestion: OCR/layout (for geometry) -> deterministic chunking -> hybrid index
- Run: retrieve chunk IDs -> draft row -> lock citations -> verify integrity -> write row status + artefacts
- UI: citation chips -> viewer -> click-to-highlight overlay (at 100% zoom) -> explicit row status

In this demo slice, the UI is driven by **fixture-seeded snapshots** so we can prove the trust behaviour deterministically before wiring the full LLM pipeline.

## Solution options considered (and why we did not pick them for v1)

Option: “chat with PDFs” as the product.
Trade-off: great for drafting; weak for defensible work product.
Why not: it optimises for fluent answers, but the diligence workflow needs checkable artefacts and a senior-review path.

Option: best-effort citations (quotes + page numbers) and “warn-but-export”.
Trade-off: fewer hard failures; easier to ship early.
Why not: warnings do not reliably travel with exported artefacts; “plausible but unprovable” output trains users to trust the system at the wrong moment.

Option: fail-open verification (export even if evidence integrity breaks).
Trade-off: fewer blocked exports early; seemingly “more useful”.
Why not: in this domain, a broken trust chain is worse than “not found”.

Option: agent loops (open-ended tools) to “figure it out”.
Trade-off: flexible; can appear more capable.
Why not: side effects and retries become hard to reason about. We prefer a fixed, resumable step pipeline.

Option: semantic verification (entailment/NLI model) in v1.
Trade-off: could catch “evidence exists but claim is wrong”.
Why not (for v1): adds a probabilistic failure surface without fixture-eval confidence; we start with deterministic integrity checks first.

Option: external vector DB / managed RAG service.
Trade-off: can be powerful; reduces some self-hosting work.
Why not (initially): Postgres keeps one source of truth and makes joins (runs/rows/citations/chunks) straightforward; adds less infra for a PoC.

## Key ADRs (decision record)

These are the “keystone” decisions shaping the PoC posture:

- ADR-0001 Evidence-first outputs (lock citation IDs with snippet hashes): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0001_evidence-first-outputs-with-citation-ids-and-locking.md`
- ADR-0002 Verification is fail-closed (blocked-by-default export posture): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0002_verification-is-fail-closed.md`
- ADR-0003 OCR/layout extraction is default for PDFs (geometry-first): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0003_ocr-layout-extraction-is-the-default-for-all-pdfs.md`
- ADR-0004 Hybrid retrieval returns chunk IDs (tsvector + pgvector), not prose: `docs/96-engineering-tutor-learnings/2026-02-08_adr-0004_hybrid-retrieval-returning-chunk-ids-lexical-vector.md`
- ADR-0005 Orchestration is a fixed step pipeline (retrieve -> draft -> lock -> verify -> write): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md`
- ADR-0013 LLM + embeddings calls go through AI SDK; gateway default (planned): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0013_llm-embeddings-calls-go-through-ai-sdk-gateway-is-default.md`
- ADR-0015 Deterministic, page-bounded chunking + index versioning: `docs/96-engineering-tutor-learnings/2026-02-08_adr-0015_deterministic-page-bounded-chunking-line-window-v1-index-version-bump-rules.md`
- ADR-0017 Verification v1 is integrity-only (no entailment model): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0017_verification-v1-is-integrity-only-no-entailment-model.md`
- ADR-0020 Overlay verification posture (100% zoom only in v1): `docs/96-engineering-tutor-learnings/2026-02-08_adr-0020_rh2-overlay-is-verified-at-100-zoom-only-in-poc-v1-regression-proof-is-artifact-based.md`

## Tech stack (what exists today vs what is planned)

Implemented in the demo slice:
- Web app: Next.js (App Router) + React + Tailwind: `apps/web/`
- PDF rendering: `pdfjs-dist` + a highlight overlay layer (viewer route): `apps/web/app/(app)/matters/viewer/`
- Validation: Zod at boundaries
- DB dependency: local Postgres via Docker Compose (pgvector image): `docker-compose.yml`
- Fixture seed/eval tooling: TypeScript Node scripts: `scripts/fixtures/`
- Domain logic: `@orbital-poc/core` (citations, geometry, fixture schemas): `packages/core/`

Planned / architecture intent (not all wired in this UI slice yet):
- Orchestration: Workflow DevKit step runner (durable, retryable steps)
- OCR/layout: Azure Document Intelligence (Layout) behind a provider adapter (swappable to Textract)
- LLM calls: Vercel AI SDK via a gateway/router (for model routing + consistent telemetry); model selection is env-driven (`LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`) and the current demo runbook assumes Claude for drafting + `openai/text-embedding-3-large` for embeddings
- Retrieval substrate: Postgres `tsvector` + `pgvector` hybrid retrieval returning chunk IDs

## Design system walkthrough (web app)

The web app uses a small token-driven design system designed for “trust work”:

- Tokens (CSS variables): `apps/web/app/tokens.css`
- Tailwind preset mapping tokens to utilities: `apps/web/tailwind.preset.ts`
- Fonts are loaded in Next `<head>`: `apps/web/app/head.tsx`
- UI primitives: `apps/web/app/ui/Button.tsx`, `apps/web/app/ui/Badge.tsx`, `apps/web/app/ui/Card.tsx`, `apps/web/app/ui/Input.tsx`

Key characteristics:
- Canvas: warm cream in light mode, pure-black dark mode.
- Typography: Inter (UI), Crimson Pro (headings), JetBrains Mono (IDs/citations).
- Colour posture: orange is reserved for high-signal moments; semantic colours are used for status and risk posture.
- Shape: consistent radii (`--radius-*`) and small, quiet shadows (`shadow-ui-*`) to keep focus on evidence.

Where you see it in the demo UI:
- Status chips are explicit and terminal.
- `needs_review` uses warning styling.
- `reviewed` uses success styling.
- `missing_input` is muted and accompanied by a checklist.
- `citation_failed` is destructive and blocks export by default.

## Test/example data (fixture packs)

Fixture packs are the source of truth for deterministic demos and evals:

- Packs live in `docs/08-example-data/<pack_id>/`
- `manifest.json` (required; loaders/evals must read this and must not infer file paths)
- `docs/` (source PDFs)
- `layout/` (anchors/layout JSON for highlight overlays and chunking)
- `truth/` (expected outputs and golden questions)

Seeding uses those packs to generate a snapshot the demo UI can load:
- `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
- Outputs: `tmp/fixture-seed/<pack_id>/snapshot.json`

## A few end-to-end scenarios (what to show and what “success” looks like)

Setup (dev-only):
- `docker compose up -d db`
- `pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite`
- `pnpm dev`

Scenario 1: Evidence verification (happy path)
- Open `http://localhost:3000/matters?pack=pack_01_clean`
- Click any `cit_*` chip on a `needs_review` row
- Expected: PDF opens, highlight overlay renders at 100% zoom, snippet + `snippet_hash` are visible
- Optional: mark a row reviewed and confirm the status change is explicit

Scenario 2: Missing document is a first-class outcome
- Open `http://localhost:3000/matters?pack=pack_02_missing_rea`
- Expected: a `missing_input` row with answer exactly `Not found in provided documents.` and a “missing document checklist” showing evidence signals

Scenario 3: Fail-closed citation (integrity break)
- On `pack_01_clean`, find `TB-BAD-CITATION` and click `cit_TB_BAD_1`
- Expected: viewer shows `citation_failed` (e.g. `SNIPPET_HASH_MISMATCH`), renders **no overlay**, and export posture remains blocked by default

Scenario 4: Scans and rotation resilience
- Open `http://localhost:3000/matters?pack=pack_07_scans_rotated_low_quality`
- Expected: viewer remains usable on scan-heavy PDFs; rotation works; highlight either aligns at 100% zoom or fails closed with an explicit reason code

For the full talk track + diagrams, see:
- `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-script.md`
- `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-runbook.html`
