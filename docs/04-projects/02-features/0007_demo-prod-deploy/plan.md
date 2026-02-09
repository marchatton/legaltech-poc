# Plan: Demo-Prod Deploy (Private "Real App" Demo)

Date: 2026-02-09
Owner: marc

## Goal
Deploy Orbital PoC as a private, production-build demo ("demo-prod") that can be shown as a real app:
- Runs with `NODE_ENV=production`
- Uses **fixture/test data only**
- Protected by **Basic Auth**
- Deployable on Hetzner using Docker/Compose

## Non-Goals (For This Slice)
- User uploads / real customer docs
- Multi-user accounts / RBAC
- Production-grade hardening beyond light gating (this is a demo)
- Making DB-backed ingestion + quick-start perfect (can remain optional)

## Key Decision: Introduce `ORBITAL_MODE`
Add an explicit runtime mode to avoid conflating "production build" with "real prod":
- `ORBITAL_MODE=dev` (today: local dev)
- `ORBITAL_MODE=demo-prod` (Hetzner demo)
- `ORBITAL_MODE=prod` (future; locked down by default)

Principle: **default to locked down** when `ORBITAL_MODE` is absent.

## Enablement Matrix (Demo-Prod)

### Must Work (Core Demo Journey)
- `/` landing loads
- `/matters?pack=pack_01_clean` loads (fixture-driven)
- Clicking a citation opens `/matters/viewer` and loads:
  - `GET /citations/:id`
  - `GET /documents/:id/render?page=N` -> signed `render_url`
  - `GET /documents/:id/pdf?...` (Range requests)
- Export and download:
  - `POST /export/csv` -> download link works
  - `POST /export/docx` -> download link works (requires fixture fallback implementation)
  - `GET /folders/:pack_id/artefacts` shows the created exports
  - `GET /artefacts/:id/download` works

### Must Be Disabled (Fixture-Only Posture)
- Create folder (API): `POST /folders`
- Upload init: `POST /folders/:id/documents` (init upload)
- Upload bytes: `PUT /documents/:id/upload`

### Optional (Operator Only, Behind Flags)
- `POST /demo/load-pack` (DB-backed demo pack loader)
- DB-backed pages and run/progress endpoints
- Trace export endpoints (admin-token only)

## Plan (Phased)

### Phase 0: Decisions + Guardrails
- Define `ORBITAL_MODE` semantics, defaults, and what "demo-prod" enables.
- Confirm the demo posture: fixture-only with exports.
- Decide where Basic Auth lives:
  - Preferred: Next middleware so *everything* is consistently gated (pages, APIs, PDF bytes).
  - Alternative: reverse proxy basic auth (Nginx/Caddy) (fine, but internal server fetches still must work).

Deliverable: update dossier PRD and route matrix.

### Phase 1: Runtime Gating Refactor
Implement mode helpers and reframe dev-only gates to allow demo-prod.

Files:
- Add: `apps/web/lib/runtimeMode.server.ts` (mode parsing + helpers)
- Modify:
  - `apps/web/lib/devOnly.ts`
  - `apps/web/lib/devOnlyApi.server.ts`
  - `apps/web/lib/demoMode.server.ts` (demo toolbar should be controlled by mode + explicit operator flag, not dev-only)

Acceptance:
- With `ORBITAL_MODE=demo-prod`, previously dev-only routes become reachable.
- With no `ORBITAL_MODE`, routes remain locked down (not accidentally open).

Rollback:
- Set `ORBITAL_MODE=prod` (or unset) to lock down again.

### Phase 2: Basic Auth Gate (Light Security)
Add Basic Auth for demo-prod, and ensure internal server-side fetches forward auth.

Files:
- Add: `apps/web/middleware.ts` (basic auth enforcement)
- Add: `apps/web/lib/basicAuth.server.ts`
- Fix internal server fetches:
  - `apps/web/app/(app)/matters/viewer/page.tsx` must forward `Authorization`
  - `apps/web/app/(app)/matters/ArtefactsList.tsx` must forward `Authorization`
- Reduce SSRF risk: avoid trusting `Host`/`X-Forwarded-*` for internal fetch origins.
  - Add: `apps/web/lib/safeOrigin.server.ts` and use it.

Acceptance:
- Unauthed `GET /matters` returns `401` with `WWW-Authenticate`.
- After auth, viewer + exports work without 401 loops.

Rollback:
- Remove BASIC_AUTH env vars (auth disabled) or revert middleware.

### Phase 3: Fixture Support In Demo-Prod + DOCX Fixture Fallback
Enable fixture PDF serving in demo-prod and make DOCX export work for fixture runs.

Files:
- Modify:
  - `apps/web/app/(api)/documents/[id]/render/route.ts` (allow fixture in demo-prod)
  - `apps/web/app/(api)/documents/[id]/pdf/route.ts` (allow fixture in demo-prod)
  - `apps/web/app/(api)/export/docx/route.ts` (add fixture snapshot fallback path)

Acceptance:
- A fixture citation can render in viewer in demo-prod.
- `POST /export/docx` succeeds for fixture packs and yields a download URL.

Rollback:
- Gate fixture serving strictly to `{dev, demo-prod}`.

### Phase 4: Docker/Compose Packaging For Hetzner
Package `apps/web` as a production build and provide an operator-friendly compose file.

Files:
- Add: `apps/web/Dockerfile` (multi-stage build, production runtime)
- Add: `docker-compose.demo-prod.yml` (web + worker + db + volumes)
- Optional: reverse proxy service (Caddy/Nginx) for TLS termination.

Critical details:
- Worker must be a separate service using `pnpm --filter @orbital-poc/web worker`.
- Provide volumes for:
  - `tmp/object-store` (artefacts + stored PDFs)
  - `tmp/fixture-seed` (review state)
  - Postgres data
- Require in demo-prod:
  - `DATABASE_URL`
  - `OBJECT_STORE_SIGNING_SECRET` (no dev fallback)
  - `BASIC_AUTH_USER` / `BASIC_AUTH_PASS`

Acceptance:
- `docker compose -f docker-compose.demo-prod.yml up -d` brings up `db`, `web`, and `worker`.
- Demo works after restarts (volumes persist).

Rollback:
- Roll back Docker image tag; volumes remain compatible.

## Verification Ladder (Demo-Prod)
1. Build: `pnpm -r build`
2. Start (docker): `docker compose -f docker-compose.demo-prod.yml up -d`
3. Smoke (manual):
   - Open `/` -> `/matters?pack=pack_01_clean` -> click a citation -> viewer loads
   - Export CSV -> download works
   - Export DOCX -> download works
4. Negative tests:
   - Upload endpoints are disabled (404/403)
   - Missing `OBJECT_STORE_SIGNING_SECRET` fails closed with a clear operator error

## Risks
- Accidental exposure in real prod: mitigated by explicit `ORBITAL_MODE` defaulting to locked down.
- Basic Auth breaks internal server fetches: mitigated by forwarding `Authorization` in server-side fetches.
- Reverse-proxy headers: mitigate by avoiding untrusted host-derived origins for internal requests.
- Worker not running: must surface as an operator-visible degraded mode.

## References
- `docs/03-architecture/07_current_poc_runtime.md`
- `docs/03-architecture/50_api_surface.md`
- `docker-compose.yml` (existing DB service)
- Related dossiers: `docs/04-projects/02-features/0004_csv-export`, `docs/04-projects/02-features/0005_word-export`

