export type SafeErrorDisplay = {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
  retryable?: boolean;
  supportHint?: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function parseSafeErrorValue(value: unknown): SafeErrorDisplay | null {
  if (!isRecord(value)) return null;

  const code = toNonEmptyString(value.code);
  const message = toNonEmptyString(value.message);
  if (!code || !message) return null;

  const traceId = toNonEmptyString(value.trace_id) ?? undefined;
  const supportHint = toNonEmptyString(value.support_hint) ?? undefined;
  const retryable = typeof value.retryable === "boolean" ? value.retryable : undefined;
  const details = value.details;

  return {
    code,
    message,
    details,
    traceId,
    retryable,
    supportHint,
  };
}

export function parseSafeErrorEnvelope(payload: unknown): SafeErrorDisplay | null {
  if (!isRecord(payload)) return null;
  return parseSafeErrorValue(payload.error);
}

export function parseSafeErrorLike(payload: unknown): SafeErrorDisplay | null {
  return parseSafeErrorEnvelope(payload) ?? parseSafeErrorValue(payload);
}
