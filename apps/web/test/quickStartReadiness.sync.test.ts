import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-002 quick start readiness gate", () => {
  it("derives quick start enablement from canonical readiness only", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const actionPath = path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartActionButton.tsx");

    const pageSource = readUtf8(pagePath);
    const actionSource = readUtf8(actionPath);

    expect(pageSource).toContain("const canonicalReadiness = resolveCanonicalReadiness({");
    expect(pageSource).toContain('canonicalReadiness.state !== "runnable"');
    expect(pageSource).toContain('state: "blocked"');
    expect(pageSource).toContain('state: "ready"');
    expect(pageSource).not.toContain('state: "already-complete"');
    expect(pageSource).toContain("Upload a PDF and refresh readiness before running Quick Start.");

    expect(actionSource).toContain('const blocked = props.readiness.state !== "ready"');
    expect(actionSource).toContain("disabled={blocked}");
  });
});
