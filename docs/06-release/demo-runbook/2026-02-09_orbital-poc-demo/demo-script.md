# Demo Script: Orbital Copilot PoC (Current Runtime + v3 Journeys)

- PoC: **Orbital Copilot PoC**
- Tagline: Evidence-first CRE diligence where trust is checkable, not implied.
- Audience: Mixed product + engineering + operators
- Scope: **US only**
- Segment:
  - Organisation: US CRE law firm (title + survey diligence)
  - Buyer: partner / practice lead / ops lead (turnaround + liability)
  - End user: associate / paralegal under time pressure
- Business success outcome: reduce first-pass diligence time to **<30 minutes per matter** while keeping **zero uncited material claims** in outputs.

## Pre-demo setup (not spoken, 5 minutes)

```bash
docker compose up -d db
pnpm fixture:seed pack_01_clean pack_02_missing_rea pack_07_scans_rotated_low_quality pack_09_bad_citation --overwrite
pnpm dev
```

Open:
- `http://localhost:3000/matters?pack=pack_01_clean`
- `docs/06-release/demo-runbook/2026-02-09_orbital-poc-demo/demo-runbook.html`

Optional:
- Trace export demo: `FEATURE_TRACE_EXPORT=1 ALLOW_ADMIN_BYPASS=1`
- Spikes CSV demo: `SPIKES_ENABLED=1`

## 0) Caveats upfront (within 10 seconds)

Say:
- "Quick caveats: synthetic customers and made-up packs, not production ready, and US-only scope."
- "This demo is architecture-honest: I’ll call out what is implemented now versus target architecture."
- "Special feature is fail-closed evidence verification: click citation, verify, or fail closed with explicit reason."

## 1) User story and emotional context (20 to 30 sec)

Say:
- "This is for CRE teams doing high-stakes first-pass diligence."
- "The user is rushed and uncertain; they cannot afford plausible-but-wrong outputs."
- "Better feels like fast defensible review with a visible evidence trail."

## 2) Demo run (happy path first) (3 to 4 min)

### Step 1: Entry + wayfinding (`P1`, `P2`)
- Show: matters list shell (`/matters?pack=pack_01_clean`)
- Say: "The shell and matters list are first-class surfaces, not hidden setup pages."

### Step 2: Setup/readiness (`P3`)
- Show: document/readiness rows and run-ready cues
- Say: "Readiness reasons are explicit so the operator knows why run is allowed or blocked."

### Step 3: Run + triage (`P4`, `P5`)
- Click: start Quick Start, open a row drawer, mark reviewed
- Say: "Triage is drawer-first; decisions are explicit and stateful."

### Step 4: Evidence trust moment (`P6`)
- Click: citation chip
- Show: viewer render, highlight verification at 100%, trust footer context
- Say: "Evidence is the product: click-to-verify, not trust-the-model."

### Step 5: Export loop continuity (`P7`, `P8`)
- Show: blocked export panel and deep-link back to failed rows
- Say: "Blocked exports feed directly back into triage for the same run context."

### Step 6: Run-scoped chat (`P9`, L1)
- Show: run picker + selected/effective run disclosure + source chip gating
- Say: "Chat is run-scoped and transparent about context mismatch; unresolved anchors are non-clickable by design."

## 3) Edge cases and safety behaviour (1 to 2 min)

### Edge case A: Missing input is first-class
- Switch to `pack_02_missing_rea`
- Show: `missing_input` row and explicit checklist
- Say: "If we cannot ground it, we say so."

### Edge case B: Fail-closed citation
- Open bad citation row and click `cit_TB_BAD_1`
- Show: `citation_failed` reason + no highlight overlay
- Say: "Integrity failure blocks the trust path on purpose."

### Optional edge C: Scanned pack resilience
- Switch to `pack_07_scans_rotated_low_quality`
- Show: viewer usability and rotation controls

## 4) Why / what / how (2 to 3 min)

### Why
- Trust UX is the wedge: credible review flow beats generic fluent answers.

### What (scope)
In scope now:
- WDK-backed ingest + Quick Start orchestration
- Report triage + drawer decisions + evidence viewer trust loop
- Export blocked-state recovery
- Run-scoped chat (L1)

Out of scope / cut-lines:
- Citation flag persistence endpoint (UI acknowledgement only)
- Advanced chat isolation/compare flows beyond L1
- Full checklist state machine backend

### How (architecture-honest)
Current runtime:
- Next.js + Postgres + local object store
- WDK step execution for ingest and run rows
- Fixture-backed citation overlays for deterministic trust demos

Target trajectory:
- OCR/layout-first ingest geometry
- broader retrieval/citation coverage for uploaded docs
- expanded eval and observability gates

## 5) Competitive/alternative framing (respectful, 60 sec)

Say:
- "There are valid alternatives: manual no-decision path, horizontal copilots, and legal AI platforms."
- "We are optimising for defensible work product and trust continuity, with explicit trade-offs in scope and speed."

## 6) Close (30 sec)

Say:
- "You saw the core trust loop across the current v3 journey surfaces."
- "You also saw the safety posture: explicit missing input and fail-closed citation handling."
- "Next work is closing remaining runtime/target drift while preserving deterministic reliability gates."

Repeat caveats:
- synthetic data, US only, not production ready.
