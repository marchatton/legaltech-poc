export type SafeErrorEnvelope = {
  error: {
    code: string;
    message: string;
    details?: unknown;
    trace_id?: string;
    retryable?: boolean;
    support_hint?: string;
  };
};

export function safeErrorEnvelope(opts: {
  code: string;
  message: string;
  details?: unknown;
  traceId?: string;
  retryable?: boolean;
  supportHint?: string;
}): SafeErrorEnvelope {
  return {
    error: {
      code: opts.code,
      message: opts.message,
      details: opts.details,
      trace_id: opts.traceId,
      retryable: opts.retryable,
      support_hint: opts.supportHint,
    },
  };
}
