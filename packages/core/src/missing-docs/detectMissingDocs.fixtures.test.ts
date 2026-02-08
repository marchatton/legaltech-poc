import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { detectMissingDocs } from "./detectMissingDocs";

type Manifest = {
  pack_id: string;
  documents: Array<{
    filename: string;
    role?: string;
    layout_file?: string;
  }>;
};

type LayoutFile = {
  pages: Array<{
    page: number;
    lines: Array<{ text: string; anchor?: string }>;
  }>;
};

function repoRoot(): string {
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function pickTitleCommitment(manifest: Manifest) {
  const doc =
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\.pdf$/i.test(d.filename));
  if (!doc) throw new Error(`Could not find TitleCommitment.pdf in manifest for ${manifest.pack_id}`);
  if (!doc.layout_file) throw new Error(`TitleCommitment is missing layout_file in manifest for ${manifest.pack_id}`);
  return doc;
}

function scheduleBiiPageNumber(layout: LayoutFile): number {
  for (const p of layout.pages) {
    for (const l of p.lines) {
      if (l.anchor === "SCHEDULE_BII_HEADER") return p.page;
    }
  }
  // RH5 harness default
  return 3;
}

function scheduleBiiPageText(packRoot: string, layoutFileRel: string): { page: number; text: string } {
  const layout = loadJson<LayoutFile>(path.join(packRoot, layoutFileRel));
  const pageNumber = scheduleBiiPageNumber(layout);
  const page = layout.pages.find((p) => p.page === pageNumber);
  if (!page) throw new Error(`Could not find schedule B-II page ${pageNumber} in layout: ${layoutFileRel}`);
  const text = page.lines.map((l) => l.text).filter(Boolean).join(" ");
  return { page: pageNumber, text };
}

describe("detectMissingDocs (fixture packs)", () => {
  it("flags REA.pdf in pack_02_missing_rea and has FP=0 on pack_01_clean", () => {
    const root = repoRoot();

    const run = (packId: "pack_01_clean" | "pack_02_missing_rea") => {
      const packRoot = path.join(root, "docs/08-example-data", packId);
      const manifest = loadJson<Manifest>(path.join(packRoot, "manifest.json"));
      const title = pickTitleCommitment(manifest);
      const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\.pdf$/i.test(f));

      const { page, text } = scheduleBiiPageText(packRoot, title.layout_file!);

      return detectMissingDocs({
        packId,
        providedFilenames,
        referenceText: text,
        referenceSource: { source: title.filename, page },
      });
    };

    const pack01 = run("pack_01_clean");
    expect(pack01.missing_docs).toHaveLength(0);

    const pack02 = run("pack_02_missing_rea");
    const rea = pack02.missing_docs.find((d) => d.label.toLowerCase() === "rea.pdf");
    expect(rea).toBeTruthy();
    expect(rea?.confidence).toBeGreaterThanOrEqual(0.8);
    expect(rea?.signals.length).toBeGreaterThan(0);
    expect(rea?.signals.some((s) => s.source === "TitleCommitment.pdf")).toBe(true);
  });
});

