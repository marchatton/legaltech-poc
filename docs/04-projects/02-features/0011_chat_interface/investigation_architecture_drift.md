# Investigation: Architecture Drift vs Implementation (incl. Chat Interface)

## Summary
There is real drift between `docs/03-architecture/*` and the current implementation (mostly `apps/web/*`). Some drift is intentional (PR0 seams exist; several “target posture” components are not implemented yet), but a few mismatches are now actively misleading (route/gating conventions, citations being fixture-only, CSV export gating).

## Scope
- Compare documented architecture in `docs/03-architecture/` vs current implementation.
- Include impacts/requirements introduced by `docs/04-projects/02-features/0011_chat_interface/`.

## Symptoms
- No explicit runtime bug symptoms provided; this is an intentional drift audit.

## Investigation Log

### 2026-02-10 - Phase 0/1 - Setup
**Hypothesis:** There is drift between documented architecture and code.
**Findings:** Started investigation; workspace verified.
**Evidence:** `docs/04-projects/02-features/0011_chat_interface/investigation_architecture_drift.md`
**Conclusion:** Proceed to systematic exploration.

### 2026-02-10 - Phase 2/3 - Context Builder Audit
**Hypothesis:** Drift clusters around orchestration, evidence/citations, retrieval substrate, and API gating.
**Findings:** Confirmed multiple drift themes with concrete doc+code evidence; PR0 foundations for chat/retrieval exist, but target components (WDK, hybrid retrieval, OCR/geometry-backed citations) are not implemented yet.
**Evidence:**
- Docs baseline: `docs/03-architecture/00_overview.md`, `docs/03-architecture/07_current_poc_runtime.md`, `docs/03-architecture/DECISIONS.md`, `docs/03-architecture/50_api_surface.md`
- Code baseline: `apps/web/lib/jobs/jobWorker.server.ts`, `apps/web/lib/ingest/ingestProcessor.server.ts`, `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/middleware.ts`
**Conclusion:** Proceed to prioritized drift items + fix options.

### 2026-02-10 - Phase 4 - Git Recency Check
**Hypothesis:** Some “drift” is actually recent implementation landing after docs (or vice versa).
**Findings:** Demo-prod middleware/auth and jobs worker refactor landed in the last 1-2 days.
**Evidence:**
- `apps/web/middleware.ts` recent commit: `58aa8bd` (2026-02-10)
- `apps/web/lib/jobs/jobWorker.server.ts` recent commit: `e985af0` (2026-02-09)
- `docs/03-architecture/DECISIONS.md` updated multiple times 2026-02-07 to 2026-02-10
**Conclusion:** The repo is moving fast; we should bias toward clarifying “target vs current” and tightening any doc statements that read as already-true when they are not.

## Drift Items (Doc vs Code) + Fix Options

Each item includes: doc (“should”), code (“is”), impact, and minimal fix options.

### 1) Orchestration Runtime Drift: WDK workflows/steps vs Postgres-backed jobs worker
**Docs (should):** WDK `use workflow` / `use step` semantics and orchestration posture: `docs/03-architecture/06_frameworks_agents_rag_evals.md`, `docs/03-architecture/10_system_architecture.md`, WDK ADR(s) in `docs/03-architecture/DECISIONS.md`.  
**Code (is):** Jobs queue + worker loop: `apps/web/lib/jobs/jobQueue.server.ts`, `apps/web/lib/jobs/jobWorker.server.ts`; Quick Start is job-driven: `apps/web/lib/quickStartRunProcessor.server.ts`.  
**Impact:** “Steps do side effects” is not enforceable; future WDK adoption risks a rewrite.  
**Fix options:**
- Doc-only: explicitly state “current runtime uses jobs worker; WDK is a target migration” in `docs/03-architecture/07_current_poc_runtime.md` (if not already explicit enough).
- Code (recommended): introduce a thin “step runtime” abstraction that persists `run_steps` transitions and is callable from job processors; later swap its backend to WDK without rewriting domain logic.

### 2) Evidence/Citations Drift: Target DB-backed locked citations vs fixture-only `/citations/:id`
**Docs (should):** `/citations/:id` returns locked citations (snippet + hash + polygons) stored in Postgres: `docs/03-architecture/50_api_surface.md`, citation ADR(s) in `docs/03-architecture/DECISIONS.md`.  
**Code (is):** `/citations/:id` is seed snapshot backed: `apps/web/app/(api)/citations/[id]/route.ts`, `apps/web/lib/fixtureSeed.server.ts`; viewer relies on this: `apps/web/app/(app)/matters/viewer/page.tsx`.  
**Impact:** Real ingested docs cannot participate in evidence UX; chat sources can’t reuse citations contract.  
**Fix options:**
- Doc-only: label `/citations/:id` as fixture-only in `docs/03-architecture/07_current_poc_runtime.md` until DB-backed citations exist.
- Code (recommended): make `/citations/:id` DB-first (lookup by id), fallback to fixtures only in dev/demo-prod.

### 3) Geometry Drift: Target OCR/layout geometry vs ingest explicitly `has_geometry=false`
**Docs (should):** OCR/layout extraction and geometry-backed citations: `docs/03-architecture/30_data_model.md`, `docs/03-architecture/40_rag_and_agents.md`, relevant ADR(s) in `docs/03-architecture/DECISIONS.md`.  
**Code (is):** PDF.js text extraction; layout JSON `has_geometry: false`: `apps/web/lib/ingest/ingestProcessor.server.ts`.  
**Impact:** Locked citations cannot highlight precisely; any “click highlight” must be coarse.  
**Fix options:**
- Doc-only: add an explicit “geometry maturity ladder” (v0 page-level polygon, v1 lines, v2 words) in `docs/03-architecture/40_rag_and_agents.md`.
- Code: add a canonical “full page polygon” fallback used when `has_geometry=false` (so the contract remains consistent, just coarse).

### 4) Retrieval Drift: Target hybrid retrieval contract vs placeholder implementation
**Docs (should):** Hybrid retrieval and IDs-only contract: `docs/03-architecture/40_rag_and_agents.md`; PRD A: `docs/04-projects/02-features/0011_chat_interface/prds/0011a_hybrid-retrieval-v0/prd.md`.  
**Code (is):** Retrieval “seams” exist, but search is not implemented: `apps/web/lib/retrieval/types.ts`; chunk schema is minimal: `apps/web/lib/db/schema/retrieval.server.ts`; ingest chunks are “1 chunk per page”: `apps/web/lib/ingest/ingestProcessor.server.ts`.  
**Impact:** PRD B chat cannot be reliably grounded; any “answer with sources” is blocked on retrieval.  
**Fix options:**
- Doc-only: make the dependency explicit: chat PRD B depends on retrieval PRD A (unless chat is deliberately “fixture-only” first).
- Code: implement PRD A first: extend chunks schema for tsvector/embedding + implement `hybridSearch()`; add chunker metadata and index_version bump posture.

### 5) API/Gating Drift: Spike/demo conventions vs actual routes and runtime allowlisting
**Docs (should):** Spike endpoints under `/spikes/*` and gated by `SPIKES_ENABLED`: `docs/03-architecture/50_api_surface.md`.  
**Code (is):** Demo pack loader at `/demo/load-pack`: `apps/web/app/(api)/demo/load-pack/route.ts`; demo-prod allowlisting in middleware: `apps/web/middleware.ts`, runtime modes: `apps/web/lib/runtimeMode.ts`.  
**Impact:** Docs may send engineers to implement the wrong routes/flags; demo-prod blocks new endpoints (including chat) unless allowlisted.  
**Fix options:**
- Doc-only: update `docs/03-architecture/50_api_surface.md` to match implemented route + gating, or explicitly declare `/demo/*` as promoted operator endpoints.
- Code: alternatively move to `/spikes/demo/load-pack` and implement `SPIKES_ENABLED` gating, keeping a compatibility shim if needed.

### 6) Export Trust Drift: CSV export doesn’t enforce `EXPORT_BLOCKED` consistency
**Docs (should):** Fail-closed export gating when any row is `citation_failed`, unless explicit unsafe override: `docs/03-architecture/20_state_model.md`, export ADR(s) in `docs/03-architecture/DECISIONS.md`.  
**Code (is):** DOCX export enforces gating: `apps/web/app/(api)/export/docx/route.ts`; CSV export does not enforce run-wide gating and rejects unsafe override outright: `apps/web/app/(api)/export/csv/route.ts`.  
**Impact:** Inconsistent trust posture; undermines “evidence first” credibility as we add chat.  
**Fix options:**
- Code (recommended): align CSV export gating with DOCX export (run-wide `citation_failed` check => 409 `EXPORT_BLOCKED`).
- Doc-only alternative: if CSV is intentionally “demo escape hatch”, document it explicitly (but this conflicts with the stated trust posture).

### 7) Chat Schema Drift: Chat schema module exists but is empty; PRD B needs persistence
**Docs (should):** PRD B requires chat threads/messages and a citations strategy: `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md`.  
**Code (is):** `ensureChatSchema()` is currently a no-op: `apps/web/lib/db/schema/chat.server.ts`.  
**Impact:** Chat cannot persist; schema ownership decisions (unified citations vs separate) are blocked.  
**Fix options:**
- Code: implement `chat_threads` + `chat_messages` (and then decide how citations associate: unify `citations` vs separate `chat_citations`).

## Root Cause
The docs define a strong “target posture” (WDK orchestration, geometry-backed locked citations, hybrid retrieval), while the implementation is currently a PR0/PR1 runtime (jobs worker, fixture-only evidence UX, pdf.js ingest without geometry, retrieval placeholders). Some docs already acknowledge “current runtime” (`docs/03-architecture/07_current_poc_runtime.md`), but several other documents and PRDs read like the target is already implemented, creating practical drift.

## Recommendations (Priority Order)
1. Clarify “current vs target” explicitly where it’s easy to misread as implemented (especially `docs/03-architecture/50_api_surface.md` and the 0011 PRDs).
2. Make `/citations/:id` DB-first (seed fallback only in dev/demo-prod) before building chat, so chat can rely on a stable evidence contract.
3. Fix CSV export gating to match docx (fail closed), to keep the trust substrate coherent as chat adds new “copy/export” surfaces.
4. Land PRD A (hybrid retrieval) before PRD B (chat), unless chat is explicitly scoped to fixtures only.
5. Decide citations strategy for chat now:
   - Unified citations table (preferred for reuse), or
   - Separate chat citations (only if we factor shared invariants into shared code to avoid duplication).
6. Add a step-runtime abstraction that mirrors WDK semantics on top of the current jobs worker, to make later WDK migration incremental instead of a rewrite.

## Preventive Measures
- Add a “Drift budget” section in `docs/03-architecture/07_current_poc_runtime.md`: a short list of known intentional gaps, with links to PRDs/initiatives that will close them.
- For any new feature PRD (like 0011), add an explicit “Depends on” block pointing to enabling slices (retrieval, citations, demo-prod allowlist updates).
- Add a small CI check (or a local script) that flags docs claiming an endpoint exists unless a matching route handler file exists under `apps/web/app/(api)`.

## Root Cause
(TBD)

## Recommendations
1. (TBD)

## Preventive Measures
- (TBD)
