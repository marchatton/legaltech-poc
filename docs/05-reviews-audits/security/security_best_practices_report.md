# Security Best Practices Report (Orbital PoC)

Date: 2026-02-10

Implementation plan (Critical/High/Medium): `docs/04-projects/04-refactors/0006_security-audit-remediation/prd.md`

## Executive Summary

This is a static, repo-grounded audit (code + config review). I did not run runtime probes.

Overall, the app has a relatively strong “fail-closed” posture for anything production-like, especially around signed URL downloads and dev-only/demo-prod gating. The highest practical risks are all “deployment footguns” and “defense-in-depth gaps” that become real in demos or in any future production hardening:

1. **CRITICAL:** Docker builds can bake local `.env*` secrets into images because `.dockerignore` does not exclude `.env*` and the Dockerfile copies full directories. (`.dockerignore:1-11`, `apps/web/Dockerfile:10-22`)
2. **CRITICAL:** “Spikes” API routes are guarded only by `SPIKES_ENABLED=1`, not by `NODE_ENV`/`ORBITAL_MODE`/auth, so a single env mis-set can expose powerful debug endpoints. (`apps/web/lib/spikes.server.ts:3-6`)
3. **HIGH:** demo-prod uses Basic Auth but does not enforce same-origin semantics for state-changing requests (CSRF-by-side-effects risk). (`apps/web/middleware.ts:18-69`)

Notes:
- I did not run `pnpm audit` against the registry in this pass, so dependency CVEs were not validated via live advisories.
- Attempted `pnpm audit --prod`, but this environment cannot reach the npm registry (`ENOTFOUND registry.npmjs.org`), so automated advisory lookup is unavailable here.

## Scope

- Next.js app (App Router): `apps/web/`
- Shared TS package: `packages/core/`
- Deployment/config: `.dockerignore`, `.gitignore`, `docker-compose*.yml`, `apps/web/Dockerfile`, `apps/web/next.config.js`, `apps/web/middleware.ts`

## Investigation Log

### 2026-02-10 Phase 0: Workspace Verification
- Confirmed repo root is loaded and audited: `/Users/marc/Code/personal-projects/orbital-poc`.

### 2026-02-10 Phase 2: Systematic Exploration (Context Builder)
- Mapped trust boundaries and entrypoints focusing on Next.js route handlers under `apps/web/app/(api)` plus persistence (`apps/web/lib/db.server.ts`) and the file-backed object store (`apps/web/lib/objectStore.server.ts`).

### 2026-02-10 Phase 4: Evidence Gathering
- Grepped for authn/authz gates, env flags, server-side `fetch`, inline scripts, CSV writers, PDF parsing, and secret-like tokens.
- Anchored each finding to `file:line` references using `nl -ba` output.

## Threat Model (Lightweight)

Assumptions that materially affect severity:
- demo-prod can receive hostile traffic (not just a trusted audience).
- `Host` headers are not always perfectly controlled (depends on ingress/proxy).
- Local `.env` / `apps/web/.env.local` exist on developer machines and possibly in CI/build contexts.

Questions (answering these changes prioritization):
1. Is `demo-prod` intended to withstand hostile internet traffic, or is it “trusted audience only”?
2. Should “spikes” ever be available outside local dev?
3. Will this app ever be multi-tenant or hold sensitive customer docs/PII, or is it strictly PoC demo data?

## Strengths Observed

- Input validation at many boundaries via Zod `safeParse` (returns 4xx on schema mismatch).
- Strong environment gating posture in multiple places (dev-only / demo-prod-only).
- Signed URL flows for PDF bytes and artefact downloads, with HMAC signing and expiry (object store implementation).
- Next.js resolves to a recent patch release (`next@15.5.12` in `pnpm-lock.yaml`), which meets the minimum patched versions called out in the Next.js security spec bundled with this repo.
- Path traversal defenses using `path.resolve(...)` + `startsWith(base + path.sep)` in file-serving code:
  - Example: `apps/web/app/(api)/spikes/local-pdf/route.ts:33-40`

## Findings

### Critical

#### SEC-001: Docker Builds Can Bake Local `.env*` Secrets Into Images

Severity: Critical

Evidence:
- `.dockerignore` does not exclude `.env*` files: `.dockerignore:1-11`
- Docker build stage copies full directories, including `apps/web` (which commonly contains `.env.local`): `apps/web/Dockerfile:10-22`
- `.env` and `apps/web/.env.local` exist locally in this workspace (both are gitignored by `.gitignore:13-17`, but Docker does not consult `.gitignore`).

Impact (one sentence):
- Secrets present in local env files can be embedded into built images and later exfiltrated via image/registry/build artifacts.

Recommended fix:
- Update `.dockerignore` to exclude `.env` and `.env.*` (at all levels) while allowing `*.example` templates.
- Optionally tighten Dockerfile `COPY` patterns to avoid copying files that are never needed for a build.

Preventive measures:
- Add a CI check to fail Docker builds if any `.env*` files (other than `*.example`/templates) are present in build context.

---

#### SEC-002: “Spikes” Endpoints Are Guarded Only by `SPIKES_ENABLED=1` (High-Impact Footgun)

Severity: Critical

Evidence:
- The only gate is `SPIKES_ENABLED === "1"`: `apps/web/lib/spikes.server.ts:3-6`
- Spikes endpoints include powerful operations (examples):
  - local fixture PDF read + Range support: `apps/web/app/(api)/spikes/local-pdf/route.ts:14-85`
  - spikes export writes artefacts and uses admin token logic but is still reachable if spikes are enabled: `apps/web/app/(api)/spikes/export/csv/route.ts:43-75`

Impact (one sentence):
- A single env misconfiguration can expose debug/admin surfaces to the internet in non-demo-prod modes (middleware auth does not apply unless `ORBITAL_MODE=demo-prod`).

Recommended fix:
- Make spikes **dev-only** (recommended): require `NODE_ENV === "development"` and/or `ORBITAL_MODE === "dev"` in `assertSpikesEnabled`.
- Defense-in-depth: also require an admin token header for any spikes endpoints that persist data or export data.

---

### High

#### SEC-003: Loopback SSRF to Arbitrary Local Ports via `Host`-Derived Port in Server-Side `fetch`

Severity: High

Evidence:
- `originFromRequestHeaders()` derives a port from the incoming `Host` header and constructs an internal loopback URL: `apps/web/app/(app)/matters/viewer/page.tsx:51-64`
- That origin is used for server-side fetches: `apps/web/app/(app)/matters/viewer/page.tsx:114-123`
- The page is gated to dev or demo-prod: `apps/web/app/(app)/matters/viewer/page.tsx:83-84` (reduces exposure, but still relevant for deployed demo-prod)

Impact:
- If a reverse proxy/ingress allows attacker-controlled `Host` values, an attacker can induce server-side requests to other localhost services within the same container/VM (port-scanning and targeted SSRF).

Recommended fix:
- Best: avoid internal HTTP entirely by calling the underlying server helpers directly (no `fetch`).
- If HTTP must remain: use a configured canonical internal origin (env) and do not derive ports from request headers.

---

#### SEC-004: Demo-Prod CSRF-By-Side-Effects Risk (Basic Auth Without Same-Origin Enforcement)

Severity: High

Evidence:
- demo-prod is protected via Basic Auth in middleware: `apps/web/middleware.ts:49-63`
- demo-prod explicitly allowlists POST endpoints (state-changing): `apps/web/middleware.ts:18-46` (e.g., `/demo/load-pack`, `/folders/:id/runs`, `/export/*`)
- No same-origin / fetch-context enforcement is performed (no checks for `Origin` / `Sec-Fetch-Site`): `apps/web/middleware.ts:18-69`

Impact:
- A malicious site can trigger cross-site POSTs that cause side effects (load packs, start runs, generate exports) if the browser reuses cached Basic Auth credentials for the target origin.

Recommended fix:
- In `apps/web/middleware.ts`, for non-GET requests enforce:
  - `Origin` matches expected origin, and/or
  - `Sec-Fetch-Site` is `same-origin` or `same-site` (fallback to `Referer` when needed).
- Consider basic rate limiting for repeated failures/side-effects in demo-prod (edge/WAF preferred).

---

#### SEC-005: Missing App-Owned Security Headers/CSP (Defense-in-Depth Gap)

Severity: High

Evidence:
- No `headers()` configuration is present: `apps/web/next.config.js:4-10`
- There is an inline script injection point (static today, but relevant for CSP hardening): `apps/web/app/layout.tsx:22`

Impact:
- If any XSS is introduced later, lack of CSP and baseline headers increases blast radius; clickjacking/mime sniffing protections may also be absent unless set at the edge.

Recommended fix:
- Set baseline headers (either in Next `headers()` or at edge):
  - `Content-Security-Policy` (consider report-only first)
  - `X-Content-Type-Options: nosniff`
  - `Referrer-Policy`
  - `Permissions-Policy`
  - Clickjacking protection via CSP `frame-ancestors` (and optionally `X-Frame-Options`)

---

### Medium

#### SEC-006: PDF Parsing DoS Risk (In-Process pdf.js Without Wall-Clock Timeout/Isolation)

Severity: Medium

Evidence:
- Server-side parsing of untrusted PDFs with pdf.js: `apps/web/lib/ingest/ingestProcessor.server.ts:142-220`
- Caps exist (good) but there is no explicit timeout or process isolation:
  - `MAX_PAGES`: `apps/web/lib/ingest/ingestProcessor.server.ts:173-180`
  - Iterative extraction per page: `apps/web/lib/ingest/ingestProcessor.server.ts:202-220`

Impact:
- Malicious or worst-case PDFs can consume CPU/memory and degrade availability of the worker (and dev inline worker paths).

Recommended fix:
- Best: isolate parsing into a separate process/service with strict limits.
- Stopgap: add a hard wall-clock timeout per document ingest and fail closed with a safe error.

---

#### SEC-007: CSV Injection Mitigation Is Inconsistent (Safe in Main Export, Unsafe in Spikes Export)

Severity: Medium

Evidence:
- Main CSV escape mitigates formula injection: `apps/web/lib/exportCsv.server.ts:59-67`
- Spikes CSV escape does not: `apps/web/app/(api)/spikes/export/csv/route.ts:56-61`

Impact:
- Exported CSVs can contain formula payloads that execute when opened in spreadsheet software.

Recommended fix:
- Reuse the hardened CSV escape helper everywhere; do not reimplement CSV writers ad-hoc.

---

#### SEC-008: Demo-Prod Postgres Exposed on Host Port 5432 With Weak Default Credentials

Severity: Medium

Evidence:
- Default credentials and host port exposure: `docker-compose.demo-prod.yml:6-10`

Impact:
- If demo-prod runs on a host/network where port 5432 is reachable, the DB is trivially accessible.

Recommended fix:
- Remove the `ports:` mapping for Postgres in demo-prod (keep it internal), or bind to loopback only.
- Use stronger demo credentials (and rotate).

---

### Low

#### SEC-009: Basic Auth Comparison Leaks Length and There Is No Brute-Force Throttling (PoC-OK, Risk If Reused)

Severity: Low

Evidence:
- `safeEq` returns early on length mismatch: `apps/web/lib/basicAuth.ts:1-7`
- No rate limiting is present in middleware for repeated failures: `apps/web/middleware.ts:49-63`

Impact:
- Minor: timing signal is limited and mostly theoretical here; brute-force without throttling is the practical concern if demo-prod is exposed.

Recommended fix:
- Add ingress-level throttling / WAF rules for demo-prod.
- If keeping app-level compare: use constant-time compare that does not early-return on length mismatch (and keep edge-runtime compatibility).

## Remediation Roadmap (Prioritized)

1. Fix SEC-001 (Docker env leakage): update `.dockerignore` immediately and consider tightening Dockerfile `COPY`.
2. Fix SEC-002 (spikes exposure footgun): make spikes dev-only or require admin token (and ideally both).
3. Fix SEC-004 (demo-prod CSRF-by-side-effects): enforce same-origin/fetch-context for non-GET in `apps/web/middleware.ts`.
4. Fix SEC-003 (loopback SSRF): remove Host-derived port selection for server-side fetches (or remove internal HTTP entirely).
5. Add baseline security headers/CSP ownership (SEC-005), starting report-only if needed.
6. Decide if PDF parsing needs isolation/timeouts before accepting real untrusted uploads (SEC-006).
7. Unify CSV escaping (SEC-007).
8. Harden demo-prod compose DB exposure/creds (SEC-008).
