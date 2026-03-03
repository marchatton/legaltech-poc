import { safeErrorEnvelope } from "@legaltech-poc/core";

function baseContentType(raw: string | null): string | null {
  if (!raw) return null;
  const [t] = raw.split(";", 1);
  const v = t?.trim().toLowerCase() ?? "";
  return v || null;
}

export function isJsonContentType(raw: string | null): boolean {
  return baseContentType(raw) === "application/json";
}

export function assertJsonContentType(args: {
  req: Request;
  traceId: string;
  headers: Headers;
}): Response | null {
  if (isJsonContentType(args.req.headers.get("content-type"))) return null;

  return Response.json(
    safeErrorEnvelope({
      code: "UNSUPPORTED_MEDIA_TYPE",
      message: "Content-Type must be application/json.",
      traceId: args.traceId,
      retryable: false,
    }),
    { status: 415, headers: args.headers },
  );
}
