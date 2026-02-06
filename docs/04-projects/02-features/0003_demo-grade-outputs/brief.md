# Brief: Initiative 0003 — Demo-grade outputs and repeatability

## Problem / why now
The PoC’s “trust spine” produces report rows with locked citations and explicit row statuses. But we can’t yet reliably *show, share, or regression-test* those outputs:
- Demos are brittle (manual steps, unknown state, no reset path).
- There’s no export path to produce lawyer-usable artefacts (CSV + a single Word memo).
- Regressions in citations/retrieval/verification can slip in unnoticed until demo day.

This initiative is the finishing layer that makes the PoC **demoable and repeatable** without contaminating the core workflow logic.

## Goals
- **Exports (CSV + Word)** that align with the canonical API and state model:
  - CSV exports for the 3 report artefacts.
  - One Word export (single fixed template).
  - Export creates stored artefacts and returns a download URL.
- **Regression safety** via fixture-driven evals:
  - per-pack report (JSON + Markdown summary)
  - minimal trust metrics (schema + citation integrity + expected failure journeys)
- **Demo repeatability controls** (dev-only / feature-flagged):
  - load known fixture packs
  - safe reset that cannot delete non-demo data
  - a short demo checklist for the human operator

## Non-goals
- Per-firm template customisation or tone tuning.
- Excel formatting beyond CSV.
- Complex scoring models, dashboards, or analytics pipelines.
- Production-grade onboarding, multi-tenant auth, SSO/RBAC, audit dashboards.

## Scope / perimeter (in/out)
In scope:
- CSV exports for `requirements_tracker`, `exceptions_table`, `survey_issues`.
- Word export using **one** fixed template (default: memo).
- Artefact persistence + listing (so exports are retrievable after the fact).
- Eval harness that compares against fixture `/truth` and emits artefacts.
- Demo reliability pack:
  - demo mode flag
  - pack selector
  - safe reset + confirmation
  - demo checklist markdown

Out of scope (explicit cuts):
- “Closing checklist” export.
- Multiple Word templates or a template editor UI.
- Hard CI gating on nuanced quality metrics (start report-only, then gate later).
- Any workflow that depends on external web research (explicitly out per ADR-0007).

## Constraints / dependencies (load-bearing)
- Canonical architecture contracts live in `docs/03-architecture/*` and must win:
  - Export endpoints + error envelope: `docs/03-architecture/50_api_surface.md`
  - Export gating rules: `docs/03-architecture/20_state_model.md`
  - Artefact persistence shape: `docs/03-architecture/30_data_model.md`
  - Evals posture + failure taxonomy: `docs/03-architecture/60_observability_and_evals.md`
- This initiative assumes Initiatives 001 and 002 exist in some form:
  - report rows with `status` and locked citations
  - fixture packs + `/truth` exist (or will be created as part of eval harness work)

## Success (done means)
- From a fixture pack, a demo operator can:
  - export the 3 CSV artefacts and 1 Word memo
  - see exported artefacts listed for the matter and download them
- `fixture:eval` (or equivalent) produces:
  - JSON report + Markdown summary per pack
  - at minimum: schema validity + citation integrity + expected failure journeys
- The demo can be run twice in a row without manual cleanup and without risk to non-demo data.

## Top risks / unknowns (with treatment)
| Risk / unknown | Why it matters | Treatment |
|---|---|---|
| CSV column schema usability | First practitioner reaction can kill the export story | Spike (practitioner paste test) |
| Word template choice (memo vs objection/cure letter) | Storytelling impact for demo audience | Spike (15-minute stakeholder choice) |
| Export behaviour when any row is `citation_failed` | Trust posture vs demo usefulness; needs a crisp default | Patch (follow state model default) + Spike (decide if demo-only override exists) |
| Docx formatting fragility | “Looks broken” erodes trust fast | Patch (keep template simple, constrain layout) |
| Minimal metrics that actually predict demo readiness | Avoid false confidence without building a full eval platform | Spike (3–5 metrics only) |
| Demo reset safety | Accidental deletion is unacceptable | Patch (demo-only allowlist + explicit confirmation) |

## Open questions
- Export gating UX: if export is blocked (`EXPORT_BLOCKED`), what is the operator path (fix vs override)?
- Where do fixture packs live and how are they selected/loaded (filesystem vs object storage)?
- What’s the target appetite/timebox for each slice (CSV vs Word vs eval vs demo mode)?

## PRD slicing plan (after spikes)
Per `docs/00-strategy/initiatives/prd-slicing-rules.md`: PRDs come after brief + breadboard + risk register + spikes.

Planned PRD dossiers (names from `docs/00-strategy/initiatives/001-003_handoff.md`):
- `0013_csv-export`
- `0014_word-export`
- `0015_eval-harness`
- `0016_demo-reliability`

## Shaping decision (GO/NO-GO)
- GO when the listed spikes are completed (or cut), the perimeter is locked, and export gating is unambiguous.
- NO-GO if we cannot define a thin, demo-safe export path without undermining trust defaults.
