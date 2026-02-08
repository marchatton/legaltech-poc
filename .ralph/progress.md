# Progress Log
Started: Sat Feb  7 11:26:21 PM UTC 2026

## Codebase Patterns
- (add reusable patterns here)

---
## [2026-02-08 01:10 UTC] - US-002: Upload PDFs and observe ingest status
Thread: 26618
Run: 20260208-002520-10946 (iteration 2)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-002520-10946-iter-2.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-002520-10946-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: f41655b feat(documents): upload PDFs and track ingest
- Post-commit status: clean
- Verification:
  - Command: ORBITAL_BASE_URL=http://localhost:3001 node --experimental-strip-types scripts/us002_smoke.ts -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
- Files changed:
  - .gitignore
  - apps/web/app/(api)/folders/route.ts
  - apps/web/app/(api)/folders/[id]/route.ts
  - apps/web/app/(api)/folders/[id]/documents/route.ts
  - apps/web/app/(api)/documents/[id]/upload/route.ts
  - apps/web/app/(api)/documents/[id]/complete/route.ts
  - apps/web/lib/db.server.ts
  - apps/web/lib/objectStore.server.ts
  - apps/web/lib/ingest/ingestQueue.server.ts
  - apps/web/lib/folderState.server.ts
  - apps/web/lib/ids.ts
  - scripts/us002_smoke.ts
  - .ralph/guardrails.md
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-002520-10946-iter-2.log
  - .ralph/runs/run-20260208-002520-10946-iter-2.md
  - .ralph/progress.md
- What was implemented
  - Added Postgres-backed folder/document persistence (auto-creates tables in dev) and a derived folder state machine.
  - Implemented upload init (`POST /folders/:id/documents`), signed upload target (`PUT /documents/:id/upload`), ingest enqueue (`POST /documents/:id/complete`), and status listing (`GET /folders/:id/documents`).
  - Implemented an in-process ingest worker (pdf.js) that transitions `parse_status`/`ocr_status`, populates `page_count`, `document_pages`, `chunks`, and `extraction_quality`.
  - Added smoke script to upload fixture PDFs and assert progress + negative validation behavior.
- **Learnings for future iterations:**
  - Patterns discovered
    - Putting signatures in headers avoids leaking signed URL tokens in standard dev server request logs.
  - Gotchas encountered
    - pdf.js needs `GlobalWorkerOptions.workerSrc` set in Next server bundles, otherwise fake worker setup fails.
    - postgres.js `sql.array(values, type)` expects a type OID number (not `"text"`), and `TransactionSql` typing drops call signatures (cast for tagged templates).
  - Useful context
    - Use `sql.json(...)` when writing `jsonb` to satisfy TypeScript and ensure correct serialization.
---
## [2026-02-07 23:46 UTC] - US-001: Create and open a Matter
Thread: 
Run: 20260207-233425-3805 (iteration 1)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260207-233425-3805-iter-1.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260207-233425-3805-iter-1.md
- Guardrails reviewed: yes
- No-commit run: true
- Commit: none (no-commit run)
- Post-commit status: M apps/web/app/(app)/matters/page.tsx; M apps/web/app/page.tsx; M docs/04-projects/02-features/0001_trust-substrate/prds/0001a_matter-documents/prd.json; ?? .ralph/; ?? apps/web/app/(api)/folders/; ?? apps/web/app/(app)/matters/[folderId]/; ?? apps/web/lib/apiErrors.ts; ?? apps/web/lib/folders.store.ts
- Verification:
  - Command: pnpm verify -> PASS
  - Command: pnpm typecheck -> PASS
  - Command: pnpm build -> PASS
- Files changed:
  - apps/web/app/(api)/folders/route.ts
  - apps/web/app/(api)/folders/[id]/route.ts
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/[folderId]/page.tsx
  - apps/web/app/page.tsx
  - apps/web/lib/apiErrors.ts
  - apps/web/lib/folders.store.ts
  - .ralph/activity.log
  - .ralph/progress.md
- What was implemented
  - Added in-memory folder store and API handlers for POST/GET /folders and GET /folders/:id with safe error envelopes.
  - Replaced /matters with a create + list UI and added a Matter detail page for opening a Matter.
  - Updated navigation copy for the Matters entry point.
- **Learnings for future iterations:**
  - Patterns discovered
    - Next.js App Route handlers expect `params` as a Promise; typing must align with the app-route module types.
  - Gotchas encountered
    - `next build` type checks route handler signature strictly; mismatched context typing fails builds.
  - Useful context
    - `pnpm verify` already runs lint/test/build; warnings from fixture scripts are non-fatal.
---
## [2026-02-08 09:17 UTC] - US-002: Page navigation and zoom stays responsive on scans
Thread: 
Run: 20260208-082954-32669 (iteration 2)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-2.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-2.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: fe38cea perf(rh1): enforce Range and cancel renders
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
- Files changed:
  - .gitignore
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-002520-10946-iter-2.md
  - .ralph/runs/run-20260208-082954-32669-iter-1.md
  - apps/web/app/(app)/spikes/rh1-pdf-perf/PdfPerfClient.tsx
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001a_matter-documents/prd.json
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001b-f_trust-substrate-slices/prd.json
  - docs/04-projects/02-features/0001_trust-substrate/spike-investigation.md
  - docs/04-projects/02-features/0001_trust-substrate/spike-proofs/RH1_pdfjs_perf_pack_07_TitleCommitment_SCANNED_ROTATED_100_serial.json
  - docs/04-projects/02-features/0001_trust-substrate/spike-proofs/RH1_pdfjs_perf_pack_07_TitleCommitment_SCANNED_ROTATED_100_spam.json
  - docs/04-projects/02-features/0001_trust-substrate/spike-proofs/RH1_zoom_rerender_pack_07_TitleCommitment_SCANNED_ROTATED.json
- What was implemented
  - RH1 harness now verifies Range support (Accept-Ranges + 206) and reports a fail-closed NO-GO when missing.
  - Page jump rendering cancels in-flight work via request supersession and renderTask.cancel.
  - Serial/spam tests export stable results JSON with summaries (p95/max, long tasks, cancellation rate, thresholds).
  - Spam test includes a configurable simulated delay to make cancellation behavior measurable on fast local fixtures.
  - Captured RH1 proof artefacts under spike-proofs/ and recorded results in spike-investigation.md.
  - Ignored dev-browser tmp/profile artefacts to prevent accidental commits.
- **Learnings for future iterations:**
  - pack_07 PDFs are only 3-4 pages; using wrap-around sequences avoids clamping into repeated max-page renders.
  - In fast local/headless runs, cancellation may not naturally occur at 200ms intervals; simulating Range/network latency keeps the spam test meaningful.
  - dev-browser requires `--headless` and Playwright system deps (installed via `playwright install-deps chromium`).
---
## [2026-02-08 09:44 UTC] - US-004: Canonical snippet hashing is stable
Thread: 
Run: 20260208-082954-32669 (iteration 4)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-4.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-4.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 1f9558a test(citations): prevent duplicate snippet hashing
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: node --experimental-strip-types packages/core/src/spikes/rh3_snippet_hash_harness.ts --run run1 --outDir tmp/rh3-test -> PASS
  - Command: node --experimental-strip-types packages/core/src/spikes/rh3_snippet_hash_harness.ts --run run2 --outDir tmp/rh3-test --compareWith run1 -> PASS
- Files changed:
  - .ralph/activity.log
  - packages/core/src/citations/snippet.single-source.test.ts
  - packages/core/src/spikes/rh3_snippet_hash_harness.ts
- What was implemented
  - Added a unit test to enforce a single source of truth for normaliseSnippet()/hashSnippet() in packages/core.
  - Fixed RH3 harness to run under Node + pdfjs-dist v4 (Uint8Array input) and added a compare mode to assert stable hashes across runs.
- **Learnings for future iterations:**
  - Patterns discovered
    - Self-importing via a package export path avoids Node ESM relative specifier issues while keeping TypeScript happy.
  - Gotchas encountered
    - pdfjs-dist v4 rejects Buffer inputs; always pass a plain Uint8Array view for getDocument({ data }).
  - Useful context
    - A lightweight repo scan test can prevent accidental duplicate hashing implementations from creeping in.
---
