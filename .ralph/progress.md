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
## [2026-02-12 16:12:50 UTC] - US-007: Valid Citation Trust Viewer Verification
Thread: 
Run: 20260212-150545-1013 (iteration 3)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-3.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 9ece54e fix(viewer): show explicit trust fallback metadata
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- apps/web/test/reportEvidenceViewer.sync.test.ts apps/web/lib/citations.routes.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> FAIL (transient existing flake in `test/foldersRunsRoute.wdk.int.test.ts`, expected `completed` got `running`)
  - Command: pnpm test -> PASS (re-run succeeded: 49 files, 166 tests)
  - Command: pnpm build -> PASS
  - Command: ALLOW_DEV_OBJECT_STORE_SECRET=1 FEATURE_CITATIONS_API=1 pnpm --filter @orbital-poc/web dev -p 3301 -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && ./server.sh --headless -> PASS
  - Command: cd .agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (US-007 viewer smoke: source-chip open, payload doc/page, overlay polygon render, reset-to-100, missing trust fallback) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/lib/citations.routes.test.ts
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0002_review-trust-loop/prd.json
  - .ralph/progress.md
- What was implemented
  - Updated the citation viewer trust footer to always render explicit `loaded_state`, `doc_version`, and `verified_at` labels with deterministic fallback text (`Unavailable from payload`) instead of implicit success-like `Loaded` copy.
  - Added US-007 sync contract tests validating source-chip viewer loading uses citation payload document/page, overlay path rendering remains wired, trust metadata is rendered from payload, and fallback copy remains explicit.
  - Added citations route coverage verifying missing provenance trust metadata is returned as explicit `null` fields for deterministic fallback behavior.
  - Browser-validated both positive and fallback paths against seeded US-007 data on `/matters/fld_us007_browser?tab=report&run_id=run_us007_browser`, including reset-to-100 behavior.
- **Learnings for future iterations:**
  - Patterns discovered
  - Keep trust footer labels explicit so missing metadata cannot be mistaken for a success state.
  - Gotchas encountered
  - Web test suite includes a pre-existing intermittent WDK integration flake; immediate re-run was stable and all tests passed.
  - Useful context
  - Browser evidence screenshots captured at `.agents/skills/00-utilities/dev-browser/tmp/us007-valid-viewer.png` and `.agents/skills/00-utilities/dev-browser/tmp/us007-fallback-viewer.png`.
---
## [2026-02-12 16:41 UTC] - US-008: Invalid Citation Fail Closed
Thread: 
Run: 20260212-150545-1013 (iteration 4)
Run log: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-4.log
Run summary: /home/sprite/orbital-g/orbital-poc/.ralph/runs/run-20260212-150545-1013-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 14bf246 fix(report-triage): fail closed invalid citations
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> FAIL (flaky `foldersRunsRoute.wdk.int.test.ts` expected `completed`, saw `running`)
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
  - Command: `dev-browser script (matters report triage fail-closed validation)` -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/guardrails.md
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0002_review-trust-loop/prd.json
- What was implemented
  - Added deterministic citation failure gating in report triage so `citation_failed` rows with unresolved-anchor style reason codes disable source chips with explicit recovery guidance.
  - Wired split-view viewer state to pass fail-closed `reason_code` for invalid citations, ensuring the viewer renders `citation_failed` and suppresses overlay polygons.
  - Added US-008 sync tests covering source-chip disablement copy/ARIA and fail-closed viewer wiring (`errorCode` path with no overlays).
  - Ran required browser validation on `/matters/<id>?tab=report&run_id=<id>&row_tab=citation_failed`, confirming unresolved chip disablement and `reason_code: VALIDATION_ERROR` with zero overlay polygons (screenshot: `.agents/skills/00-utilities/dev-browser/tmp/us008-fail-closed-verification.png`).
- **Learnings for future iterations:**
  - Patterns discovered
  - `citation_failed` UI behavior is safest when reason codes are normalized up front and shared between chip-gating and viewer state.
  - Gotchas encountered
  - Local `pnpm test` can intermittently fail on WDK run completion timing (`running` vs `completed`); rerun until one clean pass and record flake in guardrails/errors.
  - Useful context
  - For browser verification of invalid citation overlays, fixture document IDs (`fx_pack_*__*`) avoid object-store dependency drift during render URL generation.
---
## [2026-02-12 15:15:19 UTC] - US-009: Safe Run Scoped Exports
Thread: 
Run: 20260212-150551-1275 (iteration 1)
Run log: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-1.log
Run summary: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: ef9a27f test(exports): cover run-scoped safe export checks
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- lib/exportCsv.routes.test.ts lib/exportDocx.routes.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3201 -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/progress.md
  - apps/web/lib/exportCsv.routes.test.ts
  - apps/web/lib/exportDocx.routes.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0003_exports-provenance-loop/prd.json
- What was implemented
  - Added US-009 coverage for safe completed-run CSV exports, asserting downloadable artefact output and selected run binding via `source_run_id`.
  - Added US-009 negative coverage for CSV to ensure incomplete runs return conflict and do not return artefacts.
  - Tightened DOCX success assertions so run-bound provenance and download-link shape are validated for selected run context.
- **Learnings for future iterations:**
  - Patterns discovered
  - Export acceptance is most stable at route-contract level by asserting both response artefact fields and fail-closed status paths.
  - Gotchas encountered
  - Vitest invocation with file args still executes the full configured suite in this repo, so command scope expectations should account for that.
  - Useful context
  - Existing `folders/:id/runs` selector tests already enforce completed-run option contracts, so US-009 focused changes were best isolated to export route assertions.
---
## [2026-02-12 15:32 UTC] - US-010: Export Blocking State Contract
Thread: 
Run: 20260212-150551-1275 (iteration 2)
Run log: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-2.log
Run summary: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 7cb4383 fix(exports): gate controls by selected run state
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- "app/(app)/matters/runScope.test.ts" "lib/exportCsv.routes.test.ts" "lib/exportDocx.routes.test.ts" "test/exportBlockingState.sync.test.ts" -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3101 -> PASS
  - Command: npx tsx (dev-browser smoke script for exports tab state toggle) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/ExportCsvButton.tsx
  - apps/web/app/(app)/matters/[id]/ExportMemoButton.tsx
  - apps/web/app/(app)/matters/[id]/ExportsPanel.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(app)/matters/runScope.ts
  - apps/web/app/(app)/matters/runScope.test.ts
  - apps/web/lib/exportCsv.routes.test.ts
  - apps/web/lib/exportDocx.routes.test.ts
  - apps/web/test/exportBlockingState.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0003_exports-provenance-loop/prd.json
  - .ralph/progress.md
- What was implemented
  - Expanded exports run options to include non-completed quick-start runs, preserving deterministic selected `run_id` across route refresh and selector changes.
  - Centralized export eligibility into `runScope` helpers and applied shared disabled-state logic to both memo and CSV export controls.
  - Updated exports panel UX to show selected run status and explicit disabled messaging for non-completed runs.
  - Added route-level regression coverage confirming CSV/DOCX exports return `409 CONFLICT` with no artefact for `running`, `failed`, and `partial` runs.
  - Added sync coverage to prevent regressions back to completed-only selector filtering and to keep CSV run-state gating wired.
  - Browser smoke verified: latest running run keeps all export controls disabled; switching to completed run enables all export controls.
- **Learnings for future iterations:**
  - Patterns discovered
  - Shared run-state eligibility helpers reduce drift between memo and CSV export controls.
  - Gotchas encountered
  - Vitest in this package runs the full suite even when file targets are passed; treat targeted invocations as full verification cost.
  - Useful context
  - `dev-browser` must be launched with `--headless` in this Sprite environment because no X server is present.
---
## [2026-02-12 15:50:09 UTC] - US-011: Artefact Provenance Retrieval and Download Safety
Thread: 
Run: 20260212-150551-1275 (iteration 3)
Run log: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-3.log
Run summary: /home/sprite/orbital-f/orbital-poc/.ralph/runs/run-20260212-150551-1275-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d2afe25 fix(artefacts): surface explicit download failures
- Post-commit status: clean
- Verification:
  - Command: pnpm --filter @orbital-poc/web test -- "app/(app)/matters/ArtefactDownloadButton.test.ts" "app/(app)/matters/artefactsFilters.test.ts" "lib/artefacts.routes.test.ts" "test/artefactDownloadFeedback.sync.test.ts" "test/artefactsList.sync.test.ts" -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: FEATURE_ARTEFACTS_LIST=1 ALLOW_DEV_OBJECT_STORE_SECRET=1 pnpm --filter @orbital-poc/web dev -p 3201 -> PASS
  - Command: cd /home/sprite/orbital-f/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (artefacts filters + expired link UI smoke) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/ArtefactDownloadButton.tsx
  - apps/web/app/(app)/matters/ArtefactDownloadButton.test.ts
  - apps/web/lib/artefacts.routes.test.ts
  - apps/web/test/artefactDownloadFeedback.sync.test.ts
  - docs/05-reviews-audits/e2e-testing/v4-parallel-sets/prds/0003_exports-provenance-loop/prd.json
- What was implemented
  - Updated artefact row download controls to fetch signed URLs before triggering file save, so server-side failures now surface as explicit inline error states instead of silent/noisy browser failures.
  - Added deterministic expired-link error mapping (`UNAUTHORISED` + expired message -> stale-link guidance) and preserved loading/success feedback semantics.
  - Added helper tests for stale freshness parsing and download-failure message mapping.
  - Added route regression coverage confirming expired signed download URLs return explicit `UNAUTHORISED`/`Download URL expired.` responses and short-circuit before schema work.
  - Added sync coverage asserting the download button now performs explicit request/error handling.
  - Browser-smoke validated provenance/filter behavior on `/matters/fld_ui_us003?tab=artefacts`: source-run-aware rows render, unsafe filters reduce deterministically, unsafe explanation labels remain visible, and expired-link errors are explicit.
- **Learnings for future iterations:**
  - Patterns discovered
  - For signed download UX, fetching first and downloading from blob gives deterministic row-level error handling while still preserving explicit loading states.
  - Gotchas encountered
  - `dev-browser` can fail from stale CDP processes; kill stale `9222/9223` listeners and restart when `connectOverCDP` times out.
  - Useful context
  - In this environment, local artefacts checks required `FEATURE_ARTEFACTS_LIST=1 ALLOW_DEV_OBJECT_STORE_SECRET=1` and used `-p 3201` because `3101` was already in use.
---
## [2026-02-13 01:15:34 UTC] - US-001: Canonical readiness contract across list/detail/API
Thread: 
Run: 20260213-005806-15124 (iteration 1)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-1.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: b596291 fix(readiness): unify list/detail/run-start contract
- Post-commit status: clean
- Verification:
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3101 -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (list/detail/run-start parity smoke; screenshots in tmp/us001-matters-list.png, tmp/us001-pack02-detail.png, tmp/us001-pack01-detail.png) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/progress.md
  - apps/web/lib/readinessContract.server.ts
  - apps/web/lib/mattersList.server.ts
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/app/(api)/folders/[id]/route.ts
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/test/readinessContractParity.int.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
- What was implemented
  - Added a shared canonical readiness contract (`state`, `reason_code`, `reason`, `missing_documents`) and centralized missing-prerequisite detection for demo packs.
  - Wired canonical readiness into matters list data and UI row status/reason copy so list reflects runnable vs blocked parity.
  - Wired canonical readiness into matter detail page quick-start gating/badge state so blocked readiness surfaces explicit reason text.
  - Extended folder detail API payload to include canonical readiness for parity with list and run-start surfaces.
  - Updated run-start API conflict handling to return canonical readiness message plus `readiness_reason_code` details when blocked.
  - Added integration coverage asserting pack_01 runnable vs pack_02_missing_rea blocked parity across list, detail API, and run-start API (including reason-code/text alignment).
- **Learnings for future iterations:**
  - Patterns discovered
  - A single readiness-contract helper removes copy/logic drift between UI state and API denial envelopes.
  - Gotchas encountered
  - In this Sprite environment, `dev-browser` must run with `./server.sh --headless` (no X server).
  - Useful context
  - `vitest run -- <file>` still executes the full configured suite in this repo; plan verification runtime accordingly.
---
## [2026-02-13 01:27:12 UTC] - US-002: Quick Start readiness gate is deterministic
Thread: 
Run: 20260213-005806-15124 (iteration 2)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-2.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: d2249fd fix(quick-start): gate enablement on readiness
- Post-commit status: clean
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/quickStartReadiness.sync.test.ts test/foldersRunsRoute.wdk.int.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3101 -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (blocked quick-start browser check; screenshot tmp/us002-blocked.png) -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... (post-fix runnable quick-start browser check; screenshot tmp/us002-runnable.png) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/test/foldersRunsRoute.wdk.int.test.ts
  - apps/web/test/quickStartReadiness.sync.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Matter detail quick-start readiness is now derived only from canonical readiness (`resolveCanonicalReadiness`), removing latest-run-state gating from button enablement.
  - Added deterministic sync coverage proving quick-start enablement comes from canonical readiness and that the page no longer emits `already-complete` quick-start state.
  - Strengthened run-start integration coverage for pack_02 missing prerequisites: blocked attempts return actionable `REA.pdf` conflicts with `MISSING_PREREQUISITE_DOCUMENT`, create zero runs, then transition to runnable and start after prerequisites are fixed.
  - Browser validation confirmed blocked-to-runnable transition on the same matter (disabled button + missing-doc reason before fix, enabled button after adding missing prerequisite).
- **Learnings for future iterations:**
  - Patterns discovered
  - Keeping quick-start enablement tied to canonical readiness eliminates UI/API drift while preserving explicit API conflict behavior.
  - Gotchas encountered
  - Initial `dev-browser` navigation can time out during first Next.js dev compilation; use longer `goto` timeout and `domcontentloaded`.
  - Useful context
  - `dev-browser` must be launched with `./server.sh --headless` in this Sprite VM (no X server).
---
## [2026-02-13 01:39:25 UTC] - US-003: Setup and readiness failure UX is explicit
Thread: 
Run: 20260213-005806-15124 (iteration 3)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-3.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-3.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: a6ccf91 fix(setup-documents): add explicit failure retries
- Post-commit status: clean
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/setupDocuments.sync.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> FAIL (flaky `test/foldersRunsRoute.wdk.int.test.ts` saw `running` vs `completed` once)
  - Command: pnpm test (rerun per guardrail) -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3101 + cd /home/sprite/orbital-i/orbital-poc/.agents/skills/00-utilities/dev-browser && npx tsx <<'EOF' ... EOF (injected completion/readiness failure browser smoke with retry actions) -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx
  - apps/web/test/setupDocuments.sync.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Added deterministic setup/readiness failure mapping in `SetupDocumentsPanel` for upload init, upload PUT, upload complete, and readiness recompute failures.
  - Added explicit recovery actions and labels (`Retry upload`, `Retry completion`, `Retry refresh`) and wired retry handlers to the correct operation.
  - Added explicit refresh loading state and bounded polling outcomes so failures are surfaced instead of silently ending in ambiguous state.
  - Preserved correctness for completion-failure path by only applying completion status after successful completion response; failures keep explicit error state with retry.
  - Expanded US-003 sync tests to lock failure-code/recovery wiring and bounded loading behavior.
- **Learnings for future iterations:**
  - Patterns discovered
  - Persisting retry context (`File`, completion payload) enables precise retries instead of dismiss-only errors.
  - Gotchas encountered
  - `pnpm test` can intermittently fail `foldersRunsRoute.wdk.int.test.ts`; rerun per guardrail until one clean pass.
  - Useful context
  - Browser smoke for this flow can be made deterministic by intercepting `/documents/*/complete` and `/folders/*/documents` once to force failure envelopes and then validating retry recovery.
---
## [2026-02-13 01:54 UTC] - US-004: Run lifecycle state machine is deterministic
Thread: 
Run: 20260213-005806-15124 (iteration 4)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-4.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 22ea737 fix(run-lifecycle): enforce deterministic transitions
- Post-commit status: `clean`
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/runLifecycleStateMachine.int.test.ts test/foldersRunsRoute.wdk.int.test.ts -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/ingestDocumentWorkflow.int.test.ts test/ingestDocumentStepIdempotency.int.test.ts test/ingestDocumentTimeout.int.test.ts -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm lint && pnpm typecheck && pnpm test && pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm dev -p 3101 -> PASS
  - Command: curl -I --max-time 10 http://127.0.0.1:3101 -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/app/(api)/runs/[id]/route.ts
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/lib/db/schema/core.server.ts
  - apps/web/lib/quickStartRunProcessor.server.ts
  - apps/web/lib/runLifecycle.server.ts
  - apps/web/steps/ingestDocumentProcess.step.server.ts
  - apps/web/steps/quickStartWriteRowV0.step.server.ts
  - apps/web/steps/wdkSmokeDone.step.server.ts
  - apps/web/test/foldersRunsRoute.wdk.int.test.ts
  - apps/web/test/runLifecycleStateMachine.int.test.ts
  - apps/web/workflows/ingestDocumentWorkflow.server.ts
  - apps/web/workflows/wdkSmokeWorkflow.server.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Added a canonical run lifecycle helper with explicit allowed transitions, terminal-state immutability, and transition-time metadata support.
  - Extended run schema/backfill to use `queued` as the initial state and persist `queued_at`, `started_at`, and `completed_at` timestamps.
  - Updated run creation/workflow paths to transition `queued -> running` deterministically before execution and to fail safely on schedule errors.
  - Updated run processors/steps to use guarded transitions so terminal runs do not regress to non-terminal states under retries or races.
  - Exposed run transition timestamps from `GET /api/runs/:id` and added integration coverage for transition graph and terminal immutability.
- **Learnings for future iterations:**
  - Patterns discovered
  - A dedicated transition helper keeps state-graph enforcement consistent across APIs, workers, and workflow entry points.
  - Gotchas encountered
  - Idempotent workflow retries can encounter queued/running/terminal existing runs; transition handling must treat some non-success outcomes as expected no-ops.
  - Useful context
  - Existing flaky `foldersRunsRoute.wdk.int.test.ts` behavior remained stable in this run after lifecycle changes, but repeated test rerun guidance in guardrails is still relevant.
---
## [2026-02-13 02:08:04 UTC] - US-005: Report rows are sourced from real step outcomes
Thread: 
Run: 20260213-005806-15124 (iteration 5)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-5.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-5.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 87ac7b5 fix(report): materialize rows from run step outputs
- Post-commit status: `clean`
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run test/reportRowsFromStepOutputs.int.test.ts test/wdkStepQueue.int.test.ts -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm lint -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm typecheck -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && timeout 35s pnpm --filter @orbital-poc/web dev -p 3101 -> PASS (server reached ready state before timeout)
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/folders/[id]/report/route.ts
  - apps/web/lib/reportRowsFromStepOutputs.server.ts
  - apps/web/steps/quickStartWriteRowV0.step.server.ts
  - apps/web/test/reportRowsFromStepOutputs.int.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Removed Quick Start seeded snapshot row injection so successful real-data runs no longer emit fixture-seeded report rows.
  - Extended `quickStartWriteRowV0` step output to persist a complete `report_row` payload in `run_steps.output_json`.
  - Added `materializeReportRowsFromStepOutputs` server utility that upserts missing report rows/citations from persisted succeeded step outputs.
  - Wired report API (`GET /api/folders/[id]/report`) to materialize from step outputs before reading rows for the selected run.
  - Added integration tests covering run-step to report-row materialization stability across reloads and seeded-fallback suppression.
- **Learnings for future iterations:**
  - Patterns discovered
  - Step handlers should persist full output contracts so downstream read surfaces can recover deterministically from persisted step logs.
  - Gotchas encountered
  - Route-level materialization must avoid clobbering reviewer edits; `ON CONFLICT DO NOTHING` preserves triage state while backfilling missing rows.
  - Useful context
  - Seed snapshots live under `tmp/fixture-seed`; tests can create per-test pack snapshots to assert fallback behavior without shared-pack coupling.
---
## [2026-02-13 02:28 UTC] - US-006: Run and report failure envelopes are explicit and safe
Thread: 
Run: 20260213-005806-15124 (iteration 6)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-6.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-6.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: e0eeb5f fix(report): add typed run failure envelopes
- Post-commit status: `clean`
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm lint -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm typecheck -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> FAIL (flaky `apps/web/test/foldersRunsRoute.wdk.int.test.ts` read `running` instead of `completed`)
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm --filter @orbital-poc/web test test/foldersRunsRoute.wdk.int.test.ts -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm build -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm --filter @orbital-poc/web dev -p 3101 + dev-browser scripted smoke for failed-active-run fallback and explicit failed run stale-row suppression -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/folders/[id]/report/route.ts
  - apps/web/app/(api)/runs/[id]/route.ts
  - apps/web/app/(app)/matters/[id]/page.tsx
  - apps/web/lib/runFailureEnvelope.ts
  - apps/web/lib/runFailureEnvelope.test.ts
  - apps/web/test/foldersRunsRoute.wdk.int.test.ts
  - apps/web/test/reportRowsFromStepOutputs.int.test.ts
  - apps/web/test/runReportFailureEnvelopes.sync.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Added shared typed failure-envelope derivation in `apps/web/lib/runFailureEnvelope.ts` and used deterministic safe details (`run_id`, `run_state`) for non-completed runs.
  - Extended `GET /runs/:id` to return `run.failure` from persisted `error_json`/`trace_id` so failed runs expose explicit typed recovery envelopes.
  - Extended `GET /folders/:id/report` to return typed `run.failure` plus `active_run.failure`, defaulting rows to the latest completed run when the latest active run is non-completed.
  - Updated the matters report UI to surface explicit recoverable failure banners, show completed-history fallback context, and avoid stale success rows when explicitly viewing a failed run.
  - Added unit/sync/integration coverage for helper behavior, API envelope surfaces, and failed-active-run history fallback semantics.
- **Learnings for future iterations:**
  - Patterns discovered
  - Deriving failure envelopes in one helper keeps API and UI behavior deterministic and avoids duplicated state/error mapping logic.
  - Gotchas encountered
  - Full-suite `pnpm test` intermittently flakes on WDK completion timing; rerun until one clean pass and record repeated failures in `.ralph/errors.log` per guardrail.
  - Useful context
  - For report UX, treat the latest run as active status context while selecting the latest completed run as default report history source when active is non-completed.
---
## [2026-02-13 02:40:38] - US-007: Citation outcomes are explicit success or typed failure
Thread: 
Run: 20260213-005806-15124 (iteration 7)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-7.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-7.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 3d730c3 fix(citations): enforce explicit fail-closed outcomes
- Post-commit status: `clean`
- Verification:
  - Command: `cd /home/sprite/orbital-i/orbital-poc/apps/web && pnpm exec vitest run lib/citations.routes.test.ts lib/documentsRender.routes.test.ts lib/documentsPdf.routes.test.ts test/reportEvidenceViewer.sync.test.ts` -> PASS
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm lint` -> PASS
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm typecheck` -> PASS
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm test` -> FAIL (known flaky `apps/web/test/foldersRunsRoute.wdk.int.test.ts`, attempt 1)
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm test` -> FAIL (known flaky `apps/web/test/foldersRunsRoute.wdk.int.test.ts`, attempt 2)
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm test` -> PASS (attempt 3)
  - Command: `cd /home/sprite/orbital-i/orbital-poc && pnpm build` -> PASS
  - Command: `dev-browser: /matters/viewer?pack=pack_01_clean&citation=cit_TS-01_1` -> PASS (trust metadata visible)
  - Command: `dev-browser: /matters/fld_us007_browser split-view citation open` -> PASS (`citation_failed` + `SNIPPET_HASH_MISMATCH`, fail-closed viewer)
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/citations/[id]/route.ts
  - apps/web/app/(api)/documents/[id]/pdf/route.ts
  - apps/web/app/(api)/documents/[id]/render/route.ts
  - apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx
  - apps/web/lib/citations.routes.test.ts
  - apps/web/lib/documentsPdf.routes.test.ts
  - apps/web/lib/documentsRender.routes.test.ts
  - apps/web/test/reportEvidenceViewer.sync.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
- What was implemented
  - Enforced explicit fail-closed evidence outcomes in split-view by validating snippet hash and render document/page parity before allowing overlay success.
  - Added typed `INTERNAL` failure envelopes for unexpected exceptions in `/citations/:id`, `/documents/:id/render`, and `/documents/:id/pdf`.
  - Added/extended tests to assert success-or-typed-failure contracts and fail-closed viewer behavior.
  - Verified browser behavior for both valid citation trust metadata and invalid citation fail-closed presentation.
- **Learnings for future iterations:**
  - Patterns discovered
  - The `packages/core` single-source snippet hash guard fails if client helpers reuse canonical function names; keep helper names distinct outside core.
  - Gotchas encountered
  - `apps/web/.env.local` defaults `EVIDENCE_BACKEND=db_only`, which blocks fixture fallback and can mask citation viewer checks unless overridden for dev verification.
  - Useful context
  - `foldersRunsRoute.wdk.int.test.ts` remains flaky (`running` vs `completed`); rerun `pnpm test` until one clean pass and log repeated failures in `.ralph/errors.log`.
---
## [2026-02-13 02:54 UTC] - US-008: Export fail-closed behavior is strict and observable
Thread: 019c54e3-98ed-7b32-b8fb-3706edb94263
Run: 20260213-005806-15124 (iteration 8)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-8.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-8.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: b33919a fix(export): fail-close csv precondition checks
- Post-commit status: clean
- Verification:
  - Command: pnpm exec vitest run lib/exportCsv.routes.test.ts test/realDataWorkflows.e2e.int.test.ts -> PASS
  - Command: pnpm lint -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm test -> PASS
  - Command: pnpm build -> PASS
  - Command: pnpm --filter @orbital-poc/web dev -p 3101 + curl -I --max-time 10 http://127.0.0.1:3101 -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/export/csv/route.ts
  - apps/web/lib/exportCsv.routes.test.ts
  - apps/web/test/realDataWorkflows.e2e.int.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Updated `POST /export/csv` to fail closed with `EXPORT_BLOCKED` for run/report/citation safety precondition failures, including incomplete runs, missing report payload rows, ambiguous structured rows, and missing locked citations.
  - Added explicit `reason_codes` in blocked envelopes for observability and deterministic operator triage.
  - Kept `pack_09_bad_citation` blocked export behavior strict and verified blocked responses contain explicit reason metadata with no downloadable artefact.
  - Extended route + real-data E2E tests to assert blocked and incomplete export responses never include signed download links.
- **Learnings for future iterations:**
  - Patterns discovered
  - A shared blocked-response helper keeps fail-closed policy consistent across multiple safety preconditions.
  - Gotchas encountered
  - Real-data quick-start citation failures currently emit `NO_CITATIONS`, so E2E reason-code assertions should anchor to that deterministic code for this flow.
  - Useful context
  - Global test gate passed on first run in this iteration; no flaky `foldersRunsRoute.wdk.int.test.ts` rerun was required.
---
## [2026-02-13 03:06:06 UTC] - US-009: Demo-prod pack_09 allowlist and PR/nightly smoke
Thread: 
Run: 20260213-005806-15124 (iteration 9)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-9.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-9.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 5b2ffb2 feat(demo-pack): wire pack_09 smoke tiers
- Post-commit status: clean
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm smoke:pr -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm smoke:nightly -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm lint -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm typecheck -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> FAIL (first run: one new checklist regression + known flaky `foldersRunsRoute.wdk.int.test.ts` state timing)
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm build -> PASS
  - Command: DEMO_MODE=1 pnpm --filter @orbital-poc/web dev -p 3101 + dev-browser toolbar/load-pack smoke -> PASS
- Files changed:
  - .github/workflows/real-data-smoke.yml
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/progress.md
  - apps/web/app/(api)/demo/load-pack/route.ts
  - apps/web/app/DemoToolbar.tsx
  - apps/web/lib/demoPackAllowlist.ts
  - apps/web/package.json
  - apps/web/test/demoChecklist.sync.test.ts
  - apps/web/test/demoLoadPack.validation.test.ts
  - apps/web/test/demoPackAllowlist.sync.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - package.json
- What was implemented
  - Centralized the demo pack allowlist in `apps/web/lib/demoPackAllowlist.ts` and reused it in both the load-pack API schema and toolbar dropdown so pack coverage cannot drift.
  - Added allowlist regression coverage to prove packs 01/02/09 are accepted at the API boundary and arbitrary pack IDs remain validation-rejected.
  - Added explicit PR/nightly smoke tier scripts (`smoke:pr`, `smoke:nightly`) and a CI workflow (`.github/workflows/real-data-smoke.yml`) that includes the pack 09 operator load->run->blocked-export path check.
  - Updated checklist sync guard to parse the shared allowlist source after the toolbar refactor.
- **Learnings for future iterations:**
  - Patterns discovered
  - Shared allowlist constants are a low-cost way to lock API/UI parity while still allowing strict schema validation in route handlers.
  - Gotchas encountered
  - Source-structure-dependent sync tests (like regex over `PACK_OPTIONS`) can break on harmless refactors; anchoring to shared contract files is more robust.
  - Useful context
  - `smoke:nightly` now combines `fixture:eval:all` with the pack 09 operator path test, covering both data-pack gates and demo operator contract in one tier entrypoint.
---
## [2026-02-13 03:17 UTC] - US-010: Overnight loop recovery and checkpoint resume
Thread: 
Run: 20260213-005806-15124 (iteration 10)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-10.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-10.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 8bce614 feat(overnight-loop): add checkpoint resume halt logic
- Post-commit status: `clean`
- Verification:
  - Command: `pnpm --filter @orbital-poc/web test -- test/overnightLoopCheckpoint.test.ts` -> PASS
  - Command: `pnpm lint` -> PASS
  - Command: `pnpm typecheck` -> PASS
  - Command: `pnpm test` -> PASS
  - Command: `pnpm build` -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - apps/web/lib/overnightLoopCheckpoint.server.ts
  - apps/web/test/overnightLoopCheckpoint.test.ts
- What was implemented
  - Added `runOvernightStoryLoop` orchestration with structured checkpoint persistence after each completed story, including run context tags (`story_id`, `stage`).
  - Added structured failure checkpoint persistence (`status=failed`, failure metadata, `haltBeforeStoryId`, `resumeStoryId`) so contract-breaking failures stop downstream execution deterministically.
  - Added resume controls that block auto-continue after upstream failure unless `resumeFromCheckpoint` is explicitly set.
  - Added US-010 tests covering per-story checkpoint writes, report-stage failure halting before export, negative no-auto-continue behavior, and explicit checkpoint resume.
  - Security/performance/regression audit: no secret exposure paths introduced, checkpoint logic is O(n) over story count with bounded file writes, and changes are isolated to new module/tests with full gate coverage.
- **Learnings for future iterations:**
  - Patterns discovered
  - A small typed checkpoint contract (`completed` vs `failed`) plus explicit `resumeStoryId` keeps recovery behavior deterministic and testable.
  - Gotchas encountered
  - Filtering Vitest with `-- test/file` still ran the full suite in this workspace, so plan for full-suite runtime even for focused checks.
  - Useful context
  - `blocked_by_existing_failure` is an effective guardrail state to prevent accidental downstream execution until an explicit resume decision is made.
---
## [2026-02-13 03:25 UTC] - US-011: Run-start idempotency and concurrency guardrails
Thread: 
Run: 20260213-005806-15124 (iteration 11)
Run log: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-11.log
Run summary: /home/sprite/orbital-i/orbital-poc/.ralph/runs/run-20260213-005806-15124-iter-11.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: f61784c fix(runs-api): serialize run-start for dedupe
- Post-commit status: `clean`
- Verification:
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm --filter @orbital-poc/web test -- test/foldersRunsRoute.wdk.int.test.ts -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm lint -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm typecheck -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm test -> PASS
  - Command: cd /home/sprite/orbital-i/orbital-poc && pnpm build -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - apps/web/app/(api)/folders/[id]/runs/route.ts
  - apps/web/test/foldersRunsRoute.wdk.int.test.ts
  - docs/05-reviews-audits/real-data-e2e-suite/prd.json
  - .ralph/progress.md
- What was implemented
  - Wrapped run-start critical path in a Postgres advisory lock transaction scoped to matter context (`folderId + runType`) so concurrent starts serialize before duplicate checks and insert.
  - Kept idempotency-key replay behavior deterministic by returning the canonical existing run for duplicate keys, including insert-race handling.
  - Preserved explicit duplicate conflict behavior with run metadata (`run_id`, `run_state`) for non-idempotent concurrent retries.
  - Added integration coverage proving parallel Quick Start triggers produce one canonical run and one informative duplicate response, with no extra active runs created.
  - Security/performance/regression audit: lock scope is narrow and parameterized (no injection surface), serialization is bounded to run-start operations, and full lint/typecheck/test/build gates passed.
- **Learnings for future iterations:**
  - Patterns discovered
  - A DB advisory lock around check+insert is a low-friction way to harden API-level idempotency without schema migrations.
  - Gotchas encountered
  - In this workspace, `pnpm --filter @orbital-poc/web test -- <file>` still executes the full suite, so plan runtime accordingly.
  - Useful context
  - Returning conflict details with canonical `run_id` makes duplicate responses actionable for operator UX and client retries.
---
