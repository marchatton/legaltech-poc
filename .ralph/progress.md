# Progress Log
Started: Sun Feb  8 10:59:34 PM UTC 2026

## Codebase Patterns
- (add reusable patterns here)

---

## [2026-02-08 23:27:56 +0000] - US-001: Load A Demo Pack
Thread:
Run: 20260208-225934-14994 (iteration 1)
Run log: /home/sprite/orbital-c/.ralph/runs/run-20260208-225934-14994-iter-1.log
Run summary: /home/sprite/orbital-c/.ralph/runs/run-20260208-225934-14994-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 426271f feat(demo): load allowlisted demo packs
- Post-commit status: clean
- Verification:
  - Command: pnpm verify -> PASS
- Files changed:
  - apps/web/app/(api)/demo/load-pack/route.ts
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/DemoToolbar.tsx
  - apps/web/app/layout.tsx
  - apps/web/app/page.tsx
  - apps/web/lib/db.server.ts
  - apps/web/lib/demoMode.server.ts
  - docs/04-projects/02-features/0007_demo-reliability/prd.json
- What was implemented
  - Feature-flagged demo toolbar (DEMO_MODE=1) with allowlisted pack selector.
  - Dev-only POST /demo/load-pack to seed a fresh folder + documents from fixture packs, enqueue ingest, and return the new folder id for navigation.
  - Matter page at /matters/:id to confirm seeded docs and open PDFs via signed URLs.
- **Learnings for future iterations:**
  - Next build can import server modules with NODE_ENV=production; avoid throwing on module init for missing env and fail-late on first DB operation instead.
  - dev-browser must run in headless mode in this environment (`./server.sh --headless`).
---
