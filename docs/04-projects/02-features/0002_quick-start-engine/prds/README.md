# 0002 Quick Start Engine: Slice PRDs

Spine PRD (initiative-level overview): `../prd.md`

These are thin slice PRDs derived from the breadboard parts list (`../breadboard-pack.md`) and aligned to the canonical architecture contracts under `docs/03-architecture/`.

## Slices
- Slice 01: Run skeleton + version pinning: `prds/prd-slice-01-run-skeleton.md`
- Slice 02: Row payload contract + artefact table rendering: `prds/prd-slice-02-row-payload-contract.md`
- Slice 03: Commitment parsing baseline (pack_01_clean): `prds/prd-slice-03-commitment-parsing-pack-01-clean.md`
- Slice 04: Exception matching + missing-doc journey (pack_01_clean, pack_02_missing_rea): `prds/prd-slice-04-exception-matching-pack-01-02.md`
- Slice 05: Survey extraction + cert gap issue (pack_01_clean, pack_03_mismatch_and_cert_gap): `prds/prd-slice-05-survey-extraction-pack-01-03.md`
- Slice 06: Reconciliation honesty policy (pack_03_mismatch_and_cert_gap, pack_07_scans_rotated_low_quality): `prds/prd-slice-06-reconciliation-honesty-pack-03-07.md`

## Notes
- Each slice has both `prd.md` and `prd.json` (same basename).
- Supporting pinned contracts/specs live in `../specs/`.
