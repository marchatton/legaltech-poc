# Demo Script: Orbital Copilot PoC (Trust Substrate)

- PoC: **Orbital Copilot PoC**
- Tagline: Evidence-first CRE diligence. Click a citation and see the clause highlighted, or fail closed.
- Audience: Mixed (product + engineering)
- Scope: **US only**
- Segment:
  - Organisation: US CRE law firm (title + survey diligence)
  - Buyer: Partner / practice lead / ops lead (cares about turnaround time and liability)
  - End user: Associate / paralegal doing first-pass diligence under time pressure
- Business success outcome: Target: reduce first-pass diligence time from hours to <30 minutes per matter while keeping **zero uncited material claims** in outputs (measured on fixture packs first, then pilot matters).

## Pre-demo setup (not spoken, 5 minutes before)

1. Seed fixture packs (this populates `tmp/fixture-seed/*/snapshot.json`):

```bash
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
```

2. Start the app in dev mode (required; `/matters` is dev-only):

```bash
pnpm dev
```

3. Open:
- `http://localhost:3000/matters?pack=pack_01_clean`
- Keep this runbook open: `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-runbook.html`

Optional:
- Enable trace export: set `FEATURE_TRACE_EXPORT=1` and restart `pnpm dev`.

## 0) Caveats upfront (say within 10 seconds, while already on the Matters page)

- "Caveats upfront: synthetic customer data including made up packs, segmentation and positioning were not a focus, and this is not production ready."
- "Goal was a mini Orbital Copilot PoC with a special feature: **fail-closed, locked citations with click-to-highlight evidence**."
- "Evidence is preliminary in the sense that the wider workflow is not implemented yet. What is implemented is the trust substrate and failure posture."
- "Scope is US only."

## 1) User story and emotional context (20 to 30 seconds)

Say:
- "This is for a US CRE law firm team. The buyer is the practice lead who is accountable for turnaround and risk."
- "The end user is an associate or paralegal who is triaging a pack: title commitment, exception instruments, survey."
- "They're trying to turn a messy pack into a defensible first pass. They feel rushed and uncertain because they're stitching across PDFs and cannot afford to be wrong."
- "What better feels like is confidence and speed: fewer guesses, fewer tabs, and an audit trail when you are challenged."

## 2) Demo run (happy path first) (2 to 3 minutes)

### Step 1: Start at the real entry point (Matters list)
- What to show: `http://localhost:3000/matters?pack=pack_01_clean`
- What to say: "This is the entry point. No slides."

### Step 2: Pick a row and click a citation chip (the trust moment)
- What to click: any `cit_*` chip on a `needs_review` row.
- What to show:
  - The PDF renders.
  - Highlight overlay appears at 100% zoom (zoom is locked while highlighting).
  - The snippet and `snippet_hash` are visible.
- What to say:
  - "The trust UX is the product. A citation is an ID that resolves to an immutable evidence object."
  - "You can see the snippet and its hash. If any invariant breaks, we fail closed and render no overlay."

### Step 3: Show that review state is explicit (no silent 'looks good')
- What to click: "Mark reviewed" on one `needs_review` row.
- What to say:
  - "Statuses are terminal. We don't hide uncertainty."
  - "This is intentionally small, but it's the spine the later initiatives build on."

## 3) Edge cases and safety behaviour (1 to 2 minutes)

### Edge case A: Missing inputs is a first-class outcome (pack_02)
- Navigate: switch "Seeded pack" to `pack_02_missing_rea`.
- What to show:
  - A row with status `missing_input`.
  - Answer string is exactly: `Not found in provided documents.`
  - Missing document checklist with evidence signals.
- What to say:
  - "If we cannot ground it in provided documents, we say so. That is deliberate."
  - "The invariant is strict: missing_input means zero citations. No bluffing."

### Edge case B: Corrupted citation fails closed (no overlay)
- On any pack: click the tracer-bullet bad citation row (`TB-BAD-CITATION`) if present, then click `cit_TB_BAD_1`.
- What to show:
  - The viewer shows `citation_failed` with a reason code (for example `SNIPPET_HASH_MISMATCH`).
  - No overlay renders; export posture stays blocked.
- What to say:
  - "This is the failure posture we want in a high-stakes workflow."

### Optional edge case C: Scanned / rotated pack (pack_07)
- Switch pack to `pack_07_scans_rotated_low_quality`.
- What to show:
  - The viewer is usable.
  - Rotation control works.
  - Highlight stays aligned at 100% zoom, or fails closed with an explicit reason code.

## 4) Transition to why, what, how (15 seconds)

Say:
- "Now that you've seen the end-to-end trust moment, here's why we built it, what we scoped, and how it works."

## 5) Why (30 to 60 seconds)

- Trust UX is the wedge. If trust fails, everything downstream is noise.
- The problem is not 'answers'; it's reviewable, defensible artefacts where the user can jump to the clause.
- This shifts the user from uncertainty to clarity, and it gives the business a path to measurable reliability.

## 6) What (scope and non-goals) (45 to 60 seconds)

In scope today (implemented, Initiative 0001):
- Fixture-seeded Matters UI
- Citation chips that resolve to a locked evidence object
- PDF viewer with highlight overlay (verified at 100% zoom only; deliberate cut)
- Fail-closed behaviour (hash mismatch, wrong page/doc, invalid geometry)
- Missing-input checklist and strict invariants
- Export gate posture (blocked on failures by default)

In scope next (placeholder scaffolding, Initiatives 0002 and 0003):
- Quick Start engine: title + survey -> 3 artefacts (requirements, exceptions, survey issues)
- Demo-grade outputs: exports + repeatability + eval harness + demo controls

Out of scope (explicit cuts):
- External web research inside runs
- Legal advice / materiality judgement
- Production hardening, auth, multi-tenant admin

## 7) Competitive landscape (1 to 2 minutes, respectful)

Frame:
- "There are a few sensible approaches, depending on what you optimise for."

Neutral patterns:
- Speed and breadth: great for adoption; more variance in provenance.
- Workflow automation: deterministic; less flexible in messy edge cases.
- Deep provenance (our bias): more trust; more engineering and sometimes more latency.

Our posture:
- "We're optimising for trust and reviewer confidence because the user is risk-averse and cannot afford incorrect claims."
- Trade-offs accepted: narrower scope, more upfront plumbing, slower to expand coverage.

Close:
- "It's not better, it's designed for different constraints."

## 8) Technical architecture (2 to 3 minutes)

Stack (current PoC slice):
- Next.js (App Router) + React + Tailwind
- `pdfjs-dist` for PDF rendering + overlay layer
- Zod validation and safe error envelope
- Fixture packs (`docs/08-example-data/*`) + seed snapshots (`tmp/fixture-seed/*`)

Planned for 0002/0003:
- Workflow step machine (retrieve -> draft -> lock citations -> verify -> write)
- Hybrid retrieval (lexical + vector) returning chunk IDs
- Fixture-driven evals comparing outputs to `/truth`
- Observability: traces + versioning + latency/cost metrics

Key policies:
- Citations are IDs only (locked immutable objects).
- Verification is fail-closed (integrity/invariants first; no "best effort" overlays).
- Missing input is valid and strict: exact string + zero citations.

## 9) Close (30 to 45 seconds)

Recap:
- "You saw the trust moment: click-to-highlight evidence with snippet hashing and fail-closed behaviour."
- "You saw the missing-input posture: explicit, actionable, and uncited by design."
- "The next two initiatives build on this spine: Quick Start generation and demo-grade exports/evals."

Repeat caveats briefly:
- synthetic packs, segmentation/positioning not focus, not production ready, US only.

## Q&A prompts (optional)

- "How do we stop hallucinations?"
  - "We don't let claims exist without locked evidence. If not grounded: `missing_input`."
- "What's the eval plan?"
  - "Fixture packs with `/truth` + hard gates on citation integrity and expected failure journeys."
- "What would productionisation require?"
  - "Auth, secure storage, provider data posture, durable workflow runner, and hardening performance on scanned packs."
