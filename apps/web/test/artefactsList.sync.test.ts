import fs from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromWebPackage(): string {
  return path.resolve(process.cwd(), "../..");
}

function readUtf8(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

describe("US-003 artefacts list parity", () => {
  it("renders kind/type/safety filter inputs and keeps source provenance column visible", () => {
    const root = repoRootFromWebPackage();
    const listPath = path.join(root, "apps/web/app/(app)/matters/ArtefactsList.tsx");
    const source = readUtf8(listPath);

    expect(source).toContain('name={ARTEFACT_KIND_PARAM}');
    expect(source).toContain('name={ARTEFACT_TYPE_PARAM}');
    expect(source).toContain('name={ARTEFACT_SAFETY_PARAM}');
    expect(source).toContain("<TH>Source run</TH>");
    expect(source).toContain("{artefact.source_run_id ?? \"—\"}");
  });

  it("passes matter search params into artefacts list filtering", () => {
    const root = repoRootFromWebPackage();
    const pagePath = path.join(root, "apps/web/app/(app)/matters/[id]/page.tsx");
    const source = readUtf8(pagePath);

    expect(source).toContain("<ArtefactsList folderId={folderId} searchParams={rawSearchParams} />");
  });
});
