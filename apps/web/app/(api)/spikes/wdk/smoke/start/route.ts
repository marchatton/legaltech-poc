import { safeErrorEnvelope } from "@legaltech-poc/core";

import { assertSpikesEnabled } from "../../../../../../lib/spikes.server";
import { createTraceContext } from "../../../../../../lib/trace.server";
import { startWdkSmokeWorkflow } from "../../../../../../workflows/wdkSmokeWorkflow.server";

export const runtime = "nodejs";

export async function POST(_req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  try {
    const started = await startWdkSmokeWorkflow({ traceId });
    return Response.json(
      {
        ok: true,
        folder_id: started.folderId,
        run_id: started.runId,
        init_step_id: started.initStepId,
        state_url: `/spikes/wdk/smoke/state?run_id=${encodeURIComponent(started.runId)}`,
      },
      { status: 200, headers },
    );
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("wdk_smoke.start_failed", {
      trace_id: traceId,
      message: err instanceof Error ? err.message : String(err),
    });

    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to start wdk_smoke.", traceId }), {
      status: 500,
      headers,
    });
  }
}

