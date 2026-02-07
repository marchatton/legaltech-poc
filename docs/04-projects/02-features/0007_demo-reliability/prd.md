# PRD: Demo Reliability Pack (Dev-Only) Pack Loader + Checklist

Owner: TBD
Status: DRAFT (GO: spike outcomes locked)
Date: 2026-02-07

## Summary

Make demos repeatable without risky deletion:
- Feature-flagged **demo toolbar** (dev-only)
- **Pack selector** that loads `pack_01_clean` and `pack_02_missing_rea` from `docs/08-example-data/`
- “Reset” semantics for slice 1: **no deletion via HTTP**. Running the demo twice means creating a fresh demo matter each time (the operator starts a run separately).
- A committed **demo checklist** Markdown file that describes the operator steps.

## Problem

Running the same demo twice is currently brittle and depends on manual “operator knowledge”. We need a deterministic operator affordance to load known packs and reach a known UI state quickly, without introducing destructive reset endpoints.

## Goals

- Demo toolbar is only available when a demo flag is enabled (dev-only / feature-flagged).
- Operator can load:
  - `pack_01_clean` (happy path)
  - `pack_02_missing_rea` (missing-doc journey)
- Each load creates a fresh folder (“matter”) seeded with documents only (operator clicks “Run Quick Start” to start a run).
- Operator can run the demo twice in a row without manual cleanup and without deleting data via HTTP.
- Demo checklist exists as Markdown and matches the actual UI flow.

## Non-goals

- Any destructive reset/delete endpoints in slice 1.
- Production onboarding wizard or general admin tooling.
- External web research (ADR-0007).

## Users

- Demo operator (internal)

## Solution

Add a dev-only demo surface that is isolated and explicit:

- Demo toolbar (dev-only) is controlled by a demo flag (PoC default: env var `DEMO_MODE=1`).
- Pack loading uses the canonical dev-only API contract in `docs/03-architecture/50_api_surface.md` (Demo controls), reads fixture packs from `docs/08-example-data/`, and seeds the system deterministically.
- Pack loader is allowlisted to known pack IDs only.
- Slice 1 reset semantics: no deletion via HTTP. Running the demo twice means loading the pack again, which creates a fresh matter each time.
- Pack loader seeds documents only by default and does not auto-start runs (operator clicks “Run Quick Start”).

## Scope

In scope:
- Demo flag (env/feature flag):
  - when off: demo toolbar does not render and any pack-load action is rejected
- Demo toolbar UI:
  - pack selector for `pack_01_clean` and `pack_02_missing_rea`
- Pack loader behaviour:
  - implemented via the dev-only endpoint in `docs/03-architecture/50_api_surface.md` (Demo controls)
  - endpoint is admin-token gated (`X-Orbital-Admin-Token`)
  - reads `docs/08-example-data/<pack_id>/manifest.json` (required; fail if missing; no directory inference)
  - reads from `docs/08-example-data/<pack_id>/`
  - pack_id must be allowlisted (no free-form filesystem paths; reject path traversal)
  - creates a new folder + documents for the selected pack
  - creates a new folder name with a demo prefix (recommended): `DEMO: <pack_id> <timestamp>`
  - returns `folder_id`
  - deterministic: same pack produces the same seeded state shape
- Demo checklist markdown:
  - stored in this dossier as `demo-checklist.md`

Out of scope:
- Safe deletion/reset endpoints.
- Fixture pack authoring beyond what is required for these two packs (handled elsewhere).

## Breadboard Mapping

From `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`:
- Parts: F8 (demo mode controls), F9 (demo checklist)
- Affordances: U6, U7, U8
- Code affordances: N7, N8, N9

## User Stories

### US-001 Load A Demo Pack
As a demo operator, I can load a known fixture pack and land in the created matter so I can start a demo quickly.

### US-002 Run The Demo Twice Without Cleanup
As a demo operator, I can run the same demo twice in a row without manual cleanup because each run starts from a fresh seeded matter.

### US-003 Follow A Demo Checklist
As a demo operator, I have a short checklist that makes the demo repeatable and reduces tribal knowledge.

## Acceptance Criteria

- AC-001: Demo toolbar does not render unless demo flag is enabled.
- AC-002: With demo flag enabled, operator can load `pack_01_clean`, and the system creates a fresh matter and navigates to it.
- AC-003: Operator can load `pack_02_missing_rea`, and the system creates a fresh matter and navigates to it.
- AC-004: Loading a pack twice creates two distinct matters; no deletion/reset is required to re-run.
- AC-005: Demo checklist exists at `docs/04-projects/02-features/0007_demo-reliability/demo-checklist.md` and matches the operator flow.

## Verification Plan

- Manual smoke in dev:
  - toggle demo flag off -> confirm toolbar absent and pack load rejected
  - toggle demo flag on -> load both packs successfully
  - load pack twice -> confirm two matters exist and demo proceeds

## Risks

- Demo tooling pollutes the real UX or bypasses trust gates (RH11).
- Pack loading becomes nondeterministic or slow and defeats the point.

## Open Questions

- None for slice 0007 (spike outcomes locked).

## Links

- `docs/04-projects/02-features/0003_demo-grade-outputs/brief.md`
- `docs/04-projects/02-features/0003_demo-grade-outputs/breadboard-pack.md`
- `docs/03-architecture/00_overview.md`
- `docs/03-architecture/10_system_architecture.md`
- `docs/03-architecture/DECISIONS.md` (ADR-0007)
