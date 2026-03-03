import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-002 row drawer decision surface", () => {
  it("renders drawer sections for answer, evidence, and split-view hooks", () => {
    const root = repoRootFromWebPackage();
    const drawerPath = path.join(root, "apps/web/app/(app)/matters/[id]/RowDetailDrawer.tsx");
    const source = readUtf8(drawerPath);

    expect(source).toContain("Extracted answer");
    expect(source).toContain("CitationChipList");
    expect(source).toContain("DesktopEvidenceViewer");
    expect(source).toContain("ErrorBanner");
    expect(source).toContain("Copy answer");
    expect(source).toContain("Mark reviewed");
  });

  it("wires mark reviewed action with explicit success and error feedback", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const drawerPath = path.join(root, "apps/web/app/(app)/matters/[id]/RowDetailDrawer.tsx");
    const contextSource = readUtf8(contextPath);
    const drawerSource = readUtf8(drawerPath);

    expect(contextSource).toContain('body: JSON.stringify({ action: "mark_reviewed" })');
    expect(contextSource).toContain("Marked ${existing.question_id} reviewed.");
    expect(drawerSource).toContain("Row action failed");
  });

  it("exposes copy-answer action with explicit success and failure feedback", () => {
    const root = repoRootFromWebPackage();
    const contextPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageContext.tsx");
    const drawerPath = path.join(root, "apps/web/app/(app)/matters/[id]/RowDetailDrawer.tsx");
    const contextSource = readUtf8(contextPath);
    const drawerSource = readUtf8(drawerPath);

    expect(drawerSource).toContain("Copy answer");
    expect(contextSource).toContain("Copied extracted answer for ${existing.question_id}.");
    expect(contextSource).toContain("CLIPBOARD_UNAVAILABLE");
    expect(contextSource).toContain("Copy extracted answer failed.");
  });
});
