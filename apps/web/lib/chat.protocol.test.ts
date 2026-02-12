import { describe, expect, it } from "vitest";

import { parseChatStreamEvent } from "./chat/protocol";

describe("parseChatStreamEvent", () => {
  it("parses sources events with anchor gating metadata", () => {
    const evt = parseChatStreamEvent(
      JSON.stringify({
        type: "sources",
        sources: [
          {
            document_id: "doc_1",
            page_number: 4,
            anchor_state: "ready",
          },
          {
            document_id: "doc_2",
            page_number: 1,
            anchor_state: "unavailable",
            anchor_reason: "Source anchor is unavailable for this citation.",
          },
        ],
      }),
    );

    expect(evt).toEqual({
      type: "sources",
      sources: [
        {
          document_id: "doc_1",
          page_number: 4,
          anchor_state: "ready",
        },
        {
          document_id: "doc_2",
          page_number: 1,
          anchor_state: "unavailable",
          anchor_reason: "Source anchor is unavailable for this citation.",
        },
      ],
    });
  });

  it("fails closed when unavailable source is missing anchor reason", () => {
    const evt = parseChatStreamEvent(
      JSON.stringify({
        type: "sources",
        sources: [
          {
            document_id: "doc_2",
            page_number: 1,
            anchor_state: "unavailable",
          },
        ],
      }),
    );

    expect(evt).toBeNull();
  });

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
