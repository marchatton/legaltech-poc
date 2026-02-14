import React from "react";
import { renderToStaticMarkup } from "react-dom/server";

import { describe, expect, it } from "vitest";

import { buildSupportMailtoHref, ErrorBanner, resolveSupportMailtoTarget } from "./ErrorBanner";

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

  it("keeps support CTA for non-retryable validation errors", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner
        code="VALIDATION_ERROR"
        message="Invalid input."
        traceId="trc_000"
        onRetry={() => undefined}
        retryable={false}
        supportTarget="support@orbital.test"
        supportRoute="/matters/fld_123"
      />,
    );

    expect(html).not.toContain("Retry");
    expect(html).toContain("Contact support");
  });

  it("hides retry CTA when retryable is missing", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner code="HTTP_500" message="Request failed." onRetry={() => undefined} />,
    );

    expect(html).not.toContain("Retry");
  });

  it("shows retry CTA when retryable is true", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner code="MODEL_STREAM_FAILED" message="Chat failed." onRetry={() => undefined} retryable />,
    );

    expect(html).toContain("Retry");
  });

  it("builds configured support mailto with deterministic identifiers", () => {
    const target = resolveSupportMailtoTarget("support@orbital.test");
    expect(target).toBe("mailto:support@orbital.test");
    if (!target) throw new Error("expected support target");

    const href = buildSupportMailtoHref({
      target,
      code: "EXPORT_BLOCKED",
      traceId: "trc_456",
      route: "/matters/pack_01",
    });

    const parsed = new URL(href);
    expect(parsed.protocol).toBe("mailto:");
    expect(parsed.pathname).toBe("support@orbital.test");
    expect(parsed.searchParams.get("subject")).toBe("Orbital support request: EXPORT_BLOCKED");

    const body = parsed.searchParams.get("body");
    expect(body).toContain("code: EXPORT_BLOCKED");
    expect(body).toContain("trace_id: trc_456");
    expect(body).toContain("route: /matters/pack_01");
    expect(body).not.toContain("Cannot export");
  });

  it("shows fallback instructions when support target is unset", () => {
    const html = renderToStaticMarkup(
      <ErrorBanner
        code="MODEL_STREAM_FAILED"
        message="Chat response failed."
        traceId="trc_789"
        supportTarget=""
        supportRoute="/matters/pack_02"
      />,
    );

    expect(html).toContain("Support channel is not configured.");
    expect(html).toContain("Support identifiers");
    expect(html).toContain("code: MODEL_STREAM_FAILED");
    expect(html).toContain("trace_id: trc_789");
    expect(html).toContain("route: /matters/pack_02");
    expect(html).not.toContain("Contact support");
  });
});
