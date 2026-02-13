# Demo-Prod Runbook (Sprite Dev Now, Hetzner VM Later)

This runbook is written for the simplest path:
- Keep iterating locally (Sprite or host) until the demo flow is solid.
- Deploy later to a single Hetzner Ubuntu VM using Docker Compose.
- Use IP-only HTTP for now (no TLS), protected by browser Basic Auth.

If you later want HTTPS, add a domain + reverse proxy (Caddy/Traefik) and move Basic Auth there or keep it in middleware.

## Operator Quick Checklist (Phase 4)
Use this when you need to run the demo with minimal setup drift.

### 1) Startup steps (local demo path)
1. From repo root, start Postgres:
```bash
docker compose up -d db
```
2. From repo root, start the app:
```bash
pnpm dev
```
3. Wait for Next dev to report ready, then open `http://localhost:3000/matters`.
4. If using the demo toolbar path, set `DEMO_MODE=1` before startup.

### 2) Env preflight
Check these before a live demo.

Local dev:
- `AI_GATEWAY_API_KEY` (required for live chat model responses)
- `DATABASE_URL` (optional in dev; defaults to `postgresql://orbital:orbital@127.0.0.1:5432/orbital`)
- `OBJECT_STORE_SIGNING_SECRET` (or set `ALLOW_DEV_OBJECT_STORE_SECRET=1` for local-only fallback)
- `EVIDENCE_BACKEND=db_only` (recommended)

Demo-prod (VM):
- `BASIC_AUTH_USER`
- `BASIC_AUTH_PASS`
- `OBJECT_STORE_SIGNING_SECRET`
- `AI_GATEWAY_API_KEY` (only if runtime is wired to pass it to `web`; otherwise chat stays in deterministic fallback mode)
- `EVIDENCE_BACKEND=db_only` (recommended)

### 3) Fallback path if chat degrades
If chat is failing or unstable during demo time:
1. Switch to deterministic fallback by running without `AI_GATEWAY_API_KEY` and restarting the web app.
2. Continue the demo through upload/process/citations/review/export.
3. In the chat tab, use a prompt and narrate the fallback behavior (`Not found in provided documents.`) as expected degraded mode.
4. Capture trace IDs from any chat error banner/log for follow-up after the demo.

### 4) Recovery for missing Next vendor chunk (`@opentelemetry`)
Symptom:
- `Cannot find module './vendor-chunks/@opentelemetry+api@1.9.0.js'`
- 500s on core routes in dev.

Recovery (from repo root):
```bash
pkill -f "next dev" || true
rm -f apps/web/.next-dev.lock
rm -rf apps/web/.next
pnpm dev
```

Post-recovery smoke check:
- `http://localhost:3000/matters`
- `http://localhost:3000/api/folders`
- one known matter for:
  - `/api/folders/<id>/documents`
  - `/api/folders/<id>/report`

## Phase A: Continue Local Dev (Sprite)
Goal: keep moving fast without needing the VM yet.

1) Start dependencies (Postgres)
- From repo root:
```bash
docker compose up -d db
```

2) Start the web app
- From repo root:
```bash
pnpm dev
```

3) (Optional) Enable dev-only demo toolbar
- In your local `.env` or Sprite env:
  - `DEMO_MODE=1`
  - `NODE_ENV=development` (should already be true in dev)

4) Exercise the core flow locally
- Open `http://localhost:3000`
- Use the demo toolbar to load `pack_01_clean`
- Confirm:
  - matter page loads
  - PDFs open
  - Quick Start starts
  - exports generate and download

You can postpone everything in Phase B until you are ready to demo on a “real server”.

## Phase B: Deploy To Hetzner VM (IP-Only, Docker Compose)
Goal: a private demo-prod instance that behaves like a production build.

### B0) What you need
- VM public IP (Hetzner shows this in the VM details)
- SSH access to the VM
- Docker Engine + Docker Compose plugin installed on the VM
- 3 required secrets:
  - `BASIC_AUTH_USER`
  - `BASIC_AUTH_PASS`
  - `OBJECT_STORE_SIGNING_SECRET` (any long random string)
- 1 optional secret (only if live chat model is in scope):
  - `AI_GATEWAY_API_KEY` (and verify it is passed into the `web` runtime)
- 1 runtime-mode setting:
  - `EVIDENCE_BACKEND=db_only` (recommended to disable fixture fallback and use DB/object-store evidence only)

### B0.1) Configure secrets
1. Copy `.env.demo-prod.example` to `.env.demo-prod`.
2. Set:
   - `BASIC_AUTH_USER`
   - `BASIC_AUTH_PASS`
   - `OBJECT_STORE_SIGNING_SECRET` (any long random string)
   - `AI_GATEWAY_API_KEY` (if live chat model responses are required and wired into `web`)
   - `EVIDENCE_BACKEND=db_only` (recommended for demo-prod)

### B1) Get the repo onto the VM
Pick one:

Option 1 (simplest): `git clone` on the VM
- SSH to the VM, then:
```bash
git clone <your-repo-url>
cd orbital-poc
```

Option 2: rsync/copy the folder from your machine to the VM

### B2) Start the stack on the VM
From the repo root:
```bash
docker compose -f docker-compose.demo-prod.yml --env-file .env.demo-prod up -d --build
```

### B3) Open the app
- Visit: `http://<your-vm-ip>:3000`
- Your browser should prompt for Basic Auth credentials.

### B4) Load a demo pack (creates a fresh Matter in Postgres)
Run this from your laptop (or from the VM if you prefer):
```bash
curl -u "$BASIC_AUTH_USER:$BASIC_AUTH_PASS" \
  -H 'Content-Type: application/json' \
  -d '{"pack_id":"pack_01_clean"}' \
  "http://<your-vm-ip>:3000/demo/load-pack"
```

The response includes `folder.id` (the Matter id). Open:
- `http://<your-vm-ip>:3000/matters/<folder-id>`

### B5) Demo flow checklist
- Open a PDF (Range requests)
- Run Quick Start
- Export CSV + DOCX
- Download artefacts from the Artefacts panel

### B6) Persistence (what survives restarts)
Compose volumes persist:
- Postgres data
- `tmp/object-store` (PDFs + exports)
- `tmp/fixture-seed` (fixture snapshots, if used)

### B7) Useful ops commands
Check logs:
```bash
docker compose -f docker-compose.demo-prod.yml logs -f web
docker compose -f docker-compose.demo-prod.yml logs -f worker
docker compose -f docker-compose.demo-prod.yml logs -f db
```

Restart services:
```bash
docker compose -f docker-compose.demo-prod.yml restart web worker
```

Tear down (keeps volumes):
```bash
docker compose -f docker-compose.demo-prod.yml down
```

Full wipe (deletes volumes, destructive):
```bash
docker compose -f docker-compose.demo-prod.yml down -v
```

### Security note (IP-only)
With IP-only HTTP, Basic Auth credentials are sent in plaintext. Use this only for low-risk demos, and rotate the password.
