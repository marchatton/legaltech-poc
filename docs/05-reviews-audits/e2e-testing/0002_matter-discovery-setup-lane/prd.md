# PRD: E2E-V3-0002 Matter Discovery + Setup Lane

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: e2e-v3-0002-matter-discovery-setup-lane
Priority: P1

## Introduction / Overview

### Problem
The discovery/setup lane is a frequent failure point: search/filter/create/open/upload/readiness can break independently and strand users before any run can start.

### Goal
Define a deterministic E2E scenario proving that users can discover a matter, create/open it, upload documents, and receive explicit readiness guidance.

### Slice
Validate v3 affordances U5-U12 (F2) across list and setup surfaces, including upload contract transitions.

### Primary Observable Effect
An operator can go from search to setup completion with explicit status and next-action guidance.

### In Scope
- `U5`..`U12`
- `N1`..`N5` (list/create/documents/upload-init/upload-complete)
- Readiness reasons and setup handoff copy

## Goals

- Keep matter discovery actions deterministic and fast.
- Prove setup/upload transitions are explicit and observable.
- Ensure readiness reasons are user-facing and actionable.

## User Stories

### US-001: Discover, Create, Upload, and Reach Readiness Guidance
As an operator, I want to discover or create a matter and upload documents so I can proceed to run execution with confidence.

#### Acceptance Criteria
- AC-001 (Given): Given seeded data plus a valid upload file, `/matters` supports search query and saved-view filtering without blank/ambiguous state.
- AC-002 (When): When the operator creates a new matter with a valid name and uploads a document, setup rows transition through ingest statuses.
- AC-003 (Then): Then readiness reasons surface one of `ready`, `blocked`, or `already complete` with explicit next-action copy.
- AC-004 (Example): Example: missing required docs shows `blocked` and copy instructing next upload/index step.
- AC-005 (Negative): Negative: submitting create without a required matter name must fail with user-visible validation and no matter created.

#### Verification
- Pack/fixture/script:
  - `pnpm fixture:seed pack_01_clean --overwrite`
  - `pnpm dev`
- Automated checks:
  - `pnpm lint`
  - `pnpm typecheck`
  - `pnpm test`
  - Browser E2E assertions for search/filter/create/upload/readiness state transitions.
- Manual checks:
  - Create matter -> upload doc -> verify readiness reason text and next-action.

## Functional Requirements

- FR-001: Matters list must apply search + saved-view filters deterministically.
- FR-002: Matter creation requires explicit non-empty name validation.
- FR-003: Setup must render document readiness rows from API model.
- FR-004: Upload init/complete transitions must produce visible state changes.
- FR-005: Readiness reasons must include clear next action.

## Non-Goals (Out of Scope)

- Full checklist backend orchestration state machine.
- Bulk upload/resumable upload enhancements.

## Failure States & UX

- Upload failure: deterministic `ErrorBanner` + retry action.
- Readiness blocked: actionable copy, not disabled-only control.

## Metrics / Logging

- Success signals:
  - Matter setup completion rate.
- Debug signals:
  - Upload init/complete failures with safe error envelope codes.

## Rollback / Disable Plan

- Fallback to prior setup lane if upload/readiness contract fails.

## Risks & Dependencies

- Risk: Upload and readiness states can drift from backend ingest facts.
- Dependency: Contract stability for `GET/POST /folders` and document upload endpoints.

## Success Metrics

- One deterministic E2E flow covers discover -> create/open -> upload -> readiness guidance.

## Open Questions

- None.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.svg`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3-wiring.txt`
- `apps/web/app/(api)/folders/route.ts`
- `apps/web/app/(api)/folders/[id]/documents/route.ts`
- `apps/web/app/(api)/documents/[id]/upload/route.ts`
- `apps/web/app/(api)/documents/[id]/complete/route.ts`
