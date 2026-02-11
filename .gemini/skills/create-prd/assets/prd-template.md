# PRD: {{title}}

Owner: {{owner}}
Status: Draft | Approved | In Progress | Shipped
Date: YYYY-MM-DD
Slug: {{kebab-case-slug}}

## Introduction / Overview

### Problem
{{What problem are we solving? Who is affected? What is happening today?}}

### Goal
{{One sentence goal statement.}}

### Slice
{{Describe the single user-visible affordance (or single observable backend capability) this PRD ships.}}

### Primary Observable Effect
{{What changes? Where can we see it? What is the before/after?}}

### In Scope
- {{Explicitly list what is included in this slice.}}

## Goals

- {{Specific, measurable objective 1}}
- {{Specific, measurable objective 2}}

## User Stories

### US-001: {{title}}
As a {{user}}, I want {{capability}} so that {{benefit}}.

#### Acceptance Criteria
- AC-001: {{Measurable, testable statement}}
- AC-002: {{Measurable, testable statement}}

#### Verification
- Pack/fixture/script: {{path or description}}
- Automated checks: {{tests/build/typecheck/lint}}
- Manual checks: {{browser smoke steps}}

### US-002: {{title}} (optional)
As a {{user}}, I want {{capability}} so that {{benefit}}.

#### Acceptance Criteria
- AC-003: {{...}}

#### Verification
- Pack/fixture/script: {{...}}

## Functional Requirements

Numbered, specific system behaviors. Keep each requirement atomic.

- FR-001: The system must {{...}}.
- FR-002: The system must {{...}}.
- FR-003: The system must {{...}}.

## Non-Goals (Out of Scope)

- {{Explicitly not included}}
- {{Explicitly not included}}

## Design Considerations (Optional)

- Mockups: {{links}}
- UI/UX notes: {{components, states, copy, accessibility}}

## Technical Considerations (Optional)

- Dependencies: {{systems/modules/services}}
- Data model / API contracts: {{what changes}}
- Constraints: {{performance, security, privacy, limits}}

## Failure States & UX

No silent failures. For each failure mode, specify user-facing UX.

- {{Failure mode}}: {{detection}} -> {{user-visible state/message}} -> {{retry/recovery}}

## Metrics / Logging

At least one measurable signal.

- Success signals: {{metric name, definition, target}}
- Debug signals: {{logs/structured events, where they go}}

## Rollback / Disable Plan

- Feature flag: {{name / default}}
- Safe fallback behavior: {{what happens when disabled}}

## Risks & Dependencies

- Risks: {{from risk register + new risks introduced by this slice}}
- Dependencies: {{blocked by / blocks}}

## Success Metrics

- {{How will success be measured? baseline + target + timeframe}}

## Open Questions

- Q1: {{...}}
- Q2: {{...}}

## Sources

List the shaping inputs used to produce this PRD (paths + short notes if helpful).

- brief.md: {{path}} ({{note}})
- breadboard-pack.md: {{path}} ({{note}})
- spike-investigation.md: {{path}} ({{note}})
- risk-register.md: {{path}} ({{note}})

## Appendix: Shaping Notes (Optional)

Capture any shaping details that didn’t fit cleanly above so no information is lost. Prefer concise notes; include key excerpts only when wording/precision matters.

### brief.md

{{Notes / key excerpts from brief.md}}

### breadboard-pack.md

{{Notes / key excerpts from breadboard-pack.md}}

### spike-investigation.md

{{Notes / key excerpts from spike-investigation.md}}

### risk-register.md

{{Notes / key excerpts from risk-register.md}}
