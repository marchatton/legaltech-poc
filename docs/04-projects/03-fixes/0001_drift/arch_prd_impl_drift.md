# Drift Report: `0001_trust-substrate` (Docs ↔ PRDs ↔ Code)

## Scope + constraints
Compared sources (in selected context):
- Architecture docs: `docs/03-architecture/*`
- PRDs (JSON): `docs/04-projects/02-features/0001_trust-substrate/prds/*/prd.json` + `docs/04-projects/02-features/0001_trust-substrate/prd-overall.json`
- Implementation: `apps/web/app`, `apps/web/lib`, `packages/core/src`
- Fixture tooling: `scripts/fixtures/*` + smoke scripts

Notes:
- Some docs may be slightly stale (per your note); this report treats docs/PRDs as the *target contract* and code as “what’s true today.”
- Sequencing note you requested: 0002a first → 0002b–f → 0002g (gaps). That sequencing reduces drift confidence for any 0001 behavior that will later be re-grounded in the 0002 canonical run model.

---

## Requirements Checklist (Implemented / Partial / Missing / Extra)

### Safe error envelope + `trace_id` (contract)
- **Spec:** non-2xx uses envelope; server includes `trace_id` in body and `X-Trace-Id` header. `docs/03-architecture/50_api_surface.md:38`, `docs/03-architecture/50_api_surface.md:42`
- **Core support (envelope includes trace_id):** `packages/core/src/safe-error.ts:10`
- **Implemented (some endpoints):**
  - `GET /documents/:id/render`: `traceId` minted + `X-Trace-Id` header + error envelope uses `traceId`. `apps/web/app/(api)/documents/[id]/render/route.ts:22`, `apps/web/app/(api)/documents/[id]/render/route.ts:25`, `apps/web/app/(api)/documents/[id]/render/route.ts:32`
  - `GET /runs/:id/trace`: `traceId` minted + `X-Trace-Id` header + error envelope uses `traceId`. `apps/web/app/(api)/runs/[id]/trace/route.ts:131`, `apps/web/app/(api)/runs/[id]/trace/route.ts:135`, `apps/web/app/(api)/runs/[id]/trace/route.ts:140`
- **Partial / drift (many endpoints omit `trace_id`):**
  - `POST /folders`: errors use envelope but no trace. `apps/web/app/(api)/folders/route.ts:49`
  - `GET /folders/:id`: errors use envelope but no trace. `apps/web/app/(api)/folders/[id]/route.ts:21`
  - `GET /citations/:id`: errors use envelope but no trace. `apps/web/app/(api)/citations/[id]/route.ts:93`

### Admin token (`X-Orbital-Admin-Token`)
- **Spec:** require header matching env `ORBITAL_ADMIN_TOKEN`, else `403 UNAUTHORISED`. `docs/03-architecture/50_api_surface.md:33`
- **Implemented (trace export checks token):** `apps/web/app/(api)/runs/[id]/trace/route.ts:48`, `apps/web/app/(api)/runs/[id]/trace/route.ts:50`
- **Partial / drift:** dev-bypass when admin token not configured. `apps/web/app/(api)/runs/[id]/trace/route.ts:41`, `apps/web/app/(api)/runs/[id]/trace/route.ts:44`

### Spike endpoint gating (`/spikes/*` requires `SPIKES_ENABLED=1`)
- **Spec:** `/spikes/*` gated behind `SPIKES_ENABLED=1`, else `404`. `docs/03-architecture/50_api_surface.md:81`, `docs/03-architecture/50_api_surface.md:83`
- **Missing / drift:** current spike endpoints gate on `NODE_ENV === "development"` only:
  - `GET /spikes/local-pdf`: `apps/web/app/(api)/spikes/local-pdf/route.ts:12`
  - `POST /spikes/rh4-verify`: `apps/web/app/(api)/spikes/rh4-verify/route.ts:7`
  - `POST /spikes/export/csv`: `apps/web/app/(api)/spikes/export/csv/route.ts:24`

### Render URL contract (`GET /documents/:id/render?page=N`)
- **Spec:** returns `{document_id,page,render_url}`; `page` 1-indexed; `render_url` is signed URL to whole PDF. `docs/03-architecture/50_api_surface.md:226`, `docs/03-architecture/50_api_surface.md:231`, `docs/03-architecture/50_api_surface.md:235`
- **Implemented:** response shape matches.
  - Fixture-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:96`
  - DB-doc branch: `apps/web/app/(api)/documents/[id]/render/route.ts:173`
- **Implemented:** out-of-range page validation when `page_count` known. `apps/web/app/(api)/documents/[id]/render/route.ts:153`, `apps/web/app/(api)/documents/[id]/render/route.ts:154`

### Range support for PDFs (pdf.js requirement)
- **Implemented (signed PDF endpoint supports Range):**
  - Sets `Accept-Ranges: bytes`: `apps/web/app/(api)/documents/[id]/pdf/route.ts:209`
  - Returns `206` for valid ranges: `apps/web/app/(api)/documents/[id]/pdf/route.ts:229`
- **Implemented (local spike PDF endpoint supports Range):**
  - Sets `Accept-Ranges: bytes`: `apps/web/app/(api)/spikes/local-pdf/route.ts:51`
  - Returns `206` for valid ranges: `apps/web/app/(api)/spikes/local-pdf/route.ts:72`
- **Implemented (smoke proof exists):** range precheck asserts `206`, `Accept-Ranges`, and `Content-Range`. `scripts/us001_render_smoke.ts:100`, `scripts/us001_render_smoke.ts:106`, `scripts/us001_render_smoke.ts:111`, `scripts/us001_render_smoke.ts:116`

### Trace export (`GET /runs/:id/trace`)
- **PRD:** feature-flagged, admin-only, off by default (`FEATURE_TRACE_EXPORT`). `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:30`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:41`
- **Implemented:** feature flag gate. `apps/web/app/(api)/runs/[id]/trace/route.ts:138`
- **Implemented:** response is an attachment. `apps/web/app/(api)/runs/[id]/trace/route.ts:289`
- **Partial / drift:** trace is fixture-backed and “steps” are synthesized, not persisted (no DB runs/steps tables). `apps/web/app/(api)/runs/[id]/trace/route.ts:184`, `apps/web/app/(api)/runs/[id]/trace/route.ts:258`

### Export gating (`POST /export/csv` blocks on `citation_failed`)
- **Spec:** default `EXPORT_BLOCKED` when any row is `citation_failed`. `docs/03-architecture/50_api_surface.md:62`, `docs/03-architecture/50_api_surface.md:405`
- **State model:** export blocked unless unsafe override; intended demo-only. `docs/03-architecture/20_state_model.md:158`, `docs/03-architecture/20_state_model.md:160`
- **Implemented (fixture-backed):** detects failures and returns `EXPORT_BLOCKED`. `apps/web/app/(api)/export/csv/route.ts:82`, `apps/web/app/(api)/export/csv/route.ts:173`
- **Partial / drift:** uses `folder_id` as allowlisted `pack_id` (dev scaffold), not a DB folder id. `apps/web/app/(api)/export/csv/route.ts:17`

### Canonical snippet hashing (single source of truth)
- **PRD:** must be implemented once in core + reused, with tests for invariance. `docs/04-projects/02-features/0001_trust-substrate/prds/0001c_citations-api-locking/prd.json:104`
- **Spec (hashing rule):** `docs/03-architecture/30_data_model.md:210`, `docs/03-architecture/30_data_model.md:214`
- **Implemented:** `packages/core/src/citations/snippet.ts:3`, `packages/core/src/citations/snippet.ts:7`
- **Implemented (tests):**
  - Single-source guardrail: `packages/core/src/citations/snippet.single-source.test.ts:43`
  - Whitespace invariance: `packages/core/src/citations/snippet.test.ts:5`, `packages/core/src/citations/snippet.test.ts:11`

### Deterministic verification v1 (integrity-only)
- **Implemented:** `verifyRow()` integrity-only invariants:
  - missing_input invariant: `packages/core/src/verify/verifier.ts:35`
  - non-missing_input must have citations: `packages/core/src/verify/verifier.ts:44`
  - snippet_hash match: `packages/core/src/verify/verifier.ts:53`
  - deterministic-only mode: `packages/core/src/verify/verifier.ts:67`

### Canonical persistence (trust spine tables)
- **Spec:** ERD expects `runs`, `run_steps`, `report_rows`, `citations`, `artefacts`. `docs/03-architecture/30_data_model.md:18`, `docs/03-architecture/30_data_model.md:23`
- **Missing in current DB schema:** only `folders`, `documents`, `document_pages`, `chunks`. `apps/web/lib/db.server.ts:48`, `apps/web/lib/db.server.ts:96`

### Extra (present in code, not in target contract)
- Fixture-driven scaffold paths and IDs (e.g. `pack_*` used as `folder_id` for export/trace/citations) that behave “contract-like” but are not the canonical run model.
  - Export: `apps/web/app/(api)/export/csv/route.ts:17`
  - Trace: `apps/web/app/(api)/runs/[id]/trace/route.ts:184`

---

## Architecture Alignment and Mismatches

### Folder state machine (aligned)
- Folder derived state matches the documented invariants:
  - `empty` is zero documents: `docs/03-architecture/20_state_model.md:37`, `apps/web/lib/folderState.server.ts:34`
  - `failed` when any doc failed: `docs/03-architecture/20_state_model.md:49`, `apps/web/lib/folderState.server.ts:36`
  - `ready` health checks align with extraction_quality + page rows: `docs/03-architecture/20_state_model.md:52`, `docs/03-architecture/20_state_model.md:55`, `apps/web/lib/folderState.server.ts:54`, `apps/web/lib/folderState.server.ts:60`

### Report-row invariants (aligned in core, not persisted)
- Doc invariants for `missing_input` and locked citations exist. `docs/03-architecture/20_state_model.md:145`, `docs/03-architecture/20_state_model.md:148`
- Core verifier enforces key integrity constraints, but it runs against fixture snapshots or request-time computed structures (no persisted `report_rows`/`citations` tables yet). `packages/core/src/verify/verifier.ts:35`, `packages/core/src/verify/verifier.ts:53`, `apps/web/lib/db.server.ts:45`

### API surface mismatches
- `trace_id` correlation is inconsistent across endpoints (see checklist). The spec expects correlation to be ubiquitous. `docs/03-architecture/50_api_surface.md:38`
- Spike gating is not implemented per spec (`SPIKES_ENABLED=1`). `docs/03-architecture/50_api_surface.md:83`

### Data model mismatch (major)
- Docs/PRDs assume append-only execution persistence for auditability and replay (`runs/run_steps/report_rows/citations/artefacts`). `docs/03-architecture/30_data_model.md:18`, `docs/04-projects/02-features/0001_trust-substrate/prds/0001f_provenance-trace-export/prd.json:43`
- Code today is mostly “fixture mode” for citations/trace/export, with DB schema stopping at chunks. `apps/web/lib/db.server.ts:94`

---

## Generated-Code Notes
- No OpenAPI/GraphQL/proto/codegen inputs were found in the selected context.
- Generated artifacts likely present in the repo but not relevant to trust substrate drift:
  - `apps/web/next-env.d.ts` (Next.js)
  - `apps/web/tsconfig.tsbuildinfo` (TypeScript incremental)

---

## Risks (Security / Data / Perf / Compat)

### Security
- Spike endpoints are dev-gated only; missing the required `SPIKES_ENABLED=1` gate increases accidental exposure risk. `docs/03-architecture/50_api_surface.md:83`, `apps/web/app/(api)/spikes/local-pdf/route.ts:12`
- Trace export admin bypass in dev can normalize a weaker posture than PRD intent unless explicitly documented as a dev-only concession. `apps/web/app/(api)/runs/[id]/trace/route.ts:41`

### Data integrity
- Fixture-mode can diverge from canonical DB-backed behavior once 0002 lands; without persisted trust spine tables, “what happened” is not auditable beyond a snapshot file.

### Compatibility
- Signed render_url + Range semantics are validated by smoke script. `scripts/us001_render_smoke.ts:93`, `scripts/us001_render_smoke.ts:106`

### Operational ergonomics
- Object-store signing secret defaults to a per-process dev value if `OBJECT_STORE_SIGNING_SECRET` is unset; signed URLs will break across restarts. `apps/web/lib/objectStore.server.ts:42`, `apps/web/lib/objectStore.server.ts:46`, `apps/web/lib/objectStore.server.ts:49`

---

## Test Gaps

Unit / integration gaps (vs contract):
- `trace_id` standardization: add tests asserting all non-2xx responses include `error.trace_id` + `X-Trace-Id` for canonical endpoints (e.g. folders/citations).
- Spike gating: add tests asserting `/spikes/*` returns `404` unless `SPIKES_ENABLED=1`.
- Admin token posture: add tests asserting `GET /runs/:id/trace` is admin-only outside of explicit dev/demo bypass.

Existing smoke tests:
- Render_url + Range proof: `scripts/us001_render_smoke.ts:93` and the Range assertions at `scripts/us001_render_smoke.ts:100`.
- Ingest state transitions + ready check proof: `scripts/us002_smoke.ts:145`, `scripts/us002_smoke.ts:153`.

---

## Next Steps (Smallest-First)

1. Standardize `trace_id` everywhere
- Add a small helper to mint `traceId` + set `X-Trace-Id`, and use it in all route handlers.
- Start with: `apps/web/app/(api)/folders/route.ts:19`, `apps/web/app/(api)/folders/[id]/route.ts:14`, `apps/web/app/(api)/citations/[id]/route.ts:88`.

2. Enforce `/spikes/*` gating per contract
- Introduce `assertSpikesEnabled()` that checks `SPIKES_ENABLED === "1"` and returns `404` envelope otherwise.
- Apply to: `apps/web/app/(api)/spikes/local-pdf/route.ts:12`, `apps/web/app/(api)/spikes/rh4-verify/route.ts:7`, `apps/web/app/(api)/spikes/export/csv/route.ts:24`.

3. Tighten admin-token posture for trace export
- Replace implicit dev-bypass with explicit env (e.g. `ALLOW_ADMIN_BYPASS=1`) so “admin-only by default” stays true. `apps/web/app/(api)/runs/[id]/trace/route.ts:41`.

4. Make “fixture mode” explicit
- Either:
  - Docs: add a short “fixture mode vs canonical mode” section to `docs/03-architecture/50_api_surface.md:5`.
  - Code: move fixture-backed versions under `/spikes/*` and keep canonical paths reserved for DB-backed implementations.

5. Close the largest structural drift: persist trust spine tables
- Extend `apps/web/lib/db.server.ts` to add `runs`, `run_steps`, `report_rows`, `citations`, `artefacts` as in `docs/03-architecture/30_data_model.md:18`.
- Migrate `GET /runs/:id/trace` and `POST /export/csv` to read from persisted run state.
