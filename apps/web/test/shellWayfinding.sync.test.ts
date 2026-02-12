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
    const mattersPagePath = path.join(root, "apps/web/app/(app)/matters/page.tsx");
    const sidebarPath = path.join(root, "apps/web/app/ui/WorkspaceSidebar.tsx");
    const layoutSource = readUtf8(shellLayoutPath);
    const mattersPageSource = readUtf8(mattersPagePath);
    const sidebarSource = readUtf8(sidebarPath);

    expect(layoutSource).toContain('WorkspaceSidebar active="matters"');
    expect(mattersPageSource).toContain("WorkspaceContextBar");
    expect(mattersPageSource).toContain("resolveShellEnvironment");
    expect(sidebarSource).toContain('href: "/matters"');
    expect(sidebarSource).toContain('aria-current={isActive ? "page" : undefined}');
    expect(sidebarSource).toContain("Runs");
    expect(sidebarSource).toContain("Alerts");
    expect(sidebarSource).toContain("Settings");
    expect(sidebarSource).toContain('aria-disabled="true"');
  });

  it("renders detail breadcrumb and sticky identifier context", () => {
    const root = repoRootFromWebPackage();
    const detailLayoutPath = path.join(root, "apps/web/app/(app)/matters/[id]/layout.tsx");
    const shellEnvironmentPath = path.join(root, "apps/web/app/(app)/matters/shellEnvironment.ts");
    const shellPrimitivesPath = path.join(root, "apps/web/app/ui/WorkspaceShell.tsx");
    const source = readUtf8(detailLayoutPath);
    const shellEnvironmentSource = readUtf8(shellEnvironmentPath);
    const shellPrimitives = readUtf8(shellPrimitivesPath);

    expect(source).toContain("Matters");
    expect(source).toContain('<polyline points="9 18 15 12 9 6" />');
    expect(source).toContain("folderName");
    expect(source).toContain("resolveShellEnvironment");
    expect(source).toContain("WorkspaceContextBar");
    expect(source).toContain('truncate font-medium text-foreground');
    expect(source).toContain("{shellEnvironment.label}");
    expect(shellEnvironmentSource).toContain('label: "demo-dev"');
    expect(shellEnvironmentSource).toContain('label: "demo-prod"');
    expect(shellPrimitives).toContain("sticky top-[var(--app-topbar-height,3rem)]");
  });
});
