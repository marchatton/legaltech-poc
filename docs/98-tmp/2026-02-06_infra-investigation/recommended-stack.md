# Recommended "simple" setup (PoC)

Date: 2026-02-06

Goal
- Use Vercel for fast preview deployments.
- Keep durable/background work off serverless where possible.
- Keep the data plane stable and portable.

## Option 1 (recommended): Vercel web + Hetzner worker, managed data plane

Use this if you want the easiest day-to-day dev loop.

Shape
- Web/UI + HTTP API: Vercel (Next.js App Router + route handlers)
- Durable worker: Hetzner VM (WDK worker process)
- Postgres: managed (Neon / Vercel Postgres)
- Object storage: S3-compatible managed (R2 / S3 / B2)
- OCR: Azure Document Intelligence (Layout) or AWS Textract
- LLM: Vercel AI Gateway (or direct keys)

Why it's simple
- One web app to deploy (Vercel).
- One worker to run (Hetzner).
- No public Postgres on your VM.

Trade-offs
- You now depend on at least one managed service (Postgres + object storage).

## Option 2: Vercel web + Hetzner backend (API + worker + Postgres)

Use this if you want the data plane private on Hetzner.

Shape
- Web/UI: Vercel (Next.js)
- Backend API + worker + Postgres: Hetzner VM (Docker Compose)
- Object storage: Hetzner Object Storage (S3-compatible) or MinIO on the VM
- OCR + LLM: external providers

Why it's simple
- DB stays private and local to the backend.
- You can reason about workflow + DB in one box.

Trade-offs
- You own Postgres backups/patching/monitoring.
- You must deploy the backend yourself (Compose, Coolify, or GitHub Actions + SSH).

## Default recommendation

Start with Option 1 to keep iteration speed high.
If you later decide you want the whole data plane on Hetzner, migrate Postgres + storage to Option 2 (your app code barely changes if you kept adapters thin).

