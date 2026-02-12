import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-010 export blocking state contract", () => {
  it("keeps export controls run-state gated and refresh-deterministic", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const panelPath = path.join(root, "apps/web/app/(app)/matters/[id]/ExportsPanel.tsx");
    const csvPath = path.join(root, "apps/web/app/(app)/matters/ExportCsvButton.tsx");

    const pageSource = readUtf8(pagePath);
    const panelSource = readUtf8(panelPath);
    const csvSource = readUtf8(csvPath);

    expect(pageSource).not.toContain("AND state = 'completed'");
    expect(panelSource).toContain("Exports are available once the selected run completes.");
    expect(panelSource).toContain("runState={selectedRun?.status ?? null}");
    expect(csvSource).toContain("exportDisabledReason({ runId: props.runId, runStatus: props.runState })");
    expect(csvSource).toContain("}, [props.runId, props.runState]);");
    expect(csvSource).toContain("disabled={Boolean(disabled)}");
  });
});
