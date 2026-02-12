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
## [2026-02-11 15:50:10 UTC] - US-004: Show Quick Start readiness reasons
Thread: 
Run: 20260211-143026-12311 (iteration 4)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-4.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-143026-12311-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 8e5ad8e feat(quick-start): show readiness reason states
- Post-commit status: `clean`
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (checked `/matters/fld_us004_blocked`, `/matters/fld_us004_ready`, `/matters/fld_us004_complete`) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/test/quickStartReadiness.sync.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009a_shell-matters-setup/prd.json
- What was implemented
  - Added an explicit Quick Start readiness model (`ready`, `blocked`, `already-complete`) and rendered operator-facing reason copy for each state.
  - Added actionable blocked guidance for missing indexed docs (upload + refresh readiness path) without adding backend checklist persistence or new run-state APIs.
  - Added completed-run specific copy so operators understand the matter is already done and what to do next.
  - Added sync test coverage to lock the readiness state contract and reason-copy presence.
  - Browser-verified all three readiness states with screenshots:
    - .agents/skills/00-utilities/dev-browser/tmp/us004-blocked.png
    - .agents/skills/00-utilities/dev-browser/tmp/us004-ready.png
    - .agents/skills/00-utilities/dev-browser/tmp/us004-complete.png
- **Learnings for future iterations:**
  - Patterns discovered
  - Model user-facing run affordances as explicit UI states to keep copy and disabled behavior aligned.
  - Gotchas encountered
  - First request to a newly compiled Next.js route can exceed default 30s Playwright navigation timeout; increase timeout for first-hit browser checks.
  - Useful context
  - Reusing derived document readiness data for both rendering and counters avoids duplicate status computations.
---
## [2026-02-11 17:25:18 UTC] - US-001: Ship run selector API contract for export/report
Thread: 
Run: 20260211-171748-22180 (iteration 1)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-1.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 1806392 feat(api): add completed run selector list
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- foldersRunsList.routes.test.ts -> PASS
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
- Files changed:
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/middleware.ts
  - apps/web/lib/foldersRunsList.routes.test.ts
  - .ralph/activity.log
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.json
- What was implemented
  - Added `GET /folders/:id/runs` with validated params and safe error envelopes, returning selector-ready completed runs as `{ run_id, status, created_at, updated_at }`.
  - Limited run selector results to newest completed runs (parity v1) and sorted newest-first so clients can default to the first option deterministically.
  - Updated demo-prod middleware allowlist to permit `GET /folders/:id/runs` alongside existing run start POST behavior.
  - Added route contract tests covering selector payload shape, completed-only query enforcement, and folder-not-found behavior.
- **Learnings for future iterations:**
  - Patterns discovered
  - Reusing the existing runs route file for both POST (start) and GET (selector) keeps run contract logic centralized and reduces drift.
  - Gotchas encountered
  - In this repo, `pnpm --filter @orbital-poc/web test -- <pattern>` still executes the full Vitest suite, so budget runtime accordingly.
  - Useful context
  - Demo-prod middleware must be updated whenever a new API method is added to an existing path, or contracts pass tests but fail in guarded runtime mode.
---
## [2026-02-11 17:39:51 UTC] - US-002: Add run-scoped export panel and failed-row deep-link
Thread: 
Run: 20260211-171748-22180 (iteration 2)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-2.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 344df08 feat(exports): add run-scoped export panel
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: dev-browser smoke (selector + blocked export deep-link) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/ExportsPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/runScope.ts
  - apps/web/app/(app)/matters/runScope.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.json
- What was implemented
  - Added a run-scoped export panel with a completed-run selector and explicit selected-run display.
  - Bound memo and all CSV export actions to the selected run, including URL sync of `run_id` in the matter page query.
  - Updated blocked export UX to show `Review failed rows` deep-links targeting `/matters/:id?tab=report&run_id=<id>&status=failed`.
  - Added run-scope helper utilities + tests to lock deep-link query generation and run selection fallback behavior.
  - Browser-verified that switching run selection updates blocked deep-link URLs and preserves run/status query params after navigation.
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep run scope derivation centralized in shared helpers so export/chat/report surfaces can reuse identical URL and fallback logic.
  - Gotchas encountered
  - The local `dev-browser` server must run in headless mode in Sprite environments without X11 (`./server.sh --headless`).
  - Useful context
  - Browser evidence screenshot: `.agents/skills/00-utilities/dev-browser/tmp/us002-export-panel.png`.
---
## [2026-02-11 18:03:37 UTC] - US-003: Implement artefact filtering and provenance display
Thread: 
Run: 20260211-171748-22180 (iteration 3)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-3.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: dda5613 feat(artefacts): add filtering and provenance UI
- Post-commit status: `clean`
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS (rerun after one transient hook-timeout FAIL)
  - Command: pnpm build -> PASS
  - Command: dev-browser smoke on `http://localhost:3100/matters/fld_ui_us003` (unsafe/type filters + source run persistence) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/ArtefactsList.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/artefactsFilters.test.ts
  - apps/web/app/(app)/matters/artefactsFilters.ts
  - apps/web/test/artefactsList.sync.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.json
- What was implemented
  - Added artefact filter controls for `kind`, `type`, and `safety` with server-side filtering and URL query persistence.
  - Extended artefact rows to display `type`, `safety`, and `source_run_id` in a dedicated provenance column that remains visible under all filter combinations.
  - Preserved non-artefact query params during filter apply/clear and fixed clear behavior to remain on the current matter route.
  - Added unit coverage for filter parsing/application and sync checks for UI wiring + provenance rendering contract.
  - Browser-verified filter behavior and provenance visibility with screenshots in `.agents/skills/00-utilities/dev-browser/tmp/`.
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep filter parsing/filtering pure and testable in a standalone helper so UI components stay focused on rendering.
  - Gotchas encountered
  - Relative clear links like `.` can resolve unexpectedly in nested Next routes; use explicit query-only clear (`?`) to stay on the current page.
  - Useful context
  - `pnpm --filter @orbital-poc/web test` can intermittently trip Vitest hook timeout on integration setup; immediate rerun passed without code changes.
---
## [2026-02-11 18:21:36 UTC] - US-004: Add download feedback and unsafe explanation pattern
Thread: 
Run: 20260211-171748-22180 (iteration 4)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-4.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260211-171748-22180-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 71eeebd feat(artefacts): add download feedback and unsafe tooltip
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: dev-browser smoke on http://localhost:3101/matters/fld_ui_us003?tab=artefacts -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/AGENTS.md
  - apps/web/app/(app)/matters/ArtefactDownloadButton.tsx
  - apps/web/app/(app)/matters/ArtefactsList.tsx
  - apps/web/app/(app)/matters/UnsafeArtefactBadge.tsx
  - apps/web/test/artefactDownloadFeedback.sync.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009c_exports-and-artefacts/prd.json
- What was implemented
  - Added a client-side artefact download action that now surfaces explicit pending, completion, and stale/error feedback states.
  - Added a freshness hint after download starts (`Signed link fresh for about ...`) and stale-link handling when the signed URL is expired.
  - Replaced plain unsafe badges with tooltip-backed unsafe badges that explain the safety override context.
  - Wired the new download feedback and unsafe explanation components into the artefacts table for all rows.
  - Added `artefactDownloadFeedback.sync.test.ts` to lock the US-004 parity contract.
  - Added an operational note to `apps/web/AGENTS.md` for local artefacts-tab verification flags.
- **Learnings for future iterations:**
  - Patterns discovered
  - Server-rendered tables can keep DB/query logic on the server while delegating per-row interactive feedback to small client components.
  - Gotchas encountered
  - For this repo’s local artefact flows, browser verification requires `FEATURE_ARTEFACTS_LIST=1` and `ALLOW_DEV_OBJECT_STORE_SECRET=1`.
  - Useful context
  - Browser evidence screenshot: `.agents/skills/00-utilities/dev-browser/tmp/us004-artefacts-feedback.png`.
---
## [2026-02-11 18:02:00 UTC] - US-002: Use row drawer as primary review decision surface
Thread: 
Run: 20260211-171747-21967 (iteration 2)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-2.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 167df3d feat(report-triage): add row drawer review workflow
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> FAIL
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/wdkStepQueue.int.test.ts -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (drawer success/failure browser checks) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/app/(api)/report-rows/[id]/route.ts
  - apps/web/lib/reportRows.routes.test.ts
  - apps/web/test/reportRowDrawer.sync.test.ts
  - apps/web/test/reportTriage.sync.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.json
- What was implemented
  - Added a drawer-first `ReportTriagePanel` on matter detail so rows open in-context with structured payload, citation summary, and metadata (`schema field`, `data type`, `model/version`).
  - Added optimistic `Mark reviewed` row action in the drawer with immediate table-state update and success confirmation copy.
  - Added explicit error-path UI feedback using `ErrorBanner` so mutation failures (for example `INVALID_STATE`) are visible and actionable instead of silent.
  - Added a new `PATCH /report-rows/:id` mutation route with request validation and deterministic safe-error responses for invalid state and missing row cases.
  - Added regression coverage for the mutation route and drawer wiring, and updated triage sync coverage after moving the dense table into the new panel component.
  - Browser-verified both happy and negative paths with screenshots:
    - .agents/skills/00-utilities/dev-browser/tmp/us002-drawer-success.png
    - .agents/skills/00-utilities/dev-browser/tmp/us002-drawer-failure.png
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep row-action UI optimistic but pair it with strict server-state validation and explicit fallback/error restoration.
  - Gotchas encountered
  - Full `pnpm --filter @orbital-poc/web test` is currently flaky under integration load in this environment (hook/test timeouts + intermittent DB connection pressure); single-suite reruns pass.
  - Useful context
  - Folder `fld_82d7385b-d4fa-4b11-bc07-7a77ed1f0e63` has mixed report statuses and was used for browser evidence.
---
## [2026-02-11 18:35:39 UTC] - US-003: Ship split-view evidence controls and verification states
Thread: 
Run: 20260211-171747-21967 (iteration 3)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-3.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: bffcf5d feat(report-viewer): add split-view evidence controls
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (US-003 split-view script) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - apps/web/AGENTS.md
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.json
  - .ralph/progress.md
- What was implemented
  - Added split-view lock controls in the row drawer with browser-local persistence and an evidence pane that keeps row context + viewer visible together.
  - Replaced iframe embedding with an inline `CitationViewerClient` render path because runtime CSP (`frame-ancestors 'none'`) blocks iframe embedding in this app.
  - Added explicit evidence-viewer loading skeleton, page controls (prev/next + page input), and a `Reset to 100% to verify` CTA when zoom is not 100%.
  - Added keyboard-safe close behavior that returns focus to the originating citation trigger, and confirmed lock persistence after page reload.
  - Added sync coverage for US-003 split-view/focus-return and viewer control markers.
  - Browser verification evidence screenshots:
    - .agents/skills/00-utilities/dev-browser/tmp/us003-split-view-open.png
    - .agents/skills/00-utilities/dev-browser/tmp/us003-zoom-reset-cta.png
- **Learnings for future iterations:**
  - Patterns discovered
  - For split-view integrations in this app, prefer inline component rendering over iframe embeds because app CSP forbids framing.
  - Gotchas encountered
  - Local evidence route validation required enabling `FEATURE_CITATIONS_API=1` plus `ALLOW_DEV_OBJECT_STORE_SECRET=1` to exercise DB-backed citation + render flows end-to-end.
  - Useful context
  - Matter `fld_82d7385b-d4fa-4b11-bc07-7a77ed1f0e63` (run `run_us002_browser_seed`) was used for browser verification; one local dev citation (`cit_us003_demo_1`) was seeded for UI exercise.
---
## [2026-02-11 19:00:52 UTC] - US-004: Expose trust metadata rail and footer
Thread: 
Run: 20260211-171747-21967 (iteration 4)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-4.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 00168a4 feat(report-triage): expose trust metadata rail and footer
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (US-004 trust metadata browser script) -> PASS
- Files changed:
  - .ralph/activity.log
  - apps/web/app/(api)/citations/[id]/route.ts
  - apps/web/app/(app)/evidence/[id]/page.tsx
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/app/(app)/matters/viewer/page.tsx
  - apps/web/lib/citations.routes.test.ts
  - apps/web/lib/fixtureSeed.server.ts
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - apps/web/test/reportRowDrawer.sync.test.ts
  - .ralph/progress.md
- What was implemented
  - Extended `/citations/:id` payloads to include nullable `doc_version`, `verified_at`, and `loaded_state`, sourced from seeded citation payload fields or linked `report_rows.provenance_json` in DB mode.
  - Rendered trust metadata rows in the report drawer metadata rail (`doc_version`, `verified_at`, `loaded_state`) with deterministic fallback copy (`Unavailable from payload`) when nullable fields are missing.
  - Added a trust footer to `CitationViewerClient` showing the same three fields with the same fallback behavior and removed the previous hardcoded trust-style copy (`Verified at 100% zoom`).
  - Threaded trust metadata through both viewer entry points (`/matters/viewer` and `/evidence/[id]`) so viewer surfaces consume source-backed response fields.
  - Updated route and sync tests to lock the new trust metadata contract and guard against regression to hardcoded trust statements.
  - Browser-verified trust rail + footer behavior on matter `fld_82d7385b-d4fa-4b11-bc07-7a77ed1f0e63` (run `run_us002_browser_seed`) and captured evidence screenshot at `.agents/skills/00-utilities/dev-browser/tmp/us004-trust-matter.png`.
- **Learnings for future iterations:**
  - Patterns discovered
  - `report_rows.provenance_json` is the safest thin-backend source for citation trust metadata without widening strict `payload_json` schemas.
  - Gotchas encountered
  - In this headless Sprite environment, `dev-browser` must be started with `./server.sh --headless` or Playwright fails due missing X server.
  - Useful context
  - Existing demo matter `fld_82d7385b-d4fa-4b11-bc07-7a77ed1f0e63` already contains seeded row/citation data suitable for report drawer + evidence viewer parity checks.
---
## [2026-02-11 19:11:49 UTC] - US-005: Improve citation failure recovery and feedback acknowledgement
Thread: 
Run: 20260211-171747-21967 (iteration 5)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-5.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260211-171747-21967-iter-5.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 40dbfd4 feat(viewer): add citation failure recovery UX
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- reportEvidenceViewer.sync.test.ts -> PASS
  - Command: pnpm --filter @orbital-poc/web lint -> PASS
  - Command: pnpm --filter @orbital-poc/web typecheck -> PASS
  - Command: pnpm --filter @orbital-poc/web test -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (viewer smoke: WRONG_PAGE + flag acknowledgement flow) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/prds/0009b_report-triage-and-evidence/prd.json
- What was implemented
  - Added deterministic reason-code fallback handling in the citation viewer (`PDF_LOAD_FAILED` / `PDF_RENDER_FAILED`) so non-code runtime messages do not leak into `citation_failed` reason display.
  - Added actionable recovery checklist UX inside the `citation_failed` panel, including reason-specific steps for `SNIPPET_HASH_MISMATCH`, `DOC_MISMATCH`, and `WRONG_PAGE`.
  - Added a UI-only `Flag citation wrong` flow with confirm + acknowledgement copy (`Thanks, we'll investigate.`), explicitly without backend persistence.
  - Added US-005 sync tests asserting deterministic failure/recovery and acknowledgement-copy presence.
- **Learnings for future iterations:**
  - Patterns discovered
    - Viewer parity checks are currently enforced with source-sync tests that assert critical UX strings/markers; extending these keeps scope tight.
  - Gotchas encountered
    - `react/no-unescaped-entities` requires escaping apostrophes in JSX copy (used `we&apos;ll`).
    - Viewer page requires fixture snapshot availability (`pnpm fixture:seed <pack>`) even when citation APIs are otherwise reachable.
  - Useful context
    - Reliable manual/browser failure scenario: `/matters/viewer?pack=pack_01_clean&citation=cit_us003_demo_1&page=2` yields deterministic `WRONG_PAGE` and exercises the recovery checklist + flag acknowledgement flow.
---
## [2026-02-12 15:22:01 +0000] - US-001: Shell Wayfinding Baseline
Thread: 
Run: 20260212-150540-748 (iteration 1)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-1.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: c351cfd feat(shell-wayfinding): unify shell context labels
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm --filter @orbital-poc/web exec vitest run test/shellWayfinding.sync.test.ts test/shellEnvironment.test.ts` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `DEMO_MODE=1 pnpm --filter @orbital-poc/web dev -p 3101` + dev-browser smoke (`/matters -> /matters/:id -> /matters`) -> PASS
- Files changed:
  - .ralph/activity.log
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0001_entry-readiness-loop/prd.json
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/[id]/layout.tsx
  - apps/web/app/(app)/matters/shellEnvironment.ts
  - apps/web/test/shellWayfinding.sync.test.ts
  - apps/web/test/shellEnvironment.test.ts
- What was implemented
  - Added a shared shell environment resolver to keep label/variant deterministic across list and detail contexts (`demo-dev`, `demo-prod`, and explicit fallbacks).
  - Added a shell context bar on `/matters` with Matters breadcrumb text and environment badge so list/detail/list retains wayfinding parity.
  - Updated detail layout to reuse the shared environment resolver and keep badge semantics aligned with list context.
  - Expanded US-001 sync checks and added unit tests for environment label mapping.
  - Browser-verified active Matters nav, disabled Runs + Alerts placeholder, breadcrumb presence, and deterministic list->detail->list navigation.
- **Learnings for future iterations:**
  - Patterns discovered
  - Shared shell affordances are easiest to keep deterministic when list/detail derive from one environment resolver.
  - Gotchas encountered
  - The dev-browser server must run in headless mode in Sprite (`./server.sh --headless`) because no X server is available.
  - Useful context
  - First `/matters` load in dev can exceed 30s due initial compile; browser scripts should set higher navigation timeouts.
---
## [2026-02-12 15:37:32 +0000] - US-002: Matter Discovery Filtering
Thread: 
Run: 20260212-150540-748 (iteration 2)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-2.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: cd814aa test(matters): add deterministic filter coverage
- Post-commit status: `dirty` (.ralph/progress.md pending progress append commit)
- Verification:
  - Command: `pnpm --filter @orbital-poc/web exec vitest run test/mattersListDeterminism.int.test.ts test/mattersListFilters.test.ts test/mattersList.sync.test.ts` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `pnpm --filter @orbital-poc/web dev -p 3101` + `cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF` (saved-view/query/reset smoke on `/matters`) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0001_entry-readiness-loop/prd.json
  - apps/web/test/mattersList.sync.test.ts
  - apps/web/test/mattersListDeterminism.int.test.ts
  - .ralph/progress.md
- What was implemented
  - Added a DB-backed US-002 determinism integration test (`mattersListDeterminism.int.test.ts`) that seeds matters and verifies sequential filter narrowing (`q` -> saved view -> saved view + query), stable row ordering across refresh, deterministic saved-view subsets, and empty conflict behavior.
  - Expanded matters list sync assertions to cover explicit URL control wiring (`view` saved-view links), and empty-match guidance/reset affordance strings.
  - Browser-verified `/matters` URL control flow: saved-view toggle sets `view`, search preserves query + saved view, and reset returns to the base URL.
- **Learnings for future iterations:**
  - Patterns discovered
  - Seeding a tight, unique fixture set inside an integration test gives deterministic evidence for filter-sequencing behavior without touching production logic.
  - Gotchas encountered
  - Cleanup helpers for seeded rows must avoid `LIKE` with underscores; exact ID deletion prevents accidental over-deletes.
  - Useful context
  - In this repo, `pnpm --filter @orbital-poc/web test -- ...` may still execute the full suite; `pnpm --filter @orbital-poc/web exec vitest run <files...>` is the reliable scoped path.
---
## [2026-02-12 16:01:51 UTC] - US-003: Matter Create Upload and Readiness Guidance
Thread: 
Run: 20260212-150540-748 (iteration 3)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-3.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 2473b1e feat(matters): surface readiness guidance after uploads
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web exec vitest run test/setupDocuments.sync.test.ts lib/folders.routes.test.ts -> PASS
## [2026-02-12 15:22:09 UTC] - US-005: Run Triage Tab Scope Contract
Thread: 
Run: 20260212-150545-1013 (iteration 1)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-1.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 2ff059d fix(report-triage): enforce reviewed/flagged tabs (or `none` + reason)
- Post-commit status: `clean`
- Verification:
  - Command: pnpm --filter @orbital-poc/web test test/reportTriageFilters.test.ts "app/(app)/matters/runScope.test.ts" test/reportTriage.sync.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (browser smoke: empty-name validation, inline create, documents upload cues, readiness state scan) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0001_entry-readiness-loop/prd.json
  - apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx
  - apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx
  - apps/web/lib/folders.routes.test.ts
  - apps/web/test/setupDocuments.sync.test.ts
  - .ralph/progress.md
- What was implemented
  - Updated detail header Quick Start guidance to always show explicit readiness reason text for ready, blocked, and already-complete states.
  - Updated setup documents flow to refresh server-rendered readiness context after upload completion and manual readiness refresh, making transitions explicit in the page header.
  - Added route-level tests for `POST /folders` covering valid creation and empty/whitespace name rejection with no insert.
  - Expanded US-003 sync checks for readiness guidance visibility and refresh wiring.
  - Browser-verified: empty-name validation error, successful inline create from list header, document upload/readiness cues in detail setup, and visible readiness reasons across ready/blocked/already-complete states.
- **Learnings for future iterations:**
  - Patterns discovered
  - For this workspace, UI readiness state is server-derived; explicit `router.refresh()` after client-side setup mutations keeps header controls truthful without manual reload.
  - Gotchas encountered
  - `pnpm --filter @orbital-poc/web test -- ...` can still execute the full suite; `pnpm --filter @orbital-poc/web exec vitest run ...` is the reliable scoped path.
  - Useful context
  - Local upload/browser validation requires `ALLOW_DEV_OBJECT_STORE_SECRET=1` when running `pnpm --filter @orbital-poc/web dev`.
---
## [2026-02-12 16:30:28 UTC] - US-004: Quick Start Readiness Gate
Thread: 
Run: 20260212-150540-748 (iteration 4)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-4.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260212-150540-748-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d931141 fix(quick-start): enforce readiness gate on starts
- Post-commit status: `dirty` (.ralph/progress.md pending progress append commit)
- Verification:
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF` (browser smoke: blocked quick start reason, fixture flip to ready, start run, conflict retry) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0001_entry-readiness-loop/prd.json
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/test/foldersRunsRoute.wdk.int.test.ts
  - .ralph/progress.md
- What was implemented
  - Enforced Quick Start readiness at API boundary: run starts now return `409 CONFLICT` when a quick-start run already exists for the matter, matching detail-page readiness gating.
  - Added explicit conflict messaging/details for blocked folder states (`empty`, `ingesting`, `failed`, fallback state), preventing ambiguous blocked-start responses.
  - Added integration coverage for blocked attempt -> no run created, fixture transition to runnable -> run created without reload hacks, immediate run progress availability, and blocked duplicate starts returning explicit conflicts with no extra runs.
  - Browser-verified UI behavior: blocked quick start reason is visible, fixture transition enables Quick Start, starting creates run context, and subsequent start attempt yields conflict behavior.
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep readiness enforcement mirrored in UI and API to prevent stale-client bypasses of blocked states.
  - Gotchas encountered
  - Matter detail rendering requires `ALLOW_DEV_OBJECT_STORE_SECRET=1` in local dev; otherwise object-store signing throws before quick-start checks can be validated.
  - Useful context
  - `pnpm --filter @orbital-poc/web test -- <file>` still runs full suite in this workspace; use `pnpm --filter @orbital-poc/web exec vitest run <file...>` for scoped runs.
  - Command: npx tsx <<'EOF' [dev-browser triage tab smoke script against http://localhost:3201/matters/matter_us005_demo?tab=report&run_id=run_us005_main] EOF -> PASS
- Files changed:
  - .ralph/activity.log
  - apps/web/lib/reportTriage.server.ts
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/app/(app)/matters/runScope.ts
  - apps/web/app/(app)/matters/runScope.test.ts
  - apps/web/test/reportTriageFilters.test.ts
  - apps/web/test/reportTriage.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0002_review-trust-loop/prd.json
  - .ralph/progress.md
- What was implemented
  - Replaced triage tab contract with `All`, `Needs Review`, `Reviewed`, and `Flagged` in report UI and filter logic.
  - Added legacy URL/status normalization (`citation_failed`, `missing_input`, `failed`) to `flagged` to keep old links deterministic.
  - Kept run scope deterministic via existing `run_id` linking, verified counts/URL parity on tab switches and browser refresh.
  - Added/updated tests for row-tab parsing, filtering/count behavior, and run-scope URL helpers.
- **Learnings for future iterations:**
  - Patterns discovered
  - Canonicalize legacy filter values at parse/build boundaries to avoid fragmented URL contracts.
  - Gotchas encountered
  - `dev-browser` startup can fail in headed mode in Sprite; use `--headless` or attach to an existing server instance.
  - Useful context
  - `flagged` tab currently aggregates `citation_failed` and `missing_input`, matching reviewer-facing run triage semantics.
---
## [2026-02-12 15:41:34 UTC] - US-006: Drawer Decisions and Mutation Feedback
Thread: 
Run: 20260212-150545-1013 (iteration 2)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-2.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 3c7db8f feat(report-triage): add drawer copy feedback
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm --filter @orbital-poc/web test -- reportRowDrawer.sync.test.ts reportRows.routes.test.ts reportTriage.sync.test.ts reportTriageFilters.test.ts` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `ALLOW_DEV_OBJECT_STORE_SECRET=1 pnpm --filter @orbital-poc/web dev -p 3201` + `curl -s -o /tmp/us006_dev_smoke.html -w "%{http_code}" "http://localhost:3201/matters/matter_us005_demo?tab=report"` -> PASS
  - Command: `cd .agents/skills/00-utilities/dev-browser && ./server.sh --headless` + `npx tsx` browser flow for drawer open/copy success+failure/mark-reviewed failure+success/reopen -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/test/reportRowDrawer.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0002_review-trust-loop/prd.json
  - .ralph/progress.md
- What was implemented
  - Added drawer copy actions for extracted answer and structured payload with deterministic clipboard payloads.
  - Added explicit copy success feedback and copy failure error rendering through existing `InlineStatus` + `ErrorBanner` surfaces.
  - Preserved existing mark-reviewed optimistic update flow and validated negative mutation path keeps `needs_review` unchanged.
  - Extended sync coverage to assert copy controls and feedback/error contract are present.
  - Browser-validated story acceptance path on `matter_us005_demo` including reopen persistence after successful review mutation.
- **Learnings for future iterations:**
  - Patterns discovered
  - Report drawer feedback surface can safely handle multiple action types (mutation + clipboard) without additional state containers.
  - Gotchas encountered
  - `dev-browser` must run with `--headless` in this VM (no X server), and local dev smoke for matter routes is cleaner with `ALLOW_DEV_OBJECT_STORE_SECRET=1`.
  - Useful context
  - Browser evidence screenshot saved at `.agents/skills/00-utilities/dev-browser/tmp/us006-drawer-reviewed.png`.
---
