import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { hashSnippet, normaliseSnippet } from "@legaltech-poc/core/citations/snippet";

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

function readPdfBytes(pdfPath: string): Uint8Array {
  // pdf.js v4 rejects `Buffer` instances; provide a plain Uint8Array view.
  const buf = fs.readFileSync(pdfPath);
  return new Uint8Array(buf.buffer, buf.byteOffset, buf.byteLength);
}

async function findPhraseSnippet(opts: {
  pdfPath: string;
  phrase: string;
  maxPagesToScan: number;
  windowChars: number;
}): Promise<{ page: number | null; snippet: string }> {
  const pdfjs: any = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const loadingTask = pdfjs.getDocument({ data: readPdfBytes(opts.pdfPath), disableWorker: true });
  const pdf = await loadingTask.promise;

  const pageCount = Number(pdf.numPages ?? 0);
  const maxPages = Math.min(pageCount, opts.maxPagesToScan);

  const phraseLower = opts.phrase.toLowerCase();

  for (let pageNumber = 1; pageNumber <= maxPages; pageNumber += 1) {
    const page = await pdf.getPage(pageNumber);
    const textContent = await page.getTextContent();
    const items = (textContent.items ?? []) as any[];
    const text = items.map((it) => String(it.str ?? "")).join(" ");
    const idx = text.toLowerCase().indexOf(phraseLower);
    if (idx === -1) continue;

    const start = Math.max(0, idx - Math.floor(opts.windowChars / 2));
    const end = Math.min(text.length, start + opts.windowChars);
    return { page: pageNumber, snippet: text.slice(start, end) };
  }

  return { page: null, snippet: "" };
}

function readHarnessOutput(filePath: string): {
  run: string;
  phrase: string;
  snippets: ExtractedSnippet[];
} {
  const raw = fs.readFileSync(filePath, "utf8");
  const json = JSON.parse(raw) as unknown;
  if (!json || typeof json !== "object") throw new Error(`Invalid JSON: ${filePath}`);

  const run = (json as any).run;
  const phrase = (json as any).phrase;
  const snippets = (json as any).snippets;
  if (typeof run !== "string") throw new Error(`Invalid run field: ${filePath}`);
  if (typeof phrase !== "string") throw new Error(`Invalid phrase field: ${filePath}`);
  if (!Array.isArray(snippets)) throw new Error(`Invalid snippets field: ${filePath}`);
  return { run, phrase, snippets: snippets as ExtractedSnippet[] };
}

function compareHarnessRuns(args: {
  root: string;
  outDir: string;
  runA: string;
  runB: string;
}): void {
  const aPath = path.join(args.root, args.outDir, `${args.runA}.json`);
  const bPath = path.join(args.root, args.outDir, `${args.runB}.json`);

  if (!fs.existsSync(aPath)) throw new Error(`Missing run output: ${aPath}`);
  if (!fs.existsSync(bPath)) throw new Error(`Missing run output: ${bPath}`);

  const a = readHarnessOutput(aPath);
  const b = readHarnessOutput(bPath);

  const aByDoc = new Map(a.snippets.map((s) => [s.doc, s.snippet_hash] as const));
  const bByDoc = new Map(b.snippets.map((s) => [s.doc, s.snippet_hash] as const));

  const docs = new Set<string>([...aByDoc.keys(), ...bByDoc.keys()]);
  const mismatches: Array<{ doc: string; a: string | null; b: string | null }> = [];
  for (const doc of docs) {
    const hashA = aByDoc.get(doc) ?? null;
    const hashB = bByDoc.get(doc) ?? null;
    if (hashA !== hashB) mismatches.push({ doc, a: hashA, b: hashB });
  }

  if (mismatches.length) {
    process.stderr.write(`RH3 hash stability: FAIL (${args.runA} vs ${args.runB})\n`);
    for (const m of mismatches) {
      process.stderr.write(`- ${m.doc}: ${String(m.a)} != ${String(m.b)}\n`);
    }
    process.exitCode = 1;
    return;
  }

  process.stdout.write(`RH3 hash stability: PASS (${args.runA} vs ${args.runB})\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  const run = args.get("run") ?? "run1";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh3";
  const phrase = args.get("phrase") ?? "18W18 Acquisition LLC";
  const compareWith = args.get("compareWith") ?? null;

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

  if (compareWith) {
    compareHarnessRuns({ root, outDir, runA: compareWith, runB: run });
  }
}

await main();
