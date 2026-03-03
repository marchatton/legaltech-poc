import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(p: string): string {
  return fs.readFileSync(p, "utf8");
}

describe("US-001 report triage tabs and dense table behavior", () => {
  it("wires row_tab URL synchronization helpers on matter detail page", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const helpersPath = path.join(root, "apps/web/app/(app)/matters/[id]/matterDetailHelpers.ts");
    const source = readUtf8(pagePath);
    const helpersSource = readUtf8(helpersPath);

    expect(source).toContain("parseReportTriageFilters");
    expect(source).toContain("reportTabHref");
    expect(source).toContain("triageFilters.rowTab");
    expect(helpersSource).toContain('params.set("row_tab", args.rowTab)');
    expect(helpersSource).toContain('{ id: "reviewed", label: "Reviewed" }');
    expect(helpersSource).toContain('{ id: "flagged", label: "Flagged" }');
  });

  it("renders dense table markers with sticky header", () => {
    const root = repoRootFromWebPackage();
    const tablePath = path.join(root, "apps/web/app/(app)/matters/[id]/ReportTriageTable.tsx");
    const source = readUtf8(tablePath);

    expect(source).toContain('TableFrame className="max-h-[34rem] shadow-ui-sm"');
    expect(source).toContain("sticky top-0 z-10");
    expect(source).toContain("Answer Preview");
    expect(source).toContain("aria-label={`Open row drawer for ${row.question_id}`}");
  });
});
