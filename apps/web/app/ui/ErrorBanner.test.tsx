import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { ErrorBanner } from "./ErrorBanner";

describe("ErrorBanner", () => {
  it("renders deterministic code and trace_id", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner code="EXPORT_BLOCKED" message="Cannot export." traceId="trc_123" title="Export blocked" />,
    );

    expect(html).toContain("Export blocked");
    expect(html).toContain("code: EXPORT_BLOCKED");
    expect(html).toContain("trace_id: trc_123");
  });

  it("hides retry CTA when retry is not allowed", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner code="VALIDATION_ERROR" message="Invalid input." onRetry={() => undefined} retryable={false} />,
    );

    expect(html).not.toContain("Retry");
  });
});
