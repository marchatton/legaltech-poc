import { safeErrorEnvelope, VerifyInputSchema } from "@legaltech-poc/core";
import { verifyRow } from "@legaltech-poc/core/server";

import { assertSpikesEnabled } from "../../../../lib/spikes.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const spikesGate = assertSpikesEnabled(traceId, headers);
  if (spikesGate) return spikesGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }),
      { status: 400, headers },
    );
  }

  const parsed = VerifyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match VerifyInput schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const result = await verifyRow(parsed.data, { mode: "deterministic-only" });
  return Response.json(result, { status: 200, headers });
}
