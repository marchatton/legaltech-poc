import { describe, expect, it } from "vitest";

import {
  buildDocumentUploadCapabilities,
  deriveDocumentReadinessStatus,
  DOCUMENT_UPLOAD_MAX_BYTES,
} from "./documentSetup";

describe("document setup contract", () => {
  it("derives queued readiness before upload is completed", () => {
    expect(
      deriveDocumentReadinessStatus({
        uploadCompletedAt: null,
        parseStatus: "queued",
        ocrStatus: "queued",
      }),
    ).toBe("queued");
  });

  it("derives ingesting readiness after upload completion while parsing", () => {
    expect(
      deriveDocumentReadinessStatus({
        uploadCompletedAt: new Date(),
        parseStatus: "parsing",
        ocrStatus: "running",
      }),
    ).toBe("ingesting");
  });

  it("derives indexed-ready when parse and ocr are terminal success", () => {
    expect(
      deriveDocumentReadinessStatus({
        uploadCompletedAt: "2026-02-11T00:00:00.000Z",
        parseStatus: "parsed",
        ocrStatus: "done",
      }),
    ).toBe("indexed-ready");
  });

  it("derives failed when parse or ocr fails", () => {
    expect(
      deriveDocumentReadinessStatus({
        uploadCompletedAt: new Date(),
        parseStatus: "failed",
        ocrStatus: "done",
      }),
    ).toBe("failed");
  });

  it("publishes upload capabilities from a single source of truth", () => {
    const capabilities = buildDocumentUploadCapabilities();
    expect(capabilities).toEqual({
      accepted_mime: ["application/pdf"],
      max_bytes: DOCUMENT_UPLOAD_MAX_BYTES,
    });
  });
});
