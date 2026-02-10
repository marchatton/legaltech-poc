import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

const startIngestDocumentWorkflow = vi.fn(async () => ({ runId: "run_test", stepId: "stp_test" }));
vi.mock("../workflows/ingestDocumentWorkflow.server", () => ({ startIngestDocumentWorkflow }));

const kickInlineWdkWorker = vi.fn();
vi.mock("../lib/wdk/wdkInlineKick.server", () => ({ kickInlineWdkWorker }));

vi.mock("../steps/wdkSmokeStepHandlers.server", () => ({ wdkSmokeStepHandlers: {} }));

describe("document ingest orchestration (post-cutover)", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  afterAll(() => {
    info.mockRestore();
  });

  afterEach(() => {
    delete process.env.FEATURE_WDK_INGEST;
    startIngestDocumentWorkflow.mockClear();
    kickInlineWdkWorker.mockClear();
    info.mockClear();
  });

  it("always starts the WDK ingest workflow", async () => {
    // FEATURE_WDK_INGEST was used during the cutover period; it should no longer
    // change ingest behavior (no silent fallback to legacy jobs).
    process.env.FEATURE_WDK_INGEST = "0";

    const { startDocumentIngest } = await import("../lib/ingest/ingestQueue.server");
    const result = await startDocumentIngest({ documentId: "doc_test", traceId: "trc_test" });

    expect(result).toEqual({ runId: "run_test", stepId: "stp_test" });
    expect(startIngestDocumentWorkflow).toHaveBeenCalledWith({ documentId: "doc_test", traceId: "trc_test" });
  });
});
