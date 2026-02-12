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

function extractDemoPackIdsFromToolbarSource(src: string): string[] {
  const match = src.match(/const PACK_OPTIONS\s*=\s*\[((?:.|\n)*?)\]\s*as const;/);
  if (!match) return [];
  const block = match[1] ?? "";
  return [...block.matchAll(/id:\s*"([^"]+)"/g)].map((m) => m[1]).filter(Boolean);
}

describe("0007 demo checklist", () => {
  it("stays in sync with the demo toolbar UI flow", () => {
    const root = repoRootFromWebPackage();

    const checklistPath = path.join(
      root,
      "docs/04-projects/02-features/0007_demo-reliability/demo-checklist.md",
    );
    expect(fs.existsSync(checklistPath)).toBe(true);
    const checklist = readUtf8(checklistPath);

    const demoToolbarPath = path.join(root, "apps/web/app/DemoToolbar.tsx");
    const demoToolbar = readUtf8(demoToolbarPath);
    const packIds = extractDemoPackIdsFromToolbarSource(demoToolbar);

    // If this ever goes empty, the toolbar structure changed; update this guard.
    expect(packIds.length).toBeGreaterThan(0);
    for (const id of packIds) {
      expect(checklist).toContain(id);
    }

    // Keep operator-facing copy aligned with the UI buttons/flag.
    expect(demoToolbar).toMatch(/Load demo pack/i);
    expect(checklist).toMatch(/Load demo pack/i);
    expect(checklist).toContain("DEMO_MODE=1");

    const quickStartPanelPath = path.join(root, "apps/web/app/(app)/matters/[id]/QuickStartPanel.tsx");
    const quickStartPanel = readUtf8(quickStartPanelPath);
    expect(quickStartPanel).toContain("Run Quick Start");
    expect(checklist).toContain("Run Quick Start");

    // Checklist should match the matter gating semantics.
    expect(checklist).toContain("indexed");
    expect(checklist).toContain("ready");
    expect(checklist).toContain("load the pack again to create a fresh matter");
  });
});
