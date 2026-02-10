# Investigation: Demo-Prod (Beyond Dev-Only)

## Summary
The current Orbital PoC demo experience is not deployable as a "real app" because key UI + API surfaces are intentionally **dev-only** (`assertDevOnly*`) and demo tooling is also dev-only (`DEMO_MODE`). Additionally, several user-visible actions depend on **signed URLs** and will hard-fail unless `OBJECT_STORE_SIGNING_SECRET` is configured (dev-only fallback exists but should not be used in a deployed demo).

For the demo, we want the **app itself** (DB-backed matters, background jobs, exports) using **synthetic packs only**, protected by Basic Auth.

## Symptoms
- Clicking certain buttons caused "Application error" and the app appeared to go down during demo.
- Several routes are unreachable outside local development because they `notFound()` / return 404 when `NODE_ENV !== "development"`.

## Investigation Log

### 2026-02-09 - Gating And Modes
**Hypothesis:** dev-only gates prevent a production-like demo deployment.
**Findings:** UI pages and API route handlers call `assertDevOnly()` / `assertDevOnlyApi(...)` which block access unless `NODE_ENV === "development"`.
**Evidence:**
- `apps/web/lib/devOnly.ts`
- `apps/web/lib/devOnlyApi.server.ts`
- Call sites discovered via search (e.g. `apps/web/app/(app)/matters/page.tsx`, `apps/web/app/(api)/export/csv/route.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`)
**Conclusion:** Confirmed. "Full app" behavior is intentionally unavailable outside dev.

### 2026-02-09 - Signed URL Failures
**Hypothesis:** app crashes are caused by missing signed URL secret.
**Findings:** `apps/web/lib/objectStore.server.ts` throws `OBJECT_STORE_SIGNING_SECRET_MISSING` unless `OBJECT_STORE_SIGNING_SECRET` is set, or a dev-only fallback is explicitly enabled with `ALLOW_DEV_OBJECT_STORE_SECRET=1`.
**Evidence:** `apps/web/lib/objectStore.server.ts`
**Conclusion:** Confirmed. Deployed demo-prod must set a real secret.

### 2026-02-09 - Worker Model Outside Dev
**Hypothesis:** background work in production requires a separate worker process.
**Findings:** inline draining (`kickInlineJobWorker`) is dev-only; outside dev a long-running worker must run (`apps/web/scripts/worker.ts`).
**Evidence:** `apps/web/lib/jobs/jobWorker.server.ts`, `apps/web/scripts/worker.ts`
**Conclusion:** Confirmed. A Hetzner demo-prod needs `web` + `worker` processes.

## Root Cause
The PoC is designed to be safe by default:
- dev-only gates intentionally prevent accidental exposure outside local dev
- demo tooling is intentionally dev-only
- signed URL secret is required for any PDF render / artefact download links
- durable jobs require a separate worker outside dev

## Recommendations
1. Introduce an explicit runtime mode `ORBITAL_MODE=demo-prod` and reframe dev-only gates to allow only `dev` + `demo-prod`.
2. Add Basic Auth as a light security gate (prefer Next middleware for end-to-end coverage), and ensure internal server-side fetches forward the `Authorization` header.
3. Support a “real app” demo journey in demo-prod using synthetic packs loaded into Postgres (via a pack loader), while keeping risky tooling (spikes, unsafe overrides) dev-only.
4. Add Docker packaging and a Compose file that runs `web` + `worker` + `db` with persistent volumes for `tmp/object-store` and `tmp/fixture-seed`.

## Preventive Measures
- Default "locked down" mode when `ORBITAL_MODE` is unset (treat as real prod).
- Add an operator-visible banner in demo-prod ("fixture-only demo") and log the runtime mode at startup.
- Add a smoke script/verification checklist for demo-prod (auth, viewer, exports, artefact download).
