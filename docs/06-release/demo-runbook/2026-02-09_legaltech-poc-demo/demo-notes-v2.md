# Demo Notes v2: Orbital PoC (Refreshed for Current Architecture + v3 Journeys)

Use this as speaker support notes. Keep the live product flow first.

## 1) What this now demonstrates (opening, 45 to 60 sec)

This demo now maps to the v3 user-journey topology:

1. Shell and matters discovery (`P1`, `P2`)
2. Setup/doc readiness (`P3`)
3. Run and report triage (`P4`)
4. Drawer-first decisions (`P5`)
5. Evidence viewer and trust controls (`P6`)
6. Exports/artefacts and blocked-loop recovery (`P7`, `P8`)
7. Run-scoped chat (`P9`, L1)
8. Demo operator loop (toolbar/checklist/history: `P10` to `P12`)

Short version: this is a trust workflow with explicit states, not a generic chat assistant.

## 2) Architecture posture to state clearly (60 to 90 sec)

Current runtime (implemented today):
- WDK-backed ingest and Quick Start step execution
- Next.js route handlers + Postgres + local object store
- Row-level retrieve/draft/lock flow in Quick Start steps
- Fixture-backed citation/evidence overlays for deterministic demos

Target architecture (north star docs):
- OCR/layout geometry as default ingest substrate
- Full hybrid retrieval and citation locking across real uploaded docs
- Expanded eval + observability + deployment hardening

Speaker line:
- "I’ll be explicit about what is implemented now vs what is the target architecture we are iterating toward."

## 3) User and value frame (30 to 45 sec)

- User: associate/paralegal doing first-pass US CRE diligence
- Buyer: practice lead/partner accountable for turnaround and risk
- Emotional shift: rushed + uncertain -> grounded + defensible
- Business target: reduce first-pass time while preserving zero-uncited material claims

## 4) Demo reliability and integrity posture (45 sec)

- `missing_input` is first-class and explicit
- `citation_failed` is fail-closed and blocks export posture by default
- Source chips are anchor-gated (non-clickable when unresolved)
- Chat is run-scoped (L1), with selected vs effective run disclosure

## 5) Current repo snapshot (as of 2026-02-14)

- Commits: `540`
- Source LOC (`apps/`, `packages/`, `scripts/`; TS/JS/CSS/SQL): `43,597`

## 6) Visual system callout (15 sec)

- The demo runbook links directly to `docs/02-guidelines/v5-final/design-system.html` so design direction is showable live.

## 7) Close (30 sec)

- "This is not a production claim. It is a realistic, testable trust substrate with explicit journey contracts and architecture boundaries."
- "Next work is closing the remaining drift between current runtime and target docs while keeping reliability gates tight."
