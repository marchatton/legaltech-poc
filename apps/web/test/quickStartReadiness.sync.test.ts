import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-004 quick start readiness reasons", () => {
  it("publishes explicit ready/blocked/already-complete copy states", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const quickStartPath = path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx");

    const pageSource = readUtf8(pagePath);
    const quickStartSource = readUtf8(quickStartPath);

    expect(quickStartSource).toContain('type QuickStartReadinessState = "ready" | "blocked" | "already-complete"');
    expect(quickStartSource).toContain('disabled={props.readiness.state !== "ready"}');
    expect(quickStartSource).toContain("Ready");
    expect(quickStartSource).toContain("Blocked");
    expect(quickStartSource).toContain("Already complete");

    expect(pageSource).toContain('state: "ready"');
    expect(pageSource).toContain('state: "blocked"');
    expect(pageSource).toContain('state: "already-complete"');
    expect(pageSource).toContain("Upload a PDF and refresh readiness before running Quick Start.");
    expect(pageSource).toContain("Quick Start completed. Review outputs below.");
  });
});
