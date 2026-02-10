# PRD: Security Audit Remediation (Critical/High/Medium)

Owner: marc  
Status: Draft  
Date: 2026-02-10  
Slug: security-audit-remediation

## Introduction / Overview

On 2026-02-10 we produced a static, repo-grounded security audit for Orbital PoC:

- `docs/05-reviews-audits/security/security_best_practices_report.md`
- `docs/05-reviews-audits/security/security_best_practices_report-rp.md`
- `docs/05-reviews-audits/security/oracle-response-rp.md`

This dossier turns the **Critical/High/Medium** findings into an implementation plan that can be executed as a small series of PRs (one concern per PR).

## Problem

The codebase has good boundary validation and several "fail-closed" intent patterns, but there are multiple high-impact operator footguns and defense-in-depth gaps that become real once:

- demo-prod is reachable by hostile traffic, and/or
- env flags are mis-set, and/or
- Docker images are built from worktrees containing local `.env*` files.

## Goal

Reduce the blast radius and likelihood of security incidents by:

- preventing accidental secret inclusion in Docker build images
- constraining debug-only "spikes" surfaces to dev-only (plus optional token defense-in-depth)
- preventing CSRF-by-side-effects in demo-prod
- removing Host-derived loopback SSRF behavior
- establishing baseline security headers ownership (and a CSP rollout plan)
- hardening demo-prod compose defaults (DB exposure + required envs)
- mitigating DoS risk in PDF ingest and formula injection in CSV exports
- improving container runtime posture (non-root)
- removing Host-header dependent absolute URL generation (or routing it through trusted config)

## Scope

In-scope surfaces (expected touch points):

- Docker/build context: `.dockerignore`, `apps/web/Dockerfile`
- Runtime modes / gates: `apps/web/lib/spikes.server.ts`, `apps/web/middleware.ts`
- Viewer server component: `apps/web/app/(app)/matters/viewer/page.tsx`
- Security headers: `apps/web/next.config.js` (or middleware if preferred)
- Export paths: `apps/web/lib/exportCsv.server.ts`, `apps/web/app/(api)/spikes/export/csv/route.ts`
- Ingest paths: `apps/web/lib/ingest/ingestProcessor.server.ts`
- Compose: `docker-compose.demo-prod.yml` (and optionally `docker-compose.yml`)

## Non-goals (explicit cuts)

- Full authn/authz/RBAC or multi-tenant isolation.
- A live pentest, runtime fuzzing, or external network scans.
- Perfect CSP on day 1 (we will stage CSP to avoid breaking the app).
- Comprehensive dependency CVE remediation (network-restricted environment blocked `pnpm audit` during the audit).

## Users

- Operator (demo-prod): wants a demo that doesn't accidentally expose DB/debug endpoints or leak secrets.
- Developer: wants a safer default posture so "copy/paste deploy" does not create new liabilities.
- Future production hardening: wants clear seams and explicit security ownership.

## Acceptance Criteria (Project-Level)

- AC-01: Docker builds do not include `.env` / `.env.*` files in image layers (unless they are explicit templates like `.env.example`).
- AC-02: Spikes endpoints are unreachable outside dev, even if `SPIKES_ENABLED=1` is mis-set in demo-prod/prod.
- AC-03: In demo-prod, non-GET requests are same-origin (Origin/Sec-Fetch-Site/Referer policy), preventing CSRF-by-side-effects.
- AC-04: Viewer does not derive an internal loopback origin from request `Host` (no loopback SSRF/port scanning).
- AC-05: Baseline security headers are set by the app (or explicitly documented as infra-owned), including clickjacking defense.
- AC-06: demo-prod compose does not publish Postgres to the host by default, and required env vars are enforced at deploy time.
- AC-07: PDF ingest has a hard wall-clock timeout per document (or equivalent isolation), and fails closed on timeout.
- AC-08: CSV exports (including spikes) consistently mitigate formula injection.
- AC-09: Containers run as non-root in runtime stage (or there is an explicit documented reason not to).
- AC-10: Absolute URL generation does not trust `Host` header by default (relative URLs or trusted `PUBLIC_ORIGIN`).

## Implementation Plan (PR Breakdown)

Keep PRs small and ordered by risk reduction per effort.

### PR-001: Stop Docker Secret Leakage (SEC-001)

Changes:
- Update `.dockerignore` to exclude `.env` and `.env.*` at all directory levels.
- Add explicit allow rules for templates (`.env.example`, `.env.template`) if needed.
- Optional: add a CI check that fails if any non-template `.env*` exists in Docker build context.

Acceptance:
- `docker build` from a worktree containing `apps/web/.env.local` does not include that file in any image layer.

Verification:
- Inspect the build context and/or resulting image contents (without printing secrets).

### PR-002: Make Spikes Dev-Only + Harden Spikes CSV Export (SEC-002, SEC-007)

Changes:
- In `apps/web/lib/spikes.server.ts`, require dev mode (`ORBITAL_MODE=dev` and/or `NODE_ENV=development`) in addition to `SPIKES_ENABLED=1`.
- Add defense-in-depth: require an admin token header for the riskiest spikes endpoints (local file reads, export writes).
- Reuse the hardened CSV escape helper for spikes export (no ad-hoc CSV writer).

Acceptance:
- In demo-prod/prod, spikes endpoints return 404/403 regardless of `SPIKES_ENABLED`.
- Spikes CSV export prefixes formula-leading values the same way as main export.

Verification:
- Automated: unit/integration tests for `assertSpikesEnabled()` behavior by mode.
- Manual: attempt `GET /api/spikes/*` in demo-prod; confirm blocked.

### PR-003: Demo-Prod Same-Origin Enforcement for Mutations (SEC-004)

Changes:
- In `apps/web/middleware.ts`, for non-GET/HEAD:
  - enforce `Origin` exact match to expected origin, and/or
  - enforce `Sec-Fetch-Site` is `same-origin` (fallback to strict `Referer`).
- Additionally, for JSON mutation endpoints: require `Content-Type: application/json` and reject others.

Acceptance:
- Cross-site POSTs do not trigger side effects in demo-prod.
- Existing same-origin UI requests continue to work.

Verification:
- Manual: simulate cross-site form POST and confirm 403.
- Automated: middleware unit tests for header policies (where feasible).

### PR-004: Remove Host-Derived Loopback SSRF in Viewer (SEC-003)

Preferred approach:
- Remove internal loopback HTTP entirely (call server helpers directly).

Fallback approach (if internal HTTP must remain):
- Use a canonical, trusted origin from config and do not derive port/host from request headers.
- Do not forward `Authorization` to any origin except the trusted app origin.

Acceptance:
- Request `Host` header does not influence internal fetch destination.

Verification:
- Automated: unit test for origin derivation.
- Manual: set a weird `Host` value via proxy and confirm behavior is unchanged.

### PR-005: Baseline Security Headers + CSP Rollout Plan (SEC-005)

Changes:
- Add baseline headers in `apps/web/next.config.js` `headers()` (or middleware if edge-owned):
  - `X-Content-Type-Options: nosniff`
  - clickjacking defense via `Content-Security-Policy: frame-ancestors 'none'` (and/or `X-Frame-Options: DENY`)
  - `Referrer-Policy`
  - `Permissions-Policy` (minimal)
- CSP: start with `Content-Security-Policy-Report-Only` and iterate; handle the inline script in `apps/web/app/layout.tsx` via nonce or refactor to avoid inline script.

Acceptance:
- Baseline headers present on all routes.
- No regressions in dev/demo-prod flows.

Verification:
- Manual: check response headers for representative routes.

### PR-006: Harden demo-prod Compose Defaults (SEC-008, SEC-010)

Changes:
- In `docker-compose.demo-prod.yml`:
  - remove Postgres host port publishing by default
  - enforce required envs via `${VAR:?required}` syntax (e.g. basic auth + signing secret)
- Optional: bind dev DB to loopback only if needed, or document the hazard in `docker-compose.yml`.

Acceptance:
- demo-prod compose fails fast if required env vars are missing/empty.
- Postgres is not reachable from outside the compose network by default.

Verification:
- Manual: run compose with missing env vars and confirm immediate failure.

### PR-007: PDF Ingest DoS Hardening (SEC-006)

Changes:
- Add a wall-clock timeout per document ingest.
- Ensure timeouts return a safe error envelope and do not leak internals.
- If feasible, add a test for timeout behavior.

Acceptance:
- Worst-case PDFs cannot stall the worker indefinitely.

### PR-008: Run Containers as Non-Root (Report-RP Finding #9)

Changes:
- Update `apps/web/Dockerfile` runtime stage to run as a non-root user.
- Ensure mounted volumes (object store) remain writable.

Acceptance:
- Container runs as non-root; app still functions in demo-prod compose.

### PR-009: Remove Host-Header Dependent Absolute URL Generation (Report-RP Finding #10)

Changes:
- Avoid `new URL(req.url).origin` for absolute URLs in responses unless origin is trusted.
- Prefer returning relative URLs, or use a trusted `PUBLIC_ORIGIN` allowlist config.

Acceptance:
- Host header poisoning cannot change exported absolute URLs.

## Handoff Notes (For The Implementing Agent)

Start by opening:

- `docs/05-reviews-audits/security/security_best_practices_report.md`
- `docs/05-reviews-audits/security/oracle-response-rp.md`

Then implement in order:

1. PR-001 (`.dockerignore`) and validate by inspecting image layers.
2. PR-002 (spikes gating + CSV escape reuse) with tests.
3. PR-003 (demo-prod mutation protections) and manually validate with a cross-site request attempt.

## Risks & Dependencies

- CSP can be a breaking change if rolled out too aggressively; start report-only.
- SSRF fix may require refactoring viewer fetch architecture; keep it thin and testable.
- Dockerfile non-root changes can break file permissions on mounted volumes; validate in compose.

## Locked Decisions (2026-02-10)

1. Demo-prod threat model: assume hostile internet traffic (publicly reachable).
   Justification: safe-by-default reduces operator footguns and keeps demo-prod closer to prod constraints.

2. Spikes availability: dev-only always (never enabled in demo-prod/prod, even behind a token).
   Justification: spikes are explicitly unsafe surfaces; token gates are misconfig-prone and easy to forget to rotate.

3. Security headers ownership: app-owned baseline via Next `headers()` in `apps/web/next.config.js` (infra/WAF may add on top, but app is the baseline).
   Justification: portable and repo-verifiable; avoids drift across deployments.

## Sources

- `docs/05-reviews-audits/security/security_best_practices_report.md`
- `docs/05-reviews-audits/security/security_best_practices_report-rp.md`
- `docs/05-reviews-audits/security/oracle-response-rp.md`
