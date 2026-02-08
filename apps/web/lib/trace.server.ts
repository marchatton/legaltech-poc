import { newId } from "./ids";

export function createTraceContext(): { traceId: string; headers: Headers } {
  const traceId = newId("trc");
  const headers = new Headers({
    "Cache-Control": "no-store",
    "X-Trace-Id": traceId,
  });
  return { traceId, headers };
}

