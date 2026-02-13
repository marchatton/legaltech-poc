import { describe, expect, it } from "vitest";

import { deriveRunFailureEnvelope } from "./runFailureEnvelope";

describe("deriveRunFailureEnvelope", () => {
  it("returns null for completed runs", () => {
    const envelope = deriveRunFailureEnvelope({
      runId: "run_123",
      state: "completed",
      errorJson: null,
      traceId: "trc_completed",
    });

    expect(envelope).toBeNull();
  });

  it("prefers typed error_json fields for failed runs", () => {
    const envelope = deriveRunFailureEnvelope({
      runId: "run_failed",
      state: "failed",
      errorJson: {
        code: "QUESTION_SET_MISMATCH",
        message: "Pinned question set differs from current version.",
        details: { expected: "qs:v1", got: "qs:v2" },
      },
      traceId: "trc_failed",
    });

    expect(envelope).toMatchObject({
      code: "QUESTION_SET_MISMATCH",
      message: "Pinned question set differs from current version.",
      retryable: false,
      trace_id: "trc_failed",
      details: {
        run_id: "run_failed",
        run_state: "failed",
      },
    });
  });

  it("uses deterministic defaults for non-completed runs without typed errors", () => {
    const envelope = deriveRunFailureEnvelope({
      runId: "run_running",
      state: "running",
      errorJson: null,
      traceId: null,
    });

    expect(envelope).toEqual({
      code: "RUN_IN_PROGRESS",
      message: "Run is still processing. Refresh in a moment.",
      retryable: true,
      details: {
        run_id: "run_running",
        run_state: "running",
      },
    });
  });
});
