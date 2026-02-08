import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

import { matchExceptionToInstrumentDocs } from "./matchExceptionsToInstrumentDocs";

type LayoutFile = {
  pages: Array<{
    page: number;
    lines: Array<{ text: string; anchor?: string }>;
  }>;
};

function repoRoot(): string {
  // Vitest runs with cwd at the package root when invoked via `pnpm -r`.
  return path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
}

function readJson(filePath: string): any {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function extractInstrumentNoFromRecInfo(layout: LayoutFile): string | null {
  for (const p of layout.pages ?? []) {
    for (const l of p.lines ?? []) {
      if (l?.anchor !== "REC_INFO") continue;
      const t = String(l?.text ?? "");
      const m = t.match(/\bInstrument\s+No\.\s*:?\s*([A-Za-z0-9-]+)\b/i);
      if (m?.[1]) return m[1];
    }
  }
  return null;
}

describe("matchExceptionToInstrumentDocs", () => {
  it("marks ambiguous when more than one candidate matches", () => {
    const res = matchExceptionToInstrumentDocs({
      instrument_no: "2018-195028",
      instrument_docs: [
        { doc: "A.pdf", instrument_no: "2018-195028" },
        { doc: "B.pdf", instrument_no: "2018-195028" },
      ],
    });
    expect(res.match_status).toBe("ambiguous");
    expect(res.doc).toBe(null);
    expect(res.candidates?.map((c) => c.doc)).toEqual(["A.pdf", "B.pdf"]);
  });

  it("matches pack_01_clean instrument numbers to unique docs", () => {
    const packRoot = path.resolve(repoRoot(), "docs/08-example-data/pack_01_clean");
    const manifest = readJson(path.join(packRoot, "manifest.json")) as any;
    const docs: Array<{ filename: string; layout_file?: string }> = Array.isArray(manifest?.documents) ? manifest.documents : [];

    const instrument_docs = docs
      .filter((d) => typeof d?.filename === "string" && /\.pdf$/i.test(d.filename) && typeof d?.layout_file === "string")
      .map((d) => {
        const layout = readJson(path.join(packRoot, String(d.layout_file))) as LayoutFile;
        // Treat only PDFs with a REC_INFO anchor as instrument candidates. This excludes
        // TitleCommitment.pdf, which can contain instrument numbers but is not an instrument.
        return { doc: String(d.filename), instrument_no: extractInstrumentNoFromRecInfo(layout) };
      })
      // Only instrument PDFs have a REC_INFO anchor in the synthetic pack.
      .filter((d) => d.instrument_no);

    const expectations: Array<{ instrument_no: string; doc: string }> = [
      { instrument_no: "2018-195028", doc: "Utility_Easement.pdf" },
      { instrument_no: "2019-202947", doc: "Ingress_Egress_Easement.pdf" },
      { instrument_no: "2020-210866", doc: "CCRs.pdf" },
      { instrument_no: "2021-218785", doc: "REA.pdf" },
      { instrument_no: "2022-226704", doc: "Memorandum_of_Lease.pdf" },
    ];

    for (const ex of expectations) {
      const res = matchExceptionToInstrumentDocs({ instrument_no: ex.instrument_no, instrument_docs });
      expect(res.match_status).toBe("matched");
      expect(res.doc).toBe(ex.doc);
    }
  });

  it("marks missing_doc for missing REA in pack_02_missing_rea", () => {
    const packRoot = path.resolve(repoRoot(), "docs/08-example-data/pack_02_missing_rea");
    const manifest = readJson(path.join(packRoot, "manifest.json")) as any;
    const docs: Array<{ filename: string; layout_file?: string }> = Array.isArray(manifest?.documents) ? manifest.documents : [];

    const instrument_docs = docs
      .filter((d) => typeof d?.filename === "string" && /\.pdf$/i.test(d.filename) && typeof d?.layout_file === "string")
      .map((d) => {
        const layout = readJson(path.join(packRoot, String(d.layout_file))) as LayoutFile;
        return { doc: String(d.filename), instrument_no: extractInstrumentNoFromRecInfo(layout) };
      })
      .filter((d) => d.instrument_no);

    const res = matchExceptionToInstrumentDocs({ instrument_no: "2018-986928", instrument_docs });
    expect(res.match_status).toBe("missing_doc");
    expect(res.doc).toBe(null);
  });
});
