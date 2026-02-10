# Plan: Program Sequencing (WDK Now + Quick Start Refactor + 0011 Chat/Retrieval + 0009/0010)

Date: 2026-02-10  
Status: Draft (planning doc; no implementation implied)

## Intent
Create one coherent, low-regret sequence across:
- `docs/03-architecture/*` updates (target vs current, and “WDK now” posture)
- `0011a` Hybrid Retrieval (PRD A)
- `0011b` Matter Chat (PRD B)
- Refactor Quick Start to WDK now (close the biggest doc/code drift)
- Keep `0009` Contradiction Radar and `0010` CiteCapsules aligned to the evidence/trust substrate (and cut scope where needed)

Constraints
- Avoid hacky “temporary” layers that become permanent glue.
- Cutting scope is OK, but highlight when you do.
- Exception: **we want to use WDK now** (not “later”).

## Locked Decisions (for sequencing)
1. WDK is the durable orchestration runtime going forward. New long-running side effects go into WDK steps.
2. WDK “world” state is stored in the existing `runs` + `run_steps` tables (no parallel WDK tables + mirroring).
3. Quick Start is refactored onto WDK now (to match ADR-0005 and to avoid compounding drift).
4. `0011b` depends on `0011a` (chat must be grounded, not “ungrounded chat”).
5. Citations are a unified primitive (no parallel citation systems).
   - `GET /citations/:id` becomes real (DB-first) for real docs (Workstream E), with fixture fallback only for dev/demo packs.
   - The citations API remains behind `FEATURE_CITATIONS_API` until RH3 evidence is recorded (per `0001c`).
6. Geometry remains out of scope for v0; we explicitly support coarse page-level highlights when `has_geometry=false`.
7. Pre-geometry retrieval v0 uses `char_window_v0` chunking on `document_pages.text` (no OCR/layout lines yet).
   - When OCR/layout geometry lands, switch to ADR-0015 `line_window_v1` and bump `index_version` (per ADR-0015).

## Dependency Map (what blocks what)

Execution note (PRD-level):
- If you are running via Ralph, you do not have to “finish PRD-1” before starting PRD-2.
- You can start a dependent PRD as soon as the **specific prerequisite story** is done.
  - Example: once `0003a.US-001` (WDK worker can execute steps) is done, you can start `0003b` and `0004` in parallel even if other `0003a` stories remain.

### Foundation dependencies (hard blockers)
- WDK runtime (worker + world + conventions) blocks:
  - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003a_wdk-runtime-skeleton/prd.md`
  - Quick Start cutover to WDK: `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`
  - `0011b` chat: `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md` (PRD B assumes WDK step/run shape)
- Ingest cutover to WDK is enabled by the WDK runtime and can run in parallel with Quick Start cutover:
  - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003b_ingest-to-wdk-cutover/prd.md`
- Retrieval substrate (`0011a`) blocks grounded chat (`0011b`):
  - Retrieval PRD A: `docs/04-projects/02-features/0011_chat_interface/prds/0011a_hybrid-retrieval-v0/prd.md`
  - Chat PRD B: `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md`
- DB-first citations contract blocks chat sources being trustworthy outside fixture packs:
  - Canonical citations contract PRD: `docs/04-projects/02-features/0001_trust-substrate/prds/0001c_citations-api-locking/prd.md`
  - Workstream E PRD (execute via Ralph): `docs/04-projects/04-refactors/0005_citations-db-first/prd.json`
  - Note: `0001c` is explicitly NO-GO until RH3 evidence is recorded; keep `FEATURE_CITATIONS_API=0` until RH3 is complete.

### Soft dependencies (can be parallel)
- Docs alignment can run in parallel with early implementation work, as long as we keep a single source-of-truth “current runtime” section accurate.
- `0009` Contradiction Radar can be fixture-driven first, but should reuse the unified citations + evidence viewer surfaces (no new evidence primitives).
- `0010` CiteCapsules should be postponed until we have stable geometry for real docs, or explicitly constrained to fixture-backed citations only.

## Parallel Workstreams (what can run concurrently)

### Workstream A: Docs Alignment (highest priority first)
Goal: remove misleading drift and make “WDK now + sequencing” unambiguous.

Edits to make (checklist):
- `docs/03-architecture/07_current_poc_runtime.md`
  - Update “Known drift vs target architecture” after WDK lands (remove “WDK not implemented”).
  - Clarify citations: which parts are fixture-only vs DB-backed (once `/citations/:id` is DB-first).
- `docs/03-architecture/50_api_surface.md`
  - Align `/spikes/*` vs `/demo/*` conventions and gating (`SPIKES_ENABLED`, `ORBITAL_MODE`, etc).
  - Add explicit note: any new debug/retrieval endpoints for 0011a must be `/spikes/retrieval/*`.
- `docs/03-architecture/40_rag_and_agents.md`
  - Confirm geometry maturity ladder and the v0 “full page polygon” fallback for `has_geometry=false`.
  - Add explicit note: pre-geometry retrieval uses `char_window_v0` until OCR/layout lines exist (then migrate to ADR-0015 `line_window_v1` via `index_version` bump).
- `docs/03-architecture/DECISIONS.md`
  - Ensure ADR-0005 is reflected as “implemented” once Quick Start is on WDK.
- `docs/04-projects/02-features/0011_chat_interface/*`
  - Update `brief.md` to state hard dependency: `0011b` waits for `0011a` and DB-first citations.
  - Update PRD A/B wording where it conflicts with PR0 decisions (notably: where retrieval code lives and how `/spikes/*` gating is enforced).
- `docs/04-projects/02-features/0009_contradiction-radar/brief.md`
  - Add a “Depends on” note: reuse unified citations + evidence viewer; v0 is fixture-driven and deterministic.
- `docs/04-projects/02-features/0010_cite-capsules/brief.md`
  - Add explicit “geometry constraint”: meaningful capsules require geometry-backed citations; v0 is fixture-only unless geometry lands.

Deliverable:
- A doc-only PR that makes the dependency graph and scope cuts explicit, without claiming implementation that doesn’t exist.

### Workstream B: WDK Runtime + Conventions (enable WDK now)
Goal: introduce WDK into the repo as the real runtime (not an abstraction layered on jobs).

Outcomes:
- A WDK worker process exists (separate from Next.js web) and can execute steps durably.
- WDK “world” uses Postgres and has a clear migration/DDL story (idempotent; compatible with current runtime DDL approach).
- WDK durable state is in the existing `runs` + `run_steps` tables (single source of truth).
- Conventions are real in code (`"use workflow"`, `"use step"`).

Deliverable:
- WDK runtime PRDs (execute in series, then parallelise as dependencies allow):
  - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003a_wdk-runtime-skeleton/prd.md`
  - `docs/04-projects/04-refactors/0003_wdk-runtime/prds/0003b_ingest-to-wdk-cutover/prd.md`

### Workstream C: Refactor Quick Start to WDK (do now, not later)
Goal: close the biggest architectural drift and avoid two orchestration systems long-term.

Scope:
- Replace the current “jobs + processor” orchestration for Quick Start with a WDK workflow that coordinates explicit steps.
- Preserve existing `runs`, `run_steps`, and state model invariants (no silent semantic changes).

Notes:
- This work should use the same “retrieve → draft → lock → verify → write” shape described in `docs/03-architecture/DECISIONS.md` and `docs/03-architecture/40_rag_and_agents.md`.
- Keep domain logic outside WDK integration layer where possible (pure functions in `packages/core`; orchestration in `apps/web` WDK workflow/steps).

Deliverable:
- Quick Start cutover PRD:
  - `docs/04-projects/04-refactors/0004_quick-start-to-wdk/prd.md`

### Workstream D: Retrieval Substrate (0011a) (PRD A as a whole)
Goal: make real uploaded docs searchable and debuggable (lexical + semantic), IDs-only contract.

Dependencies:
- Can start before Quick Start refactor completes, but should target the same WDK runtime posture for any long-running embedding work.

Chunking posture (v0):
- Implement `char_window_v0` chunking on `document_pages.text` (pre-geometry bridge).
- Plan a deliberate migration to ADR-0015 `line_window_v1` once OCR/layout geometry lands, via `index_version` bump.

Important design constraint (avoid future pain):
- `packages/core` should not depend on `apps/web` DB layer. If PRD A currently implies that, adjust:
  - Keep DB + AI calls in `apps/web` server modules.
  - Factor pure scoring/merge logic into `packages/core` if needed.

Deliverable:
- PRD A:
  - `docs/04-projects/02-features/0011_chat_interface/prds/0011a_hybrid-retrieval-v0/prd.md`

### Workstream E: Citations Contract Hardening (DB-first) + Unified Associations
Goal: make evidence primitives real (not fixture-only), and support chat + quick start + future features without duplicating invariants.

Outcomes:
- `GET /citations/:id` reads DB first; fixture fallback only where explicitly allowed.
- Unified citations table supports exactly-one association (`report_row_id` OR `chat_message_id`) as required by PRD B.
- Coarse highlight polygons supported when `has_geometry=false` (explicit, labeled).
- `FEATURE_CITATIONS_API` stays off by default until RH3 evidence is recorded; enable explicitly for dev/demo-prod once RH3 is complete.

Deliverable:
- Citations contract PRD (base):
  - `docs/04-projects/02-features/0001_trust-substrate/prds/0001c_citations-api-locking/prd.md`
- Plus program-required hardening:
  - `docs/04-projects/04-refactors/0005_citations-db-first/prd.json` (DB-first GET /citations/:id + unified associations)

### Workstream F: Matter Chat (0011b) (PRD B as a whole)
Goal: ship evidence-first chat with WDK durability and locked sources.

Hard dependencies:
- WDK runtime (Workstream B)
- Retrieval substrate (Workstream D)
- DB-first citations + unified associations (Workstream E)

Deliverable:
- PRD B:
  - `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md`

### Workstream G: Feature Alignment (0009 + 0010)
Goal: keep 0009/0010 consistent with the trust substrate, without forcing them into the critical path.

0009 Contradiction Radar:
- Can be delivered fixture-first, but should reuse citations + evidence viewer (no new sharing primitives).
- If implemented later for real docs, it will naturally depend on retrieval + citations for real uploads.

0010 CiteCapsules:
- Defer for real docs until geometry exists.
- If we want a demo slice now, explicitly constrain to fixture citations (where polygons are meaningful), and label UNSIGNED capsules clearly.

## Proposed Sequencing (low-regret order)

### Phase 0: “Doc Truth Pass” (parallel with Phase 1)
- Land Workstream A doc updates early to keep the team aligned while implementation moves.

### Phase 1: “WDK First” (must happen early)
1. Workstream B: Implement WDK runtime + worker.
2. Workstream C: Refactor Quick Start onto WDK (immediately after B is viable).

### Phase 2: “Make Evidence + Retrieval Real”
3. Workstream D: Implement PRD A retrieval substrate (0011a).
4. Workstream E: RH3 + enable `FEATURE_CITATIONS_API` + DB-first citations + unify associations (chat/report).

### Phase 3: “Ship Grounded Chat”
5. Workstream F: Implement PRD B chat (0011b).

### Phase 4: “Optional Feature Slices”
6. Workstream G: 0009 Contradiction Radar (fixture-first or real-docs depending on appetite).
7. Workstream G: 0010 CiteCapsules (fixture-only until geometry; real-doc later).

## Dossiers To Create Next (under `docs/04-projects/04-refactors/`)
Once this plan is accepted, create refactor dossiers (one per coherent PR/track):
1. `0003_wdk-runtime/` (WDK runtime + worker + smoke workflow + ingest cutover)
2. `0004_quick-start-to-wdk/` (remove jobs orchestration for Quick Start; keep state model)
3. `0011_chat_interface/` already contains PRDs: `prds/0011a_hybrid-retrieval-v0/` (retrieval substrate) and `prds/0011b_matter-chat-v0/` (matter chat)
4. `0005_citations-db-first/` (Workstream E PRD JSON: `docs/04-projects/04-refactors/0005_citations-db-first/prd.json`)

## Definition of Done (program-level)
- WDK is real in code (not just in docs), and Quick Start runs on it.
- Retrieval is implemented and debuggable via `/spikes/retrieval/*`.
- Chat ships only once it can attach locked sources from real docs (or we explicitly cut chat).
- No parallel evidence primitives: citations are unified and DB-backed; fixture fallback is explicit and gated.
