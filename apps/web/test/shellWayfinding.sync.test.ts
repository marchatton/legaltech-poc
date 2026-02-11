import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  // Vitest runs with cwd = `apps/web` (via `pnpm --filter @orbital-poc/web test`).
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-001 shell wayfinding baseline", () => {
  it("renders matters as active and keeps placeholder destinations visible", () => {
    const root = repoRootFromWebPackage();
    const shellLayoutPath = path.join(root, "apps/web/app/(app)/matters/layout.tsx");
    const source = readUtf8(shellLayoutPath);

    expect(source).toContain('href="/matters"');
    expect(source).toContain('aria-current="page"');

    expect(source).toContain("Runs");
    expect(source).toContain("Alerts");
    expect(source).toContain("Settings");
    expect(source).toContain("disabled");
  });

  it("renders detail breadcrumb and sticky identifier context", () => {
    const root = repoRootFromWebPackage();
    const detailLayoutPath = path.join(root, "apps/web/app/(app)/matters/[id]/layout.tsx");
    const source = readUtf8(detailLayoutPath);

    expect(source).toContain("Matters");
    expect(source).toContain("BreadcrumbSeparator");
    expect(source).toContain("folderName");
    expect(source).toContain("Matter ID");
    expect(source).toContain("<MonoId>");
    expect(source).toContain("sticky");
  });
});
