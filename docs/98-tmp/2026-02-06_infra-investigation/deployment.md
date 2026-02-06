# Deployment posture (Vercel vs Hetzner)

Date: 2026-02-06

Terminology (avoid "client vs Vercel" confusion)
- Client = the browser (React client components). It can only talk to your system over HTTP.
- Vercel "web" = server compute too (Next.js server components + route handlers run on Vercel).
- Hetzner = a VM where you can run long-lived processes (workers) and private services.

Constraint reminders (from the architecture docs)
- Workflow runtime wants durability + retries + resumability (WDK + Postgres world).
- OCR/embedding/LLM calls are side effects; they should run in steps with idempotency.
- PDFs + exports need an object store.

## Deployment options

### Option A: Hetzner-first (single VM, Docker Compose)
Shape
- Run: Next.js server, WDK worker, Postgres, and optionally MinIO on one VM.

Pros
- simplest operational story for long-running workflows
- avoids serverless DB connection pitfalls
- easiest to reason about observability in one place

Cons
- you own TLS, deploys, process supervision, backups
- no Vercel preview deploy UX

### Option B1: Vercel app (UI + server APIs) + Hetzner worker + managed data plane
Shape
- Deploy `apps/web` to Vercel for UI + route handlers.
- Run WDK worker on Hetzner.
- Use managed Postgres + managed S3-compatible object storage reachable from both Vercel and Hetzner.

Pros
- great frontend deploy UX (preview deploys)
- keeps the durable workflow runtime out of serverless

Cons
- Postgres connections from Vercel need pooling/limits
- more moving parts across networks (latency, security groups)

Notes
- This is usually the "simplest" Vercel + worker split because you don't have to expose a self-hosted DB to the public internet.

### Option B2: Vercel UI + Hetzner backend (API + worker + DB)
Shape
- Deploy `apps/web` to Vercel for UI (SSR/RSC is fine).
- Run a backend API + WDK worker + Postgres on Hetzner.
- Keep Postgres private to the backend network.

Pros
- DB stays private; easiest security story for a self-hosted Postgres.
- Worker and DB are co-located (low latency, simpler debugging).

Cons
- You own backend deploys/ops.
- Either the browser calls the Hetzner API directly (CORS/auth), or Vercel route handlers proxy to it (more moving parts).

### Option C: All-in Vercel (including DB/storage)
Shape
- Vercel for web + Postgres + Blob.

Pros
- lowest ops

Cons
- depends on whether WDK can run cleanly in this posture; background/long-running work is the hard part
- strongest vendor coupling

## Recommendation

Recommended default (PoC)
- If the goal is "get to a stable demo fastest": Option A (Hetzner-first Compose).
- If the goal is "share preview URLs constantly": Option B1, with explicit connection pooling.
- If you explicitly want Postgres on Hetzner and private: Option B2.
