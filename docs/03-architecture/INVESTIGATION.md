# Investigation: docs/03-architecture Audit (2026-02-07)

## Summary
Audit of `docs/03-architecture/**` for internal consistency vs accepted ADRs and current repo behaviour.

## Findings
- Resolved: ADR status drift in canonical docs (previously "proposed" labels for accepted ADRs).
- Resolved: Verification v1 semantics aligned to ADR-0017 (integrity-only) across canonical docs (no runtime entailment).
- Resolved: `/export/csv` naming collision reduced by moving the dev-only fixture exporter under `/spikes/export/csv` and documenting spike endpoint rules.

## Notes
- Oracle bundles under `docs/98-tmp/**` and `docs/**/tmp-oracle/**` are treated as historical snapshots and are not kept in sync with canonical docs.

