import "server-only";

import { enqueueJob } from "../jobs/jobQueue.server";
import { kickInlineJobWorker } from "../jobs/jobWorker.server";
import { kickInlineWdkWorker } from "../wdk/wdkInlineKick.server";
import { wdkSmokeStepHandlers } from "../../steps/wdkSmokeStepHandlers.server";
import { startIngestDocumentWorkflow } from "../../workflows/ingestDocumentWorkflow.server";

function safeErrMessage(err: unknown): string {
  if (err instanceof Error) return err.message;
  return String(err);
}

type IngestOrchestration = "jobs" | "wdk";

function ingestOrchestration(): IngestOrchestration {
  return process.env.FEATURE_WDK_INGEST === "1" ? "wdk" : "jobs";
}

export async function startDocumentIngest(args: {
  documentId: string;
  traceId?: string | null;
}): Promise<
  | { orchestration: "wdk"; runId: string; stepId: string }
  | { orchestration: "jobs"; jobId: string }
> {
  const orchestration = ingestOrchestration();
  const traceId = args.traceId ?? null;

  if (orchestration === "wdk") {
    const { runId, stepId } = await startIngestDocumentWorkflow({ documentId: args.documentId, traceId });

    // eslint-disable-next-line no-console
    console.info("document.ingest.started", {
      orchestration,
      trace_id: traceId,
      document_id: args.documentId,
      run_id: runId,
      step_id: stepId,
    });

    kickInlineWdkWorker({ handlers: wdkSmokeStepHandlers, maxSteps: 5 });

    return { orchestration, runId, stepId };
  }

  const { id: jobId } = await enqueueJob({
    type: "ingest_document",
    jobKey: `document:${args.documentId}`,
    payload: { document_id: args.documentId },
  });

  // eslint-disable-next-line no-console
  console.info("document.ingest.started", {
    orchestration,
    trace_id: traceId,
    document_id: args.documentId,
    job_id: jobId,
  });

  kickInlineJobWorker();

  return { orchestration, jobId };
}

export function enqueueDocumentIngest(documentId: string, args?: { traceId?: string | null }): void {
  void startDocumentIngest({ documentId, traceId: args?.traceId ?? null }).catch((err) => {
    const orchestration = ingestOrchestration();
    // eslint-disable-next-line no-console
    console.error("document.ingest.start_failed", {
      orchestration,
      trace_id: args?.traceId ?? null,
      document_id: documentId,
      message: safeErrMessage(err),
    });
  });
}
