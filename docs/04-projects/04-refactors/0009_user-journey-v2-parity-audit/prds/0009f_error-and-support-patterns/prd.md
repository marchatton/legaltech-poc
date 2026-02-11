# PRD: Cross-Surface Error and Support Pattern Parity (0009f)

Owner: marc
Status: Draft
Date: 2026-02-11
Slug: error-and-support-patterns

## Introduction / Overview

### Problem
Error handling is currently fragmented across surfaces: deterministic codes and retry/support guidance are inconsistent, and escalation flows are missing.

### Goal
Standardize fail-loud, user-safe error behavior across matter setup, report, exports, artefacts, and chat.

### Slice
Define shared error envelope behavior and implement reusable `ErrorBanner` UX with retry/support action patterns.

### Primary Observable Effect
Users see consistent, actionable error panels with deterministic codes and recovery/escalation options across all major matter workflows.

### In Scope
- U50-U52
- W-A12
- N14

## Goals

- Standardize deterministic error payload fields used by UI.
- Implement cross-surface reusable ErrorBanner pattern.
- Provide explicit retry and support escalation actions where appropriate.
- Preserve safe error disclosure boundaries (no internal leak).

## User Stories

### US-001: Shared deterministic error envelope contract
As an operator, I want error responses to be consistent so I can understand failures and communicate support details.

#### Acceptance Criteria
- AC-001: Shared envelope includes `code`, `trace_id`, `retryable`, and optional `support_hint`.
  - Example: blocked export error returns deterministic `code` and `trace_id` shown in UI.
  - Negative: raw internal stack/provider payload is never exposed to client.
- AC-002: Envelope contract is used across key routes (chat, report mutations, exports, uploads).
  - Example: each surface maps envelope fields to the same UI banner format.
  - Negative: per-route custom payloads that omit deterministic code are not acceptable.

#### Verification
- Pack/fixture/script: forced error responses across chat/report/export/upload endpoints.
- Automated checks: contract tests for shared error schema.
- Manual checks: inspect UI behavior for each surface.

### US-002: Reusable ErrorBanner component across surfaces
As an operator, I want one consistent error panel pattern so I can recover quickly regardless of where failures occur.

#### Acceptance Criteria
- AC-003: ErrorBanner component supports deterministic title/body/code display and optional retry CTA.
  - Example: chat transient failure shows retry button with same banner structure as export failure.
  - Negative: each surface creating bespoke incompatible banners is not allowed.
- AC-004: ErrorBanner is integrated into matter setup, report drawer actions, exports/artefacts, and chat.
  - Example: report mutation failure and upload failure share same visual/error hierarchy.
  - Negative: any critical surface without banner fallback is incomplete.

#### Verification
- Pack/fixture/script: UI error injection path per major surface.
- Automated checks: component tests + integration smoke tests.
- Manual checks: cross-surface visual/behavioral consistency.

### US-003: Support escalation action pattern
As an operator, I want a support escalation action when retry is insufficient so blockers can be triaged quickly.

#### Acceptance Criteria
- AC-005: Banner supports `Need help?` escalation action with deterministic context payload (`code`, `trace_id`, route).
  - Example: click opens configured support target with prefilled context.
  - Negative: escalation action cannot leak internal sensitive payload beyond safe identifiers.
- AC-006: Escalation target is configurable and can be disabled safely.
  - Example: when support target is unset, banner shows fallback instructions.
  - Negative: dead link or silent no-op escalation action is not acceptable.

#### Verification
- Pack/fixture/script: configured and unconfigured support target scenarios.
- Automated checks: escalation link payload tests.
- Manual checks: escalate from at least two surfaces.

### US-004: Cross-surface retry semantics alignment
As an operator, I want retry behavior to be predictable so I can recover without guessing.

#### Acceptance Criteria
- AC-007: Retry actions appear only for retryable errors and invoke idempotent retry flow.
  - Example: transient chat failure offers retry; validation failure does not.
  - Negative: retry CTA must not appear for non-retryable deterministic validation errors.
- AC-008: Retry interactions are instrumented consistently.
  - Example: retry click emits standard event payload regardless of surface.
  - Negative: missing retry analytics on one surface is not acceptable.

#### Verification
- Pack/fixture/script: retryable and non-retryable error fixtures.
- Automated checks: retry visibility/action tests.
- Manual checks: validate retry matrix across surfaces.

## Functional Requirements

- FR-001: Standardize safe error envelope schema usage in targeted API routes.
- FR-002: Build and integrate reusable ErrorBanner component.
- FR-003: Implement support escalation action strategy and fallback behavior.
- FR-004: Normalize retry behavior by `retryable` flag semantics.

## Non-Goals (Out of Scope)

- Building a full external incident/ticketing platform integration.
- Exposing internal exception payloads to users.
- Replacing backend logging infrastructure.

## Technical Considerations

- Reuse `packages/core/src/safe-error.ts` conventions.
- Keep envelope additive and backward-safe where existing handlers return compatible shapes.
- Support escalation target is configured via `ORBITAL_SUPPORT_MAILTO`.
- Mailto template is deterministic and safe-only:
  - Subject: `[Orbital] {{code}} (trace {{trace_id}})`
  - Body: route, action, timestamp, code, trace_id, and user-entered notes only.
- Ensure support action payload contains only safe identifiers.

## Failure States & UX

- Escalation target unavailable -> fallback support instructions with copyable code/trace.
- Non-retryable failures -> hide retry CTA and show deterministic guidance.
- Unexpected error shape -> fallback generic banner with trace ID only.

## Metrics / Logging

- Success signals:
  - ErrorBanner coverage rate across target surfaces.
  - Retry success rate for retryable errors.
- Debug signals:
  - `error_banner.rendered`, `error_banner.retry_clicked`, `error_banner.support_clicked`.

## Rollback / Disable Plan

- Feature flag: `error_banner_v1`.
- Safe fallback behavior: existing per-surface error messages remain available if integration is rolled back.

## Risks & Dependencies

- Risks:
  - Incomplete envelope adoption causes inconsistent UX.
  - Poor escalation target design could create dead-end support flows.
- Dependencies:
  - Depends on stable safe-error utilities and route-level adoption.
  - Can be implemented largely in parallel with other slices.

## Success Metrics

- Users see deterministic codes and trace IDs on all major failure paths.
- Retry/support actions are consistent and actionable across surfaces.

## Resolved Spike Decision

- SP-0009-04 resolved (2026-02-11): support escalation is config-driven `mailto` in parity v1.
  - `ORBITAL_SUPPORT_MAILTO` defines escalation target.
  - If unset, banner shows fallback guidance + copyable `code` and `trace_id`.
  - No ticketing endpoint/integration is introduced in this slice.

## Sources

- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/findings.md`
- `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/orbital-ui-wireframes/src/components/ui/ErrorBanner.tsx`
- `packages/core/src/safe-error.ts`
- `docs/04-projects/04-refactors/0007_empty-text-sentinel-chunks/oracle-spike-response.md`
