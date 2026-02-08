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
