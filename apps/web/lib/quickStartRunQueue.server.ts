import "server-only";

import { enqueueJob } from "./jobs/jobQueue.server";
import { kickInlineJobWorker } from "./jobs/jobWorker.server";
import { safeErrMessage } from "./safeErrMessage";

export function enqueueQuickStartRun(runId: string): void {
  void enqueueJob({ type: "execute_run", jobKey: `run:${runId}`, payload: { run_id: runId } })
    .then(() => {
      kickInlineJobWorker();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.enqueue failed", { job_type: "execute_run", run_id: runId, message: safeErrMessage(err) });
    });
}
