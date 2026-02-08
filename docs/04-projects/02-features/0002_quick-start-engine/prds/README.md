# 0002 Quick Start Engine: Slice PRDs

Overall PRD (initiative-level overview): `../prd-overall.md`

Consolidated PRD (single-loop input): `../prd.md`

These are thin slice PRDs derived from the breadboard parts list (`../breadboard-pack.md`) and aligned to the canonical architecture contracts under `docs/03-architecture/`.

## Slices
- Slice 01: Run skeleton + version pinning: `0002a_run-skeleton/prd.md`
- Slice 02: Row payload contract + artefact table rendering: `0002b_row-payload-contract/prd.md`
- Slice 03: Commitment parsing baseline (pack_01_clean): `0002c_commitment-parsing-pack-01-clean/prd.md`
- Slice 04: Exception matching + missing-doc journey (pack_01_clean, pack_02_missing_rea): `0002d_exception-matching-pack-01-02/prd.md`
- Slice 05: Survey extraction + cert gap issue (pack_01_clean, pack_03_mismatch_and_cert_gap): `0002e_survey-extraction-pack-01-03/prd.md`
- Slice 06: Reconciliation honesty policy (pack_03_mismatch_and_cert_gap, pack_07_scans_rotated_low_quality): `0002f_reconciliation-honesty-pack-03-07/prd.md`

## Notes
- Each slice has both `prd.md` and `prd.json` (same basename).
- Supporting pinned contracts/specs live in `../specs/`.
