# Progress Log
Started: Sun Feb  8 10:59:34 PM UTC 2026

## Codebase Patterns
- (add reusable patterns here)

---

## [2026-02-09 08:33:23 +0000] - US-001: Export Memo Docx
Thread:
Run: 20260209-075351-22094 (iteration 1)
Run log: /home/sprite/orbital-b/.ralph/runs/run-20260209-075351-22094-iter-1.log
Run summary: /home/sprite/orbital-b/.ralph/runs/run-20260209-075351-22094-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: c641dd9 feat(export): add memo docx export
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm verify -> PASS
  - Command: DEMO_MODE=1 pnpm dev -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && npx tsx (export flow) -> PASS
- Files changed:
  - apps/web/app/(api)/export/docx/route.ts
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/ArtefactsList.tsx
  - apps/web/lib/memoDocx.server.ts
  - apps/web/lib/exportDocx.routes.test.ts
  - apps/web/package.json
  - pnpm-lock.yaml
  - docs/04-projects/02-features/0005_word-export/prd.json
- What was implemented
  - Added `POST /export/docx` (kind=`memo`) that enforces `runs.state=completed` (409 otherwise), consumes structured list payloads (TS-03/TS-04/TS-09), renders `memo.docx`, persists it as an artefact, and returns a signed download URL.
  - Implemented a deterministic memo renderer (`apps/web/lib/memoDocx.server.ts`) using headings + bullets and inline citation formatting.
  - Added an `Export memo (Word)` button and embedded Artefacts list to `/matters/:id`, with export disabled until the latest run is `completed`.
  - Added route-level tests covering completed-run gating and docx generation.
- **Learnings for future iterations:**
  - Avoid hardcoding `http://localhost:3000` in server components; Next dev can shift ports (3001+). A safe localhost-origin helper keeps SSRF posture while supporting dynamic ports.
  - Route tests that mock `sql` need to stub helper properties like `sql.json`.
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

## [2026-02-09 00:09:10 +0000] - US-003: Follow A Demo Checklist
Thread:
Run: 20260208-225934-14994 (iteration 3)
Run log: /home/sprite/orbital-c/.ralph/runs/run-20260208-225934-14994-iter-3.log
Run summary: /home/sprite/orbital-c/.ralph/runs/run-20260208-225934-14994-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 43f40dc feat(demo): add quick start panel and checklist
- Post-commit status: clean
- Verification:
  - Command: pnpm verify -> PASS
  - Command: DEMO_MODE=1 pnpm dev -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && ./server.sh --headless -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && npx tsx (browser flow) -> PASS
- Files changed:
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
  - apps/web/test/demoChecklist.sync.test.ts
  - docs/04-projects/02-features/0007_demo-reliability/demo-checklist.md
  - docs/04-projects/02-features/0007_demo-reliability/prd.json
- What was implemented
  - Updated `docs/04-projects/02-features/0007_demo-reliability/demo-checklist.md` to match the real demo toolbar -> matter -> quick start operator flow.
  - Added a small Vitest drift-guard to keep the checklist in sync with demo UI labels + allowlisted packs.
- **Learnings for future iterations:**
  - Paths containing parentheses need quoting in shell commands (e.g. `\"apps/web/app/(app)/...\"`).
  - The dev-browser server requires headless mode in this environment; use `./server.sh --headless`.
---

## [2026-02-09 08:28:51 +0000] - US-001: Export CSV Artefacts
Thread:
Run: 20260209-075347-21829 (iteration 1)
Run log: /home/sprite/orbital-a/.ralph/runs/run-20260209-075347-21829-iter-1.log
Run summary: /home/sprite/orbital-a/.ralph/runs/run-20260209-075347-21829-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: c58209b feat(csv-export): add deterministic CSV exports
- Post-commit status: clean
- Verification:
  - Command: pnpm -s --filter @orbital-poc/web test -> PASS
  - Command: pnpm -s fixture:seed pack_01_clean --overwrite -> PASS
  - Command: FEATURE_ARTEFACTS_LIST=1 pnpm --filter @orbital-poc/web dev -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && ./server.sh --headless -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && npx tsx (browser flow) -> PASS
  - Command: pnpm -s verify -> PASS
- Files changed:
  - apps/web/app/(api)/export/csv/route.ts
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/lib/exportCsv.server.ts
  - apps/web/lib/exportCsv.server.test.ts
  - scripts/fixtures/seed.ts
- What was implemented
  - Implemented `POST /export/csv` to generate v1 CSVs from structured `list_payload_v0` rows with locked headers and deterministic row ordering, then persist as artefacts with signed download URLs.
  - Updated Matters UI to export all 3 CSV kinds (requirements_tracker, exceptions_table, survey_issues) and refresh the artefacts list after export.
  - Seeded `TS-03` requirements tracker structured payloads from fixture truth so pack_01_clean supports exports without prose parsing.
  - Added Vitest coverage for locked headers, deterministic ordering, and citation rendering.
- **Learnings for future iterations:**
  - `pack_01_clean` fixture seeding had list payloads for exceptions/survey issues but not requirements; export depends on seeding structured payloads for all list-payload questions.
  - The dev-browser server requires headless mode in this environment; use `./server.sh --headless`.
---

## [2026-02-10 13:30:02 +0000] - US-001: WDK worker claims and executes steps durably
Thread:
Run: 20260210-130418-29584 (iteration 1)
Run log: /home/sprite/orbital-a/.ralph/runs/run-20260210-130418-29584-iter-1.log
Run summary: /home/sprite/orbital-a/.ralph/runs/run-20260210-130418-29584-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d43e29f feat(wdk): claim steps with SKIP LOCKED
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm verify -> PASS
- Files changed:
  - apps/web/lib/db/schema/core.server.ts
  - apps/web/lib/wdk/stepQueue.server.ts
  - apps/web/lib/wdk/wdkWorker.server.ts
  - apps/web/test/wdkStepQueue.int.test.ts
  - docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003a_wdk-runtime-skeleton/prd.json
- What was implemented
  - Extended `run_steps` to act as a durable step queue (available_at + locks + JSON IO) and added an index for efficient claiming.
  - Implemented step claiming with `FOR UPDATE SKIP LOCKED` plus durable state transitions (succeed/fail/reschedule) and stale-lock requeue.
  - Added a minimal step worker drain loop and DB-backed tests proving two workers cannot double-claim or double-execute the same `(run_id, step_key)`.
- **Learnings for future iterations:**
  - `FOR UPDATE SKIP LOCKED` behavior is easiest to verify by holding an open transaction on one worker and asserting the second claim returns quickly (no blocking).
  - For 1-based attempt counters that increment on claim, queued steps should start at attempt 0 and increment inside the claim UPDATE.
---

## [2026-02-10 13:56:35 +0000] - US-002: wdk_smoke workflow proves conventions + retries
Thread:
Run: 20260210-130418-29584 (iteration 2)
Run log: /home/sprite/orbital-a/.ralph/runs/run-20260210-130418-29584-iter-2.log
Run summary: /home/sprite/orbital-a/.ralph/runs/run-20260210-130418-29584-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d68dd9a feat(wdk): add wdk_smoke workflow retry path
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm verify -> PASS
- Files changed:
  - apps/web/app/(api)/spikes/wdk/smoke/start/route.ts
  - apps/web/app/(api)/spikes/wdk/smoke/state/route.ts
  - apps/web/lib/wdk/stepQueue.server.ts
  - apps/web/scripts/worker.ts
  - apps/web/steps/wdkSmokeDone.step.server.ts
  - apps/web/steps/wdkSmokeFlaky.step.server.ts
  - apps/web/steps/wdkSmokeInit.step.server.ts
  - apps/web/steps/wdkSmokeStepHandlers.server.ts
  - apps/web/test/wdkStepQueue.int.test.ts
  - apps/web/workflows/wdkSmokeWorkflow.server.ts
  - docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003a_wdk-runtime-skeleton/prd.json
- What was implemented
  - Added a tiny `wdk_smoke` workflow plus 3 durable steps (`init`, `flaky`, `done`) that include `"use workflow"` / `"use step"` directive literals.
  - Implemented a fail-once step that exercises durable retry scheduling with exponential backoff and an incrementing attempt counter.
  - Added dev-only spikes routes to start the workflow and inspect durable run/step state (`/spikes/wdk/smoke/start`, `/spikes/wdk/smoke/state`).
  - Wired `pnpm --filter @orbital-poc/web worker` to run the WDK worker loop alongside the existing jobs worker.
  - Made `scheduleStep()` default `available_at` to Postgres `now()` to avoid app-vs-DB clock skew.
- **Learnings for future iterations:**
  - When `available_at` is derived from JS time, even small DB/app clock skew can make freshly scheduled steps briefly unclaimable; defaulting to DB `now()` avoids flaky drains.
  - Vitest runs test files in parallel; DB-backed queue tests should avoid cross-file concurrency (or share a single integration test file) to prevent lock contention and queue interference.
---
