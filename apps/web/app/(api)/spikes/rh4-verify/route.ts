import { safeErrorEnvelope, VerifyInputSchema } from "@orbital-poc/core";
import { verifyRow } from "@orbital-poc/core/server";

export const runtime = "nodejs";

export async function POST(req: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development") return new Response(null, { status: 404 });

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(
      safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body." }),
      { status: 400 },
    );
  }

  const parsed = VerifyInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match VerifyInput schema.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const result = await verifyRow(parsed.data, { mode: "deterministic-only" });
  return Response.json(result, { status: 200 });
}
