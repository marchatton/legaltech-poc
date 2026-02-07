Saved handoff: docs/04-projects/02-features/0001_trust-substrate/tmp-handoffs/handoff_2026-02-07_00-50-53_trust-substrate-shaping.md

- Scope/status:
  - Reconciled 0001 dossier against canonical architecture docs (`docs/03-architecture/*`) and ADRs (`docs/03-architecture/DECISIONS.md`):
    - OCR/layout extraction treated as default ingest posture (ADR-0003), while keeping RH2 highlight spike anchors-first as a scaffold.
    - Added/clarified state model invariants (missing_input exact string + zero citations; export gating references).
    - Updated RH3 risk mitigation to match the canonical snippet_hash normalization rule.
    - Updated RH2 spike plan to prefer `browser-use` for evidence capture (open->state->act->screenshot loop; sessions).
  - Created multiple thin slice PRDs under `prds/` (per breadboard slices) with `prd.md` + `prd.json` each, and added an index at `prds/README.md`.
  - Validated all new `prd.json` files against `docs/04-projects/_templates/json-prd.schema.json` (PASS).

- Slice PRDs created:
  - `prds/0001a_matter-documents/` (ready to implement)
  - `prds/0001b_pdf-viewer/` (NO-GO until RH1)
  - `prds/0001c_citations-api-locking/` (NO-GO until RH3)
  - `prds/0001d_citation-chip-highlight/` (NO-GO until RH2)
  - `prds/0001e_row-status-export-failures/` (NO-GO until RH4/RH5)
  - `prds/0001f_provenance-trace-export/`

- Notes:
  - In this sandboxed environment, `browser-use` was not found on PATH, but the spike plan includes a `uvx --from "browser-use[cli]" ...` fallback for running it one-off.

- Next steps:
  - Execute RH1 and RH2 spikes (viewer perf + overlay mapping) and attach evidence (screenshots + bbox logs).
  - Execute RH3-RH5 spikes and lock perimeter + fallbacks.
  - After spikes, convert NO-GO slice PRDs into implementation-ready PRDs and proceed with wf-plan/wf-develop.

