import "server-only";

import { safeErrMessage } from "../safeErrMessage";
import { kickInlineWdkWorker } from "../wdk/wdkInlineKick.server";
import { wdkSmokeStepHandlers } from "../../steps/wdkSmokeStepHandlers.server";
import { startIngestDocumentWorkflow } from "../../workflows/ingestDocumentWorkflow.server";

export async function startDocumentIngest(args: {
  documentId: string;
  traceId?: string | null;
}): Promise<{ runId: string; stepId: string }> {
  const traceId = args.traceId ?? null;

  const { runId, stepId } = await startIngestDocumentWorkflow({ documentId: args.documentId, traceId });

  // eslint-disable-next-line no-console
  console.info("document.ingest.started", {
    trace_id: traceId,
    document_id: args.documentId,
    run_id: runId,
    step_id: stepId,
  });

  kickInlineWdkWorker({ handlers: wdkSmokeStepHandlers, maxSteps: 5, runId });

  return { runId, stepId };
}

export function enqueueDocumentIngest(documentId: string, args?: { traceId?: string | null }): void {
  void startDocumentIngest({ documentId, traceId: args?.traceId ?? null }).catch((err) => {
    // eslint-disable-next-line no-console
    console.error("document.ingest.start_failed", {
      trace_id: args?.traceId ?? null,
      document_id: documentId,
      message: safeErrMessage(err),
    });
  });
}
