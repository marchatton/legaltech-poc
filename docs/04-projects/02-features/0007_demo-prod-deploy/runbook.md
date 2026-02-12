# Demo-Prod Runbook (Sprite Dev Now, Hetzner VM Later)

This runbook is written for the simplest path:
- Keep iterating locally (Sprite or host) until the demo flow is solid.
- Deploy later to a single Hetzner Ubuntu VM using Docker Compose.
- Use IP-only HTTP for now (no TLS), protected by browser Basic Auth.

If you later want HTTPS, add a domain + reverse proxy (Caddy/Traefik) and move Basic Auth there or keep it in middleware.

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
- 3 secrets:
  - `BASIC_AUTH_USER`
  - `BASIC_AUTH_PASS`
  - `OBJECT_STORE_SIGNING_SECRET` (any long random string)
- 1 runtime-mode setting:
  - `EVIDENCE_BACKEND=db_only` (recommended to disable fixture fallback and use DB/object-store evidence only)

## 2) Configure Secrets
1. Copy `.env.demo-prod.example` to `.env.demo-prod`.
2. Set:
   - `BASIC_AUTH_USER`
   - `BASIC_AUTH_PASS`
   - `OBJECT_STORE_SIGNING_SECRET` (any long random string)
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
