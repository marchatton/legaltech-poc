import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-002 progress stepper and checklist presence", () => {
  it("renders operator progress stepper in matter UI", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const checklistPath = path.join(root, "apps/web/app/(app)/matters/[id]/operatorChecklist.ts");

    const pageSource = readUtf8(pagePath);
    const checklistSource = readUtf8(checklistPath);

    expect(pageSource).toContain("Progress");
    expect(pageSource).toContain("operatorChecklistSteps");
    expect(pageSource).toContain("operatorChecklistSummary");
    expect(pageSource).toContain("Load Pack Again");

    expect(checklistSource).toContain("deriveOperatorChecklistSteps");
    expect(checklistSource).toContain("summarizeOperatorChecklist");
    expect(checklistSource).toContain("formatOperatorElapsedLabel");
  });
});
