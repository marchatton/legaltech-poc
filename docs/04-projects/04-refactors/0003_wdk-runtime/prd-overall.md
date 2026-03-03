# PRD (Overall): WDK Runtime (Workstream B)

Owner: marc  
Status: Draft  
Date: 2026-02-10  
Slug: wdk-runtime

## Introduction / Overview

### Problem
The repo currently has a minimal durable `jobs` runtime for background work (`apps/web/lib/jobs/*`). This is durable, but it is not the target “WDK now” posture and it perpetuates drift from the architecture docs:
- no real `"use workflow"` controller concept
- no explicit `"use step"` boundaries as the canonical execution unit
- no single “world” backing step retries/progress in a workflow-shaped way

### Goal
Introduce a minimal in-repo WDK runtime and make it the durable orchestration foundation going forward.

### Primary Observable Effect
- A WDK worker can run durably against Postgres state and execute a tiny tracer workflow (`wdk_smoke`) across restarts.
- Document ingest execution is WDK-owned (no new `jobs(type=ingest_document)` rows).

### Scope / Slices
This dossier is split into two slice PRDs for parallelism and risk isolation:
1. `prds/0003a_wdk-runtime-skeleton/prd.md`: WDK runtime + worker + smoke workflow (no cutover).
2. `prds/0003b_ingest-to-wdk-cutover/prd.md`: Ingest cutover to WDK (feature-flagged) + jobs ingest retirement.

Important boundary:
- Quick Start “run execution cutover” is intentionally handled by `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md` so we do not duplicate that work here.

## Goals
- WDK runtime exists in-repo with a clear, minimal API.
- WDK worker loop exists and is runnable via `pnpm --filter @legaltech-poc/web worker`.
- Step claiming is safe for multiple workers (`FOR UPDATE SKIP LOCKED`).
- Step retry/backoff and stale lock requeue behavior is explicit and testable.
- Ingest is moved to WDK behind a short-lived feature flag.

## Non-goals (explicit cuts)
- Do not implement the Retrieval substrate (0011a).
- Do not implement Matter Chat (0011b).
- Do not refactor Quick Start internals into `retrieve -> draft -> lock -> verify -> write` in this dossier.
- Do not introduce a second DB migration system; continue runtime DDL for now.

## Dependencies / Related Work
- Quick Start cutover from jobs to WDK is tracked separately:
  - `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`
- Current durable jobs implementation:
  - `docs/04-projects/04-refactors/0002_durable-jobs/prd.md`
- Target posture references:
  - `docs/03-architecture/06_frameworks_agents_rag_evals.md`
  - `docs/96-engineering-tutor-learnings/2026-02-08_adr-0005_deterministic-ish-orchestration-via-workflow-devkit-steps.md`

## Success Metrics
- Starting `wdk_smoke` and killing/restarting the worker continues without duplicate side effects.
- Uploading a PDF triggers ingest via WDK when the flag is on; no ingest jobs are created.

## Risks
- Risk: Overloading existing `runs/run_steps` schemas causes drift or accidental coupling.
  - Mitigation: keep WDK world minimal, validate IO with Zod, and add focused unit tests around claim + retry semantics.
- Risk: Feature-flagged cutover drifts and becomes permanent.
  - Mitigation: timebox the flag and include “delete legacy path” as explicit acceptance criteria.

## Quality Gates
- `pnpm --filter @legaltech-poc/web typecheck`
- `pnpm --filter @legaltech-poc/web test`
- `pnpm verify`

## Open Questions
- Does WDK “world” reuse `run_steps` directly, or does it introduce WDK-specific step rows and mirror into `run_steps`?
- What is the minimal debug surface to inspect WDK state (dev-only `/spikes/wdk/*` route vs DB-only)?

## Sources
- `docs/04-projects/04-refactors/0003_wdk-runtime/plan.md`
- `docs/04-projects/04-refactors/0002_durable-jobs/prd.md`
- `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`
- `docs/03-architecture/07_current_poc_runtime.md`

