import { safeErrorEnvelope } from "@legaltech-poc/core";

import { orbitalMode } from "./runtimeMode";

export function assertSpikesEnabled(traceId: string, headers: Headers): Response | null {
  // Spikes are dev-only, always. In demo-prod/prod, they should be unreachable even
  // if SPIKES_ENABLED is accidentally set.
  if (orbitalMode() === "dev" && process.env.SPIKES_ENABLED === "1") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId }), { status: 404, headers });
}
