import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const SKIP_DIRS = new Set([
  ".git",
  ".next",
  ".ralph",
  "dist",
  "docs",
  "node_modules",
  "tmp",
]);

function* walkTsFiles(dirPath: string): IterableIterator<string> {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  for (const e of entries) {
    const full = path.join(dirPath, e.name);
    if (e.isDirectory()) {
      if (SKIP_DIRS.has(e.name)) continue;
      yield* walkTsFiles(full);
      continue;
    }
    if (!e.isFile()) continue;
    if (full.endsWith(".ts") || full.endsWith(".tsx")) yield full;
  }
}

function findDefinitionFiles(repoRoot: string, fnName: string): string[] {
  const fnRe = new RegExp(String.raw`^\s*(?:export\s+)?function\s+${fnName}\s*\(`, "m");
  const varRe = new RegExp(String.raw`^\s*(?:export\s+)?(?:const|let|var)\s+${fnName}\s*=`, "m");

  const hits: string[] = [];
  for (const filePath of walkTsFiles(repoRoot)) {
    const contents = fs.readFileSync(filePath, "utf8");
    if (fnRe.test(contents) || varRe.test(contents)) hits.push(filePath);
  }
  return hits.sort();
}

describe("snippet hashing single source of truth", () => {
  it("keeps normaliseSnippet() + hashSnippet() implemented once (core)", () => {
    const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
    const coreSrcRoot = path.join(repoRoot, "packages/core/src") + path.sep;

    const normaliseDefs = findDefinitionFiles(repoRoot, "normaliseSnippet");
    const hashDefs = findDefinitionFiles(repoRoot, "hashSnippet");

    expect(normaliseDefs).toHaveLength(1);
    expect(hashDefs).toHaveLength(1);

    expect(normaliseDefs[0]?.startsWith(coreSrcRoot)).toBe(true);
    expect(hashDefs[0]?.startsWith(coreSrcRoot)).toBe(true);
  });
});

