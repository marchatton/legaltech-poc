# Handoff: Browser Validation Parity Closeout (Partial)

## Scope
- Continued from `handoff_2026-02-11_23-54-41_browser-validation-parity-ui.md`.
- Ran browser validation on `http://localhost:3101` with `agent-browser` against `/matters` and detail tabs.
- Captured screenshot evidence for list + all required tab routes + deep-link URL.

## Evidence
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/01-matters-list.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/02-detail-report.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/03-detail-documents.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/04-detail-chat.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/05-detail-artefacts.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/06-detail-exports.png`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/tmp-evidence/browser-validation-2026-02-12/07-deeplink-row-tab-citation-failed.png`

## Matter used for tab checks
- `matter-id`: `fld_93298149-5b1d-4da5-85e4-d3f892c49993`
- `run-id`: `run_42a7616e-cce4-470e-82dc-fad771376e32`

## What passed
- `/matters` list route renders and supports open navigation.
- Detail routes render (no 404) for:
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?tab=report&run_id=run_42a7616e-cce4-470e-82dc-fad771376e32`
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?tab=documents`
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?tab=chat`
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?tab=artefacts`
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?tab=exports`
- Deep-link URL for report triage renders and preserves query params:
  - `/matters/fld_93298149-5b1d-4da5-85e4-d3f892c49993?run_id=run_42a7616e-cce4-470e-82dc-fad771376e32&row_tab=citation_failed&tab=report`

## Deviations / blockers
- Could not validate the exact click path `export blocked -> report (row_tab=citation_failed)` because current seed data shows `Exports 0` and no blocked export rows.
- Quick Start run remains at `0/9` (no report rows generated), so there is no export row to click through.
- The run is created/scheduled but does not advance in this local run (`run_42a7616e-cce4-470e-82dc-fad771376e32`), leaving triage/export counts at zero.
- Worker bootstrap failed in this environment:
  - `pnpm -C apps/web worker` fails with `ERR_MODULE_NOT_FOUND` for `../lib/wdk/wdkWorker.server` import resolution under Node ESM.
  - `pnpm -C apps/web dlx tsx scripts/worker.ts` cannot be used here due blocked external network (`ENOTFOUND registry.npmjs.org`).

## Recommended next step
1. Unblock local run progression (worker/runtime path) so Quick Start can complete and produce report/export rows.
2. Re-run export tab validation and confirm explicit click-through from blocked export row lands on report with `row_tab=citation_failed`.
