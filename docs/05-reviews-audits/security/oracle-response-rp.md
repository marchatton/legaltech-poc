# Orbital PoC Security Audit (static, repo-grounded)

Date: 2026-02-10

Implementation plan (Critical/High/Medium): `docs/04-projects/04-refactors/0006_security-audit-remediation/prd.md`

## Scope and method

Static code + config review of:

* Next.js 15 App Router app: `apps/web/`
* Shared package: `packages/core/`
* Deployment/config surfaces: `.dockerignore`, `apps/web/Dockerfile`, `docker-compose*.yml`, `apps/web/next.config.js`, `apps/web/middleware.ts`

Constraints honoured:

* Static review only (no runtime probing, no registry `pnpm audit` run)
* No assumptions about WAF/edge headers/rate limiting
* Avoided recommending HSTS (no controlled-prod domain story visible in repo)

## Executive summary

Overall posture is pretty good for a PoC: lots of Zod validation at boundaries, explicit “dev-only / demo-prod-only” gating patterns, and a signed + expiry-based object-store access model.

The main risks are “operator footguns” and “defence-in-depth gaps” that become real the moment demo-prod is reachable by hostile traffic or env flags are mis-set:

* **CRITICAL:** Docker build context can accidentally include local `.env*` secrets because `.dockerignore` does not exclude them and the Dockerfile copies whole directories.
* **CRITICAL:** “Spikes” endpoints are gated by a single env flag (`SPIKES_ENABLED=1`) which is too easy to misconfigure, exposing debug/admin-like behaviour.
* **HIGH:** demo-prod relies on Basic Auth but does not enforce same-origin semantics for state-changing requests, so you risk CSRF-by-side-effects if the browser reuses cached Basic Auth creds.
* **HIGH:** Host-derived port selection enables loopback SSRF to arbitrary local ports in demo-prod/dev contexts.
* **MEDIUM:** Postgres is published on host port 5432 with weak default credentials in compose files, which is fine locally but dangerous when copied to any remote/VM.

## Strengths observed

* **Fail-closed intent** around demo-prod gating and signed object-store reads/writes (HMAC + expiry).
* **Good boundary validation** patterns: Zod schemas are used widely for params/body.
* **Path traversal defence** is explicitly called out in file-serving code (example referenced in prior report: `path.resolve(...)` + base-dir boundary checks in spikes local PDF handler).

---

## Findings

### Critical

#### SEC-001: Docker builds can bake local `.env*` secrets into images

**Impact (1 sentence):** Secrets present in local env files can be embedded in built images and later exfiltrated from registries, CI artefacts, or image inspection.

**Evidence (repo-grounded):**

* `.dockerignore` does not exclude `.env`/`.env.*` (only ignores git, node_modules, .next, tmp, throwaway): `.dockerignore:1-10`
* Repo expects `.env*` files to exist locally and treats them as secret (ignored by git, but that does not affect Docker build context): `.gitignore:13-17`
* Dockerfile copies whole directories into the build stage, which will include `apps/web/.env.local` (and any other `.env*` under copied directories) unless Docker ignore blocks them:

  * `COPY apps/web apps/web` (`apps/web/Dockerfile:18`)
  * `COPY packages/core packages/core` (`apps/web/Dockerfile:19`)
  * `COPY scripts scripts` (`apps/web/Dockerfile:21`)

**Exploit scenario notes:**

* A developer builds locally with `apps/web/.env.local` present. The image layer now contains secrets.
* That image is pushed to a registry (even private). Anyone with read access to the image (or a compromised CI runner) can extract the file content from layers.

**Actionable remediation (minimal, low-regression):**

* Add `.env` and `.env.*` ignores to `.dockerignore`, while allowing template files (`.env.example`, `.env.template`).
* Add a CI check that fails if any `.env*` (excluding templates) exists in build context.

---

#### SEC-002: Spikes endpoints are guarded only by `SPIKES_ENABLED=1` (high-impact footgun)

**Impact (1 sentence):** A single env misconfiguration can expose debug/admin surfaces to the internet outside intended local dev contexts.

**Evidence (repo-grounded, from prior audit references):**

* Gate checks only `SPIKES_ENABLED === "1"`: `apps/web/lib/spikes.server.ts:3-6`
* Spikes endpoints include powerful behaviours:

  * Local fixture PDF read with Range support: `apps/web/app/(api)/spikes/local-pdf/route.ts:14-85`
  * Spikes export writes artefacts and includes admin token logic: `apps/web/app/(api)/spikes/export/csv/route.ts:43-75`

**Exploit scenario notes:**

* Deployer accidentally sets `SPIKES_ENABLED=1` on a public demo/prod VM.
* Attacker discovers `/api/spikes/*` endpoints and uses them for data exfiltration, filesystem probing via fixture access, or unauthorised export generation.

**Actionable remediation (minimal, low-regression):**

* Make spikes **dev-only** at the guard level (recommended):

  * Require `ORBITAL_MODE === "dev"` and/or `NODE_ENV === "development"` inside `assertSpikesEnabled()`.
* Defence-in-depth:

  * Require an admin token header on spikes endpoints that read local files or write artefacts (even in dev).

---

### High

#### SEC-003: Loopback SSRF to arbitrary local ports via Host-derived port in server-side `fetch`

**Impact (1 sentence):** An attacker who can influence `Host` headers can induce the server to make requests to arbitrary localhost ports, enabling port scanning and targeted SSRF against co-resident services.

**Evidence (repo-grounded, from prior audit references):**

* `originFromRequestHeaders()` derives a port from the incoming `Host` header and constructs `http://127.0.0.1:${port}`: `apps/web/app/(app)/matters/viewer/page.tsx:51-64`
* That origin is used for server-side fetches: `apps/web/app/(app)/matters/viewer/page.tsx:114-123`
* Page is gated to dev or demo-prod (reduces exposure, does not eliminate it in demo-prod): `apps/web/app/(app)/matters/viewer/page.tsx:83-84`

**Exploit scenario notes:**

* On a demo-prod VM behind a permissive reverse proxy, attacker sends requests with crafted `Host` such as `demo.example.com:2375`.
* Server then fetches `127.0.0.1:2375` (Docker API example) or other internal services.

**Actionable remediation (minimal, low-regression):**

* Best: remove internal HTTP calls entirely and call server helpers directly (no loopback fetch).
* If HTTP must remain:

  * Use a configured canonical internal origin (eg `APP_ORIGIN`) and do not derive host/port from request headers.
  * Hard-fail if origin is missing or does not match an allowlist.

---

#### SEC-004: Demo-prod CSRF-by-side-effects risk (Basic Auth without same-origin enforcement)

**Impact (1 sentence):** A malicious site can trigger cross-site POSTs that cause side effects if the browser reuses cached Basic Auth credentials for the demo-prod origin.

**Evidence (repo-grounded, from prior audit references):**

* demo-prod is protected via Basic Auth in middleware: `apps/web/middleware.ts:49-63`
* demo-prod explicitly allowlists state-changing endpoints in middleware allowlist logic: `apps/web/middleware.ts:18-46`
* No origin / fetch-context enforcement is performed (`Origin`, `Sec-Fetch-Site`, `Referer` checks not present): `apps/web/middleware.ts:18-69`

**Exploit scenario notes:**

* Victim visits demo-prod in a browser, authenticates via Basic Auth.
* Victim later visits attacker site, which submits a hidden form to `https://demo-prod/.../export` or `.../runs` endpoints.
* Browser may send the cached `Authorization` header, causing an unwanted export/run/start side effect.

**Actionable remediation (minimal, low-regression):**

* In `apps/web/middleware.ts`, for any non-GET request:

  * Require `Origin` to match expected origin (strict match), or
  * Require `Sec-Fetch-Site` to be `same-origin` (fallback to `Referer` when `Origin` absent).
* Consider a simple per-request anti-CSRF header requirement (eg `X-Orbital-Csrf: 1`) for your own UI fetches, enforced server-side.

---

#### SEC-005: Missing app-owned baseline security headers/CSP (defence-in-depth gap)

**Impact (1 sentence):** If XSS or UI redress is introduced later, lack of baseline headers increases blast radius and leaves clickjacking/mime sniffing protections dependent on infrastructure you are not assuming.

**Evidence (repo-grounded, from prior audit references):**

* No global Next.js `headers()` configuration visible: `apps/web/next.config.js:4-10`
* There is at least one inline script injection point relevant for CSP planning (theme init): `apps/web/app/layout.tsx:22`

**Exploit scenario notes:**

* Any future `dangerouslySetInnerHTML` or markdown rendering bug becomes materially worse without a CSP.
* Clickjacking becomes trivial if the app is embeddable by default.

**Actionable remediation (minimal, low-regression):**

* Add baseline headers either in `next.config.js` `headers()` or in middleware:

  * `X-Content-Type-Options: nosniff`
  * `Referrer-Policy: no-referrer` (or `strict-origin-when-cross-origin`)
  * `Permissions-Policy` with a conservative allowlist
  * Clickjacking protection via CSP `frame-ancestors 'none'`
* For CSP:

  * Start with a minimal policy that avoids breaking inline scripts, or roll out as `Content-Security-Policy-Report-Only` first.

---

### Medium

#### SEC-006: PDF parsing DoS risk (in-process pdf.js without wall-clock timeout/isolation)

**Impact (1 sentence):** Malicious or worst-case PDFs can burn CPU/memory and degrade availability of the worker (and any inline worker execution paths).

**Evidence (repo-grounded, from prior audit references):**

* Server-side parsing of untrusted PDFs with `pdfjs-dist`: `apps/web/lib/ingest/ingestProcessor.server.ts:142-220`
* Caps exist (`MAX_PAGES`, `MAX_TEXT_CHARS_PER_PAGE`, `MAX_TOTAL_TEXT_CHARS`) but no explicit timeout/process isolation: `apps/web/lib/ingest/ingestProcessor.server.ts:173-220`

**Exploit scenario notes:**

* Attacker uploads a PDF crafted for pathological parsing behaviour.
* Worker thread pegs CPU, job queue stalls, the system appears down.

**Actionable remediation (minimal, low-regression):**

* Add a hard wall-clock timeout per ingest and fail closed with a safe error.
* Longer-term: isolate PDF parsing into a separate process/service with strict resource limits.

---

#### SEC-007: CSV injection mitigation is inconsistent (safe in main export, unsafe in spikes export)

**Impact (1 sentence):** Exported CSVs can contain formula payloads that execute when opened in spreadsheet software.

**Evidence (repo-grounded, from prior audit references):**

* Main export CSV escape mitigates formula injection: `apps/web/lib/exportCsv.server.ts:59-67`
* Spikes CSV escape does not: `apps/web/app/(api)/spikes/export/csv/route.ts:56-61`

**Exploit scenario notes:**

* A row value begins with `=`, `+`, `-`, or `@`.
* When opened in Excel/Sheets, the value is evaluated as a formula, enabling data exfiltration or deceptive UI.

**Actionable remediation (minimal, low-regression):**

* Reuse the hardened CSV escape helper everywhere (do not reimplement writers ad-hoc).
* Add a small unit test for spikes export covering formula-prefix inputs.

---

#### SEC-008: Postgres exposed on host port 5432 with weak default credentials in compose files

**Impact (1 sentence):** If these compose files are used on a reachable host/VM, the database is trivially discoverable and accessible.

**Evidence (repo-grounded):**

* demo-prod DB publishes to host and uses default creds:

  * `POSTGRES_USER: orbital`, `POSTGRES_PASSWORD: orbital`: `docker-compose.demo-prod.yml:6-8`
  * `ports: - "5432:5432"`: `docker-compose.demo-prod.yml:9-10`
* local dev compose does the same (common copy/paste footgun):

  * `POSTGRES_USER: orbital`, `POSTGRES_PASSWORD: orbital`: `docker-compose.yml:7-10`
  * `ports: - "5432:5432"`: `docker-compose.yml:10-11`

**Exploit scenario notes:**

* Demo is deployed on a Hetzner VM and security group allows inbound 5432 (or host firewall mis-set).
* Attacker connects directly, dumps/modifies data.

**Actionable remediation (minimal, low-regression):**

* Remove DB `ports:` mapping from demo-prod compose (keep it internal to the compose network).
* If you truly need host access, bind to loopback only (`127.0.0.1:5432:5432`) and use strong creds.

---

#### SEC-009: Basic Auth comparison leaks length and there is no brute-force throttling

**Impact (1 sentence):** Without throttling, Basic Auth is brute-forceable if exposed, and the early-return compare leaks a small timing signal.

**Evidence (repo-grounded, from prior audit references):**

* Early return on length mismatch: `apps/web/lib/basicAuth.ts:1-7`
* No rate limiting in middleware for repeated failures: `apps/web/middleware.ts:49-63`

**Exploit scenario notes:**

* Automated attacks spray credentials. Without rate limiting, the only barrier is password strength.
* Timing signal is small but unnecessary.

**Actionable remediation (minimal, low-regression):**

* Prefer ingress/WAF rate limiting for demo-prod.
* If keeping app-level compare, avoid early-return on length mismatch (pad/normalise then constant-time compare) in a way compatible with middleware runtime.

---

#### SEC-010: demo-prod compose does not enforce required secrets at deploy time (misconfiguration risk)

**Impact (1 sentence):** It’s easy to accidentally deploy demo-prod with empty/missing critical env vars, weakening protections or causing confusing “half-secured” behaviour.

**Evidence (repo-grounded):**

* demo-prod compose injects required values via `${VAR}` without enforcing presence:

  * `OBJECT_STORE_SIGNING_SECRET: ${OBJECT_STORE_SIGNING_SECRET}`: `docker-compose.demo-prod.yml:37`
  * `BASIC_AUTH_USER: ${BASIC_AUTH_USER}` / `BASIC_AUTH_PASS: ${BASIC_AUTH_PASS}`: `docker-compose.demo-prod.yml:40-41`

**Exploit scenario notes:**

* Operator forgets to export `BASIC_AUTH_PASS`. Compose sets it to empty.
* Depending on app logic, this can either fail closed (best) or degrade into weak/no auth (worst). Even failing closed is still an availability footgun for demos.

**Actionable remediation (minimal, low-regression):**

* Switch to required env syntax: `${OBJECT_STORE_SIGNING_SECRET:?required}` etc in `docker-compose.demo-prod.yml`.
* In app code, treat empty string env vars as “missing” and fail closed explicitly.

---

### Low

#### SEC-011: Inconsistent ID validation across routes (harder to reason about, potential DoS/log injection)

**Impact (1 sentence):** Some endpoints accept very loosely validated IDs, increasing the chance of edge-case behaviour, very long inputs, or accidental exposure if IDs ever become security boundaries.

**Evidence (repo-grounded, from code-map):**

* Strictly constrained ID patterns exist in some handlers (good baseline):

  * Citation IDs regex constrained: `apps/web/app/(api)/citations/[id]/route.ts:11-18` (as per code-map summary)
  * Artefact IDs regex constrained: `apps/web/app/(api)/artefacts/[id]/download/route.ts:21-28` (as per code-map summary)
* But other handlers only use `z.string().min(1)` without max/regex:

  * Example: `apps/web/app/(api)/documents/[id]/complete/route.ts:12-18` (as per code-map summary)
  * Example: `apps/web/app/(api)/documents/[id]/pdf/route.ts:21-25` (as per code-map summary)

**Exploit scenario notes:**

* Attacker sends extremely long IDs to amplify DB work, log volume, or error handling paths.
* If an ID is later reused in filesystem keys or object store keys, loose validation becomes a latent traversal/injection risk.

**Actionable remediation (minimal, low-regression):**

* Standardise ID schemas (prefix + charset + max length) for all dynamic route params.
* Add `.trim()` and `.max(n)` everywhere for string inputs.

---

## Remediation roadmap (risk reduction per effort)

1. **Stop Docker secret leakage (SEC-001).**
   Update `.dockerignore` now. Add a CI guard to prevent regressions. This is a high-impact, low-effort fix.

2. **Make spikes dev-only (SEC-002).**
   Tighten `assertSpikesEnabled()` to require dev mode and add an admin token for the riskiest spikes routes.

3. **Add same-origin enforcement for non-GET in demo-prod middleware (SEC-004).**
   One middleware change reduces an entire class of cross-site side-effect attacks with minimal regression risk.

4. **Remove Host-derived loopback fetch origin (SEC-003).**
   Refactor the viewer to avoid internal loopback HTTP or use a canonical, allowlisted origin. This closes SSRF-to-localhost.

5. **Harden demo-prod compose defaults (SEC-008, SEC-010).**
   Remove DB port exposure and enforce required secrets using `${VAR:?}`. This prevents common demo VM accidents.

6. **Add baseline security headers (SEC-005).**
   Start with low-risk headers and clickjacking defence. Roll CSP out carefully (report-only first if needed).

7. **DoS hardening for PDF ingest (SEC-006).**
   Add a wall-clock timeout per document. Consider process isolation if you accept truly untrusted uploads.

8. **Unify CSV escape across all CSV exports (SEC-007).**
   Small code refactor + tests.

9. **Clean up minor auth hygiene (SEC-009) and input validation consistency (SEC-011).**

---

## Diff-ready “do these first” list (top 5)

1. **`.dockerignore`**

   * Add ignores for `.env` and `.env.*` at all levels (`**/.env`, `**/.env.*`)
   * Keep allowing templates like `.env.example` / `.env.template`

2. **`apps/web/lib/spikes.server.ts`**

   * Change `assertSpikesEnabled()` to require `ORBITAL_MODE === "dev"` (and/or `NODE_ENV === "development"`)
   * For write/export/file-read spikes routes, also require an admin token header

3. **`apps/web/middleware.ts`**

   * For any non-GET request in demo-prod, enforce same-origin using `Origin` and/or `Sec-Fetch-Site`
   * Fail closed with a 403 (not a redirect) when the check fails

4. **`apps/web/app/(app)/matters/viewer/page.tsx`**

   * Remove Host-derived port usage (`Host` → `127.0.0.1:${port}`)
   * Use direct server helpers instead of fetch, or use a canonical `APP_ORIGIN` env (allowlisted) for internal fetches

5. **`docker-compose.demo-prod.yml`**

   * Remove `db.ports: ["5432:5432"]` (or bind to loopback only if absolutely needed)
   * Enforce required env vars with `${OBJECT_STORE_SIGNING_SECRET:?required}`, `${BASIC_AUTH_USER:?required}`, `${BASIC_AUTH_PASS:?required}`

---

## Notes / limitations

* I did not run `pnpm audit` or verify the resolved versions in `pnpm-lock.yaml`. If you want one extra high-signal check in CI, add a lightweight dependency/vuln scan and a “Next.js must be at patched minor” guard (your internal security reference already calls out specific patched minima).
* Some file:line references for app code are based on the repo’s prior audit and code-map summaries provided in the prompt. If you want to “lock” the report, re-run `nl -ba` over the cited files and refresh line numbers in a single pass.
