import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-006 run/report failure envelopes", () => {
  it("keeps typed failure envelopes explicit across run and report surfaces", () => {
    const root = repoRootFromWebPackage();
    const runRoutePath = path.join(root, "apps/web/app/(api)/runs/[id]/route.ts");
    const reportRoutePath = path.join(root, "apps/web/app/(api)/folders/[id]/report/route.ts");
    const matterPagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");

    const runRouteSource = readUtf8(runRoutePath);
    const reportRouteSource = readUtf8(reportRoutePath);
    const matterPageSource = readUtf8(matterPagePath);

    expect(runRouteSource).toContain("deriveRunFailureEnvelope");
    expect(runRouteSource).toContain("failure: deriveRunFailureEnvelope({");

    expect(reportRouteSource).toContain("active_run:");
    expect(reportRouteSource).toContain("failure: deriveRunFailureEnvelope({");
    expect(reportRouteSource).toContain("if (activeRun && activeRun.state !== \"completed\")");

    expect(matterPageSource).toContain("title=\"Latest run needs attention\"");
    expect(matterPageSource).toContain("Showing report history from completed run");
    expect(matterPageSource).toContain("Analysis is still running. Report rows will appear when processing finishes.");
    expect(matterPageSource).toContain("Analysis in progress");
    expect(matterPageSource).toContain("Run report unavailable");
  });
});
