# PRD: Citations DB-First + Unified Associations (Workstream E)

Owner: marc  
Status: Draft  
Date: 2026-02-10  
Slug: citations-db-first

## Introduction / Overview

### Problem
`GET /citations/:id` is currently fixture-backed and gated to dev/demo-prod (`apps/web/app/(api)/citations/[id]/route.ts`). This blocks:
- trustworthy sources for chat beyond fixture packs
- using the citations contract as a real primitive for uploaded documents

Additionally, the `citations` table currently only supports report-row association (`report_row_id` is required). PRD B requires citations to also attach to chat assistant messages with a strict one-of association (`report_row_id` XOR `chat_message_id`).

### Goal
Make `GET /citations/:id` **DB-first** for real documents, with fixture fallback only where explicitly allowed (dev/demo packs), and update the citations schema so it can associate to either report rows or chat messages without creating a parallel citation system.

Ship posture:
- Keep DB-first citations behind `FEATURE_CITATIONS_API` (default off) until RH3 evidence is recorded (per `0001c`).

### Primary Observable Effect
- When `FEATURE_CITATIONS_API=1`:
  - If a citation exists in Postgres, `GET /citations/:id` returns it in all runtime modes (no dev-only gating for DB rows).
  - If a citation does not exist in Postgres:
    - in `ORBITAL_MODE=dev|demo-prod`: the endpoint may fall back to fixture seed snapshots for demo packs
    - in `ORBITAL_MODE=prod`: the endpoint returns `404 NOT_FOUND` (no fixture fallback)
  - `citations` supports exactly one association: `report_row_id` OR `chat_message_id`.
- When `FEATURE_CITATIONS_API=0`:
  - Preserve the current fixture-backed behavior (dev/demo-prod only) while the trust substrate is still NO-GO (RH3 incomplete).

## Goals
- DB-first citations fetch: stable, safe, and consistent response shape with the API surface doc.
- Fixture fallback is explicit and constrained (dev/demo packs only).
- Unified association model supports both report rows and chat messages (one-of constraint).
- Schema changes are idempotent under runtime DDL (safe to run multiple times).

## Non-goals (explicit cuts)
- Do not implement “citation locking” (chunk_id -> snippet/hash/polygons) in this PRD; only storage/read-path hardening.
- Do not implement chat tables or chat APIs (owned by PRD B).
- Do not implement geometry/OCR; v0 still supports coarse page-level polygons where needed.
- Do not add auth/RBAC.

## Users
- Reviewer: clicks sources and expects evidence to load reliably (not fixture-only).
- Developer: wants one citations primitive for multiple features (Quick Start, chat).
- Operator (demo-prod): wants fixture demos to still work without weakening prod posture.

## User Stories

### US-001: `GET /citations/:id` reads Postgres first (DB-first)
As a user, I want a citation id to resolve to a real locked citation from Postgres so that evidence viewing works for uploaded documents, not only fixtures.

#### Acceptance Criteria
- AC-001: `GET /citations/:id` attempts to load the citation from Postgres by `citations.id`.
  - Example: Insert a citation row in Postgres and `GET /citations/:id` returns it with `{citation: {id, document_id, page_number, polygons, snippet, snippet_hash}}`.
  - Negative: the handler does not require `ORBITAL_MODE=dev|demo-prod` to serve DB-backed citations.
- AC-002: Response shape matches `docs/03-architecture/50_api_surface.md` and remains safe (no internal details).
- AC-003: Not found in Postgres returns `404 NOT_FOUND` unless fixture fallback is allowed (US-002).

#### Verification
- Automated: route unit/integration test with a seeded DB citation row.
- Manual: create one citation row locally and confirm endpoint serves it.

### US-002: Fixture fallback is allowed only in dev/demo-prod (explicit)
As an operator, I want fixture citations to keep working in dev/demo-prod for demos, but never leak into prod behavior.

#### Acceptance Criteria
- AC-004: If the citation id is not found in Postgres, the handler may fall back to fixture seed snapshots only when `ORBITAL_MODE` is `dev` or `demo-prod`.
  - Example: in dev, a known fixture citation id resolves via seed snapshots (existing behavior).
  - Negative: in prod mode, fixture fallback is disabled and the endpoint returns 404.
- AC-005: Ambiguous fixture ids across packs still return `409 CONFLICT` with a safe envelope (existing behavior preserved).

#### Verification
- Automated: tests that force mode to `prod` and assert fixture ids return 404.
- Manual: dev mode fixture citation still loads.

### US-003: Citations have a unified association model (report row XOR chat message)
As a developer, I want citations to be attachable to either report rows or chat assistant messages so we can reuse the same `GET /citations/:id` primitive everywhere.

#### Acceptance Criteria
- AC-006: Schema supports `chat_message_id` association and allows `report_row_id` to be nullable.
- AC-007: A strict one-of constraint exists: exactly one of `report_row_id` or `chat_message_id` is set.
  - Example: inserting a citation with `report_row_id` succeeds.
  - Example: inserting a citation with `chat_message_id` succeeds.
  - Negative: inserting a citation with both set (or neither set) fails.
- AC-008: Index exists for looking up citations by `chat_message_id` for rendering “Sources” in chat.

#### Verification
- Automated: schema/DDL tests (or a DB-level smoke test) that validates the constraint and index.

## Functional Requirements
- FR-001: Update `GET /citations/:id` implementation:
  - DB-first lookup by id
  - fixture fallback only in `ORBITAL_MODE=dev|demo-prod`
  - preserve safe error envelope behavior
- FR-002: Update core schema to support unified associations:
  - add `citations.chat_message_id` (nullable text)
  - make `citations.report_row_id` nullable
  - add a check constraint enforcing exactly-one-of association
  - add index on `citations.chat_message_id`
- FR-003: DDL must be idempotent under runtime schema ensure (safe to run multiple times).
- FR-004: Gate DB-first citations behavior behind `FEATURE_CITATIONS_API` (default off until RH3 evidence is recorded).

## Failure States + UX
- Citation not found: `404 NOT_FOUND`.
- Ambiguous fixture citation id (dev/demo-prod only): `409 CONFLICT`.
- Invalid route params: `400 VALIDATION_ERROR`.

## Metrics / Logging
- Log `citations.get` with `{ source: "db" | "fixture", citation_id, trace_id }`.
- Log `citations.not_found` with `{ source_attempted: ["db", "fixture?"] }`.

## Rollback / Disable Path
- Disable: set `FEATURE_CITATIONS_API=0` to revert to fixture-only behavior.
- Safe rollback: revert to fixture-only implementation, but this should be avoided once chat depends on DB-first behavior.
- If needed, we can temporarily keep the fixture fallback while DB citations adoption ramps; prod posture remains “no fixture fallback”.

## Quality Gates
- `pnpm --filter @orbital-poc/web typecheck`
- `pnpm --filter @orbital-poc/web test`
- `pnpm verify`

## Verification Plan
Automated:
- Insert a DB citation in a test DB and assert `GET /citations/:id` returns DB-backed payload in all modes.
- Force `ORBITAL_MODE=prod` and assert fixture ids do not resolve.
- Constraint tests for the one-of association on `citations`.

Manual smoke:
1. `pnpm dev`
2. Ensure DB has 1 citation row; hit `GET /citations/:id` and confirm DB response.
3. In dev, hit a fixture citation id and confirm fixture fallback still works.
4. Set `ORBITAL_MODE=prod` and confirm fixture citation ids return 404.

## Risks & Dependencies
- Runtime DDL: adding constraints idempotently may require `DO $$ ... $$` blocks (Postgres does not support `ADD CONSTRAINT IF NOT EXISTS`).
- Chat PRD B will depend on `chat_message_id` association being available; foreign keys to chat tables can be added later when chat schema exists.
- Depends on RH3 evidence for snippet hashing stability (`0001c`); keep `FEATURE_CITATIONS_API` off until RH3 is complete.

## Open Questions
- Do we want to add a foreign key for `citations.chat_message_id` once `chat_messages` exists (likely yes; follow-up slice)?

## Sources
- `docs/03-architecture/50_api_surface.md` (citation response shape)
- `docs/04-projects/02-features/0001_trust-substrate/prds/0001c_citations-api-locking/prd.md` (NO-GO until RH3; feature flag gating)
- `docs/04-projects/02-features/0011_chat_interface/plan.program-sequencing.md` (Workstream E)
- `docs/04-projects/02-features/0011_chat_interface/prds/0011b_matter-chat-v0/prd.md` (requires unified association)
- `apps/web/app/(api)/citations/[id]/route.ts` (current fixture-backed implementation)
