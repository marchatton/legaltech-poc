# Progress Log
Started: Tue Feb 10 10:29:48 PM UTC 2026

## Codebase Patterns
- (add reusable patterns here)

---
## [2026-02-10 22:48:42 UTC] - US-003: Remove legacy durable jobs runtime (execute_run + worker loop)
Thread:
Run: 20260210-222948-4259 (iteration 1)
Run log: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260210-222948-4259-iter-1.log
Run summary: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260210-222948-4259-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: f18a820 refactor(worker): remove legacy execute_run jobs runtime
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web build -> PASS
- Files changed:
  - apps/web/lib/jobs/jobQueue.server.ts
  - apps/web/lib/jobs/jobWorker.server.ts
  - apps/web/lib/quickStartRunQueue.server.ts
  - apps/web/scripts/worker.ts
  - apps/web/test/wdkStepQueue.int.test.ts
  - docs/03-architecture/07_current_poc_runtime.md
  - docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.json
- What was implemented
  - Removed the legacy durable jobs runtime for Quick Start by deleting the enqueue helper and the `execute_run` job queue/worker modules.
  - Updated the worker entrypoint to run only the WDK worker loop (no jobs worker loop).
  - Updated runtime docs to reflect WDK-only execution and removal of `execute_run` jobs runtime.
- **Learnings for future iterations:**
  - TypeScript control-flow analysis does not reliably track `let` assignments performed inside async callbacks; return values through the awaited promise chain instead.
  - `postgres` transactions + `savepoint` are useful for non-destructive DB concurrency tests.

---
## [2026-02-10 23:41 UTC] - US-003: Evidence-first behavior and safe failures
Thread:
Run: 20260210-224307-10605 (iteration 3)
Run log: /home/sprite/orbital-h/orbital-poc/.ralph/runs/run-20260210-224307-10605-iter-3.log
Run summary: /home/sprite/orbital-h/orbital-poc/.ralph/runs/run-20260210-224307-10605-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 5a7a502 feat(chat): add evidence-first failures and gating
- Post-commit status: clean
- Verification:
  - Command: pnpm -r typecheck -> PASS
  - Command: pnpm -r lint -> PASS
  - Command: pnpm -r test -> PASS
  - Command: pnpm -r build -> PASS
  - Command: pnpm fixture:eval:all -> PASS
- Files changed:
  - apps/web/.env.example
  - apps/web/app/(api)/folders/[id]/chat/route.ts
  - apps/web/app/(app)/evidence/[id]/page.tsx
  - apps/web/app/(app)/matters/[id]/ChatPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/lib/chat/protocol.ts
  - apps/web/middleware.ts
  - apps/web/test/wdkStepQueue.int.test.ts
  - docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.json
- What was implemented
  - Evidence-first chat stream: when retrieval returns no chunks, assistant returns exactly `Not found in provided documents.` and no sources are rendered.
  - Safe streaming failures: model/stream errors end in terminal `citation_failed` UI with retry guidance.
  - Feature-flag gating: chat panel is hidden unless `CHAT_ENABLED=1`; API returns a 404 disabled envelope when off.
  - Demo-prod allowlist updated for `/evidence/*` and `/folders/:id/chat`.
  - Browser verification completed (screenshots: `.agents/skills/00-utilities/dev-browser/tmp/us003-*.png`).
- **Learnings for future iterations:**
  - Prefer a shared `MISSING_EVIDENCE_TEXT` constant to keep the exact string consistent across UI/API.
  - Use NDJSON event streams to make terminal failure states explicit without leaking provider errors.
  - Playwright in Sprite needs headless mode (no X server); run dev-browser with `--headless`.
---
## [2026-02-11 14:44 UTC] - US-001: Standardize deterministic error envelope adoption
Thread: 
Run: 20260211-143054-12725 (iteration 1)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-1.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 764d6ae fix(api): standardize deterministic error envelopes
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -> PASS (booted on :3001, then stopped intentionally)
- Files changed:
  - packages/core/src/safe-error.ts
  - apps/web/app/(api)/export/csv/route.ts
  - apps/web/app/(api)/export/docx/route.ts
  - apps/web/app/(api)/folders/[id]/chat/route.ts
  - apps/web/lib/chat/protocol.ts
  - apps/web/lib/jsonContentType.ts
  - apps/web/lib/devOnlyApi.server.ts
  - apps/web/lib/exportCsv.routes.test.ts
  - apps/web/lib/exportDocx.routes.test.ts
  - apps/web/lib/chat.routes.test.ts
  - apps/web/lib/chat.protocol.test.ts
  - .ralph/activity.log
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.json
- What was implemented
  - Extended the shared safe-error envelope contract to support deterministic `retryable` and optional `support_hint` fields.
  - Standardized export CSV/DOCX failure envelopes to include deterministic `retryable` semantics and `trace_id`, and removed direct passthrough of caught exception strings in client-visible export errors.
  - Standardized chat HTTP failure envelopes and NDJSON stream error events to include deterministic `code`, `trace_id`, `retryable`, and safe message text.
  - Added route/protocol tests to assert deterministic export/chat error envelope behavior and fail-closed chat stream parsing.
- **Learnings for future iterations:**
  - Deriving `retryable` at route-level via small envelope helpers enables incremental contract rollout without breaking untouched routes.
  - NDJSON terminal error events should carry their own trace metadata; relying only on a prior meta event is brittle for consumers.
  - Error-detail payloads in catch paths should avoid raw thrown strings to reduce accidental internal leakage.
---
## [2026-02-11 15:09:07 +0000] - US-002: Integrate reusable ErrorBanner across surfaces
Thread: 
Run: 20260211-143054-12725 (iteration 2)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-2.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 4d568ab feat(error-banner): unify cross-surface error banners
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm --filter @orbital-poc/web lint` -> PASS
  - Command: `pnpm --filter @orbital-poc/web typecheck` -> PASS
  - Command: `pnpm --filter @orbital-poc/web test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `CHAT_ENABLED=1 FEATURE_ARTEFACTS_LIST=1 pnpm --filter @orbital-poc/web dev --hostname 0.0.0.0 --port 3000` + dev-browser smoke script -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/ArtefactsList.tsx
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/ExportTraceButton.tsx
  - apps/web/app/(app)/matters/[id]/ChatPanel.tsx
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/ui/ErrorBanner.tsx
  - apps/web/app/ui/ErrorBanner.test.tsx
  - apps/web/lib/safeErrorDisplay.ts
  - apps/web/lib/safeErrorDisplay.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.json
- What was implemented
  - Added a reusable `ErrorBanner` component with deterministic `code` + optional `trace_id` display and optional retry CTA.
  - Added shared safe-error parsing (`parseSafeErrorEnvelope`, `parseSafeErrorLike`) and tests to standardize envelope field mapping.
  - Replaced bespoke error UIs with `ErrorBanner` across setup (`QuickStartPanel`, document error state), report actions (`/matters` review errors), exports/artefacts (`ExportCsvButton`, `ExportMemoButton`, `ExportTraceButton`, `ArtefactsList`), and chat (`ChatPanel`).
  - Removed raw document `error_json` rendering in matter setup and replaced it with safe deterministic banner output.
  - Browser-smoke verified cross-surface UI behavior with deterministic code rendering; screenshots saved under `/home/sprite/orbital-g/orbital-poc/.agents/skills/00-utilities/dev-browser/tmp/us002-*.png`.
- **Learnings for future iterations:**
  - Patterns discovered
    - A shared parser for safe error envelopes prevents repeated per-component `isRecord` logic and keeps field mapping deterministic.
    - A single banner primitive with optional actions is enough to unify setup/report/export/chat error treatment without route-specific UI forks.
  - Gotchas encountered
    - Vitest in this repo runs in node mode and requires explicit React import for JSX in some test/render paths.
    - `ChatPanel` visibility depends on `CHAT_ENABLED=1`; browser validation should start dev server with explicit feature env vars.
  - Useful context
    - Browser smoke automation used request interception to force deterministic failure envelopes and validate banner consistency quickly.
---
## [2026-02-11 15:26:28 +0000] - US-003: Add support escalation action pattern
Thread: 
Run: 20260211-143054-12725 (iteration 3)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-3.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 4f2e692 feat(error-banner): add support escalation pattern
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web test -- app/ui/ErrorBanner.test.tsx -> PASS
  - Command: browser check http://localhost:3000/matters?review_error=VALIDATION_ERROR (fallback path) -> PASS
  - Command: NEXT_PUBLIC_SUPPORT_ESCALATION_MAILTO=support@orbital.test pnpm exec next dev --port 3001 + browser check http://localhost:3001/matters?review_error=VALIDATION_ERROR (configured path) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/.env.example
  - apps/web/app/(app)/matters/ArtefactsList.tsx
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/ExportTraceButton.tsx
  - apps/web/app/(app)/matters/[id]/ChatPanel.tsx
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/ui/ErrorBanner.test.tsx
  - apps/web/app/ui/ErrorBanner.tsx
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.json
- What was implemented
  - Extended `ErrorBanner` with an optional support escalation action pattern, including deterministic support context (`code`, `trace_id`, `route`).
  - Added config-driven escalation target support via `NEXT_PUBLIC_SUPPORT_ESCALATION_MAILTO` and deterministic mailto payload generation.
  - Implemented negative-path degradation: when the support target is unset, the banner hides the external action and shows explicit fallback instructions with copyable identifiers.
  - Wired `supportRoute` through current `/matters` and `/matters/[id]` ErrorBanner callsites so escalation context includes route consistently.
  - Added tests for configured mailto payload composition and unset-target fallback rendering.
  - Browser-verified both paths with screenshots at:
    - `/home/sprite/orbital-g/orbital-poc/.agents/skills/00-utilities/dev-browser/tmp/us003-fallback.png`
    - `/home/sprite/orbital-g/orbital-poc/.agents/skills/00-utilities/dev-browser/tmp/us003-configured.png`
- **Learnings for future iterations:**
  - Patterns discovered
    - Keep support-escalation payload construction in one reusable helper so the safe identifier contract stays deterministic.
    - Passing `supportRoute` from callsites avoids brittle route inference and keeps server/client rendering stable.
  - Gotchas encountered
    - `dev-browser` requires headless mode in this environment because no X server is available.
    - First load on a fresh dev port can exceed default Playwright navigation timeout due to Next.js compile time.
  - Useful context
    - Checkpoint `v12` was created after verification to preserve the passing state.
---
