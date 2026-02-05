# API surface (PoC)

## Security posture (PoC)
- All endpoints require workspace auth unless explicitly noted.
- Public endpoints must be rate limited and strictly validated at the boundary (Zod).
- Webhooks (if added) must verify signatures before parsing or acting.

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
