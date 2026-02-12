import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-002 matters list controls and actions", () => {
  it("renders q/state/view controls and needs_attention saved view", () => {
    const root = repoRootFromWebPackage();
    const mattersPagePath = path.join(root, "apps/web/app/(app)/matters/page.tsx");
    const source = readUtf8(mattersPagePath);

    expect(source).toContain('name="q"');
    expect(source).toContain('name="state"');
    expect(source).toContain('name="view"');
    expect(source).toContain('value: "needs_attention"');
    expect(source).toContain('aria-pressed={isActive}');
    expect(source).toContain("buildQueryString({ ...filters, view: nextView }");
    expect(source).toContain("href={href}");
    expect(source).toContain("buildQueryString");
    expect(source).toContain("No matters matched the current filters.");
    expect(source).toContain("Reset filters");
    expect(source).toContain('href="/matters"');
  });

  it("renders create and open affordances", () => {
    const root = repoRootFromWebPackage();
    const mattersPagePath = path.join(root, "apps/web/app/(app)/matters/page.tsx");
    const createFormPath = path.join(root, "apps/web/app/(app)/matters/CreateMatterForm.tsx");

    const pageSource = readUtf8(mattersPagePath);
    const createSource = readUtf8(createFormPath);

    expect(pageSource).toContain("ArrowRightIcon");
    expect(pageSource).toContain("`/matters/${encodeURIComponent(matter.id)}`");
    expect(createSource).toContain("New Matter");
    expect(createSource).toContain("Matter name is required.");
    expect(createSource).toContain('variant="destructive"');
  });
});
