import "server-only";

import { enqueueJob } from "../jobs/jobQueue.server";
import { kickInlineJobWorker } from "../jobs/jobWorker.server";

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

export function enqueueDocumentIngest(documentId: string): void {
  void enqueueJob({ type: "ingest_document", jobKey: `document:${documentId}`, payload: { document_id: documentId } })
    .then(() => {
      kickInlineJobWorker();
    })
    .catch((err) => {
      // eslint-disable-next-line no-console
      console.error("jobs.enqueue failed", {
        job_type: "ingest_document",
        document_id: documentId,
        message: safeErrMessage(err),
      });
    });
}

