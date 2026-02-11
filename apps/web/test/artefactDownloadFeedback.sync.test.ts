import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-004 download feedback and unsafe explanation parity", () => {
  it("wires artefact download feedback states and unsafe explanation affordances", () => {
    const root = repoRootFromWebPackage();
    const listPath = path.join(root, "apps/web/app/(app)/matters/ArtefactsList.tsx");
    const downloadButtonPath = path.join(root, "apps/web/app/(app)/matters/ArtefactDownloadButton.tsx");
    const unsafeBadgePath = path.join(root, "apps/web/app/(app)/matters/UnsafeArtefactBadge.tsx");

    const listSource = readUtf8(listPath);
    const downloadButtonSource = readUtf8(downloadButtonPath);
    const unsafeBadgeSource = readUtf8(unsafeBadgePath);

    expect(listSource).toContain("<ArtefactDownloadButton");
    expect(listSource).toContain("<UnsafeArtefactBadge");

    expect(downloadButtonSource).toContain("Preparing download...");
    expect(downloadButtonSource).toContain("Download started.");
    expect(downloadButtonSource).toContain("Signed link fresh for about");
    expect(downloadButtonSource).toContain("Download link is stale. Refresh this page for a fresh link.");

    expect(unsafeBadgeSource).toContain("<Tooltip");
    expect(unsafeBadgeSource).toContain("Generated with safety overrides. Verify citations before sharing.");
  });
});
