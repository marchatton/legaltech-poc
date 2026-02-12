# PRD: E2E-V3-0001 Shell Wayfinding Baseline

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0001-shell-wayfinding-baseline
Priority: P2

## Introduction / Overview

### Problem
Global shell orientation can regress subtly (active nav, environment posture, breadcrumbs, sticky IDs), causing operators to lose context while moving across list and detail surfaces.

### Goal
Define a deterministic E2E scenario that proves shell wayfinding stays stable and explicit through normal navigation.

### Slice
Validate v3 journey affordances U1-U4 (F1) across `P1 Global Shell` + matter list/detail transitions.

### Primary Observable Effect
A reviewer can move between matters and always see the same orientation contract: active nav state, environment badge, breadcrumb chain, and sticky identifiers.

### In Scope
- `U1`, `U2`, `U3`, `U4`
- `P1 -> P2 -> P4` navigation continuity
- Placeholder-disabled nav behavior for non-shipped tabs

## Goals

- Lock shell navigation and wayfinding as a deterministic baseline.
- Prevent silent regressions in environment posture signaling.
- Ensure object identity remains visible during cross-page movement.

## User Stories

### US-001: Persistent Wayfinding Contract
As an operator, I want persistent wayfinding in the shell so I can navigate without losing context.

#### Acceptance Criteria
- AC-001 (Given): Given demo mode is enabled and at least one matter exists, opening `/matters` renders the shell with `Matters` active.
- AC-002 (When): When the operator opens a matter detail and returns to list, the shell preserves navigation state and route context.
- AC-003 (Then): Then environment badge, breadcrumb chain, and sticky identifiers are visible and non-empty on list/detail surfaces.
- AC-004 (Example): Example: badge shows `demo-dev` (or `demo-prod`) and breadcrumb includes `Matters > <Matter Name>` on detail.
- AC-005 (Negative): Negative: clicking placeholder tabs (`Runs`, `Alerts`, `Settings`) must not navigate to broken routes or ambiguous empty pages.

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_01_clean --overwrite`
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for shell nav active state + breadcrumb + badge + sticky IDs.
- Manual checks:
  - Navigate `/matters` -> open matter -> back to list and confirm shell continuity.

## Functional Requirements

- FR-001: Shell must render explicit active state for current primary destination.
- FR-002: Environment posture badge must render deterministic environment value.
- FR-003: Breadcrumb chain must represent current navigation hierarchy.
- FR-004: Sticky identifiers must show current `matter_id` and `run_id` when available.

## Non-Goals (Out of Scope)

- Implementing functional destinations for placeholder tabs.
- Redesigning shell visual style.

## Failure States & UX

- Missing environment posture: show deterministic fallback label (`unknown environment`).
- Missing entity identity: render explicit placeholder text (`id unavailable`) rather than blank UI.

## Metrics / Logging

- Success signals:
  - Wayfinding regressions caught before merge.
- Debug signals:
  - Structured UI event for nav route transitions and breadcrumb render failures.

## Rollback / Disable Plan

- Feature flag fallback to existing shell if new wayfinding contract fails smoke checks.

## Risks & Dependencies

- Risk: Placeholder tab behavior may drift from disabled contract.
- Dependency: Stable route metadata for list and detail surfaces.

## Success Metrics

- Shell contract U1-U4 is verifiable by deterministic E2E checks.
- No ambiguous orientation state across list/detail traversal.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/page.tsx`
- `apps/web/app/DemoToolbar.tsx`
- `apps/web/app/(app)/matters/page.tsx`
