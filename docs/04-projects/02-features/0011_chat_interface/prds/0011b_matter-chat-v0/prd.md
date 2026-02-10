# PRD: 0011b Matter Chat v0 (Streaming + Locked Sources)

Owner: marc
Status: Draft
Date: 2026-02-09
Slug: 0011b_matter-chat-v0

## Introduction / Overview

### Problem
Orbital has Matter ingest and a trust posture that depends on evidence, but there is no chat UI to ask questions and get grounded answers with sources.

Current code reality:
- Matter UI is dev-only today (`apps/web/app/(app)/matters/*` uses `assertDevOnly()`).
- Evidence viewer + citations are fixture-backed and dev-only (`GET /citations/:id` via seed snapshots).
- WDK orchestration and AI SDK flows are target posture, not implemented today (`docs/03-architecture/07_current_poc_runtime.md`).

### Goal
Provide a per-matter chat experience that streams assistant responses and locks sources per assistant message, aligned to the “evidence-first” contract.

### Slice
Add a thin chat v0:
- chat persistence (threads/messages/citations)
- chat API endpoint to post a message and stream an assistant response
- locked sources rendered under assistant messages
- evidence viewer page for chat citations (must not conflict with existing `/citations/:id` API route)

### Primary Observable Effect
Before: no chat; no evidence-backed Q&A.  
After: on a Matter page, users can send a message and receive a streaming response with clickable “Sources” that open a PDF viewer at the cited page.

### In Scope
- New chat tables: `chat_threads`, `chat_messages`.
- Extend existing `citations` to support chat citations (unified citations table).
- `POST /folders/:id/chat` to send messages and stream assistant response.
- `GET /citations/:id` to fetch locked citations (used for both report rows and chat).
- UI chat panel in Matter view + evidence viewer page at a non-conflicting route (recommend: `/evidence/:id`).
- Coarse page-level highlight polygons until OCR/layout geometry lands.

## Goals
- Streaming response feels immediate and does not require a page reload.
- Every assistant message either:
  - provides locked sources (citations), or
  - returns the exact missing-evidence string: `Not found in provided documents.`
- Citations are locked and immutable per assistant message (no silent mutation).
- Integration stays thin and explicit (safe errors, Zod boundaries, minimal new surface area).

## User Stories

### US-001: Send A Chat Message And Receive A Streaming Reply
As a user, I want to ask a question in a Matter chat and receive a streaming reply, so that I can explore the documents quickly.

#### Acceptance Criteria
- AC-001: On a Matter page, a chat panel renders:
  - a thread list (titles)
  - a message list for the selected thread
  - an input
- AC-002: Submitting a message calls `POST /folders/:id/chat` (with a thread id) and the assistant response streams to the UI.
- AC-003: Messages are persisted:
  - user message inserted immediately
  - assistant message starts as `streaming` then becomes `complete`
- AC-004: Users can create and switch threads within a matter; thread titles are derived from the first user message (truncated) in v0.

#### Verification
- Manual: in dev mode, open a seeded folder, send a message, observe streaming, refresh and confirm messages persist.
- Automated: a route handler unit/integration test validates request parsing and safe error envelope on invalid input.

### US-002: Assistant Messages Have Locked Sources With Evidence Viewer
As a user, I want to click a source under an assistant message and open a PDF viewer at the cited evidence, so that I can verify the answer.

#### Acceptance Criteria
- AC-005: Each assistant message renders a “Sources” section containing citation chips (doc/page labels).
- AC-006: Clicking a citation chip navigates to `/evidence/:id` (or similar) and loads:
  - citation payload from `GET /citations/:id`
  - render_url from `GET /documents/:id/render?page=N`
  - pdf.js viewer with a highlight overlay
- AC-007: With no geometry available, v0 citations store a full-page polygon:
  - `[[[0,0],[1,0],[1,1],[0,1]]]`
  and UI labels the highlight as “page-level”.

#### Verification
- Manual: send a question with at least one retrieval hit; click a source; viewer loads and highlights the page.
- Negative: corrupt citation id yields a safe “not found” UI state (no blank page).

### US-003: Evidence-First Behaviour And Safe Failures
As a user, I want the assistant to be honest about missing evidence and for failures to be explicit, so that the system remains trustworthy.

#### Acceptance Criteria
- AC-008: If retrieval returns no chunks, assistant responds exactly `Not found in provided documents.` and sources are empty.
- AC-009: If the model call fails mid-stream, the assistant message is marked with a terminal failure status and UI shows an explicit error state (no silent failure).
- AC-010: All API errors return the standard safe error envelope; no stack traces or provider payloads are returned to clients.

#### Verification
- Manual: simulate a folder with no chunks; observe exact answer string.
- Manual: simulate an internal error (dependency missing) and confirm safe error envelope and explicit UI failure state.

## Technical Considerations (Pinned Details)

### Model + prompt behavior

- Model (via AI Gateway): default chat model `anthropic/claude-haiku-4.5`.
- System behavior:
  - “Answer using only the provided sources.”
  - “If not supported, say exactly: `Not found in provided documents.`”
  - “Be concise.”

### WDK run shape (target posture)

Key constraint:
- Streams are writable inside steps only (workflow context cannot read/write streams).

v0 shape:
- One workflow per assistant response.
- Suggested step sequence:
  1) `load_thread_context` (fetch last N messages)
  2) `hybrid_retrieve` (call `hybridSearch()`)
  3) `hydrate_chunks` (fetch chunk text + doc/page metadata)
  4) `stream_answer` (model streaming writes tokens)
  5) `lock_citations` (persist `citations`)
  6) `finalise_message` (mark complete)

Idempotency:
- Use deterministic `step_key`s to avoid duplicate writes on retries.

### Route conflicts

- The API route `GET /citations/:id` already exists.
- Therefore: do not create a UI page at `/citations/:id`.
- Use `/evidence/:id` (or similar) for the chat evidence viewer page.

## Functional Requirements
- FR-001: Chat API input validation uses Zod and fails closed with safe error envelopes.
- FR-002: Assistant must be prompted to answer using only retrieved sources; missing evidence yields the exact string `Not found in provided documents.`.
- FR-003: Locked citations are immutable and stored in the existing `citations` table (unified citations), with a strict one-of association (either `report_row_id` or `chat_message_id`).
- FR-004: Evidence viewer route must not conflict with the existing `/citations/:id` API route; use `/evidence/:id` (or equivalent).
- FR-005: Chat can be feature-flagged and enabled in dev first; allow enabling in demo-prod mode explicitly via `ORBITAL_MODE=demo-prod`.

## Non-Goals (Out of Scope)
- Cross-matter chat.
- Inline citations inside the assistant text (sources are rendered separately in v0).
- Precise OCR geometry highlights.
- Reranking or advanced retrieval quality tooling.
- Full auth/RBAC.

## Failure States & UX
- Retrieval empty: assistant responds `Not found in provided documents.`; sources empty.
- Citation fetch fails: evidence viewer shows explicit “citation not found” state.
- Render_url fetch fails: evidence viewer shows explicit “unable to load PDF” state.

## Metrics / Logging
- Log per assistant message:
  - retrieval latency + hit counts
  - model latency (start->complete)
  - success/failure counts by safe error code

## Rollback / Disable Plan
- Gate chat behind an env flag (e.g. `CHAT_ENABLED=1`) and allow it only in `ORBITAL_MODE=dev` or `ORBITAL_MODE=demo-prod` (default to locked down when unset/`prod`).
- Safe fallback: hide chat panel and return 404/disabled response for chat endpoints when disabled.

## Risks & Dependencies
- Depends on `0011a` hybrid retrieval substrate.
- WDK + AI SDK are target posture; integration must remain thin and should not require refactoring the existing durable job queue.
- Dev-only route migration is in progress elsewhere; this PRD must not accidentally deepen drift.

## Success Metrics
- A user can ask a question and receive a streaming reply in < 2 seconds to first token (on dev laptop).
- At least one meaningful source is attached and is clickable to an evidence viewer.
- When evidence is missing, the exact missing-evidence string is used and sources are empty.

## Decisions (Resolved)
- Enablement: dev-first, but support production-build demos by allowing chat when `ORBITAL_MODE=demo-prod` (behind an explicit enable flag).
- Threads: multiple threads per matter, with a thread list and titles (v0 titles derived from first user message, truncated).
- Citations: unify chat citations with the existing `citations` table (no separate `chat_citations` table).

## Sources
- `docs/00-strategy/initiatives/100_chat_interface/100_chat_interface.md`
- `docs/04-projects/02-features/0011_chat_interface/plan.ms-0011b_matter-chat-v0.md`
- `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- `docs/03-architecture/07_current_poc_runtime.md`
- `docs/03-architecture/50_api_surface.md`
