# Demo Checklist (Draft)

> DRAFT. This checklist is owned by PRD `docs/04-projects/02-features/0016_demo-reliability/prd.md`.

## Preconditions

- Demo mode flag is enabled (dev-only).
- Fixture packs exist in-repo under `docs/08-example-data/`:
  - `pack_01_clean`
  - `pack_02_missing_rea`

## Happy Path Demo (pack_01_clean)

1. Load `pack_01_clean` via the demo toolbar pack selector.
2. Confirm a new matter was created and you are viewing it.
3. Start Quick Start run (if not auto-started).
4. Confirm report rows populate and citations can be opened in the PDF viewer.
5. Export:
   - requirements tracker CSV
   - exceptions table CSV
   - survey issues CSV
   - memo docx (if enabled)
6. Confirm artefacts appear in the artefacts list and download links work.

## Failure Journey Demo (pack_02_missing_rea)

1. Load `pack_02_missing_rea` via the demo toolbar pack selector.
2. Confirm a new matter was created and you are viewing it.
3. Start Quick Start run (if not auto-started).
4. Confirm expected `missing_input` rows appear with the canonical “Not found in provided documents.” answer.
5. Export CSVs (if export gating permits; no unsafe override by default).

## Repeatability (run twice)

1. Load `pack_01_clean` again.
2. Confirm a **new** matter is created (no deletion/reset required).

