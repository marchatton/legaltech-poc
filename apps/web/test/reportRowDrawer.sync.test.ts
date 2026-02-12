import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-002 row drawer decision surface", () => {
  it("renders drawer sections for payload, citations, and metadata", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain("Structured payload");
    expect(source).toContain("Citation summary");
    expect(source).toContain("Metadata");
    expect(source).toContain("model/version");
    expect(source).toContain("doc_version");
    expect(source).toContain("verified_at");
    expect(source).toContain("loaded_state");
    expect(source).toContain("Unavailable from payload");
  });

  it("wires mark reviewed action with explicit success and error feedback", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain('action: "mark_reviewed"');
    expect(source).toContain("Marked");
    expect(source).toContain("ErrorBanner");
    expect(source).toContain("Row action failed");
  });

  it("exposes copy actions with explicit success and failure feedback", () => {
    const root = repoRootFromWebPackage();
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriagePanel.tsx");
    const source = readUtf8(panelPath);

    expect(source).toContain("Copy answer");
    expect(source).toContain("Copy payload");
    expect(source).toContain("Copied extracted answer");
    expect(source).toContain("Copied structured payload");
    expect(source).toContain("CLIPBOARD_UNAVAILABLE");
    expect(source).toContain("Copy extracted answer failed.");
    expect(source).toContain("Copy structured payload failed.");
  });
});
