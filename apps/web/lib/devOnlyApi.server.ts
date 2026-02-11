import "server-only";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { isDevOrDemoProd } from "./runtimeMode";

export function assertDevOnlyApi(traceId: string, headers: Headers): Response | null {
  if (process.env.NODE_ENV === "development") return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId, retryable: false }), {
    status: 404,
    headers,
  });
}

export function assertDevOrDemoProdApi(traceId: string, headers: Headers): Response | null {
  if (isDevOrDemoProd()) return null;
  return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Not found.", traceId, retryable: false }), {
    status: 404,
    headers,
  });
}
