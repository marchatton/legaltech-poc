# Oracle bundles (infra decisions)

Date: 2026-02-06

These are copy/paste-ready Oracle commands for deep research with repo context.

Notes
- Browser mode requires a Chrome profile that is signed into ChatGPT (Oracle reads cookies).
- If browser automation fails, use `--render --copy-markdown` and paste the bundle into ChatGPT manually.

## 1) Deployment posture: Vercel + Hetzner (simple PoC)

```bash
npx -y @steipete/oracle --engine browser --model gpt-5.2-pro --slug "poc-deploy-shape" \
  -p "We are building a production-minded PoC for an evidence-first CRE diligence copilot. Repo is currently docs-first.\n\nContext (desired): Next.js App Router UI, durable workflow runtime (Workflow DevKit) with steps for OCR/embeddings/LLM calls, Postgres (pgvector+tsvector), and S3-compatible object storage for PDFs/exports.\n\nPreference: use Vercel for easy preview deployments, but host backend/worker/data plane on an existing Hetzner VM where it simplifies long-running work.\n\nTask:\n1) Propose the simplest deployment architecture that still respects the durability/evidence constraints.\n2) Give two options: (A) Vercel web + Hetzner worker + managed Postgres/storage, (B) Vercel web + Hetzner backend (API+worker+Postgres).\n3) For each, list pros/cons, risks, and operational gotchas (DB access, connection pooling, security boundaries, backups).\n4) Recommend one for a PoC and explain why.\n5) Provide a step-by-step implementation plan (repo scaffold + services + env vars).\n\nOutput: a clear recommendation and a checklist." \
  --file docs/03-architecture/00_overview.md \
  --file docs/03-architecture/05_tech_stack_and_dev_workflow.md \
  --file docs/03-architecture/06_frameworks_agents_rag_evals.md \
  --file docs/03-architecture/10_system_architecture.md \
  --file docs/03-architecture/50_api_surface.md \
  --file docs/03-architecture/DECISIONS.md \
  --file docs/98-tmp/2026-02-06_infra-investigation/deployment.md \
  --file docs/98-tmp/2026-02-06_infra-investigation/recommended-stack.md
```

## 2) Object storage choice (PDFs + exports)

```bash
npx -y @steipete/oracle --engine browser --model gpt-5.2-pro --slug "poc-storage-choice" \
  -p "Given the PoC architecture, recommend an object storage setup for PDFs + exports that works for: local dev + Vercel deployments + a Hetzner VM backend.\n\nCompare: MinIO-on-VM, Hetzner Object Storage, Cloudflare R2, AWS S3, and Vercel Blob.\n\nFor each: signed URL story for pdf.js, cost/egress concerns, operational complexity, and how to structure storage keys.\n\nOutput: recommendation + env var contract." \
  --file docs/03-architecture/10_system_architecture.md \
  --file docs/03-architecture/50_api_surface.md \
  --file docs/98-tmp/2026-02-06_infra-investigation/storage.md
```

## 3) OCR provider choice (layout + geometry)

```bash
npx -y @steipete/oracle --engine browser --model gpt-5.2-pro --slug "poc-ocr-choice" \
  -p "We need OCR + geometry for scanned PDFs to support click-to-highlight citations in a pdf.js viewer.\n\nCompare: Azure Document Intelligence (Layout) vs AWS Textract for this use-case.\n\nCover: geometry quality, latency, pricing model, failure modes, retry/idempotency patterns, and what to persist in the canonical `document_pages` table.\n\nOutput: recommendation + a suggested canonical schema for persisted OCR results." \
  --file docs/03-architecture/30_data_model.md \
  --file docs/03-architecture/05_tech_stack_and_dev_workflow.md \
  --file docs/98-tmp/2026-02-06_infra-investigation/ocr.md
```

## 4) LLM gateway options (routing + observability)

See: `docs/98-tmp/oracle/oracle-bundle_llm-gateways.md`
