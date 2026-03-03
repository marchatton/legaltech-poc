import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-003 setup documents upload flow", () => {
  it("wires upload init -> put -> complete transitions in the setup UI", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain('/folders/${encodeURIComponent(props.folderId)}/documents');
    expect(source).toContain("method: \"POST\"");
    expect(source).toContain("method: initJson.upload.method");
    expect(source).toContain('/documents/${encodeURIComponent(args.documentId)}/complete');
    expect(source).toContain('status === "indexed-ready"');
    expect(source).toContain("pollUntilTerminal");
    expect(source).toContain("useRouter");
    expect(source).toContain("router.refresh()");
  });

  it("maps setup failures to deterministic retry actions", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain('fallbackCode: "UPLOAD_INIT_FAILED"');
    expect(source).toContain('fallbackCode: "UPLOAD_PUT_FAILED"');
    expect(source).toContain('fallbackCode: "UPLOAD_COMPLETE_FAILED"');
    expect(source).toContain('fallbackCode: "READINESS_RECOMPUTE_FAILED"');
    expect(source).toContain('recoveryAction: "retry-upload"');
    expect(source).toContain('recoveryAction: "retry-complete"');
    expect(source).toContain('recoveryAction: "retry-refresh"');
    expect(source).toContain('retryLabel: "Retry upload"');
    expect(source).toContain('retryLabel: "Retry completion"');
    expect(source).toContain('retryLabel: "Retry refresh"');
    expect(source).toContain("if (error.recoveryAction === \"retry-complete\")");
  });

  it("keeps completion-failure state explicit and bounded", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain("if (!completeResult.ok) {");
    expect(source).toContain("setCompleteRetryRequest({");
    expect(source).toContain("applyCompletedUpload(completeResult.payload.document);");
    expect(source).toContain("for (let i = 0; i < 8; i += 1)");
    expect(source).toContain("setIsRefreshing(true);");
    expect(source).toContain("setIsRefreshing(false);");
    expect(source).toContain("loading={isUploading}");
    expect(source).toContain("disabled={isRefreshing}");
  });

  it("renders setup panel on matter detail and only advertises supported upload capability signals", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx");
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const panelSource = readUtf8(panelPath).toLowerCase();
    const pageSource = readUtf8(pagePath);

    expect(pageSource).toContain("<SetupDocumentsPanel");
    expect(panelSource).toContain("upload documents");
    expect(panelSource).toContain("capabilities.accepted_mime");
    expect(panelSource).toContain("capabilities.max_bytes");
    expect(panelSource).not.toContain("docx");
  });

  it("keeps quick start header focused on action-only control", () => {
    const root = repoRootFromWebPackage();
    const actionPath = path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx");
    const actionSource = readUtf8(actionPath);

    expect(actionSource).toContain("Tooltip");
    expect(actionSource).toContain('content="Run analysis"');
    expect(actionSource).toContain('aria-label="Run analysis"');
    expect(actionSource).not.toContain("function readinessReasonClass");
    expect(actionSource).not.toContain("{props.readiness.reason}");
  });
});
