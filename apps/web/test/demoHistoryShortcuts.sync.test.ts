import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-003 repeat-load and demo-history shortcuts", () => {
  it("keeps toolbar and history reopen shortcuts visible", () => {
    const root = repoRootFromWebPackage();
    const toolbarPath = path.join(root, "apps/web/app/DemoToolbar.tsx");
    const mattersPagePath = path.join(root, "apps/web/app/(app)/matters/page.tsx");

    const toolbarSource = readUtf8(toolbarPath);
    const mattersPageSource = readUtf8(mattersPagePath);

    expect(toolbarSource).toContain("DEMO MODE");
    expect(toolbarSource).toContain("Demo Controls");
    expect(toolbarSource).toContain("Allowlisted packs");
    expect(toolbarSource).toMatch(/Load (?:Demo Pack|pack again)/i);
    expect(mattersPageSource).toContain("SAVED_VIEW_OPTIONS");
    expect(mattersPageSource).toContain('{ label: "Needs Attention", value: "needs_attention" }');
  });

  it("does not hardcode wireframe sample history rows", () => {
    const root = repoRootFromWebPackage();
    const mattersPagePath = path.join(root, "apps/web/app/(app)/matters/page.tsx");
    const mattersPageSource = readUtf8(mattersPagePath);

    expect(mattersPageSource).not.toContain("Acme Corp v. GlobalTech");
    expect(mattersPageSource).not.toContain("Estate of Margaret Chen");
    expect(mattersPageSource).not.toContain("Meridian Holdings");
  });
});
