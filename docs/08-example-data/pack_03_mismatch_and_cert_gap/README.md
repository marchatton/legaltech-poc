# Orbital Copilot PoC — Synthetic Diligence Pack (PACK03)

This folder contains **synthetic** US CRE due diligence documents intended to be "real enough" for building and testing an Orbital Copilot PoC.

## What's inside
- `docs/` PDFs and a docx:
  - Title Commitment with Schedule A / Schedule B-I (Requirements) / Schedule B-II (Exceptions) + Exhibit A (legal description)
  - Exception instruments (utility easement, CC&Rs, REA, deed of trust, mechanic's lien)
  - ALTA/NSPS Survey (draft)
  - Plat map
  - Legal description in editable `.docx`

- `layout/` JSON:
  - `*.layout.json` includes page size + a list of text line bounding boxes (approx)
  - `*.anchors.json` provides named anchors → `{page, bbox}` that you can use to test citation highlighting

- `truth/`:
  - expected trackers and a small `golden_questions.json` for evals

## Known issues in this pack
{
  "legal_desc_mismatch": true,
  "survey_missing_cert_party": true
}

## Safety / legal
These documents are **not real** and should not be used for any actual transaction.
