# Onboarding checklist

Last updated: 2026-02-06

Use this when setting up a new machine, or when onboarding someone new to this repo.

## 0) Repo reality check (do this first)
- [ ] Confirm whether this repo currently contains runnable code.
- [ ] Expected (when implemented): `pnpm-workspace.yaml`, root `package.json`, `apps/web/package.json`, `packages/core/package.json`.
- [ ] If those files are missing, this repo is currently docs-first: you can still contribute to docs/architecture, but you will not be able to run the app yet.

## 1) Accounts and access
- [ ] GitHub access to the repo (SSH recommended).
- [ ] Vercel account (deployments + preview URLs).
- [ ] Postgres provider chosen (local Docker for dev; managed Postgres for deploy).
- [ ] Object storage chosen (S3-compatible, or Vercel Blob).
- [ ] OCR provider chosen (Azure Document Intelligence or AWS Textract).
- [ ] LLM + embeddings path chosen (via AI SDK): Vercel AI Gateway (preferred) or direct provider keys (only with a reason).

## 2) Local tooling
- [ ] Node.js installed (LTS recommended). If `.nvmrc` / `.node-version` appears in the repo later, follow it.
- [ ] pnpm available (prefer Corepack: `corepack enable`).
- [ ] Docker installed (for local Postgres/MinIO).
- [ ] `psql` installed (for DB debugging).
- [ ] Vercel CLI installed.
- [ ] Optional: `aws` CLI or `az` CLI (if testing OCR/storage against cloud locally).

## 3) Repo setup (one-time)
- [ ] Install git hooks: `bash scripts/install_git_hooks.sh`
- [ ] Optional (agent tooling): copy repo skills into your agent home: `bash scripts/install_codex_skills_copy.sh`
- [ ] Read the canonical PoC docs:
- [ ] `docs/03-architecture/00_overview.md`
- [ ] `docs/03-architecture/05_tech_stack_and_dev_workflow.md`
- [ ] `docs/03-architecture/10_system_architecture.md`
- [ ] `docs/03-architecture/50_api_surface.md`

## 4) Local services (when code is present)
- [ ] Postgres running locally.
- [ ] `pgvector` available (required for embeddings).
- [ ] Object storage available for PDFs + exports (local filesystem for dev, or MinIO for S3-parity).
- [ ] OCR provider wired (Azure Document Intelligence or AWS Textract).
- [ ] LLM + embeddings wired via AI SDK (gateway default; direct provider only when intentional).

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
- [ ] Install deps: `pnpm install`
- [ ] Start the dev server (see root `package.json` scripts once scaffolded).
- [ ] Smoke test the happy path:
- [ ] Upload a synthetic pack from `docs/08-example-data/`.
- [ ] Run “Quick Start: Title + Survey”.
- [ ] Click a citation chip and confirm the PDF highlight overlay works.

## 7) Vercel setup (when deploying)
- [ ] Create a new Vercel project from this Git repo.
- [ ] Set Vercel “Root Directory” to `apps/web` (monorepo setup).
- [ ] Configure environment variables for Preview and Production (match local env).
- [ ] Connect Postgres (Vercel Postgres or external).
- [ ] Connect storage (Vercel Blob or S3-compatible).
- [ ] Deploy a Preview build and verify core flows work end-to-end.

## 8) Verification (when code is present)
- [ ] Run `bash scripts/verify.sh` (expects `pnpm lint`, `pnpm test`, `pnpm build` to be wired).
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
