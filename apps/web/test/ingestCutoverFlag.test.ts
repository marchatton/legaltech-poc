import { afterAll, afterEach, describe, expect, it, vi } from "vitest";

const enqueueJob = vi.fn(async () => ({ id: "job_test" }));
vi.mock("../lib/jobs/jobQueue.server", () => ({ enqueueJob }));

const kickInlineJobWorker = vi.fn();
vi.mock("../lib/jobs/jobWorker.server", () => ({ kickInlineJobWorker }));

const startIngestDocumentWorkflow = vi.fn(async () => ({ runId: "run_test", stepId: "stp_test" }));
vi.mock("../workflows/ingestDocumentWorkflow.server", () => ({ startIngestDocumentWorkflow }));

const kickInlineWdkWorker = vi.fn();
vi.mock("../lib/wdk/wdkInlineKick.server", () => ({ kickInlineWdkWorker }));

vi.mock("../steps/wdkSmokeStepHandlers.server", () => ({ wdkSmokeStepHandlers: {} }));

describe("FEATURE_WDK_INGEST cutover", () => {
  const info = vi.spyOn(console, "info").mockImplementation(() => {});

  afterAll(() => {
    info.mockRestore();
  });

  afterEach(() => {
    delete process.env.FEATURE_WDK_INGEST;
    enqueueJob.mockClear();
    kickInlineJobWorker.mockClear();
    startIngestDocumentWorkflow.mockClear();
    kickInlineWdkWorker.mockClear();
    info.mockClear();
  });

  it("uses WDK workflow when FEATURE_WDK_INGEST=1", async () => {
    process.env.FEATURE_WDK_INGEST = "1";

    const { startDocumentIngest } = await import("../lib/ingest/ingestQueue.server");
    const result = await startDocumentIngest({ documentId: "doc_test", traceId: "trc_test" });

    expect(result.orchestration).toBe("wdk");
    expect(startIngestDocumentWorkflow).toHaveBeenCalledWith({ documentId: "doc_test", traceId: "trc_test" });
    expect(enqueueJob).not.toHaveBeenCalled();
  });

  it("uses legacy jobs when FEATURE_WDK_INGEST is unset", async () => {
    const { startDocumentIngest } = await import("../lib/ingest/ingestQueue.server");
    const result = await startDocumentIngest({ documentId: "doc_test" });

    expect(result.orchestration).toBe("jobs");
    expect(enqueueJob).toHaveBeenCalled();
    expect(startIngestDocumentWorkflow).not.toHaveBeenCalled();
  });

  it("uses legacy jobs when FEATURE_WDK_INGEST=0", async () => {
    process.env.FEATURE_WDK_INGEST = "0";

    const { startDocumentIngest } = await import("../lib/ingest/ingestQueue.server");
    const result = await startDocumentIngest({ documentId: "doc_test" });

    expect(result.orchestration).toBe("jobs");
    expect(enqueueJob).toHaveBeenCalled();
    expect(startIngestDocumentWorkflow).not.toHaveBeenCalled();
  });
});
