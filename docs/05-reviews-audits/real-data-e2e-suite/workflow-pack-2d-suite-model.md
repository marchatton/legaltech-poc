# Real-Data E2E: Workflow x Pack 2D Suite Model

Use a 2D suite model: `workflow modules x pack scenarios`.
This gives both `click -> backend step -> UI state` validation and broad scenario coverage.

## Mode Focus (Execution Posture)

1. `Dev` is the primary implementation mode for closing workflow gaps.
2. `Demo-prod` gets fast operator wins only, starting with allowlist expansion for `pack_09_bad_citation`.
3. `Prod` remains intentionally blocked until dev contracts are stable.

## Parallel Delivery Policy (Ralph Looping)

- Large changes: run `3-4` Ralph loops in parallel, each loop owning an orthogonal workflow slice.
- Small isolated changes: ship as one-shot changes directly.
- Every loop must include owned workflow verification before merge.

## Priority-Ranked Core Workflows

1. `P0` Entry + readiness gate
- Create matter, upload, ingest, readiness messaging, Quick Start enabled/blocked.

2. `P0` Run lifecycle + report
- Start run, WDK progression, terminal run state, report rows/statuses visible.

3. `P0` Trust + fail-closed export
- `citation_failed` / blocked export (`EXPORT_BLOCKED`), unsafe override path, artefact appears, download works.

4. `P0` Citation evidence path
- Open citation, render/PDF path, trust metadata/fallback behavior.

5. `P1` Review workflow
- Report triage tabs, row drawer, mark-reviewed mutation feedback.

6. `P1` Chat workflow
- Matter-scoped chat behavior, source-jump gating behavior.

7. `P1` Demo/operator loop
- Load/reload packs, repeat-run predictability.

8. `P2` Resilience workflow
- Timeout/retry/error contract consistency across surfaces.

## Attach `/08-example-data` Scenarios To Workflows

1. `pack_01_clean`
- Baseline happy path (use for all `P0` workflows).

2. `pack_02_missing_rea`
- Missing-input/readiness + failure journey (`expected_failure_journeys.json`).

3. `pack_03_mismatch_and_cert_gap`
- Triage/review escalation workflow.

4. `pack_04_multi_parcel`
- Run/report correctness under parcel scoping complexity.

5. `pack_05_partial_release`
- Review decisions for lien/release complexity.

6. `pack_06_overlapping_easements`
- Disambiguation + missing-attachment behavior.

7. `pack_07_scans_rotated_low_quality`
- Ingest robustness, OCR-quality/resilience workflows.

8. `pack_08_defined_terms_and_cross_refs`
- Multi-hop retrieval/cross-ref scenarios.

9. `pack_09_bad_citation`
- Fail-closed citation + export-blocking contract.

## Recommended Loop Split For Large Changes

| Loop | Ownership | Primary workflows | Initial pack focus |
|---|---|---|---|
| Loop A | Entry/setup foundation | `P0` Entry + readiness gate | `pack_01_clean`, `pack_02_missing_rea` |
| Loop B | Run/report contract | `P0` Run lifecycle + report | `pack_01_clean`, `pack_04_multi_parcel`, `pack_05_partial_release` |
| Loop C | Trust/citation/export contract | `P0` Trust + fail-closed export, `P0` Citation evidence path | `pack_01_clean`, `pack_09_bad_citation` |
| Loop D | Operator/review/chat/resilience | `P1` Review, `P1` Chat, `P1` Demo/operator loop, `P2` Resilience | `pack_02_missing_rea`, `pack_03_mismatch_and_cert_gap`, `pack_06_overlapping_easements`, `pack_08_defined_terms_and_cross_refs` |

## Demo-prod Quick Win (Allowlist First)

1. Expand allowlist to include `pack_09_bad_citation`.
2. Keep broader pack expansion behind dev-first workflow closure.
3. Validate operator path in demo-prod: load pack -> run -> fail-closed export behavior is visible.

## Overall Execution Workflow (Recommended)

1. Build reusable workflow tests once:
- Entry, run, trust/export, review, chat.

2. Parameterize tests by:
- `pack_id` + expected truth/failure files from each pack manifest.

3. Run tiers:
- `PR smoke`: `pack_01_clean`, `pack_02_missing_rea`, `pack_09_bad_citation` on all `P0`.
- `Nightly`: all packs on `P0 + P1`.
- `Weekly`: full matrix + resilience/fault-injection paths.
4. Delivery shape:
- Large scopes: split into `3-4` parallel Ralph loops.
- Small scopes: ship one-shot directly.
