# PRD: Demo-grade outputs and repeatability (umbrella)

## Summary
Deliver demo-ready outputs and regression safety for the PoC: CSV exports for core artefacts, a single Word export template, a minimal eval harness against /truth, and demo repeatability controls. This PRD is the umbrella; each sub-initiative can be split into its own PRD(s) per the seam list.

## Assumptions
- Seed packs in `docs/08-example-data` and `/truth` are the acceptance fixtures.
- Initiative 1 and 2 outputs (rows, citations, statuses) already exist.
- Word export uses a fixed memo template.
- Demo mode is dev-only or feature-flagged.
- `citation_failed` rows are excluded from exports with a warning banner.

## User stories

### US-001 CSV exports for 3 artefacts
As a reviewer, I can export requirements, exceptions, and survey issues to CSV so I can share or paste them into existing trackers.

Acceptance criteria:
- One-click exports produce `requirements_tracker.csv`, `exceptions_table.csv`, and `survey_issues.csv`.
- Each row includes citation references (doc name + page) and row status.
- Column ordering is stable across runs and packs.
- If any rows are excluded due to `citation_failed`, show a warning banner with counts.

### US-002 Word export (single template)
As a demo operator, I can export a single Word document that summarises the report for a stakeholder.

Acceptance criteria:
- Export produces a .docx with deal snapshot, requirements section, exceptions section (with citations), and survey issues section.
- Rows with `citation_failed` are excluded and a warning banner explains what was removed.
- Template is fixed and stored in the repo (memo).

### US-003 Golden-set eval harness
As an engineer, I can run a lightweight eval to detect regressions before demo day.

Acceptance criteria:
- For each pack, a script outputs coverage (% rows present), citation validity rate, and missing_input correctness rate.
- Harness compares against /truth and emits a report artifact (JSON + markdown summary).
- CI runs the harness in report-only mode (soft gate) and stores the artifact.

### US-004 Demo reliability controls
As a demo operator, I can reliably run the same demo twice without manual cleanup.

Acceptance criteria:
- Demo mode can load `pack_01_clean` and `pack_02_missing_rea` and run Quick Start or pre-seeded rows.
- A reset tool removes only demo matters and requires explicit confirmation.
- A demo checklist exists in the repo for the human steps.

## PRD seams (per sub-initiative)
These are recommended splits for separate PRDs during planning:

3.1 CSV export
- Export endpoint per artefact
- Column mapping + stable ordering
- Include citations + statuses

3.2 Word export
- Template storage + layout rules (memo)
- Docx generation service
- Export UI + download

3.3 Eval harness
- Eval runner script (per pack)
- Citation validity checker
- CI integration + report artifact

3.4 Demo reliability
- Pack selector UI (fixtures)
- Environment reset tool (dev only)
- Guided demo checklist markdown

## Failure states and UX
- Export warnings: show a banner when rows are excluded due to `citation_failed`.
- Eval failures: CI report is soft; failures surface in the report artifact with counts and pack names.
- Reset safety: destructive actions require explicit confirmation and demo-only guardrails.

## Metrics / logging (at least one signal)
- Export counts: rows exported vs excluded (per artefact).
- Eval summary: coverage %, citation validity %, missing_input correctness %.
- Demo reset: number of demo matters deleted and duration.

## Rollback / disable path
- Feature flag for demo mode UI.
- Export endpoints can be disabled by hiding the export menu.
- CI eval gate is report-only and can be skipped via CI config.

## Breadboard → PRD mapping
- F1, F3 → 3.1 CSV export PRDs (API + UI + column mapping).
- F2 → 3.2 Word export PRDs (template + docx service + UI download).
- F4, F5 → 3.3 Eval harness PRDs (runner + CI integration).
- F6, F7, F8 → 3.4 Demo reliability PRDs (demo flag, reset tool, checklist).

## Out of scope
- Multi-template or per-firm customization.
- Excel formatting beyond CSV.
- Deep scoring models or dashboards.
- Production onboarding flow.

## Open TODOs
- Define where export artifacts are stored and listed (if at all).
- Choose CI location and expected runtime limits for eval harness.
