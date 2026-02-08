# ADR-0010: Use S3-compatible object storage as the baseline

Status: accepted  
Date: 2026-02-06  
Source: `docs/03-architecture/DECISIONS.md`

## Intuition first
We have big files (raw PDFs and exported artifacts) that do not belong in database tables. We also need the browser (pdf.js) to fetch PDFs reliably.

So we pick one boring, widely-supported contract for "store bytes and fetch bytes": the S3 API.

"S3-compatible object storage" means a service that speaks the same API as Amazon S3. That lets us use the same code and tooling in multiple places:
- Local dev: MinIO (or, temporarily, local filesystem for ultra-simple early dev).
- Deployment: a managed S3-compatible service unless we explicitly choose "single VM only".

Assumption: PDFs are private, so access should be time-limited (signed URLs) or mediated (a proxy route).

## Metaphor/analogy (with mapping + where it breaks)
Think of object storage like a warehouse of sealed boxes, and you do not get to walk the aisles. You can only say "put this box under this label" and later "give me the box with this label".

Mapping:
- Bucket: the warehouse building.
- Object: a sealed box (the PDF or export bytes).
- Object key: the label you stick on the box (a unique name/path-like string).
- Metadata (content-type, size, etag): the printed label details on the box.
- Signed URL: a temporary visitor pass that lets someone pick up one specific box.
- AWS SDK: the forklift remote control with standardized buttons.
- MinIO vs managed S3: different warehouse operators that accept the same forklift controls.

Where the metaphor breaks:
- There is no real folder tree. Keys just look like paths.
- Renaming/moving is usually copy + delete.
- You cannot update part of an object in place; you typically rewrite the whole object.
- The warehouse is remote, so networks, credentials, and timeouts are first-class problems.

## Visual explanation (small ASCII diagram)
```text
Upload path
[Browser] -> [Next.js API] -> [S3-compatible object store]
                  |
                  v
             [Postgres: stores object key + metadata]

View path (pdf.js)
[pdf.js in browser] -> [Next.js API: authorize + sign] -> [Signed URL]
[pdf.js in browser] ----------------------------------> [Object store GET]
```

## Step-by-step breakdown
Inputs:
- PDF bytes (or stream) and basic metadata (filename, content-type).
- Export bytes (CSV/DOCX/etc).
- Auth context (who is allowed to read/write).
- A stable identifier to name things (docId, exportId).

Outputs:
- Object location (bucket + key).
- Stored pointer + metadata in Postgres (so the app can find the object later).
- A signed URL (time-limited) or a proxy response for pdf.js and downloads.

Constraints:
- Must work locally and on Hetzner deployment (and optionally Vercel later).
- Must serve PDFs reliably to pdf.js (correct headers; support for large files).
- Must keep private documents private (no public buckets by default).
- Must stay portable: provider should be swappable behind an S3-compatible contract.
- If we self-host (MinIO), we must own backups and durability.

Process:
1. Pick a bucket per environment and a key scheme (e.g. `docs/{docId}/raw.pdf`, `exports/{docId}/{exportId}.csv`).
2. On upload, write bytes to the object store using the S3 API.
3. Store the pointer in Postgres: bucket, key, size, content-type, and any checksum/etag you rely on.
4. For viewing/downloading, authorize the request and return a signed GET URL (or stream via a proxy endpoint if needed).

Trade-offs (upsides):
- Standard tooling (AWS SDK) and a clean signed-URL story.
- Clear separation: Postgres stores facts about files, object storage stores the bytes.
- Portability: local dev (MinIO), Hetzner, and future providers can work with the same API contract.

Trade-offs (costs):
- More configuration: credentials, buckets, CORS (if fetching directly from the browser), lifecycle rules.
- New operational failure modes: networks, timeouts, retries, and provider quirks.
- If you choose "single VM only" with MinIO, you are responsible for durability (volumes, backups, restore testing).

Failure modes to plan for:
- Upload succeeded but DB write failed, leaving an orphaned object (needs cleanup or idempotency).
- DB write succeeded but upload failed, leaving a pointer to nothing (needs retry and clear user-facing errors).
- Signed URL expired mid-view or mid-download (needs refresh flow).
- Bad credentials or bucket policy causes 403 (needs good diagnostics and least-privilege IAM).
- Wrong key/environment causes 404 (needs defensive checks and better invariants).
- Self-hosted MinIO data loss due to missing backups or ephemeral volumes.

Why this design vs alternatives:
- Local filesystem only is simplest early, but not portable to multiple instances or serverless and needs its own robust serving story.
- Storing blobs in Postgres makes the DB larger/slower to backup/restore and mixes byte storage into the primary datastore.
- Vendor-specific blob stores can be convenient, but increase coupling; S3-compatible keeps the baseline contract stable.

## Common misunderstandings
- "S3-compatible means we are locked into AWS." It is an API contract, not a provider choice.
- "Object storage is basically a filesystem." It is not POSIX; treat keys as identifiers, not real folders.
- "Signed URLs make the file public." They are time-limited access tokens and must be treated as secrets while valid.
- "MinIO is automatic durability." It is software you operate; durability depends on disks, volumes, and backups you set up.
- "We do not need Postgres metadata if we have the object key." You still need a stable mapping from app entities to object locations, plus audit and authorization context.

## Check understanding (teach-back question)
Explain what the app stores in Postgres vs object storage, and what happens step-by-step when:
1. a user uploads a PDF, and
2. a user opens that PDF in pdf.js,
including one failure case where the upload succeeds but the DB write fails.

