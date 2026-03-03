# Roll-Forward Checklist: Retire Legacy Ingest Jobs

This checklist is for the post-cutover cleanup where document ingest is owned by WDK and the legacy `jobs`-based ingest path is removed.

## Why
- Avoid dual runtimes lingering (ingest should not silently fall back to the legacy jobs worker).
- Make failures loud: if WDK is down, ingest should queue WDK steps and wait for the WDK worker (no reintroduction of jobs-based ingest).

## Pre-Deploy (Before Removing Legacy Code)
1. Confirm the WDK worker is running in every environment that will receive uploads.
   - Local/dev: `pnpm --filter @legaltech-poc/web worker`
   - Verify you see WDK worker logs and that it is draining `run_steps`.
2. Confirm ingest is running via WDK.
   - Upload a PDF and confirm:
     - a `runs` row exists with `type = 'ingest_document'`
     - a `run_steps` row exists with `step_type = 'ingest_document.process'`
3. Confirm no legacy ingest jobs are being created.
   - Query for the old ingest job key pattern (legacy ingest used `job_key = 'document:<document_id>'`):
     ```sql
     SELECT id, type, state, job_key, created_at
     FROM jobs
     WHERE job_key LIKE 'document:%'
     ORDER BY created_at DESC;
     ```
   - Expected result: `0` rows during normal operation.
4. Drain or delete any remaining legacy ingest jobs.
   - If you still have legacy rows, clear them before deploying the cleanup change to avoid noisy worker errors:
     ```sql
     DELETE FROM jobs
     WHERE job_key LIKE 'document:%';
     ```

## Deploy (Cleanup Change)
1. Deploy the code that removes the legacy ingest job enqueue + handler path.
2. (Optional) Remove `FEATURE_WDK_INGEST` from environment configuration if it is no longer used anywhere.

## Post-Deploy Validation
1. Upload a PDF and confirm ingest completes.
2. Confirm WDK state is created:
   - `runs.type = 'ingest_document'`
   - `run_steps.step_type = 'ingest_document.process'`
3. Confirm no jobs rows are created with `job_key LIKE 'document:%'`.

## Rollback Note
After this cleanup, there is intentionally no automatic fallback to jobs-based ingest. Rolling back ingest orchestration requires reverting to a pre-cleanup commit (and should be treated as an explicit rollback decision).

