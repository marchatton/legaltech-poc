# Object storage options (PDFs + exports)

Date: 2026-02-06

What we need
- Store raw PDFs and exported artefacts (CSV/DOCX/etc).
- Generate URLs for pdf.js to render pages (signed URLs or a proxy endpoint).
- Work both locally and on a Hetzner-hosted deployment.

## Options

### 1) Local filesystem (dev only)
Pros
- simplest for local iteration

Cons
- not portable to serverless; not safe across multiple instances
- you must handle serving/streaming PDFs yourself

### 2) S3-compatible (recommended baseline)
Examples
- MinIO (self-host) for local dev and "single-box" Hetzner deployments
- Cloudflare R2 / AWS S3 / Backblaze B2 (managed)

Pros
- standard API (AWS SDK); easiest path to "signed URL" rendering
- portable between Vercel/Hetzner

Cons
- credentials + buckets to manage

### 3) Hetzner Object Storage
Pros
- S3-compatible managed object storage in the Hetzner ecosystem
- Simple if you're already running the rest of the backend on Hetzner

Cons
- Currently in EU locations (FSN1, HEL1, NBG1), so latency/data residency may matter.
- Still a managed service dependency; review S3 compatibility and presigned URL behavior.

### 4) Vercel Blob
Pros
- very convenient if all-in on Vercel

Cons
- tighter Vercel coupling; less attractive if primary runtime is Hetzner

## Recommendation

Recommended default (PoC)
- Local dev: MinIO (or local filesystem if you want absolute simplicity).
- Deployment: managed S3-compatible store (Cloudflare R2 / AWS S3 / Hetzner Object Storage) unless you explicitly want "everything on one VM".

If you want "single VM only"
- Run MinIO on the Hetzner VM with a mounted volume, plus automated backups.

## Sources
- Hetzner Object Storage overview (locations, pricing): https://docs.hetzner.com/storage/object-storage/overview/
- Hetzner Object Storage S3 compatibility: https://docs.hetzner.com/storage/object-storage/s3-api/s3-api-compatibility/
- Presigned URLs: https://docs.hetzner.com/storage/object-storage/api-usage/presigned-urls/
