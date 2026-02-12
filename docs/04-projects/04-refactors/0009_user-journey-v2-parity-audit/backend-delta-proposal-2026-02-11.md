# Backend Delta Proposal (Case-by-Case)

Date: 2026-02-11
Scope: follow-up backend deltas for three flagged UI parity blockers

Reference alignment:
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md` (`N11`, `N12`, `N13`)
- Current routes:
  - `apps/web/app/(api)/folders/[id]/chat/route.ts`
  - `apps/web/app/(api)/folders/[id]/artefacts/route.ts`
  - `apps/web/app/(api)/citations/[id]/route.ts`
  - `apps/web/app/(api)/folders/[id]/runs/route.ts`

## Decision summary

1. `N11` (chat run scoping): backend change required, moderate, recommended now.
2. `N12` (clickable source chips): backend change required, staged.
   - Stage A (page-level jump): thin backend, recommended now.
   - Stage B (anchor-ready citation jump): moderate backend, later.
3. `N13` (artefact summary/provenance rollups): backend change required, thin, recommended now.

## 1) N11: Run-scoped chat (`POST /folders/:id/chat`)

### Current contract

- Request body:
  - `{ "message": string }`
- Stream events:
  - `meta(trace_id)`, `token`, `sources(document_id,page_number)`, `done`, `error`
- Retrieval uses `folders.latest_index_version` only.

### Proposed delta (additive)

Request body (v1 additive):

```json
{
  "message": "string",
  "run_id": "optional string"
}
```

Stream `meta` event (additive fields):

```json
{
  "type": "meta",
  "trace_id": "trc_*",
  "selected_run_id": "run_* | null",
  "effective_run_id": "run_* | null",
  "scope_mismatch": "boolean",
  "mismatch_reason": "null | run_not_found | run_not_completed | run_not_indexed"
}
```

Stream `sources` event (additive field):

```json
{
  "type": "sources",
  "sources": [
    {
      "document_id": "doc_*",
      "page_number": 1,
      "source_run_id": "run_* | null"
    }
  ]
}
```

### Behavior matrix (L1 soft fallback)

1. `run_id` missing:
   - `selected_run_id=null`
   - `effective_run_id = latest completed run for folder (or null)`
2. `run_id` exists, same folder, completed:
   - selected = effective = requested run
3. `run_id` exists but not completed:
   - fallback to latest completed run
   - `scope_mismatch=true`, `mismatch_reason=run_not_completed`
4. `run_id` not found / wrong folder:
   - fallback to latest completed run
   - `scope_mismatch=true`, `mismatch_reason=run_not_found`

Notes:
- This preserves current UX resilience and matches `SP-0009-01` (soft fallback + explicit mismatch disclosure).
- `L2` strict hard-fail behavior remains explicitly out of scope.

### Backend changes required

1. Extend `BodySchema` in `chat/route.ts` with optional `run_id`.
2. Resolve `effective_run_id` and `index_version` from `runs` table before retrieval.
3. Emit additive meta/source fields.
4. Extend `apps/web/lib/chat/protocol.ts` types/parser to include optional additive fields.

### Tests to add

1. `chat.routes.test.ts`:
   - run selected success
   - non-completed run fallback + mismatch metadata
   - missing run fallback + mismatch metadata
2. Stream contract parsing tests for optional meta/source fields.

## 2) N12: Clickable chat source chips

### Current contract

- Sources are non-clickable: `{ document_id, page_number }`.
- No evidence href or citation id is provided.

### Stage A (recommended now): page-level jump (thin backend)

Goal: make chips clickable immediately, even when anchor polygons are unavailable.

Additive `sources` fields:

```json
{
  "document_id": "doc_*",
  "page_number": 3,
  "source_run_id": "run_* | null",
  "anchor_state": "page_only",
  "evidence_href": "/matters/viewer?document_id=doc_*&page=3&run_id=run_*",
  "citation_id": null
}
```

Implementation notes:
- Add a page-level viewer route contract that can render document + page without citation anchors.
- Keep UI behavior: clickable when `evidence_href` exists; otherwise disabled with helper copy.

### Stage B (later): anchor-ready citation jump (moderate backend)

Goal: strict anchor-backed jump via existing evidence route.

Additive `sources` fields:

```json
{
  "anchor_state": "ready | missing",
  "citation_id": "cit_* | null",
  "evidence_href": "/evidence/cit_*",
  "anchor_reason": "null | no_anchor_mapping"
}
```

Backend deltas:
1. Persist chat source citations with deterministic IDs and `chat_message_id`.
2. Build anchor mapping from retrieval chunk metadata to evidence geometry (no fuzzy recovery in v1).
3. Use existing `GET /citations/:id` for trust payload and viewer load.

### Backend changes required

- Stage A: thin (new viewer contract + additive source fields).
- Stage B: moderate (citation persistence + anchor mapping pipeline).

### Tests to add

1. `chat.routes.test.ts`:
   - source payload includes `evidence_href` and `anchor_state`.
2. Viewer route tests:
   - page-level jump success
   - disabled/missing anchor state behavior.
3. Stage B:
   - citation creation and retrieval for chat-linked citations.

## 3) N13: Artefact summary + provenance rollups (`GET /folders/:id/artefacts`)

### Current contract

- Returns full list for folder, newest first.
- Includes `type`, `kind`, `source_run_id`, `download_url`.
- No summary block, no server filtering/pagination affordances.

### Proposed delta (thin, additive)

Query params (all optional):
- `type`
- `kind`
- `source_run_id`
- `safety` (`all|safe|unsafe`)
- `limit` (default 100, max 500)
- `cursor` (created_at/id cursor)
- `include_summary` (`0|1`, default `1`)

Response (additive):

```json
{
  "artefacts": [/* existing shape, filtered */],
  "summary": {
    "total": 12,
    "safe": 10,
    "unsafe": 2,
    "by_type": { "csv": 9, "docx": 3 },
    "by_kind": { "requirements_tracker": 3, "exceptions_table": 3, "survey_issues": 3, "memo": 3 },
    "by_run": [{ "run_id": "run_*", "count": 8 }, { "run_id": null, "count": 4 }],
    "latest_created_at": "2026-02-11T23:00:00.000Z"
  },
  "next_cursor": "opaque | null"
}
```

Notes:
- No schema migration needed.
- Keep `download_url` behavior unchanged (fresh signed URLs).
- Keeps UI route independent from list size and enables tab badges/freshness chips.

### Backend changes required

1. Extend artefacts route query parsing and SQL filters.
2. Add summary aggregation query.
3. Optional cursor-based pagination support.

### Tests to add

1. `artefacts.routes.test.ts`:
   - filter by `type/kind/source_run_id/safety`
   - summary correctness
   - cursor pagination behavior
   - signed download URL still present.

## Rollout plan (recommended order)

1. Ship `N11` first (run-scoped chat metadata + fallback signaling).
2. Ship `N13` second (artefact summary/filter API support).
3. Ship `N12 Stage A` third (clickable page-level source jumps).
4. Schedule `N12 Stage B` as explicit follow-up once anchor mapping scope is accepted.

## Explicit non-goals for this pass

1. `L2/L3` chat strict isolation or multi-run compare.
2. Fuzzy anchor recovery heuristics.
3. Backend-heavy workflow additions outside these three deltas.
