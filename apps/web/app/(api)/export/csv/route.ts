import { safeErrorEnvelope } from "@orbital-poc/core";

import { assertDevOnlyApi } from "../../../../lib/devOnlyApi.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

// Reserved for the target export contract (see docs/03-architecture/50_api_surface.md).
// The current fixture-backed implementation lives under /spikes/export/csv.
export async function POST(): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  return Response.json(
    safeErrorEnvelope({
      code: "NOT_FOUND",
      message: "Export API not implemented. Use /spikes/export/csv in dev.",
      traceId,
    }),
    { status: 404, headers },
  );
}
