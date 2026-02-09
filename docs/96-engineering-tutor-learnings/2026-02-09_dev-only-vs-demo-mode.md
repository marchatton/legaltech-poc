# Dev-Only Vs Demo Mode (Orbital PoC)

Date: 2026-02-09

## Key Distinctions
- **Dev-only** means the route/feature hard-disables unless `NODE_ENV === "development"`.
  - UI pages typically call `assertDevOnly()` which invokes Next.js `notFound()` in non-dev.
  - API routes typically call `assertDevOnlyApi(...)` which returns a safe `404`.
- **Demo mode** is an additional dev-only flag: it only turns on when:
  - `NODE_ENV === "development"` AND `DEMO_MODE === "1"`.
  - This is intentionally defensive so someone cannot enable demo tooling in production by mistake.

## Why Buttons "Break" In Demo
- Some buttons rely on **signed URLs** (PDF render links, artefact downloads).
- Signed URL generation requires `OBJECT_STORE_SIGNING_SECRET`.
  - In dev you can opt into an ephemeral per-process secret with `ALLOW_DEV_OBJECT_STORE_SECRET=1`.
  - Without either, the server throws `OBJECT_STORE_SIGNING_SECRET_MISSING`.

## Relevant Files
- `apps/web/lib/devOnly.ts`
- `apps/web/lib/devOnlyApi.server.ts`
- `apps/web/lib/demoMode.server.ts`
- `apps/web/lib/objectStore.server.ts`

## Productionization Implications (High Level)
- Decide whether to keep these routes internal-only (auth/feature flags) or genuinely ship them.
- Replace dev-only assumptions (local filesystem fixture packs, in-memory queues, local object store) with production equivalents:
  - durable queue + separate worker
  - real object store (S3/GCS) + real secrets management
  - staging/prod deploy config + auth

