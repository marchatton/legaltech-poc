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
## [2026-02-11 15:40 UTC] - US-004: Normalize retry semantics across surfaces
Thread: 8404
Run: 20260211-143054-12725 (iteration 4)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-4.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-143054-12725-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 8b93609 fix(retry): normalize retry visibility rules
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: CHAT_ENABLED=1 FEATURE_ARTEFACTS_LIST=1 FEATURE_TRACE_EXPORT=1 pnpm --filter @orbital-poc/web dev --hostname 0.0.0.0 --port 3000 + dev-browser scripted smoke (tmp/us004-chat-retry-semantics.png) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/app/(api)/runs/[id]/trace/route.ts
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/ExportTraceButton.tsx
  - apps/web/app/(app)/matters/[id]/ChatPanel.tsx
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
  - apps/web/app/ui/Button.tsx
  - apps/web/app/ui/ErrorBanner.test.tsx
  - apps/web/app/ui/ErrorBanner.tsx
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009f_error-and-support-patterns/prd.json
- What was implemented
  - Tightened retry CTA rendering to `retryable === true` only, added explicit retryability mapping for transient/non-transient states in chat/export/quick-start surfaces, and aligned runs/trace safe-error envelopes to emit deterministic retryability so retry UI is predictable and idempotent per surface flow.
  - Added retry semantics coverage in `ErrorBanner` tests and browser-verified the acceptance example: transient chat failure shows Retry, validation failure hides Retry and shows corrective guidance.
- **Learnings for future iterations:**
  - Patterns discovered
    - Centralizing retry gating in `ErrorBanner` prevents accidental retry CTA leakage when error payloads omit retryability.
    - Mapping fallback HTTP errors by status class (`>=500` / `429`) gives stable retry defaults for transient failures even when envelopes are unavailable.
  - Gotchas encountered
    - Rendering retry-enabled `ErrorBanner` in Vitest exercises `Button` JSX path; `Button.tsx` needs React in scope in this test runtime.
    - First navigation to `/matters/[id]` in dev can exceed default Playwright navigation timeout due compilation; use longer timeout for smoke scripts.
  - Useful context
    - Browser evidence saved at `/home/sprite/orbital-g/orbital-poc/.agents/skills/00-utilities/dev-browser/tmp/us004-chat-retry-semantics.png`.
---
## [2026-02-11 15:15:40 UTC] - US-002: Enable matters list search/filter/create/open
Thread: 
Run: 20260211-143026-12311 (iteration 2)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-2.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 9a0e9e0 feat(matters-list): add q/state/view list controls
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: browser smoke via dev-browser (`/matters` filter + create validation + open action) -> PASS
- Files changed:
  - apps/web/lib/mattersList.server.ts
  - apps/web/app/(api)/folders/route.ts
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/CreateMatterForm.tsx
  - apps/web/test/mattersListFilters.test.ts
  - apps/web/test/mattersList.sync.test.ts
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.json
- What was implemented
  - Replaced `/matters` with a true matters list surface that supports `q`, `state`, and saved `view` controls with URL-reflected query state.
  - Added deterministic saved-view behavior (`Active`, `Needs Attention`, `Demo Packs`) and DB-backed filtering shared by `/matters` and `GET /folders`.
  - Added `New Matter` inline creation UX with explicit empty-name validation feedback and row-level `Open` actions into `/matters/[id]`.
  - Added regression tests for filter parsing/mapping and sync checks for list control/create/open UI contract.
- **Learnings for future iterations:**
  - Patterns discovered
  - Shared server filter utilities prevent drift between page rendering and API contracts.
  - Gotchas encountered
  - Empty-string query params from HTML forms (for optional selects) must normalize to `undefined` before strict enum parsing.
  - Useful context
  - First-load Next.js compile in dev can exceed default browser automation timeouts; use extended navigation timeout for smoke scripts.
---
## [2026-02-11 15:35:23 UTC] - US-003: Deliver setup documents and upload flow
Thread: 
Run: 20260211-143026-12311 (iteration 3)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-3.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: cb18719 feat(setup): add document upload readiness flow
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: dev-browser smoke (`/matters/[id]` upload success + unsupported MIME sad path) -> PASS
- Files changed:
  - apps/web/lib/documentSetup.ts
  - apps/web/app/(api)/folders/[id]/documents/route.ts
  - apps/web/app/(api)/documents/[id]/upload/route.ts
  - apps/web/app/(api)/documents/[id]/complete/route.ts
  - apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/lib/documentSetup.test.ts
  - apps/web/lib/foldersDocuments.routes.test.ts
  - apps/web/test/setupDocuments.sync.test.ts
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.json
- What was implemented
  - Added a first-class setup documents panel on matter detail with PDF upload init/put/complete flow, readiness status rendering, and explicit handoff messaging to Quick Start/review.
  - Added shared document setup contract utilities so upload capabilities and readiness state derivation stay consistent across UI and API.
  - Extended folder documents API payloads to include parse/ocr + derived readiness `status`, readiness aggregates, capability envelope, and signed PDF URLs; upload-init now enforces the same PDF/size contract used by upload route.
  - Updated upload-complete response to return readiness `status` so the UI can transition document rows immediately after completion.
  - Added regression tests for readiness derivation, route contract behavior, and setup UI flow wiring/capability claims.
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep upload capability constraints in one shared module to avoid API/UI drift and unsupported claim regressions.
  - Gotchas encountered
  - Browser smoke upload in dev requires object-store signing config (`ALLOW_DEV_OBJECT_STORE_SECRET=1` or explicit secret); otherwise upload-init fails at runtime.
  - Useful context
  - Browser verification artifacts saved to `.agents/skills/00-utilities/dev-browser/tmp/us003-setup-upload.png` and `.agents/skills/00-utilities/dev-browser/tmp/us003-setup-upload-unsupported.png`.
---
