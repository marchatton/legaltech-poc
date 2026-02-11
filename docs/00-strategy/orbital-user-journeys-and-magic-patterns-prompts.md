# Orbital End-State User Journeys + Magic Patterns Prompts

This document synthesizes the expected end-state experience once these feature dossiers are implemented:

- `docs/04-projects/02-features/0001_trust-substrate`
- `docs/04-projects/02-features/0002_quick-start-engine`
- `docs/04-projects/02-features/0003_demo-grade-outputs`
- `docs/04-projects/02-features/0004_csv-export`
- `docs/04-projects/02-features/0005_word-export`
- `docs/04-projects/02-features/0006_eval-harness`
- `docs/04-projects/02-features/0007_demo-prod-deploy`
- `docs/04-projects/02-features/0007_demo-reliability`
- `docs/04-projects/02-features/0008_artefacts-foundation`
- `docs/04-projects/02-features/0011_chat_interface`

## Product End State

Orbital becomes an evidence-first "Quick Start" diligence app for Title + Survey packs where every material output is grounded in locked citations and the system fails closed when evidence cannot be verified.

### Core Concepts

- Matter (UI term) / Folder (API and DB): container for one deal or fixture pack.
- Documents (PDFs): uploaded or seeded files with ingest and quality states.
- Quick Start Run: durable run with incremental row updates and terminal run status.
- Report Rows: stable question IDs with terminal statuses: `needs_review`, `reviewed`, `missing_input`, `citation_failed`.
- Locked Citations: immutable citation objects (`snippet`, `snippet_hash`, polygons) reused across viewer, exports, and chat sources.
- Artefacts: persisted exports (CSV and Word) with fresh signed download URLs.
- Matter Chat (v0): streaming Q&A with locked evidence sources.

### Roles

- Practitioner reviewer: inspects outputs, evidence, and unresolved issues.
- Demo viewer: experiences a real app flow in demo-prod.
- Demo operator: loads packs, runs demos repeatedly, exports artefacts.
- Developer: runs fixture eval gates and regression checks.

## Key User Journeys

### 1) Matter Setup and First Pass Generation

- User creates or opens a Matter.
- User uploads PDFs or loads a fixture pack.
- Matter reaches runnable state (`indexed` or `ready`).
- User starts "Quick Start: Title + Survey".
- UI shows progress and incremental row updates.
- Three list artefacts render from structured payload:
  - B-I requirements tracker
  - B-II exceptions table
  - Survey reconciliation issues

### 2) Trust Moment: Citation to Evidence

- User clicks a citation chip from a row or list item.
- PDF viewer opens the correct document and page.
- Verified highlight renders (100% zoom verification posture).
- User sees snippet + snippet hash for traceability.
- On invariant failures, UI shows explicit `citation_failed` state, no overlay, and remediation guidance.

### 3) Failure Journeys That Stay Honest

- Missing evidence yields `missing_input` with exact answer string:
  - `Not found in provided documents.`
- Missing-doc states show actionable checklist guidance (for example expected filenames).
- Ambiguous or weak evidence downgrades safely (`unknown`, `missing_doc`, `ambiguous`) instead of fabricating confident claims.

### 4) Export and Artefact Retrieval

- When run is `completed`, user exports:
  - `requirements_tracker.csv`
  - `exceptions_table.csv`
  - `survey_issues.csv`
  - `memo.docx`
- Export is blocked by default on any `citation_failed` row.
- Artefacts are persisted and listed on the Matter.
- Downloads remain refresh-safe via newly signed URLs on each list request.
- Unsafe override artefacts are clearly labeled `UNSAFE`.

### 5) Matter Chat (Evidence-First Q&A)

- User asks a question in the Matter chat panel.
- Assistant streams a response and shows source chips.
- Clicking a source opens evidence view.
- If unsupported, assistant responds exactly:
  - `Not found in provided documents.`

### 6) Demo Operator Repeatability

- Demo toolbar (flagged) allows pack loading for known fixture packs.
- Each load creates a fresh Matter; no destructive reset endpoint needed.
- Operator can run the same demo twice by loading a new Matter each time.
- Demo checklist aligns with the actual operator flow.

### 7) Demo-Prod "Real App" Journey

- Production build running in `ORBITAL_MODE=demo-prod`.
- Private access gated by Basic Auth.
- Synthetic pack loading, viewer, Quick Start, exports, and downloads work end to end.
- Supports repeatable demos without exposing public or customer-facing workflows.

### 8) Developer Regression Journey

- Developer runs fixture eval harness on canonical packs.
- Reports (JSON + Markdown) validate hard gates:
  - schema validity
  - citation integrity
  - expected failure journeys
  - CSV truth match
- Non-zero exit blocks regressions before demos.

## Feature Inventory by Surface

### Matters and Run Surfaces

- Matter list and create/open flow.
- Document ingest, status, and quality cues.
- Quick Start run controls, progress, and status.
- Incremental report table and row drawer detail states.

### Evidence Surfaces

- PDF viewer with page nav and zoom.
- Citation jump and highlight overlay.
- Explicit error states and no silent trust leakage.

### Export and Artefacts Surfaces

- CSV and Word export actions with deterministic behavior.
- Clear blocked and not-ready states.
- Artefact list with metadata, UNSAFE labeling, and download links.

### Chat Surfaces

- Matter-scoped chat panel.
- Streaming answer bubbles.
- Source chips and evidence jump behavior.

### Demo and Ops Surfaces

- Demo toolbar pack loader (dev and demo contexts).
- Demo-prod gated runtime behavior.
- Operator runbook and repeatability checklist.

## Magic Patterns Prompts (Top 5)

### Prompt 1: Matter -> Quick Start -> Report

```text
Design a web app called "Orbital" for evidence-first Title + Survey review.

Goal: Create a multi-screen user journey for a practitioner reviewer starting from the Matters list through running "Quick Start: Title + Survey" and inspecting the resulting report.

Screen 1: Matters List
- Table/list of Matters with name, created_at, state (ingesting/indexed/ready), and a "DEMO" tag when seeded.
- Primary CTA: "New Matter".
- Secondary CTA: "Open" on each row.
- Empty state copy that explains what a Matter is.

Screen 2: New Matter / Add Documents
- Matter name field.
- Upload area for PDFs with per-file ingest status, page count, and a light "quality" indicator.
- Show a safe error banner pattern (no stack traces).

Screen 3: Matter Detail (Report + Run)
- Top header shows Matter name and state.
- "Quick Start: Title + Survey" panel with:
  - Start button (disabled unless Matter state is indexed/ready)
  - Progress indicator: questions_done / questions_total
  - Run state: running, completed, partial
  - Pinned versions display: question_set_version, index_version, agent_bundle_version
- Report table with rows that appear incrementally while running.
- Row status chips with these exact statuses: needs_review, reviewed, missing_input, citation_failed.
- Include 9 example rows using these question IDs: TS-01..TS-09.
- Make TS-03, TS-04, TS-09 list-shaped rows that render as tables from structured payload.

Screen 4: Row Drawer (List Payload Table)
- Open TS-04 "exceptions_table" as a table with columns like: item no, type, instrument no, recorded date, doc, match_status, notes, citations.
- Each item has citation chips that open the Evidence viewer.
- Match status badges: matched, ambiguous, missing_doc, missing_attachment.
- If payload is missing/invalid, show a safe "payload not available yet" error state (no internal details).

Design direction
- High-trust, professional, calm.
- Strong visual clarity for states and blocked actions.
- Accessible color + iconography for statuses (not color-only).
```

### Prompt 2: Trust Moment (Citation -> Viewer)

```text
Design the "evidence viewer" interaction for Orbital.

Goal: Prototype the trust moment where a user clicks a citation chip and sees the correct clause highlighted in a PDF viewer, with explicit failure states and 100% zoom verification.

Single screen: Matter Detail with split view
- Left side: report row drawer showing an item with a citation chip.
- Right side: PDF viewer pane with:
  - Document title, page controls, zoom controls, and a "Verified at 100% zoom only" indicator.
  - When a highlight is active, enforce 100% zoom (either snap to 100% and disable zoom, or require a one-click "Reset to 100% to verify highlight" before rendering).
  - Highlight overlay on the page.
  - Citation details panel showing snippet text and snippet_hash.

States to include
- Loading skeleton for PDF render.
- Render error state with safe error code + Retry.
- citation_failed state:
  - No overlay rendered.
  - Visible status: citation_failed.
  - Reason code + short explanation + next step checklist.
  - Include an action "Flag citation wrong" with a minimal confirmation modal.

Copy requirements
- For missing_input rows, the answer must be exactly: "Not found in provided documents."
- Never suggest disabling verification or "trusting the model".
```

### Prompt 3: Exports + Artefacts

```text
Design Orbital's export and artefacts UX.

Goal: From a completed run, export CSVs + a Word memo, show blocked/not-ready states, and list downloadable artefacts with fresh signed URLs.

Screen 1: Exports Panel (inside Matter)
- Four export buttons:
  - Export requirements_tracker.csv
  - Export exceptions_table.csv
  - Export survey_issues.csv
  - Export memo.docx (Word)
- Buttons disabled until runs.state is completed, with helper text explaining why.
- Blocked banner state for EXPORT_BLOCKED with this exact copy:
  - Title: "Export blocked"
  - Body: "This run contains {n} row(s) with failed citation verification. Fix the citations or re-run. By default we do not export when any row is citation_failed."
  - Detail line: "Run must be completed. Exports are only available for completed runs."
  - CTA: "Review failed rows"

Screen 2: Artefacts List (inside Matter)
- List newest-first with filename, kind, created_at, source_run_id, and a Download button.
- Each list row includes a short note: "Download links refresh automatically" (fresh signed URLs; no persisted links).
- Unsafe artefacts:
  - Filename includes ".UNSAFE."
  - Show a prominent UNSAFE tag and a short explanation tooltip.

Success feedback
- After export, show a toast and the new artefact appears at the top of the list.
- Download button uses a link-like affordance with a safe loading state.
```

### Prompt 4: Matter Chat (Streaming + Sources)

```text
Design the "Chat" tab inside an Orbital Matter.

Goal: Evidence-first Q&A with streaming answers and clickable locked Sources that open the evidence viewer.

Single screen: Matter Detail with tabs
- Tabs: Report, Documents, Chat, Artefacts.
- Chat tab layout:
  - Message list with user and assistant bubbles.
  - Assistant message supports streaming state (animated cursor, "Generating...").
  - Under assistant messages, a Sources section with chips like "DocName.pdf p.12".
  - Clicking a source opens the evidence viewer pane to that page with a page-level highlight box and an honest label "Page-level highlight (v0)".

Trust posture requirements
- Assistant must answer using only sources.
- If unsupported, assistant responds exactly: "Not found in provided documents."
- Show a compact "What's this?" link explaining sources are locked citations.

Failure states
- Retrieval/citation failure: assistant bubble marked citation_failed, with a reason code and next steps (safe, actionable, no internal leaks).
```

### Prompt 5: Demo Operator Repeatability

```text
Design Orbital's demo operator UX (dev/demo-only).

Goal: A feature-flagged demo toolbar that loads allowlisted fixture packs, creates a fresh Matter each time (no delete/reset), and guides the operator through a repeatable demo.

Screen 1: Global Demo Toolbar
- Persistent top bar labeled "DEMO MODE".
- Pack selector dropdown with exactly:
  - pack_01_clean (happy path)
  - pack_02_missing_rea (missing-doc journey)
- Button: "Load demo pack"
- After load, navigate to the created Matter and show a subtle banner "Fixture-only demo data".

Screen 2: Matter Detail (Operator Checklist Mode)
- Quick Start panel with a short operator checklist card:
  - Confirm Matter name starts with "DEMO: {pack_id}"
  - Wait until state is indexed/ready
  - Open a PDF
  - Run Quick Start
  - Show Report JSON
- For pack_02_missing_rea, highlight that at least one row should be status missing_input with no citations.

Repeatability UI
- After a demo run, show a small note: "To rerun the demo, load the pack again to create a fresh Matter. No reset/delete is available."
- Include a "Load pack again" shortcut CTA that returns to the toolbar interaction.
```
