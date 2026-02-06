# Brief: Demo-grade outputs and repeatability (initiative 3)

## Problem / why now
We can generate rows, but we cannot reliably show or share them. Demos are brittle, exports are missing, and regressions slip in unnoticed. This initiative makes the PoC demoable and testable with credible outputs (CSV + Word), a minimal eval harness, and repeatable demo controls.

## Goals
- One-click CSV exports for requirements, exceptions, and survey issues with citations and row statuses.
- Generate a single Word artefact (memo template) from the report table.
- Lightweight eval harness with a few metrics and a soft CI gate.
- Demo repeatability: load known packs and reset safely (dev-only / feature-flagged).

## Non-goals
- Per-firm templates or tone tuning.
- Excel formatting beyond CSV.
- Deep scoring models or full analytics dashboards.
- Full onboarding or production-grade demo tooling.

## In scope (perimeter)
- 3.1 CSV export for requirements_tracker, exceptions_table, survey_issues.
- 3.2 Word export using one fixed memo template.
- 3.3 Golden-set eval harness against /truth with minimal metrics.
- 3.4 Demo reliability pack (pack selector + reset + checklist).

## Out of scope (explicit)
- Closing checklist export.
- Multiple Word templates or template customization UI.
- A/B testing of scoring models.
- Production auth, multi-tenant permissions, or audit dashboards.

## Success (done means)
- Exports produce stable, lawyer-usable CSVs with citations and statuses.
- Word export produces a clean .docx with deal snapshot, requirements, exceptions, and survey issues.
- Eval runner outputs coverage, citation validity rate, and missing_input correctness per pack.
- Demo can be run twice in a row without manual cleanup or hidden state issues.

## Constraints / dependencies
- Initiative 1 and 2 outputs exist (rows, citations, statuses).
- Seed packs in `docs/08-example-data` are the primary fixtures.
- Word output uses a simple fixed template to reduce formatting risk.
- `citation_failed` rows are excluded from exports with a warning banner by default.

## Risks / unknowns (with treatment)
| Risk | Why it matters | Treatment |
|---|---|---|
| CSV columns/ordering do not match practitioner expectations | Exports rejected on first use | Spike (quick paralegal check) |
| Memo template still feels weak for demo narrative | Product story weak | Patch (tighten structure + framing copy) |
| Docx formatting fragility | Output looks unprofessional | Patch (keep template simple) |
| Eval metrics too shallow | False confidence | Patch (include negative tests) |
| Demo reset risks data loss | Accidental deletion | Patch (demo-only guardrails + flag) |

## Open questions
- Where do exports live: immediate download only, or stored artefacts list?
- What is the appetite/timebox for each sub-initiative slice?

## PRD seams
Each sub-initiative can be broken into multiple PRDs (2-4 each). This dossier captures the umbrella PRD plus seam recommendations.

## Shaping decision (GO/NO-GO)
GO once the spikes above are executed and reviewed; otherwise NO-GO for production-facing demos.
