# Drift Report: `0001_trust-substrate` (Docs ↔ PRDs ↔ Code)

## Scope + constraints
Compared sources:
- Architecture docs: `docs/03-architecture/*`
- PRDs (JSON): `docs/04-projects/02-features/0001_trust-substrate/prds/*/prd.json` + `docs/04-projects/02-features/0001_trust-substrate/prd-overall.json`
- Implementation: `apps/web/app`, `apps/web/lib`, `packages/core/src`
- Smoke scripts: `scripts/us00*_smoke.ts`

Notes:
- Some docs may be slightly stale (per your note); this report treats docs/PRDs as the target contract and code as “what’s true today.”
- Sequencing note: 0002a first → 0002b–f → 0002g (gaps). This reduces drift confidence for any 0001 behavior that will later be re-grounded in the 0002 canonical run model.

---

## Requirements Checklist (Implemented / Partial / Missing / Extra)

### Safe error envelope + `trace_id` correlation
- **Status:** Implemented (across route handlers)
- **Spec:** non-2xx uses envelope; server includes `trace_id` in body and `X-Trace-Id` header. `docs/03-architecture/50_api_surface.md:38`, `docs/03-architecture/50_api_surface.md:42`
- **Core support:** envelope supports `trace_id`. `packages/core/src/safe-error.ts:10`
- **Web helper:** `createTraceContext()` mints `traceId` and sets `X-Trace-Id`. `apps/web/lib/trace.server.ts:3`
- **Evidence (examples):**
  - `GET /citations/:id`: `apps/web/app/(api)/citations/[id]/route.ts:89`
  - `POST /folders`: `apps/web/app/(api)/folders/route.ts:47`
  - `GET /folders/:id`: `apps/web/app/(api)/folders/[id]/route.ts:15`

### Admin token (`X-Orbital-Admin-Token`)
- **Status:** Implemented (strict by default) + **Extra:** explicit dev-only bypass when token is unset
- **Spec:** require header matching env `ORBITAL_ADMIN_TOKEN`, else `403 UNAUTHORISED`. `docs/03-architecture/50_api_surface.md:33`, `docs/03-architecture/50_api_surface.md:36`
- **Implementation:** `GET /runs/:id/trace` checks token. `apps/web/app/(api)/runs/[id]/trace/route.ts:38`, `apps/web/app/(api)/runs/[id]/trace/route.ts:50`
- **Extra (dev only):** allow bypass only when `NODE_ENV=development` and `ALLOW_ADMIN_BYPASS=1`. `apps/web/app/(api)/runs/[id]/trace/route.ts:44`

### Spike endpoint gating (`/spikes/*` requires `SPIKES_ENABLED=1`)
- **Status:** Implemented (works in any env where `SPIKES_ENABLED=1`, including a separate dev env)
- **Spec:** `/spikes/*` gated behind `SPIKES_ENABLED=1`, else `404`. `docs/03-architecture/50_api_surface.md:5`, `docs/03-architecture/50_api_surface.md:83`
- **Shared gate:** `assertSpikesEnabled()` returns `404` with a safe envelope. `apps/web/lib/spikes.server.ts:3`
- **Applied to spikes routes:**
  - `GET /spikes/local-pdf`: `apps/web/app/(api)/spikes/local-pdf/route.ts:13`
  - `POST /spikes/rh4-verify`: `apps/web/app/(api)/spikes/rh4-verify/route.ts:9`
  - `POST /spikes/export/csv`: `apps/web/app/(api)/spikes/export/csv/route.ts:134`

### Render URL contract (`GET /documents/:id/render?page=N`)
- **Status:** Implemented
- **Spec:** returns `{document_id,page,render_url}`; `page` 1-indexed; `render_url` is signed URL to whole PDF. `docs/03-architecture/50_api_surface.md:226`, `docs/03-architecture/50_api_surface.md:231`, `docs/03-architecture/50_api_surface.md:235`
- **Implementation:**
  - Fixture-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:92`
  - DB-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:169`
  - Out-of-range page validation when `page_count` known: `apps/web/app/(api)/documents/[id]/render/route.ts:149`

### Range support for PDFs (pdf.js requirement)
- **Status:** Implemented
- **Implementation (signed PDF endpoint supports Range):** `apps/web/app/(api)/documents/[id]/pdf/route.ts:205`, `apps/web/app/(api)/documents/[id]/pdf/route.ts:225`
- **Implementation (local spike PDF endpoint supports Range):** `apps/web/app/(api)/spikes/local-pdf/route.ts:61`, `apps/web/app/(api)/spikes/local-pdf/route.ts:83`
- **Smoke proof exists:** range precheck asserts `206`, `Accept-Ranges`, and `Content-Range`. `scripts/us001_render_smoke.ts:100`, `scripts/us001_render_smoke.ts:116`

### Trace export (`GET /runs/:id/trace`)
- **Status:** Partial (fixture-backed; not yet the canonical persisted run model)
- **PRD:** feature-flagged, admin-only, off by default (`FEATURE_TRACE_EXPORT`). `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:30`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:41`
- **Spec:** safe-by-default trace export. `docs/03-architecture/50_api_surface.md:335`, `docs/03-architecture/50_api_surface.md:341`
- **Implementation:** `apps/web/app/(api)/runs/[id]/trace/route.ts:132`
- **Drift:** trace is fixture-backed and “steps” are synthesized; not persisted (no DB `runs/run_steps/...`). `apps/web/lib/db.server.ts:45`, `docs/03-architecture/30_data_model.md:18`

### CSV export (`POST /export/csv`)
- **Status:** Missing (target contract reserved) + **Extra:** fixture-backed spike implementation
- **Spec:** default `EXPORT_BLOCKED` when any row is `citation_failed`. `docs/03-architecture/50_api_surface.md:403`, `docs/03-architecture/50_api_surface.md:409`
- **Current behavior:** canonical endpoint returns `NOT_FOUND` and points to spike route. `apps/web/app/(api)/export/csv/route.ts:7`
- **Spike implementation:** `POST /spikes/export/csv` implements fail-closed verification + artefact creation. `apps/web/app/(api)/spikes/export/csv/route.ts:134`, `apps/web/app/(api)/spikes/export/csv/route.ts:187`
- **Download endpoint (signed):** `GET /export/csv/download?expires&sig=...` is implemented. `apps/web/app/(api)/export/csv/download/route.ts:37`

### Canonical snippet hashing (single source of truth)
- **Status:** Implemented
- **Spec (hashing rule):** `docs/03-architecture/30_data_model.md:210`, `docs/03-architecture/30_data_model.md:214`
- **Core implementation:** `packages/core/src/citations/snippet.ts:3`, `packages/core/src/citations/snippet.ts:7`
- **Tests:**
  - Single-source guardrail: `packages/core/src/citations/snippet.single-source.test.ts:43`
  - Whitespace invariance: `packages/core/src/citations/snippet.test.ts:5`

### Deterministic verification v1 (integrity-only)
- **Status:** Implemented
- **Core invariants:** `packages/core/src/verify/verifier.ts:35`, `packages/core/src/verify/verifier.ts:53`, `packages/core/src/verify/verifier.ts:67`

### Canonical persistence (trust spine tables)
- **Status:** Missing (major structural drift)
- **Spec:** ERD expects `runs`, `run_steps`, `report_rows`, `citations`, `artefacts`. `docs/03-architecture/30_data_model.md:18`, `docs/03-architecture/30_data_model.md:23`
- **Current DB schema:** only `folders`, `documents`, `document_pages`, `chunks`. `apps/web/lib/db.server.ts:48`, `apps/web/lib/db.server.ts:96`

### Extra (present in code, not in target contract)
- Fixture-driven scaffold IDs (e.g. `pack_*` used as `folder_id` in spikes and `pack` query escape hatches).
  - Spike export expects `folder_id` to be `pack_*`: `apps/web/app/(api)/spikes/export/csv/route.ts:21`
  - Citations API uses seeded packs to resolve IDs: `apps/web/app/(api)/citations/[id]/route.ts:92`

---

## Architecture Alignment and Mismatches

### Folder state machine (aligned)
- Folder derived state matches the documented invariants:
  - `empty` is zero documents: `docs/03-architecture/20_state_model.md:37`, `apps/web/lib/folderState.server.ts:34`
  - `failed` when any doc failed: `docs/03-architecture/20_state_model.md:49`, `apps/web/lib/folderState.server.ts:36`
  - `ready` health checks align with extraction_quality + page rows: `docs/03-architecture/20_state_model.md:52`, `docs/03-architecture/20_state_model.md:55`, `apps/web/lib/folderState.server.ts:54`, `apps/web/lib/folderState.server.ts:60`

### Report-row invariants (aligned in core, not persisted)
- Doc invariants for `missing_input` and locked citations exist. `docs/03-architecture/20_state_model.md:145`, `docs/03-architecture/20_state_model.md:148`
- Core verifier enforces key integrity constraints, but it runs against fixture snapshots or request-time computed structures (no persisted `report_rows`/`citations` tables yet). `packages/core/src/verify/verifier.ts:35`, `apps/web/lib/db.server.ts:45`

### API surface mismatches
- Target export contract is defined at `POST /export/csv`, but current working export implementation is under `/spikes/export/csv`. `docs/03-architecture/50_api_surface.md:403`, `apps/web/app/(api)/export/csv/route.ts:7`

### Data model mismatch (major)
- Docs/PRDs assume append-only execution persistence for auditability and replay (`runs/run_steps/report_rows/citations/artefacts`). `docs/03-architecture/30_data_model.md:18`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:43`
- Code today is primarily “fixture mode” for citations/trace/export, with DB schema stopping at chunks. `apps/web/lib/db.server.ts:94`

---

## Generated-Code Notes
- No OpenAPI/GraphQL/proto/codegen inputs were found in the reviewed areas.

---

## Risks (Security / Data / Perf / Compat)

### Security
- Spike endpoints are now gated by `SPIKES_ENABLED=1` (reduces accidental exposure risk), but this is still a footgun if enabled in the wrong environment. `apps/web/lib/spikes.server.ts:4`
- Trace export is admin-only by default; the only bypass is explicit and dev-only (`ALLOW_ADMIN_BYPASS=1`). `apps/web/app/(api)/runs/[id]/trace/route.ts:44`

### Data integrity
- Fixture-mode can diverge from canonical DB-backed behavior once 0002 lands; without persisted trust spine tables, “what happened” is not auditable beyond a snapshot file.

### Compatibility
- Signed `render_url` + Range semantics are validated by smoke script. `scripts/us001_render_smoke.ts:93`, `scripts/us001_render_smoke.ts:106`

### Operational ergonomics
- Object-store signing secret defaults to a per-process dev value if `OBJECT_STORE_SIGNING_SECRET` is unset; signed URLs will break across restarts. `apps/web/lib/objectStore.server.ts:42`, `apps/web/lib/objectStore.server.ts:46`
- Sprite dev environments may require `localhost`→`127.0.0.1` normalization for Postgres. `apps/web/lib/db.server.ts:14`

---

## Test Gaps

- `trace_id` standardization: add tests asserting all non-2xx responses include `error.trace_id` + `X-Trace-Id` for key endpoints.
- Spike gating: add tests asserting `/spikes/*` returns `404` unless `SPIKES_ENABLED=1`.
- Admin token posture: add tests asserting `GET /runs/:id/trace` is admin-only unless the explicit dev bypass is enabled.

Existing smoke proof:
- Render_url + Range proof: `scripts/us001_render_smoke.ts:93`.

---

## Next Steps (Smallest-First)

1. Decide how to handle export surface drift
- Either implement `POST /export/csv` per `docs/03-architecture/50_api_surface.md:403`, or explicitly move the contract under `/spikes/*` and update docs.

2. Make fixture mode explicit
- Add a short “fixture mode vs canonical mode” section to `docs/03-architecture/50_api_surface.md:5` and/or move remaining fixture-backed endpoints under `/spikes/*`.

3. Close the largest structural drift: persist trust spine tables
- Extend `apps/web/lib/db.server.ts:45` to add `runs`, `run_steps`, `report_rows`, `citations`, `artefacts` per `docs/03-architecture/30_data_model.md:18`.
- Migrate `GET /runs/:id/trace` and `POST /export/csv` to read from persisted run state.
