import { safeErrorEnvelope } from "@orbital-poc/core";

export function assertSpikesEnabled(traceId: string, headers: Headers): Response | null {
  if (process.env.SPIKES_ENABLED === "1") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), { status: 404, headers });
}

