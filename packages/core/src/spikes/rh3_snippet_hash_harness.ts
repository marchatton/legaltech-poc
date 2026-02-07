import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashSnippet, normaliseSnippet } from "../citations/snippet";

type ExtractedSnippet = {
  doc: string;
  page: number | null;
  phrase: string;
  raw: string;
  normalised: string;
  snippet_hash: string;
};

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

async function loadPdfTextForPage(pdfPath: string, pageNumber: number): Promise<string> {
  // pdf.js in Node: use legacy build and disable worker for simplicity.
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");

  const data = fs.readFileSync(pdfPath);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;
  const page = await pdf.getPage(pageNumber);
  const textContent = await page.getTextContent();

  const items = (textContent.items ?? []) as any[];
  return items.map((it) => String(it.str ?? "")).join(" ");
}

async function findPhraseSnippet(opts: {
  pdfPath: string;
  phrase: string;
  maxPagesToScan: number;
  windowChars: number;
}): Promise<{ page: number | null; snippet: string }> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const data = fs.readFileSync(opts.pdfPath);
  const loadingTask = pdfjs.getDocument({ data, disableWorker: true });
  const pdf = await loadingTask.promise;

  const pageCount = Number(pdf.numPages ?? 0);
  const maxPages = Math.min(pageCount, opts.maxPagesToScan);

  const phraseLower = opts.phrase.toLowerCase();

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const text = await loadPdfTextForPage(opts.pdfPath, pageNumber);
    const idx = text.toLowerCase().indexOf(phraseLower);
    if (idx === -1) continue;

    const start = Math.max(0, idx - Math.floor(opts.windowChars / 2));
    const end = Math.min(text.length, start + opts.windowChars);
    return { page: pageNumber, snippet: text.slice(start, end) };
  }

  return { page: null, snippet: "" };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const run = args.get("run") ?? "run1";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh3";
  const phrase = args.get("phrase") ?? "18W18 Acquisition LLC";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const docs = [
    {
      name: "TitleCommitment.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/TitleCommitment.pdf"),
    },
    {
      name: "ALTA_Survey.pdf",
      path: path.join(root, "docs/08-example-data/pack_01_clean/docs/ALTA_Survey.pdf"),
    },
  ];

  const extracted: ExtractedSnippet[] = [];
  for (const doc of docs) {
    const { page, snippet } = await findPhraseSnippet({
      pdfPath: doc.path,
      phrase,
      maxPagesToScan: 10,
      windowChars: 200,
    });

    const normalised = normaliseSnippet(snippet);
    extracted.push({
      doc: doc.name,
      page,
      phrase,
      raw: snippet,
      normalised,
      snippet_hash: hashSnippet(snippet),
    });
  }

  const output = {
    run,
    createdAt: new Date().toISOString(),
    phrase,
    snippets: extracted,
  };

  const outPath = path.join(root, outDir, `${run}.json`);
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2) + "\n", "utf8");
  process.stdout.write(`Wrote ${outPath}\n`);
}

await main();
