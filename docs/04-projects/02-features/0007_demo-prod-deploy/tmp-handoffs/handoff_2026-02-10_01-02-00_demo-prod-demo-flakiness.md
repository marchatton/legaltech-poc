# Handoff: Demo-prod deploy + demo flakiness hardening

## 1) Scope / status
- Objective: make Orbital PoC demoable as the "real app" (eventual demo-prod on Hetzner), and fix demo flakiness seen when clicking around.
- Done:
  - Confirmed root causes for demo fragility: dev-only gates, demo-mode is dev-only, worker required outside dev, signed URL secret required.
  - Fixed a concrete flake: signed render/PDF URLs could fail in dev because the dev signing secret varied across Next dev isolates.
  - Updated docs/dossier + logged ADR.
- Pending:
  - Implement actual demo-prod runtime: `ORBITAL_MODE=demo-prod` allowlist + Next middleware Basic Auth + Docker/Compose (web + worker + db).
  - Fix remaining dev demo annoyance: fixture `/matters` artefacts list shows "fetch failed" because `ArtefactsList.tsx` pins to `http://127.0.0.1:PORT` and Sprite may reset on 127.0.0.1.

## 2) Working tree
- `git status -sb` (as of 2026-02-10 01:02):
  - On branch `main` with local modifications and some unrelated staged changes:
    - Modified:
      - `apps/web/lib/objectStore.server.ts`
      - `docs/02-guidelines/v5-final/design-system.html`
      - `docs/03-architecture/DECISIONS.md`
      - `docs/04-projects/02-features/0007_demo-prod-deploy/{investigation.md,plan.md,prd.md}`
      - plus unrelated chat-interface dossier files already modified in worktree.
    - Untracked:
      - `docs/96-engineering-tutor-learnings/2026-02-10_demo-prod-vs-demo-mode.md`
- No commits created.

## 3) Branch / PR
- Branch: `main`
- PR: none
- CI: not run

## 4) Running processes
- Dev server appears to be running on port 3000:
  - `node` listening on `*:3000` (Next dev)
  - `sprite proxy` also listening on `127.0.0.1:3000` (cannot be killed from this sandbox)
- No tmux sessions detected.

## 5) Tests / checks
- Ran: `pnpm --filter @orbital-poc/web typecheck` (PASS)
- Ran a simple browser smoke (headless via agent-browser):
  - Open `http://localhost:3000/matters?pack=pack_01_clean` (PASS)
  - Click `cit_TS-01_1` to open viewer (PASS after signing secret fix)

## 6) Next steps
1. Fix artefacts list flake in fixture `/matters`:
   - `apps/web/app/(app)/matters/ArtefactsList.tsx` currently uses `safeLocalOriginFromHostHeader` returning `http://127.0.0.1:<port>`.
   - Change to prefer `http://localhost:<port>` (or avoid loopback HTTP fetch entirely by querying DB directly, then signing download URLs).
2. Implement demo-prod runtime mode:
   - Add `ORBITAL_MODE=demo-prod` runtime gate and switch allowlisted app routes from `assertDevOnly*` to the new gate.
   - Add Next middleware Basic Auth for demo-prod.
   - Ensure internal server-side fetches forward `Authorization` where still used (e.g. viewer page, artefacts list) or remove loopback fetch.
3. Docker/Hetzner:
   - Add Dockerfile + `docker-compose.demo-prod.yml` for `web` + `worker` + `db` with shared `OBJECT_STORE_ROOT` and required secrets.

## 7) Risks / gotchas
- Dev-only signing secret fix:
  - `apps/web/lib/objectStore.server.ts` now persists dev signing secret to `tmp/object-store/.dev-signing-secret` (gitignored) to avoid signature mismatch between endpoints.
- Sprite:
  - Sprite proxy on `127.0.0.1:3000` can cause loopback fetches to reset. Prefer `localhost` or avoid loopback fetch.
- Production build:
  - Outside dev, inline job draining is disabled; worker must run separately (`pnpm --filter @orbital-poc/web worker`).
- Docs:
  - ADR added: `docs/03-architecture/DECISIONS.md` -> ADR-0023.
- Design system:
  - `docs/02-guidelines/v5-final/design-system.html` updated with simple links to `tokens.css` and `tailwind.preset.ts`.
