import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-002 fixture context banner presence", () => {
  it("renders explicit fixture context fields in matter UI", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const bannerPath = path.join(root, "apps/web/app/(app)/matters/[id]/fixtureContextBanner.ts");

    const pageSource = readUtf8(pagePath);
    const bannerSource = readUtf8(bannerPath);

    expect(pageSource).toContain("Quick Start context");
    expect(pageSource).toContain("fixtureStatusLabel");
    expect(pageSource).toContain("activePack");
    expect(pageSource).toContain("loaded_at");
    expect(pageSource).toContain("load_state");
    expect(pageSource).toContain("next_step");
    expect(pageSource).toContain("Load Pack Again");
    expect(pageSource).toContain("deriveFixtureContextBanner");

    expect(bannerSource).toContain("loadStateFromReadiness");
    expect(bannerSource).toContain("loadedAt");
    expect(bannerSource).toContain("nextStep");
  });
});
