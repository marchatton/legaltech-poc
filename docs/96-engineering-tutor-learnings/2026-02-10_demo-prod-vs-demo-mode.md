# Demo-Prod vs Demo Mode (Simple Mental Model)

Date: 2026-02-10

## Intuition
Think of Orbital PoC as having **two separate questions**:

1) **Are we running a dev build or a production build?** (`NODE_ENV`)  
2) **If it is a production build, what posture should it run in?** (runtime mode)

Today, many features are intentionally **dev-only**, so a production build feels "empty" or "broken" unless we introduce an explicit demo-prod posture.

## Definitions (in repo terms)
- **Dev-only**: gated by `assertDevOnly()` / `assertDevOnlyApi(...)`. Anything behind these will 404 unless `NODE_ENV=development`.
- **Demo mode**: `DEMO_MODE=1`, but still **dev-only** by design (`apps/web/lib/demoMode.server.ts`). Used to show operator tooling like the demo pack loader toolbar.
- **Demo-prod (planned)**: `NODE_ENV=production` with `ORBITAL_MODE=demo-prod`. A production build that is still private (Basic Auth) and only enables an allowlisted set of routes/pages needed for demos.

## Metaphor
- `NODE_ENV` is the **engine type**:
  - dev engine: noisy, permissive, shortcuts enabled
  - prod engine: strict, no shortcuts
- `ORBITAL_MODE` is the **key you turn** in a prod engine:
  - `demo-prod`: unlock a small, safe subset for demos
  - unset/`prod`: keep doors locked by default

## Why “full app load” doesn’t work yet
If you run a production build (`next start`) today, a lot of the UI/API is gated by dev-only checks. Also, background jobs require a separate worker process and signed URL flows require `OBJECT_STORE_SIGNING_SECRET` to be set (no dev fallback).

## One practical gotcha we hit in dev
Signed URLs for PDFs/artefacts require a stable signing secret. In dev we allow a fallback secret, but Next.js dev can run code in multiple isolates; a per-isolate secret can break verification. Persisting the dev signing secret to disk (under `tmp/object-store/`) makes it stable across isolates.

