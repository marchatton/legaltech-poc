# Fixture packs (schema v1)

Each fixture pack lives at:
`docs/08-example-data/<pack_id>/`

Required files:
- `manifest.json` (required; loaders/evals must read this and must not infer file paths)
- `docs/` (one or more source documents, typically PDFs)
- `truth/` (expected outputs for evals)
- `layout/` (optional early; anchor/layout JSON used for highlight overlay spikes and seeded chunking)

## `manifest.json` (schema v1)

Example:

```json
{
  "pack_id": "pack_01_clean",
  "schema_version": "fixture_pack_v1",
  "default_run_type": "quick_start_title_survey",
  "expected_question_set_version": "qs:quick_start_title_survey:v1",
  "documents": [
    {
      "filename": "TitleCommitment.pdf",
      "role": "title_commitment",
      "layout_file": "layout/TitleCommitment.layout.json",
      "anchors_file": "layout/TitleCommitment.anchors.json"
    }
  ],
  "layout": {
    "polygon_space": "page_viewbox_norm_v1"
  },
  "truth": {
    "requirements_tracker_csv": "truth/expected_requirements_tracker.csv",
    "exceptions_table_csv": "truth/expected_exceptions_table.csv",
    "survey_issues_csv": "truth/expected_survey_issues.csv",
    "golden_questions_json": "truth/golden_questions.json"
  }
}
```

## Anchors + layout JSON

Coordinate system:
- Anchor/layout `bbox` values are normalised floats in `[0..1]`.
- Origin is top-left of the PDF page viewBox.
- Mapping and validation rules are defined in `docs/03-architecture/30_data_model.md` (citation polygon coordinate system).

