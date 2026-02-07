import { readFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { parseArgs, getStringArg } from "./lib/args.ts";
import { walkFiles } from "./lib/fs.ts";

function extractCanonicalPackIds(packsSummaryMd: string): string[] {
  const ids = new Set<string>();
  for (const m of packsSummaryMd.matchAll(/`(pack_\d{2}_[a-z0-9_]+)`/gi)) {
    ids.add(m[1]);
  }
  return Array.from(ids).sort();
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const docsRoot = resolve(getStringArg(args, "docs-root") ?? "docs");
  const packsSummaryPath = resolve(getStringArg(args, "packs-summary") ?? "docs/08-example-data/packs_summary.md");

  const summaryText = await readFile(packsSummaryPath, "utf8");
  const canonical = extractCanonicalPackIds(summaryText);
  const canonicalSet = new Set(canonical);

  if (!canonical.length) {
    throw new Error(`No canonical pack IDs found in ${basename(packsSummaryPath)}`);
  }

  const errors: string[] = [];

  // 1) Directory check: every pack in packs_summary has a folder.
  for (const id of canonical) {
    const dir = resolve(`docs/08-example-data/${id}`);
    try {
      // eslint-disable-next-line no-await-in-loop
      await readFile(resolve(dir, "manifest.json"), "utf8");
    } catch {
      errors.push(`Missing pack folder or manifest.json for ${id} (expected docs/08-example-data/${id}/manifest.json)`);
    }
  }

  // 2) Reference check: scan docs/*.md (excluding tmp-oracle) for pack_* mentions.
  const mdFiles = await walkFiles(docsRoot, {
    includeExtensions: [".md"],
    excludeDirNames: ["tmp-oracle", "tmp-handoffs"],
  });

  const mentionRe = /\bpack_\d{2}_[a-z0-9_]+\b/gi;
  for (const file of mdFiles) {
    // Exclude the packs_summary itself (it is the source of truth).
    if (resolve(file) === packsSummaryPath) continue;

    // eslint-disable-next-line no-await-in-loop
    const text = await readFile(file, "utf8");
    const matches = text.match(mentionRe) ?? [];
    for (const m of matches) {
      const id = m;
      if (!canonicalSet.has(id)) {
        errors.push(`Non-canonical pack reference: ${id} in ${file}`);
      }
    }
  }

  if (!errors.length) {
    process.stdout.write(`PASS verify_pack_names (packs=${canonical.length})\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL verify_pack_names - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 50)) process.stdout.write(`- ${e}\n`);
  if (errors.length > 50) process.stdout.write("(showing first 50)\n");
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});
