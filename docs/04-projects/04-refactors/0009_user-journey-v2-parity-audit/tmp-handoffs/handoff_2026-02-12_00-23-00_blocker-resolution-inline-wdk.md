# Handoff: Blocker Resolution (Inline WDK + Export Deep-Link)

## Problem resolved
- Browser-validation blocker was caused by Quick Start runs staying at `0/9`, so no export-blocked row existed to click through.
- Root cause in dev: inline worker kicks were not run-scoped and Quick Start route did not trigger its own inline drain.

## Code changes
- `apps/web/lib/wdk/wdkInlineKick.server.ts`
  - Added a queued inline kick scheduler with per-request `runId`.
  - Each queued drain now passes `runId` through to `drainWdkStepsOnce`, preventing cross-run step claiming.
- `apps/web/lib/ingest/ingestQueue.server.ts`
  - Ingest inline kick is now scoped to the ingest run: `kickInlineWdkWorker({ ..., runId })`.
- `apps/web/app/(api)/folders/[id]/runs/route.ts`
  - After scheduling Quick Start steps, route now kicks inline Quick Start handlers in dev:
    `kickInlineWdkWorker({ handlers: quickStartStepHandlers, runId, maxSteps: ... })`.

## Runtime verification done
- Started dev server and created a fresh Quick Start run:
  - `run_21f316ee-e67f-463b-a1b3-0c63e61172b2`
  - `folder_id = fld_4837fe0b-c641-4197-a0b5-5ed142481545`
- Server logs showed:
  - all 9 `quick_start_title_survey.write_row_v0` steps claimed and completed
  - rows written as `citation_failed`
  - `run.completed` emitted
- UI parity state after completion:
  - `Report 9`
  - `Citation Failed 9`
  - `Exports 1`
- Export blocked flow verified:
  1. Open Exports tab for completed run
  2. Click `Export memo (Word)` -> returns blocked state (`POST /export/docx` 409)
  3. Click `Review failed rows`
  4. Lands on report URL with `row_tab=citation_failed`

## Evidence
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12-fix/exports-blocked-review-link.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12-fix/report-citation-failed-deeplink.png`

## Verification commands
- PASS:
  - `pnpm -C apps/web typecheck`
  - `pnpm -C apps/web lint`
- Partial/blocked in sandbox:
  - `pnpm -C apps/web test test/foldersRunsRoute.wdk.int.test.ts test/ingestCutoverFlag.test.ts`
  - `foldersRunsRoute.wdk.int.test.ts` cannot connect to local Postgres in sandbox (`EPERM 127.0.0.1:5432`).
