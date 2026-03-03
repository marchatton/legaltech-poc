import "server-only";

import { safeErrorEnvelope } from "@legaltech-poc/core";

export function isDemoModeEnabled(): boolean {
  // Demo tooling must remain dev-only even if someone mistakenly enables the flag elsewhere.
  if (process.env.NODE_ENV !== "development") return false;
  return process.env.DEMO_MODE === "1";
}

export function assertDemoModeEnabledApi(traceId: string, headers: Headers): Response | null {
  if (isDemoModeEnabled()) return null;
  return Response.json(safeErrorEnvelope({ code: "UNAUTHORISED", message: "Demo mode is disabled.", traceId }), {
    status: 403,
    headers,
  });
}

