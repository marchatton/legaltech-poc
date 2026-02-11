import { describe, expect, it } from "vitest";

import { parseSafeErrorEnvelope, parseSafeErrorLike } from "./safeErrorDisplay";

describe("safeErrorDisplay", () => {
  it("parses safe error envelope fields", () => {
    const parsed = parseSafeErrorEnvelope({
      error: {
        code: "EXPORT_BLOCKED",
        message: "Cannot export while citations are failed.",
        details: { citation_failed_count: 2 },
        trace_id: "trc_123",
        retryable: false,
        support_hint: "Review citation failures first.",
      },
    });

    expect(parsed).toEqual({
      code: "EXPORT_BLOCKED",
      message: "Cannot export while citations are failed.",
      details: { citation_failed_count: 2 },
      traceId: "trc_123",
      retryable: false,
      supportHint: "Review citation failures first.",
    });
  });

  it("returns null for missing deterministic code/message", () => {
    expect(parseSafeErrorEnvelope({ error: { code: "  " } })).toBeNull();
    expect(parseSafeErrorLike({ message: "Missing code." })).toBeNull();
    expect(parseSafeErrorLike(null)).toBeNull();
  });

  it("parses bare safe-error payloads used in stored error_json fields", () => {
    const parsed = parseSafeErrorLike({
      code: "PDF_INGEST_TIMEOUT",
      message: "PDF ingest timed out.",
      trace_id: "trc_ingest",
    });

    expect(parsed).toEqual({
      code: "PDF_INGEST_TIMEOUT",
      message: "PDF ingest timed out.",
      details: undefined,
      retryable: undefined,
      supportHint: undefined,
      traceId: "trc_ingest",
    });
  });
});
