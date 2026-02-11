# PRD: E2E-V3-0004 Drawer-First Review Decisions

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0004-drawer-first-review-decisions
Priority: P1

## Introduction / Overview

### Problem
Review decision actions are high-frequency and must be centralized; regressions in drawer behavior or row mutation feedback create hidden state errors.

### Goal
Define a deterministic E2E scenario proving row drawer decisions (`mark reviewed`, `flag issue`, `copy extracted answer`) execute with immediate, explicit feedback.

### Slice
Validate v3 affordances U17-U20 + U18 decision actions (F4), backed by row mutation contract `N9`.

### Primary Observable Effect
A reviewer opens a row decision surface, executes actions, and sees immediate status updates or deterministic errors.

### In Scope
- Open row drawer from report row
- Decision actions and copy affordance
- Mutation success/failure feedback contract

## Goals

- Ensure row decision operations are explicit and reversible.
- Ensure no silent mutation failures.
- Preserve row context while using drawer.

## User Stories

### US-001: Execute Review Decisions from Drawer with Explicit Feedback
As a reviewer, I want to complete row decisions from one surface so I can move quickly without losing context.

#### Acceptance Criteria
- AC-001 (Given): Given a row with `needs_review`, opening row details launches drawer with row payload and decision controls.
- AC-002 (When): When `mark reviewed` or `flag issue` is triggered, row status updates in list and drawer reflects final state.
- AC-003 (Then): Then `copy extracted answer` copies deterministic row answer content to clipboard with visible confirmation.
- AC-004 (Example): Example: `mark reviewed` changes row chip from `needs_review` to `reviewed` without full-page refresh.
- AC-005 (Negative): Negative: if mutation API returns error, UI renders `ErrorBanner` with code/trace and does not pretend success.

#### Verification
- Pack/fixture/script:
  - Seed report rows containing mutable statuses
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for drawer open, action success, clipboard success, mutation failure branch.
- Manual checks:
  - Open row drawer, execute all actions, validate status/copy/error feedback.

## Functional Requirements

- FR-001: Row drawer opens from report table with full row context.
- FR-002: Decision actions call mutation endpoint with deterministic payload.
- FR-003: Mutation results must update UI state immediately.
- FR-004: Clipboard action must expose explicit success/failure message.

## Non-Goals (Out of Scope)

- Citation verification viewer controls.
- Multi-reviewer assignment workflows.

## Failure States & UX

- Mutation fails: show deterministic error + retry path.
- Clipboard unavailable: show user-visible fallback message.

## Metrics / Logging

- Success signals:
  - Decision completion time per row.
- Debug signals:
  - Mutation error codes by action type.

## Rollback / Disable Plan

- Feature-flag drawer actions off and fallback to read-only row details.

## Risks & Dependencies

- Risk: Optimistic UI desync with backend status.
- Dependency: Stable `PATCH` row mutation contract.

## Success Metrics

- One E2E scenario validates full row decision loop and failure handling.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(api)/folders/[id]/report/route.ts`
- `apps/web/app/(app)/matters/actions.ts`
