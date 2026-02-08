# Progress Log
Started: Sat Feb  7 11:26:21 PM UTC 2026

## Codebase Patterns
- (add reusable patterns here)

---
## [2026-02-08 14:55 UTC] - US-001: Fetch a signed render URL for a document
Thread: 
Run: 20260208-143708-105964 (iteration 1)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-143708-105964-iter-1.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-143708-105964-iter-1.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 6fceef8 feat(api): add signed render URL contract
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: ORBITAL_BASE_URL=http://localhost:3001 node --experimental-strip-types scripts/us001_render_smoke.ts -> PASS
- Files changed:
  - .ralph/activity.log
  - apps/web/app/(api)/documents/[id]/pdf/route.ts
  - apps/web/app/(api)/documents/[id]/render/route.ts
  - apps/web/lib/objectStore.server.ts
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001g_render-url-contract-alignment/prd.json
  - scripts/us001_render_smoke.ts
- What was implemented
  - Implemented `GET /documents/:id/render?page=N` returning `{ document_id, page, render_url }` and issuing short-lived render signature headers.
  - Added a signed PDF bytes endpoint `GET /documents/:id/pdf` that supports single-range requests (`Accept-Ranges: bytes`, `206`, `Content-Range`).
  - Added a smoke script that uploads a fixture PDF, fetches `render_url`, and runs a Range precheck against the returned target.
- **Learnings for future iterations:**
  - Patterns discovered
    - Returning the signature via response headers keeps secrets out of URLs while keeping the JSON contract stable.
  - Gotchas encountered
    - Range regex literals must escape `/` as `\\/` (not `\\\\/`), or Node will fail parsing the script.
  - Useful context
    - The pdf bytes endpoint streams from the object store with `fs.createReadStream(start,end)` to avoid reading full PDFs per Range request.
---
## [2026-02-08 12:01 UTC] - US-009: needs_review -> reviewed is explicit and persisted
Thread: 
Run: 20260208-082954-32669 (iteration 10)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-10.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-10.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 8fc7836 feat(matters): persist reviewed status
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: dev-browser (headless) mark reviewed flow -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/progress.md
  - apps/web/app/(app)/matters/actions.ts
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/lib/fixtureSeed.server.ts
- What was implemented
  - Added a server action + UI button to explicitly mark `needs_review` rows as `reviewed`.
  - Enforced status invariants: review is rejected when a row has zero locked citations, and the UI shows a safe reason.
  - Persisted the status by writing back to the seeded snapshot so it survives refresh (dev-only tracer bullet).
- **Learnings for future iterations:**
  - Patterns discovered
    - For dev-only flows, a server action + redirect with a narrow `review_error` code is a simple way to show safe feedback.
  - Gotchas encountered
    - `dev-browser` must run headless in this environment (no X server).
  - Useful context
    - Browser screenshots saved under `.agents/skills/00-utilities/dev-browser/tmp/US-009_*.png`.
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
## [2026-02-08 10:02 UTC] - US-003: Fetch a locked citation by ID
Thread: 
Run: 20260208-082954-32669 (iteration 5)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-5.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-5.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: cdd534d feat(citations): add GET /citations/:id route
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: curl -sS "http://localhost:3001/citations/cit_TS-04_1?pack=pack_01_clean" -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-082954-32669-iter-4.md
  - apps/web/app/(api)/citations/[id]/route.ts
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001b-f_trust-substrate-slices/prd.json
- What was implemented
  - Added GET /citations/:id returning the locked citation payload shape from docs/03-architecture/50_api_surface.md.
  - Implemented Zod validation for citation IDs and safe error envelopes for invalid/unknown IDs.
  - Backed the endpoint with fixture seed snapshots (tmp/fixture-seed/*) and fail-closed on ambiguous IDs across packs.
- **Learnings for future iterations:**
  - Seeded citation IDs are not UUID-based (e.g. cit_TS-04_1); validate by prefix + safe charset, not UUID shape.
  - When multiple packs are seeded, citation IDs can collide; failing closed (409 CONFLICT) avoids returning the wrong evidence.
---
## [2026-02-08 10:27 UTC] - US-005: Click citation chip -> open viewer at cited evidence
Thread: 
Run: 20260208-082954-32669 (iteration 6)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-6.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-6.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 1484dc5 feat(matters): link citation chips to viewer page
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
- Files changed:
  - apps/web/app/(app)/matters/page.tsx
  - apps/web/app/(app)/matters/viewer/page.tsx
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001b-f_trust-substrate-slices/prd.json
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-082954-32669-iter-5.md
  - .ralph/progress.md
- What was implemented
  - Citation chips now deep-link to the viewer with `document_id` + `page` derived from the row's `citation_ids` (no free-text citations).
  - Viewer validates `document_id`/`page` match the locked citation and uses them to open the cited PDF page (1-indexed).
  - Browser verified on `pack_01_clean` across two documents: `TitleCommitment.pdf` and `ALTA_Survey.pdf`.
- **Learnings for future iterations:**
  - Patterns discovered
    - Passing `document_id` + `page` through the URL makes citation navigation verifiable and shareable.
  - Gotchas encountered
    - `dev-browser` must run headless in this environment (no X server).
  - Useful context
    - Constrain document identifiers in query params to a safe charset even in dev-only routes.
---
## [2026-02-08 10:45 UTC] - US-006: Evidence highlights align across zoom + rotation
Thread: 
Run: 20260208-082954-32669 (iteration 7)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-7.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-7.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: 8733fe5 fix(viewer): lock highlight overlay to 100% zoom
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: dev-browser (headless) screenshots -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-082954-32669-iter-6.md
  - apps/web/app/(app)/matters/viewer/CitationViewerClient.tsx
  - apps/web/app/(app)/matters/viewer/page.tsx
  - apps/web/app/(app)/spikes/rh2-overlay/Rh2OverlayClient.tsx
- What was implemented
  - Cut highlight overlay verification to 100% zoom: viewer snaps to 100% and disables zoom while a valid highlight is active.
  - RH2 overlay harness locks zoom to 100% and fails closed (no overlay) for wrong-page and invalid polygon injections.
  - Viewer returns explicit safe failure reason codes for mismatch cases: `WRONG_PAGE`, `DOC_MISMATCH`, `SNIPPET_HASH_MISMATCH`.
  - Browser verified alignment at 100%:
    - pack_01_clean: TitleCommitment (COMMITMENT_HEADER) + ALTA_Survey (SURVEY_HEADER)
    - pack_07_scans_rotated_low_quality: TitleCommitment rotated/scanned page
    - Fail-closed: WRONG_PAGE + OUT_OF_RANGE polygon (no overlay) confirmed
    - Screenshots saved under `.agents/skills/00-utilities/dev-browser/tmp/US-006_*.png`
- **Learnings for future iterations:**
  - Patterns discovered
    - Treat zoom as an invariant of the highlight overlay (lock/snap) to reduce coordinate drift risk.
  - Gotchas encountered
    - dev-browser must run with `--headless` here (no X server).
  - Useful context
    - Mapping remains stable across intrinsic `page.rotate` when using `viewport.convertToViewportPoint()` and sizing overlays in viewport CSS px.
---
## [2026-02-08 12:33 UTC] - US-007: Missing docs yields missing_input with checklist
Thread: 
Run: 20260208-082954-32669 (iteration 11)
Run log: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-11.log
Run summary: /home/sprite/orbital-poc/.ralph/runs/run-20260208-082954-32669-iter-11.md
- Guardrails reviewed: yes
- No-commit run: false
- Commit: a70df77 feat(missing-docs): add missing_input checklist
- Post-commit status: clean
- Verification:
  - Command: pnpm typecheck -> PASS
  - Command: pnpm verify -> PASS
  - Command: dev-browser (headless) /matters pack_02 + pack_01 -> PASS
- Files changed:
  - .ralph/activity.log
  - .ralph/errors.log
  - .ralph/runs/run-20260208-082954-32669-iter-10.md
  - apps/web/app/(app)/matters/page.tsx
  - docs/04-projects/02-features/0001_trust-substrate/prds/0001b-f_trust-substrate-slices/prd.json
  - packages/core/src/missing-docs/detectMissingDocs.fixtures.test.ts
  - packages/core/src/missing-docs/detectMissingDocs.ts
  - scripts/fixtures/assert_row_invariants.ts
  - scripts/fixtures/seed.ts
- What was implemented
  - Fixed missing-doc detection to correctly match file refs/acronyms/phrases.
  - Seeded a canonical `missing_input` row when high-confidence missing docs are detected (answer is exactly `Not found in provided documents.`, zero citations), with a structured checklist in provenance.
  - Rendered the missing-doc checklist panel for `missing_input` rows in the Matters report UI (high-confidence by default; low-confidence hidden).
  - Added a fixture-pack test asserting REA.pdf is flagged in `pack_02_missing_rea` and no missing-doc flags occur in `pack_01_clean` (FP=0).
- **Learnings for future iterations:**
  - Patterns discovered
    - Keeping the missing-doc checklist shape aligned to the core schema (label/confidence/signals) makes it easy to render and validate end-to-end.
  - Gotchas encountered
    - dev-browser must run headless in this environment (no X server).
    - Regex literals should not be double-escaped; tests on fixture packs catch silent FN/FP drift quickly.
  - Useful context
    - Browser screenshots saved under `.agents/skills/00-utilities/dev-browser/tmp/us007-pack02-matters.png` and `.agents/skills/00-utilities/dev-browser/tmp/us007-pack01-matters.png`.
---
