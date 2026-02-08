# Onboarding checklist

Last updated: 2026-02-08

Use this when setting up a new machine, or when onboarding someone new to this repo.

## 1) Accounts and access
- [ ] GitHub access to the repo (SSH recommended).
- [ ] Confirm deployment posture (ADR-0009, accepted): Hetzner-first (single VM) until proven otherwise; Vercel optional for previews/later.
- [ ] Hetzner account + SSH access (if deploying to Hetzner; ADR-0009, accepted).
- [ ] Vercel account (optional; preview deploys and/or later; ADR-0009, accepted).
- [ ] Local Postgres available (Docker Compose mode or Sprite mode; ADR-0011, accepted; ADR-0022, accepted).
- [ ] Deployment Postgres plan confirmed (self-host on VM unless explicitly choosing managed; ADR-0011, accepted).
- [ ] Local object storage ready: MinIO (or local filesystem for ultra-simple early dev) (ADR-0010, accepted).
- [ ] Deployment object storage ready: managed S3-compatible storage unless explicitly "single VM only" (ADR-0010, accepted).
- [ ] OCR/layout provider credentials ready (OCR/layout is required for PDFs; ADR-0003 accepted; provider default Azure Document Intelligence Layout per ADR-0012, accepted).
- [ ] AI SDK gateway access/keys ready (ADR-0013, accepted). Default is Vercel AI Gateway; direct provider keys only with explicit reason.

## 2) Local tooling
- [ ] Node.js installed (LTS recommended). If `.nvmrc` / `.node-version` appears in the repo later, follow it.
- [ ] pnpm available (prefer Corepack: `corepack enable`).
- [ ] Docker installed (for Docker Compose mode; Sprite mode may also use it depending on implementation).
- [ ] `psql` installed (for DB debugging).
- [ ] Vercel CLI installed (optional; only if you’re using Vercel).
- [ ] Optional: `aws` CLI or `az` CLI (if testing OCR/storage against cloud locally).

## 3) Repo setup (one-time)
- [ ] Install git hooks: `bash scripts/install_git_hooks.sh`
- [ ] Optional (agent tooling): copy repo skills into your agent home: `bash scripts/install_codex_skills_copy.sh`
- [ ] Read `docs/03-architecture/DECISIONS.md` (ADRs). Start with accepted ADRs:
- [ ] ADR-0001 (evidence-first outputs with citation IDs + locking)
- [ ] ADR-0002 (verification is fail-closed)
- [ ] ADR-0003 (OCR/layout extraction default for PDFs)
- [ ] ADR-0004 (hybrid retrieval returns chunk IDs)
- [ ] ADR-0005 (workflow steps: retrieve → draft → lock → verify → write)
- [ ] ADR-0006 (fixture-driven evals)
- [ ] ADR-0007 (no external web research inside PoC runs)
- [ ] ADR-0008 (explicit API error envelope)
- [ ] Read the canonical PoC docs:
- [ ] `docs/03-architecture/00_overview.md`
- [ ] `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- [ ] `docs/03-architecture/10_system_architecture.md`
- [ ] `docs/03-architecture/20_state_model.md`
- [ ] `docs/03-architecture/30_data_model.md`
- [ ] `docs/03-architecture/40_rag_and_agents.md`
- [ ] `docs/03-architecture/50_api_surface.md`
- [ ] `docs/03-architecture/60_observability_and_evals.md`

## 4) Local services (when code is present)
- [ ] Postgres running locally.
- [ ] `pgvector` available (required for embeddings).
- [ ] Object storage available for PDFs + exports (local filesystem for dev, or MinIO for S3-parity).
- [ ] OCR provider wired (default Azure Document Intelligence Layout; AWS Textract if AWS-first).
- [ ] LLM + embeddings wired via AI SDK (gateway default; direct provider only when intentional).
- [ ] Workflow runner available (Workflow DevKit / worker process; ADR-0005).

## 5) Environment variables (when code is present)
- [ ] Create local env files (never commit secrets): `apps/web/.env.local` (and others as needed).
- [ ] Database connection configured.
- [ ] Object storage credentials + bucket configured.
- [ ] OCR credentials configured.
- [ ] AI Gateway + model selection configured:
  - `AI_GATEWAY_API_KEY` (required locally/Hetzner; Vercel OIDC can work without it)
  - `LLM_MODEL_CHAT`, `LLM_MODEL_SUMMARY`, `EMBED_MODEL`
- [ ] Confirm no secrets use the `NEXT_PUBLIC_` prefix.

## 6) Run locally (when code is present)
- [ ] Fast local smoke test (ADR-0020, ADR-0014):
- [ ] `pnpm install`
- [ ] Start local services (pick one):
  - [ ] Docker Compose mode: `docker compose up -d`
  - [ ] Sprite mode: start the Sprite sandbox for this repo (see ADR-0022)
- [ ] `pnpm fixture:seed pack_01_clean`
- [ ] `pnpm dev`
- [ ] Open `http://localhost:3000/matters`
- [ ] Open the seeded matter, click a citation chip, and confirm the highlight overlay renders at 100% zoom (ADR-0020).
- [ ] Smoke test the happy path:
- [ ] Upload a synthetic pack from `docs/08-example-data/`.
- [ ] Run “Quick Start: Title + Survey”.
- [ ] Click a citation chip and confirm the PDF highlight overlay works.
- [ ] Smoke test the failure path (ADR-0002, ADR-0007):
- [ ] Ask at least one question that is not answerable from the uploaded pack.
- [ ] Confirm the run resolves to `missing_input` / a blocked row (eg `citation_failed`), not an uncited answer.

## 6a) ADR-0014 tracer bullet (minimal runnable scaffold)
Once the ADR-0014 scaffold code is present, this is the fastest end-to-end slice to validate the “trust moment” (citation chip → viewer → highlight overlay) without wiring OCR, embeddings, or LLM credentials.

Prereqs:
- [ ] Postgres is running locally and `pgvector` is available (via Docker Compose mode or Sprite mode).
- [ ] Database env var is set (expected shape: `DATABASE_URL=postgresql://...`).
- [ ] PDF access is configured for the viewer (expected default for the tracer bullet: serve PDFs directly from fixture files on disk; no MinIO required).
- [ ] Fixture packs exist under `docs/08-example-data/` (at minimum: `pack_01_clean`, `pack_02_missing_rea`).

Run it:
- [ ] Start local services (pick one):
  - [ ] Docker Compose mode: `docker compose up -d`
  - [ ] Sprite mode: start the Sprite sandbox for this repo (see ADR-0022)
- [ ] Install deps: `pnpm install`
- [ ] Seed fixtures:
  - [ ] `pnpm fixture:seed pack_01_clean`
  - [ ] `pnpm fixture:seed pack_02_missing_rea`
- [ ] Start dev server: `pnpm dev`
- [ ] Open the UI: `http://localhost:3000/matters`

What it must prove:
- [ ] Clicking a citation chip opens the correct document + page and renders a highlight overlay from locked polygons.
- [ ] Snippet + `snippet_hash` are visible in the viewer (hashing per `docs/03-architecture/30_data_model.md`).
- [ ] Fail-closed viewer: deliberately bad/invalid citations show an explicit error state and render no overlay.
- [ ] Export is blocked when any row is `citation_failed` (API surface `EXPORT_BLOCKED`).

## 7) Deploy (Hetzner-first is accepted; Vercel optional)
- [ ] Confirm deployment target (ADR-0009, accepted).
- [ ] Hetzner: SSH access to the VM.
- [ ] Hetzner: Postgres backups + basic monitoring are in place (ADR-0011, accepted).
- [ ] Hetzner: S3-compatible storage is available (managed preferred; ADR-0010, accepted).
- [ ] Hetzner: runtime shape (web server + workflow worker) is running under process supervision (ADR-0005).
- [ ] Vercel (optional): Create a new Vercel project from this Git repo.
- [ ] Vercel (optional): Set Vercel “Root Directory” to `apps/web` (monorepo setup).
- [ ] Vercel (optional): Configure environment variables for Preview and Production (match local env).
- [ ] Vercel (optional): Connect Postgres (Vercel Postgres or external).
- [ ] Vercel (optional): Connect storage (S3-compatible baseline; ADR-0010, accepted).
- [ ] Vercel (optional): Deploy a Preview build and verify core flows work end-to-end.

## 8) Verification (when code is present)
- [ ] Run `bash scripts/verify.sh` (expects `pnpm lint`, `pnpm test`, `pnpm build` to be wired).
- [ ] Run fixture evals (when wired; ADR-0006). Expected command shape: `pnpm fixture:eval`
- [ ] If you add configs (eslint/vitest/next/tsconfig/etc), wire the corresponding runner:
- [ ] `scripts/lint.sh`
- [ ] `scripts/test.sh`
- [ ] `scripts/build.sh`
- [ ] `scripts/typecheck.sh`

## 9) Contributing hygiene
- [ ] Append non-trivial learnings to `docs/LEARNINGS.md`.
- [ ] ADRs are append-only in `docs/03-architecture/DECISIONS.md` (link the PR).
- [ ] Oracle bundles + handoff notes are committed under dossier `tmp/` (preferred) or `docs/98-tmp/` (when not tied to a dossier).
- [ ] Local-only scratch goes in root `throwaway/`.
