# PRD: E2E-V3-0008 L1 Run-Scoped Chat

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0008-l1-run-scoped-chat
Priority: P1

## Introduction / Overview

### Problem
Run-scoped chat trust can regress when selected/effective scope diverges, source chips bypass anchor gating, or no-context states are unclear.

### Goal
Define a deterministic E2E scenario proving L1 run-scoped chat behavior, mismatch disclosure, and anchor-gated source linking.

### Slice
Validate v3 affordances U37-U43 (F8) with chat scope metadata contract.

### Primary Observable Effect
Operators can chat in explicit run context and reliably understand when scope differs or evidence links are unavailable.

### In Scope
- Run chip + completed run picker
- Chat composer and streaming state
- Source chips strict anchor gating
- Selected vs effective run mismatch warning
- No-context disabled input guidance

## Goals

- Keep chat context explicit and trustworthy.
- Prevent misleading source-link behavior.
- Enforce no-context guard rails.

## User Stories

### US-001: Ask in Run Scope with Explicit Scope and Source Behavior
As an operator, I want chat responses tied to a known run so I can trust the answer scope and evidence links.

#### Acceptance Criteria
- AC-001 (Given): Given a folder with completed runs, chat shows run picker and defaults to most recent completed run.
- AC-002 (When): When a question is submitted, UI shows streaming state and then final response with source chips.
- AC-003 (Then): Then source chips are clickable only for anchor-ready citations; disabled chips explain why.
- AC-004 (Example): Example: when selected run is stale, UI shows `selected vs effective` mismatch disclosure from response metadata.
- AC-005 (Negative): Negative: when no indexed context exists, composer is disabled and guidance copy is shown instead of sending requests.

#### Verification
- Pack/fixture/script:
  - Seed folder with completed run(s) and no-context case fixture
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for picker defaulting, stream state, mismatch warning, anchor-gated chips, disabled composer path.
- Manual checks:
  - Ask question under normal and no-context cases.

## Functional Requirements

- FR-001: Chat request includes selected run context; response returns effective run context.
- FR-002: UI must surface scope mismatch disclosure when selected != effective.
- FR-003: Source chips must enforce strict anchor-ready clickability.
- FR-004: Composer must be disabled with guidance when no context exists.

## Non-Goals (Out of Scope)

- L2/L3 compare/merge chat scope modes.
- Citation-anchor fuzzy fallback.

## Failure States & UX

- Streaming failure: deterministic `ErrorBanner` with retry when retryable.
- Missing scope metadata: explicit fallback message and support path.

## Metrics / Logging

- Success signals:
  - Chat completion rate with valid scope metadata.
- Debug signals:
  - Scope mismatch frequency and anchor-disabled chip reasons.

## Rollback / Disable Plan

- Disable scoped chat enhancements and fallback to minimal chat surface.

## Risks & Dependencies

- Risk: Scope metadata drift between API and UI.
- Dependency: Stable chat stream protocol + citation contracts.

## Success Metrics

- E2E catches scope-trust regressions and broken source gating.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
- `apps/web/app/(api)/folders/[id]/chat/route.ts`
- `apps/web/lib/chat/protocol.ts`
