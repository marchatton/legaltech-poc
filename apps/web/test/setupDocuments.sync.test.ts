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
    expect(source).toContain('/documents/${encodeURIComponent(initJson.document.id)}/complete');
    expect(source).toContain('status === "indexed-ready"');
    expect(source).toContain("pollUntilTerminal");
  });

  it("renders setup panel on matter detail and only advertises supported upload capability signals", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/SetupDocumentsPanel.tsx");
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const panelSource = readUtf8(panelPath).toLowerCase();
    const pageSource = readUtf8(pagePath);

    expect(pageSource).toContain("<SetupDocumentsPanel");
    expect(panelSource).toContain("accepted mime:");
    expect(panelSource).toContain("capabilities.accepted_mime");
    expect(panelSource).toContain("capabilities.max_bytes");
    expect(panelSource).not.toContain("docx");
  });
});
