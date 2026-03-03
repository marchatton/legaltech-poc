🧿 oracle 0.8.5 — Less improv, more implementation.
[SYSTEM]
You are Oracle, a focused one-shot problem solver. Emphasize direct answers and cite any files referenced.

[USER]
Active security audit (static code+config review) for legaltech-poc.

Context:
- pnpm workspace
- Next.js App Router: apps/web (middleware.ts, route handlers under apps/web/app/(api), server actions under apps/web/app/(app))
- Shared TS package: packages/core
- Runtime modes: ORBITAL_MODE=dev|demo-prod|prod; demo-prod gated by Basic Auth middleware allowlist.

Deliverable:
1) Findings with severity (Critical/High/Medium/Low)
2) For each: evidence (file+snippet), exploit scenario, minimal fix
3) Focus on secrets leakage (Docker build context), auth/authz, CSRF-by-side-effects, SSRF, XSS/CSP + security headers, file upload/path traversal, SQL injection, error leakage, dependency/version risks.

Constraints:
- Do not request/output secrets (no .env contents)
- Static review only (no runtime probes).

### File: .dockerignore
```
.git
.DS_Store

**/node_modules
**/.next

tmp
**/tmp

throwaway
```

### File: docker-compose.yml
```yaml
services:
  db:
    # pgvector baked in so we can `CREATE EXTENSION vector;` without custom builds.
    image: pgvector/pgvector:pg16
    container_name: legaltech-poc-db
    environment:
      POSTGRES_DB: orbital
      POSTGRES_USER: orbital
      POSTGRES_PASSWORD: orbital
    ports:
      - "5432:5432"
    volumes:
      - orbital-pgdata:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orbital -d orbital"]
      interval: 2s
      timeout: 5s
      retries: 20

volumes:
  orbital-pgdata:
```

### File: docker-compose.demo-prod.yml
```yaml
services:
  db:
    image: pgvector/pgvector:pg16
    container_name: orbital-demo-prod-db
    environment:
      POSTGRES_DB: orbital
      POSTGRES_USER: orbital
      POSTGRES_PASSWORD: orbital
    ports:
      - "5432:5432"
    volumes:
      - orbital-demo-prod-pgdata:/var/lib/postgresql/data
      - ./scripts/db/init.sql:/docker-entrypoint-initdb.d/01-init.sql:ro
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U orbital -d orbital"]
      interval: 2s
      timeout: 5s
      retries: 20

  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: orbital-demo-prod-web
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      ORBITAL_MODE: demo-prod

      # Required in demo-prod (fail closed if missing).
      DATABASE_URL: postgresql://orbital:orbital@db:5432/orbital
      OBJECT_STORE_SIGNING_SECRET: ${OBJECT_STORE_SIGNING_SECRET}

      # Basic Auth for private demo.
      BASIC_AUTH_USER: ${BASIC_AUTH_USER}
      BASIC_AUTH_PASS: ${BASIC_AUTH_PASS}

      # Feature flags for the demo journey.
      FEATURE_ARTEFACTS_LIST: "1"

    ports:
      - "3000:3000"
    volumes:
      - orbital-demo-prod-object-store:/app/tmp/object-store
      - orbital-demo-prod-fixture-seed:/app/tmp/fixture-seed

  worker:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    container_name: orbital-demo-prod-worker
    depends_on:
      db:
        condition: service_healthy
    environment:
      NODE_ENV: production
      ORBITAL_MODE: demo-prod
      DATABASE_URL: postgresql://orbital:orbital@db:5432/orbital
      OBJECT_STORE_SIGNING_SECRET: ${OBJECT_STORE_SIGNING_SECRET}
    command: ["pnpm", "worker"]
    volumes:
      - orbital-demo-prod-object-store:/app/tmp/object-store
      - orbital-demo-prod-fixture-seed:/app/tmp/fixture-seed

volumes:
  orbital-demo-prod-pgdata:
  orbital-demo-prod-object-store:
  orbital-demo-prod-fixture-seed:
```

### File: apps/web/Dockerfile
```
FROM node:20-bookworm-slim AS build

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

WORKDIR /app

# Workspace metadata first for better layer caching.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/package.json
COPY packages/core/package.json packages/core/package.json

RUN pnpm install --frozen-lockfile

# Source code.
COPY apps/web apps/web
COPY packages/core packages/core
COPY docs/08-example-data docs/08-example-data
COPY scripts scripts

RUN pnpm --filter @legaltech-poc/web build

# Runtime image
FROM node:20-bookworm-slim AS runtime

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_ENV="production"

RUN corepack enable

WORKDIR /app

COPY --from=build /app/node_modules /app/node_modules
COPY --from=build /app/package.json /app/package.json
COPY --from=build /app/pnpm-workspace.yaml /app/pnpm-workspace.yaml
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-lock.yaml

COPY --from=build /app/apps/web /app/apps/web
COPY --from=build /app/packages/core /app/packages/core
COPY --from=build /app/docs/08-example-data /app/docs/08-example-data
COPY --from=build /app/scripts /app/scripts

WORKDIR /app/apps/web

EXPOSE 3000

CMD ["pnpm", "start"]
```

### File: apps/web/package.json
```json
{
  "name": "@legaltech-poc/web",
  "private": true,
  "version": "0.0.0",
  "scripts": {
    "dev": "next dev",
    "worker": "node --experimental-strip-types scripts/worker.ts",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "vitest run",
    "typecheck": "tsc -p tsconfig.json --noEmit"
  },
  "dependencies": {
    "@ai-sdk/gateway": "2.0.35",
    "@legaltech-poc/core": "workspace:*",
    "ai": "5.0.129",
    "docx": "^9.5.1",
    "next": "^15.0.0",
    "pdfjs-dist": "^4.0.0",
    "postgres": "^3.4.8",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/react": "^19.0.0",
    "@types/react-dom": "^19.0.0",
    "autoprefixer": "^10.0.0",
    "eslint": "^9.0.0",
    "eslint-config-next": "^15.0.0",
    "postcss": "^8.0.0",
    "tailwindcss": "^3.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### File: apps/web/next.config.js
```js
/** @type {import('next').NextConfig} */
const path = require("node:path");

const nextConfig = {
  reactStrictMode: true,
  // Ensure Next's output file tracing is rooted at the monorepo, not an inferred dir.
  // This avoids picking up unrelated lockfiles on the machine.
  outputFileTracingRoot: path.join(__dirname, "../.."),
  transpilePackages: ["@legaltech-poc/core"],
};

module.exports = nextConfig;
```

### File: apps/web/middleware.ts
```ts
import { NextResponse, type NextRequest } from "next/server";

import { isDemoProd } from "./lib/runtimeMode";
import {
  basicAuthMisconfiguredResponse,
  basicAuthRequiredResponse,
  verifyBasicAuthHeader,
} from "./lib/basicAuth";

function isStaticOrNextInternal(pathname: string): boolean {
  if (pathname.startsWith("/_next/")) return true;
  if (pathname === "/favicon.ico") return true;
  if (pathname === "/robots.txt") return true;
  if (pathname === "/sitemap.xml") return true;
  return false;
}

function isAllowedInDemoProd(req: NextRequest): boolean {
  const p = req.nextUrl.pathname;
  const m = req.method.toUpperCase();

  if (isStaticOrNextInternal(p)) return true;
  if (p === "/") return true;

  // Core pages (server-rendered).
  if (m === "GET" && (p === "/matters" || p.startsWith("/matters/"))) return true;

  // Operator: seed a synthetic pack into Postgres.
  if (p === "/demo/load-pack") return m === "POST";

  // Viewer overlay (fixture-backed).
  if (p.startsWith("/citations/")) return m === "GET";
  if (p.startsWith("/documents/")) return m === "GET";

  // Quick Start + report surfaces.
  if (/^\/folders\/[^/]+\/runs$/.test(p)) return m === "POST";
  if (/^\/folders\/[^/]+\/report$/.test(p)) return m === "GET";
  if (/^\/runs\/[^/]+$/.test(p)) return m === "GET";

  // Exports + downloads.
  if (p === "/export/csv") return m === "POST";
  if (p === "/export/docx") return m === "POST";
  if (/^\/folders\/[^/]+\/artefacts$/.test(p)) return m === "GET";
  if (/^\/artefacts\/[^/]+\/download$/.test(p)) return m === "GET";

  return false;
}

export function middleware(req: NextRequest) {
  if (!isDemoProd()) return NextResponse.next();

  // Fail closed: demo-prod must always be private.
  const expectedUser = process.env.BASIC_AUTH_USER?.trim() ?? "";
  const expectedPass = process.env.BASIC_AUTH_PASS?.trim() ?? "";
  if (!expectedUser || !expectedPass) {
    return basicAuthMisconfiguredResponse();
  }

  const auth = req.headers.get("authorization");
  if (!verifyBasicAuthHeader(auth)) {
    return basicAuthRequiredResponse();
  }

  if (!isAllowedInDemoProd(req)) {
    return new Response("Not found.", { status: 404 });
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes so we can protect pages, APIs, PDF bytes, and artefact downloads.
  matcher: ["/:path*"],
};
```

### File: packages/core/package.json
```json
{
  "name": "@legaltech-poc/core",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "main": "./src/index.ts",
  "types": "./src/index.ts",
  "exports": {
    ".": "./src/index.ts",
    "./server": "./src/server.ts",
    "./citations/snippet": "./src/citations/snippet.ts",
    "./fixtures/fixtureIds": "./src/fixtures/fixtureIds.ts",
    "./geometry/anchors": "./src/geometry/anchors.ts",
    "./geometry/mapToViewport": "./src/geometry/mapToViewport.ts",
    "./missing-docs/detectMissingDocs": "./src/missing-docs/detectMissingDocs.ts",
    "./missing-docs/schemas": "./src/missing-docs/schemas.ts",
    "./safe-error": "./src/safe-error.ts",
    "./spikes/rh1.schemas": "./src/spikes/rh1.schemas.ts",
    "./verify/verifier": "./src/verify/verifier.ts",
    "./verify/verifier.schemas": "./src/verify/verifier.schemas.ts"
  },
  "scripts": {
    "build": "tsc -p tsconfig.build.json",
    "typecheck": "tsc -p tsconfig.json --noEmit",
    "test": "vitest run",
    "lint": "echo \"(lint skipped)\""
  },
  "dependencies": {
    "ai": "^4.0.0",
    "pdfjs-dist": "^4.0.0",
    "zod": "^3.24.0"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "typescript": "^5.0.0",
    "vitest": "^2.0.0"
  }
}
```

### File: security_best_practices_report.md
```md
# Security Best Practices Report (Orbital PoC)

Date: 2026-02-10

## Executive Summary

This is a static, repo-grounded audit (code + config review). I did not run runtime probes.

Overall, the app has a relatively strong “fail-closed” posture for anything production-like, especially around signed URL downloads and dev-only/demo-prod gating. The highest practical risks are all “deployment footguns” and “defense-in-depth gaps” that become real in demos or in any future production hardening:

1. **CRITICAL:** Docker builds can bake local `.env*` secrets into images because `.dockerignore` does not exclude `.env*` and the Dockerfile copies full directories. (`.dockerignore:1-11`, `apps/web/Dockerfile:10-22`)
2. **CRITICAL:** “Spikes” API routes are guarded only by `SPIKES_ENABLED=1`, not by `NODE_ENV`/`ORBITAL_MODE`/auth, so a single env mis-set can expose powerful debug endpoints. (`apps/web/lib/spikes.server.ts:3-6`)
3. **HIGH:** demo-prod uses Basic Auth but does not enforce same-origin semantics for state-changing requests (CSRF-by-side-effects risk). (`apps/web/middleware.ts:18-69`)

Notes:
- I did not run `pnpm audit` against the registry in this pass, so dependency CVEs were not validated via live advisories.

## Scope

- Next.js app (App Router): `apps/web/`
- Shared TS package: `packages/core/`
- Deployment/config: `.dockerignore`, `.gitignore`, `docker-compose*.yml`, `apps/web/Dockerfile`, `apps/web/next.config.js`, `apps/web/middleware.ts`

## Investigation Log

### 2026-02-10 Phase 0: Workspace Verification
- Confirmed repo root is loaded and audited: `/Users/marc/Code/personal-projects/legaltech-poc`.

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
```

### File: apps/web/app/DemoToolbar.tsx
```tsx
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "./ui/Button";
import { Select } from "./ui/Input";
import { ThemeToggle } from "./ui/ThemeToggle";

const PACK_OPTIONS = [
  { id: "pack_01_clean", label: "pack_01_clean" },
  { id: "pack_02_missing_rea", label: "pack_02_missing_rea" },
] as const;

type PackId = (typeof PACK_OPTIONS)[number]["id"];

type LoadState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function DemoToolbar() {
  const router = useRouter();
  const [packId, setPackId] = useState<PackId>("pack_01_clean");
  const [state, setState] = useState<LoadState>({ kind: "idle" });

  async function loadPack() {
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/demo/load-pack", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: packId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = isRecord(json) && isRecord(json.error) ? json.error : null;
      const code = env && typeof env.code === "string" ? env.code : "UNKNOWN_ERROR";
      const message = env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
      setState({ kind: "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const folder = isRecord(json) && isRecord(json.folder) ? json.folder : null;
    const folderId = folder && typeof folder.id === "string" ? folder.id : null;
    if (!folderId) {
      setState({ kind: "error", message: "Missing folder.id in response." });
      return;
    }

    // Re-enable the toolbar for subsequent loads (e.g. switching packs).
    setState({ kind: "idle" });
    router.push(`/matters/${encodeURIComponent(folderId)}`);
  }

  return (
    <section className="sticky top-0 z-50 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-wrap items-end gap-3 p-3">
        <div className="text-xs font-semibold tracking-wide text-muted-foreground">DEMO MODE</div>

        <label className="grid gap-1 text-xs">
          <span className="text-muted-foreground">Pack</span>
          <Select
            className="min-w-56"
            uiSize="sm"
            value={packId}
            onChange={(e) => setPackId(e.currentTarget.value as PackId)}
            disabled={state.kind === "loading"}
          >
            {PACK_OPTIONS.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </Select>
        </label>

        <Button
          size="sm"
          onClick={loadPack}
          loading={state.kind === "loading"}
        >
          Load demo pack
        </Button>

        {state.kind === "error" ? <div className="text-xs font-medium text-destructive">{state.message}</div> : null}

        <div className="h-6 w-px bg-border" />

        <div className="ml-auto">
          <ThemeToggle />
        </div>
      </div>
    </section>
  );
}
```

### File: apps/web/app/globals.css
```css
@import "./tokens.css";

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  html {
    font-size: 15px;
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    transition: background 400ms cubic-bezier(0.4, 0, 0.2, 1),
      color 400ms cubic-bezier(0.4, 0, 0.2, 1);
  }

  html,
  body {
    height: 100%;
  }

  a {
    text-underline-offset: 3px;
  }

  ::selection {
    background: rgb(var(--primary) / 0.15);
  }
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### File: apps/web/app/head.tsx
```tsx
/* eslint-disable @next/next/no-page-custom-font */

export default function Head() {
  return (
    <>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link
        href="https://fonts.googleapis.com/css2?family=Crimson+Pro:ital,wght@0,300;0,400;0,500;0,600;0,700;1,400;1,500&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap"
        rel="stylesheet"
      />
    </>
  );
}
```

### File: apps/web/app/layout.tsx
```tsx
import type { ReactNode } from "react";

import { isDemoModeEnabled } from "../lib/demoMode.server";

import "./globals.css";

import { DemoToolbar } from "./DemoToolbar";
import { ThemeProvider, themeInitScript } from "./ui/ThemeProvider";
import { ThemeToggle } from "./ui/ThemeToggle";

export const metadata = {
  title: "Orbital PoC",
  description: "Orbital Copilot PoC",
};

export default function RootLayout(props: { children: ReactNode }) {
  const demoEnabled = isDemoModeEnabled();

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="min-h-dvh bg-background font-sans text-foreground">
        <ThemeProvider>
          {demoEnabled ? (
            <DemoToolbar />
          ) : (
            <div className="flex justify-end p-3">
              <ThemeToggle />
            </div>
          )}
          {props.children}
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### File: apps/web/app/page.tsx
```tsx
import Link from "next/link";

import { Page, PageHeader } from "./ui/Page";

export default function HomePage() {
  return (
    <Page width="sm">
      <PageHeader
        title={<em>Orbital</em>}
        subtitle="Dev-only spike harness routes live under /spikes."
      />

      <ul className="mt-8 grid gap-3">
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/matters">
            Matters: demo UI (citation chips, viewer, overlay)
          </Link>
        </li>
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/spikes/rh1-pdf-perf">
            RH1: pdf.js perf harness
          </Link>
        </li>
        <li>
          <Link className="text-sm font-medium underline underline-offset-4 hover:text-primary" href="/spikes/rh2-overlay">
            RH2: highlight overlay harness
          </Link>
        </li>
      </ul>
    </Page>
  );
}
```

### File: apps/web/app/tokens.css
```css
/*
 * Orbital Design System — V5 "Final"
 * Warm cream canvas, pure-black dark mode, Crimson Pro serif.
 * Orange reserved for high-signal moments; cyan user bubbles.
 *
 * Color format: space-separated RGB triplets for Tailwind alpha support.
 *   Usage: rgb(var(--primary) / 0.5)
 */

/* ─── Fixed colour scales (mode-independent) ─── */
:root {
  /* Primary — Orange */
  --primary-50:  255 247 240;
  --primary-100: 254 224 200;
  --primary-200: 253 189 148;
  --primary-300: 252 154 96;
  --primary-400: 252 126 61;
  --primary-500: 251 99 27;     /* brand orange */
  --primary-600: 232 85 16;
  --primary-700: 196 74 14;
  --primary-800: 154 58 11;
  --primary-900: 114 44 9;

  /* Secondary — Cyan */
  --secondary-50:  240 250 254;
  --secondary-100: 220 244 251;
  --secondary-200: 192 240 251;  /* brand cyan */
  --secondary-300: 151 226 245;
  --secondary-400: 109 207 235;
  --secondary-500: 72 184 217;
  --secondary-600: 42 153 187;
  --secondary-700: 29 122 150;
  --secondary-800: 21 92 113;
  --secondary-900: 13 62 77;

  /* Accent — Purple */
  --accent-50:  248 240 255;
  --accent-100: 239 217 255;
  --accent-200: 228 195 255;
  --accent-300: 216 172 255;    /* brand purple */
  --accent-400: 200 143 255;
  --accent-500: 181 114 255;
  --accent-600: 155 79 239;
  --accent-700: 126 56 204;
  --accent-800: 98 43 163;
  --accent-900: 71 32 122;

  /* Semantic — Success (Green) */
  --success-50:  236 249 243;
  --success-100: 209 240 225;
  --success-200: 153 218 188;
  --success-300: 96 196 151;
  --success-400: 59 170 120;
  --success-500: 45 138 95;
  --success-600: 36 114 78;
  --success-700: 28 90 62;
  --success-800: 22 70 48;
  --success-900: 15 48 33;

  /* Semantic — Warning (Amber) */
  --warning-50:  255 249 235;
  --warning-100: 254 237 198;
  --warning-200: 250 214 130;
  --warning-300: 245 191 68;
  --warning-400: 232 166 22;
  --warning-500: 212 146 11;
  --warning-600: 178 120 8;
  --warning-700: 142 96 6;
  --warning-800: 108 73 5;
  --warning-900: 76 52 4;

  /* Semantic — Destructive (Red) */
  --destructive-50:  254 242 242;
  --destructive-100: 252 218 218;
  --destructive-200: 247 175 175;
  --destructive-300: 239 132 132;
  --destructive-400: 232 100 100;
  --destructive-500: 220 74 74;
  --destructive-600: 193 54 54;
  --destructive-700: 160 42 42;
  --destructive-800: 126 33 33;
  --destructive-900: 92 24 24;

  /* Semantic — Info (Blue) */
  --info-50:  236 247 254;
  --info-100: 204 232 248;
  --info-200: 150 203 237;
  --info-300: 96 174 226;
  --info-400: 50 148 212;
  --info-500: 13 110 165;
  --info-600: 10 90 138;
  --info-700: 8 72 110;
  --info-800: 6 55 84;
  --info-900: 4 38 58;
}

/* ─── Light mode (default) ─── */
/* Note: this file is imported directly by Next.js; keep it unlayered to avoid requiring postcss-import. */
:root {
    --background: 255 254 251;        /* #FFFEFB — near-white cream */
    --foreground: 26 26 26;           /* #1A1A1A */
    --card: 255 255 255;
    --card-foreground: 26 26 26;
    --popover: 255 255 255;
    --popover-foreground: 26 26 26;
    --muted: 245 243 240;            /* #F5F3F0 — warm muted */
    --muted-foreground: 122 117 110; /* #7A756E */

    --primary: 251 99 27;            /* #FB631B */
    --primary-foreground: 255 255 255;
    --secondary: 192 240 251;        /* #C0F0FB */
    --secondary-foreground: 26 26 26;
    --accent: 216 172 255;           /* #D8ACFF */
    --accent-foreground: 26 26 26;

    --destructive: 220 74 74;
    --destructive-foreground: 255 255 255;
    --success: 45 138 95;
    --success-foreground: 255 255 255;
    --warning: 212 146 11;
    --warning-foreground: 26 26 26;
    --info: 13 110 165;
    --info-foreground: 255 255 255;

    --border: 232 229 224;           /* #E8E5E0 */
    --input: 232 229 224;
    --ring: 216 172 255;

    /* Chat-specific */
    --user-bubble: 220 244 251;      /* secondary-100 — soft cyan */
    --user-bubble-foreground: 26 26 26;

    /* Sidebar */
    --sidebar: 245 243 240;
    --sidebar-foreground: 26 26 26;
    --sidebar-accent: 255 254 251;
    --sidebar-accent-foreground: 26 26 26;
    --sidebar-border: 232 229 224;
    --sidebar-ring: 216 172 255;

    /* Radius */
    --radius-sm: 6px;
    --radius-md: 8px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    --radius-2xl: 24px;
    --radius-pill: 9999px;

    /* Shadows */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 14px rgba(0,0,0,0.07);
    --shadow-lg: 0 8px 28px rgba(0,0,0,0.10);
  }

/* ─── Dark mode ─── */
.dark {
    --background: 10 10 10;          /* #0A0A0A — pure black */
    --foreground: 245 245 245;       /* #F5F5F5 */
    --card: 23 23 23;               /* #171717 */
    --card-foreground: 245 245 245;
    --popover: 28 28 28;
    --popover-foreground: 245 245 245;
    --muted: 36 36 36;              /* #242424 */
    --muted-foreground: 163 163 163; /* #A3A3A3 */

    --primary: 255 90 20;           /* #FF5A14 — boosted for dark */
    --primary-foreground: 10 10 10;
    --secondary: 192 240 251;
    --secondary-foreground: 10 10 10;
    --accent: 216 172 255;
    --accent-foreground: 10 10 10;

    --destructive: 239 100 100;
    --destructive-foreground: 10 10 10;
    --success: 74 190 133;
    --success-foreground: 10 10 10;
    --warning: 245 178 55;
    --warning-foreground: 10 10 10;
    --info: 70 160 220;
    --info-foreground: 10 10 10;

    --border: 46 46 46;             /* #2E2E2E */
    --input: 46 46 46;
    --ring: 216 172 255;

    /* Chat-specific */
    --user-bubble: 20 38 46;        /* deep teal */
    --user-bubble-foreground: 220 235 240;

    /* Sidebar */
    --sidebar: 18 18 18;
    --sidebar-foreground: 245 245 245;
    --sidebar-accent: 28 28 28;
    --sidebar-accent-foreground: 245 245 245;
    --sidebar-border: 46 46 46;
    --sidebar-ring: 216 172 255;

    /* Shadows (dark — heavier for depth on dark surfaces) */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.3);
    --shadow-md: 0 4px 14px rgba(0,0,0,0.4);
    --shadow-lg: 0 8px 28px rgba(0,0,0,0.5);
  }

html {
  color: rgb(var(--foreground));
  background: rgb(var(--background));
}
```

### File: apps/web/app/ui/Accordion.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* -------------------------------------------------------------------------- */
/*  AccordionGroup                                                            */
/* -------------------------------------------------------------------------- */

export function AccordionGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-ui-lg border border-border overflow-hidden divide-y divide-border", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  AccordionItem                                                             */
/* -------------------------------------------------------------------------- */

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDetailsElement>, "children"> & {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({ className, trigger, children, defaultOpen, ...props }: AccordionItemProps) {
  return (
    <details className={cn("group", className)} open={defaultOpen || undefined} {...props}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 font-semibold text-sm text-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span>{trigger}</span>
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-standard ease-brand-standard group-open:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="px-4 pb-3.5 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
```

### File: apps/web/app/ui/Alert.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
  hideIcon?: boolean;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-info/[0.06] border-info/20",
  success: "bg-success/[0.06] border-success/20",
  warning: "bg-warning/[0.06] border-warning/20",
  destructive: "bg-destructive/[0.06] border-destructive/20",
};

const iconColorClasses: Record<AlertVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

function DefaultIcon({ variant }: { variant: AlertVariant }) {
  const cls = cn("shrink-0 mt-0.5", iconColorClasses[variant]);
  if (variant === "success") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (variant === "destructive") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }
  // info (default)
  return (
    <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function alertClassName(args?: { variant?: AlertVariant; className?: string }) {
  const variant = args?.variant ?? "info";
  return cn(
    "flex gap-3 items-start rounded-ui-md border p-4 text-sm",
    variantClasses[variant],
    args?.className,
  );
}

export function Alert({ className, variant = "info", title, icon, hideIcon, children, ...props }: AlertProps) {
  return (
    <div className={alertClassName({ variant, className })} role="alert" {...props}>
      {!hideIcon && (icon ?? <DefaultIcon variant={variant} />)}
      <div className="min-w-0">
        {title ? <div className="font-semibold text-foreground">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1", "text-xs text-muted-foreground")}>{children}</div> : null}
      </div>
    </div>
  );
}
```

### File: apps/web/app/ui/Badge.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type BadgeVariant = "muted" | "primary" | "success" | "warning" | "destructive" | "info";
export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, string> = {
  muted: "bg-muted text-muted-foreground ring-border/60",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  info: "bg-info/10 text-info ring-info/20",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-2xs px-1.5 py-px",
  md: "text-xs px-2 py-0.5",
};

export function badgeClassName(args?: { variant?: BadgeVariant; size?: BadgeSize; className?: string }) {
  const variant = args?.variant ?? "muted";
  const size = args?.size ?? "md";
  return cn(
    "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
    sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={badgeClassName({ variant, size, className })} {...props} />;
}
```

### File: apps/web/app/ui/Button.tsx
```tsx
import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";
import { Spinner } from "./Spinner";

export type ButtonVariant = "primary" | "neutral" | "secondary" | "ghost" | "destructive" | "success" | "outline" | "link";
export type ButtonSize = "sm" | "md" | "lg";

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-primary-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-md active:translate-y-0",
  neutral:
    "bg-foreground text-background hover:bg-foreground/90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  secondary:
    "border border-border bg-card text-foreground hover:border-foreground/20 hover:bg-muted active:translate-y-px",
  ghost: "bg-transparent text-foreground hover:bg-muted active:translate-y-px",
  destructive:
    "bg-destructive text-destructive-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  success:
    "bg-success text-success-foreground hover:brightness-90 hover:-translate-y-px hover:shadow-ui-sm active:translate-y-0",
  outline:
    "border border-primary text-primary bg-transparent hover:bg-primary hover:text-primary-foreground active:translate-y-px",
  link: "bg-transparent text-foreground underline underline-offset-[3px] hover:text-primary p-0 h-auto shadow-none",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-2xs",
  md: "h-9 px-3 py-2 text-sm",
  lg: "h-11 px-5 text-base",
};

export function buttonClassName(args?: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  className?: string;
}) {
  const variant = args?.variant ?? "primary";
  const size = args?.size ?? "md";

  return cn(
    "inline-flex items-center justify-center gap-2 font-medium",
    args?.pill ? "rounded-pill" : "rounded-ui-md",
    "transition-[transform,box-shadow,background-color,border-color,color,filter] duration-micro ease-brand-standard",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60",
    variant !== "link" && sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  pill?: boolean;
  loading?: boolean;
  loadingLabel?: ReactNode;
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, size, pill, type, loading, loadingLabel, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type ?? "button"}
      className={buttonClassName({ variant, size, pill, className })}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...props}
    >
      {loading ? (
        <>
          <Spinner size="xs" className="shrink-0" aria-label="Loading" />
          {loadingLabel ?? children}
        </>
      ) : (
        children
      )}
    </button>
  );
});
```

### File: apps/web/app/ui/Card.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type CardVariant = "default" | "muted" | "interactive";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card shadow-ui-sm",
  muted: "bg-muted shadow-none",
  interactive:
    "bg-card shadow-ui-sm transition-[transform,box-shadow,border-color] duration-micro ease-brand-standard hover:-translate-y-0.5 hover:shadow-ui-md hover:border-foreground/15",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-ui-lg border border-border text-card-foreground",
        "transition-[background-color,border-color] duration-standard ease-brand-standard",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-serif text-[17px] font-medium", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 pt-3 border-t border-border flex gap-4 font-mono text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
```

### File: apps/web/app/ui/Chip.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type ChipVariant = "filter" | "citation";
export type ChipDot = "success" | "warning" | "destructive" | "muted";

export type ChipProps = HTMLAttributes<HTMLElement> & {
  variant?: ChipVariant;
  active?: boolean;
  dot?: ChipDot;
  as?: "span" | "button" | "a";
  href?: string;
};

const dotColors: Record<ChipDot, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
};

export function chipClassName(args?: {
  variant?: ChipVariant;
  active?: boolean;
  className?: string;
}) {
  const variant = args?.variant ?? "filter";
  return cn(
    "inline-flex items-center gap-2 rounded-pill border border-border bg-card font-medium transition-colors duration-micro ease-brand-standard hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "citation" ? "font-mono text-2xs px-2.5 py-0.5" : "text-sm px-3 py-1",
    args?.active && "bg-primary/10 border-primary text-primary font-semibold",
    args?.className,
  );
}

export function Chip({ className, variant, active, dot, as = "span", href, children, ...props }: ChipProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={chipClassName({ variant, active, className })}
      {...(as === "a" && href ? { href } : {})}
      {...props}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[dot])} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}
```

### File: apps/web/app/ui/EmptyState.tsx
```tsx
import type { ReactNode } from "react";

import { cn } from "./cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-10 px-6", className)}>
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-ui-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="font-serif text-heading-sm font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
```

### File: apps/web/app/ui/InlineStatus.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type InlineStatusKind = "idle" | "loading" | "success" | "error" | "warning";

export type InlineStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  kind: InlineStatusKind;
  children?: ReactNode;
};

export function InlineStatus({ kind, className, children, ...props }: InlineStatusProps) {
  if (kind === "idle") return null;

  const isError = kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "text-xs font-medium",
        kind === "loading" && "text-muted-foreground",
        kind === "success" && "text-success",
        kind === "error" && "text-destructive",
        kind === "warning" && "text-warning",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
```

### File: apps/web/app/ui/Input.tsx
```tsx
import { forwardRef, type InputHTMLAttributes, type SelectHTMLAttributes } from "react";

import { cn } from "./cn";

export type FieldSize = "sm" | "md";

export function fieldClassName(args?: { uiSize?: FieldSize; className?: string }) {
  const uiSize = args?.uiSize ?? "md";
  return cn(
    "rounded-ui-md border border-input bg-background text-foreground",
    "transition-colors duration-micro ease-brand-standard",
    "placeholder:text-muted-foreground",
    "hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background focus-visible:shadow-[0_0_0_3px_rgba(216,172,255,0.2)]",
    "disabled:cursor-not-allowed disabled:opacity-60",
    uiSize === "sm" ? "h-8 px-2 text-xs" : "h-9 px-3 text-sm",
    args?.className,
  );
}

export type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  uiSize?: FieldSize;
};

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  { className, uiSize, ...props },
  ref,
) {
  return <input ref={ref} className={fieldClassName({ uiSize, className })} {...props} />;
});

export type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  uiSize?: FieldSize;
};

export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  { className, uiSize, ...props },
  ref,
) {
  return (
    <div className="relative">
      <select
        ref={ref}
        className={fieldClassName({
          uiSize,
          className: cn("appearance-none pr-9 cursor-pointer", className),
        })}
        {...props}
      />
      <svg
        className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        width="14"
        height="14"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" />
      </svg>
    </div>
  );
});
```

### File: apps/web/app/ui/MonoId.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type MonoIdVariant = "default" | "inverted";

export type MonoIdProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: MonoIdVariant;
};

const variantClasses: Record<MonoIdVariant, string> = {
  default: "bg-muted text-muted-foreground",
  inverted: "bg-foreground text-background",
};

export function MonoId({ className, variant = "default", ...props }: MonoIdProps) {
  return (
    <span
      className={cn("rounded-ui-sm px-2 py-0.5 font-mono text-xs", variantClasses[variant], className)}
      {...props}
    />
  );
}
```

### File: apps/web/app/ui/Page.tsx
```tsx
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* ── Page (outer container) ── */

export type PageWidth = "sm" | "md" | "lg";

const widthClasses: Record<PageWidth, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
};

export function Page({
  children,
  width = "md",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { width?: PageWidth }) {
  return (
    <main
      className={cn("mx-auto w-full px-6 py-10 sm:px-8 animate-fade-in", widthClasses[width], className)}
      {...props}
    >
      {children}
    </main>
  );
}

/* ── PageHeader (title + optional subtitle + right slot) ── */

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="font-serif text-heading-lg font-normal">{title}</h1>
        {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
      </div>
      {right}
    </div>
  );
}

/* ── PageSection (spacing between blocks) ── */

export function PageSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("mt-8", className)} {...props} />;
}

/* ── SectionTitle (in-card heading with accent bar) ── */

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "relative pl-3 text-sm font-semibold text-foreground before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

/* ── SectionLabel (mono overline label like in the design system) ── */

export function SectionLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-mono text-2xs font-semibold uppercase tracking-widest text-primary",
        className,
      )}
      {...props}
    />
  );
}
```

### File: apps/web/app/ui/ProgressBar.tsx
```tsx
import { cn } from "./cn";

export function ProgressBar({
  value,
  className,
}: {
  value?: number;
  className?: string;
}) {
  const indeterminate = value === undefined;

  return (
    <div className={cn("h-1 w-full overflow-hidden rounded-pill bg-muted", className)}>
      {indeterminate ? (
        <div className="h-full w-[40%] animate-progress-slide rounded-pill bg-primary" />
      ) : (
        <div
          className="h-full rounded-pill bg-primary transition-[width] duration-large ease-brand-standard"
          style={{ width: `${Math.max(0, Math.min(100, value))}%` }}
        />
      )}
    </div>
  );
}
```

### File: apps/web/app/ui/Skeleton.tsx
```tsx
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-ui-md", className)} aria-hidden {...props} />;
}

export function SkeletonLine({
  width,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: string }) {
  return (
    <Skeleton
      className={cn("h-3.5 mb-2 last:mb-0", className)}
      style={width ? { width } : undefined}
      {...props}
    />
  );
}

export function SkeletonCircle({
  size = "2.5rem",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: string }) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
```

### File: apps/web/app/ui/Spinner.tsx
```tsx
import { cn } from "./cn";

export type SpinnerSize = "xs" | "sm" | "md";
export type SpinnerVariant = "current" | "primary";

const sizeClasses: Record<SpinnerSize, string> = {
  xs: "h-3 w-3 border-[1.5px]",
  sm: "h-3.5 w-3.5 border-2",
  md: "h-4 w-4 border-2",
};

const variantClasses: Record<SpinnerVariant, string> = {
  current: "border-current border-t-transparent",
  primary: "border-border border-t-primary",
};

export function Spinner({
  size = "sm",
  variant = "current",
  className,
  "aria-label": ariaLabel = "Loading",
}: {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  className?: string;
  "aria-label"?: string;
}) {
  return (
    <span
      role="status"
      aria-label={ariaLabel}
      className={cn(
        "inline-block animate-spin rounded-full",
        sizeClasses[size],
        variantClasses[variant],
        className,
      )}
    />
  );
}
```

### File: apps/web/app/ui/Table.tsx
```tsx
import type { HTMLAttributes, TableHTMLAttributes, TdHTMLAttributes, ThHTMLAttributes } from "react";

import { cn } from "./cn";

export function TableFrame({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("overflow-auto rounded-ui-lg border border-border bg-card", className)} {...props} />;
}

export function Table({ className, ...props }: TableHTMLAttributes<HTMLTableElement>) {
  return <table className={cn("min-w-full border-collapse text-sm", className)} {...props} />;
}

export function TH({ className, children, ...props }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      scope="col"
      className={cn(
        "px-3 py-2 bg-muted font-mono text-2xs font-semibold uppercase tracking-wide text-muted-foreground border-b border-border text-left",
        className,
      )}
      {...props}
    >
      {children}
    </th>
  );
}

export function TR({ className, ...props }: HTMLAttributes<HTMLTableRowElement>) {
  return (
    <tr
      className={cn(
        "transition-colors duration-micro ease-brand-standard hover:bg-muted/40",
        className,
      )}
      {...props}
    />
  );
}

export function TD({ className, ...props }: TdHTMLAttributes<HTMLTableCellElement>) {
  return <td className={cn("px-3 py-2.5 border-b border-border/60", className)} {...props} />;
}
```

### File: apps/web/app/ui/ThemeProvider.tsx
```tsx
"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

export type Theme = "light" | "dark" | "system";

type ThemeContext = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const Ctx = createContext<ThemeContext>({ theme: "system", setTheme: () => {} });

export function useTheme() {
  return useContext(Ctx);
}

const STORAGE_KEY = "orbital-theme";

function applyThemeClass(theme: Theme) {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else if (theme === "light") {
    root.classList.remove("dark");
  } else {
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    root.classList.toggle("dark", prefersDark);
  }
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>("system");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "light" || stored === "dark" || stored === "system") {
      setThemeState(stored);
      applyThemeClass(stored);
    } else {
      applyThemeClass("system");
    }
  }, []);

  useEffect(() => {
    if (theme !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyThemeClass("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [theme]);

  const setTheme = useCallback((next: Theme) => {
    setThemeState(next);
    localStorage.setItem(STORAGE_KEY, next);
    applyThemeClass(next);
  }, []);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

/**
 * Inline script string to prevent FOUC. Inject this as a <script> in <head>
 * or before <body> content so the correct class is applied before first paint.
 */
export const themeInitScript = `
(function(){
  try {
    var t = localStorage.getItem("${STORAGE_KEY}");
    if (t === "dark") document.documentElement.classList.add("dark");
    else if (t !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches)
      document.documentElement.classList.add("dark");
  } catch(e) {}
})();
`.trim();
```

### File: apps/web/app/ui/ThemeToggle.tsx
```tsx
"use client";

import { useTheme, type Theme } from "./ThemeProvider";
import { cn } from "./cn";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-pill border border-border bg-card p-0.5",
        className,
      )}
      role="radiogroup"
      aria-label="Theme"
    >
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          role="radio"
          aria-checked={theme === opt.value}
          onClick={() => setTheme(opt.value)}
          className={cn(
            "rounded-pill px-2.5 py-1 text-xs font-medium transition-colors duration-micro ease-brand-standard",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
            theme === opt.value
              ? "bg-muted text-foreground shadow-ui-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
```

### File: apps/web/app/ui/cn.ts
```ts
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}
```

### File: apps/web/app/(api)/folders/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../lib/db.server";
import { assertDevOnlyApi } from "../../../lib/devOnlyApi.server";
import { newId } from "../../../lib/ids";
import { createTraceContext } from "../../../lib/trace.server";

export const runtime = "nodejs";

const CreateFolderSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at
    FROM folders
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      folders: folders.map((f) => ({
        id: f.id,
        name: f.name,
        state: f.state,
        latest_index_version: f.latest_index_version,
        created_at: f.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = CreateFolderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = newId("fld");
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${parsed.data.name}, 'empty', 'v1', now(), now())
  `;

  return Response.json(
    {
      folder: {
        id: folderId,
        name: parsed.data.name,
        state: "empty",
        latest_index_version: "v1",
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(app)/matters/ArtefactsList.tsx
```tsx
import { z } from "zod";

import { Badge } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Table, TableFrame, TD, TH, TR } from "../../ui/Table";

import { ensureSchema, sql } from "../../../lib/db.server";
import { createSignedGetHeaders } from "../../../lib/objectStore.server";

type Props = {
  folderId: string;
};

const FolderIdSchema = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);

type ArtefactRow = {
  id: string;
  kind: string;
  filename: string;
  created_at: Date;
  storage_key: string;
};

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function isUnsafeFilename(filename: string): boolean {
  return filename.toUpperCase().includes(".UNSAFE.");
}

function signedArtefactDownloadHref(args: { artefactId: string; storageKey: string; issued: string }): string {
  const signed = createSignedGetHeaders({ storageKey: args.storageKey });
  return `/artefacts/${encodeURIComponent(args.artefactId)}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: args.issued,
  }).toString()}`;
}

export async function ArtefactsList(props: Props) {
  const parsedId = FolderIdSchema.safeParse(props.folderId);
  if (!parsedId.success) {
    return (
      <section className="rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="text-sm font-semibold text-destructive">Artefacts</div>
        <div className="mt-2 text-xs text-destructive">Invalid folder id.</div>
      </section>
    );
  }

  await ensureSchema();

  const folderId = parsedId.data;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return (
      <Card className="p-4">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, kind, filename, created_at, storage_key
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  if (!artefacts.length) {
    return (
      <Card className="p-4">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="text-xs text-muted-foreground">{artefacts.length} item(s)</div>
      </div>

      <TableFrame className="mt-3">
        <Table>
          <thead>
            <tr>
              <TH>Filename</TH>
              <TH>Kind</TH>
              <TH>Created</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {artefacts.map((a) => {
              const unsafe = isUnsafeFilename(a.filename);
              let downloadHref: string;
              try {
                downloadHref = signedArtefactDownloadHref({
                  artefactId: a.id,
                  storageKey: a.storage_key,
                  issued: "rsc",
                });
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                return (
                  <TR key={a.id}>
                    <TD colSpan={4}>
                      <div className="text-xs text-destructive">
                        Failed to sign artefact download: <span className="font-mono">{message}</span>
                      </div>
                    </TD>
                  </TR>
                );
              }
              return (
                <TR key={a.id}>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? (
                        <Badge variant="destructive" size="sm">
                          UNSAFE
                        </Badge>
                      ) : null}
                      <span className="font-mono">{a.filename}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="muted" size="sm" className="font-mono">
                      {a.kind}
                    </Badge>
                  </TD>
                  <TD>
                    <span className="font-mono">{formatCreatedAt(a.created_at.toISOString())}</span>
                  </TD>
                  <TD className="text-right">
                    <a className={buttonClassName({ variant: "secondary", size: "sm" })} href={downloadHref}>
                      Download
                    </a>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </TableFrame>
    </Card>
  );
}
```

### File: apps/web/app/(app)/matters/ExportCsvButton.tsx
```tsx
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";
import { InlineStatus } from "../../ui/InlineStatus";

type Props = {
  folderId: string;
  runId: string | null;
  kind: "requirements_tracker" | "exceptions_table" | "survey_issues";
  label?: string;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function ExportCsvButton(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    if (!props.runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: props.kind,
          unsafe_override: false,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = isRecord(json) && isRecord(json.error) ? json.error : null;
      const code = env && typeof env.code === "string" ? env.code : "UNKNOWN_ERROR";
      const message = env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
      setState({ kind: code === "EXPORT_BLOCKED" ? "blocked" : "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const artefact = isRecord(json) && isRecord(json.artefact) ? json.artefact : null;
    const downloadUrl = artefact && typeof artefact.download_url === "string" ? artefact.download_url : null;
    if (!downloadUrl) {
      setState({ kind: "error", message: "Missing artefact.download_url." });
      return;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.click();
    setState({ kind: "downloaded", message: "Export created. Download started." });
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={run}
        disabled={!props.runId}
        loading={state.kind === "loading"}
      >
        {props.label ?? "Export CSV"}
      </Button>

      <InlineStatus kind={state.kind === "blocked" || state.kind === "error" ? "error" : state.kind === "downloaded" ? "success" : "idle"}>
        {state.kind === "blocked" || state.kind === "error" ? state.message : state.kind === "downloaded" ? state.message : null}
      </InlineStatus>
    </div>
  );
}
```

### File: apps/web/app/(app)/matters/ExportTraceButton.tsx
```tsx
"use client";

import { useEffect, useState } from "react";

import { Button } from "../../ui/Button";
import { InlineStatus } from "../../ui/InlineStatus";
import { Input } from "../../ui/Input";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function parseErrorEnvelope(json: unknown): { code: string; message: string; traceId?: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  const traceId = typeof env.trace_id === "string" && env.trace_id.trim() ? env.trace_id.trim() : undefined;
  if (!code || !message) return null;
  return { code, message, traceId };
}

export function ExportTraceButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [runIdInput, setRunIdInput] = useState<string>(props.runId ?? "");

  useEffect(() => {
    setRunIdInput(props.runId ?? "");
  }, [props.runId]);

  async function run() {
    const runId = runIdInput.trim();
    if (!runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    const url = `/runs/${encodeURIComponent(runId)}/trace?${new URLSearchParams({ pack: props.folderId }).toString()}`;

    let res: Response;
    try {
      res = await fetch(url, { method: "GET" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = parseErrorEnvelope(json);
      const code = env?.code ?? "UNKNOWN_ERROR";
      const message = env?.message ?? `Request failed (${res.status})`;
      const trace = env?.traceId ? ` (trace_id: ${env.traceId})` : "";
      setState({ kind: "error", message: `${code}: ${message}${trace}` });
      return;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `trace_${runId}.json`;
    a.click();
    URL.revokeObjectURL(objectUrl);
    setState({ kind: "downloaded", message: "Trace download started." });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Input
          className="w-44 font-mono"
          uiSize="sm"
          type="text"
          value={runIdInput}
          placeholder="run_id"
          onChange={(e) => setRunIdInput(e.target.value)}
          aria-label="Run id"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={run}
          loading={state.kind === "loading"}
        >
          Export trace
        </Button>
      </div>

      <InlineStatus kind={state.kind === "error" ? "error" : state.kind === "downloaded" ? "success" : "idle"}>
        {state.kind === "error" || state.kind === "downloaded" ? state.message : null}
      </InlineStatus>
    </div>
  );
}
```

### File: apps/web/app/(app)/matters/MattersToolbar.tsx
```tsx
"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { Select } from "../../ui/Input";

type Props = {
  packIds: string[];
  selectedPackId: string;
};

export function MattersToolbar(props: Props) {
  const router = useRouter();
  const [pack, setPack] = useState(props.selectedPackId);

  const hasSeeded = props.packIds.length > 0;
  const options = useMemo(
    () => (hasSeeded ? props.packIds : [props.selectedPackId]),
    [hasSeeded, props.packIds, props.selectedPackId],
  );

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.selectedPackId);
  }, [props.selectedPackId]);

  return (
    <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
      <div className="flex flex-wrap items-end gap-3">
        <label className="grid gap-1 text-sm">
          <span className="text-muted-foreground">Seeded pack</span>
          <Select
            className="min-w-64"
            value={pack}
            onChange={(e) => {
              const next = e.currentTarget.value;
              setPack(next);
              router.push(`/matters?${new URLSearchParams({ pack: next }).toString()}`);
            }}
          >
            {options.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </Select>
        </label>

        {!hasSeeded ? (
          <div className="text-xs text-muted-foreground">
            No seeded packs found. Run <code className="font-mono">pnpm fixture:seed pack_01_clean</code>.
          </div>
        ) : null}
      </div>
    </section>
  );
}
```

### File: apps/web/app/(app)/matters/actions.ts
```ts
"use server";

import { z } from "zod";

import { redirect } from "next/navigation";

import { assertDevOnly } from "../../../lib/devOnly";
import { loadSeedSnapshot, saveSeedSnapshot } from "../../../lib/fixtureSeed.server";

const FormSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  question_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/),
});

type ReviewErrorCode =
  | "INVALID_REQUEST"
  | "SNAPSHOT_NOT_FOUND"
  | "ROW_NOT_FOUND"
  | "NOT_NEEDS_REVIEW"
  | "NO_LOCKED_CITATIONS";

function toRedirectUrl(args: { pack?: string; reviewed?: string; error?: { code: ReviewErrorCode; qid?: string } }) {
  const params = new URLSearchParams();
  if (args.pack) params.set("pack", args.pack);
  if (args.reviewed) params.set("reviewed", args.reviewed);
  if (args.error) {
    params.set("review_error", args.error.code);
    if (args.error.qid) params.set("qid", args.error.qid);
  }
  const qs = params.toString();
  return qs ? `/matters?${qs}` : "/matters";
}

function fdString(fd: FormData, key: string): string | undefined {
  const val = fd.get(key);
  return typeof val === "string" ? val : undefined;
}

export async function markRowReviewed(formData: FormData): Promise<void> {
  assertDevOnly();

  const parsed = FormSchema.safeParse({
    pack: fdString(formData, "pack"),
    question_id: fdString(formData, "question_id"),
  });
  if (!parsed.success) {
    redirect(toRedirectUrl({ error: { code: "INVALID_REQUEST" } }));
  }

  const packId = parsed.data.pack;
  const questionId = parsed.data.question_id;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "SNAPSHOT_NOT_FOUND" } }));
  }

  const row = snapshot.rows.find((r) => r.question_id === questionId);
  if (!row) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "ROW_NOT_FOUND", qid: questionId } }));
  }

  if (row.status !== "needs_review") {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NOT_NEEDS_REVIEW", qid: questionId } }));
  }

  const lockedCount = row.citation_ids.filter((cid) => Boolean(snapshot.citations?.[cid])).length;
  if (lockedCount < 1) {
    redirect(toRedirectUrl({ pack: packId, error: { code: "NO_LOCKED_CITATIONS", qid: questionId } }));
  }

  row.status = "reviewed";
  saveSeedSnapshot(packId, snapshot);
  redirect(toRedirectUrl({ pack: packId, reviewed: questionId }));
}
```

### File: apps/web/app/(app)/matters/page.tsx
```tsx
import { z } from "zod";

import { ListPayloadV0Schema, MissingDocCandidateSchema } from "@legaltech-poc/core";

import { assertDevOrDemoProd } from "../../../lib/devOnly";
import { listSeededPackIds, loadSeedSnapshot } from "../../../lib/fixtureSeed.server";

import { ExportCsvButton } from "./ExportCsvButton";
import { ExportTraceButton } from "./ExportTraceButton";
import { MattersToolbar } from "./MattersToolbar";
import { ArtefactsList } from "./ArtefactsList";
import { markRowReviewed } from "./actions";

import { AccordionItem } from "../../ui/Accordion";
import { Alert } from "../../ui/Alert";
import { Badge, type BadgeVariant } from "../../ui/Badge";
import { Button } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Chip } from "../../ui/Chip";
import { MonoId } from "../../ui/MonoId";
import { Page, PageHeader, PageSection } from "../../ui/Page";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
  reviewed: z.string().min(1).max(200).optional(),
  review_error: z.string().min(1).max(200).optional(),
  qid: z.string().min(1).max(200).optional(),
});

function statusVariant(status: string): BadgeVariant {
  if (status === "reviewed") return "success";
  if (status === "needs_review") return "warning";
  if (status === "citation_failed") return "destructive";
  return "muted";
}

function reviewErrorMessage(code: string): string {
  if (code === "NO_LOCKED_CITATIONS") return "Cannot mark reviewed: row has no locked citations.";
  if (code === "NOT_NEEDS_REVIEW") return "Cannot mark reviewed: only needs_review rows can be reviewed.";
  if (code === "ROW_NOT_FOUND") return "Cannot mark reviewed: row not found.";
  if (code === "SNAPSHOT_NOT_FOUND") return "Cannot mark reviewed: seed snapshot not found.";
  if (code === "INVALID_REQUEST") return "Cannot mark reviewed: invalid request.";
  return "Cannot mark reviewed.";
}

function matchStatusVariant(status: string): BadgeVariant {
  if (status === "matched") return "success";
  if (status === "ambiguous") return "warning";
  return "muted";
}

const MissingDocsProvenanceSchema = z
  .object({
    missing_docs_checklist: z.array(MissingDocCandidateSchema).optional(),
    missing_docs_candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
  })
  .passthrough();

function CitationChips(props: {
  packId: string;
  citationIds: string[];
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  if (!props.citationIds.length) return <div className="text-xs text-muted-foreground">(no citations)</div>;

  return props.citationIds.map((cid) => {
    const cit = props.citations?.[cid];
    const params = new URLSearchParams({ pack: props.packId, citation: cid });
    if (cit) {
      params.set("document_id", cit.document_id);
      params.set("page", String(cit.page_number));
    }

    return (
      <Chip key={cid} variant="citation" as="a" href={`/matters/viewer?${params.toString()}`}>
        {cid}
      </Chip>
    );
  });
}

function ExceptionsPayload(props: {
  packId: string;
  payload: unknown;
  citations: Record<string, { document_id: string; page_number: number }> | undefined;
}) {
  const parsed = ListPayloadV0Schema.safeParse(props.payload);
  if (!parsed.success) return null;
  if (parsed.data.kind !== "exceptions_table") return null;

  const items = parsed.data.items
    .filter((it) => it.kind === "exceptions_table_item")
    .slice()
    .sort((a, b) => a.bii_item - b.bii_item);

  if (!items.length) return null;

  return (
    <Card variant="muted" className="mt-4 p-3">
      <div className="text-sm font-semibold text-foreground">Exceptions table</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Click an item to see its matched instrument PDF and the locked citations used as evidence.
      </p>

      <div className="mt-3 grid gap-2">
        {items.map((it) => (
          <AccordionItem
            key={it.item_id}
            className="rounded-ui-md border border-border bg-card p-3 [&>summary]:px-0 [&>summary]:py-0 [&>div]:px-0 [&>div]:pb-0"
            trigger={
              <div className="flex flex-wrap items-center gap-2">
                <MonoId>{it.item_id}</MonoId>
                <div className="text-sm font-medium text-foreground">{it.type}</div>
                <Badge variant={matchStatusVariant(it.match_status)}>{it.match_status}</Badge>
                {it.match_status === "matched" && it.doc ? (
                  <div className="text-xs text-muted-foreground">
                    matched: <span className="font-mono">{it.doc}</span>
                  </div>
                ) : null}
                {it.match_status === "ambiguous" && it.candidates?.length ? (
                  <div className="text-xs text-muted-foreground">candidates: {it.candidates.length}</div>
                ) : null}
              </div>
            }
          >
            <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
              <div className="flex flex-wrap gap-4">
                <div>
                  <span className="font-medium text-foreground">Instrument</span>:{" "}
                  <span className="font-mono">{it.instrument_no ?? "(none)"}</span>
                </div>
                <div>
                  <span className="font-medium text-foreground">Recorded</span>:{" "}
                  <span className="font-mono">{it.recorded_date ?? "(none)"}</span>
                </div>
              </div>

              {it.match_status === "missing_doc" ? (
                <section className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="font-medium text-foreground">Missing instrument document</div>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Expected filename: <span className="font-mono">{it.doc ?? "(unknown)"}</span>
                  </p>
                  <ul className="mt-2 list-disc pl-5 text-xs text-muted-foreground">
                    <li>
                      Request{" "}
                      <span className="font-mono">{it.doc ?? "the instrument PDF"}</span>{" "}
                      from the title company/seller.
                    </li>
                    <li>
                      Confirm the PDF is the full recorded instrument (not a summary) and that the instrument number
                      matches <span className="font-mono">{it.instrument_no ?? "(unknown)"}</span>.
                    </li>
                    <li>Add the missing PDF to the diligence pack, then re-run this workflow.</li>
                  </ul>
                </section>
              ) : null}

              {it.match_status === "ambiguous" && it.candidates?.length ? (
                <div>
                  <div className="font-medium text-foreground">Candidates</div>
                  <ul className="mt-1 list-disc pl-5">
                    {it.candidates.map((c) => (
                      <li key={`${c.doc}:${String(c.instrument_no ?? "")}`}>
                        <span className="font-mono">{c.doc}</span>
                        {c.instrument_no ? (
                          <>
                            <span> (</span>
                            <span className="font-mono">{c.instrument_no}</span>
                            <span>)</span>
                          </>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              <div>
                <div className="font-medium text-foreground">Evidence (locked citations)</div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <CitationChips
                    packId={props.packId}
                    citationIds={it.citation_ids}
                    citations={props.citations}
                  />
                </div>
              </div>
            </div>
          </AccordionItem>
        ))}
      </div>
    </Card>
  );
}

function MissingDocsChecklist(props: { provenance: unknown }) {
  const parsed = MissingDocsProvenanceSchema.safeParse(props.provenance);
  if (!parsed.success) return null;

  const highConfidence = (parsed.data.missing_docs_checklist ?? []).filter((c) => c.confidence >= 0.8);
  const lowConfidence = (parsed.data.missing_docs_candidates_low_confidence ?? []).filter((c) => c.confidence < 0.8);

  if (!highConfidence.length && !lowConfidence.length) return null;

  return (
    <Card variant="muted" className="mt-3 p-3">
      <div className="text-sm font-semibold text-foreground">Missing document checklist</div>
      <p className="mt-1 text-xs text-muted-foreground">
        Use the evidence signals below to request the exact PDF(s), verify the filename, then re-run the workflow.
      </p>

      {highConfidence.length ? (
        <ul className="mt-3 grid gap-2">
          {highConfidence.map((cand) => (
            <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center gap-2">
                <MonoId>{cand.label}</MonoId>
                <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
              </div>
              {cand.signals.length ? (
                <div className="mt-2 text-xs text-muted-foreground">
                  <div className="font-medium text-foreground">Evidence signals</div>
                  <ul className="mt-1 list-disc pl-5">
                    {cand.signals.map((s, idx) => (
                      <li key={`${s.type}:${s.value}:${s.source}:${String(s.page ?? "")}:${idx}`}>
                        <span className="font-medium">{s.source}</span>
                        {s.page ? <span> p.{s.page}</span> : null}
                        <span>: </span>
                        <span className="font-mono">
                          {s.type}={JSON.stringify(s.value)}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="mt-2 text-xs text-muted-foreground">
                <div className="font-medium text-foreground">Checklist</div>
                <ul className="mt-1 list-disc pl-5">
                  <li>
                    Request <span className="font-mono">{cand.label}</span> from the title company/seller.
                  </li>
                  <li>
                    Confirm the file name matches <span className="font-mono">{cand.label}</span> (or adjust to match).
                  </li>
                  <li>Add it to the diligence pack and re-run the workflow.</li>
                </ul>
              </div>
            </li>
          ))}
        </ul>
      ) : null}

      {lowConfidence.length ? (
        <AccordionItem
          className="mt-3"
          trigger={
            <span className="text-xs font-medium text-muted-foreground">
              Show low-confidence candidates ({lowConfidence.length})
            </span>
          }
        >
          <ul className="mt-2 grid gap-2">
            {lowConfidence.map((cand) => (
              <li key={cand.label} className="rounded-ui-md border border-border bg-card p-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MonoId>{cand.label}</MonoId>
                  <div className="text-xs text-muted-foreground">confidence: {Math.round(cand.confidence * 100)}%</div>
                </div>
              </li>
            ))}
          </ul>
        </AccordionItem>
      ) : null}
    </Card>
  );
}

export default async function MattersPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOrDemoProd();

  const searchParams = (await props.searchParams) ?? {};
  const seeded = listSeededPackIds();
  const parsed = SearchSchema.safeParse(searchParams);
  const selected = parsed.success ? parsed.data.pack : undefined;
  const packId = selected ?? seeded[0] ?? "pack_01_clean";

  const snapshot = loadSeedSnapshot(packId);
  const runId =
    snapshot && typeof snapshot.meta.run_id === "string"
      ? snapshot.meta.run_id
      : null;
  const traceExportEnabled = process.env.FEATURE_TRACE_EXPORT === "1";
  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";

  const reviewedQid = parsed.success ? parsed.data.reviewed : undefined;
  const reviewErrorCode = parsed.success ? parsed.data.review_error : undefined;
  const reviewErrorQid = parsed.success ? parsed.data.qid : undefined;

  return (
    <Page>
      <PageHeader
        title="Matters"
        subtitle="Demo-only UI: rows with citation chips that open a PDF viewer + highlight overlay (fail-closed on invalid citations)."
      />

      <PageSection>
        <MattersToolbar packIds={seeded} selectedPackId={packId} />
      </PageSection>

      {reviewErrorCode && !reviewErrorQid ? (
        <PageSection>
          <Alert variant="destructive" title="Review not saved">
            {reviewErrorMessage(reviewErrorCode)}
          </Alert>
        </PageSection>
      ) : null}

      {!snapshot ? (
        <Card className="mt-8 p-4">
          <div className="text-sm font-medium text-foreground">No seeded data for {packId}</div>
          <p className="mt-2 text-sm text-muted-foreground">Seed it locally, then refresh this page:</p>
          <pre className="mt-3 overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {`pnpm fixture:seed ${packId}`}
          </pre>
        </Card>
      ) : (
        <>
          <Card className="mt-8 flex flex-wrap items-center gap-3 p-4">
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">pack_id:</span> {snapshot.meta.pack_id}
            </div>
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">run_id:</span> {String(snapshot.meta.run_id ?? "(none)")}
            </div>
            <div className="ml-auto flex items-start gap-4">
              <div className="flex flex-wrap items-start justify-end gap-2">
                <ExportCsvButton
                  folderId={packId}
                  runId={runId}
                  kind="requirements_tracker"
                  label="Export requirements"
                />
                <ExportCsvButton folderId={packId} runId={runId} kind="exceptions_table" label="Export exceptions" />
                <ExportCsvButton folderId={packId} runId={runId} kind="survey_issues" label="Export survey issues" />
              </div>
              {traceExportEnabled ? <ExportTraceButton folderId={packId} runId={runId} /> : null}
            </div>
          </Card>

          {artefactsListEnabled ? (
            <div className="mt-8">
              <ArtefactsList folderId={packId} />
            </div>
          ) : null}

          <section className="mt-8 grid gap-4">
            {snapshot.rows.map((row) => (
              <Card key={row.question_id} className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <MonoId>{row.question_id}</MonoId>
                  <div className="text-sm font-semibold text-foreground">{row.question}</div>
                  <Badge variant={statusVariant(row.status)}>{row.status}</Badge>

                  {row.status === "needs_review" ? (
                    <div className="ml-auto flex items-center gap-2">
                      <form action={markRowReviewed}>
                        <input type="hidden" name="pack" value={packId} />
                        <input type="hidden" name="question_id" value={row.question_id} />
                        <Button variant="success" size="sm" type="submit">
                          Mark reviewed
                        </Button>
                      </form>
                    </div>
                  ) : null}
                </div>

                {reviewErrorCode && reviewErrorQid === row.question_id ? (
                  <Alert variant="destructive" title="Review not saved" className="mt-3">
                    {reviewErrorMessage(reviewErrorCode)}
                  </Alert>
                ) : reviewedQid === row.question_id && row.status === "reviewed" ? (
                  <Alert variant="success" title="Saved" className="mt-3">
                    Marked as reviewed.
                  </Alert>
                ) : null}

                <div className="mt-2 text-sm text-muted-foreground">{row.answer}</div>

                {row.notes ? (
                  <section className="mt-3 rounded-ui-md border border-border bg-muted p-3">
                    <div className="text-xs font-semibold text-foreground">Notes</div>
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-muted-foreground">{row.notes}</pre>
                  </section>
                ) : null}

                {row.payload_schema_version === "list_payload_v0" ? (
                  <ExceptionsPayload
                    packId={packId}
                    payload={(row as { payload_json?: unknown }).payload_json}
                    citations={snapshot.citations}
                  />
                ) : null}

                {row.status === "missing_input" ? (
                  <MissingDocsChecklist provenance={(row as { provenance_json?: unknown }).provenance_json} />
                ) : null}

                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <CitationChips packId={packId} citationIds={row.citation_ids} citations={snapshot.citations} />
                </div>
              </Card>
            ))}
          </section>
        </>
      )}
    </Page>
  );
}
```

### File: apps/web/app/(api)/citations/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  // Keep IDs intentionally constrained so we can safely validate and fail closed.
  // Fixture seed IDs look like: cit_TS-04_1, cit_TB_BAD_1
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^cit_[a-z0-9_-]+$/i, "Invalid citation id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for dev seed data where multiple packs may share ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function findCitationInSeedSnapshots(args: {
  citationId: string;
  packId?: string;
}):
  | { ok: true; citation: { document_id: string; page_number: number; polygons: unknown; snippet: string; snippet_hash: string } }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{
    pack_id: string;
    citation: {
      document_id: string;
      page_number: number;
      polygons: unknown;
      snippet: string;
      snippet_hash: string;
    };
  }> = [];

  for (const packId of packIds) {
    let snapshot: ReturnType<typeof loadSeedSnapshot> | null;
    try {
      snapshot = loadSeedSnapshot(packId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("loadSeedSnapshot failed", {
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
      return { ok: false, code: "INTERNAL", message: "Failed to load seed snapshot." };
    }
    if (!snapshot) continue;

    const cit = snapshot.citations?.[args.citationId];
    if (!cit) continue;

    hits.push({
      pack_id: packId,
      citation: {
        document_id: cit.document_id,
        page_number: cit.page_number,
        polygons: cit.polygons,
        snippet: cit.snippet,
        snippet_hash: cit.snippet_hash,
      },
    });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Citation not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "Citation id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.pack_id) },
    };
  }

  return { ok: true, citation: hits[0]!.citation };
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const citationId = parsedParams.data.id;

  const found = findCitationInSeedSnapshots({ citationId, packId: parsedQuery.data.pack });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  return Response.json(
    {
      citation: {
        id: citationId,
        document_id: found.citation.document_id,
        page_number: found.citation.page_number,
        polygons: found.citation.polygons,
        snippet: found.citation.snippet,
        snippet_hash: found.citation.snippet_hash,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/demo/load-pack/route.ts
```ts
import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDemoModeEnabledApi } from "../../../../lib/demoMode.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { orbitalMode } from "../../../../lib/runtimeMode";
import { refreshFolderState } from "../../../../lib/folderState.server";
import { enqueueDocumentIngest } from "../../../../lib/ingest/ingestQueue.server";
import { newId } from "../../../../lib/ids";
import { putObjectWriteOnce, validateStorageKey } from "../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  pack_id: z.enum(["pack_01_clean", "pack_02_missing_rea"]),
});

const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;

function packsRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../docs/08-example-data");
}

function listPackPdfFiles(packId: string): Array<{ filename: string; absPath: string; bytes: number }> {
  const root = packsRoot();
  const packDir = path.resolve(root, packId);
  if (!packDir.startsWith(root + path.sep)) throw new Error("PATH_TRAVERSAL");

  const docsDir = path.resolve(packDir, "docs");
  if (!docsDir.startsWith(packDir + path.sep)) throw new Error("PATH_TRAVERSAL");

  if (!fs.existsSync(docsDir)) return [];

  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  const pdfs = entries
    .filter((e) => e.isFile() && PDF_FILENAME_RE.test(e.name))
    .map((e) => {
      const absPath = path.join(docsDir, e.name);
      const st = fs.statSync(absPath);
      return { filename: e.name, absPath, bytes: st.size };
    })
    .filter((f) => f.bytes > 0)
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return pdfs;
}

function demoFolderName(packId: string): string {
  const ts = new Date().toISOString().replace(/:/g, "").replace(/\..*$/, "Z");
  return `DEMO: ${packId} ${ts}`;
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  // Demo toolbar remains dev-only, but pack loading is allowed in demo-prod.
  if (orbitalMode() === "dev") {
    const demoGate = assertDemoModeEnabledApi(traceId, headers);
    if (demoGate) return demoGate;
  }

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const packId = parsed.data.pack_id;

  let files: Array<{ filename: string; absPath: string; bytes: number }>;
  try {
    files = listPackPdfFiles(packId);
  } catch {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid pack path.",
        details: { pack_id: packId },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (files.length === 0) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Pack docs not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const folderId = newId("fld");
  const folderName = demoFolderName(packId);

  try {
    await sql`
      INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
      VALUES (${folderId}, ${folderName}, 'empty', 'v1', now(), now())
    `;

    const seededDocIds: string[] = [];
    for (const f of files) {
      const documentId = newId("doc");
      const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
      const keyValid = validateStorageKey(storageKey);
      if (!keyValid.ok) {
        throw new Error("INVALID_STORAGE_KEY");
      }

      await sql`
        INSERT INTO documents (
          id,
          folder_id,
          filename,
          mime,
          bytes,
          storage_key,
          parse_status,
          ocr_status,
          created_at,
          updated_at
        )
        VALUES (
          ${documentId},
          ${folderId},
          ${f.filename},
          'application/pdf',
          ${f.bytes},
          ${storageKey},
          'queued',
          'queued',
          now(),
          now()
        )
      `;

      const bytes = await fs.promises.readFile(f.absPath);
      const result = await putObjectWriteOnce({ storageKey, bytes: new Uint8Array(bytes) });

      await sql`
        UPDATE documents
        SET upload_completed_at = now(),
            sha256 = ${result.sha256},
            updated_at = now()
        WHERE id = ${documentId}
          AND upload_completed_at IS NULL
      `;

      seededDocIds.push(documentId);
    }

    await refreshFolderState(folderId);

    for (const docId of seededDocIds) {
      enqueueDocumentIngest(docId);
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("demo.load-pack failed", {
      trace_id: traceId,
      pack_id: packId,
      folder_id: folderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to load demo pack.", traceId }), {
      status: 500,
      headers,
    });
  }

  return Response.json(
    {
      folder: {
        id: folderId,
        name: folderName,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/export/csv/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, safeErrorEnvelope } from "@legaltech-poc/core";
import { z } from "zod";

import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../lib/trace.server";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { newId } from "../../../../lib/ids";
import {
  createSignedGetHeaders,
  putObject,
  validateArtefactCsvStorageKey,
} from "../../../../lib/objectStore.server";
import { csvFromSourceRow, ExportCsvKindSchema, reasonCodeFromProvenance } from "../../../../lib/exportCsv.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  folder_id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_-]+$/, "Invalid folder_id"),
  run_id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/, "Invalid run_id"),
  kind: ExportCsvKindSchema,
  unsafe_override: z.boolean().optional().default(false),
});

type DbRunRow = { id: string; state: string };

type DbReportRow = {
  id: string;
  question_id: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
};

type DbFailedRow = { question_id: string; provenance_json: unknown };

type DbCitationRow = { id: string; filename: string; page_number: number };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  // Unsafe exports must stay dev-only even if flags are accidentally set in production.
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function collectCitationIdsFromPayload(payloadSchemaVersion: string | null, payloadJson: unknown): string[] {
  if (payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) return [];
  const parsed = ListPayloadV0Schema.safeParse(payloadJson);
  if (!parsed.success) return [];
  const ids = parsed.data.items.flatMap((it) => it.citation_ids);
  return Array.from(new Set(ids));
}

function snapshotRowForKind(snapshot: NonNullable<ReturnType<typeof loadSeedSnapshot>>, kind: string): DbReportRow | null {
  const candidates: DbReportRow[] = [];

  for (const r of snapshot.rows ?? []) {
    const hasSchema = r.payload_schema_version !== null && String(r.payload_schema_version ?? "").trim() !== "";
    const hasPayload = r.payload_json !== null && r.payload_json !== undefined;
    if (hasSchema !== hasPayload) continue;
    if (!hasSchema) continue;

    if (r.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) continue;

    const parsed = ListPayloadV0Schema.safeParse(r.payload_json);
    if (!parsed.success) continue;
    if (parsed.data.kind !== kind) continue;

    candidates.push({
      id: `seed_row:${r.question_id}`,
      question_id: r.question_id,
      answer: r.answer,
      status: r.status,
      notes: typeof r.notes === "string" ? r.notes : null,
      provenance_json: (r as { provenance_json?: unknown }).provenance_json ?? {},
      payload_schema_version: r.payload_schema_version,
      payload_json: r.payload_json,
    });
  }

  candidates.sort((a, b) => a.question_id.localeCompare(b.question_id));
  return candidates[0] ?? null;
}

// Implements the target export contract (see docs/03-architecture/50_api_surface.md).
// In dev, we also support fixture-backed runs from tmp/fixture-seed for tracer bullets.
export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsed.data.folder_id;
  const runId = parsed.data.run_id;
  const kind = parsed.data.kind;
  const unsafeOverride = parsed.data.unsafe_override;

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is not allowed.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  // If the run exists in the DB, enforce run completion gating.
  const runs = await sql<DbRunRow[]>`
    SELECT id, state
    FROM runs
    WHERE id = ${runId}
      AND folder_id = ${folderId}
    LIMIT 1
  `;
  const run = runs[0] ?? null;
  if (run && run.state !== "completed") {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "Run is not completed yet.",
        details: { run_id: runId, state: run.state },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  let sourceRow: DbReportRow | null = null;
  let citationById = new Map<string, { filename: string; page: number }>();

  if (run) {
    // Target contract: block export if ANY row in the run is citation_failed unless unsafe_override=true.
    if (!unsafeOverride) {
      const failed = await sql<DbFailedRow[]>`
        SELECT question_id, provenance_json
        FROM report_rows
        WHERE run_id = ${runId}
          AND status = 'citation_failed'
        ORDER BY question_id ASC
        LIMIT 200
      `;

      if (failed.length > 0) {
        const reasonCodes = Array.from(
          new Set(
            failed
              .map((r) => reasonCodeFromProvenance(r.provenance_json) ?? "VALIDATION_ERROR")
              .filter((c) => typeof c === "string" && c.trim()),
          ),
        ).sort();

        return Response.json(
          safeErrorEnvelope({
            code: "EXPORT_BLOCKED",
            message: `Export blocked: ${failed.length} row(s) failed verification.`,
            details: {
              citation_failed_count: failed.length,
              failed_question_ids: failed.map((r) => r.question_id).slice(0, 50),
              reason_codes: reasonCodes,
            },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }

    const rows = await sql<DbReportRow[]>`
      SELECT id, question_id, answer, status, notes, provenance_json, payload_schema_version, payload_json
      FROM report_rows
      WHERE run_id = ${runId}
        AND payload_schema_version IS NOT NULL
        AND payload_json IS NOT NULL
        AND payload_json->>'kind' = ${kind}
      ORDER BY question_id ASC
      LIMIT 2
    `;
    if (rows.length === 0) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export requires structured payload_json, but no matching row was found.",
          details: { run_id: runId, kind, dependency: "Initiative 002" },
          traceId,
        }),
        { status: 409, headers },
      );
    }
    if (rows.length > 1) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export found multiple structured payload rows for this kind.",
          details: { run_id: runId, kind, row_ids: rows.map((r) => r.id) },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    sourceRow = rows[0] ?? null;

    const citationIds = collectCitationIdsFromPayload(sourceRow.payload_schema_version, sourceRow.payload_json);
    if (citationIds.length) {
      const cits = await sql<DbCitationRow[]>`
        SELECT c.id, d.filename, c.page_number
        FROM citations c
        JOIN report_rows r ON r.id = c.report_row_id
        JOIN documents d ON d.id = c.document_id
        WHERE c.id = ANY(${citationIds})
          AND r.run_id = ${runId}
      `;
      const byId = new Map<string, { filename: string; page: number }>();
      for (const c of cits) {
        byId.set(c.id, { filename: c.filename, page: c.page_number });
      }
      citationById = byId;

      const missing = citationIds.filter((id) => !citationById.has(id));
      if (missing.length) {
        return Response.json(
          safeErrorEnvelope({
            code: "CONFLICT",
            message: "Export requires locked citations, but some citation_ids were missing.",
            details: { missing_citation_ids: missing.slice(0, 25) },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }
  } else {
    // Fixture-backed tracer bullets: folder_id maps to pack_id.
    const snapshot = /^pack_\d{2}_[a-z0-9_]+$/i.test(folderId) ? loadSeedSnapshot(folderId) : null;
    if (!snapshot) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const metaRunId = isRecord(snapshot.meta) && typeof snapshot.meta.run_id === "string" ? snapshot.meta.run_id : null;
    if (metaRunId && metaRunId !== runId) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "run_id did not match seeded snapshot.",
          details: { expected: metaRunId },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    sourceRow = snapshotRowForKind(snapshot, kind);
    if (!sourceRow) {
      return Response.json(
        safeErrorEnvelope({
          code: "CONFLICT",
          message: "Export requires structured payload_json, but no matching row was found.",
          details: { run_id: runId, kind, dependency: "Initiative 002" },
          traceId,
        }),
        { status: 409, headers },
      );
    }

    if (!unsafeOverride) {
      const failed = (snapshot.rows ?? []).filter((r) => r?.status === "citation_failed");
      if (failed.length > 0) {
        return Response.json(
          safeErrorEnvelope({
            code: "EXPORT_BLOCKED",
            message: `Export blocked: ${failed.length} row(s) failed verification.`,
            details: {
              citation_failed_count: failed.length,
              failed_question_ids: failed
                .map((r) => String((r as { question_id?: unknown }).question_id ?? ""))
                .filter((s) => s.trim())
                .slice(0, 50),
            },
            traceId,
          }),
          { status: 409, headers },
        );
      }
    }

    for (const [citationId, cit] of Object.entries(snapshot.citations ?? {})) {
      if (!cit || typeof cit !== "object") continue;
      const filename = (cit as { document_filename?: unknown }).document_filename;
      const page = (cit as { page_number?: unknown }).page_number;
      if (typeof filename !== "string" || !filename.trim()) continue;
      if (typeof page !== "number" || !Number.isFinite(page) || page <= 0) continue;
      citationById.set(citationId, { filename: filename.trim(), page: Math.trunc(page) });
    }
  }

  if (!sourceRow) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const failureCode =
    sourceRow.status === "citation_failed" ? reasonCodeFromProvenance(sourceRow.provenance_json) ?? "VALIDATION_ERROR" : "";

  let csv: string;
  try {
    csv = csvFromSourceRow({
      kind,
      sourceRow: {
        source_question_id: sourceRow.question_id,
        row_status: sourceRow.status,
        source_answer: sourceRow.answer,
        failure_code: failureCode,
        notes: sourceRow.notes ?? null,
      },
      payloadSchemaVersion: sourceRow.payload_schema_version,
      payloadJson: sourceRow.payload_json,
      citationById,
      unsafeOverride,
    });
  } catch (err) {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "Export failed to map structured payload to CSV.",
        details: { kind, message: err instanceof Error ? err.message : String(err) },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  const filename = unsafeOverride ? `${kind}.UNSAFE.csv` : `${kind}.csv`;

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await putObject({ storageKey, bytes: Buffer.from(csv, "utf8") });

  // Ensure the folder exists so artefacts list/download works for fixture-backed exports.
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${folderId}, 'ready', 'v1', now(), now())
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO artefacts (
      id,
      folder_id,
      type,
      kind,
      filename,
      storage_key,
      source_run_id,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      ${artefactId},
      ${folderId},
      'csv',
      ${kind},
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({ schema_version: "csv_schemas_v1", unsafe_override: unsafeOverride })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `${origin}/artefacts/${artefactId}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: traceId,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "csv",
        kind,
        filename,
        storage_key: storageKey,
        source_run_id: runId,
        created_at: createdAt.toISOString(),
        download_url: downloadUrl,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/export/docx/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0Schema,
  safeErrorEnvelope,
  type ListPayloadV0,
} from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { newId } from "../../../../lib/ids";
import { createSignedGetHeaders, putObject, validateArtefactDocxStorageKey } from "../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../lib/trace.server";
import { renderMemoDocx, type MemoCitation } from "../../../../lib/memoDocx.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  folder_id: z.string().trim().min(1),
  run_id: z.string().trim().min(1).max(200),
  kind: z.literal("memo"),
  unsafe_override: z.boolean().optional().default(false),
});

type FolderRow = {
  id: string;
  name: string;
};

type RunRow = {
  id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  status: string;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
};

type CitationRow = {
  id: string;
  document_id: string;
  document_filename: string | null;
  page_number: number;
};

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  // Unsafe exports must stay dev-only even if flags are accidentally set in production.
  if (process.env.NODE_ENV !== "development") return false;
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const rec = provenance as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const verify = rec.verify;
  if (verify && typeof verify === "object" && !Array.isArray(verify)) {
    const code = (verify as Record<string, unknown>).reason_code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  const verification = rec.verification;
  if (verification && typeof verification === "object" && !Array.isArray(verification)) {
    const code = (verification as Record<string, unknown>).reason_code;
    if (typeof code === "string" && code.trim()) return code.trim();
  }

  return null;
}

function safeParseChecklist(provenance: unknown): string[] {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return [];
  const rec = provenance as Record<string, unknown>;
  const raw = rec.missing_docs_checklist;
  if (!Array.isArray(raw)) return [];

  const out: string[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const label = (item as Record<string, unknown>).label;
    if (typeof label === "string" && label.trim()) out.push(label.trim());
  }
  return out;
}

function requireListPayload(row: ReportRow, expectedKind: ListPayloadV0["kind"]): ListPayloadV0 {
  if (row.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(`MISSING_PAYLOAD_SCHEMA:${row.question_id}:${String(row.payload_schema_version ?? "null")}`);
  }
  const parsed = ListPayloadV0Schema.safeParse(row.payload_json);
  if (!parsed.success) {
    throw new Error(`INVALID_PAYLOAD_JSON:${row.question_id}`);
  }
  if (parsed.data.kind !== expectedKind) {
    throw new Error(`PAYLOAD_KIND_MISMATCH:${row.question_id}:${parsed.data.kind}:${expectedKind}`);
  }
  return parsed.data;
}

function collectCitationIds(payload: ListPayloadV0): string[] {
  const ids: string[] = [];
  for (const it of payload.items) {
    for (const cid of it.citation_ids) ids.push(cid);
  }
  return ids;
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedBody.data.folder_id;
  const runId = parsedBody.data.run_id;
  const unsafeOverride = parsedBody.data.unsafe_override;

  const folders = await sql<FolderRow[]>`
    SELECT id, name
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runs = await sql<RunRow[]>`
    SELECT id, state, index_version, agent_bundle_version, question_set_version
    FROM runs
    WHERE id = ${runId}
      AND folder_id = ${folderId}
    LIMIT 1
  `;
  const run = runs[0] ?? null;
  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (run.state !== "completed") {
    return Response.json(
      safeErrorEnvelope({ code: "CONFLICT", message: "Export is only available for completed runs.", traceId }),
      { status: 409, headers },
    );
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, status, provenance_json, payload_schema_version, payload_json
    FROM report_rows
    WHERE run_id = ${runId}
    ORDER BY question_id ASC
  `;

  const citationFailures = rows
    .filter((r) => r.status === "citation_failed")
    .map((r) => ({
      question_id: r.question_id,
      reason_code: extractReasonCode(r.provenance_json) ?? "VALIDATION_ERROR",
    }));

  if (citationFailures.length > 0 && !unsafeOverride) {
    return Response.json(
      safeErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${citationFailures.length} row(s) failed verification.`,
        details: {
          citation_failed_count: citationFailures.length,
          failed_question_ids: citationFailures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(citationFailures.map((f) => f.reason_code))).sort(),
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is demo-only.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  const requirementsRow = rows.find((r) => r.question_id === "TS-03") ?? null;
  const exceptionsRow = rows.find((r) => r.question_id === "TS-04") ?? null;
  const surveyIssuesRow = rows.find((r) => r.question_id === "TS-09") ?? null;

  if (!requirementsRow || !exceptionsRow || !surveyIssuesRow) {
    return Response.json(
      safeErrorEnvelope({
        code: "INTERNAL",
        message: "Export requires list-shaped report rows.",
        details: {
          missing_question_ids: ["TS-03", "TS-04", "TS-09"].filter(
            (qid) => !rows.some((r) => r.question_id === qid),
          ),
        },
        traceId,
      }),
      { status: 500, headers },
    );
  }

  let requirements: ListPayloadV0;
  let exceptions: ListPayloadV0;
  let surveyIssues: ListPayloadV0;
  try {
    requirements = requireListPayload(requirementsRow, "requirements_tracker");
    exceptions = requireListPayload(exceptionsRow, "exceptions_table");
    surveyIssues = requireListPayload(surveyIssuesRow, "survey_issues");
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return Response.json(
      safeErrorEnvelope({
        code: "INTERNAL",
        message: "Export requires structured list payloads.",
        details: { reason: message },
        traceId,
      }),
      { status: 500, headers },
    );
  }

  const missingInputs = rows
    .filter((r) => r.status === "missing_input")
    .slice()
    .sort((a, b) => a.question_id.localeCompare(b.question_id))
    .map((r) => ({
      question_id: r.question_id,
      question: r.question,
      checklist: safeParseChecklist(r.provenance_json),
    }));

  const uniqueCitationIds = new Set<string>();
  for (const cid of collectCitationIds(requirements)) uniqueCitationIds.add(cid);
  for (const cid of collectCitationIds(exceptions)) uniqueCitationIds.add(cid);
  for (const cid of collectCitationIds(surveyIssues)) uniqueCitationIds.add(cid);
  const citationIds = Array.from(uniqueCitationIds);

  const citationsById = new Map<string, MemoCitation>();
  if (citationIds.length) {
    const citations = await sql<CitationRow[]>`
      SELECT c.id, c.document_id, d.filename as document_filename, c.page_number
      FROM citations c
      INNER JOIN report_rows r ON r.id = c.report_row_id
      LEFT JOIN documents d ON d.id = c.document_id
      WHERE c.id = ANY(${citationIds})
        AND r.run_id = ${runId}
        AND r.folder_id = ${folderId}
    `;

    for (const c of citations) {
      citationsById.set(c.id, {
        id: c.id,
        document_filename: c.document_filename ?? c.document_id,
        page_number: c.page_number,
      });
    }

    const missing = citationIds.filter((cid) => !citationsById.has(cid));
    if (missing.length) {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Export could not resolve locked citations.",
          details: { missing_citation_ids: missing.slice(0, 25), missing_count: missing.length },
          traceId,
        }),
        { status: 500, headers },
      );
    }
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  let bytes: Uint8Array;
  try {
    bytes = await renderMemoDocx({
      folder,
      run,
      generatedAt: createdAt,
      requirements,
      exceptions,
      surveyIssues,
      missingInputs,
      citationsById,
    });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("export.docx.render failed", {
      trace_id: traceId,
      folder_id: folderId,
      run_id: runId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to render memo docx.", traceId }), {
      status: 500,
      headers,
    });
  }

  const filename = unsafeOverride ? "memo.UNSAFE.docx" : "memo.docx";
  const storageKey = `folders/${folderId}/artefacts/${artefactId}.docx`;
  const keyOk = validateArtefactDocxStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }),
      { status: 500, headers },
    );
  }

  await putObject({ storageKey, bytes });

  await sql`
    INSERT INTO artefacts (
      id,
      folder_id,
      type,
      kind,
      filename,
      storage_key,
      source_run_id,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      ${artefactId},
      ${folderId},
      'docx',
      'memo',
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({
        template: "memo_v1",
        question_ids: ["TS-03", "TS-04", "TS-09"],
        unsafe_override: unsafeOverride,
      })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `${origin}/artefacts/${artefactId}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: traceId,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "docx",
        kind: "memo",
        filename,
        storage_key: storageKey,
        source_run_id: runId,
        created_at: createdAt.toISOString(),
        download_url: downloadUrl,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/folders/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../lib/folderState.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  // Keep folder state consistent with latest persisted facts.
  await refreshFolderState(folderId);

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  return Response.json(
    {
      folder: {
        id: folder.id,
        name: folder.name,
        state: folder.state,
        latest_index_version: folder.latest_index_version,
        created_at: folder.created_at.toISOString(),
        updated_at: folder.updated_at.toISOString(),
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/runs/[id]/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1).max(200),
});

function asFailureCounts(val: unknown): Record<string, number> {
  if (!val || typeof val !== "object" || Array.isArray(val)) return {};
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(val as Record<string, unknown>)) {
    if (typeof k !== "string" || !k) continue;
    if (typeof v === "number" && Number.isFinite(v) && v > 0) out[k] = Math.floor(v);
  }
  return out;
}

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const runId = parsedParams.data.id;
  const runs = await sql<
    Array<{
      id: string;
      state: string;
      index_version: string;
      agent_bundle_version: string;
      question_set_version: string;
      questions_total: number;
      questions_done: number;
      failure_counts_json: unknown;
    }>
  >`
    SELECT id, state, index_version, agent_bundle_version, question_set_version, questions_total, questions_done, failure_counts_json
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
        progress: {
          questions_total: run.questions_total ?? 0,
          questions_done: run.questions_done ?? 0,
        },
        failure_counts: asFailureCounts(run.failure_counts_json),
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/spikes/local-pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { LocalPdfQuerySchema, safeErrorEnvelope } from "@legaltech-poc/core";

import { parseSingleRangeHeader } from "../../../../lib/httpRange.server";
import { safePdfFilename } from "../../../../lib/safePdfFilename.server";
import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers: traceHeaders } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, traceHeaders);
  if (spikesGate) return spikesGate;

  const url = new URL(req.url);
  const parsed = LocalPdfQuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers: traceHeaders },
    );
  }

  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
  const candidate = path.resolve(packRoot, parsed.data.pack, "docs", parsed.data.filename);
  if (!candidate.startsWith(packRoot + path.sep)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }),
      { status: 400, headers: traceHeaders },
    );
  }

  let stat: fs.Stats;
  try {
    stat = fs.statSync(candidate);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
      status: 404,
      headers: traceHeaders,
    });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  const headers = new Headers(traceHeaders);
  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(parsed.data.filename)}"`);
  headers.set("Cache-Control", "no-store");

  if (!rangeHeader) {
    headers.set("Content-Length", String(size));
    const nodeStream = fs.createReadStream(candidate);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
  }

  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));

  const nodeStream = fs.createReadStream(candidate, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
}
```

### File: apps/web/app/(api)/spikes/rh4-verify/route.ts
```ts
import { safeErrorEnvelope, VerifyInputSchema } from "@legaltech-poc/core";
import { verifyRow } from "@legaltech-poc/core/server";

import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }),
      { status: 400, headers },
    );
  }

  const parsed = VerifyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match VerifyInput schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const result = await verifyRow(parsed.data, { mode: "deterministic-only" });
  return Response.json(result, { status: 200, headers });
}
```

### File: apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
```tsx
"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "../../../ui/Button";
import { InlineStatus } from "../../../ui/InlineStatus";
import { Input } from "../../../ui/Input";

type Props = {
  folderId: string;
  runId: string | null;
  runState: string | null;
  unsafeOverrideEnabled: boolean;
};

type ExportBlockedDetails = {
  citationFailedCount: number;
  failedQuestionIds: string[];
  reasonCodes: string[];
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string; details: ExportBlockedDetails }
  | { kind: "error"; message: string }
  | { kind: "done"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): { code: string; message: string; details: unknown } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message, details: (env as { details?: unknown }).details };
}

function parseBlockedDetails(details: unknown): ExportBlockedDetails | null {
  if (!isRecord(details)) return null;
  const rawCount = details.citation_failed_count;
  const citationFailedCount = typeof rawCount === "number" && Number.isFinite(rawCount) ? rawCount : null;

  const failedQuestionIds = Array.isArray(details.failed_question_ids)
    ? details.failed_question_ids
        .filter((qid): qid is string => typeof qid === "string")
        .map((qid) => qid.trim())
        .filter(Boolean)
    : [];

  const reasonCodes = Array.isArray(details.reason_codes)
    ? details.reason_codes
        .filter((code): code is string => typeof code === "string")
        .map((code) => code.trim())
        .filter(Boolean)
    : [];

  if (citationFailedCount === null) return null;
  return { citationFailedCount, failedQuestionIds, reasonCodes };
}

function disabledReason(props: Props): string | null {
  if (!props.runId) return "Export is disabled until a run exists.";
  if (props.runState !== "completed") return `Export is disabled until the run completes (current: ${props.runState ?? "unknown"}).`;
  return null;
}

export function ExportMemoButton(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [adminToken, setAdminToken] = useState("");

  const disabled = disabledReason(props);

  const reportHref = props.runId
    ? `/folders/${encodeURIComponent(props.folderId)}/report?${new URLSearchParams({
        run_id: props.runId,
      }).toString()}`
    : null;

  async function run(args: { unsafeOverride: boolean }) {
    if (disabled) return;
    if (!props.runId) return;

    if (args.unsafeOverride) {
      const token = adminToken.trim();
      if (!token) {
        setState({ kind: "error", message: "Admin token required for unsafe export." });
        return;
      }
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      const token = adminToken.trim();
      res = await fetch("/export/docx", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(args.unsafeOverride ? { "x-orbital-admin-token": token } : {}),
        },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: "memo",
          unsafe_override: args.unsafeOverride,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const env = readSafeError(json);
      if (env) {
        if (env.code === "EXPORT_BLOCKED") {
          const details = parseBlockedDetails(env.details);
          setState({
            kind: "blocked",
            message: env.message,
            details: details ?? { citationFailedCount: 0, failedQuestionIds: [], reasonCodes: [] },
          });
          return;
        }
        setState({ kind: "error", message: `${env.code}: ${env.message}` });
        return;
      }
      setState({ kind: "error", message: `Request failed (${res.status}).` });
      return;
    }

    setState({ kind: "done", message: "Memo exported. See Artefacts for download." });
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      {state.kind === "blocked" ? (
        <div className="w-full max-w-sm rounded-ui-md border border-destructive/20 bg-destructive/[0.06] p-3 text-xs text-destructive">
          <div className="font-semibold">Export blocked</div>
          <div className="mt-1">
            {state.details.citationFailedCount} row(s) are <span className="font-mono">citation_failed</span>.
          </div>

          {state.details.failedQuestionIds.length ? (
            <div className="mt-2">
              Failed:{" "}
              <span className="font-mono">
                {state.details.failedQuestionIds.slice(0, 6).join(", ")}
                {state.details.failedQuestionIds.length > 6 ? "…" : ""}
              </span>
            </div>
          ) : null}

          {reportHref ? (
            <div className="mt-2">
              <a className="font-medium underline" href={reportHref} target="_blank" rel="noreferrer">
                Next: open Report JSON to fix citations
              </a>
            </div>
          ) : (
            <div className="mt-2">Next: open the run report to fix citations.</div>
          )}

          {props.unsafeOverrideEnabled ? (
            <div className="mt-3 rounded-ui-md border border-destructive/20 bg-card p-2">
              <div className="text-2xs font-semibold uppercase tracking-wide text-destructive">Unsafe export (demo only)</div>
              <div className="mt-2 flex flex-wrap items-center justify-between gap-2">
                <label className="flex flex-wrap items-center gap-2">
                  <span className="text-xs text-muted-foreground">Admin token</span>
                  <Input
                    className="w-44 font-mono"
                    uiSize="sm"
                    type="password"
                    value={adminToken}
                    onChange={(e) => setAdminToken(e.target.value)}
                    placeholder="x-orbital-admin-token"
                    autoComplete="off"
                    spellCheck={false}
                  />
                </label>

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => run({ unsafeOverride: true })}
                  disabled={Boolean(disabled)}
                >
                  Export UNSAFE memo
                </Button>
              </div>
              <div className="mt-2 text-2xs text-destructive">
                This will create <span className="font-mono">memo.UNSAFE.docx</span> even if citations failed.
              </div>
            </div>
          ) : null}
        </div>
      ) : null}

      <Button
        variant="neutral"
        size="sm"
        onClick={() => run({ unsafeOverride: false })}
        disabled={Boolean(disabled)}
        loading={state.kind === "loading"}
      >
        Export memo (Word)
      </Button>

      {disabled ? <div className="text-xs text-muted-foreground">{disabled}</div> : null}

      <InlineStatus kind={state.kind === "error" ? "error" : "idle"}>{state.kind === "error" ? state.message : null}</InlineStatus>
      <InlineStatus kind={state.kind === "done" ? "success" : "idle"}>{state.kind === "done" ? state.message : null}</InlineStatus>
    </div>
  );
}
```

### File: apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
```tsx
"use client";

import { useState } from "react";

import { Button } from "../../../ui/Button";
import { InlineStatus } from "../../../ui/InlineStatus";

type Props = {
  folderId: string;
  disabledReason: string | null;
};

type QuickStartState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "started"; runId: string; runState: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): { code: string; message: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message };
}

export function QuickStartPanel(props: Props) {
  const [state, setState] = useState<QuickStartState>({ kind: "idle" });

  async function start() {
    if (props.disabledReason) return;
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "demo-quick-start",
        },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const env = readSafeError(json);
      if (env) {
        setState({ kind: "error", message: `${env.code}: ${env.message}` });
        return;
      }
      setState({ kind: "error", message: `Request failed (${res.status}).` });
      return;
    }

    const run = isRecord(json) && isRecord(json.run) ? json.run : null;
    const runId = run && typeof run.id === "string" ? run.id : null;
    const runState = run && typeof run.state === "string" ? run.state : "running";
    if (!runId) {
      setState({ kind: "error", message: "Missing run.id in response." });
      return;
    }

    setState({ kind: "started", runId, runState });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        size="sm"
        onClick={start}
        disabled={Boolean(props.disabledReason)}
        loading={state.kind === "loading"}
      >
        Run Quick Start
      </Button>

      {props.disabledReason ? <div className="text-xs text-muted-foreground">{props.disabledReason}</div> : null}

      <InlineStatus kind={state.kind === "error" ? "error" : "idle"}>
        {state.kind === "error" ? state.message : null}
      </InlineStatus>

      {state.kind === "started" ? (
        <div className="grid gap-1 text-right text-xs text-muted-foreground">
          <div>
            run: <span className="font-mono">{state.runId}</span> ({state.runState})
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <a
              className="underline hover:text-foreground"
              href={`/runs/${encodeURIComponent(state.runId)}`}
              target="_blank"
              rel="noreferrer"
            >
              Run JSON
            </a>
            <a
              className="underline hover:text-foreground"
              href={`/folders/${encodeURIComponent(props.folderId)}/report?${new URLSearchParams({
                run_id: state.runId,
              }).toString()}`}
              target="_blank"
              rel="noreferrer"
            >
              Report JSON
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
```

### File: apps/web/app/(app)/matters/[id]/page.tsx
```tsx
import { z } from "zod";

import Link from "next/link";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { ensureSchema, sql } from "../../../../lib/db.server";
import { createSignedGetHeaders, validateStorageKey } from "../../../../lib/objectStore.server";

import { Card } from "../../../ui/Card";
import { EmptyState } from "../../../ui/EmptyState";
import { MonoId } from "../../../ui/MonoId";
import { Page, PageHeader, SectionTitle } from "../../../ui/Page";
import { ProgressBar } from "../../../ui/ProgressBar";
import { ArtefactsList } from "../ArtefactsList";
import { ExportCsvButton } from "../ExportCsvButton";

import { ExportMemoButton } from "./ExportMemoButton";
import { QuickStartPanel } from "./QuickStartPanel";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type FolderRow = {
  id: string;
  name: string;
  state: string;
  latest_index_version: string;
  created_at: Date;
  updated_at: Date;
};

type DocRow = {
  id: string;
  filename: string;
  storage_key: string | null;
  upload_completed_at: Date | null;
  parse_status: string;
  ocr_status: string;
  page_count: number | null;
  extraction_quality: number | null;
  error_json: unknown | null;
  created_at: Date;
};

type RunSummaryRow = {
  id: string;
  state: string;
  questions_total: number;
  questions_done: number;
  created_at: Date;
  updated_at: Date;
};

function renderUrl(doc: DocRow): string | null {
  if (!doc.storage_key || !doc.upload_completed_at) return null;
  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) return null;

  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  return `/documents/${encodeURIComponent(doc.id)}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;
}

export default async function MatterPage(props: { params: Promise<Record<string, string | string[] | undefined>> }) {
  assertDevOrDemoProd();

  const rawParams = await props.params;
  const parsed = ParamsSchema.safeParse(rawParams);
  if (!parsed.success) {
    return (
      <Page>
        <PageHeader title="Matter" subtitle="Invalid route params." />
      </Page>
    );
  }

  await ensureSchema();

  const folderId = parsed.data.id;
  const folders = await sql<FolderRow[]>`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0] ?? null;
  if (!folder) {
    return (
      <Page>
        <PageHeader title="Matter" subtitle="Matter not found." />
      </Page>
    );
  }

  const docs = await sql<DocRow[]>`
    SELECT id, filename, storage_key, upload_completed_at, parse_status, ocr_status, page_count, extraction_quality, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  const runs = await sql<RunSummaryRow[]>`
    SELECT id, state, questions_total, questions_done, created_at, updated_at
    FROM runs
    WHERE folder_id = ${folderId}
      AND type = 'quick_start_title_survey'
    ORDER BY created_at DESC
    LIMIT 1
  `;
  const latestRun = runs[0] ?? null;

  const artefactsListEnabled = process.env.FEATURE_ARTEFACTS_LIST === "1";
  const completedRunId = latestRun?.state === "completed" ? latestRun.id : null;

  const runnable = folder.state === "indexed" || folder.state === "ready";
  let quickStartDisabledReason: string | null = null;
  if (latestRun) {
    quickStartDisabledReason =
      "Quick Start already started for this matter. Load the pack again to create a fresh matter (no cleanup).";
  } else if (!runnable) {
    quickStartDisabledReason = `Quick Start is disabled until the matter is indexed/ready (current state: ${folder.state}). Refresh in a moment.`;
  }

  const unsafeOverrideEnabled =
    process.env.DEMO_MODE === "1" &&
    process.env.ALLOW_UNSAFE_EXPORTS === "1" &&
    Boolean(process.env.ORBITAL_ADMIN_TOKEN?.trim());

  return (
    <Page>
      <PageHeader
        title="Matter"
        subtitle={
          <span className="flex flex-wrap items-center gap-2">
            <MonoId>{folder.id}</MonoId>
            <span className="text-muted-foreground/60">•</span>
            <span className="font-medium text-foreground">{folder.name}</span>
            <span className="text-muted-foreground/60">•</span>
            <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
              {folder.state}
            </span>
          </span>
        }
        right={
          <Link className="text-xs font-medium text-muted-foreground underline hover:text-foreground" href="/matters">
            Back to matters
          </Link>
        }
      />

      <Card className="mt-8 p-4">
        <SectionTitle>Seeded documents</SectionTitle>
        <p className="mt-1 text-xs text-muted-foreground">
          This matter was created by the demo pack loader. Documents ingest in the background.
        </p>

        {docs.length === 0 ? (
          <EmptyState title="No documents" description="Documents will appear here once the demo pack finishes ingesting." />
        ) : (
          <div className="mt-4 grid gap-2">
            {docs.map((d) => {
              const url = renderUrl(d);
              const ingest = `${d.parse_status}/${d.ocr_status}`;
              return (
                <div key={d.id} className="rounded-ui-md border border-border bg-muted p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <MonoId variant="inverted">{d.id}</MonoId>
                      <div className="text-sm font-medium text-foreground">{d.filename}</div>
                      <div className="rounded-full bg-card px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                        {ingest}
                      </div>
                      {typeof d.extraction_quality === "number" ? (
                        <div className="text-xs text-muted-foreground">
                          quality: {Math.round(d.extraction_quality * 100)}%
                        </div>
                      ) : null}
                      {typeof d.page_count === "number" ? (
                        <div className="text-xs text-muted-foreground">pages: {d.page_count}</div>
                      ) : null}
                    </div>

                    {url ? (
                      <a
                        className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                        href={url}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open PDF
                      </a>
                    ) : (
                      <div className="text-xs text-muted-foreground">PDF not ready</div>
                    )}
                  </div>

                  {d.error_json ? (
                    <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                      {JSON.stringify(d.error_json, null, 2)}
                    </pre>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle>Quick Start</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Start the Quick Start run for this matter. To run the same demo again, load the pack again to create a
              fresh matter.
            </p>
          </div>

          <QuickStartPanel folderId={folderId} disabledReason={quickStartDisabledReason} />
        </div>

        {latestRun ? (
          <div className="mt-4 grid gap-1 text-xs text-muted-foreground">
            <div>
              latest run: <span className="font-mono">{latestRun.id}</span> ({latestRun.state})
            </div>
            <div>
              progress: {latestRun.questions_done}/{latestRun.questions_total} questions
            </div>
            {latestRun.questions_total > 0 ? (
              <ProgressBar value={Math.round((latestRun.questions_done / latestRun.questions_total) * 100)} className="mt-1" />
            ) : null}
            <div className="flex flex-wrap gap-3">
              <a
                className="underline hover:text-foreground"
                href={`/runs/${encodeURIComponent(latestRun.id)}`}
                target="_blank"
                rel="noreferrer"
              >
                Run JSON
              </a>
              <a
                className="underline hover:text-foreground"
                href={`/folders/${encodeURIComponent(folderId)}/report?${new URLSearchParams({
                  run_id: latestRun.id,
                }).toString()}`}
                target="_blank"
                rel="noreferrer"
              >
                Report JSON
              </a>
            </div>
            <div className="text-xs text-muted-foreground">
              created: {latestRun.created_at.toISOString()} • updated: {latestRun.updated_at.toISOString()}
            </div>
          </div>
        ) : (
          <EmptyState title="No runs yet" description="Start a Quick Start run to analyse this matter." />
        )}
      </Card>

      <Card className="mt-8 p-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <SectionTitle>Exports</SectionTitle>
            <p className="mt-1 text-xs text-muted-foreground">
              Export a Word memo (.docx) and CSV artefacts for the latest completed run. Exports are disabled until a run
              completes.
            </p>
          </div>

          <div className="grid justify-items-end gap-2">
            <ExportMemoButton
              folderId={folderId}
              runId={latestRun?.id ?? null}
              runState={latestRun?.state ?? null}
              unsafeOverrideEnabled={unsafeOverrideEnabled}
            />
            <div className="flex flex-wrap items-start justify-end gap-2">
              <ExportCsvButton
                folderId={folderId}
                runId={completedRunId}
                kind="requirements_tracker"
                label="Export requirements"
              />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="exceptions_table" label="Export exceptions" />
              <ExportCsvButton folderId={folderId} runId={completedRunId} kind="survey_issues" label="Export survey issues" />
            </div>
          </div>
        </div>
      </Card>

      {artefactsListEnabled ? (
        <div className="mt-8">
          <ArtefactsList folderId={folderId} />
        </div>
      ) : null}
    </Page>
  );
}
```

### File: apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
```tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPolygons,
  type PdfJsViewportLike,
  type ViewBox,
} from "@legaltech-poc/core";
import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Select } from "../../../ui/Input";

type Props = {
  packId: string;
  citationId: string;
  pdfUrl: string;
  documentId: string;
  pageNumber: number;
  polygons: NormPolygons;
  snippet: string;
  snippetHash: string;
  computedSnippetHash: string;
  errorCode: string | null;
};

type PdfRenderTask = {
  promise: Promise<void>;
  cancel?: () => void;
};

type PdfPageLike = {
  rotate?: number;
  view?: unknown;
  getViewport: (args: { scale: number; rotation: number }) => PdfJsViewportLike;
  render: (args: {
    canvasContext: CanvasRenderingContext2D;
    viewport: PdfJsViewportLike;
    transform?: readonly [number, number, number, number, number, number];
  }) => PdfRenderTask;
};

type PdfDocLike = {
  numPages?: number;
  getPage: (pageNumber: number) => Promise<PdfPageLike>;
};

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: { url: string }) => { promise: Promise<PdfDocLike> };
};

function coerceViewBox(view: unknown): ViewBox {
  if (Array.isArray(view) && view.length >= 4) {
    const [xMin, yMin, xMax, yMax] = view;
    if (
      typeof xMin === "number" &&
      Number.isFinite(xMin) &&
      typeof yMin === "number" &&
      Number.isFinite(yMin) &&
      typeof xMax === "number" &&
      Number.isFinite(xMax) &&
      typeof yMax === "number" &&
      Number.isFinite(yMax)
    ) {
      return [xMin, yMin, xMax, yMax] as const;
    }
  }
  throw new Error("INVALID_VIEWBOX");
}

export function CitationViewerClient(props: Props) {
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<PdfDocLike | null>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);

  const [overlay, setOverlay] = useState<CssPolygons>([]);
  const renderTaskRef = useRef<PdfRenderTask | null>(null);

  const [hud, setHud] = useState<{
    pageRotate: number | null;
    totalRotation: number | null;
    viewport: { width: number; height: number } | null;
    overlayBbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    errorCode: string | null;
    pdfjsVersion: string | null;
  }>({
    pageRotate: null,
    totalRotation: null,
    viewport: null,
    overlayBbox: null,
    errorCode: props.errorCode,
    pdfjsVersion: null,
  });

  const polygonError = validateNormPolygons(props.polygons);
  const highlightActive = props.errorCode === null && polygonError === null;
  const effectiveZoomPercent = highlightActive ? 100 : zoomPercent;

  // Cut: highlight overlays are verified at 100% only. Snap to 100% and
  // disable zoom while highlight is active to avoid accidental drift.
  useEffect(() => {
    if (!highlightActive) return;
    if (zoomPercent !== 100) setZoomPercent(100);
  }, [highlightActive, zoomPercent]);

  // Load pdf.js + PDF
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdf(null);
      setPdfPageCount(null);
      setOverlay([]);
      setHud((h) => ({ ...h, errorCode: props.errorCode, viewport: null, overlayBbox: null }));

      const m = (await import("pdfjs-dist/build/pdf.mjs")) as unknown as PdfJsModule;
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: props.pdfUrl });
      const loadedPdf = await loadingTask.promise;
      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
      setPdfPageCount(typeof loadedPdf.numPages === "number" ? loadedPdf.numPages : null);
      setHud((h) => ({ ...h, pdfjsVersion: m.version ?? null }));
    }

    run().catch((err) => {
      if (cancelled) return;
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message }));
    });

    return () => {
      cancelled = true;
    };
  }, [props.errorCode, props.pdfUrl]);

  // Render page + overlay
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const canvas = document.getElementById("citation-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(props.pageNumber);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = effectiveZoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: totalRotation });
      const viewBox = coerceViewBox(page.view);

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (props.errorCode) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: props.errorCode,
        }));
        return;
      }

      const polyErr = polygonError;
      if (polyErr) {
        setOverlay([]);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox: null,
          errorCode: polyErr,
        }));
        return;
      }

      const mapped = mapNormPolygonsToViewportCss({ polygons: props.polygons, viewBox, viewport });
      const bbox = bboxFromCssPolygons(mapped);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setOverlay(mapped);
        setHud((h) => ({
          ...h,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          overlayBbox,
          errorCode: null,
        }));
      }
    }

    run().catch((err) => {
      setOverlay([]);
      const message = err instanceof Error ? err.message : String(err);
      setHud((h) => ({ ...h, errorCode: message, overlayBbox: null }));
    });

    return () => {
      cancelled = true;
    };
  }, [
    effectiveZoomPercent,
    pdf,
    pdfjs,
    polygonError,
    props.errorCode,
    props.pageNumber,
    props.polygons,
    userRotation,
  ]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="grid gap-1 text-sm text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">document_id:</span> {props.documentId}{" "}
              <span className="ml-2 font-medium text-foreground">page:</span> {props.pageNumber}{" "}
              {pdfPageCount ? <span className="text-muted-foreground">(of {pdfPageCount})</span> : null}
            </div>
            <div>
              <span className="font-medium text-foreground">pack:</span> {props.packId}{" "}
              <span className="ml-2 font-medium text-foreground">pdfjs:</span>{" "}
              {hud.pdfjsVersion ?? "(loading)"}
            </div>
          </div>

          <div className="flex flex-wrap items-end gap-3">
            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Zoom</span>
              <Select
                value={effectiveZoomPercent}
                disabled={highlightActive}
                onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              >
                {[75, 100, 125, 150].map((z) => (
                  <option key={z} value={z}>
                    {z}%
                  </option>
                ))}
              </Select>
              {highlightActive ? (
                <span className="text-xs text-muted-foreground">Locked to 100% while highlighting</span>
              ) : null}
            </label>

            <label className="grid gap-1 text-sm">
              <span className="text-muted-foreground">Rotation</span>
              <Select
                value={userRotation}
                onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
              >
                {[0, 90, 180, 270].map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </Select>
            </label>
          </div>
        </div>

        <div className="mt-4 grid gap-2">
          <div className="text-xs text-muted-foreground">snippet</div>
          <pre className="overflow-auto rounded-ui-md bg-foreground p-3 font-mono text-xs text-background">
            {props.snippet}
          </pre>

          <div className="grid gap-1 text-xs text-muted-foreground">
            <div>
              <span className="font-medium text-foreground">snippet_hash:</span>{" "}
              <span className="font-mono">{props.snippetHash}</span>
            </div>
            <div>
              <span className="font-medium text-foreground">computed:</span>{" "}
              <span className="font-mono">{props.computedSnippetHash}</span>
            </div>
          </div>

          {hud.errorCode ? (
            <div className="rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <div className="font-semibold">citation_failed</div>
              <div className="mt-1 text-xs">reason_code: {hud.errorCode}</div>
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">PDF + highlight overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="citation-canvas" className="block" />

            {hud.errorCode ? (
              <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
                <div>
                  <div className="text-sm font-semibold text-foreground">citation_failed</div>
                  <div className="mt-1 text-xs text-muted-foreground">reason_code: {hud.errorCode}</div>
                </div>
              </div>
            ) : (
              <svg
                className="absolute left-0 top-0"
                width={hud.viewport?.width ?? 0}
                height={hud.viewport?.height ?? 0}
                viewBox={`0 0 ${hud.viewport?.width ?? 0} ${hud.viewport?.height ?? 0}`}
              >
                {overlayPath.map((points, idx) => (
                  <polygon
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    points={points}
                    {...overlayHighlightPolygonProps}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>

        {hud.overlayBbox ? (
          <div className="mt-3 text-xs text-muted-foreground">
            overlay bbox:{" "}
            <span className="font-mono">
              {`{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                hud.overlayBbox.maxX,
              )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`}
            </span>
          </div>
        ) : null}
      </section>
    </div>
  );
}
```

### File: apps/web/app/(app)/matters/viewer/page.tsx
```tsx
import { z } from "zod";

import { hashSnippet } from "@legaltech-poc/core/citations/snippet";
import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { headers } from "next/headers";

import { assertDevOrDemoProd } from "../../../../lib/devOnly";
import { loadSeedSnapshot } from "../../../../lib/fixtureSeed.server";

import { Page } from "../../../ui/Page";
import { CitationViewerClient } from "./CitationViewerClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const SearchSchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i),
  citation: z.string().min(1),
  document_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid document id")
    .optional(),
  page: z.coerce.number().int().positive().optional(),
});

const CitationResponseSchema = z.object({
  citation: z.object({
    id: z.string().min(1),
    document_id: z.string().min(1),
    page_number: z.number().int().positive(),
    polygons: z
      .array(z.array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)])).min(3))
      .min(1),
    snippet: z.string(),
    snippet_hash: z.string().min(1),
  }),
});

const RenderResponseSchema = z.object({
  document_id: z.string().min(1),
  page: z.number().int().positive(),
  render_url: z.string().min(1),
});

async function originFromRequestHeaders(): Promise<string> {
  const h = await headers();
  // Avoid trusting arbitrary hostnames (SSRF). Keep internal fetches pinned to
  // loopback, but allow dynamic ports in dev.
  const host = h.get("host") ?? "";
  const m = host.match(/:(\d{1,5})$/);
  const portFromHost = m?.[1] ? Number(m[1]) : null;
  const envPort = process.env.PORT ? Number(process.env.PORT) : null;
  const port =
    (portFromHost && Number.isInteger(portFromHost) && portFromHost >= 1 && portFromHost <= 65535 ? portFromHost : null) ??
    (envPort && Number.isInteger(envPort) && envPort >= 1 && envPort <= 65535 ? envPort : null) ??
    3000;
  return `http://127.0.0.1:${port}`;
}

type SafeErr = { code: string; message: string };

function safeErrFromJson(json: unknown, fallback: SafeErr): SafeErr {
  if (!json || typeof json !== "object" || Array.isArray(json)) return fallback;
  const env = (json as { error?: unknown }).error;
  if (!env || typeof env !== "object" || Array.isArray(env)) return fallback;
  const code = (env as { code?: unknown }).code;
  const message = (env as { message?: unknown }).message;
  return {
    code: typeof code === "string" && code.trim() ? code.trim() : fallback.code,
    message: typeof message === "string" && message.trim() ? message.trim() : fallback.message,
  };
}

export default async function MatterViewerPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOrDemoProd();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  if (!parsed.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid query params.</p>
      </Page>
    );
  }

  const packId = parsed.data.pack;
  const citationId = parsed.data.citation;
  const requestedDocId = parsed.data.document_id ?? null;
  const requestedPage = parsed.data.page ?? null;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          No seeded snapshot for <span className="font-mono">{packId}</span>. Run{" "}
          <code className="font-mono">pnpm fixture:seed {packId}</code>.
        </p>
      </Page>
    );
  }

  const origin = await originFromRequestHeaders();
  const h = await headers();
  const auth = h.get("authorization");

  let citationJson: unknown;
  try {
    const res = await fetch(`${origin}/citations/${encodeURIComponent(citationId)}?${new URLSearchParams({ pack: packId }).toString()}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    citationJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(citationJson, { code: "CITATION_FETCH_FAILED", message: `Request failed (${res.status}).` });
      return (
        <Page width="sm">
          <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to load citation: <span className="font-mono">{citationId}</span>
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </Page>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to load citation: <span className="font-mono">{citationId}</span>
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const parsedCitation = CitationResponseSchema.safeParse(citationJson);
  if (!parsedCitation.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid citation payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const cit = parsedCitation.data.citation;

  if (!cit) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Citation not found: <span className="font-mono">{citationId}</span>
        </p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const computed = hashSnippet(cit.snippet);
  let resolvedDocId = requestedDocId ?? cit.document_id;
  if (requestedDocId && /\.pdf$/i.test(requestedDocId) && !requestedDocId.startsWith("fx_")) {
    try {
      resolvedDocId = fixtureDocumentId({ packId, filename: requestedDocId });
    } catch {
      // Preserve the original string if it doesn't match the fixture id contract.
    }
  }
  const resolvedPage = requestedPage ?? cit.page_number;
  let errorCode: string | null = null;
  if (computed !== cit.snippet_hash) errorCode = "SNIPPET_HASH_MISMATCH";
  else if (resolvedDocId !== cit.document_id) errorCode = "DOC_MISMATCH";
  else if (resolvedPage !== cit.page_number) errorCode = "WRONG_PAGE";

  let renderJson: unknown;
  try {
    const res = await fetch(`${origin}/documents/${encodeURIComponent(resolvedDocId)}/render?page=${resolvedPage}`, {
      cache: "no-store",
      headers: auth ? { authorization: auth } : undefined,
    });
    renderJson = await res.json().catch(() => null);
    if (!res.ok) {
      const e = safeErrFromJson(renderJson, { code: "RENDER_URL_FAILED", message: `Request failed (${res.status}).` });
      return (
        <Page width="sm">
          <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            {e.code}: {e.message}
          </p>
          <div className="mt-4">
            <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
              Back to matters
            </a>
          </div>
        </Page>
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Failed to fetch render_url for <span className="font-mono">{resolvedDocId}</span> (page {resolvedPage}).
        </p>
        <p className="mt-2 text-xs text-muted-foreground">{message}</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const parsedRender = RenderResponseSchema.safeParse(renderJson);
  if (!parsedRender.success) {
    return (
      <Page width="sm">
        <h1 className="font-serif text-heading-lg font-normal">Viewer</h1>
        <p className="mt-2 text-sm text-muted-foreground">Invalid render_url payload.</p>
        <div className="mt-4">
          <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
            Back to matters
          </a>
        </div>
      </Page>
    );
  }

  const pdfUrl = parsedRender.data.render_url;

  return (
    <Page width="lg">
      <div className="flex flex-wrap items-center gap-3">
        <a className="text-sm font-medium text-muted-foreground underline hover:text-foreground" href={`/matters?pack=${packId}`}>
          Back to matters
        </a>
        <div className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">citation:</span> <span className="font-mono">{citationId}</span>
        </div>
      </div>

      <div className="mt-6">
        <CitationViewerClient
          packId={packId}
          citationId={citationId}
          pdfUrl={pdfUrl}
          documentId={resolvedDocId}
          pageNumber={resolvedPage}
          polygons={cit.polygons}
          snippet={cit.snippet}
          snippetHash={cit.snippet_hash}
          computedSnippetHash={computed}
          errorCode={errorCode}
        />
      </div>
    </Page>
  );
}
```

### File: apps/web/app/(app)/spikes/rh1-pdf-perf/PdfPerfClient.tsx
```tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";

import type { PdfPerfRun } from "@legaltech-poc/core";
import { PdfPerfRunSchema } from "@legaltech-poc/core";
import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { Button } from "../../../ui/Button";
import { Input, Select } from "../../../ui/Input";

type DocRef = { pack: string; filename: string };

type RangePrecondition =
  | { kind: "checking" }
  | { kind: "pass"; acceptRanges: string | null; rangeStatus: number | null; contentRange: string | null }
  | {
      kind: "fail";
      acceptRanges: string | null;
      rangeStatus: number | null;
      contentRange: string | null;
      reason: string;
    };

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: any) => { promise: Promise<any> };
};

const PACK_OPTIONS: DocRef["pack"][] = ["pack_07_scans_rotated_low_quality"];
const DOC_OPTIONS: Array<DocRef["filename"]> = [
  "TitleCommitment_SCANNED_ROTATED.pdf",
  "ALTA_Survey_SCANNED_ROTATED.pdf",
];

const DEFAULT_PAGE_SEQUENCE = [
  1, 2, 3, 10, 25, 5, 30, 15, 40, 12, 50, 20, 60, 22, 70, 30, 80, 35, 90, 40,
];

function wrapToMaxPages(seq: number[], maxPages: number): number[] {
  if (maxPages <= 0) return [];
  return seq.map((p) => 1 + ((p - 1) % maxPages));
}

function p50p95max(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const at = (pct: number) => {
    if (!sorted.length) return null;
    // "Nearest rank" method: https://en.wikipedia.org/wiki/Percentile#The_nearest-rank_method
    const idx = Math.min(sorted.length - 1, Math.max(0, Math.ceil((pct / 100) * sorted.length) - 1));
    return sorted[idx];
  };
  return { p50: at(50), p95: at(95), max: sorted.length ? sorted[sorted.length - 1] : null };
}

function packShort(packId: string): string {
  const m = /^pack_\d{2}/i.exec(packId);
  return m ? m[0] : packId;
}

function docBase(filename: string): string {
  return filename.replace(/\.pdf$/i, "");
}

function isRenderCancelledError(err: any): boolean {
  const name = typeof err?.name === "string" ? err.name : "";
  const message = typeof err?.message === "string" ? err.message : String(err);
  return name === "RenderingCancelledException" || /render(ing)? cancelled/i.test(message);
}

function rowWasCancelled(row: { error?: string }): boolean {
  return row.error === "RENDER_CANCELLED" || row.error === "REQUEST_SUPERSEDED";
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function PdfPerfClient(props: { initialDoc: DocRef }) {
  const [doc, setDoc] = useState<DocRef>(props.initialDoc);
  const [zoomPercent, setZoomPercent] = useState<number>(100);
  const [pageInput, setPageInput] = useState<number>(1);
  const [spamSimulatedDelayMs, setSpamSimulatedDelayMs] = useState<number>(250);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<any>(null);
  const [pdfPageCount, setPdfPageCount] = useState<number | null>(null);
  const [pageRotate, setPageRotate] = useState<number | null>(null);

  const [lastTimings, setLastTimings] = useState<{
    getPageMs: number | null;
    renderMs: number | null;
    totalMs: number | null;
  } | null>(null);

  const [lastRun, setLastRun] = useState<PdfPerfRun | null>(null);
  const [busy, setBusy] = useState(false);

  const [rangePrecondition, setRangePrecondition] = useState<RangePrecondition>({ kind: "checking" });

  const renderTaskRef = useRef<any>(null);
  const requestSeqRef = useRef(0);

  const longTasksRef = useRef({ longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 });
  const resetLongTasks = () => {
    longTasksRef.current = { longTaskCount: 0, maxLongTaskMs: 0, totalLongTaskMs: 0 };
  };

  const documentId = useMemo(() => fixtureDocumentId({ packId: doc.pack, filename: doc.filename }), [doc]);
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [pdfUrlError, setPdfUrlError] = useState<string | null>(null);

  // Reset harness state when switching documents (before fetching a new signed URL).
  useEffect(() => {
    setPdf(null);
    setPdfPageCount(null);
    setPageRotate(null);
    setLastTimings(null);
    setLastRun(null);
    requestSeqRef.current = 0;
    setBusy(false);
  }, [documentId]);

  // Fetch canonical render_url for this fixture doc (signed, Range-capable).
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdfUrl(null);
      setPdfUrlError(null);
      setRangePrecondition({ kind: "checking" });

      try {
        const res = await fetch(`/documents/${encodeURIComponent(documentId)}/render?page=1`, { cache: "no-store" });
        const json: unknown = await res.json().catch(() => null);
        if (!res.ok) {
          const env = isRecord(json) && isRecord(json.error) ? json.error : null;
          const code = env && typeof env.code === "string" ? env.code : "RENDER_URL_FAILED";
          const message =
            env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
          if (!cancelled) setPdfUrlError(`${code}: ${message}`);
          return;
        }

        const renderUrl = isRecord(json) && typeof json.render_url === "string" ? json.render_url : null;
        if (!renderUrl) {
          if (!cancelled) setPdfUrlError("Missing render_url in response.");
          return;
        }

        if (!cancelled) setPdfUrl(renderUrl);
      } catch (err) {
        const message = err instanceof Error ? err.message : String(err);
        if (!cancelled) setPdfUrlError(message);
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [documentId]);

  // Preconditions: Range support (required for valid perf numbers)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!pdfUrl) {
        setRangePrecondition({
          kind: "fail",
          acceptRanges: null,
          rangeStatus: null,
          contentRange: null,
          reason: pdfUrlError ?? "Missing render_url.",
        });
        return;
      }

      try {
        const res = await fetch(pdfUrl, { headers: { Range: "bytes=0-1023" } });
        const acceptRanges = res.headers.get("accept-ranges");
        const contentRange = res.headers.get("content-range");

        const ok =
          res.status === 206 && typeof acceptRanges === "string" && acceptRanges.toLowerCase().includes("bytes");

        if (cancelled) return;

        if (ok) {
          setRangePrecondition({
            kind: "pass",
            acceptRanges,
            rangeStatus: res.status,
            contentRange,
          });
          return;
        }

        const reasonParts: string[] = [];
        if (res.status !== 206) reasonParts.push(`expected 206, got ${res.status}`);
        if (!acceptRanges) reasonParts.push("missing Accept-Ranges");
        else if (!acceptRanges.toLowerCase().includes("bytes")) reasonParts.push(`Accept-Ranges=${acceptRanges}`);

        setRangePrecondition({
          kind: "fail",
          acceptRanges,
          rangeStatus: res.status,
          contentRange,
          reason: reasonParts.join("; ") || "Range precondition failed.",
        });
      } catch (err: any) {
        if (cancelled) return;
        setRangePrecondition({
          kind: "fail",
          acceptRanges: null,
          rangeStatus: null,
          contentRange: null,
          reason: err instanceof Error ? err.message : String(err),
        });
      }
    }

    void run();

    return () => {
      cancelled = true;
    };
  }, [pdfUrl, pdfUrlError]);

  // Long-task / stall monitor
  useEffect(() => {
    resetLongTasks();

    let obs: PerformanceObserver | null = null;
    let stopped = false;
    let isMounted = true;

    const installLongTaskObserver = () => {
      if (typeof PerformanceObserver === "undefined") return false;
      try {
        obs = new PerformanceObserver((list) => {
          for (const entry of list.getEntries() as any[]) {
            const dur = Number(entry.duration ?? 0);
            longTasksRef.current.longTaskCount += 1;
            longTasksRef.current.totalLongTaskMs += dur;
            longTasksRef.current.maxLongTaskMs = Math.max(longTasksRef.current.maxLongTaskMs, dur);
          }
        });
        // TS doesn't always know "longtask".
        obs.observe({ entryTypes: ["longtask"] as any });
        return true;
      } catch {
        return false;
      }
    };

    const installStallMonitor = () => {
      const intervalMs = 50;
      const stallThresholdMs = 100;

      const tick = () => {
        if (stopped) return;
        const expected = performance.now() + intervalMs;
        window.setTimeout(() => {
          if (!isMounted) return;
          const drift = performance.now() - expected;
          if (drift > stallThresholdMs) {
            longTasksRef.current.longTaskCount += 1;
            longTasksRef.current.totalLongTaskMs += drift;
            longTasksRef.current.maxLongTaskMs = Math.max(longTasksRef.current.maxLongTaskMs, drift);
          }
          tick();
        }, intervalMs);
      };

      tick();
    };

    const ok = installLongTaskObserver();
    if (!ok) installStallMonitor();

    return () => {
      isMounted = false;
      stopped = true;
      obs?.disconnect();
    };
  }, []);

  // Load pdf.js + PDF on doc change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      if (!pdfUrl) return;

      setBusy(true);
      setPdf(null);
      setPdfPageCount(null);
      setPageRotate(null);
      setLastTimings(null);
      setLastRun(null);
      requestSeqRef.current = 0;

      const mod: any = await import("pdfjs-dist/build/pdf.mjs");
      const m = mod as PdfJsModule;

      // Worker wiring: allow pdf.js to run parsing/renders off the main thread.
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: pdfUrl });
      const loadedPdf = await loadingTask.promise;

      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
      setPdfPageCount(Number(loadedPdf.numPages ?? null));
      setPageInput(1);
    }

    run().finally(() => {
      if (!cancelled) setBusy(false);
    });

    return () => {
      cancelled = true;
    };
  }, [pdfUrl]);

  async function renderPage(
    pageNumber: number,
    args?: { simulateDelayMs?: number },
  ): Promise<{
    requestedPage: number;
    cancelledPrevious: boolean;
    t_request: number;
    t_gotPage: number | null;
    t_renderStart: number | null;
    t_renderEnd: number | null;
    getPageMs: number | null;
    renderMs: number | null;
    totalMs: number | null;
    error?: string;
    viewport?: { width: number; height: number };
    canvas?: { width: number; height: number; cssWidth: number; cssHeight: number };
    pageRotate?: number;
  }> {
    const simulateDelayMs =
      typeof args?.simulateDelayMs === "number" ? Math.max(0, Math.floor(args.simulateDelayMs)) : 0;
    const canvas = document.getElementById("pdfperf-canvas") as HTMLCanvasElement | null;
    if (!pdf || !pdfjs || !canvas) {
      return {
        requestedPage: pageNumber,
        cancelledPrevious: false,
        t_request: performance.now(),
        t_gotPage: null,
        t_renderStart: null,
        t_renderEnd: null,
        getPageMs: null,
        renderMs: null,
        totalMs: null,
        error: "NOT_READY",
      };
    }

    const prevTask = renderTaskRef.current;
    const cancelledPrevious = Boolean(prevTask);
    try {
      prevTask?.cancel?.();
    } catch {
      // ignore
    }

    const requestSeq = (requestSeqRef.current += 1);
    const t_request = performance.now();
    let t_gotPage: number | null = null;
    let t_renderStart: number | null = null;
    let t_renderEnd: number | null = null;
    let thisTask: any = null;

    try {
      if (simulateDelayMs > 0) {
        await new Promise((r) => window.setTimeout(r, simulateDelayMs));
        if (requestSeq !== requestSeqRef.current) {
          const t_now = performance.now();
          return {
            requestedPage: pageNumber,
            cancelledPrevious,
            t_request,
            t_gotPage: t_now,
            t_renderStart: null,
            t_renderEnd: null,
            getPageMs: t_now - t_request,
            renderMs: null,
            totalMs: null,
            error: "REQUEST_SUPERSEDED",
          };
        }
      }

      const page = await pdf.getPage(pageNumber);
      if (requestSeq !== requestSeqRef.current) {
        const t_now = performance.now();
        return {
          requestedPage: pageNumber,
          cancelledPrevious,
          t_request,
          t_gotPage: t_now,
          t_renderStart: null,
          t_renderEnd: null,
          getPageMs: t_now - t_request,
          renderMs: null,
          totalMs: null,
          error: "REQUEST_SUPERSEDED",
        };
      }
      t_gotPage = performance.now();

      const pageRotate = Number(page.rotate ?? 0);
      setPageRotate(pageRotate);

      const scale = zoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: pageRotate });

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;

      t_renderStart = performance.now();
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      thisTask = renderTask;
      renderTaskRef.current = renderTask;

      await renderTask.promise;
      if (requestSeq !== requestSeqRef.current) {
        const t_now = performance.now();
        return {
          requestedPage: pageNumber,
          cancelledPrevious,
          t_request,
          t_gotPage,
          t_renderStart,
          t_renderEnd: t_now,
          getPageMs: t_gotPage - t_request,
          renderMs: null,
          totalMs: null,
          error: "REQUEST_SUPERSEDED",
        };
      }
      t_renderEnd = performance.now();

      const getPageMs = t_gotPage - t_request;
      const renderMs = t_renderEnd - t_renderStart;
      const totalMs = t_renderEnd - t_request;

      setLastTimings({ getPageMs, renderMs, totalMs });

      return {
        requestedPage: pageNumber,
        cancelledPrevious,
        t_request,
        t_gotPage,
        t_renderStart,
        t_renderEnd,
        getPageMs,
        renderMs,
        totalMs,
        viewport: { width: viewport.width, height: viewport.height },
        canvas: {
          width: canvas.width,
          height: canvas.height,
          cssWidth: viewport.width,
          cssHeight: viewport.height,
        },
        pageRotate,
      };
    } catch (err: any) {
      if (isRenderCancelledError(err)) {
        return {
          requestedPage: pageNumber,
          cancelledPrevious,
          t_request,
          t_gotPage,
          t_renderStart,
          t_renderEnd,
          getPageMs: t_gotPage ? t_gotPage - t_request : null,
          renderMs: t_renderEnd && t_renderStart ? t_renderEnd - t_renderStart : null,
          totalMs: t_renderEnd ? t_renderEnd - t_request : null,
          error: "RENDER_CANCELLED",
        };
      }
      return {
        requestedPage: pageNumber,
        cancelledPrevious,
        t_request,
        t_gotPage,
        t_renderStart,
        t_renderEnd,
        getPageMs: t_gotPage ? t_gotPage - t_request : null,
        renderMs: t_renderEnd && t_renderStart ? t_renderEnd - t_renderStart : null,
        totalMs: t_renderEnd ? t_renderEnd - t_request : null,
        error: String(err?.message ?? err),
      };
    } finally {
      // Only clear if we still own the ref (spam mode replaces it).
      if (renderTaskRef.current === thisTask) renderTaskRef.current = null;
    }
  }

  async function runSerialTest() {
    if (rangePrecondition.kind !== "pass") {
      setLastRun(null);
      return;
    }
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const pageSequence = wrapToMaxPages(DEFAULT_PAGE_SEQUENCE, pdfPageCount);
    const rows = [];
    let lastViewport: { width: number; height: number } | undefined;
    let lastCanvas: { width: number; height: number; cssWidth: number; cssHeight: number } | undefined;
    let lastRotate: number | undefined;

    for (const p of pageSequence) {
      const row = await renderPage(p);
      rows.push(row);
      if (row.viewport) lastViewport = row.viewport;
      if (row.canvas) lastCanvas = row.canvas;
      if (typeof row.pageRotate === "number") lastRotate = row.pageRotate;
    }

    const run: PdfPerfRun = {
      createdAt: new Date().toISOString(),
      pdfjsVersion: pdfjs?.version,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio || 1,
      doc: { ...doc, document_id: documentId },
      zoomPercent,
      pageRotate: lastRotate,
      viewport: lastViewport,
      canvas: lastCanvas,
      test: { type: "serial", n: pageSequence.length, pageSequence },
      rows: rows.map((r) => ({
        requestedPage: r.requestedPage,
        cancelledPrevious: r.cancelledPrevious,
        t_request: r.t_request,
        t_gotPage: r.t_gotPage,
        t_renderStart: r.t_renderStart,
        t_renderEnd: r.t_renderEnd,
        getPageMs: r.getPageMs,
        renderMs: r.renderMs,
        totalMs: r.totalMs,
        ...(r.error ? { error: r.error } : {}),
      })),
      longTasks: { ...longTasksRef.current },
    };

    // Validate shape so the downloaded artefact stays stable.
    const parsed = PdfPerfRunSchema.safeParse(run);
    setLastRun(parsed.success ? parsed.data : run);

    setBusy(false);
  }

  async function runSpamTest() {
    if (rangePrecondition.kind !== "pass") {
      setLastRun(null);
      return;
    }
    if (!pdf || !pdfPageCount || busy) return;
    setBusy(true);
    resetLongTasks();

    const spamBase = Array.from({ length: 30 }, (_, i) => DEFAULT_PAGE_SEQUENCE[i % DEFAULT_PAGE_SEQUENCE.length] + i);
    const pageSequence = wrapToMaxPages(spamBase, pdfPageCount);
    const rowPromises: Array<Promise<any>> = [];

    const intervalMs = 200;

    for (let i = 0; i < pageSequence.length; i += 1) {
      // Fire requests at a fixed interval; cancellation should keep things responsive.
      rowPromises.push(renderPage(pageSequence[i], { simulateDelayMs: spamSimulatedDelayMs }));
      await new Promise((r) => window.setTimeout(r, intervalMs));
    }

    const rows = await Promise.all(rowPromises);

    const run: PdfPerfRun = {
      createdAt: new Date().toISOString(),
      pdfjsVersion: pdfjs?.version,
      userAgent: navigator.userAgent,
      devicePixelRatio: window.devicePixelRatio || 1,
      doc: { ...doc, document_id: documentId },
      zoomPercent,
      pageRotate: pageRotate ?? undefined,
      test: { type: "spam", n: pageSequence.length, intervalMs, pageSequence },
      rows: rows.map((r) => ({
        requestedPage: r.requestedPage,
        cancelledPrevious: r.cancelledPrevious,
        t_request: r.t_request,
        t_gotPage: r.t_gotPage,
        t_renderStart: r.t_renderStart,
        t_renderEnd: r.t_renderEnd,
        getPageMs: r.getPageMs,
        renderMs: r.renderMs,
        totalMs: r.totalMs,
        ...(r.error ? { error: r.error } : {}),
      })),
      longTasks: { ...longTasksRef.current },
    };

    const parsed = PdfPerfRunSchema.safeParse(run);
    setLastRun(parsed.success ? parsed.data : run);

    setBusy(false);
  }

  const lastSummary = useMemo(() => {
    if (!lastRun) return null;
    const totalMs = lastRun.rows.map((r) => r.totalMs ?? 0).filter((n) => n > 0);
    const totalStats = p50p95max(totalMs);

    if (lastRun.test.type === "serial") {
      const reasons: string[] = [];
      const ok =
        rangePrecondition.kind === "pass" &&
        (totalStats.p95 ?? Infinity) < 1000 &&
        (totalStats.max ?? Infinity) < 1500;

      if (rangePrecondition.kind !== "pass") reasons.push("RANGE_UNSUPPORTED");
      if ((totalStats.p95 ?? Infinity) >= 1000) reasons.push("P95_SLOW");
      if ((totalStats.max ?? Infinity) >= 1500) reasons.push("MAX_SLOW");

      return { kind: "serial" as const, totalStats, ok, reasons };
    }

    const intermediate = lastRun.rows.slice(0, -1);
    const cancelledCount = intermediate.filter(rowWasCancelled).length;
    const cancellationRate = intermediate.length ? cancelledCount / intermediate.length : 0;
    const finalRow = lastRun.rows[lastRun.rows.length - 1];
    const finalTotalMs = finalRow?.totalMs ?? null;

    const reasons: string[] = [];
    const ok =
      rangePrecondition.kind === "pass" &&
      longTasksRef.current.maxLongTaskMs < 250 &&
      typeof finalTotalMs === "number" &&
      finalTotalMs < 1500 &&
      cancellationRate >= 0.7;

    if (rangePrecondition.kind !== "pass") reasons.push("RANGE_UNSUPPORTED");
    if (longTasksRef.current.maxLongTaskMs >= 250) reasons.push("LONG_TASKS");
    if (typeof finalTotalMs !== "number") reasons.push("FINAL_PAGE_NO_TIMING");
    else if (finalTotalMs >= 1500) reasons.push("FINAL_PAGE_SLOW");
    if (cancellationRate < 0.7) reasons.push("LOW_CANCELLATION_RATE");

    return {
      kind: "spam" as const,
      totalStats,
      cancellation: { cancelledCount, totalCount: intermediate.length, rate: cancellationRate },
      final: { requestedPage: finalRow?.requestedPage ?? null, totalMs: finalTotalMs },
      ok,
      reasons,
    };
  }, [lastRun, rangePrecondition.kind]);

  function downloadResults() {
    if (!lastRun) return;
    const totalMs = lastRun.rows.map((r) => r.totalMs ?? 0).filter((n) => n > 0);
    const stats = p50p95max(totalMs);

    const goNoGo = lastSummary?.ok ? "GO" : "NO-GO";

    const payload = {
      ...lastRun,
      preconditions: {
        range: rangePrecondition,
      },
      summary: {
        totalMs: stats,
        goNoGo,
        reasons: lastSummary?.reasons ?? [],
        thresholds: {
          serial: { p95LtMs: 1000, maxLtMs: 1500 },
          spam: { maxLongTaskLtMs: 250, finalTotalLtMs: 1500, cancellationRateGte: 0.7 },
        },
        ...(lastSummary?.kind === "spam"
          ? {
              spamSimulatedDelayMs,
              cancellation: lastSummary.cancellation,
              final: lastSummary.final,
            }
          : {}),
        longTasks: { ...longTasksRef.current },
      },
    };

    const blob = new Blob([JSON.stringify(payload, null, 2) + "\n"], { type: "application/json" });
    const href = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = href;
    a.download = `RH1_pdfjs_perf_${packShort(doc.pack)}_${docBase(doc.filename)}_${zoomPercent}_${lastRun.test.type}.json`;
    a.click();
    URL.revokeObjectURL(href);
  }

  return (
    <div className="grid gap-4">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Pack</span>
            <Select
              value={doc.pack}
              onChange={(e) => setDoc((d) => ({ ...d, pack: e.currentTarget.value }))}
              disabled={busy}
            >
              {PACK_OPTIONS.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Doc</span>
            <Select
              value={doc.filename}
              onChange={(e) => setDoc((d) => ({ ...d, filename: e.currentTarget.value }))}
              disabled={busy}
            >
              {DOC_OPTIONS.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Zoom</span>
            <Select
              value={zoomPercent}
              onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
              disabled={busy}
            >
              {[50, 100, 150].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Page (1-indexed)</span>
            <Input
              type="number"
              min={1}
              max={pdfPageCount ?? undefined}
              value={pageInput}
              onChange={(e) => setPageInput(Number(e.currentTarget.value))}
              disabled={busy}
            />
          </label>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            variant="primary"
            onClick={() => void renderPage(pageInput)}
            disabled={busy || !pdf}
          >
            Jump
          </Button>
          <Button
            variant="secondary"
            onClick={() => void runSerialTest()}
            disabled={busy || !pdf || rangePrecondition.kind !== "pass"}
          >
            Run serial test (N=20)
          </Button>
          <Button
            variant="secondary"
            onClick={() => void runSpamTest()}
            disabled={busy || !pdf || rangePrecondition.kind !== "pass"}
          >
            Run spam test (N=30, interval=200ms)
          </Button>
          <Button
            variant="secondary"
            onClick={downloadResults}
            disabled={!lastRun}
          >
            Download results JSON
          </Button>
        </div>

        <div className="mt-3 flex flex-wrap items-end gap-3">
          <label className="grid gap-1 text-xs">
            <span className="text-muted-foreground">Spam simulated delay (ms)</span>
            <Input
              className="w-40"
              type="number"
              min={0}
              step={50}
              value={spamSimulatedDelayMs}
              onChange={(e) => setSpamSimulatedDelayMs(Number(e.currentTarget.value))}
              disabled={busy}
            />
          </label>
          <div className="text-xs text-muted-foreground">
            Adds async delay per request (simulated Range/network latency) to force cancellation behavior.
          </div>
        </div>

        <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">Range:</span>{" "}
            {rangePrecondition.kind === "checking"
              ? "checking…"
              : rangePrecondition.kind === "pass"
                ? `PASS (Accept-Ranges=${rangePrecondition.acceptRanges ?? "?"})`
                : `FAIL (${rangePrecondition.reason})`}
          </div>
          {rangePrecondition.kind === "fail" ? (
            <div className="mt-2 rounded-ui-md border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
              <div className="font-semibold">RH1 NO-GO</div>
              <div className="mt-1">
                Range requests are required for valid perf numbers. Fix the PDF serving path to return{" "}
                <span className="font-mono">Accept-Ranges: bytes</span> and{" "}
                <span className="font-mono">206 Partial Content</span> for Range requests.
              </div>
            </div>
          ) : null}
          <div>
            <span className="font-medium">pdfjsVersion:</span> {pdfjs?.version ?? "(loading)"}
          </div>
          <div>
            <span className="font-medium">doc:</span> {doc.filename} ({pdfPageCount ?? "?"} pages)
          </div>
          <div>
            <span className="font-medium">page.rotate:</span> {pageRotate ?? "?"}
          </div>
          <div>
            <span className="font-medium">devicePixelRatio:</span> {typeof window !== "undefined" ? window.devicePixelRatio : "?"}
          </div>
          <div>
            <span className="font-medium">last timings:</span>{" "}
            {lastTimings
              ? `getPage=${Math.round(lastTimings.getPageMs ?? 0)}ms, render=${Math.round(
                  lastTimings.renderMs ?? 0,
                )}ms, total=${Math.round(lastTimings.totalMs ?? 0)}ms`
              : "(none)"}
          </div>
          <div>
            <span className="font-medium">long tasks:</span>{" "}
            count={longTasksRef.current.longTaskCount}, max={Math.round(longTasksRef.current.maxLongTaskMs)}ms
          </div>
          {lastSummary ? (
            <div className="mt-2 rounded-ui-md border border-border bg-muted p-3 text-xs text-muted-foreground">
              <div className="font-semibold text-foreground">
                {lastSummary.ok ? "GO" : "NO-GO"}{" "}
                <span className="ml-2 font-normal text-muted-foreground">({lastRun?.test.type})</span>
              </div>
              <div className="mt-1">
                totalMs: p50={lastSummary.totalStats.p50 ? Math.round(lastSummary.totalStats.p50) : "?"}ms, p95=
                {lastSummary.totalStats.p95 ? Math.round(lastSummary.totalStats.p95) : "?"}ms, max=
                {lastSummary.totalStats.max ? Math.round(lastSummary.totalStats.max) : "?"}ms
              </div>
              {lastSummary.kind === "spam" ? (
                <div className="mt-1">
                  cancellation (intermediate): {lastSummary.cancellation.cancelledCount}/{lastSummary.cancellation.totalCount} (
                  {Math.round(lastSummary.cancellation.rate * 100)}%)
                </div>
              ) : null}
              {lastSummary.kind === "spam" && lastSummary.final.requestedPage ? (
                <div className="mt-1">
                  final page {lastSummary.final.requestedPage}: totalMs=
                  {typeof lastSummary.final.totalMs === "number" ? `${Math.round(lastSummary.final.totalMs)}ms` : "?"}
                </div>
              ) : null}
              {lastSummary.reasons.length ? (
                <div className="mt-1 text-muted-foreground">reasons: {lastSummary.reasons.join(", ")}</div>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">
          Canvas (single-page render; cancellation on navigation)
        </div>
        <div className="mt-3 overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <canvas id="pdfperf-canvas" />
        </div>
      </section>

      <section className="text-xs text-muted-foreground">
        <div>
          <span className="font-medium">document_id:</span> <code>{documentId}</code>
        </div>
      </section>
    </div>
  );
}
```

### File: apps/web/app/(app)/spikes/rh1-pdf-perf/page.tsx
```tsx
import { assertDevOnly } from "../../../../lib/devOnly";

import { Page, PageHeader, PageSection } from "../../../ui/Page";

import { PdfPerfClient } from "./PdfPerfClient";

export default function Rh1PdfPerfPage() {
  assertDevOnly();

  return (
    <Page>
      <PageHeader
        title="RH1: pdf.js perf harness"
        subtitle="Dev-only harness for page jumps and jank on scanned/rotated PDFs (pack_07)."
      />

      <PageSection>
        <PdfPerfClient
          initialDoc={{
            pack: "pack_07_scans_rotated_low_quality",
            filename: "TitleCommitment_SCANNED_ROTATED.pdf",
          }}
        />
      </PageSection>
    </Page>
  );
}
```

### File: apps/web/app/(app)/spikes/rh2-overlay/Rh2OverlayClient.tsx
```tsx
"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { useEffect, useMemo, useRef, useState } from "react";

import {
  anchorBoxToPolygons,
  bboxFromCssPolygons,
  mapNormPolygonsToViewportCss,
  type CssPolygons,
  type NormPoint,
  type ViewBox,
} from "@legaltech-poc/core";
import { useRouter } from "next/navigation";

import { overlayHighlightPolygonProps } from "../../../../lib/overlayHighlight";
import { validateNormPolygons } from "../../../../lib/validateNormPolygons";

import { Select } from "../../../ui/Input";

type Props = {
  pack: string;
  docKey: "TitleCommitment" | "ALTA_Survey";
  pdfUrl: string;
  pdfFilename: string;
  anchorIds: string[];
  anchors: Record<string, { page: number; bbox: [number, number, number, number] }>;
};

type PdfJsModule = {
  version?: string;
  GlobalWorkerOptions?: { workerSrc: string };
  getDocument: (opts: any) => { promise: Promise<any> };
};

export function Rh2OverlayClient(props: Props) {
  const router = useRouter();

  const [pack, setPack] = useState(props.pack);
  const [docKey, setDocKey] = useState<Props["docKey"]>(props.docKey);
  const [anchorId, setAnchorId] = useState(props.anchorIds[0] ?? "");
  const [zoomPercent, setZoomPercent] = useState(100);
  const [userRotation, setUserRotation] = useState(0);

  const [injectInvalidPolygon, setInjectInvalidPolygon] = useState(false);
  const [forceWrongPage, setForceWrongPage] = useState(false);

  const [pdfjs, setPdfjs] = useState<PdfJsModule | null>(null);
  const [pdf, setPdf] = useState<any>(null);

  const [hud, setHud] = useState<{
    page: number | null;
    pageRotate: number | null;
    totalRotation: number | null;
    viewport: { width: number; height: number } | null;
    canvas: { width: number; height: number; cssWidth: number; cssHeight: number } | null;
    dpr: number | null;
    overlayBbox: { minX: number; minY: number; maxX: number; maxY: number } | null;
    errorCode: string | null;
  }>({
    page: null,
    pageRotate: null,
    totalRotation: null,
    viewport: null,
    canvas: null,
    dpr: null,
    overlayBbox: null,
    errorCode: null,
  });

  const renderTaskRef = useRef<any>(null);

  const selectedAnchor = props.anchors[anchorId] ?? null;
  const selectedPage = selectedAnchor?.page ?? null;

  const effectivePage = useMemo(() => {
    if (!selectedPage) return null;
    if (!forceWrongPage) return selectedPage;
    return selectedPage + 1;
  }, [forceWrongPage, selectedPage]);

  // Keep local state aligned when navigating (back/forward, etc).
  useEffect(() => {
    setPack(props.pack);
    setDocKey(props.docKey);
  }, [props.docKey, props.pack]);

  // Reset anchor selection when pack/doc changes (new anchor set).
  useEffect(() => {
    if (props.anchorIds.includes(anchorId)) return;
    setAnchorId(props.anchorIds[0] ?? "");
  }, [anchorId, props.anchorIds]);

  // Update URL on pack/doc change so the server can re-load anchors.
  useEffect(() => {
    if (pack === props.pack && docKey === props.docKey) return;
    const params = new URLSearchParams({ pack, doc: docKey });
    router.push(`/spikes/rh2-overlay?${params.toString()}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pack, docKey]);

  // Cut: overlay is verified at 100% zoom only. Snap and lock.
  useEffect(() => {
    if (zoomPercent !== 100) setZoomPercent(100);
  }, [zoomPercent]);

  // Load pdf.js + PDF on pdfUrl change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      setPdf(null);
      setHud((h) => ({ ...h, errorCode: null }));

      const mod: any = await import("pdfjs-dist/build/pdf.mjs");
      const m = mod as PdfJsModule;
      if (m.GlobalWorkerOptions) {
        m.GlobalWorkerOptions.workerSrc = new URL(
          "pdfjs-dist/build/pdf.worker.min.mjs",
          import.meta.url,
        ).toString();
      }

      const loadingTask = m.getDocument({ url: props.pdfUrl });
      const loadedPdf = await loadingTask.promise;

      if (cancelled) return;

      setPdfjs(m);
      setPdf(loadedPdf);
    }

    run().catch((err) => {
      if (!cancelled) setHud((h) => ({ ...h, errorCode: String(err?.message ?? err) }));
    });

    return () => {
      cancelled = true;
    };
  }, [props.pdfUrl]);

  // Render page + overlay when inputs change
  useEffect(() => {
    let cancelled = false;

    async function run() {
      const canvas = document.getElementById("rh2-canvas") as HTMLCanvasElement | null;
      if (!canvas || !pdf || !pdfjs || !selectedAnchor || !effectivePage) return;

      try {
        renderTaskRef.current?.cancel?.();
      } catch {
        // ignore
      }

      const page = await pdf.getPage(effectivePage);
      const pageRotate = Number(page.rotate ?? 0);
      const totalRotation = (pageRotate + userRotation) % 360;

      const scale = zoomPercent / 100;
      const viewport = page.getViewport({ scale, rotation: totalRotation });
      const viewBox = (page.view?.slice?.(0, 4) ?? page.view) as ViewBox;

      const dpr = window.devicePixelRatio || 1;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      canvas.width = Math.floor(viewport.width * dpr);
      canvas.height = Math.floor(viewport.height * dpr);

      const ctx = canvas.getContext("2d", { alpha: false });
      if (!ctx) throw new Error("NO_2D_CONTEXT");

      const transform = dpr !== 1 ? ([dpr, 0, 0, dpr, 0, 0] as const) : undefined;
      const renderTask = page.render({ canvasContext: ctx, viewport, transform });
      renderTaskRef.current = renderTask;
      await renderTask.promise;

      if (forceWrongPage) {
        // Fail closed (we deliberately render the wrong page).
        setOverlay([]);
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox: null,
          errorCode: "WRONG_PAGE",
        });
        return;
      }

      const polygonsBase = anchorBoxToPolygons({ page: selectedAnchor.page, bbox: selectedAnchor.bbox });
      const badPoint: NormPoint = [-0.1, 0.2] as const;
      const polygons = injectInvalidPolygon
        ? [[badPoint, ...polygonsBase[0].slice(1)]]
        : polygonsBase;

      const polyErr = validateNormPolygons(polygons);
      if (polyErr) {
        setOverlay([]);
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox: null,
          errorCode: polyErr,
        });
        return;
      }

      const mapped = mapNormPolygonsToViewportCss({ polygons, viewBox, viewport });
      const bbox = bboxFromCssPolygons(mapped);
      const overlayBbox =
        bbox && Number.isFinite(bbox.minX)
          ? { minX: bbox.minX, minY: bbox.minY, maxX: bbox.maxX, maxY: bbox.maxY }
          : null;

      if (!cancelled) {
        setHud({
          page: effectivePage,
          pageRotate,
          totalRotation,
          viewport: { width: viewport.width, height: viewport.height },
          canvas: { width: canvas.width, height: canvas.height, cssWidth: viewport.width, cssHeight: viewport.height },
          dpr,
          overlayBbox,
          errorCode: null,
        });

        // Store mapped polygons for SVG render.
        setOverlay(mapped);
      }
    }

    run().catch((err) => {
      setOverlay([]);
      setHud((h) => ({ ...h, errorCode: String(err?.message ?? err), overlayBbox: null }));
    });

    return () => {
      cancelled = true;
    };
  }, [effectivePage, forceWrongPage, injectInvalidPolygon, pdf, pdfjs, selectedAnchor, userRotation, zoomPercent]);

  const [overlay, setOverlay] = useState<CssPolygons>([]);

  const overlayPath = useMemo(() => {
    if (!overlay.length) return [];
    return overlay.map((poly) => poly.map(([x, y]) => `${x},${y}`).join(" "));
  }, [overlay]);

  return (
    <div className="grid gap-4">
      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Pack</span>
            <Select
              value={pack}
              onChange={(e) => setPack(e.currentTarget.value)}
            >
              <option value="pack_01_clean">pack_01_clean</option>
              <option value="pack_07_scans_rotated_low_quality">pack_07_scans_rotated_low_quality</option>
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Doc</span>
            <Select
              value={docKey}
              onChange={(e) => setDocKey(e.currentTarget.value as Props["docKey"])}
            >
              <option value="TitleCommitment">TitleCommitment</option>
              <option value="ALTA_Survey">ALTA_Survey</option>
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Anchor</span>
            <Select
              value={anchorId}
              onChange={(e) => setAnchorId(e.currentTarget.value)}
            >
              {props.anchorIds.map((id) => (
                <option key={id} value={id}>
                  {id}
                </option>
              ))}
            </Select>
          </label>

          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">Zoom</span>
            <Select
              value={zoomPercent}
              disabled
              onChange={(e) => setZoomPercent(Number(e.currentTarget.value))}
            >
              {[100].map((z) => (
                <option key={z} value={z}>
                  {z}%
                </option>
              ))}
            </Select>
            <span className="text-xs text-muted-foreground">Locked to 100% for overlay verification</span>
          </label>
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-4">
          <label className="grid gap-1 text-sm">
            <span className="text-muted-foreground">User rotation</span>
            <Select
              value={userRotation}
              onChange={(e) => setUserRotation(Number(e.currentTarget.value))}
            >
              {[0, 90, 180, 270].map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </Select>
          </label>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={injectInvalidPolygon}
              onChange={(e) => setInjectInvalidPolygon(e.currentTarget.checked)}
            />
            injectInvalidPolygon
          </label>

          <label className="flex items-center gap-2 text-sm text-muted-foreground">
            <input
              type="checkbox"
              checked={forceWrongPage}
              onChange={(e) => setForceWrongPage(e.currentTarget.checked)}
            />
            forceWrongPage
          </label>
        </div>

        <div className="mt-4 grid gap-1 text-sm text-muted-foreground">
          <div>
            <span className="font-medium">pdfjsVersion:</span> {pdfjs?.version ?? "(loading)"}
          </div>
          <div>
            <span className="font-medium">pack/doc:</span> {props.pack} / {props.pdfFilename}
          </div>
          <div>
            <span className="font-medium">anchor page:</span> {selectedPage ?? "?"}
          </div>
          <div>
            <span className="font-medium">rendered page:</span> {hud.page ?? "?"}
          </div>
          <div>
            <span className="font-medium">page.rotate:</span> {hud.pageRotate ?? "?"}
          </div>
          <div>
            <span className="font-medium">userRotation:</span> {userRotation}
          </div>
          <div>
            <span className="font-medium">totalRotation:</span> {hud.totalRotation ?? "?"}
          </div>
          <div>
            <span className="font-medium">viewport:</span>{" "}
            {hud.viewport ? `${Math.round(hud.viewport.width)}x${Math.round(hud.viewport.height)}` : "?"}
          </div>
          <div>
            <span className="font-medium">canvas:</span>{" "}
            {hud.canvas ? `${hud.canvas.width}x${hud.canvas.height} (css ${Math.round(hud.canvas.cssWidth)}x${Math.round(hud.canvas.cssHeight)})` : "?"}
          </div>
          <div>
            <span className="font-medium">devicePixelRatio:</span> {hud.dpr ?? "?"}
          </div>
          <div>
            <span className="font-medium">overlay bbox:</span>{" "}
            {hud.overlayBbox
              ? `{minX:${Math.round(hud.overlayBbox.minX)}, minY:${Math.round(hud.overlayBbox.minY)}, maxX:${Math.round(
                  hud.overlayBbox.maxX,
                )}, maxY:${Math.round(hud.overlayBbox.maxY)}}`
              : "(none)"}
          </div>
          <div>
            <span className="font-medium">errorCode:</span> {hud.errorCode ?? "(none)"}
          </div>
        </div>
      </section>

      <section className="rounded-ui-lg border border-border bg-card p-4 shadow-ui-sm">
        <div className="text-sm text-muted-foreground">Canvas + SVG overlay</div>
        <div className="relative mt-3 inline-block overflow-auto rounded-ui-md border border-border bg-muted p-2">
          <div className="relative">
            <canvas id="rh2-canvas" className="block" />
            {hud.errorCode ? (
              <div className="absolute inset-0 grid place-items-center bg-background/80 p-6 text-center">
                <div>
                  <div className="text-sm font-semibold text-foreground">citation_failed</div>
                  <div className="mt-1 text-xs text-muted-foreground">reason_code: {hud.errorCode}</div>
                </div>
              </div>
            ) : (
              <svg
                className="absolute left-0 top-0"
                width={hud.viewport?.width ?? 0}
                height={hud.viewport?.height ?? 0}
                viewBox={`0 0 ${hud.viewport?.width ?? 0} ${hud.viewport?.height ?? 0}`}
              >
                {overlayPath.map((points, idx) => (
                  <polygon
                    // eslint-disable-next-line react/no-array-index-key
                    key={idx}
                    points={points}
                    {...overlayHighlightPolygonProps}
                  />
                ))}
              </svg>
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
```

### File: apps/web/app/(app)/spikes/rh2-overlay/loadAnchors.server.ts
```ts
import "server-only";

import fs from "node:fs";
import path from "node:path";

import { AnchorFileSchema } from "@legaltech-poc/core";

export type LoadedAnchors = {
  anchorIds: string[];
  anchors: Record<string, { page: number; bbox: [number, number, number, number] }>;
};

export function loadAnchorsFromFixture(args: {
  pack: string;
  docKey: "TitleCommitment" | "ALTA_Survey";
}): LoadedAnchors {
  const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data", args.pack);
  const anchorsPath = path.join(packRoot, "layout", `${args.docKey}.anchors.json`);

  const raw = fs.readFileSync(anchorsPath, "utf8");
  const parsed = AnchorFileSchema.parse(JSON.parse(raw));

  const anchors: LoadedAnchors["anchors"] = {};
  for (const [id, v] of Object.entries(parsed)) {
    anchors[id] = { page: v.page, bbox: v.bbox };
  }

  const anchorIds = Object.keys(anchors).sort();
  return { anchorIds, anchors };
}
```

### File: apps/web/app/(app)/spikes/rh2-overlay/page.tsx
```tsx
import { z } from "zod";

import { assertDevOnly } from "../../../../lib/devOnly";

import { Page, PageHeader, PageSection } from "../../../ui/Page";

import { Rh2OverlayClient } from "./Rh2OverlayClient";
import { loadAnchorsFromFixture } from "./loadAnchors.server";

const SearchSchema = z.object({
  pack: z.enum(["pack_01_clean", "pack_07_scans_rotated_low_quality"]).optional(),
  doc: z.enum(["TitleCommitment", "ALTA_Survey"]).optional(),
});

function pdfFilenameFor(pack: string, docKey: "TitleCommitment" | "ALTA_Survey"): string {
  if (pack === "pack_07_scans_rotated_low_quality") return `${docKey}_SCANNED_ROTATED.pdf`;
  return `${docKey}.pdf`;
}

export default async function Rh2OverlayPage(props: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  assertDevOnly();

  const searchParams = (await props.searchParams) ?? {};
  const parsed = SearchSchema.safeParse(searchParams);
  const pack = parsed.success ? parsed.data.pack ?? "pack_01_clean" : "pack_01_clean";
  const docKey = parsed.success ? parsed.data.doc ?? "TitleCommitment" : "TitleCommitment";

  const { anchorIds, anchors } = loadAnchorsFromFixture({ pack, docKey });
  const pdfFilename = pdfFilenameFor(pack, docKey);
  const pdfUrl = `/spikes/local-pdf?${new URLSearchParams({ pack, filename: pdfFilename }).toString()}`;

  return (
    <Page width="lg">
      <PageHeader
        title="RH2: highlight overlay harness"
        subtitle="Dev-only harness to validate anchor mapping across zoom and rotation. Fail-closed on invalid geometry."
      />

      <PageSection>
        <Rh2OverlayClient
          pack={pack}
          docKey={docKey}
          pdfUrl={pdfUrl}
          pdfFilename={pdfFilename}
          anchorIds={anchorIds}
          anchors={anchors}
        />
      </PageSection>
    </Page>
  );
}
```

### File: apps/web/app/(api)/artefacts/[id]/download/route.ts
```ts
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import {
  createObjectReadStream,
  objectExists,
  statObject,
  validateArtefactStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .trim()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact id"),
});

function contentTypeForArtefact(type: string): string {
  if (type === "csv") return "text/csv; charset=utf-8";
  if (type === "docx") {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  return "application/octet-stream";
}

function safeDownloadFilename(args: { id: string; type: string; filename: unknown }): string {
  const ext = args.type === "csv" ? ".csv" : args.type === "docx" ? ".docx" : "";
  const fallback = `${args.id}${ext}`;

  if (typeof args.filename !== "string") return fallback;
  const s = args.filename.trim();
  if (!s) return fallback;
  if (s.length > 200) return fallback;
  if (!/^[A-Za-z0-9 _.-]+$/.test(s)) return fallback;
  if (ext && !s.toLowerCase().endsWith(ext)) return fallback;
  return s;
}

type ArtefactRow = {
  id: string;
  type: string;
  filename: string;
  storage_key: string;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const expiresRaw = url.searchParams.get("expires");
  const sigRaw = url.searchParams.get("sig");
  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid download expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Download URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  await ensureSchema();

  const artefactId = parsedParams.data.id;
  const rows = await sql<ArtefactRow[]>`
    SELECT id, type, filename, storage_key
    FROM artefacts
    WHERE id = ${artefactId}
    LIMIT 1
  `;
  const artefact = rows[0];
  if (!artefact) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const keyOk = validateArtefactStorageKey(artefact.storage_key);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "CONFLICT", message: "Artefact has an invalid storage_key.", traceId }),
      { status: 409, headers },
    );
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: artefact.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(artefact.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(artefact.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", contentTypeForArtefact(artefact.type));
  outHeaders.set("Content-Disposition", `attachment; filename="${safeDownloadFilename(artefact)}"`);
  outHeaders.set("Content-Length", String(stat.size));

  const nodeStream = createObjectReadStream(artefact.storage_key);
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers: outHeaders });
}
```

### File: apps/web/app/(api)/documents/[id]/complete/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { enqueueDocumentIngest } from "../../../../../lib/ingest/ingestQueue.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  storage_key: z.string().min(1),
});

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      parse_status: "queued" | "parsing" | "parsed" | "failed";
      ocr_status: "queued" | "running" | "done" | "failed";
    }>
  >`
    SELECT id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key || doc.storage_key !== parsedBody.data.storage_key) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "storage_key did not match document.",
        details: { storage_key: "mismatch" },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.parse_status === "queued" && doc.ocr_status === "queued") {
    enqueueDocumentIngest(documentId);
  }

  return Response.json(
    {
      document: {
        id: doc.id,
        parse_status: doc.parse_status,
        ocr_status: doc.ocr_status,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/documents/[id]/pdf/route.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { Readable } from "node:stream";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { parseFixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { parseSingleRangeHeader } from "../../../../../lib/httpRange.server";
import { createObjectReadStream, statObject, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { safePdfFilename } from "../../../../../lib/safePdfFilename.server";
import { createTraceContext } from "../../../../../lib/trace.server";
import { isDevOrDemoProd } from "../../../../../lib/runtimeMode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;

  const url = new URL(req.url);
  const expiresRaw =
    url.searchParams.get("expires") ??
    url.searchParams.get("x_orbital_render_expires") ??
    req.headers.get("x-orbital-render-expires");
  const sigRaw =
    url.searchParams.get("sig") ??
    url.searchParams.get("x_orbital_render_signature") ??
    req.headers.get("x-orbital-render-signature");

  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid render expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Render URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    // Fixture documents are only available in dev and demo-prod.
    if (!isDevOrDemoProd()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const sigOk = verifySignature({ purpose: "get", storageKey: `fixture:${documentId}`, expiresAtMs, sig: sigRaw });
    if (!sigOk) {
      return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
        status: 403,
        headers,
      });
    }

    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }

    let stat: fs.Stats;
    try {
      stat = fs.statSync(candidate);
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }
    if (!stat.isFile()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const size = stat.size;
    const rangeHeader = req.headers.get("range");
    const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

    headers.set("Accept-Ranges", "bytes");
    headers.set("Content-Type", "application/pdf");
    headers.set("Content-Disposition", `inline; filename="${safePdfFilename(fixture.filename)}"`);

    if (!rangeHeader) {
      headers.set("Content-Length", String(size));
      const nodeStream = fs.createReadStream(candidate);
      return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
    }

    if (!range) {
      headers.set("Content-Range", `bytes */${size}`);
      return new Response(null, { status: 416, headers });
    }

    const { start, end } = range;
    headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
    headers.set("Content-Length", String(end - start + 1));

    const nodeStream = fs.createReadStream(candidate, { start, end });
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
  }

  await ensureSchema();

  const docs = await sql<Array<{ id: string; storage_key: string | null; filename: string }>>`
    SELECT id, storage_key, filename
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey: doc.storage_key, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid render signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let stat;
  try {
    stat = await statObject(doc.storage_key);
  } catch {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }
  if (!stat.isFile()) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), { status: 404, headers });
  }

  const size = stat.size;
  const rangeHeader = req.headers.get("range");
  const range = rangeHeader ? parseSingleRangeHeader(rangeHeader, size) : null;

  headers.set("Accept-Ranges", "bytes");
  headers.set("Content-Type", "application/pdf");
  headers.set("Content-Disposition", `inline; filename="${safePdfFilename(doc.filename)}"`);

  if (!rangeHeader) {
    headers.set("Content-Length", String(size));
    const nodeStream = createObjectReadStream(doc.storage_key);
    return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 200, headers });
  }

  if (!range) {
    headers.set("Content-Range", `bytes */${size}`);
    return new Response(null, { status: 416, headers });
  }

  const { start, end } = range;
  headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
  headers.set("Content-Length", String(end - start + 1));

  const nodeStream = createObjectReadStream(doc.storage_key, { start, end });
  return new Response(Readable.toWeb(nodeStream) as ReadableStream, { status: 206, headers });
}
```

### File: apps/web/app/(api)/documents/[id]/render/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { parseFixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders, objectExists, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";
import { isDevOrDemoProd } from "../../../../../lib/runtimeMode";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const QuerySchema = z.object({
  page: z.coerce.number().int().positive(),
});

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const documentId = parsedParams.data.id;
  const page = parsedQuery.data.page;

  const fixture = parseFixtureDocumentId(documentId);
  if (fixture.ok) {
    // Fixture documents are only available in dev and demo-prod.
    if (!isDevOrDemoProd()) {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    // Verify the fixture PDF exists so we can fail closed on drift.
    const fs = await import("node:fs");
    const path = await import("node:path");
    const packRoot = path.resolve(process.cwd(), "../../docs/08-example-data");
    const candidate = path.resolve(packRoot, fixture.packId, "docs", fixture.filename);
    if (!candidate.startsWith(packRoot + path.sep)) {
      return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid path.", traceId }), {
        status: 400,
        headers,
      });
    }
    try {
      const stat = fs.statSync(candidate);
      if (!stat.isFile()) throw new Error("NOT_A_FILE");
    } catch {
      return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "PDF not found.", traceId }), {
        status: 404,
        headers,
      });
    }

    const origin = new URL(req.url).origin;
    const signed = createSignedGetHeaders({ storageKey: `fixture:${documentId}` });
    const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
      expires: String(signed.expires_at_ms),
      sig: signed.signature,
    }).toString()}`;

    return Response.json(
      {
        document_id: documentId,
        page,
        render_url: renderUrl,
      },
      { status: 200, headers },
    );
  }

  await ensureSchema();

  const docs = await sql<
    Array<{ id: string; storage_key: string | null; upload_completed_at: Date | null; page_count: number | null }>
  >`
    SELECT id, storage_key, upload_completed_at, page_count
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload not completed yet.", traceId }), {
      status: 409,
      headers,
    });
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!objectExists(doc.storage_key)) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Raw PDF not found for storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const pageCount = typeof doc.page_count === "number" && Number.isFinite(doc.page_count) ? doc.page_count : null;
  if (pageCount && page > pageCount) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "page is out of range.",
        details: { page: "out_of_range", page_count: pageCount },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const origin = new URL(req.url).origin;
  const signed = createSignedGetHeaders({ storageKey: doc.storage_key });
  const renderUrl = `${origin}/documents/${documentId}/pdf?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      document_id: documentId,
      page,
      render_url: renderUrl,
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/documents/[id]/upload/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { putObjectWriteOnce, validateStorageKey, verifySignature } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

const ParamsSchema = z.object({
  id: z.string().min(1),
});

function parseExpectedBytes(val: unknown): number | null {
  if (typeof val === "number" && Number.isSafeInteger(val) && val > 0) return val;
  if (typeof val === "bigint") {
    if (val <= 0n) return null;
    if (val > BigInt(Number.MAX_SAFE_INTEGER)) return null;
    return Number(val);
  }
  if (typeof val === "string" && /^[0-9]+$/.test(val)) {
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n <= 0) return null;
    return n;
  }
  return null;
}

function hasPdfMagic(bytes: Uint8Array): boolean {
  // "%PDF-" (25 50 44 46 2d)
  return (
    bytes.byteLength >= 5 &&
    bytes[0] === 0x25 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x44 &&
    bytes[3] === 0x46 &&
    bytes[4] === 0x2d
  );
}

export async function PUT(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const expiresHeader = req.headers.get("x-orbital-upload-expires");
  const sigHeader = req.headers.get("x-orbital-upload-signature");
  if (!expiresHeader || !sigHeader) {
    return Response.json(
      safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing upload signature headers.", traceId }),
      { status: 403, headers },
    );
  }

  const expiresAtMs = Number(expiresHeader);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid upload expires header.", traceId }),
      { status: 400, headers },
    );
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Upload URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const documentId = parsedParams.data.id;
  const docs = await sql<
    Array<{
      id: string;
      folder_id: string;
      storage_key: string | null;
      upload_completed_at: Date | null;
      mime: string;
      bytes: unknown;
    }>
  >`
    SELECT id, folder_id, storage_key, upload_completed_at, mime, bytes
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Document not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (doc.upload_completed_at) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (!doc.storage_key) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has no storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  if (doc.mime !== "application/pdf") {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document mime is not application/pdf.", traceId }), {
      status: 409,
      headers,
    });
  }

  const expectedBytes = parseExpectedBytes(doc.bytes);
  if (expectedBytes === null) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Document bytes is invalid.", traceId }), {
      status: 500,
      headers,
    });
  }

  if (expectedBytes > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload too large.",
        details: { bytes: expectedBytes, max_bytes: MAX_UPLOAD_BYTES },
        traceId,
      }),
      { status: 413, headers },
    );
  }

  const keyValid = validateStorageKey(doc.storage_key);
  if (!keyValid.ok) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Document has an invalid storage_key.", traceId }), {
      status: 409,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "put", storageKey: doc.storage_key, expiresAtMs, sig: sigHeader });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid upload signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  let bytes: Uint8Array;
  try {
    bytes = new Uint8Array(await req.arrayBuffer());
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid request body.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (bytes.byteLength > MAX_UPLOAD_BYTES) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload too large.", traceId }),
      { status: 413, headers },
    );
  }

  if (bytes.byteLength !== expectedBytes) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Upload size did not match document bytes.",
        details: { expected_bytes: expectedBytes, actual_bytes: bytes.byteLength },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (!hasPdfMagic(bytes)) {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Upload must be a PDF.", traceId }),
      { status: 400, headers },
    );
  }

  let result: { bytesWritten: number; sha256: string };
  try {
    result = await putObjectWriteOnce({ storageKey: doc.storage_key, bytes });
  } catch (err) {
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (code === "EEXIST") {
      return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
        status: 409,
        headers,
      });
    }
    throw err;
  }

  const updated = await sql<{ id: string }[]>`
    UPDATE documents
    SET upload_completed_at = now(),
        sha256 = ${result.sha256},
        updated_at = now()
    WHERE id = ${doc.id}
      AND upload_completed_at IS NULL
    RETURNING id
  `;
  if (!updated[0]) {
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message: "Upload already completed.", traceId }), {
      status: 409,
      headers,
    });
  }

  await refreshFolderState(doc.folder_id);

  return new Response(null, { status: 200, headers });
}
```

### File: apps/web/app/(api)/export/csv/download/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import {
  objectExists,
  readObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
  verifySignature,
} from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const QuerySchema = z.object({
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  artefact_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact_id"),
});

function safeFilename(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  if (s.length > 200) return null;
  if (!/^[A-Za-z0-9_.-]+\.csv$/.test(s)) return null;
  return s;
}

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsed.data.folder_id;
  const artefactId = parsed.data.artefact_id;

  const expiresRaw = url.searchParams.get("expires");
  const sigRaw = url.searchParams.get("sig");
  if (!expiresRaw || !sigRaw) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Missing download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  const expiresAtMs = Number(expiresRaw);
  if (!Number.isFinite(expiresAtMs) || expiresAtMs <= 0) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid download expires.", traceId }), {
      status: 400,
      headers,
    });
  }

  if (Date.now() > expiresAtMs) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Download URL expired.", traceId }), {
      status: 403,
      headers,
    });
  }

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid storage key.", traceId }), {
      status: 400,
      headers,
    });
  }

  const sigOk = verifySignature({ purpose: "get", storageKey, expiresAtMs, sig: sigRaw });
  if (!sigOk) {
    return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Invalid download signature.", traceId }), {
      status: 403,
      headers,
    });
  }

  if (!objectExists(storageKey)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const metaKey = `folders/${folderId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metaKey);

  let filename: string = `${artefactId}.csv`;
  if (metaOk.ok && objectExists(metaKey)) {
    try {
      const metaBytes = await readObject(metaKey);
      const meta = JSON.parse(Buffer.from(metaBytes).toString("utf8")) as unknown;
      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        filename = safeFilename((meta as { filename?: unknown }).filename) ?? filename;
      }
    } catch {
      // ignore metadata parse failures; downloads should still work.
    }
  }

  const bytes = await readObject(storageKey);
  const outHeaders = new Headers(headers);
  outHeaders.set("Content-Type", "text/csv; charset=utf-8");
  outHeaders.set("Content-Disposition", `attachment; filename="${filename}"`);
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: outHeaders,
  });
}
```

### File: apps/web/app/(api)/folders/[id]/artefacts/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type ArtefactRow = {
  id: string;
  folder_id: string;
  type: string;
  kind: string;
  filename: string;
  storage_key: string;
  source_run_id: string | null;
  created_at: Date;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, folder_id, type, kind, filename, storage_key, source_run_id, created_at
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  const origin = new URL(req.url).origin;

  return Response.json(
    {
      artefacts: artefacts.map((a) => {
        const signed = createSignedGetHeaders({ storageKey: a.storage_key });
        const downloadUrl = `${origin}/artefacts/${a.id}/download?${new URLSearchParams({
          expires: String(signed.expires_at_ms),
          sig: signed.signature,
          issued: traceId,
        }).toString()}`;

        return {
          id: a.id,
          type: a.type,
          kind: a.kind,
          filename: a.filename,
          storage_key: a.storage_key,
          source_run_id: a.source_run_id,
          created_at: a.created_at.toISOString(),
          download_url: downloadUrl,
        };
      }),
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/folders/[id]/documents/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { newId } from "../../../../../lib/ids";
import { createSignedPutHeaders, validateStorageKey } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const InitUploadSchema = z.object({
  filename: z.string().trim().min(1),
  mime: z.literal("application/pdf"),
  bytes: z.number().int().positive(),
});

export async function GET(_req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documents = await sql<
    Array<{
      id: string;
      folder_id: string;
      filename: string;
      parse_status: string;
      ocr_status: string;
      extraction_quality: number | null;
      page_count: number | null;
      error_json: unknown | null;
      created_at: Date;
    }>
  >`
    SELECT id, folder_id, filename, parse_status, ocr_status, extraction_quality, page_count, error_json, created_at
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      documents: documents.map((d) => ({
        id: d.id,
        folder_id: d.folder_id,
        filename: d.filename,
        parse_status: d.parse_status,
        ocr_status: d.ocr_status,
        extraction_quality: d.extraction_quality,
        page_count: d.page_count,
        error_json: d.error_json,
        created_at: d.created_at.toISOString(),
      })),
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = InitUploadSchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const documentId = newId("doc");
  const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
  const validKey = validateStorageKey(storageKey);
  if (!validKey.ok) {
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to create storage key.", traceId }), {
      status: 500,
      headers,
    });
  }

  await sql`
    INSERT INTO documents (
      id,
      folder_id,
      filename,
      mime,
      bytes,
      storage_key,
      parse_status,
      ocr_status,
      created_at,
      updated_at
    )
    VALUES (
      ${documentId},
      ${folderId},
      ${parsedBody.data.filename},
      ${parsedBody.data.mime},
      ${parsedBody.data.bytes},
      ${storageKey},
      'queued',
      'queued',
      now(),
      now()
    )
  `;

  const origin = new URL(req.url).origin;
  const signed = createSignedPutHeaders({ storageKey });

  return Response.json(
    {
      document: {
        id: documentId,
        folder_id: folderId,
        filename: parsedBody.data.filename,
        parse_status: "queued",
        ocr_status: "queued",
      },
      upload: {
        storage_key: storageKey,
        url: `${origin}/documents/${documentId}/upload`,
        method: "PUT",
        headers: {
          "Content-Type": parsedBody.data.mime,
          "X-Orbital-Upload-Expires": String(signed.expires_at_ms),
          "X-Orbital-Upload-Signature": signed.signature,
        },
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/folders/[id]/report/route.ts
```ts
import { z } from "zod";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const RunIdSchema = z.string().trim().min(1).max(200);

type RunRow = {
  id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type ReportRow = {
  id: string;
  question_id: string;
  question: string;
  answer: string;
  status: string;
  notes: string | null;
  provenance_json: unknown;
  payload_schema_version: string | null;
  payload_json: unknown;
  created_at: Date;
  updated_at: Date;
};

function zodIssueSummary(err: unknown): Array<{ code: string; message: string; path: Array<string | number> }> {
  if (!err || typeof err !== "object" || !("issues" in err)) return [];
  const anyErr = err as { issues?: Array<{ code: string; message: string; path: Array<string | number> }> };
  return Array.isArray(anyErr.issues) ? anyErr.issues.map((i) => ({ code: i.code, message: i.message, path: i.path })) : [];
}

function parseRunId(req: Request): string | null {
  const url = new URL(req.url);
  const raw = url.searchParams.get("run_id");
  if (raw === null) return null;
  const parsed = RunIdSchema.safeParse(raw);
  if (!parsed.success) return "__invalid__";
  return parsed.data;
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const folder = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folder[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const runId = parseRunId(req);
  if (runId === "__invalid__") {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid run_id query param.", traceId }),
      { status: 400, headers },
    );
  }

  let run: RunRow | null = null;
  if (runId) {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE id = ${runId}
        AND folder_id = ${folderId}
      LIMIT 1
    `;
    run = runs[0] ?? null;
  } else {
    const runs = await sql<RunRow[]>`
      SELECT id, state, index_version, agent_bundle_version, question_set_version
      FROM runs
      WHERE folder_id = ${folderId}
      ORDER BY created_at DESC
      LIMIT 1
    `;
    run = runs[0] ?? null;
  }

  if (!run) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Run not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const rows = await sql<ReportRow[]>`
    SELECT id, question_id, question, answer, status, notes, provenance_json, payload_schema_version, payload_json, created_at, updated_at
    FROM report_rows
    WHERE run_id = ${run.id}
    ORDER BY created_at ASC, question_id ASC
  `;

  for (const r of rows) {
    const hasSchema = r.payload_schema_version !== null && String(r.payload_schema_version).trim() !== "";
    const hasPayload = r.payload_json !== null && r.payload_json !== undefined;
    if (hasSchema !== hasPayload) {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload is in an inconsistent state.",
          details: { row_id: r.id, question_id: r.question_id },
          traceId,
        }),
        { status: 500, headers },
      );
    }

    if (!hasSchema) continue;

    if (r.payload_schema_version === LIST_PAYLOAD_V0_SCHEMA_VERSION) {
      const parsed = ListPayloadV0Schema.safeParse(r.payload_json);
      if (!parsed.success) {
        return Response.json(
          safeErrorEnvelope({
            code: "INTERNAL",
            message: "Report row payload failed schema validation.",
            details: { row_id: r.id, question_id: r.question_id, issues: zodIssueSummary(parsed.error) },
            traceId,
          }),
          { status: 500, headers },
        );
      }
    } else {
      return Response.json(
        safeErrorEnvelope({
          code: "INTERNAL",
          message: "Report row payload uses an unsupported schema version.",
          details: { row_id: r.id, question_id: r.question_id, payload_schema_version: r.payload_schema_version },
          traceId,
        }),
        { status: 500, headers },
      );
    }
  }

  const rowIds = rows.map((r) => r.id);
  const citations = rowIds.length
    ? await sql<Array<{ id: string; report_row_id: string }>>`
        SELECT id, report_row_id
        FROM citations
        WHERE report_row_id = ANY(${rowIds})
      `
    : [];

  const citationIdsByRow = new Map<string, string[]>();
  for (const c of citations) {
    const existing = citationIdsByRow.get(c.report_row_id);
    if (existing) existing.push(c.id);
    else citationIdsByRow.set(c.report_row_id, [c.id]);
  }

  return Response.json(
    {
      run: {
        id: run.id,
        state: run.state,
        index_version: run.index_version,
        agent_bundle_version: run.agent_bundle_version,
        question_set_version: run.question_set_version,
      },
      rows: rows.map((r) => {
        const cids = citationIdsByRow.get(r.id) ?? [];
        return {
          id: r.id,
          question_id: r.question_id,
          question: r.question,
          answer: r.answer,
          status: r.status,
          citation_ids: r.status === "missing_input" ? [] : cids,
          payload_schema_version: r.payload_schema_version ?? null,
          payload_json: r.payload_json ?? null,
          notes: r.notes ?? null,
          provenance_json: r.provenance_json ?? {},
          created_at: r.created_at.toISOString(),
          updated_at: r.updated_at.toISOString(),
        };
      }),
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/app/(api)/folders/[id]/runs/route.ts
```ts
import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { refreshFolderState } from "../../../../../lib/folderState.server";
import { newId } from "../../../../../lib/ids";
import { enqueueQuickStartRun } from "../../../../../lib/quickStartRunQueue.server";
import { loadQuestionSetV1 } from "../../../../../lib/questionSet.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

const BodySchema = z.object({
  type: z.enum(["quick_start_title_survey"]),
});

const IdempotencyKeySchema = z
  .string()
  .trim()
  .min(1)
  .max(200)
  .regex(/^[A-Za-z0-9._:-]+$/, "Invalid Idempotency-Key");

function agentBundleVersion(): string {
  const configured =
    process.env.ORBITAL_AGENT_BUNDLE_VERSION?.trim() ??
    process.env.AGENT_BUNDLE_VERSION?.trim() ??
    process.env.VERCEL_GIT_COMMIT_SHA?.trim() ??
    "";
  if (!configured) return "git:dev";
  if (/^[a-f0-9]{7,40}$/i.test(configured)) return `git:${configured.slice(0, 7)}`;
  return configured;
}

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

function runResponse(row: RunRow) {
  return {
    run: {
      id: row.id,
      folder_id: row.folder_id,
      state: row.state,
      index_version: row.index_version,
      agent_bundle_version: row.agent_bundle_version,
      question_set_version: row.question_set_version,
    },
  };
}

async function findRunByIdempotencyKey(args: { folderId: string; idempotencyKey: string }): Promise<RunRow | null> {
  const runs = await sql<RunRow[]>`
    SELECT id, folder_id, state, index_version, agent_bundle_version, question_set_version
    FROM runs
    WHERE folder_id = ${args.folderId}
      AND idempotency_key = ${args.idempotencyKey}
    LIMIT 1
  `;
  return runs[0] ?? null;
}

export async function POST(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsedBody = BodySchema.safeParse(body);
  if (!parsedBody.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsedBody.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const rawKey = req.headers.get("Idempotency-Key");
  let idempotencyKey: string | null = null;
  if (rawKey !== null) {
    const parsedKey = IdempotencyKeySchema.safeParse(rawKey);
    if (!parsedKey.success) {
      return Response.json(
        safeErrorEnvelope({
          code: "VALIDATION_ERROR",
          message: "Invalid Idempotency-Key header.",
          details: parsedKey.error.flatten(),
          traceId,
        }),
        { status: 400, headers },
      );
    }
    idempotencyKey = parsedKey.data;

    const existing = await findRunByIdempotencyKey({ folderId: parsedParams.data.id, idempotencyKey });
    if (existing) return Response.json(runResponse(existing), { status: 200, headers });
  }

  const folderId = parsedParams.data.id;
  const folders = await sql<{ id: string; state: string; latest_index_version: string }[]>`
    SELECT id, state, latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!folders[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  // Keep folder state consistent with latest persisted facts before enforcing runnable preconditions.
  await refreshFolderState(folderId);

  const refreshed = await sql<{ state: string; latest_index_version: string }[]>`
    SELECT state, latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = refreshed[0];
  if (!folder) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (folder.state !== "indexed" && folder.state !== "ready") {
    const message =
      folder.state === "failed"
        ? "Folder ingest failed. Retry ingest or re-index."
        : "Folder is not runnable yet.";
    return Response.json(safeErrorEnvelope({ code: "CONFLICT", message, traceId }), { status: 409, headers });
  }

  const { version: questionSetVersion, questionSet } = await loadQuestionSetV1();

  const runId = newId("run");
  const indexVersion = folder.latest_index_version;
  const agentVersion = agentBundleVersion();
  const questionsTotal = questionSet.questions.length;

  try {
    await sql`
      INSERT INTO runs (
        id,
        folder_id,
        type,
        state,
        index_version,
        agent_bundle_version,
        question_set_version,
        idempotency_key,
        trace_id,
        questions_total,
        questions_done,
        created_at,
        updated_at
      )
      VALUES (
        ${runId},
        ${folderId},
        ${parsedBody.data.type},
        'running',
        ${indexVersion},
        ${agentVersion},
        ${questionSetVersion},
        ${idempotencyKey},
        ${traceId},
        ${questionsTotal},
        0,
        now(),
        now()
      )
    `;
  } catch (err: unknown) {
    // Idempotency-key races should return the previously created run.
    const code = typeof err === "object" && err ? (err as { code?: unknown }).code : null;
    if (idempotencyKey && code === "23505") {
      const existing = await findRunByIdempotencyKey({ folderId, idempotencyKey });
      if (existing) return Response.json(runResponse(existing), { status: 200, headers });
    }

    // eslint-disable-next-line no-console
    console.error("runs.insert failed", {
      trace_id: traceId,
      folder_id: folderId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to start run.", traceId }), {
      status: 500,
      headers,
    });
  }

  const stepId = newId("stp");
  const stepKey = `quick_start:${questionSetVersion}:start`;
  await sql`
    INSERT INTO run_steps (
      id,
      run_id,
      step_type,
      state,
      attempt,
      step_key,
      trace_id,
      question_id,
      created_at,
      updated_at
    )
    VALUES (
      ${stepId},
      ${runId},
      'workflow_start',
      'succeeded',
      1,
      ${stepKey},
      ${traceId},
      NULL,
      now(),
      now()
    )
    ON CONFLICT (run_id, step_key) DO NOTHING
  `;

  // eslint-disable-next-line no-console
  console.info("run.created", {
    trace_id: traceId,
    folder_id: folderId,
    run_id: runId,
    step_key: stepKey,
    run_type: parsedBody.data.type,
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
    questions_total: questionsTotal,
  });

  const created: RunRow = {
    id: runId,
    folder_id: folderId,
    state: "running",
    index_version: indexVersion,
    agent_bundle_version: agentVersion,
    question_set_version: questionSetVersion,
  };

  // Fire-and-forget in-process runner (PoC). Row writes are durable + idempotent.
  enqueueQuickStartRun(runId);

  return Response.json(runResponse(created), { status: 200, headers });
}
```

### File: apps/web/app/(api)/runs/[id]/trace/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { verifyRow } from "@legaltech-poc/core/server";

import { assertDevOnlyApi } from "../../../../../lib/devOnlyApi.server";
import { listSeededPackIds, loadSeedSnapshot } from "../../../../../lib/fixtureSeed.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^[A-Za-z0-9_.-]+$/i, "Invalid run id"),
});

const QuerySchema = z.object({
  // Optional escape hatch for fixture seed data where multiple packs may share run ids.
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i)
    .optional(),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function assertAdminAllowed(req: Request):
  | { ok: true }
  | { ok: false; code: "UNAUTHORISED" | "INTERNAL"; message: string } {
  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim() ?? "";
  if (!expected) {
    // Keep production posture strict; allow explicit bypass in dev only.
    const bypassAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_ADMIN_BYPASS === "1";
    if (bypassAllowed) return { ok: true };
    return { ok: false, code: "INTERNAL", message: "Trace export is misconfigured." };
  }

  const provided = req.headers.get("x-orbital-admin-token")?.trim() ?? "";
  if (!provided || !safeEqual(provided, expected)) {
    return { ok: false, code: "UNAUTHORISED", message: "Admin token required." };
  }

  return { ok: true };
}

type SeedSnapshot = NonNullable<ReturnType<typeof loadSeedSnapshot>>;

function findRunInSeedSnapshots(args: {
  runId: string;
  packId?: string;
}):
  | { ok: true; packId: string; snapshot: SeedSnapshot }
  | { ok: false; code: "NOT_FOUND" | "CONFLICT" | "INTERNAL"; message: string; details?: unknown } {
  const packIds = args.packId ? [args.packId] : listSeededPackIds();
  const hits: Array<{ packId: string; snapshot: SeedSnapshot }> = [];

  for (const packId of packIds) {
    let snapshot: SeedSnapshot | null;
    try {
      snapshot = loadSeedSnapshot(packId);
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("loadSeedSnapshot failed", {
        packId,
        message: err instanceof Error ? err.message : String(err),
      });
      return { ok: false, code: "INTERNAL", message: "Failed to load seed snapshot." };
    }

    if (!snapshot) continue;
    if (typeof snapshot.meta.run_id !== "string") continue;
    if (snapshot.meta.run_id !== args.runId) continue;
    hits.push({ packId, snapshot });
  }

  if (hits.length === 0) return { ok: false, code: "NOT_FOUND", message: "Run not found." };
  if (hits.length > 1) {
    return {
      ok: false,
      code: "CONFLICT",
      message: "run_id is ambiguous across seeded packs.",
      details: { packs: hits.map((h) => h.packId) },
    };
  }

  return { ok: true, packId: hits[0]!.packId, snapshot: hits[0]!.snapshot };
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

type RetrievedChunk = { chunk_id: string; score: number | null };

function extractRetrievedChunks(provenance: unknown): RetrievedChunk[] {
  if (!isRecord(provenance)) return [];

  const candidates = Array.isArray(provenance.retrieved)
    ? provenance.retrieved
    : Array.isArray(provenance.retrieved_chunks)
      ? provenance.retrieved_chunks
      : null;
  if (!candidates) return [];

  const out: RetrievedChunk[] = [];
  for (const c of candidates) {
    if (!isRecord(c)) continue;
    const chunkId = typeof c.chunk_id === "string" ? c.chunk_id.trim() : "";
    if (!chunkId) continue;
    const score = typeof c.score === "number" && Number.isFinite(c.score) ? c.score : null;
    out.push({ chunk_id: chunkId, score });
  }
  return out;
}

function safeDurationMs(ms: unknown): number {
  if (typeof ms !== "number" || !Number.isFinite(ms) || ms < 0) return 0;
  return Math.round(ms);
}

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  if (process.env.FEATURE_TRACE_EXPORT !== "1") {
    return Response.json(
      safeErrorEnvelope({ code: "NOT_FOUND", message: "Trace export not enabled.", traceId }),
      { status: 404, headers },
    );
  }

  const admin = assertAdminAllowed(req);
  if (!admin.ok) {
    return Response.json(safeErrorEnvelope({ code: admin.code, message: admin.message, traceId }), {
      status: admin.code === "UNAUTHORISED" ? 403 : 500,
      headers,
    });
  }

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const url = new URL(req.url);
  const parsedQuery = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsedQuery.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsedQuery.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const runId = parsedParams.data.id;
  const packId = parsedQuery.data.pack;

  const found = findRunInSeedSnapshots({ runId, packId });
  if (!found.ok) {
    const status =
      found.code === "NOT_FOUND" ? 404 : found.code === "CONFLICT" ? 409 : found.code === "INTERNAL" ? 500 : 500;
    return Response.json(
      safeErrorEnvelope({
        code: found.code,
        message: found.message,
        details: found.details,
        traceId,
      }),
      { status, headers },
    );
  }

  const snapshot = found.snapshot;

  const results = await Promise.all(
    snapshot.rows.map(async (row) => {
      const citationIds = row.citation_ids ?? [];
      const citations = citationIds
        .map((cid) => {
          const cit = snapshot.citations?.[cid];
          if (!cit) return null;
          return {
            document_id: cit.document_id,
            page_number: cit.page_number,
            snippet: cit.snippet,
            snippet_hash: cit.snippet_hash,
            polygons: cit.polygons,
          };
        })
        .filter((c): c is NonNullable<typeof c> => Boolean(c));

      const missingCount = citationIds.length - citations.length;
      const verify =
        missingCount > 0
          ? {
              verdict: "fail" as const,
              reason_code: "VALIDATION_ERROR",
              reason: `Missing ${missingCount} citation(s) referenced by id.`,
              timings_ms: { total: 0, deterministic: 0 },
            }
          : await verifyRow(
              {
                case_id: snapshot.meta.pack_id,
                question_id: row.question_id,
                question: row.question,
                answer: row.answer,
                citations,
              },
              { mode: "deterministic-only" },
            );

      const retrieved = extractRetrievedChunks((row as { provenance_json?: unknown }).provenance_json);

      return {
        row,
        citationIds,
        verify,
        retrieved,
      };
    }),
  );

  const trace = {
    run: {
      run_id: runId,
      folder_id: snapshot.meta.pack_id,
      state: "completed",
      index_version: typeof snapshot.meta.index_version === "string" ? snapshot.meta.index_version : null,
      agent_bundle_version: typeof snapshot.meta.agent_bundle_version === "string" ? snapshot.meta.agent_bundle_version : null,
      question_set_version: typeof snapshot.meta.question_set_version === "string" ? snapshot.meta.question_set_version : null,
    },
    steps: results.map(({ row, verify }) => ({
      step_key: `verify:${row.question_id}`,
      step_type: "verify_row",
      state: verify.verdict === "pass" ? "succeeded" : "failed",
      attempt: 1,
      duration_ms: safeDurationMs(verify.timings_ms?.total),
      metrics_json: {
        timings_ms: verify.timings_ms,
      },
      error_json:
        verify.verdict === "pass"
          ? null
          : {
              code: verify.reason_code,
              message: `Verification failed (${verify.reason_code}).`,
            },
    })),
    rows: results.map(({ row, citationIds, verify, retrieved }) => ({
      question_id: row.question_id,
      status: row.status,
      citation_ids: citationIds,
      provenance_json: {
        retrieved,
        verification: {
          verdict: verify.verdict,
          reason_code: verify.reason_code,
        },
      },
    })),
  };

  headers.set("Content-Disposition", `attachment; filename=\"trace_${runId}.json\"`);
  return Response.json({ trace }, { status: 200, headers });
}
```

### File: apps/web/app/(api)/spikes/export/csv/route.ts
```ts
import { timingSafeEqual } from "node:crypto";

import { z } from "zod";

import { safeErrorEnvelope } from "@legaltech-poc/core";
import { verifyRow } from "@legaltech-poc/core/server";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { loadSeedSnapshot } from "../../../../../lib/fixtureSeed.server";
import { newId } from "../../../../../lib/ids";
import {
  createSignedGetHeaders,
  putObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
} from "../../../../../lib/objectStore.server";
import { assertSpikesEnabled } from "../../../../../lib/spikes.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";

const ExportKindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);

const BodySchema = z.object({
  // PoC v1: the dev UI is fixture-backed, so `folder_id` maps to pack_id.
  // Keep it allowlisted to prevent arbitrary filesystem reads via fixtureSeed.
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  run_id: z.string().min(1).max(200),
  kind: ExportKindSchema,
  unsafe_override: z.boolean().optional().default(false),
});

function safeEqual(a: string, b: string): boolean {
  const ab = Buffer.from(a);
  const bb = Buffer.from(b);
  if (ab.length !== bb.length) return false;
  return timingSafeEqual(ab, bb);
}

function unsafeOverrideAllowed(req: Request): boolean {
  if (process.env.DEMO_MODE !== "1") return false;
  if (process.env.ALLOW_UNSAFE_EXPORTS !== "1") return false;

  const expected = process.env.ORBITAL_ADMIN_TOKEN?.trim();
  if (!expected) return false;

  const provided = req.headers.get("x-orbital-admin-token")?.trim();
  if (!provided) return false;

  return safeEqual(provided, expected);
}

function csvEscape(val: unknown): string {
  const s = val === null || val === undefined ? "" : String(val);
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function snapshotToCsv(snapshot: ReturnType<typeof loadSeedSnapshot>): string {
  const header = ["question_id", "question", "answer", "status", "citation_ids"].join(",");
  const lines = (snapshot?.rows ?? []).map((r) =>
    [
      csvEscape(r.question_id),
      csvEscape(r.question),
      csvEscape(r.answer),
      csvEscape(r.status),
      csvEscape((r.citation_ids ?? []).join(" ")),
    ].join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

type RowFailure = { question_id: string; reason_code: string };

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const direct = (provenance as { reason_code?: unknown }).reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}

async function collectRowFailures(snapshot: NonNullable<ReturnType<typeof loadSeedSnapshot>>): Promise<RowFailure[]> {
  const failures = new Map<string, string>();

  for (const row of snapshot.rows) {
    // Fail-closed: any explicit citation_failed row blocks export.
    if (row.status === "citation_failed") {
      const reason = extractReasonCode((row as { provenance_json?: unknown }).provenance_json) ?? "VALIDATION_ERROR";
      failures.set(row.question_id, reason);
      continue;
    }

    // Deterministic-only integrity checks: no entailment in 0001.
    const citations = (row.citation_ids ?? [])
      .map((cid) => {
        const cit = snapshot.citations?.[cid];
        if (!cit) return null;
        return {
          document_id: cit.document_id,
          page_number: cit.page_number,
          snippet: cit.snippet,
          snippet_hash: cit.snippet_hash,
          polygons: cit.polygons,
        };
      })
      .filter((c): c is NonNullable<typeof c> => Boolean(c));

    // Missing citations referenced by id is an invariant failure; treat it as fail-closed.
    if (citations.length !== (row.citation_ids ?? []).length) {
      failures.set(row.question_id, "VALIDATION_ERROR");
      continue;
    }

    const res = await verifyRow(
      {
        case_id: snapshot.meta.pack_id,
        question_id: row.question_id,
        question: row.question,
        answer: row.answer,
        citations,
      },
      { mode: "deterministic-only" },
    );

    if (res.verdict === "fail") failures.set(row.question_id, res.reason_code);
  }

  return Array.from(failures.entries()).map(([question_id, reason_code]) => ({ question_id, reason_code }));
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const packId = parsed.data.folder_id;
  const runId = parsed.data.run_id;
  const kind = parsed.data.kind;
  const unsafeOverride = parsed.data.unsafe_override;

  const snapshot = loadSeedSnapshot(packId);
  if (!snapshot) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Seed snapshot not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  if (typeof snapshot.meta.run_id === "string" && snapshot.meta.run_id.trim() && snapshot.meta.run_id !== runId) {
    return Response.json(
      safeErrorEnvelope({
        code: "CONFLICT",
        message: "run_id did not match snapshot.",
        details: { expected: snapshot.meta.run_id },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  const failures = await collectRowFailures(snapshot);
  if (failures.length > 0 && !unsafeOverride) {
    return Response.json(
      safeErrorEnvelope({
        code: "EXPORT_BLOCKED",
        message: `Export blocked: ${failures.length} row(s) failed verification.`,
        details: {
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
        traceId,
      }),
      { status: 409, headers },
    );
  }

  if (unsafeOverride && !unsafeOverrideAllowed(req)) {
    return Response.json(
      safeErrorEnvelope({
        code: "UNAUTHORISED",
        message: "Unsafe override is demo-only.",
        traceId,
      }),
      { status: 403, headers },
    );
  }

  const artefactId = newId("art");
  const createdAt = new Date();
  const csv = snapshotToCsv(snapshot);

  const filename = unsafeOverride ? `${kind}.UNSAFE.csv` : `${kind}.csv`;

  const storageKey = `folders/${packId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid storage key.", traceId }),
      { status: 500, headers },
    );
  }

  const metadataKey = `folders/${packId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metadataKey);
  if (!metaOk.ok) {
    return Response.json(
      safeErrorEnvelope({ code: "INTERNAL", message: "Generated invalid metadata key.", traceId }),
      { status: 500, headers },
    );
  }

  await putObject({ storageKey, bytes: Buffer.from(csv, "utf8") });
  await putObject({
    storageKey: metadataKey,
    bytes: Buffer.from(
      JSON.stringify(
        {
          id: artefactId,
          type: "csv",
          kind,
          filename,
          storage_key: storageKey,
          source_run_id: runId,
          created_at: createdAt.toISOString(),
          unsafe_override: unsafeOverride,
          blocked: failures.length > 0,
          citation_failed_count: failures.length,
          failed_question_ids: failures.map((f) => f.question_id),
          reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
        },
        null,
        2,
      ) + "\n",
      "utf8",
    ),
  });

  // Persist the artefact record so it can be listed after a refresh.
  // Pack IDs are treated as folder IDs in the fixture-backed dev UI.
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${packId}, ${packId}, 'ready', 'v1', now(), now())
    ON CONFLICT (id) DO NOTHING
  `;

  await sql`
    INSERT INTO artefacts (
      id,
      folder_id,
      type,
      kind,
      filename,
      storage_key,
      source_run_id,
      metadata_json,
      created_at,
      updated_at
    )
    VALUES (
      ${artefactId},
      ${packId},
      'csv',
      ${kind},
      ${filename},
      ${storageKey},
      ${runId},
      ${sql.json({
        unsafe_override: unsafeOverride,
        blocked: failures.length > 0,
        citation_failed_count: failures.length,
        failed_question_ids: failures.map((f) => f.question_id),
        reason_codes: Array.from(new Set(failures.map((f) => f.reason_code))).sort(),
      })},
      ${createdAt},
      ${createdAt}
    )
  `;

  const signed = createSignedGetHeaders({ storageKey });
  const downloadUrl = `/export/csv/download?${new URLSearchParams({
    folder_id: packId,
    artefact_id: artefactId,
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
  }).toString()}`;

  return Response.json(
    {
      artefact: {
        id: artefactId,
        type: "csv",
        kind,
        filename,
        storage_key: storageKey,
        source_run_id: runId,
        created_at: createdAt.toISOString(),
        download_url: downloadUrl,
      },
    },
    { status: 200, headers },
  );
}
```

### File: apps/web/lib/basicAuth.ts
```ts
function safeEq(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  // Avoid timingSafeEqual here so this file can be used in middleware (edge).
  let out = 0;
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return out === 0;
}

function decodeBasicCredentials(authHeader: string): { user: string; pass: string } | null {
  const m = authHeader.match(/^Basic\s+(.+)$/i);
  if (!m) return null;

  let decoded: string;
  try {
    // Edge runtime: prefer atob. Node runtime: fall back to Buffer.
    if (typeof (globalThis as unknown as { atob?: unknown }).atob === "function") {
      decoded = (globalThis as unknown as { atob: (s: string) => string }).atob(m[1]!);
    } else {
      const B = (globalThis as unknown as { Buffer?: { from: (s: string, enc: string) => { toString: (enc: string) => string } } })
        .Buffer;
      if (!B) return null;
      decoded = B.from(m[1]!, "base64").toString("utf8");
    }
  } catch {
    return null;
  }

  const idx = decoded.indexOf(":");
  if (idx < 0) return null;
  return { user: decoded.slice(0, idx), pass: decoded.slice(idx + 1) };
}

export function basicAuthRequiredResponse(): Response {
  return new Response("Authentication required.", {
    status: 401,
    headers: { "WWW-Authenticate": 'Basic realm="Orbital demo-prod"' },
  });
}

export function basicAuthMisconfiguredResponse(): Response {
  return new Response("Demo-prod auth is misconfigured.", { status: 500 });
}

export function verifyBasicAuthHeader(authHeader: string | null): boolean {
  const expectedUser = process.env.BASIC_AUTH_USER?.trim() ?? "";
  const expectedPass = process.env.BASIC_AUTH_PASS?.trim() ?? "";
  if (!expectedUser || !expectedPass) return false;

  if (!authHeader) return false;
  const creds = decodeBasicCredentials(authHeader);
  if (!creds) return false;
  return safeEq(creds.user, expectedUser) && safeEq(creds.pass, expectedPass);
}
```

### File: apps/web/lib/db.server.ts
```ts
import "server-only";

import postgres from "postgres";

import { ensureAllSchemas } from "./db/schema/index.server";

export type Sql = ReturnType<typeof postgres>;

type GlobalDb = typeof globalThis & {
  __orbitalSql?: Sql;
  __orbitalSchemaReady?: Promise<void>;
};

function databaseUrl(): string {
  const url = process.env.DATABASE_URL?.trim();
  if (url) {
    // Some Sprite environments route `localhost` to an IPv6 host that Postgres
    // does not accept by default. Normalise to IPv4 for local/dev.
    if (process.env.NODE_ENV !== "production" && url.includes("@localhost:")) {
      return url.replace("@localhost:", "@127.0.0.1:");
    }
    return url;
  }

  // PoC default for local dev (matches docker-compose.yml).
  if (process.env.NODE_ENV !== "production") {
    return "postgresql://orbital:orbital@127.0.0.1:5432/orbital";
  }

  // Important: Next.js evaluates route modules at build time with
  // `NODE_ENV=production`, even when a database is not available/required.
  // Defer the hard failure until the first DB operation is attempted.
  return "";
}

function createThrowingSql(message: string): Sql {
  const err = new Error(message);
  const fn = (() => {
    throw err;
  }) as unknown as Sql;

  return new Proxy(fn, {
    apply() {
      throw err;
    },
    get(_target, prop) {
      // Ensure even helper calls like `sql.json()` fail loudly and consistently.
      if (prop === "unsafe") return createThrowingSql(message);
      return new Proxy(() => {
        throw err;
      }, {
        apply() {
          throw err;
        },
      });
    },
  });
}

function createSql(): Sql {
  const url = databaseUrl();
  if (!url) {
    return createThrowingSql("DATABASE_URL is required in production.");
  }

  return postgres(url, {
    // Keep the pool small; Next dev reloads modules frequently.
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
  });
}

const g = globalThis as GlobalDb;

function getSql(): Sql {
  if (!g.__orbitalSql) g.__orbitalSql = createSql();
  return g.__orbitalSql;
}

// Lazy, build-safe SQL client.
// Next.js may import route modules during `next build` without runtime env vars.
export const sql: Sql = new Proxy((() => {}) as unknown as Sql, {
  apply(_target, _thisArg, argArray) {
    const real = getSql() as unknown as (...args: unknown[]) => unknown;
    return real(...argArray);
  },
  get(_target, prop) {
    const real = getSql() as unknown as Record<string | symbol, unknown>;
    const value = real[prop];
    if (typeof value === "function") {
      return (value as (...args: unknown[]) => unknown).bind(real);
    }
    return value;
  },
});

async function ensureSchemaInner(): Promise<void> {
  await ensureAllSchemas(sql);
}

export async function ensureSchema(): Promise<void> {
  if (!g.__orbitalSchemaReady) {
    g.__orbitalSchemaReady = ensureSchemaInner();
  }
  await g.__orbitalSchemaReady;
}
```

### File: apps/web/lib/demoMode.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@legaltech-poc/core";

export function isDemoModeEnabled(): boolean {
  // Demo tooling must remain dev-only even if someone mistakenly enables the flag elsewhere.
  if (process.env.NODE_ENV !== "development") return false;
  return process.env.DEMO_MODE === "1";
}

export function assertDemoModeEnabledApi(traceId: string, headers: Headers): Response | null {
  if (isDemoModeEnabled()) return null;
  return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Demo mode is disabled.", traceId }), {
    status: 403,
    headers,
  });
}
```

### File: apps/web/lib/devOnly.ts
```ts
import { notFound } from "next/navigation";

import { isDevOrDemoProd } from "./runtimeMode";

export function assertDevOnly(): void {
  if (process.env.NODE_ENV !== "development") notFound();
}

export function assertDevOrDemoProd(): void {
  // Keep spikes and unsafe tooling dev-only, but allow the demo-prod runtime to
  // reach the core demo journey surfaces explicitly.
  if (!isDevOrDemoProd()) notFound();
}
```

### File: apps/web/lib/devOnlyApi.server.ts
```ts
import "server-only";

import { safeErrorEnvelope } from "@legaltech-poc/core";

import { isDevOrDemoProd } from "./runtimeMode";

export function assertDevOnlyApi(traceId: string, headers: Headers): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), {
    status: 404,
    headers,
  });
}

export function assertDevOrDemoProdApi(traceId: string, headers: Headers): Response | null {
  if (isDevOrDemoProd()) return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), {
    status: 404,
    headers,
  });
}
```

### File: apps/web/lib/exportCsv.server.ts
```ts
import "server-only";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema } from "@legaltech-poc/core";
import type { ListPayloadV0 } from "@legaltech-poc/core";
import { z } from "zod";

export const ExportCsvKindSchema = z.enum(["requirements_tracker", "exceptions_table", "survey_issues"]);
export type ExportCsvKind = z.infer<typeof ExportCsvKindSchema>;

const HEADERS_BY_KIND: Record<ExportCsvKind, readonly string[]> = {
  requirements_tracker: [
    "requirement_id",
    "requirement_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
  exceptions_table: [
    "exception_id",
    "exception_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
  survey_issues: [
    "issue_id",
    "issue_text",
    "source_question_id",
    "row_status",
    "source_answer",
    "failure_code",
    "citations",
    "citation_ids",
    "notes",
  ],
};

export type CitationForCsv = {
  filename: string;
  page: number;
};

export type SourceRowForCsv = {
  source_question_id: string;
  row_status: string;
  source_answer: string;
  failure_code: string;
  notes: string | null;
};

function csvEscape(val: unknown): string {
  let s = val === null || val === undefined ? "" : String(val);
  // Prevent CSV formula injection in Excel/Sheets. Quoting is not sufficient.
  // Prefix when the first non-whitespace character is a formula sentinel.
  if (/^[\t\r\n ]*[=+\-@]/.test(s)) s = `'${s}`;
  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

function asNonEmptyTrimmedString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  return s;
}

function joinNotes(parts: Array<string | null>): string {
  const nonEmpty = parts.map((p) => asNonEmptyTrimmedString(p)).filter((p): p is string => Boolean(p));
  return nonEmpty.join("\n\n");
}

function splitCompoundId(id: string): Array<string | number> {
  return id
    .split(":")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => (/^\d+$/.test(seg) ? Number(seg) : seg.toLowerCase()));
}

function compareCompoundId(a: string, b: string): number {
  if (a === b) return 0;

  const as = splitCompoundId(a);
  const bs = splitCompoundId(b);
  const n = Math.min(as.length, bs.length);

  for (let i = 0; i < n; i++) {
    const av = as[i];
    const bv = bs[i];

    if (typeof av === "number" && typeof bv === "number") {
      if (av !== bv) return av < bv ? -1 : 1;
      continue;
    }

    if (typeof av === "string" && typeof bv === "string") {
      const cmp = av.localeCompare(bv);
      if (cmp !== 0) return cmp;
      continue;
    }

    // Keep ordering deterministic even when segment types mismatch.
    if (typeof av === "number") return -1;
    if (typeof bv === "number") return 1;
  }

  if (as.length !== bs.length) return as.length < bs.length ? -1 : 1;
  return a.localeCompare(b);
}

function stableUniq<T>(items: readonly T[], key: (item: T) => string): T[] {
  const seen = new Set<string>();
  const out: T[] = [];
  for (const it of items) {
    const k = key(it);
    if (seen.has(k)) continue;
    seen.add(k);
    out.push(it);
  }
  return out;
}

export function renderCitationColumns(args: {
  citationIds: readonly string[];
  citationById: ReadonlyMap<string, CitationForCsv>;
}): { citations: string; citation_ids: string } {
  const expanded = args.citationIds.map((id) => {
    const cit = args.citationById.get(id);
    if (!cit) {
      throw new Error(`Missing citation: ${id}`);
    }
    return { id, filename: cit.filename, page: cit.page };
  });

  // Sort by (filename asc, page asc, citation_id asc) before rendering.
  expanded.sort((a, b) => {
    const fn = a.filename.localeCompare(b.filename);
    if (fn !== 0) return fn;
    if (a.page !== b.page) return a.page < b.page ? -1 : 1;
    return a.id.localeCompare(b.id);
  });

  const uniqFilenamePage = stableUniq(expanded, (c) => `${c.filename}:${c.page}`);
  const citations = uniqFilenamePage.map((c) => `${c.filename}:${c.page}`).join("; ");

  const uniqIds = Array.from(new Set(args.citationIds));
  uniqIds.sort((a, b) => a.localeCompare(b));
  const citation_ids = uniqIds.join("; ");

  return { citations, citation_ids };
}

function assertListPayloadV0(payloadSchemaVersion: string | null, payloadJson: unknown): ListPayloadV0 {
  if (payloadSchemaVersion !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(`Unsupported payload_schema_version: ${String(payloadSchemaVersion ?? "null")}`);
  }
  const parsed = ListPayloadV0Schema.safeParse(payloadJson);
  if (!parsed.success) {
    throw new Error(`Invalid list_payload_v0 payload: ${parsed.error.message}`);
  }
  return parsed.data;
}

export function csvFromSourceRow(args: {
  kind: ExportCsvKind;
  sourceRow: SourceRowForCsv;
  payloadSchemaVersion: string | null;
  payloadJson: unknown;
  citationById: ReadonlyMap<string, CitationForCsv>;
  // Demo-only unsafe exports must not leak untrusted evidence for citation_failed-derived items.
  unsafeOverride?: boolean;
}): string {
  const headers = HEADERS_BY_KIND[args.kind];
  if (!headers) throw new Error(`Unsupported kind: ${String(args.kind)}`);

  const payload = assertListPayloadV0(args.payloadSchemaVersion, args.payloadJson);
  if (payload.kind !== args.kind) {
    throw new Error(`Payload kind mismatch: expected ${args.kind}, got ${payload.kind}`);
  }

  type Row = { id: string; citations: string; record: Record<string, string> };
  const rows: Row[] = [];

  for (const item of payload.items) {
    const itemNotes = "notes" in item ? (item.notes ?? null) : null;
    const baseNotes = joinNotes([itemNotes, args.sourceRow.notes]);
    const redactUntrustedEvidence =
      args.unsafeOverride === true && args.sourceRow.row_status === "citation_failed";

    const notes = redactUntrustedEvidence ? (baseNotes ? `UNSAFE: ${baseNotes}` : "UNSAFE: ") : baseNotes;

    const { citations, citation_ids } = redactUntrustedEvidence
      ? { citations: "", citation_ids: "" }
      : renderCitationColumns({
          citationIds: item.citation_ids,
          citationById: args.citationById,
        });

    if (args.kind === "requirements_tracker") {
      if (item.kind !== "requirements_tracker_item") {
        throw new Error(`Unexpected item.kind for requirements_tracker: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          requirement_id: item.item_id,
          requirement_text: item.requirement,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    if (args.kind === "exceptions_table") {
      if (item.kind !== "exceptions_table_item") {
        throw new Error(`Unexpected item.kind for exceptions_table: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          exception_id: item.item_id,
          exception_text: item.type,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    if (args.kind === "survey_issues") {
      if (item.kind !== "survey_issue_item") {
        throw new Error(`Unexpected item.kind for survey_issues: ${item.kind}`);
      }
      rows.push({
        id: item.item_id,
        citations,
        record: {
          issue_id: item.item_id,
          issue_text: item.description,
          source_question_id: args.sourceRow.source_question_id,
          row_status: args.sourceRow.row_status,
          source_answer: args.sourceRow.source_answer,
          failure_code: args.sourceRow.failure_code,
          citations,
          citation_ids,
          notes,
        },
      });
      continue;
    }

    // Exhaustiveness check.
    throw new Error(`Unhandled kind: ${String(args.kind)}`);
  }

  rows.sort((a, b) => {
    const idCmp = compareCompoundId(a.id, b.id);
    if (idCmp !== 0) return idCmp;
    const c = a.citations.localeCompare(b.citations);
    if (c !== 0) return c;
    return 0;
  });

  const lines = [
    headers.join(","),
    ...rows.map((row) => headers.map((h) => csvEscape(row.record[h] ?? "")).join(",")),
  ];
  return lines.join("\n") + "\n";
}

export function reasonCodeFromProvenance(provenance: unknown): string | null {
  if (!provenance || typeof provenance !== "object" || Array.isArray(provenance)) return null;
  const rec = provenance as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  return null;
}
```

### File: apps/web/lib/fixtureSeed.server.ts
```ts
import "server-only";

import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

const SeedStatusSchema = z.enum(["needs_review", "reviewed", "missing_input", "citation_failed"]);

export const SeedCitationSchema = z.object({
  // Back-compat: older snapshots may not include document_id yet.
  document_id: z.string().min(1).optional(),
  document_filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+\.pdf$/i, "Invalid document filename"),
  page_number: z.number().int().positive(),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
});

export type SeedCitation = z.infer<typeof SeedCitationSchema>;

export type ResolvedSeedCitation = Omit<SeedCitation, "document_id"> & { document_id: string };

export const SeedSnapshotSchema = z.object({
  meta: z
    .object({
      pack_id: z.string().min(1),
    })
    .passthrough(),
  rows: z.array(
    z
      .object({
        question_id: z.string().min(1),
        question: z.string().min(1),
        answer: z.string(),
        status: SeedStatusSchema,
        citation_ids: z.array(z.string().min(1)),
        notes: z.string().nullable().optional(),
      })
      .passthrough(),
  ),
  citations: z.record(z.string().min(1), SeedCitationSchema),
});

export type SeedSnapshot = z.infer<typeof SeedSnapshotSchema>;
export type ResolvedSeedSnapshot = Omit<SeedSnapshot, "citations"> & { citations: Record<string, ResolvedSeedCitation> };

function seedRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/fixture-seed");
}

export function listSeededPackIds(): string[] {
  const root = seedRoot();
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^pack_\d{2}_[a-z0-9_]+$/i.test(e.name))
    .map((e) => e.name)
    .sort();
}

export function seedSnapshotPath(packId: string): string {
  return path.join(seedRoot(), packId, "snapshot.json");
}

export function loadSeedSnapshot(packId: string): ResolvedSeedSnapshot | null {
  const filePath = seedSnapshotPath(packId);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = SeedSnapshotSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    // Keep errors explicit in dev; this is a dev-only tracer bullet.
    throw new Error(`Invalid seed snapshot (${filePath}): ${parsed.error.message}`);
  }

  const citations: Record<string, ResolvedSeedCitation> = {};
  for (const [citationId, cit] of Object.entries(parsed.data.citations ?? {})) {
    citations[citationId] = {
      ...cit,
      document_id: cit.document_id ?? fixtureDocumentId({ packId, filename: cit.document_filename }),
    };
  }

  return { ...parsed.data, citations };
}

export function saveSeedSnapshot(packId: string, snapshot: SeedSnapshot): void {
  // Keep this dev-only tracer bullet strict: refuse to persist invalid snapshots.
  const parsed = SeedSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new Error(`Refusing to save invalid seed snapshot (${packId}): ${parsed.error.message}`);
  }

  const filePath = seedSnapshotPath(packId);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  // Best-effort atomic write on POSIX: write temp file then rename.
  const tmpPath = path.join(dir, `.snapshot.tmp.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tmpPath, JSON.stringify(parsed.data, null, 2) + "\n", "utf8");
  fs.renameSync(tmpPath, filePath);
}
```

### File: apps/web/lib/folderState.server.ts
```ts
import "server-only";

import { ensureSchema, sql } from "./db.server";

export type FolderState = "empty" | "ingesting" | "indexed" | "ready" | "failed";

type DocRow = {
  id: string;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
  page_count: number | null;
  extraction_quality: number | null;
};

export async function deriveFolderState(folderId: string): Promise<FolderState> {
  await ensureSchema();

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  const folder = folders[0];
  if (!folder) throw new Error("FOLDER_NOT_FOUND");

  const docs = await sql<DocRow[]>`
    SELECT id, parse_status, ocr_status, page_count, extraction_quality
    FROM documents
    WHERE folder_id = ${folderId}
    ORDER BY created_at ASC
  `;

  if (docs.length === 0) return "empty";

  if (docs.some((d) => d.parse_status === "failed" || d.ocr_status === "failed")) return "failed";

  const allTerminalSuccess = docs.every((d) => d.parse_status === "parsed" && d.ocr_status === "done");
  if (!allTerminalSuccess) return "ingesting";

  // All docs ingested; ensure chunks exist for the latest index version.
  const docIds = docs.map((d) => d.id);
  const chunks = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM chunks
    WHERE index_version = ${folder.latest_index_version}
      AND document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const chunked = new Map(chunks.map((r) => [r.document_id, r.n]));
  if (docIds.some((id) => (chunked.get(id) ?? 0) <= 0)) return "ingesting";

  // Health checks for "ready".
  const meetsQuality = docs.every((d) => (d.extraction_quality ?? 0) >= 0.6);
  if (!meetsQuality) return "indexed";

  const pageCounts = new Map(docs.map((d) => [d.id, d.page_count ?? null]));
  if ([...pageCounts.values()].some((n) => typeof n !== "number" || n <= 0)) return "indexed";

  const pageRows = await sql<{ document_id: string; n: number }[]>`
    SELECT document_id, count(*)::int AS n
    FROM document_pages
    WHERE document_id = ANY(${sql.array(docIds)})
    GROUP BY document_id
  `;
  const pages = new Map(pageRows.map((r) => [r.document_id, r.n]));
  const pagesMatch = docIds.every((id) => {
    const expected = pageCounts.get(id);
    if (typeof expected !== "number" || expected <= 0) return false;
    return (pages.get(id) ?? 0) === expected;
  });

  return pagesMatch ? "ready" : "indexed";
}

export async function refreshFolderState(folderId: string): Promise<FolderState> {
  const state = await deriveFolderState(folderId);
  await sql`
    UPDATE folders
    SET state = ${state}, updated_at = now()
    WHERE id = ${folderId}
  `;
  return state;
}
```

### File: apps/web/lib/httpRange.server.ts
```ts
import "server-only";

export function parseSingleRangeHeader(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!Number.isSafeInteger(size) || size <= 0) return null;
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const firstDash = range.indexOf("-");
  if (firstDash === -1) return null;
  if (range.indexOf("-", firstDash + 1) !== -1) return null;

  const startStr = range.slice(0, firstDash).trim();
  const endStr = range.slice(firstDash + 1).trim();
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  if (!hasStart && !hasEnd) return null;

  function parseNonNegativeInt(val: string): number | null {
    if (!/^[0-9]+$/.test(val)) return null;
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n < 0) return null;
    return n;
  }

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = parseNonNegativeInt(endStr);
    if (suffixLen === null || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    const parsedStart = parseNonNegativeInt(startStr);
    if (parsedStart === null) return null;
    start = parsedStart;

    if (!hasEnd) {
      end = size - 1;
    } else {
      const parsedEnd = parseNonNegativeInt(endStr);
      if (parsedEnd === null) return null;
      end = parsedEnd;
    }

    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}
```

### File: apps/web/lib/ids.ts
```ts
import { randomUUID } from "node:crypto";

export function newId(prefix: string): string {
  return `${prefix}_${randomUUID()}`;
}
```

### File: apps/web/lib/memoDocx.server.ts
```ts
import "server-only";

import {
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
} from "docx";

import { type ListPayloadV0 } from "@legaltech-poc/core";

type RunMeta = {
  id: string;
  index_version: string;
  agent_bundle_version: string;
  question_set_version: string;
};

type FolderMeta = {
  id: string;
  name: string;
};

export type MemoCitation = {
  id: string;
  document_filename: string;
  page_number: number;
};

type MissingInput = {
  question_id: string;
  question: string;
  checklist: string[];
};

function sortCitations(citations: MemoCitation[]): MemoCitation[] {
  return citations
    .slice()
    .sort(
      (a, b) =>
        a.document_filename.localeCompare(b.document_filename) ||
        a.page_number - b.page_number ||
        a.id.localeCompare(b.id),
    );
}

function sourcesLine(citations: MemoCitation[]): string {
  const ordered = sortCitations(citations);
  const parts = ordered.map((c) => `${c.document_filename}:${c.page_number} (${c.id})`);
  return `Sources: ${parts.join("; ")}`;
}

function bullet(text: string, level = 0): Paragraph {
  return new Paragraph({ text, bullet: { level } });
}

function resolveCitations(citationIds: string[], byId: Map<string, MemoCitation>): MemoCitation[] {
  const out: MemoCitation[] = [];
  for (const cid of citationIds) {
    const cit = byId.get(cid);
    if (!cit) {
      throw new Error(`CITATION_NOT_FOUND:${cid}`);
    }
    out.push(cit);
  }
  return out;
}

export async function renderMemoDocx(args: {
  folder: FolderMeta;
  run: RunMeta;
  generatedAt: Date;
  requirements: ListPayloadV0;
  exceptions: ListPayloadV0;
  surveyIssues: ListPayloadV0;
  missingInputs: MissingInput[];
  citationsById: Map<string, MemoCitation>;
}): Promise<Uint8Array> {
  const requirementsItems = args.requirements.items
    .filter((it) => it.kind === "requirements_tracker_item")
    .slice()
    .sort((a, b) => a.bi_item - b.bi_item);

  const exceptionItems = args.exceptions.items
    .filter((it) => it.kind === "exceptions_table_item")
    .slice()
    .sort((a, b) => a.bii_item - b.bii_item);

  const surveyIssueItems = args.surveyIssues.items
    .filter((it) => it.kind === "survey_issue_item")
    .slice()
    .sort((a, b) => a.item_id.localeCompare(b.item_id));

  const paragraphs: Paragraph[] = [];

  paragraphs.push(new Paragraph({ text: "Memo: Title + Survey Summary", heading: HeadingLevel.HEADING_1 }));
  paragraphs.push(
    new Paragraph({
      text: `Generated for ${args.folder.name} (${args.folder.id}).`,
    }),
  );

  paragraphs.push(bullet(`Requirements: ${requirementsItems.length} item(s)`));
  paragraphs.push(bullet(`Exceptions: ${exceptionItems.length} item(s)`));
  paragraphs.push(bullet(`Survey issues: ${surveyIssueItems.length} item(s)`));
  paragraphs.push(bullet(`Missing inputs: ${args.missingInputs.length} item(s)`));

  paragraphs.push(new Paragraph({ text: "Matter metadata", heading: HeadingLevel.HEADING_2 }));
  paragraphs.push(bullet(`Folder: ${args.folder.name} (${args.folder.id})`));
  paragraphs.push(bullet(`Run: ${args.run.id}`));
  paragraphs.push(bullet(`Generated at: ${args.generatedAt.toISOString()}`));
  paragraphs.push(bullet(`Index version: ${args.run.index_version}`));
  paragraphs.push(bullet(`Agent bundle version: ${args.run.agent_bundle_version}`));
  paragraphs.push(bullet(`Question set version: ${args.run.question_set_version}`));

  paragraphs.push(new Paragraph({ text: "Requirements", heading: HeadingLevel.HEADING_2 }));
  if (!requirementsItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of requirementsItems) {
      paragraphs.push(bullet(`B-I ${it.bi_item}: ${it.requirement} (Owner: ${it.owner}; Status: ${it.item_status})`));
      if (it.notes && it.notes.trim()) paragraphs.push(bullet(`Notes: ${it.notes.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Exceptions", heading: HeadingLevel.HEADING_2 }));
  if (!exceptionItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of exceptionItems) {
      const recorded = it.recorded_date ? `; Recorded: ${it.recorded_date}` : "";
      const inst = it.instrument_no ? `; Instrument: ${it.instrument_no}` : "";
      paragraphs.push(
        bullet(
          `B-II ${it.bii_item}: ${it.type} (${it.item_status}; match: ${it.match_status}${recorded}${inst})`,
        ),
      );
      if (it.notes && it.notes.trim()) paragraphs.push(bullet(`Notes: ${it.notes.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Survey issues", heading: HeadingLevel.HEADING_2 }));
  if (!surveyIssueItems.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const it of surveyIssueItems) {
      const code = it.issue_code ? ` (${it.issue_code})` : "";
      paragraphs.push(bullet(`${it.issue_type}${code}: ${it.description}`));
      if (it.impact && it.impact.trim()) paragraphs.push(bullet(`Impact: ${it.impact.trim()}`, 1));
      if (it.suggested_fix && it.suggested_fix.trim()) paragraphs.push(bullet(`Suggested fix: ${it.suggested_fix.trim()}`, 1));
      if (it.citation_ids.length) {
        const cits = resolveCitations(it.citation_ids, args.citationsById);
        paragraphs.push(bullet(sourcesLine(cits), 1));
      }
    }
  }

  paragraphs.push(new Paragraph({ text: "Missing inputs", heading: HeadingLevel.HEADING_2 }));
  if (!args.missingInputs.length) {
    paragraphs.push(bullet("(none)"));
  } else {
    for (const row of args.missingInputs) {
      paragraphs.push(bullet(`${row.question_id}: ${row.question}`));
      for (const item of row.checklist) paragraphs.push(bullet(item, 1));
    }
  }

  // Optional: evidence index. Keep it deterministic and lightweight.
  const usedCitationIds = new Set<string>();
  for (const it of requirementsItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  for (const it of exceptionItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  for (const it of surveyIssueItems) for (const cid of it.citation_ids) usedCitationIds.add(cid);
  const usedCitations = Array.from(usedCitationIds)
    .map((cid) => args.citationsById.get(cid) ?? null)
    .filter((c): c is MemoCitation => Boolean(c));

  if (usedCitations.length) {
    paragraphs.push(new Paragraph({ text: "Evidence index", heading: HeadingLevel.HEADING_2 }));
    for (const cit of sortCitations(usedCitations)) {
      paragraphs.push(bullet(`${cit.document_filename}:${cit.page_number} (${cit.id})`));
    }
  }

  const doc = new Document({
    sections: [
      {
        children: paragraphs,
      },
    ],
  });

  const buf = await Packer.toBuffer(doc);
  return new Uint8Array(buf);
}
```

### File: apps/web/lib/objectStore.server.ts
```ts
import "server-only";

import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

type GlobalObj = typeof globalThis & {
  __orbitalObjectStoreSecret?: string;
};

const STORAGE_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/documents\/[A-Za-z0-9_-]+\.pdf$/;
const ARTEFACT_CSV_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.csv$/i;
const ARTEFACT_DOCX_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.docx$/i;
const ARTEFACT_META_KEY_RE = /^folders\/[A-Za-z0-9_-]+\/artefacts\/art_[0-9a-f-]+\.meta\.json$/i;

function objectStoreRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/object-store");
}

export function validateStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!STORAGE_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactCsvStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactDocxStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactMetadataStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (!ARTEFACT_META_KEY_RE.test(storageKey)) return { ok: false, reason: "INVALID_STORAGE_KEY" };
  return { ok: true };
}

export function validateArtefactStorageKey(storageKey: string): { ok: true } | { ok: false; reason: string } {
  if (ARTEFACT_CSV_KEY_RE.test(storageKey)) return { ok: true };
  if (ARTEFACT_DOCX_KEY_RE.test(storageKey)) return { ok: true };
  return { ok: false, reason: "INVALID_STORAGE_KEY" };
}

function resolveObjectPath(storageKey: string): string {
  const base = objectStoreRoot();
  const candidate = path.resolve(base, storageKey);
  if (!candidate.startsWith(base + path.sep)) throw new Error("PATH_TRAVERSAL");
  return candidate;
}

function secret(): string {
  const fromEnv = process.env.OBJECT_STORE_SIGNING_SECRET;
  if (fromEnv && fromEnv.trim()) return fromEnv.trim();

  // Fail closed unless explicitly allowed in dev.
  const devFallbackAllowed = process.env.NODE_ENV === "development" && process.env.ALLOW_DEV_OBJECT_STORE_SECRET === "1";
  if (!devFallbackAllowed) {
    throw new Error("OBJECT_STORE_SIGNING_SECRET_MISSING");
  }

  // Dev-only fallback so local demo flows work out of the box.
  //
  // Next.js may execute route handlers in separate isolates during dev. A global-only
  // secret can differ between those isolates, which breaks signed URL verification
  // across endpoints. Persisting to the object-store directory keeps it stable.
  const g = globalThis as GlobalObj;
  const base = objectStoreRoot();
  fs.mkdirSync(base, { recursive: true });
  const secretPath = path.resolve(base, ".dev-signing-secret");

  // Disk secret is canonical (so all isolates converge).
  try {
    const fromDisk = fs.readFileSync(secretPath, "utf8").trim();
    if (fromDisk) {
      g.__orbitalObjectStoreSecret = fromDisk;
      return fromDisk;
    }
  } catch (err) {
    const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : null;
    if (code !== "ENOENT") throw err;
  }

  const existing = g.__orbitalObjectStoreSecret?.trim();
  const candidate = existing && existing.length ? existing : `dev-${randomBytes(32).toString("hex")}`;

  // Best-effort persist, then read back to handle concurrent writers.
  try {
    fs.writeFileSync(secretPath, candidate, { flag: "wx", mode: 0o600 });
  } catch (err) {
    const code = err instanceof Error ? (err as NodeJS.ErrnoException).code : null;
    if (code !== "EEXIST") throw err;
  }

  try {
    const fromDisk = fs.readFileSync(secretPath, "utf8").trim();
    if (fromDisk) {
      g.__orbitalObjectStoreSecret = fromDisk;
      return fromDisk;
    }
  } catch {
    // Fall back to the in-memory secret.
  }

  g.__orbitalObjectStoreSecret = candidate;
  return candidate;
}

function b64url(input: Buffer): string {
  return input
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

const SIGNATURE_PAYLOAD_VERSION = "v1";

function sign(args: { purpose: string; storageKey: string; expiresAtMs: number }): string {
  const payload = `${SIGNATURE_PAYLOAD_VERSION}\n${args.purpose}\n${args.storageKey}\n${args.expiresAtMs}`;
  const digest = createHmac("sha256", secret()).update(payload).digest();
  return b64url(digest);
}

export function verifySignature(args: { purpose: string; storageKey: string; expiresAtMs: number; sig: string }): boolean {
  const expiresAtMs = args.expiresAtMs;
  if (!Number.isFinite(expiresAtMs)) return false;

  // Defensive-in-depth: signatures are not valid once expired, even if the HMAC matches.
  const now = Date.now();
  if (expiresAtMs < now) return false;

  // Cap far-future signatures so callers can't accidentally mint "near-permanent" URLs.
  const maxFutureMs = 24 * 60 * 60 * 1000;
  if (expiresAtMs > now + maxFutureMs) return false;

  const expected = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs: args.expiresAtMs });
  const a = Buffer.from(expected);
  const b = Buffer.from(args.sig);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

function createSignedHeaders(args: {
  purpose: string;
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  const expiresInSeconds = args.expiresInSeconds ?? 10 * 60;
  const expiresAtMs = Date.now() + expiresInSeconds * 1000;
  const signature = sign({ purpose: args.purpose, storageKey: args.storageKey, expiresAtMs });
  return { expires_at_ms: expiresAtMs, signature };
}

export function createSignedPutHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "put", ...args });
}

export function createSignedGetHeaders(args: {
  storageKey: string;
  expiresInSeconds?: number;
}): { expires_at_ms: number; signature: string } {
  return createSignedHeaders({ purpose: "get", ...args });
}

export function objectExists(storageKey: string): boolean {
  const p = resolveObjectPath(storageKey);
  return fs.existsSync(p);
}

function sha256Digest(bytes: Uint8Array): string {
  const hash = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hash}`;
}

async function writeObjectFile(p: string, bytes: Uint8Array, opts?: { writeOnce?: boolean }): Promise<void> {
  fs.mkdirSync(path.dirname(p), { recursive: true });
  if (opts?.writeOnce) {
    await fs.promises.writeFile(p, bytes, { flag: "wx" });
    return;
  }
  await fs.promises.writeFile(p, bytes);
}

export async function putObject(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes);
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function putObjectWriteOnce(args: {
  storageKey: string;
  bytes: Uint8Array;
}): Promise<{ bytesWritten: number; sha256: string }> {
  const p = resolveObjectPath(args.storageKey);
  await writeObjectFile(p, args.bytes, { writeOnce: true });
  return { bytesWritten: args.bytes.byteLength, sha256: sha256Digest(args.bytes) };
}

export async function readObject(storageKey: string): Promise<Uint8Array> {
  const p = resolveObjectPath(storageKey);
  const buf = await fs.promises.readFile(p);
  return new Uint8Array(buf);
}

export async function statObject(storageKey: string): Promise<fs.Stats> {
  const p = resolveObjectPath(storageKey);
  return fs.promises.stat(p);
}

export function createObjectReadStream(
  storageKey: string,
  opts?: { start?: number; end?: number },
): fs.ReadStream {
  const p = resolveObjectPath(storageKey);
  return fs.createReadStream(p, opts);
}
```

### File: apps/web/lib/overlayHighlight.ts
```ts
import type { SVGProps } from "react";

export const overlayHighlightPolygonProps = {
  fill: "rgb(var(--secondary) / 0.35)",
  stroke: "rgb(var(--secondary) / 0.7)",
  strokeWidth: 2,
} satisfies Pick<SVGProps<SVGPolygonElement>, "fill" | "stroke" | "strokeWidth">;
```

### File: apps/web/lib/questionSet.server.ts
```ts
import "server-only";

import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

const QuestionSchema = z.object({
  question_id: z.string().min(1),
  group: z.string().min(1),
  question: z.string().min(1),
  response_kind: z.string().min(1),
  artefact_kind: z.string().min(1).optional(),
  payload_schema_version: z.string().min(1).optional(),
});

const QuestionSetSchema = z.object({
  question_set_id: z.string().min(1),
  question_set_version_format: z.string().min(1),
  questions: z.array(QuestionSchema).min(1),
});

type QuestionSet = z.infer<typeof QuestionSetSchema>;

type GlobalCache = typeof globalThis & {
  __orbitalQuestionSetV1?: Promise<{ questionSet: QuestionSet; version: string }>;
};

function stableStringify(value: unknown): string {
  if (value === null) return "null";
  if (typeof value === "string") return JSON.stringify(value);
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "null";
  if (typeof value === "boolean") return value ? "true" : "false";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    return `{${keys.map((k) => `${JSON.stringify(k)}:${stableStringify(obj[k])}`).join(",")}}`;
  }
  // JSON does not support undefined/functions/symbols; treat them as null.
  return "null";
}

function sha256Hex(bytes: string): string {
  return createHash("sha256").update(bytes, "utf8").digest("hex");
}

function questionSetV1Path(): string {
  // Keep the source of truth in docs until we extract it into a dedicated package.
  // In Next dev, `process.cwd()` resolves to `apps/web`, so probe both locations.
  const rel = "docs/04-projects/02-features/0002_quick-start-engine/specs/question_set_v1.json";
  const direct = path.resolve(process.cwd(), rel);
  if (fs.existsSync(direct)) return direct;
  return path.resolve(process.cwd(), "../..", rel);
}

export async function loadQuestionSetV1(): Promise<{ questionSet: QuestionSet; version: string }> {
  const g = globalThis as GlobalCache;
  if (!g.__orbitalQuestionSetV1) {
    g.__orbitalQuestionSetV1 = (async () => {
      const filePath = questionSetV1Path();
      const rawText = fs.readFileSync(filePath, "utf8");
      const rawJson = JSON.parse(rawText) as unknown;
      const parsed = QuestionSetSchema.parse(rawJson);

      // v1 is pinned as 1.0 for the PoC; the hash guards immutability.
      const canonical = stableStringify(rawJson);
      const hex = sha256Hex(canonical);
      const version = `qs:0002:v1.0:sha256:${hex}`;

      return { questionSet: parsed, version };
    })();
  }
  return g.__orbitalQuestionSetV1;
}
```

### File: apps/web/lib/quickStartRunProcessor.server.ts
```ts
import "server-only";

import {
  LIST_PAYLOAD_V0_SCHEMA_VERSION,
  ListPayloadV0KindSchema,
  ListPayloadV0Schema,
  emptyListPayloadV0,
} from "@legaltech-poc/core";

import { ensureSchema, sql } from "./db.server";
import { newId } from "./ids";
import { loadQuestionSetV1 } from "./questionSet.server";
import { safeErrMessage } from "./safeErrMessage";

type RunRow = {
  id: string;
  folder_id: string;
  state: string;
  question_set_version: string;
  trace_id: string | null;
  questions_total: number;
  questions_done: number;
};

type FailureCounts = Record<string, number>;

type JsonArg = Parameters<typeof sql.json>[0];

function missingInputRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Not found in provided documents.",
    status: "missing_input" as const,
    notes: null as string | null,
    provenance_json: {
      missing_docs_checklist: [
        {
          label: "Upload the referenced document(s)",
          confidence: 1,
          signals: [
            {
              type: "phrase",
              value: args.question,
              source: "system",
            },
          ],
        },
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function citationFailedRow(args: { folderId: string; questionSetVersion: string; questionId: string; question: string }) {
  return {
    folder_id: args.folderId,
    question_set_version: args.questionSetVersion,
    question_id: args.questionId,
    question: args.question,
    answer: "Unable to produce locked citations in this slice.",
    status: "citation_failed" as const,
    notes: null as string | null,
    provenance_json: {
      reason_code: "NO_CITATIONS",
      checklist: [
        "Confirm the correct PDFs are uploaded for this folder.",
        "Re-run the workflow after retrieval+locking is implemented.",
      ],
    },
    payload_schema_version: null as string | null,
    payload_json: null as unknown | null,
  };
}

function attachListPayloadIfNeeded<T extends { payload_schema_version: string | null; payload_json: unknown | null }>(
  row: T,
  question: { response_kind: string; artefact_kind?: string; payload_schema_version?: string },
): T {
  if (question.response_kind !== "list_payload") return row;

  if (question.payload_schema_version !== LIST_PAYLOAD_V0_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported payload_schema_version for list_payload: ${String(question.payload_schema_version ?? "null")}`,
    );
  }

  const kind = ListPayloadV0KindSchema.parse(question.artefact_kind);
  const payload = emptyListPayloadV0(kind);
  ListPayloadV0Schema.parse(payload);

  return {
    ...row,
    payload_schema_version: LIST_PAYLOAD_V0_SCHEMA_VERSION,
    payload_json: payload,
  } as T;
}

function asReasonCode(val: unknown): string | null {
  if (!val || typeof val !== "object" || Array.isArray(val)) return null;
  const rec = val as Record<string, unknown>;
  const direct = rec.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();
  const verify = rec.verify;
  if (verify && typeof verify === "object" && !Array.isArray(verify)) {
    const s = (verify as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  const verification = rec.verification;
  if (verification && typeof verification === "object" && !Array.isArray(verification)) {
    const s = (verification as Record<string, unknown>).reason_code;
    if (typeof s === "string" && s.trim()) return s.trim();
  }
  return null;
}

async function recomputeRunProgress(args: { runId: string }): Promise<{ questionsDone: number; failureCounts: FailureCounts }> {
  const done = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM report_rows
    WHERE run_id = ${args.runId}
  `;
  const questionsDone = done[0]?.n ?? 0;

  // Keep failure taxonomy deterministic across retries by deriving from stored rows.
  const failed = await sql<Array<{ provenance_json: unknown }>>`
    SELECT provenance_json
    FROM report_rows
    WHERE run_id = ${args.runId}
      AND status = 'citation_failed'
  `;
  const counts: FailureCounts = {};
  for (const r of failed) {
    const reasonCode = asReasonCode(r.provenance_json) ?? "VALIDATION_ERROR";
    counts[reasonCode] = (counts[reasonCode] ?? 0) + 1;
  }

  return { questionsDone, failureCounts: counts };
}

export async function processQuickStartRun(runId: string): Promise<void> {
  await ensureSchema();

  const runs = await sql<RunRow[]>`
    SELECT id, folder_id, state, question_set_version, trace_id, questions_total, questions_done
    FROM runs
    WHERE id = ${runId}
    LIMIT 1
  `;
  const run = runs[0];
  if (!run) return;
  if (run.state !== "running") return;

  const { version: currentQuestionSetVersion, questionSet } = await loadQuestionSetV1();
  if (currentQuestionSetVersion !== run.question_set_version) {
    await sql`
      UPDATE runs
      SET state = 'failed',
          error_json = ${sql.json({
            code: "QUESTION_SET_MISMATCH",
            message: "Pinned question_set_version does not match current question set.",
          })},
          updated_at = now()
      WHERE id = ${runId}
    `;
    return;
  }

  const docCounts = await sql<{ n: number }[]>`
    SELECT COUNT(*)::int as n
    FROM documents
    WHERE folder_id = ${run.folder_id}
      AND upload_completed_at IS NOT NULL
      AND parse_status = 'parsed'
      AND ocr_status = 'done'
  `;
  const hasDocs = (docCounts[0]?.n ?? 0) > 0;

  const existing = await sql<Array<{ question_id: string }>>`
    SELECT question_id
    FROM report_rows
    WHERE run_id = ${runId}
  `;
  const existingQids = new Set(existing.map((r) => r.question_id));

  // If we resumed a running run (server restart, retries), make progress reflect
  // already-written rows immediately so polling UIs stay consistent.
  if (existingQids.size > 0) {
    const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
    await sql`
      UPDATE runs
      SET questions_done = ${questionsDone},
          failure_counts_json = ${sql.json(failureCounts)},
          updated_at = now()
      WHERE id = ${runId}
    `;
  }

  for (const q of questionSet.questions) {
    const stepKey = `quick_start:${run.question_set_version}:question:${q.question_id}:write_row`;
    const stepId = newId("stp");
    const rowId = newId("row");
    const traceId = run.trace_id ?? newId("trc");

    // If the row already exists (retries, restarts), skip all side effects.
    if (existingQids.has(q.question_id)) continue;

    const row = hasDocs
      ? citationFailedRow({
          folderId: run.folder_id,
          questionSetVersion: run.question_set_version,
          questionId: q.question_id,
          question: q.question,
        })
      : missingInputRow({
          folderId: run.folder_id,
          questionSetVersion: run.question_set_version,
          questionId: q.question_id,
          question: q.question,
        });
    let rowWithPayload: typeof row = row;
    try {
      rowWithPayload = attachListPayloadIfNeeded(row, q);
    } catch {
      // If the question set metadata is malformed, fail safely without crashing the run.
      rowWithPayload = citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });
      rowWithPayload.provenance_json = {
        reason_code: "VALIDATION_ERROR",
        checklist: ["Question set payload metadata is invalid for this row."],
      };
    }

    const reasonCode =
      rowWithPayload.status === "citation_failed"
        ? String((rowWithPayload.provenance_json as { reason_code?: unknown }).reason_code ?? "VALIDATION_ERROR")
        : null;

    let wrote = false;
    try {
      wrote = await sql.begin(async (tx) => {
        const t = tx as unknown as typeof sql;

        // Step idempotency: deterministic step_key prevents duplicate row writes on retries.
        const steps = await t<{ id: string }[]>`
          INSERT INTO run_steps (
            id,
            run_id,
            step_type,
            state,
            attempt,
            step_key,
            trace_id,
            question_id,
            metrics_json,
            error_json,
            created_at,
            updated_at
          )
          VALUES (
            ${stepId},
            ${runId},
            'write_row',
            'succeeded',
            1,
            ${stepKey},
            ${traceId},
            ${q.question_id},
            ${t.json({ row_status: rowWithPayload.status })},
            NULL,
            now(),
            now()
          )
          ON CONFLICT (run_id, step_key) DO NOTHING
          RETURNING id
        `;
        if (!steps[0]) return false;

        const payload = rowWithPayload.payload_json ?? null;
        const payloadJson = payload === null ? null : t.json(payload as JsonArg);

        const inserted = await t<{ id: string }[]>`
          INSERT INTO report_rows (
            id,
            run_id,
            folder_id,
            question_set_version,
            question_id,
            question,
            answer,
            status,
            notes,
            provenance_json,
            payload_schema_version,
            payload_json,
            created_at,
            updated_at
          )
          VALUES (
            ${rowId},
            ${runId},
            ${rowWithPayload.folder_id},
            ${rowWithPayload.question_set_version},
            ${rowWithPayload.question_id},
            ${rowWithPayload.question},
            ${rowWithPayload.answer},
            ${rowWithPayload.status},
            ${rowWithPayload.notes},
            ${t.json(rowWithPayload.provenance_json)},
            ${rowWithPayload.payload_schema_version},
            ${payloadJson},
            now(),
            now()
          )
          ON CONFLICT (run_id, question_id) DO NOTHING
          RETURNING id
        `;

        if (!inserted[0]) return false;

        const reasonKey = reasonCode ?? "VALIDATION_ERROR";
        await t`
          UPDATE runs
          SET questions_done = LEAST(questions_total, questions_done + 1),
              failure_counts_json = CASE
                WHEN ${rowWithPayload.status} = 'citation_failed' THEN jsonb_set(
                  failure_counts_json,
                  ARRAY[${reasonKey}]::text[],
                  to_jsonb(COALESCE((failure_counts_json->>${reasonKey})::int, 0) + 1),
                  true
                )
                ELSE failure_counts_json
              END,
              updated_at = now()
          WHERE id = ${runId}
        `;

        return true;
      });
    } catch (err) {
      // Row-level failure should not crash the run. Best-effort: emit a terminal
      // citation_failed row with a safe reason_code, then continue.
      // eslint-disable-next-line no-console
      console.error("run.step failed", {
        run_id: runId,
        trace_id: traceId,
        step_key: stepKey,
        question_id: q.question_id,
        message: safeErrMessage(err),
      });

      const fallback = citationFailedRow({
        folderId: run.folder_id,
        questionSetVersion: run.question_set_version,
        questionId: q.question_id,
        question: q.question,
      });
      fallback.provenance_json = {
        reason_code: "VALIDATION_ERROR",
        checklist: [
          "Retry the run (step idempotency should avoid duplicates).",
          "Inspect server logs using the run_id and trace_id for correlation.",
        ],
      };
      let fallbackWithPayload: typeof fallback = fallback;
      try {
        fallbackWithPayload = attachListPayloadIfNeeded(fallback, q);
      } catch {
        // Keep the fallback row writable even if question metadata is malformed.
      }

      try {
        wrote = await sql.begin(async (tx) => {
          const t = tx as unknown as typeof sql;

          await t`
            INSERT INTO run_steps (
              id,
              run_id,
              step_type,
              state,
              attempt,
              step_key,
              trace_id,
              question_id,
              metrics_json,
              error_json,
              created_at,
              updated_at
            )
            VALUES (
              ${newId("stp")},
              ${runId},
              'write_row',
              'succeeded',
              1,
              ${stepKey},
              ${traceId},
              ${q.question_id},
              ${t.json({ row_status: "citation_failed", reason_code: "VALIDATION_ERROR" })},
              NULL,
              now(),
              now()
            )
            ON CONFLICT (run_id, step_key) DO NOTHING
          `;

          const payload = fallbackWithPayload.payload_json ?? null;
          const payloadJson = payload === null ? null : t.json(payload as JsonArg);

          const inserted = await t<{ id: string }[]>`
            INSERT INTO report_rows (
              id,
              run_id,
              folder_id,
              question_set_version,
              question_id,
              question,
              answer,
              status,
              notes,
              provenance_json,
              payload_schema_version,
              payload_json,
              created_at,
              updated_at
            )
            VALUES (
              ${newId("row")},
              ${runId},
              ${fallbackWithPayload.folder_id},
              ${fallbackWithPayload.question_set_version},
              ${fallbackWithPayload.question_id},
              ${fallbackWithPayload.question},
              ${fallbackWithPayload.answer},
              ${fallbackWithPayload.status},
              ${fallbackWithPayload.notes},
              ${t.json(fallbackWithPayload.provenance_json)},
              ${fallbackWithPayload.payload_schema_version},
              ${payloadJson},
              now(),
              now()
            )
            ON CONFLICT (run_id, question_id) DO NOTHING
            RETURNING id
          `;

          if (!inserted[0]) return false;

          await t`
            UPDATE runs
            SET questions_done = LEAST(questions_total, questions_done + 1),
                failure_counts_json = jsonb_set(
                  failure_counts_json,
                  ARRAY['VALIDATION_ERROR']::text[],
                  to_jsonb(COALESCE((failure_counts_json->>'VALIDATION_ERROR')::int, 0) + 1),
                  true
                ),
                updated_at = now()
            WHERE id = ${runId}
          `;
          return true;
        });
      } catch {
        // If we can't write the fallback row, just continue; finalization will
        // mark the run partial if not all rows were persisted.
      }
    }

    if (wrote) {
      existingQids.add(q.question_id);
      // eslint-disable-next-line no-console
      console.info("run.step", {
        run_id: runId,
        trace_id: run.trace_id ?? null,
        step_key: stepKey,
        question_id: q.question_id,
        row_status: rowWithPayload.status,
        reason_code: reasonCode,
      });

      // Yield a small window so polling clients can observe incremental row writes.
      await new Promise((r) => setTimeout(r, 150));
    }
  }

  const { questionsDone, failureCounts } = await recomputeRunProgress({ runId });
  await sql`
    UPDATE runs
    SET questions_done = ${questionsDone},
        failure_counts_json = ${sql.json(failureCounts)},
        updated_at = now()
    WHERE id = ${runId}
  `;

  await sql`
    UPDATE runs
    SET state = 'completed',
        updated_at = now()
    WHERE id = ${runId}
      AND state = 'running'
      AND questions_done >= questions_total
  `;

  // If we couldn't persist terminal rows for every question, avoid leaving the
  // run stuck in running. Keep it inspectable with a safe error envelope.
  if (questionsDone < run.questions_total) {
    await sql`
      UPDATE runs
      SET state = 'partial',
          error_json = ${sql.json({
            code: "ROW_WRITE_INCOMPLETE",
            message: "Run completed with missing terminal rows.",
            details: { questions_total: run.questions_total, questions_done: questionsDone },
          })},
          updated_at = now()
      WHERE id = ${runId}
        AND state = 'running'
    `;
  }

  // eslint-disable-next-line no-console
  console.info("run.completed", { run_id: runId, trace_id: run.trace_id ?? null });
}
```

### File: apps/web/lib/quickStartRunQueue.server.ts
```ts
import "server-only";

import { enqueueJob } from "./jobs/jobQueue.server";
import { kickInlineJobWorker } from "./jobs/jobWorker.server";
import { safeErrMessage } from "./safeErrMessage";

export function enqueueQuickStartRun(runId: string): void {
  void enqueueJob({ type: "execute_run", jobKey: `run:${runId}`, payload: { run_id: runId } })
    .then(() => {
      kickInlineJobWorker();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.enqueue failed", { job_type: "execute_run", run_id: runId, message: safeErrMessage(err) });
    });
}
```

### File: apps/web/lib/runtimeMode.ts
```ts
export type OrbitalMode = "dev" | "demo-prod" | "prod";

function normaliseMode(raw: string | undefined): OrbitalMode | null {
  const s = raw?.trim();
  if (!s) return null;
  if (s === "dev" || s === "demo-prod" || s === "prod") return s;
  return null;
}

// NOTE: This module is imported by both Node/server code and Next middleware (edge),
// so it must not use Node-only APIs or `server-only`.
export function orbitalMode(): OrbitalMode {
  const fromEnv = normaliseMode(process.env.ORBITAL_MODE);
  if (fromEnv) {
    // Guardrail: never allow dev posture on a non-dev build. If someone sets
    // ORBITAL_MODE=dev in production, fail closed to "prod" instead of silently
    // enabling dev-only surfaces without demo-prod middleware protections.
    if (fromEnv === "dev" && process.env.NODE_ENV !== "development") return "prod";
    return fromEnv;
  }

  // Local development should not require ORBITAL_MODE.
  if (process.env.NODE_ENV === "development") return "dev";

  // Default posture: locked down unless explicitly opted into demo-prod.
  return "prod";
}

export function isDevOrDemoProd(): boolean {
  const m = orbitalMode();
  return m === "dev" || m === "demo-prod";
}

export function isDemoProd(): boolean {
  return orbitalMode() === "demo-prod";
}
```

### File: apps/web/lib/safeErrMessage.ts
```ts
export function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}
```

### File: apps/web/lib/safePdfFilename.server.ts
```ts
import "server-only";

const DEFAULT_FILENAME = "document.pdf";

export function safePdfFilename(val: unknown): string {
  if (typeof val !== "string") return DEFAULT_FILENAME;
  const s = val.trim();
  if (!s) return DEFAULT_FILENAME;
  if (s.length > 200) return DEFAULT_FILENAME;
  if (!/^[A-Za-z0-9_.-]+\.pdf$/i.test(s)) return DEFAULT_FILENAME;
  return s;
}
```

### File: apps/web/lib/spikes.server.ts
```ts
import { safeErrorEnvelope } from "@legaltech-poc/core";

export function assertSpikesEnabled(traceId: string, headers: Headers): Response | null {
  if (process.env.SPIKES_ENABLED === "1") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), { status: 404, headers });
}
```

### File: apps/web/lib/trace.server.ts
```ts
import { newId } from "./ids";

export function createTraceContext(): { traceId: string; headers: Headers } {
  const traceId = newId("trc");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Trace-Id": traceId,
  });
  return { traceId, headers };
}
```

### File: apps/web/lib/validateNormPolygons.ts
```ts
import type { NormPolygons } from "@legaltech-poc/core";

export function validateNormPolygons(polygons: NormPolygons): string | null {
  if (!polygons.length) return "NO_POLYGONS";
  for (const poly of polygons) {
    if (poly.length < 3) return "POLYGON_TOO_SMALL";
    for (const [x, y] of poly) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return "NON_FINITE";
      if (x < 0 || x > 1 || y < 0 || y > 1) return "OUT_OF_RANGE";
    }
  }
  return null;
}
```

### File: apps/web/lib/ai/gateway.server.ts
```ts
import "server-only";

import { createGateway } from "@ai-sdk/gateway";

export const DEFAULT_CHAT_MODEL_ID = "anthropic/claude-haiku-4.5";
// Documented "later switch" target (PR0 decision). Not used by default.
export const LATER_CHAT_MODEL_ID = "anthropic/claude-sonnet-4.5";

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`${name} is required.`);
  }
  return value;
}

function gatewayProvider() {
  // Fail closed; do not attempt OIDC auth in PR0.
  const apiKey = requireEnv("AI_GATEWAY_API_KEY");

  return createGateway({ apiKey });
}

/**
 * Returns a LanguageModel handle for chat (AI SDK).
 *
 * Default is Haiku; override with `LLM_MODEL_CHAT`.
 * Future toggle target is documented by `LATER_CHAT_MODEL_ID`.
 */
export function chatModel() {
  const modelId = process.env.LLM_MODEL_CHAT?.trim() || DEFAULT_CHAT_MODEL_ID;
  return gatewayProvider().languageModel(modelId);
}

/**
 * Returns an EmbeddingModel handle (AI SDK).
 *
 * Require `EMBED_MODEL` to force explicit selection for retrieval slices.
 */
export function embeddingModel() {
  const modelId = requireEnv("EMBED_MODEL");
  return gatewayProvider().textEmbeddingModel(modelId);
}
```

### File: apps/web/lib/ingest/ingestProcessor.server.ts
```ts
import "server-only";

import { chunkPageCharWindowV0 } from "@legaltech-poc/core";
import { hashSnippet } from "@legaltech-poc/core/citations/snippet";

import { ensureSchema, sql } from "../db.server";
import { refreshFolderState } from "../folderState.server";
import { newId } from "../ids";
import { readObject } from "../objectStore.server";
import { safeErrMessage } from "../safeErrMessage";

type PdfJsTextItem = { str?: string };

type PdfJsPage = {
  getTextContent: () => Promise<{ items: PdfJsTextItem[] }>;
};

type PdfJsDoc = {
  numPages: number;
  getPage: (pageNumber: number) => Promise<PdfJsPage>;
};

type PdfJsModule = {
  GlobalWorkerOptions?: { workerSrc?: string };
  getDocument: (opts: { data: Uint8Array }) => { promise: Promise<PdfJsDoc> };
};

// Defensive caps: this ingest path runs in-process and writes extracted text into Postgres.
const MAX_PAGES = 200;
const MAX_TEXT_CHARS_PER_PAGE = 50_000;
const MAX_TOTAL_TEXT_CHARS = 2_000_000;

let pdfjsPromise: Promise<PdfJsModule> | null = null;
let pdfjsConfigured = false;

async function loadPdfjs(): Promise<PdfJsModule> {
  if (!pdfjsPromise) {
    pdfjsPromise = import("pdfjs-dist/legacy/build/pdf.mjs") as unknown as Promise<PdfJsModule>;
  }
  const pdfjs = await pdfjsPromise;
  if (!pdfjsConfigured) {
    // Next's server bundler relocates pdf.js files into vendor chunks, breaking
    // the default relative worker import ("./pdf.worker.mjs"). Force a package
    // specifier so Node can resolve it from node_modules at runtime.
    if (pdfjs.GlobalWorkerOptions) {
      pdfjs.GlobalWorkerOptions.workerSrc = "pdfjs-dist/legacy/build/pdf.worker.mjs";
    }
    pdfjsConfigured = true;
  }
  return pdfjs;
}

type DocForIngest = {
  id: string;
  folder_id: string;
  storage_key: string | null;
  upload_completed_at: string | null;
  parse_status: "queued" | "parsing" | "parsed" | "failed";
  ocr_status: "queued" | "running" | "done" | "failed";
};

type SafeErrorJson = { code: string; message: string };

function safeError(code: string, message: string): SafeErrorJson {
  return { code, message };
}

async function failDocument(args: { documentId: string; folderId: string; error: SafeErrorJson }): Promise<void> {
  await sql`
    UPDATE documents
    SET parse_status = 'failed',
        ocr_status = 'failed',
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.documentId}
  `;
  await refreshFolderState(args.folderId);
}

export async function processDocumentIngest(documentId: string): Promise<void> {
  await ensureSchema();

  const docs = await sql<DocForIngest[]>`
    SELECT id, folder_id, storage_key, upload_completed_at, parse_status, ocr_status
    FROM documents
    WHERE id = ${documentId}
    LIMIT 1
  `;
  const doc = docs[0];
  if (!doc) return;

  // Idempotency: don't restart successful/failed ingests.
  if (doc.parse_status === "parsed" && doc.ocr_status === "done") return;
  if (doc.parse_status === "failed" || doc.ocr_status === "failed") return;

  if (!doc.storage_key) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("MISSING_STORAGE_KEY", "Document is missing storage_key."),
    });
    return;
  }

  if (!doc.upload_completed_at) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_NOT_COMPLETE", "Upload has not completed yet."),
    });
    return;
  }

  const claimed = await sql<Array<{ id: string }>>`
    UPDATE documents
    SET parse_status = 'parsing',
        ocr_status = 'running',
        error_json = NULL,
        updated_at = now()
    WHERE id = ${documentId}
      AND parse_status = 'queued'
      AND ocr_status = 'queued'
    RETURNING id
  `;
  // Another worker (or a duplicate job) already moved the document out of queued.
  if (!claimed[0]) return;
  await refreshFolderState(doc.folder_id);
  // Yield a tiny window so polling UIs can observe progress states.
  await new Promise((r) => setTimeout(r, 150));

  let bytes: Uint8Array;
  try {
    bytes = await readObject(doc.storage_key);
  } catch {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("UPLOAD_MISSING", "Raw PDF not found for storage_key."),
    });
    return;
  }

  const pdfjs = await loadPdfjs();

  let pdf: PdfJsDoc;
  try {
    pdf = await pdfjs.getDocument({ data: bytes }).promise;
  } catch (err) {
    // Server-side only: keep client errors safe, but log detail for debugging.
    // Do not log raw PDF bytes.
    // eslint-disable-next-line no-console
    console.error("pdfjs getDocument failed", {
      documentId,
      message: safeErrMessage(err),
    });
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PARSE_FAILED", "Unable to parse PDF."),
    });
    return;
  }

  const pageCount = typeof pdf.numPages === "number" && Number.isFinite(pdf.numPages) ? pdf.numPages : 0;
  if (pageCount <= 0) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("PDF_PAGE_COUNT_INVALID", "Parsed PDF had no pages."),
    });
    return;
  }

  if (pageCount > MAX_PAGES) {
    await failDocument({
      documentId,
      folderId: doc.folder_id,
      error: safeError("INGEST_TOO_MANY_PAGES", `PDF has too many pages (${pageCount}); max is ${MAX_PAGES}.`),
    });
    return;
  }

  await sql`
    UPDATE documents
    SET parse_status = 'parsed',
        page_count = ${pageCount},
        updated_at = now()
    WHERE id = ${documentId}
  `;
  await refreshFolderState(doc.folder_id);

  type LayoutJson = {
    source: "pdfjs";
    schema_version: "layout_v0";
    has_geometry: boolean;
    item_count: number;
  };

  const pages: Array<{ page_number: number; text: string; layout_json: LayoutJson }> = [];
  let totalChars = 0;
  let remainingChars = MAX_TOTAL_TEXT_CHARS;

  for (let pageNumber = 1; pageNumber <= pageCount; pageNumber++) {
    const page = await pdf.getPage(pageNumber);
    const content = await page.getTextContent();
    const items = Array.isArray(content.items) ? content.items : [];
    const rawText = items.map((i) => String(i?.str ?? "")).join(" ").replace(/\s+/g, " ").trim();
    const perPageCapped = rawText.length > MAX_TEXT_CHARS_PER_PAGE ? rawText.slice(0, MAX_TEXT_CHARS_PER_PAGE) : rawText;
    const text = remainingChars <= 0 ? "" : perPageCapped.slice(0, remainingChars);
    remainingChars = Math.max(0, remainingChars - text.length);
    totalChars += text.length;

    const layout_json: LayoutJson = {
      source: "pdfjs",
      schema_version: "layout_v0",
      has_geometry: false,
      item_count: items.length,
    };

    pages.push({ page_number: pageNumber, text, layout_json });
  }

  const avgCharsPerPage = totalChars / pageCount;
  // Heuristic PoC score: clean, text-heavy PDFs should typically clear the
  // 0.60 "ready" threshold; scans with little/no text should remain low.
  const extractionQuality = Math.max(0, Math.min(1, avgCharsPerPage / 600));
  const extractionQualityMethod = "pdfjs_text_chars_per_page_v2";
  const extractionMethod = "pdfjs";

  const folders = await sql<{ latest_index_version: string }[]>`
    SELECT latest_index_version
    FROM folders
    WHERE id = ${doc.folder_id}
    LIMIT 1
  `;
  const indexVersion = folders[0]?.latest_index_version ?? "v1";

  const chunksToWrite: Array<{
    chunk_index: number;
    page_start: number;
    page_end: number;
    text: string;
    metadata_json: { chunker_id: string; page_number: number; char_start: number; char_end: number };
    text_hash: string;
  }> = [];

  let chunkIndex = 0;
  for (const p of pages) {
    const pageChunks = chunkPageCharWindowV0({ page_number: p.page_number, text: p.text });
    for (const c of pageChunks) {
      const textHash = hashSnippet(c.text);
      chunksToWrite.push({
        chunk_index: chunkIndex,
        page_start: c.page_number,
        page_end: c.page_number,
        text: c.text,
        metadata_json: {
          chunker_id: c.chunker_id,
          page_number: c.page_number,
          char_start: c.char_start,
          char_end: c.char_end,
        },
        text_hash: textHash,
      });
      chunkIndex += 1;
    }
  }

  try {
    await sql.begin(async (tx) => {
      // postgres.js TransactionSql types lose call signatures; cast for tagged template usage.
      const t = tx as unknown as typeof sql;

      await t`DELETE FROM document_pages WHERE document_id = ${documentId}`;
      for (const p of pages) {
        await t`
          INSERT INTO document_pages (id, document_id, page_number, text, layout_json, created_at, updated_at)
          VALUES (
            ${newId("pg")},
            ${documentId},
            ${p.page_number},
            ${p.text},
            ${t.json(p.layout_json)},
            now(),
            now()
          )
        `;
      }

      await t`
        UPDATE documents
        SET ocr_status = 'done',
            extraction_quality = ${extractionQuality},
            metadata_json = metadata_json || ${t.json({
              extraction_method: extractionMethod,
              extraction_has_geometry: false,
              extraction_quality_method: extractionQualityMethod,
            })},
            updated_at = now()
        WHERE id = ${documentId}
      `;

      // Deterministic, page-bounded chunking suitable for citations.
      // Use UPSERT to make re-ingest idempotent by (document_id, index_version, chunk_index).
      for (const c of chunksToWrite) {
        await t`
          INSERT INTO chunks (
            id,
            document_id,
            index_version,
            chunk_index,
            page_start,
            page_end,
            text,
            metadata_json,
            text_hash,
            created_at
          )
          VALUES (
            ${newId("chk")},
            ${documentId},
            ${indexVersion},
            ${c.chunk_index},
            ${c.page_start},
            ${c.page_end},
            ${c.text},
            ${t.json(c.metadata_json)},
            ${c.text_hash},
            now()
          )
          ON CONFLICT (document_id, index_version, chunk_index) DO UPDATE SET
            page_start = EXCLUDED.page_start,
            page_end = EXCLUDED.page_end,
            text = EXCLUDED.text,
            metadata_json = EXCLUDED.metadata_json,
            text_hash = EXCLUDED.text_hash
        `;
      }

      // If chunk count decreases (caps/tuning/version changes), delete stale tails.
      await t`
        DELETE FROM chunks
        WHERE document_id = ${documentId}
          AND index_version = ${indexVersion}
          AND chunk_index >= ${chunksToWrite.length}
      `;
    });
  } catch {
    await sql`
      UPDATE documents
      SET ocr_status = 'failed',
          error_json = ${sql.json(safeError("INGEST_FAILED", "Ingest failed while writing extracted pages."))},
          updated_at = now()
      WHERE id = ${documentId}
    `;
    await refreshFolderState(doc.folder_id);
    return;
  }

  await refreshFolderState(doc.folder_id);
}
```

### File: apps/web/lib/ingest/ingestQueue.server.ts
```ts
import "server-only";

import { enqueueJob } from "../jobs/jobQueue.server";
import { kickInlineJobWorker } from "../jobs/jobWorker.server";
import { safeErrMessage } from "../safeErrMessage";

export function enqueueDocumentIngest(documentId: string): void {
  void enqueueJob({ type: "ingest_document", jobKey: `document:${documentId}`, payload: { document_id: documentId } })
    .then(() => {
      kickInlineJobWorker();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.enqueue failed", {
        job_type: "ingest_document",
        document_id: documentId,
        message: safeErrMessage(err),
      });
    });
}
```

### File: apps/web/lib/jobs/jobQueue.server.ts
```ts
import "server-only";

import { z } from "zod";

import { ensureSchema, sql } from "../db.server";
import { newId } from "../ids";

export const JobTypeSchema = z.enum(["ingest_document", "execute_run"]);
export type JobType = z.infer<typeof JobTypeSchema>;

export type JobState = "queued" | "running" | "succeeded" | "failed";

export type JobRow = {
  id: string;
  type: JobType;
  state: JobState;
  job_key: string;
  payload_json: unknown;
  attempts: number;
  available_at: Date;
  locked_at: Date | null;
  locked_by: string | null;
  error_json: unknown | null;
  created_at: Date;
  updated_at: Date;
};

type JsonArg = Parameters<typeof sql.json>[0];

export async function enqueueJob(args: { type: JobType; jobKey: string; payload: unknown }): Promise<{ id: string }> {
  await ensureSchema();

  const rows = await sql<Array<{ id: string }>>`
    INSERT INTO jobs (
      id,
      type,
      state,
      job_key,
      payload_json,
      attempts,
      available_at,
      locked_at,
      locked_by,
      error_json,
      created_at,
      updated_at
    )
    VALUES (
      ${newId("job")},
      ${args.type},
      'queued',
      ${args.jobKey},
      ${sql.json(args.payload as JsonArg)},
      0,
      now(),
      NULL,
      NULL,
      NULL,
      now(),
      now()
    )
    ON CONFLICT (type, job_key) DO UPDATE SET
      state = CASE WHEN jobs.state = 'running' THEN jobs.state ELSE 'queued' END,
      payload_json = CASE WHEN jobs.state = 'running' THEN jobs.payload_json ELSE EXCLUDED.payload_json END,
      attempts = CASE WHEN jobs.state = 'running' THEN jobs.attempts ELSE 0 END,
      available_at = CASE WHEN jobs.state = 'running' THEN jobs.available_at ELSE now() END,
      locked_at = CASE WHEN jobs.state = 'running' THEN jobs.locked_at ELSE NULL END,
      locked_by = CASE WHEN jobs.state = 'running' THEN jobs.locked_by ELSE NULL END,
      error_json = CASE WHEN jobs.state = 'running' THEN jobs.error_json ELSE NULL END,
      updated_at = now()
    RETURNING id
  `;

  const row = rows[0];
  if (!row) throw new Error("JOBS_ENQUEUE_FAILED");
  return { id: row.id };
}

export async function claimNextJob(args: { workerId: string }): Promise<JobRow | null> {
  await ensureSchema();

  const rows = await sql<JobRow[]>`
    WITH next AS (
      SELECT id
      FROM jobs
      WHERE state = 'queued'
        AND available_at <= now()
      ORDER BY available_at ASC, created_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT 1
    )
    UPDATE jobs
    SET state = 'running',
        locked_at = now(),
        locked_by = ${args.workerId},
        attempts = attempts + 1,
        updated_at = now()
    WHERE id = (SELECT id FROM next)
    RETURNING
      id,
      type,
      state,
      job_key,
      payload_json,
      attempts,
      available_at,
      locked_at,
      locked_by,
      error_json,
      created_at,
      updated_at
  `;

  const job = rows[0];
  if (!job) return null;

  const parsedType = JobTypeSchema.safeParse(job.type);
  if (!parsedType.success) {
    // Fail loudly; a bad type indicates schema drift or manual DB corruption.
    throw new Error(`Unknown job.type: ${String(job.type)}`);
  }

  return { ...job, type: parsedType.data };
}

export async function markJobSucceeded(args: { jobId: string; workerId: string }): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'succeeded',
        locked_at = NULL,
        locked_by = NULL,
        error_json = NULL,
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_MARK_SUCCEEDED_LOST_LOCK");
}

export async function rescheduleJob(args: {
  jobId: string;
  workerId: string;
  availableAt: Date;
  error: { code: string; message: string };
}): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'queued',
        available_at = ${args.availableAt},
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_RESCHEDULE_LOST_LOCK");
}

export async function markJobFailed(args: {
  jobId: string;
  workerId: string;
  error: { code: string; message: string };
}): Promise<void> {
  await ensureSchema();
  const rows = await sql<Array<{ id: string }>>`
    UPDATE jobs
    SET state = 'failed',
        locked_at = NULL,
        locked_by = NULL,
        error_json = ${sql.json(args.error)},
        updated_at = now()
    WHERE id = ${args.jobId}
      AND state = 'running'
      AND locked_by = ${args.workerId}
    RETURNING id
  `;
  if (!rows[0]) throw new Error("JOBS_MARK_FAILED_LOST_LOCK");
}

export async function requeueStaleRunningJobs(args: {
  cutoff: Date;
  limit?: number;
}): Promise<{ n: number }> {
  await ensureSchema();

  const limit = Math.max(1, Math.min(500, args.limit ?? 50));
  const stale = await sql<Array<{ id: string }>>`
    WITH next AS (
      SELECT id
      FROM jobs
      WHERE state = 'running'
        AND locked_at IS NOT NULL
        AND locked_at < ${args.cutoff}
      ORDER BY locked_at ASC
      FOR UPDATE SKIP LOCKED
      LIMIT ${limit}
    )
    UPDATE jobs
    SET state = 'queued',
        available_at = now(),
        locked_at = NULL,
        locked_by = NULL,
        error_json = COALESCE(
          error_json,
          ${sql.json({ code: "JOB_STALE_REQUEUED", message: "Job reclaimed after stale lock." })}
        ),
        updated_at = now()
    WHERE id IN (SELECT id FROM next)
    RETURNING id
  `;

  return { n: stale.length };
}
```

### File: apps/web/lib/jobs/jobWorker.server.ts
```ts
import "server-only";

import { z } from "zod";

import { safeErrMessage } from "../safeErrMessage";

import {
  claimNextJob,
  markJobFailed,
  markJobSucceeded,
  requeueStaleRunningJobs,
  rescheduleJob,
  type JobRow,
} from "./jobQueue.server";
import { processDocumentIngest } from "../ingest/ingestProcessor.server";
import { processQuickStartRun } from "../quickStartRunProcessor.server";

type GlobalJobsWorker = typeof globalThis & {
  __orbitalInlineJobWorker?: { draining: boolean };
};

const g = globalThis as GlobalJobsWorker;
if (!g.__orbitalInlineJobWorker) g.__orbitalInlineJobWorker = { draining: false };

const IngestPayloadSchema = z.object({ document_id: z.string().min(1) });
const RunPayloadSchema = z.object({ run_id: z.string().min(1) });

function backoffMs(attempt: number): number {
  // attempt is 1-based and increments when the job is claimed.
  const base = 1_000;
  const max = 30_000;
  const ms = base * Math.pow(2, Math.max(0, attempt - 1));
  return Math.min(max, ms);
}

async function handleJob(job: JobRow): Promise<void> {
  if (job.type === "ingest_document") {
    const parsed = IngestPayloadSchema.safeParse(job.payload_json);
    if (!parsed.success) throw new Error("JOB_PAYLOAD_INVALID");
    await processDocumentIngest(parsed.data.document_id);
    return;
  }

  if (job.type === "execute_run") {
    const parsed = RunPayloadSchema.safeParse(job.payload_json);
    if (!parsed.success) throw new Error("JOB_PAYLOAD_INVALID");
    await processQuickStartRun(parsed.data.run_id);
    return;
  }

  // Should be unreachable due to JobTypeSchema validation in claimNextJob().
  throw new Error(`JOB_TYPE_UNSUPPORTED: ${String((job as { type?: unknown }).type)}`);
}

export async function drainJobsOnce(args: { workerId: string; maxJobs?: number }): Promise<number> {
  const maxJobs = args.maxJobs ?? 50;
  let processed = 0;

  for (let i = 0; i < maxJobs; i += 1) {
    const job = await claimNextJob({ workerId: args.workerId });
    if (!job) return processed;

    try {
      await handleJob(job);
      await markJobSucceeded({ jobId: job.id, workerId: args.workerId });
    } catch (err) {
      const maxAttempts = 3;
      if (job.attempts < maxAttempts) {
        const ms = backoffMs(job.attempts);
        await rescheduleJob({
          jobId: job.id,
          workerId: args.workerId,
          availableAt: new Date(Date.now() + ms),
          error: { code: "JOB_FAILED_RETRYING", message: "Job failed; retry scheduled." },
        });
      } else {
        await markJobFailed({
          jobId: job.id,
          workerId: args.workerId,
          error: { code: "JOB_FAILED", message: "Job failed permanently." },
        });
      }

      // eslint-disable-next-line no-console
      console.error("jobs.worker.job_failed", {
        job_id: job.id,
        job_type: job.type,
        job_key: job.job_key,
        attempts: job.attempts,
        message: safeErrMessage(err),
      });
    }

    processed += 1;
  }

  return processed;
}

export function kickInlineJobWorker(): void {
  if (process.env.NODE_ENV !== "development") return;

  const state = g.__orbitalInlineJobWorker!;
  if (state.draining) return;
  state.draining = true;

  const workerId = `inline:${process.pid}`;
  void drainJobsOnce({ workerId, maxJobs: 100 })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.worker.drain_failed", { worker_id: workerId, message: safeErrMessage(err) });
    })
    .finally(() => {
      state.draining = false;
    });
}

export async function runContinuousJobWorker(args: {
  workerId: string;
  pollIntervalMs?: number;
  maxJobsPerTick?: number;
}): Promise<never> {
  const pollIntervalMs = args.pollIntervalMs ?? 1_000;
  const maxJobsPerTick = args.maxJobsPerTick ?? 25;
  const staleLockMs = 5 * 60 * 1000;

  // eslint-disable-next-line no-console
  console.info("jobs.worker.started", { worker_id: args.workerId, poll_interval_ms: pollIntervalMs });

  while (true) {
    try {
      await requeueStaleRunningJobs({ cutoff: new Date(Date.now() - staleLockMs), limit: 100 });
      const n = await drainJobsOnce({ workerId: args.workerId, maxJobs: maxJobsPerTick });
      if (n === 0) {
        await new Promise((r) => setTimeout(r, pollIntervalMs));
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("jobs.worker.tick_failed", { worker_id: args.workerId, message: safeErrMessage(err) });
      await new Promise((r) => setTimeout(r, pollIntervalMs));
    }
  }
}
```

### File: apps/web/lib/retrieval/types.ts
```ts
// PR0 retrieval contract: IDs-only posture.
// This file must stay free of DB/AI imports so chat can compile independently.

export type HybridSearchHit = {
  chunk_id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  score: number;
  lex_score?: number;
  sem_score?: number;
};

export type HybridSearchOpts = {
  kLex?: number;
  kSem?: number;
  kFinal?: number;
  lexWeight?: number;
  semWeight?: number;
  probes?: number;
};

export async function hybridSearch(
  folderId: string,
  indexVersion: string,
  queryText: string,
  opts?: HybridSearchOpts,
): Promise<HybridSearchHit[]>;
export async function hybridSearch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
}): Promise<HybridSearchHit[]>;
export async function hybridSearch(): Promise<HybridSearchHit[]> {
  throw new Error("hybridSearch() is not implemented (PR0 placeholder).");
}
```

### File: apps/web/lib/db/schema/chat.server.ts
```ts
import "server-only";

import type { Sql } from "../../db.server";

export async function ensureChatSchema(_sql: Sql): Promise<void> {
  // PR0: no chat tables yet. PRD B owns this module.
}
```

### File: apps/web/lib/db/schema/core.server.ts
```ts
import "server-only";

import type { Sql } from "../../db.server";

export async function ensureCoreSchema(sql: Sql): Promise<void> {
  // Folders (Matters)
  await sql`
    CREATE TABLE IF NOT EXISTS folders (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('empty','ingesting','indexed','ready','failed')),
      latest_index_version TEXT NOT NULL DEFAULT 'v1',
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Documents
  await sql`
    CREATE TABLE IF NOT EXISTS documents (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      filename TEXT NOT NULL,
      mime TEXT NOT NULL,
      bytes BIGINT NOT NULL,
      sha256 TEXT NULL,
      storage_key TEXT UNIQUE,
      upload_completed_at TIMESTAMPTZ NULL,
      parse_status TEXT NOT NULL CHECK (parse_status IN ('queued','parsing','parsed','failed')),
      ocr_status TEXT NOT NULL CHECK (ocr_status IN ('queued','running','done','failed')),
      page_count INT NULL,
      extraction_quality REAL NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  // Per-page OCR/layout output.
  await sql`
    CREATE TABLE IF NOT EXISTS document_pages (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      page_number INT NOT NULL,
      text TEXT NOT NULL,
      layout_json JSONB NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, page_number)
    );
  `;

  // Minimal durable job queue (replaces in-memory queues).
  await sql`
    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      job_key TEXT NOT NULL,
      payload_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      attempts INT NOT NULL DEFAULT 0,
      available_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      locked_at TIMESTAMPTZ NULL,
      locked_by TEXT NULL,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (type, job_key)
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS jobs_state_available_idx
    ON jobs(state, available_at);
  `;

  // Runs (Quick Start execution attempts)
  await sql`
    CREATE TABLE IF NOT EXISTS runs (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('created','running','completed','partial','failed','cancelled')),
      index_version TEXT NOT NULL,
      agent_bundle_version TEXT NOT NULL,
      question_set_version TEXT NOT NULL,
      idempotency_key TEXT NULL,
      trace_id TEXT NULL,
      questions_total INT NOT NULL DEFAULT 0,
      questions_done INT NOT NULL DEFAULT 0,
      failure_counts_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (folder_id, idempotency_key)
    );
  `;

  // Durable step execution log. Steps are responsible for idempotency via step_key.
  await sql`
    CREATE TABLE IF NOT EXISTS run_steps (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      step_type TEXT NOT NULL,
      state TEXT NOT NULL CHECK (state IN ('queued','running','succeeded','failed')),
      attempt INT NOT NULL DEFAULT 1,
      step_key TEXT NOT NULL,
      trace_id TEXT NULL,
      question_id TEXT NULL,
      metrics_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      error_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, step_key)
    );
  `;

  // Enforce idempotency even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS run_steps_run_step_key_uidx
    ON run_steps(run_id, step_key);
  `;

  // Report rows are the durable, per-question output of a run (terminal statuses only).
  await sql`
    CREATE TABLE IF NOT EXISTS report_rows (
      id TEXT PRIMARY KEY,
      run_id TEXT NOT NULL REFERENCES runs(id) ON DELETE CASCADE,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      question_set_version TEXT NOT NULL,
      question_id TEXT NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('needs_review','reviewed','missing_input','citation_failed')),
      notes TEXT NULL,
      provenance_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      payload_schema_version TEXT NULL,
      payload_json JSONB NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (run_id, question_id),
      CHECK (status <> 'missing_input' OR answer = 'Not found in provided documents.')
    );
  `;

  // Enforce row uniqueness even if an older dev DB pre-dates the table constraint.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS report_rows_run_question_uidx
    ON report_rows(run_id, question_id);
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS report_rows_folder_run_idx
    ON report_rows(folder_id, run_id);
  `;

  // Locked citations associated to a report row. In this slice we may emit zero citations.
  await sql`
    CREATE TABLE IF NOT EXISTS citations (
      id TEXT PRIMARY KEY,
      report_row_id TEXT NOT NULL REFERENCES report_rows(id) ON DELETE CASCADE,
      document_id TEXT NOT NULL,
      page_number INT NOT NULL,
      snippet TEXT NOT NULL,
      snippet_hash TEXT NOT NULL,
      polygons_json JSONB NOT NULL,
      locked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      created_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS citations_report_row_idx
    ON citations(report_row_id);
  `;

  // Exported artefacts (CSV, docx, etc).
  // Signed download URLs are generated at read-time and are never persisted.
  await sql`
    CREATE TABLE IF NOT EXISTS artefacts (
      id TEXT PRIMARY KEY,
      folder_id TEXT NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
      type TEXT NOT NULL,
      kind TEXT NOT NULL,
      filename TEXT NOT NULL,
      storage_key TEXT NOT NULL UNIQUE,
      source_run_id TEXT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `;

  await sql`
    CREATE INDEX IF NOT EXISTS artefacts_folder_created_idx
    ON artefacts(folder_id, created_at);
  `;
}
```

### File: apps/web/lib/db/schema/index.server.ts
```ts
import "server-only";

import type { Sql } from "../../db.server";

import { ensureChatSchema } from "./chat.server";
import { ensureCoreSchema } from "./core.server";
import { ensureRetrievalSchema } from "./retrieval.server";

export async function ensureAllSchemas(sql: Sql): Promise<void> {
  await ensureCoreSchema(sql);
  await ensureRetrievalSchema(sql);
  await ensureChatSchema(sql);
}

export { ensureCoreSchema } from "./core.server";
export { ensureRetrievalSchema } from "./retrieval.server";
export { ensureChatSchema } from "./chat.server";
```

### File: apps/web/lib/db/schema/retrieval.server.ts
```ts
import "server-only";

import type { Sql } from "../../db.server";

export async function ensureRetrievalSchema(sql: Sql): Promise<void> {
  // Minimal chunk substrate to satisfy folder state invariants.
  await sql`
    CREATE TABLE IF NOT EXISTS chunks (
      id TEXT PRIMARY KEY,
      document_id TEXT NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
      index_version TEXT NOT NULL,
      chunk_index INT NOT NULL,
      page_start INT NULL,
      page_end INT NULL,
      text TEXT NOT NULL,
      metadata_json JSONB NOT NULL DEFAULT '{}'::jsonb,
      text_hash TEXT NOT NULL,
      created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      UNIQUE (document_id, index_version, chunk_index)
    );
  `;
}
```

### File: packages/core/src/index.ts
```ts
export * from "./geometry/anchors";
export * from "./geometry/mapToViewport";
export * from "./chunking/char_window_v0";
export * from "./exception-matching/matchExceptionsToInstrumentDocs";
export * from "./missing-docs/detectMissingDocs";
export * from "./missing-docs/schemas";
export * from "./schemas/list_payload_v0";
export * from "./safe-error";
export * from "./spikes/rh1.schemas";
export * from "./verify/verifier.schemas";
```

### File: packages/core/src/safe-error.ts
```ts
export type SafeErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    trace_id?: string;
  };
};

export function safeErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
}): SafeErrorEnvelope {
  return {
    error: {
      code: opts.code,
      message: opts.message,
      details: opts.details,
      trace_id: opts.traceId,
    },
  };
}
```

### File: packages/core/src/server.ts
```ts
export * from "./citations/snippet";
export * from "./verify/verifier";
```

### File: packages/core/src/chunking/char_window_v0.ts
```ts
export const CHAR_WINDOW_V0_CHUNKER_ID = "char_window_v0" as const;

export type CharWindowV0Params = {
  maxChars: number;
  overlapChars: number;
};

export const CHAR_WINDOW_V0_DEFAULT_PARAMS: CharWindowV0Params = {
  maxChars: 1500,
  overlapChars: 200,
};

export type CharWindowV0Span = {
  // 0-based, end-exclusive offsets into the page text used for chunking.
  char_start: number;
  char_end: number;
};

export function charWindowV0Spans(text: string, params: CharWindowV0Params = CHAR_WINDOW_V0_DEFAULT_PARAMS): CharWindowV0Span[] {
  const len = text.length;
  if (len === 0) return [{ char_start: 0, char_end: 0 }];

  const maxChars = Math.trunc(params.maxChars);
  const overlapChars = Math.trunc(params.overlapChars);

  if (!Number.isFinite(maxChars) || maxChars <= 0) throw new Error("char_window_v0: maxChars must be > 0");
  if (!Number.isFinite(overlapChars) || overlapChars < 0) throw new Error("char_window_v0: overlapChars must be >= 0");
  if (overlapChars >= maxChars) throw new Error("char_window_v0: overlapChars must be < maxChars");

  const step = maxChars - overlapChars;
  const spans: CharWindowV0Span[] = [];

  for (let start = 0; start < len; start += step) {
    const end = Math.min(len, start + maxChars);
    spans.push({ char_start: start, char_end: end });
    if (end === len) break;
  }

  return spans;
}

export type CharWindowV0PageChunk = {
  chunker_id: typeof CHAR_WINDOW_V0_CHUNKER_ID;
  page_number: number;
  char_start: number;
  char_end: number;
  text: string;
};

export function chunkPageCharWindowV0(args: {
  page_number: number;
  text: string;
  params?: CharWindowV0Params;
}): CharWindowV0PageChunk[] {
  const spans = charWindowV0Spans(args.text, args.params);
  return spans.map((s) => ({
    chunker_id: CHAR_WINDOW_V0_CHUNKER_ID,
    page_number: args.page_number,
    char_start: s.char_start,
    char_end: s.char_end,
    text: args.text.slice(s.char_start, s.char_end),
  }));
}
```

### File: packages/core/src/citations/snippet.ts
```ts
import { createHash } from "node:crypto";

export function normaliseSnippet(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

export function hashSnippet(snippet: string): string {
  const normalised = normaliseSnippet(snippet);
  const bytes = new TextEncoder().encode(normalised);
  const hashHex = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hashHex}`;
}
```

### File: packages/core/src/exception-matching/matchExceptionsToInstrumentDocs.ts
```ts
export type ExceptionMatchStatusV0 = "matched" | "ambiguous" | "missing_doc" | "missing_attachment";

export type ExceptionMatchCandidateV0 = {
  doc: string;
  instrument_no?: string | null;
};

export type InstrumentDocRef = {
  doc: string;
  instrument_no: string | null;
};

function normInstrumentNo(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

export function matchExceptionToInstrumentDocs(args: {
  instrument_no: string | null;
  instrument_docs: InstrumentDocRef[];
}): {
  match_status: ExceptionMatchStatusV0;
  doc: string | null;
  candidates?: ExceptionMatchCandidateV0[];
} {
  const instrumentNo = args.instrument_no ? normInstrumentNo(args.instrument_no) : "";
  if (!instrumentNo) return { match_status: "missing_doc", doc: null };

  const matches = args.instrument_docs.filter((d) => d.instrument_no && normInstrumentNo(d.instrument_no) === instrumentNo);

  if (matches.length === 1) return { match_status: "matched", doc: matches[0]!.doc };

  if (matches.length > 1) {
    // Safe default: no silent auto-pick when more than one candidate fits.
    const candidates = matches
      .map((m) => ({ doc: m.doc, instrument_no: m.instrument_no }))
      .sort((a, b) => a.doc.localeCompare(b.doc));

    return { match_status: "ambiguous", doc: null, candidates };
  }

  return { match_status: "missing_doc", doc: null };
}
```

### File: packages/core/src/fixtures/fixtureIds.ts
```ts
const PACK_ID_RE = /^pack_\d{2}_[a-z0-9_]+$/i;
const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;
const STEM_RE = /^[A-Za-z0-9_-]+$/;

export function fixtureDocumentId(args: { packId: string; filename: string }): string {
  const packId = args.packId.trim();
  if (!PACK_ID_RE.test(packId)) throw new Error("INVALID_PACK_ID");

  const filename = args.filename.trim();
  if (!PDF_FILENAME_RE.test(filename)) throw new Error("INVALID_PDF_FILENAME");

  const stem = filename.replace(/\.pdf$/i, "");
  if (!STEM_RE.test(stem)) throw new Error("INVALID_PDF_STEM");

  // Fixture docs are addressed via a deterministic id so the viewer can use the
  // canonical /documents/:id/* contract without depending on DB ingestion.
  return `fx_${packId}__${stem}`;
}

export function parseFixtureDocumentId(
  documentId: string,
):
  | { ok: true; packId: string; filename: string; stem: string }
  | { ok: false } {
  if (typeof documentId !== "string") return { ok: false };
  if (!documentId.startsWith("fx_")) return { ok: false };

  const rest = documentId.slice("fx_".length);
  const parts = rest.split("__");
  if (parts.length !== 2) return { ok: false };

  const [packId, stem] = parts;
  if (!packId || !PACK_ID_RE.test(packId)) return { ok: false };
  if (!stem || !STEM_RE.test(stem)) return { ok: false };

  return { ok: true, packId, stem, filename: `${stem}.pdf` };
}
```

### File: packages/core/src/geometry/anchors.ts
```ts
import { z } from "zod";

export const AnchorBoxSchema = z.object({
  page: z.number().int().positive(),
  bbox: z.tuple([
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
  ]),
}).superRefine((val, ctx) => {
  const [xMin, yMin, xMax, yMax] = val.bbox;
  if (xMin > xMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox xMin > xMax", path: ["bbox"] });
  if (yMin > yMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox yMin > yMax", path: ["bbox"] });
});

export type AnchorBox = z.infer<typeof AnchorBoxSchema>;

export const AnchorFileSchema = z.record(z.string().min(1), AnchorBoxSchema);
export type AnchorFile = z.infer<typeof AnchorFileSchema>;

export type NormPoint = readonly [xNorm: number, yNorm: number];
export type NormPolygon = readonly NormPoint[];
export type NormPolygons = readonly NormPolygon[];

export function anchorBoxToPolygons(anchor: AnchorBox): NormPolygons {
  const [xMin, yMin, xMax, yMax] = anchor.bbox;

  // Canonical spec: normalised [0..1], origin top-left.
  const polygon: NormPolygon = [
    [xMin, yMin],
    [xMax, yMin],
    [xMax, yMax],
    [xMin, yMax],
  ];

  return [polygon];
}
```

### File: packages/core/src/geometry/mapToViewport.ts
```ts
import type { NormPolygons } from "./anchors";

export type ViewBox = readonly [xMin: number, yMin: number, xMax: number, yMax: number];

export type CssPoint = readonly [x: number, y: number];
export type CssPolygon = readonly CssPoint[];
export type CssPolygons = readonly CssPolygon[];

export interface PdfJsViewportLike {
  readonly width: number;
  readonly height: number;
  convertToViewportPoint(xPdf: number, yPdf: number): [number, number];
}

export function mapNormPointToPdfPoint(point: readonly [number, number], viewBox: ViewBox): [number, number] {
  const [xNorm, yNorm] = point;
  const [xMin, yMin, xMax, yMax] = viewBox;

  const xPdf = xMin + xNorm * (xMax - xMin);
  const yPdf = yMax - yNorm * (yMax - yMin);

  return [xPdf, yPdf];
}

export function mapNormPolygonsToViewportCss(args: {
  polygons: NormPolygons;
  viewBox: ViewBox;
  viewport: PdfJsViewportLike;
}): CssPolygons {
  const { polygons, viewBox, viewport } = args;

  return polygons.map((poly) =>
    poly.map((p) => {
      const [xPdf, yPdf] = mapNormPointToPdfPoint(p, viewBox);
      const [xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf);
      return [xCss, yCss] as const;
    }),
  );
}

export function bboxFromCssPolygons(polygons: CssPolygons): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  let points = 0;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      points += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (points === 0) return null;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}
```

### File: packages/core/src/missing-docs/detectMissingDocs.ts
```ts
import type { DetectMissingDocsResult, MissingDocCandidate, MissingDocSignal } from "./schemas";

const PHRASE_TO_ACRONYM: ReadonlyArray<[phrase: RegExp, acronym: string]> = [
  [/\bReciprocal\s+Easement\s+Agreement\b/i, "REA"],
];

function filenameTokenSet(filename: string): Set<string> {
  const stem = filename.replace(/\.[^.]+$/, "");
  const tokens = stem.split(/[^A-Za-z0-9]+/g).filter(Boolean);
  return new Set(tokens.map((t) => t.toUpperCase()));
}

export function detectMissingDocs(args: {
  packId: string;
  providedFilenames: string[];
  referenceText: string;
  referenceSource: { source: string; page?: number };
}): DetectMissingDocsResult {
  const providedTokens = args.providedFilenames.map((f) => ({
    filename: f,
    tokens: filenameTokenSet(f),
  }));

  const signals: MissingDocSignal[] = [];

  // 1) Direct file references like "REA.pdf"
  for (const match of args.referenceText.matchAll(/\b([A-Za-z0-9_-]+\.(?:pdf|PDF))\b/g)) {
    signals.push({
      type: "file_ref",
      value: match[1],
      source: args.referenceSource.source,
      page: args.referenceSource.page,
    });
  }

  // 2) Acronyms in parentheses like "(REA)"
  for (const match of args.referenceText.matchAll(/\(([A-Z]{2,6})\)/g)) {
    signals.push({
      type: "acronym",
      value: match[1],
      source: args.referenceSource.source,
      page: args.referenceSource.page,
    });
  }

  // 3) Known phrases -> acronym
  for (const [re, acronym] of PHRASE_TO_ACRONYM) {
    if (re.test(args.referenceText)) {
      signals.push({
        type: "phrase",
        value: re.source.replace(/\\b/g, ""),
        source: args.referenceSource.source,
        page: args.referenceSource.page,
      });
      signals.push({
        type: "acronym",
        value: acronym,
        source: args.referenceSource.source,
        page: args.referenceSource.page,
      });
    }
  }

  const byLabel = new Map<string, MissingDocCandidate>();

  const recordCandidate = (label: string, confidence: number, signal: MissingDocSignal) => {
    const existing = byLabel.get(label);
    if (!existing) {
      byLabel.set(label, { label, confidence, signals: [signal] });
      return;
    }
    existing.confidence = Math.max(existing.confidence, confidence);
    existing.signals.push(signal);
  };

  const hasFilenameOrToken = (acronym: string) =>
    args.providedFilenames.some((f) => f.toUpperCase() === `${acronym}.PDF`) ||
    providedTokens.some(({ tokens }) => tokens.has(acronym.toUpperCase()));

  for (const s of signals) {
    if (s.type === "file_ref") {
      const label = s.value;
      const stem = label.replace(/\.[^.]+$/, "").toUpperCase();
      if (!hasFilenameOrToken(stem)) recordCandidate(label, 0.95, s);
      continue;
    }

    if (s.type === "acronym") {
      const acronym = s.value.toUpperCase();
      if (!hasFilenameOrToken(acronym)) recordCandidate(`${acronym}.pdf`, 0.8, s);
      continue;
    }

    if (s.type === "phrase") {
      // Phrase alone shouldn't create a missing-doc claim; it only boosts confidence via acronym signal.
      continue;
    }
  }

  const missing_docs: MissingDocCandidate[] = [];
  const candidates_low_confidence: MissingDocCandidate[] = [];

  for (const cand of byLabel.values()) {
    if (cand.confidence >= 0.8) missing_docs.push(cand);
    else candidates_low_confidence.push(cand);
  }

  return {
    pack_id: args.packId,
    missing_docs,
    candidates_low_confidence: candidates_low_confidence.length ? candidates_low_confidence : undefined,
  };
}
```

### File: packages/core/src/missing-docs/schemas.ts
```ts
import { z } from "zod";

export const MissingDocSignalSchema = z.object({
  type: z.enum(["file_ref", "acronym", "phrase"]),
  value: z.string().min(1),
  source: z.string().min(1),
  page: z.number().int().positive().optional(),
});

export type MissingDocSignal = z.infer<typeof MissingDocSignalSchema>;

export const MissingDocCandidateSchema = z.object({
  label: z.string().min(1),
  confidence: z.number().min(0).max(1),
  signals: z.array(MissingDocSignalSchema),
});

export type MissingDocCandidate = z.infer<typeof MissingDocCandidateSchema>;

export const DetectMissingDocsResultSchema = z.object({
  pack_id: z.string().min(1),
  missing_docs: z.array(MissingDocCandidateSchema),
  candidates_low_confidence: z.array(MissingDocCandidateSchema).optional(),
});

export type DetectMissingDocsResult = z.infer<typeof DetectMissingDocsResultSchema>;
```

### File: packages/core/src/schemas/list_payload_v0.ts
```ts
import { z } from "zod";

export const LIST_PAYLOAD_V0_SCHEMA_VERSION = "list_payload_v0" as const;

export const ListPayloadV0KindSchema = z.enum([
  "requirements_tracker",
  "exceptions_table",
  "survey_issues",
  "survey_certification_parties",
]);

const LockedCitationIdSchema = z.string().min(1);

const BaseItemV0Schema = z
  .object({
    item_id: z.string().min(1), // deterministic for diffing + idempotency
    citation_ids: z.array(LockedCitationIdSchema), // locked citation ids only
    notes: z.string().min(1).nullable().optional(),
  })
  .strict();

const ParcelScopeV0Schema = z.union([
  z.object({ scope: z.literal("all") }).strict(),
  z
    .object({
    scope: z.literal("parcels"),
    parcels: z.array(z.number().int().nonnegative()).min(1),
    citation_ids: z.array(LockedCitationIdSchema),
  })
    .strict(),
]);

const RequirementsItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("requirements_tracker_item"),
  bi_item: z.number().int().nonnegative(),
  requirement: z.string().min(1),
  owner: z.string().min(1),
  item_status: z.enum(["open", "closed", "waived"]), // item-level only
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const ExceptionMatchStatusV0Schema = z.enum(["matched", "ambiguous", "missing_doc", "missing_attachment"]);

const ExceptionItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("exceptions_table_item"),
  bii_item: z.number().int().nonnegative(),
  type: z.string().min(1),
  // Item-level only (do not reuse report-row statuses). Comparator expects this field.
  item_status: z.enum(["needs_review", "missing_input"]),
  instrument_no: z.string().min(1).nullable().optional(),
  recorded_date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "recorded_date must be ISO YYYY-MM-DD")
    .nullable()
    .optional(),
  doc: z.string().min(1).nullable().optional(), // expected filename
  risk_tags: z.array(z.string().min(1)).optional(), // normalised lower-case tags (producer responsibility)
  match_status: ExceptionMatchStatusV0Schema,
  candidates: z
    .array(z.object({ doc: z.string().min(1), instrument_no: z.string().min(1).nullable().optional() }).strict())
    .optional(),
  parcel_scope: ParcelScopeV0Schema.optional(),
}).strict();

const SurveyIssueItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("survey_issue_item"),
  issue_type: z.string().min(1),
  // Optional structured code for downstream routing/UX. Example: CERT_MISSING_LENDER.
  issue_code: z
    .string()
    .regex(/^[A-Z][A-Z0-9_]+$/, "issue_code must be SCREAMING_SNAKE_CASE")
    .optional(),
  description: z.string().min(1),
  impact: z.string().min(1).nullable().optional(),
  suggested_fix: z.string().min(1).nullable().optional(),
  related_exception_item_id: z.string().min(1).nullable().optional(),
  item_classification: z.enum(["depicted", "not_depicted", "unknown"]).optional(), // item-level only
}).strict();

const SurveyCertificationPartyItemV0Schema = BaseItemV0Schema.extend({
  kind: z.literal("survey_certification_party_item"),
  party_name: z.string().min(1),
}).strict();

export const ListPayloadV0ItemSchema = z.discriminatedUnion("kind", [
  RequirementsItemV0Schema,
  ExceptionItemV0Schema,
  SurveyIssueItemV0Schema,
  SurveyCertificationPartyItemV0Schema,
]);

export const ListPayloadV0Schema = z
  .object({
  kind: ListPayloadV0KindSchema,
  items: z.array(ListPayloadV0ItemSchema),
  })
  .strict();

export type ListPayloadV0 = z.infer<typeof ListPayloadV0Schema>;

export function emptyListPayloadV0(kind: z.infer<typeof ListPayloadV0KindSchema>): ListPayloadV0 {
  return { kind, items: [] };
}
```

### File: packages/core/src/spikes/rh1.schemas.ts
```ts
import { z } from "zod";

export const LocalPdfQuerySchema = z.object({
  pack: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid pack id"),
  filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_.-]+\.pdf$/i, "Invalid filename"),
});

export type LocalPdfQuery = z.infer<typeof LocalPdfQuerySchema>;

export const PdfPerfJumpRowSchema = z.object({
  requestedPage: z.number().int().positive(),
  cancelledPrevious: z.boolean(),
  t_request: z.number(),
  t_gotPage: z.number().nullable(),
  t_renderStart: z.number().nullable(),
  t_renderEnd: z.number().nullable(),
  getPageMs: z.number().nullable(),
  renderMs: z.number().nullable(),
  totalMs: z.number().nullable(),
  error: z.string().optional(),
});

export type PdfPerfJumpRow = z.infer<typeof PdfPerfJumpRowSchema>;

export const PdfPerfLongTaskStatsSchema = z.object({
  longTaskCount: z.number().int().nonnegative(),
  maxLongTaskMs: z.number().nonnegative(),
  totalLongTaskMs: z.number().nonnegative(),
});

export type PdfPerfLongTaskStats = z.infer<typeof PdfPerfLongTaskStatsSchema>;

export const PdfPerfRunSchema = z.object({
  createdAt: z.string(),
  pdfjsVersion: z.string().optional(),
  userAgent: z.string().optional(),
  devicePixelRatio: z.number().optional(),

  doc: z.object({
    pack: z.string(),
    filename: z.string(),
    document_id: z.string(),
  }),

  zoomPercent: z.number(),
  pageRotate: z.number().optional(),
  viewport: z
    .object({
      width: z.number(),
      height: z.number(),
    })
    .optional(),
  canvas: z
    .object({
      width: z.number(),
      height: z.number(),
      cssWidth: z.number(),
      cssHeight: z.number(),
    })
    .optional(),

  test: z.object({
    type: z.enum(["serial", "spam"]),
    n: z.number().int().positive(),
    intervalMs: z.number().int().nonnegative().optional(),
    pageSequence: z.array(z.number().int().positive()),
  }),

  rows: z.array(PdfPerfJumpRowSchema),
  longTasks: PdfPerfLongTaskStatsSchema,
});

export type PdfPerfRun = z.infer<typeof PdfPerfRunSchema>;
```

### File: packages/core/src/spikes/rh3_snippet_hash_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashSnippet, normaliseSnippet } from "@legaltech-poc/core/citations/snippet";

type ExtractedSnippet = {
  doc: string;
  page: number | null;
  phrase: string;
  raw: string;
  normalised: string;
  snippet_hash: string;
};

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

function readPdfBytes(pdfPath: string): Uint8Array {
  // pdf.js v4 rejects `Buffer` instances; provide a plain Uint8Array view.
  const buf = fs.readFileSync(pdfPath);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function findPhraseSnippet(opts: {
  pdfPath: string;
  phrase: string;
  maxPagesToScan: number;
  windowChars: number;
}): Promise<{ page: number | null; snippet: string }> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: readPdfBytes(opts.pdfPath), disableWorker: true });
  const pdf = await loadingTask.promise;

  const pageCount = Number(pdf.numPages ?? 0);
  const maxPages = Math.min(pageCount, opts.maxPagesToScan);

  const phraseLower = opts.phrase.toLowerCase();

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = (textContent.items ?? []) as any[];
    const text = items.map((it) => String(it.str ?? "")).join(" ");
    const idx = text.toLowerCase().indexOf(phraseLower);
    if (idx === -1) continue;

    const start = Math.max(0, idx - Math.floor(opts.windowChars / 2));
    const end = Math.min(text.length, start + opts.windowChars);
    return { page: pageNumber, snippet: text.slice(start, end) };
  }

  return { page: null, snippet: "" };
}

function readHarnessOutput(filePath: string): {
  run: string;
  phrase: string;
  snippets: ExtractedSnippet[];
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw) as unknown;
  if (!json || typeof json !== "object") throw new Error(`Invalid JSON: ${filePath}`);

  const run = (json as any).run;
  const phrase = (json as any).phrase;
  const snippets = (json as any).snippets;
  if (typeof run !== "string") throw new Error(`Invalid run field: ${filePath}`);
  if (typeof phrase !== "string") throw new Error(`Invalid phrase field: ${filePath}`);
  if (!Array.isArray(snippets)) throw new Error(`Invalid snippets field: ${filePath}`);
  return { run, phrase, snippets: snippets as ExtractedSnippet[] };
}

function compareHarnessRuns(args: {
  root: string;
  outDir: string;
  runA: string;
  runB: string;
}): void {
  const aPath = path.join(args.root, args.outDir, `${args.runA}.json`);
  const bPath = path.join(args.root, args.outDir, `${args.runB}.json`);

  if (!fs.existsSync(aPath)) throw new Error(`Missing run output: ${aPath}`);
  if (!fs.existsSync(bPath)) throw new Error(`Missing run output: ${bPath}`);

  const a = readHarnessOutput(aPath);
  const b = readHarnessOutput(bPath);

  const aByDoc = new Map(a.snippets.map((s) => [s.doc, s.snippet_hash] as const));
  const bByDoc = new Map(b.snippets.map((s) => [s.doc, s.snippet_hash] as const));

  const docs = new Set<string>([...aByDoc.keys(), ...bByDoc.keys()]);
  const mismatches: Array<{ doc: string; a: string | null; b: string | null }> = [];
  for (const doc of docs) {
    const hashA = aByDoc.get(doc) ?? null;
    const hashB = bByDoc.get(doc) ?? null;
    if (hashA !== hashB) mismatches.push({ doc, a: hashA, b: hashB });
  }

  if (mismatches.length) {
    process.stderr.write(`RH3 hash stability: FAIL (${args.runA} vs ${args.runB})\n`);
    for (const m of mismatches) {
      process.stderr.write(`- ${m.doc}: ${String(m.a)} != ${String(m.b)}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`RH3 hash stability: PASS (${args.runA} vs ${args.runB})\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const run = args.get("run") ?? "run1";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh3";
  const phrase = args.get("phrase") ?? "18W18 Acquisition LLC";
  const compareWith = args.get("compareWith") ?? null;

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const docs = [
    {
      name: "TitleCommitment.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/TitleCommitment.pdf"),
    },
    {
      name: "ALTA_Survey.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/ALTA_Survey.pdf"),
    },
  ];

  const extracted: ExtractedSnippet[] = [];
  for (const doc of docs) {
    const { page, snippet } = await findPhraseSnippet({
      pdfPath: doc.path,
      phrase,
      maxPagesToScan: 10,
      windowChars: 200,
    });

    const normalised = normaliseSnippet(snippet);
    extracted.push({
      doc: doc.name,
      page,
      phrase,
      raw: snippet,
      normalised,
      snippet_hash: hashSnippet(snippet),
    });
  }

  const output = {
    run,
    createdAt: new Date().toISOString(),
    phrase,
    snippets: extracted,
  };

  const outPath = path.join(root, outDir, `${run}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  process.stdout.write(`Wrote ${outPath}\n`);

  if (compareWith) {
    compareHarnessRuns({ root, outDir, runA: compareWith, runB: run });
  }
}

await main();
```

### File: packages/core/src/spikes/rh4_verification_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { verifyRow } from "../verify/verifier";
import { VerifyInputSchema } from "../verify/verifier.schemas";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

const DatasetCaseSchema = VerifyInputSchema.extend({
  expected: z.enum(["pass", "fail"]),
  expected_reason_code: z.string().optional(),
});
type DatasetCase = z.infer<typeof DatasetCaseSchema>;

const DatasetSchema = z.array(DatasetCaseSchema);

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const datasetPath =
    args.get("dataset") ??
    "docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json";
  const mode = (args.get("mode") ?? "deterministic-only") as "deterministic-only" | "entailment";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh4";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const raw = fs.readFileSync(path.join(root, datasetPath), "utf8");
  const dataset = DatasetSchema.parse(JSON.parse(raw)) as DatasetCase[];

  const results: Array<{
    case_id: string;
    expected: "pass" | "fail";
    got: "pass" | "fail";
    reason_code: string;
    timings_ms: unknown;
  }> = [];

  for (const row of dataset) {
    const input = VerifyInputSchema.parse(row);
    const res = await verifyRow(input, { mode });
    results.push({
      case_id: row.case_id,
      expected: row.expected,
      got: res.verdict,
      reason_code: res.reason_code,
      timings_ms: res.timings_ms,
    });
  }

  const fp = results.filter((r) => r.expected === "fail" && r.got === "pass").length;
  const fn = results.filter((r) => r.expected === "pass" && r.got === "fail").length;
  const tp = results.filter((r) => r.expected === "pass" && r.got === "pass").length;
  const tn = results.filter((r) => r.expected === "fail" && r.got === "fail").length;

  const latencies = results
    .map((r) => (r.timings_ms as any)?.total)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const summary = [
    `# RH4 verification harness summary`,
    ``,
    `- Mode: \`${mode}\``,
    `- Dataset: \`${datasetPath}\``,
    ``,
    `## Confusion matrix`,
    ``,
    `- True pass: ${tp}`,
    `- True fail: ${tn}`,
    `- False pass: ${fp}`,
    `- False fail: ${fn}`,
    ``,
    `## Latency (ms)`,
    ``,
    `- p50: ${percentile(latencies, 50) ?? "n/a"}`,
    `- p95: ${percentile(latencies, 95) ?? "n/a"}`,
    `- max: ${latencies.length ? Math.max(...latencies) : "n/a"}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();
```

### File: packages/core/src/spikes/rh5_missing_docs_harness.ts
```ts
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { detectMissingDocs } from "../missing-docs/detectMissingDocs";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

const ManifestSchema = z.object({
  pack_id: z.string(),
  documents: z.array(
    z.object({
      filename: z.string(),
      role: z.string().optional(),
      anchors_file: z.string().optional(),
    }),
  ),
});

async function extractPageText(pdfPath: string, pageNumber: number): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = fs.readFileSync(pdfPath);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const items = (textContent.items ?? []) as any[];
  return items.map((it) => String(it.str ?? "")).join(" ");
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function pickTitleCommitment(manifest: z.infer<typeof ManifestSchema>) {
  const doc =
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\.pdf$/i.test(d.filename));
  if (!doc) throw new Error(`Could not find TitleCommitment.pdf in manifest for ${manifest.pack_id}`);
  return doc;
}

function getScheduleBiiPageFromAnchors(packRoot: string, anchorsFileRel?: string): number {
  if (!anchorsFileRel) return 3;
  const anchorsPath = path.join(packRoot, anchorsFileRel);
  const anchors = loadJson<Record<string, { page: number }>>(anchorsPath);
  return anchors["SCHEDULE_BII_HEADER"]?.page ?? 3;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh5";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const packs = ["pack_01_clean", "pack_02_missing_rea"] as const;

  const perPack: any[] = [];
  for (const packId of packs) {
    const packRoot = path.join(root, "docs/08-example-data", packId);
    const manifest = ManifestSchema.parse(loadJson(path.join(packRoot, "manifest.json")));

    const title = pickTitleCommitment(manifest);
    const titlePdfPath = path.join(packRoot, "docs", title.filename);
    const pageNumber = getScheduleBiiPageFromAnchors(packRoot, title.anchors_file);
    const text = await extractPageText(titlePdfPath, pageNumber);

    const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\.pdf$/i.test(f));

    perPack.push(
      detectMissingDocs({
        packId,
        providedFilenames,
        referenceText: text,
        referenceSource: { source: title.filename, page: pageNumber },
      }),
    );
  }

  const pack01 = perPack.find((r) => r.pack_id === "pack_01_clean");
  const pack02 = perPack.find((r) => r.pack_id === "pack_02_missing_rea");

  const fp = (pack01?.missing_docs?.length ?? 0) > 0 ? 1 : 0;
  const fn =
    pack02?.missing_docs?.some((d: any) => String(d.label).toLowerCase() === "rea.pdf") === true ? 0 : 1;

  const summary = [
    `# RH5 missing-doc detection summary`,
    ``,
    `- pack_01_clean missing count: ${pack01?.missing_docs?.length ?? 0}`,
    `- pack_02_missing_rea missing count: ${pack02?.missing_docs?.length ?? 0}`,
    `- False positives (pack_01): ${fp}`,
    `- False negatives (pack_02 for REA): ${fn}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results: perPack }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();
```

### File: packages/core/src/verify/verifier.schemas.ts
```ts
import { z } from "zod";

export const VerifyCitationSchema = z.object({
  document_id: z.string().min(1),
  page_number: z.number().int().positive(),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
});

export type VerifyCitation = z.infer<typeof VerifyCitationSchema>;

export const VerifyInputSchema = z.object({
  case_id: z.string().min(1),
  question_id: z.string().min(1),
  question: z.string().min(1),
  answer: z.string(),
  citations: z.array(VerifyCitationSchema),
});

export type VerifyInput = z.infer<typeof VerifyInputSchema>;

export const VerifyVerdictSchema = z.enum(["pass", "fail"]);

export const VerifyResultSchema = z.object({
  verdict: VerifyVerdictSchema,
  reason_code: z.string().min(1),
  reason: z.string().optional(),
  timings_ms: z
    .object({
      total: z.number().nonnegative(),
      deterministic: z.number().nonnegative(),
      entailment: z.number().nonnegative().optional(),
    })
    .passthrough(),
});

export type VerifyResult = z.infer<typeof VerifyResultSchema>;
```

### File: packages/core/src/verify/verifier.ts
```ts
import { performance } from "node:perf_hooks";

import { hashSnippet } from "../citations/snippet";
import { VerifyInputSchema, type VerifyInput, type VerifyResult } from "./verifier.schemas";

export type EntailmentVerdict = "PASS" | "FAIL" | "UNSURE";

export type EntailmentVerifier = (input: {
  question: string;
  answer: string;
  citations: Array<{ snippet: string }>;
}) => Promise<{ verdict: EntailmentVerdict; reason?: string }>;

export type VerifierMode = "deterministic-only" | "entailment";

export async function verifyRow(
  input: VerifyInput,
  opts: { mode: VerifierMode; entailment?: EntailmentVerifier },
): Promise<VerifyResult> {
  const t0 = performance.now();

  // Schema validates basic shape; deterministic checks enforce invariants.
  const parsed = VerifyInputSchema.safeParse(input);
  if (!parsed.success) {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: "VALIDATION_ERROR",
      reason: "Input did not match VerifyInput schema.",
      timings_ms: { total: t - t0, deterministic: t - t0 },
    };
  }

  const tDetStart = performance.now();

  const failDeterministic = (args: { reason_code: VerifyResult["reason_code"]; reason: string }): VerifyResult => {
    const t = performance.now();
    return {
      verdict: "fail",
      reason_code: args.reason_code,
      reason: args.reason,
      timings_ms: { total: t - t0, deterministic: t - tDetStart },
    };
  };

  if (parsed.data.answer === "Not found in provided documents." && parsed.data.citations.length !== 0) {
    return failDeterministic({
      reason_code: "MISSING_INPUT_INVARIANT",
      reason: "missing_input answers must have zero citations.",
    });
  }

  if (parsed.data.answer !== "Not found in provided documents." && parsed.data.citations.length === 0) {
    return failDeterministic({
      reason_code: "NO_CITATIONS",
      reason: "Non-missing_input answers must include at least one citation.",
    });
  }

  for (const cit of parsed.data.citations) {
    const computed = hashSnippet(cit.snippet);
    if (computed !== cit.snippet_hash) {
      return failDeterministic({
        reason_code: "CITATION_MISMATCH",
        reason: "snippet_hash did not match the canonical hash of snippet.",
      });
    }
  }

  const tDetEnd = performance.now();

  if (opts.mode === "deterministic-only") {
    return {
      verdict: "pass",
      reason_code: "DETERMINISTIC_ONLY",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  if (!opts.entailment) {
    return {
      verdict: "fail",
      reason_code: "ENTAILMENT_NOT_CONFIGURED",
      reason: "Entailment verifier is required in entailment mode.",
      timings_ms: { total: tDetEnd - t0, deterministic: tDetEnd - tDetStart },
    };
  }

  const tEntStart = performance.now();
  const entailment = await opts.entailment({
    question: parsed.data.question,
    answer: parsed.data.answer,
    citations: parsed.data.citations.map((c) => ({ snippet: c.snippet })),
  });
  const tEntEnd = performance.now();

  if (entailment.verdict === "PASS") {
    return {
      verdict: "pass",
      reason_code: "ENTAILMENT_PASS",
      timings_ms: {
        total: tEntEnd - t0,
        deterministic: tDetEnd - tDetStart,
        entailment: tEntEnd - tEntStart,
      },
    };
  }

  return {
    verdict: "fail",
    reason_code: entailment.verdict === "FAIL" ? "ENTAILMENT_FAIL" : "ENTAILMENT_UNSURE",
    reason: entailment.reason,
    timings_ms: {
      total: tEntEnd - t0,
      deterministic: tDetEnd - tDetStart,
      entailment: tEntEnd - tEntStart,
    },
  };
}
```
