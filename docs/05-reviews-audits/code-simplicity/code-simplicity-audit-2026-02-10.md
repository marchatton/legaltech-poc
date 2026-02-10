# Investigation: Code Simplicity Audit (2026-02-10)

## Summary
Proactive repo-wide simplicity audit (YAGNI, over-abstraction, duplication). Findings and recommendations are evidence-backed with file:line anchors where available.

## Symptoms
- None (proactive audit)

## Investigation Log

### 2026-02-10 - Phase 0/2: Workspace Verification + Context Build
**Hypothesis:** There are a few hot files with copy/paste transactional logic, repeated API response plumbing, and redundant runtime gating flags.
**Findings:** Context builder selected the primary hotspots: Quick Start run processor, PDF + runs API routes, runtime gating helpers, job queue updates, CSV export mapping, and fixture script geometry helpers.
**Evidence:** See `apps/web/lib/quickStartRunProcessor.server.ts`, `apps/web/app/(api)/documents/[id]/pdf/route.ts`, `apps/web/app/(api)/folders/[id]/runs/route.ts`, `apps/web/lib/runtimeMode.ts`, `apps/web/lib/devOnly.ts`, `apps/web/lib/devOnlyApi.server.ts`, `apps/web/lib/exportCsv.server.ts`, `apps/web/lib/jobs/jobQueue.server.ts`, `scripts/fixtures/lib/geometry.ts`.
**Conclusion:** Confirmed: there are multiple low-risk opportunities to delete duplication without behavior change.

### 2026-02-10 - Phase 3: Quick Start Run Processor Row Writes
**Hypothesis:** The row-write logic is duplicated (normal path vs fallback path), and the two paths can drift or apply slightly different idempotency semantics.
**Findings:** Two separate `sql.begin(...)` blocks implement the same sequence (step insert + row insert + progress/failure update), but with slight differences:
- Normal path gates side effects on `run_steps` insert returning a row (idempotency) and also gates on `report_rows` insert success.
- Fallback path does *not* gate on the `run_steps` insert returning a row; it gates only on `report_rows` insert success.
**Evidence:**
- Normal transaction: `sql.begin` at `apps/web/lib/quickStartRunProcessor.server.ts:248` with `INSERT INTO run_steps` at `apps/web/lib/quickStartRunProcessor.server.ts:253` and `INSERT INTO report_rows` at `apps/web/lib/quickStartRunProcessor.server.ts:290`, then `UPDATE runs` at `apps/web/lib/quickStartRunProcessor.server.ts:330`.
- Fallback transaction: `sql.begin` at `apps/web/lib/quickStartRunProcessor.server.ts:380` with `INSERT INTO run_steps` at `apps/web/lib/quickStartRunProcessor.server.ts:384` and `INSERT INTO report_rows` at `apps/web/lib/quickStartRunProcessor.server.ts:419`, then `UPDATE runs` at `apps/web/lib/quickStartRunProcessor.server.ts:458`.
**Conclusion:** Confirmed duplication. Recommended: introduce a single local helper that performs (step idempotency + report row insert + run progress update), and call it from both normal and fallback paths to delete ~1 full copy/paste block.

### 2026-02-10 - Phase 3: PDF Route Range Handling Duplication
**Hypothesis:** The PDF serving route duplicates Range handling in fixture and object-store branches.
**Findings:** Both branches repeat:
- `parseSingleRangeHeader(...)` usage
- Setting `Accept-Ranges`, `Content-Disposition`, `Content-Length`, `Content-Range`
- Same 200 vs 206 vs 416 response construction
**Evidence:**
- Fixture branch range parse at `apps/web/app/(api)/documents/[id]/pdf/route.ts:123` and headers at `apps/web/app/(api)/documents/[id]/pdf/route.ts:125` through `apps/web/app/(api)/documents/[id]/pdf/route.ts:142`.
- Object-store branch range parse at `apps/web/app/(api)/documents/[id]/pdf/route.ts:199` and headers at `apps/web/app/(api)/documents/[id]/pdf/route.ts:201` through `apps/web/app/(api)/documents/[id]/pdf/route.ts:218`.
**Conclusion:** Confirmed duplication. Recommended: a single helper (local to file first) that takes `size`, `rangeHeader`, and a `createStream(...)` callback and emits `Response`.

### 2026-02-10 - Phase 3: Runtime Gating Surface Area
**Hypothesis:** Runtime gating logic is scattered across small helpers and direct env checks.
**Findings:** Some duplication is intentional (dev-only vs dev-or-demo-prod vs demo tooling), but there are multiple places doing direct env checks instead of using the helpers, increasing drift risk.
**Evidence:**
- Canonical runtime posture: `apps/web/lib/runtimeMode.ts:12` (`orbitalMode`) and `apps/web/lib/runtimeMode.ts:29` (`isDevOrDemoProd`).
- Dev gating: `apps/web/lib/devOnly.ts:5` and `apps/web/lib/devOnly.ts:9`; API equivalent: `apps/web/lib/devOnlyApi.server.ts:7` and `apps/web/lib/devOnlyApi.server.ts:15`.
- Demo tooling flag (dev-only): `apps/web/lib/demoMode.server.ts:5` (`isDemoModeEnabled`) and `apps/web/lib/demoMode.server.ts:11` (`assertDemoModeEnabledApi`).
- Direct `DEMO_MODE` checks exist in routes/pages (example): `apps/web/app/(api)/export/csv/route.ts:68`, `apps/web/app/(api)/export/docx/route.ts:68`, `apps/web/app/(app)/matters/[id]/page.tsx:131`.
- Spike gate: `apps/web/lib/spikes.server.ts:3` (`assertSpikesEnabled`).
**Conclusion:** Simplify by routing direct `DEMO_MODE` checks through `isDemoModeEnabled()` / `assertDemoModeEnabledApi(...)` to centralize semantics and delete repetition. Keep `spikes.server.ts` as the single spikes gate.

### 2026-02-10 - Phase 4: API Error Envelope Repetition
**Hypothesis:** Many API routes hand-roll the same `safeErrorEnvelope + Response.json` patterns.
**Findings:** Repetition is widespread across `apps/web/app/(api)/*` and appears in both validation and auth paths.
**Evidence:** Example instances:
- `apps/web/app/(api)/documents/[id]/pdf/route.ts:35` and many other early returns (e.g., `apps/web/app/(api)/documents/[id]/pdf/route.ts:57`).
- `apps/web/app/(api)/folders/[id]/runs/route.ts:86`, `apps/web/app/(api)/folders/[id]/runs/route.ts:99`, `apps/web/app/(api)/folders/[id]/runs/route.ts:147`, `apps/web/app/(api)/folders/[id]/runs/route.ts:233`.
**Conclusion:** Recommend introducing a tiny `jsonError(...)` helper (plus optional zod parse helpers) and migrating routes opportunistically; high leverage but touches many files.

### 2026-02-10 - Phase 4: Job Queue Lost-Lock Update Pattern
**Hypothesis:** Job state updates repeat the same lock-guarded UPDATE/RETURNING boilerplate.
**Findings:** `markJobSucceeded`, `rescheduleJob`, and `markJobFailed` are structurally identical except for SET clauses and error codes.
**Evidence:** `apps/web/lib/jobs/jobQueue.server.ts:126`, `apps/web/lib/jobs/jobQueue.server.ts:143`, `apps/web/lib/jobs/jobQueue.server.ts:166`.
**Conclusion:** Low-risk internal helper to reduce repetition and keep lost-lock behavior consistent.

### 2026-02-10 - Phase 4: CSV Export Branching
**Hypothesis:** `csvFromSourceRow` duplicates mapping logic by kind, which can be replaced with data-driven mapping without changing output.
**Findings:** Three `if (args.kind === ...)` blocks build nearly identical `record` shapes, then share identical sort and serialization.
**Evidence:** `apps/web/lib/exportCsv.server.ts:173` (function), branch bodies in `apps/web/lib/exportCsv.server.ts:192` through `apps/web/lib/exportCsv.server.ts:260`, then common `rows.sort(...)` and render at `apps/web/lib/exportCsv.server.ts:267`.
**Conclusion:** Medium-low risk refactor: define explicit per-kind mapping (with explicit headers) and reuse one loop/serializer.

## Recommendations (Prioritized)

1. Deduplicate Quick Start run processor transactional write paths (single local helper; delete copy/paste SQL blocks).
2. Centralize API error/validation response helpers (start with PDF + runs routes).
3. Collapse duplicated runtime gating conditions (keep `runtimeMode` as source of truth; re-implement assert helpers as thin wrappers; delete unused gates if confirmed unused).
4. Make CSV export mapping data-driven (explicit headers + stable ordering).
5. Dedupe repeated lock-guarded SQL updates in job queue.
6. Consider whether fixture script geometry helpers should remain local or reuse `packages/core` (avoid cross-package coupling unless it deletes more than it adds).

## Preventive Measures
- Prefer local helpers first (same file), only extracting modules when it deletes substantial duplication across multiple call sites.
- Treat idempotency markers (`run_steps` step keys) as the single gate for side effects to prevent drift in retries/fallback paths.
- Require explicit header order in any CSV export code to keep outputs stable during refactors.
