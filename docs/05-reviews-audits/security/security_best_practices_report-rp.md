# Security Audit Report: legaltech-poc

Date: 2026-02-10

Implementation plan (Critical/High/Medium): `docs/04-projects/04-refactors/0006_security-audit-remediation/prd.md`

## Summary
This audit found multiple high-impact security footguns in the demo-prod posture, plus one **critical** container-build issue that can bake local env secrets into Docker images. The most urgent fixes are: harden Docker ignore rules for `.env*`, lock spikes endpoints to dev-only, add CSRF-style origin protections for demo-prod mutations, remove/contain loopback SSRF in the viewer, and stop exposing Postgres publicly in demo-prod compose.

## Scope + Constraints
- Static review of repo code/config under `apps/web`, `packages/core`, Docker/Compose, and edge middleware.
- Demo-prod posture is primarily enforced by `apps/web/middleware.ts` (Basic Auth + allowlist).
- Dependency CVE scan: `pnpm audit` failed due to restricted network (`ENOTFOUND registry.npmjs.org`).

## Findings

### Critical

#### 1) Docker build can bake `.env.local` secrets into images
Impact: A developer/operator’s local secrets (for example `apps/web/.env.local`) can be copied into Docker image layers and later exfiltrated if the image is shared, pushed to a registry, or compromised.

Evidence:
- `.dockerignore:1-11` does not exclude `.env` / `.env.*`
- `apps/web/Dockerfile:18-21` copies the entire `apps/web` directory (`COPY apps/web apps/web`)
- `apps/web/.env.local` exists in the repo working tree (commonly contains secrets) and will be included unless ignored

Why it’s risky:
- Docker does not respect `.gitignore`. Missing patterns in `.dockerignore` means local env files can enter the build context and be copied into image layers.

Recommendation:
- Add a repo-wide `.dockerignore` rule to exclude env files while allowing templates/examples:
  - `**/.env`
  - `**/.env.*`
  - `!**/.env.example`
  - `!**/.env.template`
- Optional: tighten Dockerfile `COPY` patterns to only include needed subpaths (defense-in-depth).

#### 2) “Spikes” endpoints are enabled by a single env flag (prod footgun)
Impact: If `SPIKES_ENABLED=1` is ever set in a non-dev environment, debug endpoints become reachable (including filesystem reads and export writes).

Evidence:
- `apps/web/lib/spikes.server.ts:3-6` only checks `process.env.SPIKES_ENABLED === "1"` and does not require dev mode.

Recommendation:
- Make spikes dev-only by requiring `process.env.NODE_ENV === "development"` (or `orbitalMode() === "dev"`) in `assertSpikesEnabled()`, in addition to `SPIKES_ENABLED`.
- For any spikes endpoint that reads from disk or writes artefacts, also require an explicit admin token.

---

### High

#### 3) Demo-prod mutations have no Origin/CSRF protections (Basic Auth is not sufficient)
Impact: A malicious website can potentially trigger authenticated, state-changing requests (DoS-by-side-effect) against demo-prod endpoints in a victim’s browser if Basic Auth credentials are cached.

Evidence (demo-prod allowlist includes POST endpoints and middleware only checks Basic Auth):
- `apps/web/middleware.ts:18-47` allowlists `POST /demo/load-pack`, `POST /folders/:id/runs`, `POST /export/csv`, `POST /export/docx`
- `apps/web/middleware.ts:49-68` enforces Basic Auth but performs no `Origin` / `Referer` / `Sec-Fetch-Site` checks

Evidence (route handlers parse JSON without enforcing `Content-Type: application/json`, enabling cross-site `fetch(..., { mode: "no-cors" })` with `text/plain` JSON bodies):
- `apps/web/app/(api)/demo/load-pack/route.ts:73-83` uses `await req.json()`
- `apps/web/app/(api)/folders/[id]/runs/route.ts:95-105` uses `await req.json()`
- `apps/web/app/(api)/export/csv/route.ts:128-138` uses `await req.json()`
- `apps/web/app/(api)/export/docx/route.ts:145-155` uses `await req.json()`

Recommendation:
- In demo-prod, block cross-site mutations in `apps/web/middleware.ts`:
  - For non-GET/HEAD, require `Origin` to match `req.nextUrl.origin` (or fall back to strict `Referer`/`Sec-Fetch-Site` policy).
- Additionally (or alternatively), require `Content-Type: application/json` for JSON mutation endpoints and reject other content-types.
- Consider adding coarse rate limiting for the POST endpoints (edge/WAF preferred) to reduce abuse.

#### 4) Loopback SSRF/port-scanning via Host-derived port in viewer server component
Impact: An authenticated user can influence internal loopback `fetch()` port selection and potentially use it to scan services on `127.0.0.1` within the runtime environment; the code also forwards `Authorization` to that loopback origin.

Evidence:
- `apps/web/app/(app)/matters/viewer/page.tsx:51-64` derives a loopback origin using a port parsed from the request `Host` header.
- `apps/web/app/(app)/matters/viewer/page.tsx:114-123` forwards `authorization` header into `fetch(...)` calls.
- `apps/web/app/(app)/matters/viewer/page.tsx:210-215` repeats the same pattern for render URL fetch.

Recommendation:
- Preferred: remove internal HTTP calls entirely by extracting shared server-only functions (route handlers become thin wrappers).
- If internal HTTP must remain:
  - Do not derive ports from request headers in demo-prod.
  - Do not forward `Authorization` to anything except the real app origin.

#### 5) demo-prod Compose exposes Postgres on `0.0.0.0:5432` with default credentials
Impact: Running demo-prod on a host with a public interface can expose the database to the internet/LAN, enabling direct data compromise.

Evidence:
- `docker-compose.demo-prod.yml:2-10` publishes `ports: ["5432:5432"]` and sets `POSTGRES_PASSWORD: orbital`.

Recommendation:
- Remove host port publishing for the DB in demo-prod (keep it on the Docker network).
- If local access is required, bind to loopback only (e.g., `127.0.0.1:5432:5432`) and rotate credentials.

#### 6) Missing baseline security headers; CSP currently complicated by an inline script
Impact: Lack of headers increases clickjacking/XSS blast radius and allows content sniffing; CSP is currently absent and harder to add because of an inline `<script>`.

Evidence:
- `apps/web/next.config.js:4-10` does not define `headers()`.
- `apps/web/app/layout.tsx:21-23` injects an inline script via `dangerouslySetInnerHTML`.

Recommendation:
- Set baseline headers at the edge or in-app (centralized):
  - `X-Content-Type-Options: nosniff`
  - Clickjacking defense: CSP `frame-ancestors 'none'` (and/or `X-Frame-Options: DENY`)
  - `Referrer-Policy`, `Permissions-Policy` (minimal)
- If adding CSP, prefer a nonce strategy; alternatively refactor the theme init to avoid inline script.

---

### Medium

#### 7) Spikes CSV export lacks formula-injection protection
Impact: Opening exported CSVs in Excel/Sheets can execute attacker-controlled formulas (exfiltration via `HYPERLINK`, etc.).

Evidence:
- `apps/web/app/(api)/spikes/export/csv/route.ts:56-61` escapes CSV but does not prefix formula sentinels.
- `apps/web/lib/exportCsv.server.ts:59-67` correctly prefixes formula sentinels with `'`.

Recommendation:
- Reuse the hardened `csvEscape` logic from `apps/web/lib/exportCsv.server.ts` (or centralize it and reuse in spikes).

#### 8) In-process pdf.js parsing lacks a wall-clock timeout / isolation
Impact: Crafted PDFs can cause CPU/memory pressure and stall a worker process (DoS).

Evidence:
- `apps/web/lib/ingest/ingestProcessor.server.ts:28-31` has caps (good) but no wall-clock timeout or sandboxing.

Recommendation:
- Add a document-level timeout (AbortSignal or job-level watchdog) and mark documents failed on timeout.
- Longer-term: isolate PDF parsing into a separate process/container with explicit CPU/memory limits.

#### 9) Containers run as root (no `USER` in Dockerfile)
Impact: Any RCE in the app increases blast radius inside the container/filesystem.

Evidence:
- `apps/web/Dockerfile:1-51` never sets a non-root `USER`.

Recommendation:
- Create/use a non-root user in the runtime stage and run the app as that user; ensure volume permissions still work.

#### 10) Absolute URL generation uses `new URL(req.url).origin` (Host-header dependent)
Impact: If these URLs are ever surfaced outside the immediate requesting client (logs, notifications), Host header poisoning can create misleading URLs.

Evidence:
- `apps/web/app/(api)/documents/[id]/render/route.ts:90` and `:167`
- `apps/web/app/(api)/export/csv/route.ts:446`
- `apps/web/app/(api)/export/docx/route.ts:410`
- `apps/web/app/(api)/folders/[id]/artefacts/route.ts:72`

Recommendation:
- Prefer returning relative paths instead of absolute URLs, or derive origin from a trusted config (`PUBLIC_ORIGIN` allowlist).

## Investigation Log (high-level)
- 2026-02-10: Verified demo-prod gate behavior in `apps/web/middleware.ts` and enumerated allowed routes.
- 2026-02-10: Reviewed Docker/Compose for secret-handling and network exposure.
- 2026-02-10: Traced internal fetch flows in `apps/web/app/(app)/matters/viewer/page.tsx` for SSRF characteristics.
- 2026-02-10: Reviewed object store signing/verification + storage key allowlists.

## Recommended Remediation Order
1. Fix `.dockerignore` to exclude `.env*` (highest leverage, low risk).
2. Lock `assertSpikesEnabled()` to dev-only (plus optional admin token).
3. Add demo-prod mutation protections (Origin checks + strict JSON content-type).
4. Remove/contain viewer loopback SSRF (stop Host-derived ports; remove internal HTTP where possible).
5. Fix demo-prod Compose DB exposure.
6. Add baseline security headers (and plan CSP nonce approach).
