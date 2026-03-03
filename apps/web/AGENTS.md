# Web app (apps/web)
Next.js App Router web application.

## Stack
- Next.js App Router + TypeScript
- Tailwind + v5 design tokens (`app/tokens.css` + `tailwind.preset.ts`)
- Validation: Zod
- PDF rendering: `pdfjs-dist`
- DB client: `postgres`
- Tests: Vitest

## Guardrails (high leverage)
- Server-first: fetch on the server (RSC / route handlers / server actions). Avoid client-side data fetching effects.
- Treat `useEffect` as an escape hatch (imperative interop only) — not for data fetching, derived state, prop→state, or URL sync.
- Never import server-only into client components (use `server-only` / `client-only` boundaries).
- Validate external inputs with Zod and map errors to safe user-facing messages.
- AI SDK flows: use Workflow DevKit (`workflow`) and add `"use workflow"` in async TS fns for durability, reliability, observability.
  - Conventions for `"use workflow"` / steps are defined in `docs/03-architecture/06_frameworks_agents_rag_evals.md`.

## Demo-Prod Deploy Note
- The intended operator flow is: iterate locally (Sprite/host) first, then deploy to a single Hetzner VM via Docker Compose.
- Canonical runbook: `docs/04-projects/02-features/0007_demo-prod-deploy/runbook.md`

## Runtime Defaults (Important)
- Local dev and Sprite dev are host-native (non-Docker). Run app/worker with `pnpm` on the host/VM.
- For local/Sprite, use a host Postgres service at `127.0.0.1:5432` (default DSN: `postgresql://orbital:orbital@127.0.0.1:5432/orbital`).
- Use Docker Compose for demo-prod packaging/deploy workflows, not for day-to-day local or Sprite iteration.

## Local Dev Notes
- For artefacts tab UI checks in local dev, enable list rendering + dev signing fallback:
  `FEATURE_ARTEFACTS_LIST=1 ALLOW_DEV_OBJECT_STORE_SECRET=1 pnpm --filter @legaltech-poc/web dev -p 3101`
- When validating evidence-viewer/render flows locally, start dev with:
  `ALLOW_DEV_OBJECT_STORE_SECRET=1 FEATURE_CITATIONS_API=1 pnpm --filter @legaltech-poc/web dev`

## Frontend skills
- `generating-tailwind-brand-config` for brand tokens/config
- `baseline-ui`, `interface-design`, `frontend-design`, and `web-design-guidelines` for UI
- `interaction-design`, `12-principles-of-animation`, and `fixing-motion-performance` for motion
- `fixing-accessibility` and `wcag-audit-patterns` for a11y/UX
- `tailwind-css-patterns`, `composition-patterns`, and `react-best-practices` for styling/structure/perf/critique; `rams` as backup critique
