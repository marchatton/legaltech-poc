# PRD: Trust substrate (umbrella)

## Summary
Build the trust substrate that underpins all future workflows: matters + document viewer baseline, citation UI and data model, verification gate, failure UX, and minimal provenance. This PRD is the umbrella; each sub-initiative can be split into its own PRD(s) per the seam list.

## Assumptions
- Seed packs in `docs/08-example-data` are the primary fixtures for acceptance tests.
- Anchor JSON under `/layout` is the source for citation geometry until OCR is introduced.
- Web app is the initial surface (Next.js).

## User stories

### US-001 Matter + document viewer baseline
As a user, I can create a matter, upload PDFs, and view them with page navigation so I can see evidence in context.

Acceptance criteria:
- User can create a matter and upload the PDFs from `pack_01_clean/docs/`.
- Document list shows processing state (even if it is “uploaded” only).
- PDF viewer renders any uploaded PDF and supports page navigation.

### US-002 Citation chips -> click-to-highlight (anchor scaffold)
As a reviewer, I can click a citation chip and be taken to the exact doc/page with a highlight so I can verify evidence quickly.

Acceptance criteria:
- In `pack_01_clean`, selecting a seeded row with citations shows citation chips.
- Clicking a chip opens the target PDF and highlights the cited region (using anchors).
- Viewer shows snippet text and snippet hash next to the highlight.

### US-003 Canonical citation model + citations API
As the system, I store citations as canonical objects and expose them via an API so the UI can trust a single source of truth.

Acceptance criteria:
- Report rows store citations as IDs (not free text).
- `GET /citations/:id` returns `{document_id, page_number, polygons, snippet, snippet_hash}`.
- Viewer uses only this API for evidence display.

### US-004 Verification gate + row status transitions
As the system, I fail closed when citations don’t verify so we never export unverified rows by default.

Acceptance criteria:
- For a known-good seeded row in `pack_01_clean`, verifier passes and row becomes `needs_review`.
- For a known-bad row (inject a mismatching snippet hash), verifier fails and row becomes `citation_failed`.
- UI surfaces “citation check failed” and blocks export by default (override toggle optional).

### US-005 Failure journeys as first-class UX
As a user, I can see explicit, actionable failure states (missing docs, low-quality scans, citation mismatch).

Acceptance criteria:
- `pack_02_missing_rea` produces rows tagged `missing_input` with a clear “missing referenced docs” list.
- `pack_06_noisy_scans_rotated_page` surfaces extraction/OCR quality warnings at doc level (even if simulated early).
- Citation mismatch shows a visible error and a user action: “flag citation wrong”.

### US-006 Provenance and traceability
As a reviewer or auditor, I can see what produced a row and export a minimal run trace.

Acceptance criteria:
- Every run and row stores `agent_bundle_version` (prompt versions, retrieval pipeline version).
- Store model + prompt version + retrieved chunk IDs for each row generation.
- Ability to export a “run trace” JSON for a single run.

## PRD seams (per sub-initiative)
These are recommended splits for separate PRDs during planning:

1.1 Matter + document viewer baseline
- Matter CRUD + empty state UI
- Direct-to-storage upload flow + progress
- Document list + basic statuses
- PDF viewer component (page nav, zoom)

1.2 Citation chips -> click-to-highlight
- Citation chip UI component + interaction states
- Viewer jump-to-page API (from citation payload)
- Highlight overlay layer (bbox/polygon rendering)
- Fixture loader to seed rows + citations from `/truth` + `/layout`

1.3 Citation data model + API
- DB schema for report_rows + citations + documents
- Citations API (fetch by ID)
- Snippet hashing util + canonicalisation rules
- Viewer evidence sidebar (snippet + hash + ‘copy snippet’)

1.4 Verification gate + row statuses
- Row status state machine + UI badges
- Code-based checks (page exists, hash match, bbox exists)
- LLM entailment verifier prompt + structured verdict
- Export gate behaviour (block on citation_failed; override UX)

1.5 Failure journeys
- Missing-doc checklist component (per matter + per row)
- Doc quality indicator (extraction_quality placeholder now, real later)
- ‘Flag citation wrong’ action + capture feedback
- Failure taxonomy logging (enum + structured logs)

1.6 Provenance + traceability
- Provenance schema + version stamping
- Store LLM calls metadata (cost, latency, model, prompt hash)
- Trace export endpoint (per run)
- Minimal run-step progress model (plan/retrieve/draft/verify/write)

## Out of scope
- Auth/RBAC, integrations, sharing.
- Retrieval or generation beyond verification.
- OCR geometry extraction beyond anchor scaffolding.
- External web research.

## Open TODOs
- Define appetite/timebox for the umbrella and each seam.
- Confirm storage access pattern (signed URLs vs proxy).
- Select verification model + latency budget.
