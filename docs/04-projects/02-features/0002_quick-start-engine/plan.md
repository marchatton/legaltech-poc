# Plan: 0002 Quick Start Engine (Consolidated PRD Execution Plan)

Last updated: 2026-02-08

This plan is derived from the consolidated PRD at `docs/04-projects/02-features/0002_quick-start-engine/prd.json` and is optimized for running a single Ralph loop (single PRD), while still keeping slice boundaries explicit to reduce merge and contract conflicts.

## Enhancement Summary (deepen-plan)

Deepened on: 2026-02-08
Sections deepened:
- Spike gates + pass criteria translated into slice blockers
- Slice dependency graph + execution notes aligned to `docs/03-architecture/*`
- Minimal verification ladder per slice (fixtures-first)

Primary sources used (repo-grounded):
- Canonical architecture contracts: `docs/03-architecture/*`
- Shaping packet: `docs/04-projects/02-features/0002_quick-start-engine/brief.md`, `breadboard-pack.md`, `risk-register.md`, `spike-investigation.md`
- Pinned dossier specs: `docs/04-projects/02-features/0002_quick-start-engine/specs/*`

## Inputs

- Consolidated PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd.md`
- Consolidated JSON PRD: `docs/04-projects/02-features/0002_quick-start-engine/prd.json`
- Spine overview (for cross-check): `docs/04-projects/02-features/0002_quick-start-engine/prd-overall.md`
- Slice PRDs (thin executable units): `docs/04-projects/02-features/0002_quick-start-engine/prds/`

Pinned contracts (do not drift):
- Architecture overview: `docs/03-architecture/00_overview.md`
- Trust ADRs: `docs/03-architecture/DECISIONS.md`
- WDK conventions: `docs/03-architecture/06_frameworks_agents_rag_evals.md`
- State model + invariants: `docs/03-architecture/20_state_model.md`
- Data model: `docs/03-architecture/30_data_model.md`
- RAG + agents posture: `docs/03-architecture/40_rag_and_agents.md`
- API surface + safe error envelope: `docs/03-architecture/50_api_surface.md`
- Observability + taxonomy: `docs/03-architecture/60_observability_and_evals.md`

Pinned dossier specs (do not drift):
- List payload schema (v0): `docs/04-projects/02-features/0002_quick-start-engine/specs/list_payload_v0.schema.md`
- Comparator rules (single source): `docs/04-projects/02-features/0002_quick-start-engine/specs/comparator_spec_v0.md`
- Failure UX copy (reason codes -> next actions): `docs/04-projects/02-features/0002_quick-start-engine/specs/failure_ux_copy_v0.md`
- List verification policy (pinned semantics): `docs/04-projects/02-features/0002_quick-start-engine/specs/list_verification_policy_v1.md`

## Goal

1. Make dependencies between slices and spike gates explicit.
2. Define ownership boundaries (paths + contracts) so implementation can proceed with minimal accidental drift from `docs/03-architecture/*`.
3. Preserve the trust posture: evidence-first, fail-closed verification, deterministic orchestration, fixtures-first evaluation.

## Section Manifest (What This Plan Covers)

Section 1: Inputs + pinned contracts - what must not drift
Section 2: Non-negotiables - trust posture rules that override convenience
Section 3: Spike gates - concrete NO-GO blockers per slice
Section 4: Dependency graph - slice ordering and parallelizable work
Section 5: Slice-by-slice execution notes - architecture-aligned implementation constraints
Section 6: Minimal verification ladder - smallest proofs to keep feedback loops tight

## Non-Negotiables (Trust Posture)

- Evidence-first: drafting uses candidate `chunk_id`s; product rows refer only to locked `citation_id`s (ADR-0001).
- Fail-closed: integrity/invariant failures yield `citation_failed`; export is blocked by default when any `citation_failed` exists (ADR-0002).
- No external web research inside runs (ADR-0007).
- Missing docs: `missing_input` must use exact answer string and an actionable checklist; citations must be empty.
- Item-level uncertainty belongs in payload, not row statuses:
  - item-level: `match_status` (`matched|ambiguous|missing_doc|missing_attachment`)
  - item-level: `item_classification` (`depicted|not_depicted|unknown`)

## Spike Gates (Blocked-By Dependencies)

Implementation should not be treated as “GO” until these are closed with committed proofs.

| Gate | Blocks | Evidence location | Notes |
|---|---|---|---|
| SP-2.1 practitioner question set review | all slices | `docs/04-projects/02-features/0002_quick-start-engine/spike-proofs/` + `spike-investigation.md` | Freeze `question_set_v1.json` (<=25, exactly 3 list-shaped rows). |
| SP-2.7 payload decision | slices 0002b+ | `spike-proofs/` + `specs/list_payload_v0.schema.md` | Option 4 is the assumed decision; re-lock before implementing storage/API/UI. |
| SP-2.8 retrieval Recall@K | slices 0002c+ | `spike-proofs/` | Avoid misdiagnosing retrieval misses as parsing failures. |
| SP-2.2A commitment parsing baseline | slice 0002c | `spike-proofs/` | Proof is comparator diffs vs truth CSVs. |
| SP-2.3A exception matching baseline | slice 0002d | `spike-proofs/` | Must prove “no silent auto-pick” and missing-doc checklist on pack_02. |
| SP-2.4A survey extraction baseline | slice 0002e | `spike-proofs/` | Cert gap issue code + citation on pack_03. |
| SP-2.5 reconciliation honesty policy | slice 0002f | `spike-proofs/` | not_depicted requires positive evidence of absence; otherwise unknown. |
| SP-2.6 idempotency + failure continuation | slice 0002a | `spike-proofs/` | Prove completed can occur with one citation_failed row and no duplicates. |
| SP-2.11 list verification semantics | slices 0002b+ | `specs/list_verification_policy_v1.md` | Must align with fail-closed + immutable citations. |

## Dependency Graph (Slices)

```mermaid
graph TD
  S1[0002a Run skeleton]
  S2[0002b Row payload contract + rendering]
  S3[0002c Commitment parsing (pack_01_clean)]
  S4[0002d Exception -> instrument matching (pack_01_clean + pack_02_missing_rea)]
  S5[0002e Survey extraction (pack_01_clean + pack_03)]
  S6[0002f Reconciliation honesty (pack_03 + pack_07)]

  S1 --> S2
  S2 --> S3
  S3 --> S4
  S2 --> S5
  S4 --> S6
  S5 --> S6
```

## Slice-by-Slice Execution Notes (Architecture-Aligned)

### 0002a Run Skeleton (US-001..US-002)

Research insights (repo-grounded):
- Prefer the canonical endpoints + error envelope in `docs/03-architecture/50_api_surface.md`; avoid inventing new run/report shapes.
- WDK conventions are non-negotiable: `"use workflow"` has no side effects; `"use step"` owns side effects; step idempotency is via deterministic `step_key` (`docs/03-architecture/06_frameworks_agents_rag_evals.md`).
- Invariants must be enforced at write time (not only in UI): `docs/03-architecture/20_state_model.md`.
- Correlation keys are required in logs/events: `{trace_id, run_id, step_key, question_id}` (`docs/03-architecture/60_observability_and_evals.md`).

Implementation checklist (thin, no drift):
- Confirm folder-state gating policy (indexed vs ready) matches `risk-register.md` item RH-2.18.
- Ensure uniqueness constraints exist/are enforced:
  - unique `(run_id, question_id)` for report rows
  - unique `(run_id, step_key)` for run steps
- Ensure placeholder behavior is honest: missing extraction yields `missing_input` with exact answer string and actionable checklist.

### 0002b Row Payload Contract (US-002)

Research insights (repo-grounded):
- Schema contract must be single-sourced as Zod + doc:
  - Zod boundary validations at step boundaries (`docs/03-architecture/06_frameworks_agents_rag_evals.md`)
  - Schema doc pinned in `specs/list_payload_v0.schema.md`
- Rendering must not parse prose in `report_rows.answer`. Payload is the product contract.

Implementation checklist:
- Implement Option 4 storage contract (SP-2.7) and ensure API returns payload fields without breaking existing clients.
- UI behavior on missing/invalid payload must be safe and explicit; never attempt a “best effort” parse of answer text.

### 0002c Commitment Parsing (US-003)

Research insights (repo-grounded):
- Comparator rules must remain single-sourced in `specs/comparator_spec_v0.md`. If you change rules, you update the spec first, then update tooling and PRDs.
- Precision rule is the quality bar: 0 false positives by item number. Prefer omitting/downgrading to unknown over guessing.

Implementation checklist:
- Pin normalization rules once (item numbering, instrument refs). Do not re-implement per slice.
- Ensure candidate citations are locked before verification and become immutable references in payload items.

### 0002d Exception Matching (US-004)

Research insights (repo-grounded):
- “No silent auto-pick” is a hard product trust constraint: ambiguity is a first-class output state and must remain explicit.
- Missing-doc journey is product-critical: checklist must be actionable (e.g. expected filename for pack_02).

Implementation checklist:
- Encode `match_status` in item-level payload (not row status).
- Ensure matching evidence is inspectable (citations to the fields used for matching).

### 0002e Survey Extraction (US-005)

Research insights (repo-grounded):
- Survey extraction is a hallucination risk: treat low-quality scans as a reason to downgrade or output missing_input; never invent callouts.
- Cert gap must be machine-readable (issue code) and evidence-backed.

Implementation checklist:
- Keep outputs fixture-verifiable (truth key fields, not prose).
- Ensure failure reason codes line up with `docs/03-architecture/60_observability_and_evals.md`.

### 0002f Reconciliation Honesty (US-006)

Research insights (repo-grounded):
- not_depicted is strictly stronger than unknown and requires explicit positive evidence of absence.
- When evidence spans both title + survey, require cross-evidence citations; if either cannot lock, downgrade.

Implementation checklist:
- Keep item-level `item_classification` in payload only; row status remains terminal (`needs_review|reviewed|missing_input|citation_failed`).
- Guidance copy must be specific and map to observed failure mode; reference `specs/failure_ux_copy_v0.md`.

## Minimal Verification Ladder (Per Slice)

- Before any implementation: confirm spike gates are closed or explicitly accept NO-GO risk.
- For each slice story:
  - Use fixture packs listed in `prd.json` as the acceptance anchors.
  - Produce deterministic diffs against `/truth` where applicable.
  - Re-run row invariant audits whenever status logic or payload schemas change.
