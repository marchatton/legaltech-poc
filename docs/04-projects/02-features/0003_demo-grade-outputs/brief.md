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
  - “reset” semantics that are demo-safe (see below)
  - a short demo checklist for the human operator

## Definitions (make behaviour explicit)

### “Demo-grade outputs”
For Initiative 0003, “demo-grade outputs” means:
- **Constrained, stable exports** (CSV + one Word artefact) that a practitioner can use as-is for a demo.
- **Stable schemas**: CSV headers + ordering are locked and do not drift silently.
- **Trust posture preserved**: exports fail closed by default (no silent dropping of `citation_failed` rows).

It explicitly does **not** mean: perfect prose, perfect Word formatting, per-firm template customisation, or broad jurisdiction nuance.

### “Repeatability”
For Initiative 0003, “repeatability” means:
- **Export determinism**: for a given `run_id` + `kind`, the exported artefact is deterministic (stable headers/order + deterministic row ordering; no “whatever order the DB returns”).
- **Regression repeatability**: fixture-driven evals are deterministic and produce the same hard-gate pass/fail for the same inputs.
- **Demo repeatability**: an operator can run the same demo twice in a row without manual cleanup and without any capability that could delete non-demo data.

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
  - demo checklist markdown
  - **Reset (slice 1)**: no deletion via HTTP. “Reset” means creating a fresh demo matter from fixtures.
    - Optional later slice: dev-only destructive reset tool, but only with provable guardrails.

Out of scope (explicit cuts):
- “Closing checklist” export.
- Multiple Word templates or a template editor UI.
- Hard CI gating on nuanced quality metrics (start report-only, then gate later).
- Any workflow that depends on external web research (explicitly out per ADR-0007).
- Any destructive HTTP reset/delete endpoints in the first buildable slice.

## Constraints / dependencies (load-bearing)
- Canonical architecture contracts live in `docs/03-architecture/*` and must win:
  - Export endpoints + error envelope: `docs/03-architecture/50_api_surface.md`
  - Export gating rules: `docs/03-architecture/20_state_model.md`
  - Artefact persistence shape: `docs/03-architecture/30_data_model.md`
  - Evals posture + failure taxonomy: `docs/03-architecture/60_observability_and_evals.md`
- Canonical ADRs live in `docs/03-architecture/DECISIONS.md` (append-only) and apply here:
  - Evidence-first and fail-closed exports (ADR-0001, ADR-0002)
  - Deterministic-ish step boundaries (ADR-0005): keep route handlers thin; long-running export work should live in steps
  - Fixture-driven evals are first-class (ADR-0006)
  - No external web research inside runs (ADR-0007)
  - Unsafe export override is demo-only, admin-token gated, and API-only (ADR-0019)
- This initiative assumes Initiatives 001 and 002 exist in some form:
  - report rows with `status` and locked citations
  - fixture packs + `/truth` exist (or will be created as part of eval harness work)
- **Load-bearing dependency for exports:** Initiative 002 must persist a versioned, structured row payload for the 3 list-shaped artefact rows via `report_rows.payload_schema_version` + `report_rows.payload_json` (see `docs/03-architecture/30_data_model.md`, `docs/03-architecture/50_api_surface.md`). Initiative 003 exports must map from this payload and must not parse `report_rows.answer` prose.
  - Terminology note: the oracle bundle used `export_payload` as a generic term for “structured row payload used for exports”. In this repo, that concept is already named/located as `payload_json` + `payload_schema_version`, so `export_payload` is treated as terminology drift rather than a contract to implement.

## Success (done means)
- From a fixture pack, a demo operator can:
  - export the 3 CSV artefacts and 1 Word memo
  - see exported artefacts listed for the matter and download them
- `fixture:eval` (or equivalent) produces:
  - JSON report + Markdown summary per pack
  - at minimum: schema validity + citation integrity + expected failure journeys + export truth match
- The demo can be run twice in a row without manual cleanup and without risk to non-demo data.

## Top risks / unknowns (with treatment)
| Risk / unknown | Why it matters | Treatment |
|---|---|---|
| CSV column schema usability | First practitioner reaction can kill the export story | CLOSED (ASSUMPTION): lock CSV schemas v1 (headers + ordering) + deterministic row ordering + citations format. Falsifier: practitioner paste/import test cannot be done in <5 minutes or requests column/order changes. |
| Word template choice (memo vs objection/cure letter) | Storytelling impact for demo audience | CLOSED (ASSUMPTION): ship single Word artefact = memo with fixed section list + deterministic ordering + inline citation rendering. Falsifier: stakeholder insists on letter format and provides must-have requirements. |
| Export behaviour when any row is `citation_failed` | Trust posture vs demo usefulness; needs a crisp default | CLOSED: default block export when any row is `citation_failed`. Demo-only unsafe_override exists behind `DEMO_MODE` + `ALLOW_UNSAFE_EXPORTS` + a valid `X-Orbital-Admin-Token` (ADR-0019), is API-only, and produces clearly labelled UNSAFE artefacts. |
| Docx formatting fragility | “Looks broken” erodes trust fast | Patch (keep template simple, constrain layout) |
| Minimal metrics that actually predict demo readiness | Avoid false confidence without building a full eval platform | CLOSED: hard gates = schema validity, citation integrity, failure journeys, export truth match. |
| Demo reset semantics (no-delete vs destructive tooling) | Accidental deletion is unacceptable | CLOSED: toolbar + checklist. No deletion via HTTP. Reset = load pack again to create a fresh matter. Pack loader seeds documents only and does not auto-start runs by default. |
| Missing structured row payloads (forced prose parsing) | Export work becomes brittle and contaminates workflow logic | Patch dependency into Initiative 002; fail closed until payload exists |

## Open questions
- None on spike contracts (locked 2026-02-07).
- Remaining dependency: Initiative 002 must persist structured `payload_json` + `payload_schema_version` (exports fail closed until present).
- `docs/08-example-data/pack_09_bad_citation/` added (minimal) for deterministic `citation_failed` failure journeys in eval harness.

## PRD slicing plan (after spikes)
Per `docs/00-strategy/initiatives/prd-slicing-rules.md`: PRDs come after brief + breadboard + risk register + spikes.

PRD dossiers (drafted as DRAFT; spike outcomes locked 2026-02-07; remaining dependency is Initiative 002 structured row payload persistence: `payload_json` + `payload_schema_version`):
- `0004_csv-export` (`docs/04-projects/02-features/0004_csv-export/`)
- `0005_word-export` (`docs/04-projects/02-features/0005_word-export/`)
- `0006_eval-harness` (`docs/04-projects/02-features/0006_eval-harness/`)
- `0007_demo-reliability` (`docs/04-projects/02-features/0007_demo-reliability/`)

## Glossary (canonical names)
- **Folder**: API/DB container (UI term: “Matter”).
- **Run**: one Quick Start execution attempt for a folder.
- **Report row**: one question/answer/status (+ citations) produced by a run.
- **Artefact**: an exported file (csv/docx/eval report) stored in object storage with metadata in DB.
- **Fixture pack**: deterministic in-repo demo/eval bundle (docs + `/truth`).

## Shaping decision (GO/NO-GO)
- **GO** when:
  - export API contract is unblocked (supports `kind`, defines artefacts list response)
  - structured export payload shape/location is locked (or “tracker-grade CSVs” are explicitly cut until Initiative 002 provides structure)
  - reset semantics are explicit (default: no destructive HTTP reset in slice 1)
  - spikes are completed (or consciously cut) with written outcomes that update this dossier
- **NO-GO** if export gating remains ambiguous, or if any demo tool could delete non-demo data without provable guardrails.
