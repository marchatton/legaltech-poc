import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { detectMissingDocs } from "../missing-docs/detectMissingDocs";

function parseArgs(argv: string[]) {
  const args = new Map<string, string>();
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (!a.startsWith("--")) continue;
    const key = a.slice(2);
    const val = argv[i + 1] && !argv[i + 1].startsWith("--") ? argv[i + 1] : "true";
    args.set(key, val);
    if (val !== "true") i += 1;
  }
  return args;
}

const ManifestSchema = z.object({
  pack_id: z.string(),
  documents: z.array(
    z.object({
      filename: z.string(),
      role: z.string().optional(),
      anchors_file: z.string().optional(),
    }),
  ),
});

async function extractPageText(pdfPath: string, pageNumber: number): Promise<string> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = fs.readFileSync(pdfPath);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();
  const items = (textContent.items ?? []) as any[];
  return items.map((it) => String(it.str ?? "")).join(" ");
}

function loadJson<T>(p: string): T {
  return JSON.parse(fs.readFileSync(p, "utf8")) as T;
}

function pickTitleCommitment(manifest: z.infer<typeof ManifestSchema>) {
  const doc =
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\\.pdf$/i.test(d.filename));
  if (!doc) throw new Error(`Could not find TitleCommitment.pdf in manifest for ${manifest.pack_id}`);
  return doc;
}

function getScheduleBiiPageFromAnchors(packRoot: string, anchorsFileRel?: string): number {
  if (!anchorsFileRel) return 3;
  const anchorsPath = path.join(packRoot, anchorsFileRel);
  const anchors = loadJson<Record<string, { page: number }>>(anchorsPath);
  return anchors["SCHEDULE_BII_HEADER"]?.page ?? 3;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh5";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const packs = ["pack_01_clean", "pack_02_missing_rea"] as const;

  const perPack: any[] = [];
  for (const packId of packs) {
    const packRoot = path.join(root, "docs/08-example-data", packId);
    const manifest = ManifestSchema.parse(loadJson(path.join(packRoot, "manifest.json")));

    const title = pickTitleCommitment(manifest);
    const titlePdfPath = path.join(packRoot, "docs", title.filename);
    const pageNumber = getScheduleBiiPageFromAnchors(packRoot, title.anchors_file);
    const text = await extractPageText(titlePdfPath, pageNumber);

    const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\\.pdf$/i.test(f));

    perPack.push(
      detectMissingDocs({
        packId,
        providedFilenames,
        referenceText: text,
        referenceSource: { source: title.filename, page: pageNumber },
      }),
    );
  }

  const pack01 = perPack.find((r) => r.pack_id === "pack_01_clean");
  const pack02 = perPack.find((r) => r.pack_id === "pack_02_missing_rea");

  const fp = (pack01?.missing_docs?.length ?? 0) > 0 ? 1 : 0;
  const fn =
    pack02?.missing_docs?.some((d: any) => String(d.label).toLowerCase() === "rea.pdf") === true ? 0 : 1;

  const summary = [
    `# RH5 missing-doc detection summary`,
    ``,
    `- pack_01_clean missing count: ${pack01?.missing_docs?.length ?? 0}`,
    `- pack_02_missing_rea missing count: ${pack02?.missing_docs?.length ?? 0}`,
    `- False positives (pack_01): ${fp}`,
    `- False negatives (pack_02 for REA): ${fn}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results: perPack }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();
