# PRD: E2E-V3-0010 Cross-Surface Error Contract

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0010-cross-surface-error-contract
Priority: P0

## Introduction / Overview

### Problem
Inconsistent error handling across surfaces destroys trust. Every failure needs deterministic `code`, optional `trace_id`, retry semantics, and support escalation behavior.

### Goal
Define a deterministic E2E scenario validating shared ErrorBanner contract across key user surfaces.

### Slice
Validate v3 affordances U50-U52 (F10) and safe error envelope usage.

### Primary Observable Effect
Across run start, export, chat, and artefact actions, errors are rendered consistently with deterministic retry/support behavior.

### In Scope
- Shared `ErrorBanner` rendering contract
- Retry CTA gated by `retryable`
- Support escalation action (`Need help?`) with safe context
- Fallback support guidance when support target missing

## Goals

- Enforce one failure language across all surfaces.
- Make retry behavior predictable and safe.
- Ensure support escalation includes safe context only.

## User Stories

### US-001: Deterministic Error + Retry + Support Across Surfaces
As an operator, I want all failures to look and behave the same so I can recover quickly and escalate with the right context.

#### Acceptance Criteria
- AC-001 (Given): Given representative failures are triggered on at least three surfaces (e.g., export, quick start, chat), each renders ErrorBanner.
- AC-002 (When): When response includes `retryable: true`, Retry CTA appears and replays the action idempotently.
- AC-003 (Then): Then `Need help?` opens configured support channel with safe context fields (`code`, `trace_id`, `route`).
- AC-004 (Example): Example: non-retryable validation error shows code/message and support action, but hides Retry CTA.
- AC-005 (Negative): Negative: if support target is not configured, UI must show fallback guidance with copyable identifiers, not a broken support link.

#### Verification
- Pack/fixture/script:
  - `pnpm dev`
  - Toggle support env configured/unconfigured paths
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for retryable and non-retryable branches + support configured/unconfigured branches.
- Manual checks:
  - Trigger representative errors and inspect banner parity.

## Functional Requirements

- FR-001: ErrorBanner must render deterministic `code` and message for all surfaces.
- FR-002: Retry CTA appears only when `retryable === true` and handler exists.
- FR-003: Support CTA uses configured target and includes safe context only.
- FR-004: Missing support config renders fallback guidance with copyable identifiers.

## Non-Goals (Out of Scope)

- Custom per-surface error UI variants.
- External ticketing integrations beyond mailto/fallback guidance.

## Failure States & UX

- Retry action throws: keep banner visible with updated failure state.
- Malformed error envelope: show safe generic fallback with deterministic code.

## Metrics / Logging

- Success signals:
  - Error recovery completion rate after Retry.
- Debug signals:
  - Banner render coverage by surface and missing-trace occurrences.

## Rollback / Disable Plan

- Fallback to legacy error blocks if shared banner parity regresses.

## Risks & Dependencies

- Risk: Surfaces bypassing shared error component over time.
- Dependency: Consistent safe-error envelope contract in APIs.

## Success Metrics

- E2E detects any divergence from deterministic error/retry/support contract.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/ui/ErrorBanner.tsx`
- `apps/web/lib/safeErrorDisplay.ts`
- `apps/web/app/(app)/matters/ExportCsvButton.tsx`
- `apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx`
- `apps/web/app/(app)/matters/[id]/ChatPanel.tsx`
