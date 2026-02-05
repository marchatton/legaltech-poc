# State model

## Folder (matter) state
- `empty` → `ingesting` → `indexed` → `ready`

Transitions:
- upload doc → `ingesting`
- all docs parsed/indexed → `indexed`
- health checks pass → `ready`

## Document state
Parse status:
- `queued` → `parsing` → `parsed` | `failed`

OCR status:
- `running` → `done` | `failed`

Extraction quality:
- float 0..1

## Run state
- `created` → `running` → `partial` → `completed`
- terminal: `failed` | `cancelled` (optional)

## Report row state
- `needs_review` (verification passed)
- `reviewed` (user confirmed)
- `missing_input` (“Not found in provided documents.”)
- `citation_failed` (verification failed)

Rules:
- `citation_failed` blocks export by default
- missing inputs must be explicit and actionable (missing-doc checklist)
