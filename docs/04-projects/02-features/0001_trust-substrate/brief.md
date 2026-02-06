# Brief: 0001 Trust Substrate (Initiative 1)

## Context (why this, why now)
Trust UX is the product. Before any “Quick Start” generation is credible, we need an evidence layer that:
- stores citations as locked, immutable objects
- lets a reviewer click a citation chip and see the highlighted clause in a PDF viewer
- fails closed when evidence can’t be verified
- makes failure states explicit and actionable

This work is the foundation for Initiatives 002 (Quick Start engine) and 003 (demo-grade outputs). If trust fails, everything else is noise.

## Goals
- A user can create a **Matter** (API/DB: `folder`), upload PDFs, and view them reliably.
- Citations are first-class, immutable objects (`citation_id` references only).
- Clicking a citation opens the right document + page and overlays a highlight polygon with snippet + snippet hash.
- Row-level statuses are terminal for the workflow (`needs_review|reviewed|missing_input|citation_failed`) and export is blocked by default when any row is `citation_failed`.
- Failures are explicit and actionable: missing docs checklist, doc quality warnings, citation mismatch details.
- Minimum viable provenance exists so we can answer: “why did this row exist?”

## Non-goals
- Auth/RBAC, integrations, sharing, multi-tenant admin.
- External web research inside runs.
- A full retrieval/generation “Quick Start” (this dossier establishes the trust primitives it will use).
- Legal/materiality judgement.
- Fancy monitoring dashboards (structured logs + trace IDs only).

## Perimeter lock (in scope)
- **Matter (folder) baseline:** create folder, upload documents, list docs, view PDFs in a viewer with page navigation + zoom.
- **Citation UX scaffold:** seeded report rows + citation chips that jump to viewer and highlight evidence using fixture anchors (`docs/08-example-data/*/layout/*.anchors.json`).
- **Citation contract:** canonical, locked citation object + `GET /citations/:id` (snippet + `snippet_hash` + polygons + page).
- **Row status + gate:** status machine and “export blocked” behaviour when any row is `citation_failed` (code checks first; entailment verifier as a follow-on slice).
- **Failure journeys:** `missing_input` behaviour + missing-doc checklist, extraction quality warnings, citation mismatch UX, “flag citation wrong”.
- **Provenance + trace export:** minimal run trace export (developer-facing; no UI beyond a download button).

## Explicit out of scope
- OCR geometry extraction beyond fixture anchors (we still honour ADR-0003, but the *highlight scaffold* is anchors-first until OCR is wired).
- Any agent loops or free-form chat.
- Anything that requires per-firm templates or customization.

## Acceptance signals (fixture-driven)
- `pack_01_clean`
  - viewer renders; page nav is responsive
  - seeded row shows citation chips; click chip highlights correct region and shows snippet + `snippet_hash`
- `pack_02_missing_rea`
  - rows that depend on missing docs are `missing_input` and include a missing-doc checklist
- `pack_07_scans_rotated_low_quality`
  - viewer remains usable on scanned/rotated PDFs
  - doc quality warnings are visible (even if quality is initially stubbed)
- One deliberate bad citation (mismatching `snippet_hash`) yields `citation_failed` and export is blocked by default.

## Constraints / guardrails (must align with `docs/03-architecture`)
- Terminology: **Folder** is API/DB; UI calls it **Matter**. (`docs/03-architecture/20_state_model.md`)
- Evidence-first + citation locking (ADR-0001) and fail-closed verification (ADR-0002). (`docs/03-architecture/decisions.md`)
- No external web research (ADR-0007).
- API error envelope; do not leak internals. (`docs/03-architecture/50_api_surface.md`, `docs/03-architecture/AGENTS.md`)
- Validate inputs at boundaries with Zod; client/server module boundaries must remain clean. (`apps/web/AGENTS.md`)

## Risks / unknowns (treatments)
See `risk-register.md`. Biggest rabbit holes:
- pdf.js performance on scanned packs (`pack_07_scans_rotated_low_quality`)
- highlight overlay coordinate transforms across zoom
- snippet normalisation + stable hashing rules in practice
- verification precision (false passes) vs latency/cost
- missing-doc detection heuristics

## Open questions
- Appetite/timebox: are we shaping the full trust substrate perimeter above, or do we want to cut to “trust moment only” (viewer + click-to-highlight) first?
- Storage access pattern for pdf.js: signed URLs vs proxy endpoint?
- Verification v1: code checks only, or include an entailment model from day one?
- Minimum trace schema: what is required vs nice-to-have?

## PRD slices (to create only *after* spikes)
Per `docs/00-strategy/initiatives/prd-slicing-rules.md`, we will slice PRDs from the breadboard parts once spikes are closed:
1) Folder (matter) CRUD + upload + document list (baseline UI)
2) PDF viewer (page nav + zoom) + render URL endpoint
3) Citation chip UI + jump-to-page + highlight overlay (anchors-first)
4) Citation contract: lock + `GET /citations/:id` + snippet hashing util
5) Status machine + export gate + failure journeys UX
6) Provenance + run trace export (developer-facing)

## Shaping decision (GO/NO-GO)
NO-GO until spike items in `spike-investigation.md` are executed and oracle-reviewed, and the perimeter above is re-confirmed based on spike outcomes.
