type RunFailureDefault = {
  code: string;
  message: string;
  retryable: boolean;
};

export type RunFailureEnvelope = {
  code: string;
  message: string;
  retryable: boolean;
  trace_id?: string;
  details?: unknown;
};

const DEFAULT_FAILURE_BY_STATE: Readonly<Record<string, RunFailureDefault>> = {
  queued: {
    code: "RUN_QUEUED",
    message: "Run is queued and has not started processing yet.",
    retryable: true,
  },
  running: {
    code: "RUN_IN_PROGRESS",
    message: "Run is still processing. Refresh in a moment.",
    retryable: true,
  },
  partial: {
    code: "RUN_PARTIAL",
    message: "Run completed with missing report rows. Re-run analysis.",
    retryable: false,
  },
  failed: {
    code: "RUN_FAILED",
    message: "Run failed before report rows were finalized. Re-run analysis.",
    retryable: false,
  },
  cancelled: {
    code: "RUN_CANCELLED",
    message: "Run was cancelled before report rows were finalized. Re-run analysis.",
    retryable: false,
  },
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

function toNonEmptyString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
}

function baseFailureForState(state: string): RunFailureDefault | null {
  if (state === "completed") return null;
  return DEFAULT_FAILURE_BY_STATE[state] ?? {
    code: "RUN_UNAVAILABLE",
    message: "Run is not in a completed state.",
    retryable: false,
  };
}

export function deriveRunFailureEnvelope(args: {
  runId: string;
  state: string;
  errorJson: unknown;
  traceId?: string | null;
}): RunFailureEnvelope | null {
  const base = baseFailureForState(args.state);
  if (!base) return null;

  const parsed = isRecord(args.errorJson) ? args.errorJson : null;
  const code = toNonEmptyString(parsed?.code) ?? base.code;
  const message = toNonEmptyString(parsed?.message) ?? base.message;
  const trace_id = toNonEmptyString(parsed?.trace_id) ?? toNonEmptyString(args.traceId) ?? undefined;
  const retryable = typeof parsed?.retryable === "boolean" ? parsed.retryable : base.retryable;

  return {
    code,
    message,
    retryable,
    trace_id,
    details: { run_id: args.runId, run_state: args.state },
  };
}
