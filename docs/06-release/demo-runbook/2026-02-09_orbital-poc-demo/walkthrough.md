# Walkthrough: Orbital Copilot PoC (Architecture-Honest, Journey-Led)

Scope: **US only**. This is a demo-grade PoC. It is not a production deployment claim.

## 0) Caveats and framing

- Synthetic packs and synthetic customer context are used for deterministic demo and eval loops.
- This walkthrough explicitly separates:
  - `current runtime` (implemented now)
  - `target architecture` (documented north star)
- Trust posture is fail-closed by design for citation integrity and missing evidence.

## 1) User and outcomes

Organisation: US CRE law firm teams performing title + survey diligence.

Buyer: practice lead/partner accountable for turnaround and risk posture.

End user: associate/paralegal who must produce defensible first-pass outputs under time pressure.

Job to be done: convert messy diligence packs into reviewable work product with checkable evidence.

Starting feelings: rushed, uncertain, worried about being wrong.

Desired feelings: confident, clear, faster, fewer guesses, auditable review path.

Business target: reduce first-pass diligence time to **<30 minutes per matter** while keeping **zero uncited material claims**.

## 2) Current journey topology (v3 parity)

The demo aligns to the v3 user-journey model:

- `P1` Global Shell: nav, environment posture, breadcrumb, stable identifiers.
- `P2` Matters List: search/filter/open/create and demo-history reopen.
- `P3` Setup/Documents: upload/readiness progression and run gating copy.
- `P4` Matter Detail/Report: run initiation + triage tabs + row statuses.
- `P5` Row Drawer: decision actions (`mark reviewed`, `flag issue`, copy answer).
- `P6` Evidence Viewer: citation trust surface, verification indicator, failure recovery.
- `P7` Exports: run-scoped exports with blocked-state loopback.
- `P8` Artefacts: filtered retrieval with provenance and safety labels.
- `P9` Matter Chat: run-scoped chat (`L1`) with selected/effective run disclosure.
- `P10` to `P12` Demo surfaces: toolbar, operator checklist, demo history.
- `P13` Shared error layer: deterministic error banner and retry/escalation contract.

## 3) End-to-end demo flow

1. Open matters list (`pack_01_clean`) and confirm shell context.
2. Start Quick Start run and monitor progress in report triage.
3. Open row drawer and perform an explicit decision action.
4. Click citation chip to open viewer and verify highlight at 100% zoom.
5. Navigate to exports and show blocked-state deep-link to failed rows.
6. Open chat and show run scoping behaviour + anchor-gated source chips.

Safety scenarios:
- `pack_02_missing_rea`: explicit `missing_input` behaviour.
- `TB-BAD-CITATION`: explicit `citation_failed` behaviour with no overlay.

## 4) Architecture: implemented now vs target

### Implemented now (source of truth: `07_current_poc_runtime.md`)

- Next.js App Router (`apps/web`) route handlers with Zod boundary validation
- Postgres-backed state and WDK `run_steps` execution for ingest + Quick Start
- Local filesystem object store (`tmp/object-store`)
- PDF extraction via `pdfjs-dist` text extraction
- Quick Start rows execute retrieve/draft/lock step flow in WDK
- Fixture-backed citation overlays for deterministic evidence verification demos

### Target architecture (source of truth: `00_overview.md`, `10_system_architecture.md`)

- OCR/layout geometry-first ingest defaults
- Broader hybrid retrieval and evidence locking coverage across uploaded docs
- Expanded observability/evals guardrails for deployment-grade reliability
- Durable separation of web tier and worker tier where needed

## 5) Key trust policies (demo-critical)

- Evidence-first outputs: claims must map to locked citation IDs.
- Fail-closed verification: integrity failures are explicit and block trust path.
- Missing evidence is a first-class outcome (`missing_input`), not best-effort prose.
- Trace/log posture redacts sensitive content and secrets by default.

## 6) Known cut-lines retained in this demo

- Readiness checklist backend state machine is not implemented (copy-only guidance).
- Citation flag action is UI acknowledgement only (no persistence endpoint yet).
- Chat scope remains `L1` (no advanced isolation/compare UX).
- Source chips are strict anchor-gated.
- Demo elapsed timing is coarse minute-level.

## 7) Tech stack snapshot

Implemented:
- Frontend: Next.js 15 + React + Tailwind + shared UI primitives
- Orchestration: Workflow DevKit steps (`run_steps`)
- Data: Postgres + local object store
- Validation: Zod
- Demo determinism: fixture seeds under `tmp/fixture-seed`

Design system:
- Canonical showcase: `docs/02-guidelines/v5-final/design-system.html`
- Tokens/preset source: `docs/02-guidelines/v5-final/tokens.css`, `docs/02-guidelines/v5-final/tailwind.preset.ts`

## 8) Demo scenarios and expected outcomes

1. Evidence verification (`pack_01_clean`)
- Expected: clickable citation -> viewer highlight + trust context.

2. Missing input (`pack_02_missing_rea`)
- Expected: `missing_input` row with explicit copy/checklist.

3. Fail-closed citation (`TB-BAD-CITATION`)
- Expected: `citation_failed` reason + no overlay.

4. Scanned/rotated resilience (`pack_07_scans_rotated_low_quality`)
- Expected: viewer remains usable; verification stays explicit.

## 9) Canonical references

- Current runtime: `docs/03-architecture/07_current_poc_runtime.md`
- Target architecture: `docs/03-architecture/00_overview.md`, `docs/03-architecture/10_system_architecture.md`
- Observability/evals posture: `docs/03-architecture/60_observability_and_evals.md`
- User journeys v3: `docs/04-projects/04-refactors/0009_user-journey-v2-parity-audit/user-journeys/orbital-user-journeys-v3.md`
