# API surface (PoC)

## Folder + docs
- POST /folders
- POST /folders/:id/documents (init upload)
- POST /documents/:id/complete
- GET /folders/:id/documents
- GET /documents/:id/render?page=N

## Runs
- POST /folders/:id/runs (Quick Start)
- GET /runs/:id (progress)
- GET /folders/:id/report (report rows)

## Citations
- GET /citations/:id (geometry + snippet + hash)

## Export
- POST /export/csv
- POST /export/docx
- GET /folders/:id/artefacts
