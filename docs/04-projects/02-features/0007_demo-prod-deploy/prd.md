# PRD: Demo-Prod Deploy (Private Hetzner "Real App" Demo)

Owner: marc
Status: Draft
Date: 2026-02-09
Slug: demo-prod-deploy

## Introduction / Overview

### Problem
Orbital PoC currently demos best in local development, but the "real app" experience is blocked by intentional dev-only gates (`assertDevOnly*`) and dev-only demo tooling. When attempting a more production-like demo, key user actions can fail (for example, signed URLs require a configured signing secret).

We need a private, production-build deployment suitable for demos without exposing the system publicly or accepting real customer data.

### Goal
Run a private "demo-prod" instance on Hetzner (Docker/Compose) that behaves like a real app, using fixture/test data only, protected by Basic Auth.

### Slice
Introduce a deployable `ORBITAL_MODE=demo-prod` runtime mode that enables the core fixture-based demo journey (viewer + exports) in a production build, while keeping uploads and non-demo surfaces disabled.

### Primary Observable Effect
Before: Outside `NODE_ENV=development`, key pages/routes 404 and demo flows fail; audience cannot use the app end-to-end.  
After: A demo URL (Hetzner) prompts for Basic Auth and then supports: `/matters` -> citation viewer -> CSV/DOCX export + download, all running as `next build` + `next start`.

### In Scope
- Add `ORBITAL_MODE` with explicit `demo-prod` behavior and safe defaults.
- Reframe "dev-only" gates to allow `{dev, demo-prod}` while keeping real prod locked down by default.
- Add Basic Auth protection for demo-prod.
- Ensure internal server-side fetches work under Basic Auth (forward `Authorization`).
- Allow fixture PDF serving in demo-prod (but not real prod).
- Add fixture-backed DOCX export path (so demo feels complete).
- Docker/Compose packaging for Hetzner: `web` + `worker` + `db` + volumes + required env.

## Goals
- Demo-prod runs with `NODE_ENV=production` and `ORBITAL_MODE=demo-prod`.
- Demo-prod is private by default (Basic Auth on all routes including APIs and PDF bytes).
- Demo journey is repeatable with test/fixture data only.
- Demo-prod has an operator-friendly runbook and rollback path.

## User Stories

### US-001: Demo Viewer Can Use The App End-to-End
As a demo viewer, I want to click a citation and see the PDF viewer render and highlight evidence, so that I can trust the system is grounded.

#### Acceptance Criteria
- AC-001: When authenticated, `/matters?pack=pack_01_clean` loads successfully in demo-prod.
- AC-002: Clicking a citation navigates to `/matters/viewer` and loads the PDF content via Range requests.
- AC-003: When a citation is invalid/corrupted, the viewer renders no overlay and shows an explicit failure state (no silent failure).

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean` and `tmp/fixture-seed/*/snapshot.json`.
- Automated checks: `pnpm -r typecheck`, `pnpm -r lint`, `pnpm -r test` (where applicable).
- Manual checks:
  - Run demo-prod stack, open `/matters?pack=pack_01_clean`, click `cit_TS-01_1`, confirm viewer loads and renders.

### US-002: Demo Viewer Can Export And Download Outputs
As a demo viewer, I want to export CSV and DOCX outputs and download them, so that I can see what the system produces.

#### Acceptance Criteria
- AC-004: `POST /export/csv` succeeds for fixture packs in demo-prod and returns a working download URL.
- AC-005: `POST /export/docx` succeeds for fixture packs in demo-prod and returns a working download URL.
- AC-006: `GET /folders/:pack_id/artefacts` lists the generated artefacts.
- AC-007: Artefact download routes require Basic Auth and work after authentication.

#### Verification
- Pack/fixture/script: `docs/08-example-data/pack_01_clean`.
- Manual checks:
  - From `/matters?pack=pack_01_clean`, click "Export exceptions" and "Export memo", then download both.

### US-003: Demo Operator Can Deploy And Restart Reliably
As a demo operator, I want a single docker compose command to bring up web + worker + db with persistent volumes, so that demos are repeatable.

#### Acceptance Criteria
- AC-008: `docker compose -f docker-compose.demo-prod.yml up -d` brings up `db`, `web`, and `worker`.
- AC-009: After restarting services, exports still download and review state persists (volumes mounted for `tmp/object-store` and `tmp/fixture-seed`).
- AC-010: If `OBJECT_STORE_SIGNING_SECRET` is missing, the system fails closed with a clear operator-facing error (not a silent partial demo).

#### Verification
- Pack/fixture/script: operator runbook steps + repeated restart verification.
- Manual checks:
  - Bring stack up, run demo steps, restart, re-run demo steps.

## Functional Requirements
- FR-001: The system must support `ORBITAL_MODE` with values `{dev, demo-prod, prod}` and default to locked down when unset.
- FR-002: The system must treat `demo-prod` as production build (`NODE_ENV=production`) while explicitly enabling the demo surfaces.
- FR-003: The system must enforce Basic Auth across pages, APIs, PDF byte endpoints, and artefact downloads in demo-prod.
- FR-004: Server-side internal fetches must forward the `Authorization` header so SSR rendering and route-handler fetches succeed under Basic Auth.
- FR-005: Fixture PDF serving must be enabled in `demo-prod` and disabled in `prod`.
- FR-006: DOCX export must support fixture snapshots (not only DB-backed runs) in demo-prod.
- FR-007: Upload-init and upload-bytes endpoints must remain disabled in demo-prod (fixture-only posture).
- FR-008: Demo-prod must require `DATABASE_URL` and `OBJECT_STORE_SIGNING_SECRET` and must not rely on dev-only fallbacks.
- FR-009: A separate worker process/service must be runnable in demo-prod for durable jobs (no inline draining).
- FR-010: Provide a minimal operator runbook including rollback instructions.

## Non-Goals (Out of Scope)
- Accepting user uploads or real customer data in demo-prod.
- Multi-user accounts, RBAC, or OAuth.
- Full production security hardening (WAF, rate limiting, audit logs) beyond light gating and safe defaults.
- Making DB-backed ingestion / quick-start perfect for the demo (this can remain optional and gated).

## Design Considerations (Optional)
- The demo should clearly communicate "fixture-only" and show a simple "Demo" indicator in UI.
- Keep failure states explicit (auth, worker down, missing secrets).

## Technical Considerations (Optional)
- Recommended: implement Basic Auth in `apps/web/middleware.ts` so all routes are gated consistently.
- Reverse proxy (Caddy/Nginx) can handle TLS termination; ensure forwarded headers do not create an SSRF origin issue.
- Worker separation: run `apps/web/scripts/worker.ts` as a long-running process/service in demo-prod.

## Failure States & UX
- Missing/invalid Basic Auth: return `401` with `WWW-Authenticate` (browser prompt).
- Worker not running: show "Runs/exports may be delayed" as an explicit degraded-mode banner; include an operator hint in logs.
- Missing `OBJECT_STORE_SIGNING_SECRET`: fail closed with an explicit error response (and log).
- DB unavailable: show a safe user-facing error (no stack traces).

## Metrics / Logging
- Success signals:
  - Log a `demo_prod_smoke_passed` event when core routes load (manual-run script can emit).
- Debug signals:
  - Log runtime mode at startup (`ORBITAL_MODE`, commit sha if available).
  - Log 401 rates (basic auth failures) and 5xx rates.

## Rollback / Disable Plan
- Feature flag / mode:
  - `ORBITAL_MODE` unset or set to `prod` locks down demo surfaces.
- Safe fallback behavior:
  - Demo pages and APIs return 404/disabled responses outside `demo-prod` and `dev`.

## Risks & Dependencies
- Risks:
  - Accidental exposure if mode defaults are wrong (mitigate: default locked down; explicit `demo-prod` opt-in).
  - Basic Auth breaks SSR/server-side internal fetches (mitigate: forward `Authorization`).
  - Host-derived origin SSRF risk (mitigate: safe local origin helper).
- Dependencies:
  - Docker packaging + compose file.
  - TLS termination on Hetzner (recommended) to avoid sending Basic Auth over plaintext.

## Success Metrics
- A demo operator can bring the stack up in < 10 minutes and run the full journey without 5xx errors.
- Demo audience can complete viewer + exports in < 5 minutes during a live demo.

## Open Questions
- Q1: Where should Basic Auth be enforced for Hetzner: Next middleware (preferred) or reverse proxy (acceptable)?
- Q2: Do we want to include the DB-backed demo pack loader (`/demo/load-pack`) in demo-prod, or keep the demo fixture-only?
- Q3: Do we require a real domain + TLS for the demo, or is an IP + VPN/SSH tunnel acceptable?

## Sources
- `docs/03-architecture/07_current_poc_runtime.md` (current runtime assumptions)
- `docs/03-architecture/50_api_surface.md` (API/auth intent)
- `docs/04-projects/02-features/0004_csv-export/prd.md` (export behavior)
- `docs/04-projects/02-features/0005_word-export/prd.md` (docx export behavior)
- `docs/04-projects/02-features/0007_demo-prod-deploy/investigation.md` (this investigation)

