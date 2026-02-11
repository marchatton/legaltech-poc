import { describe, expect, it } from "vitest";

import { parseChatStreamEvent } from "./chat/protocol";

describe("parseChatStreamEvent", () => {
  it("parses chat error events with trace and retryable fields", () => {
    const evt = parseChatStreamEvent(
      JSON.stringify({
        type: "error",
        status: "citation_failed",
        code: "MODEL_STREAM_FAILED",
        message: "Chat response failed. Please retry.",
        trace_id: "trc_123",
        retryable: true,
      }),
    );

    expect(evt).toEqual({
      type: "error",
      status: "citation_failed",
      code: "MODEL_STREAM_FAILED",
      message: "Chat response failed. Please retry.",
      trace_id: "trc_123",
      retryable: true,
    });
  });

  it("fails closed when deterministic error fields are missing", () => {
    const evt = parseChatStreamEvent(
      JSON.stringify({
        type: "error",
        status: "citation_failed",
        code: "MODEL_STREAM_FAILED",
        message: "Chat response failed. Please retry.",
      }),
    );

    expect(evt).toBeNull();
  });
});
