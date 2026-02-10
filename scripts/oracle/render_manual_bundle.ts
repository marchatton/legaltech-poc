import fs from "node:fs";
import path from "node:path";

type BundleOpts = {
  prompt: string;
  outPath: string;
};

const EXCLUDED_DIRS = new Set([
  ".git",
  ".next",
  ".turbo",
  "build",
  "coverage",
  "dist",
  "node_modules",
  "tmp",
]);

const ALLOWED_EXTS = new Set([
  ".ts",
  ".tsx",
  ".js",
  ".css",
  ".md",
  ".json",
  ".yaml",
  ".yml",
  ".d.ts",
]);

function isExcludedFile(relPath: string): boolean {
  const base = path.posix.basename(relPath);
  if (base === ".DS_Store") return true;
  if (base.startsWith(".env")) return true;

  // Keep bundles tight; tests usually aren't needed for a paste-in review.
  if (relPath.includes(".test.")) return true;
  if (relPath.includes(".e2e.")) return true;
  if (relPath.includes(".sync.test.")) return true;

  // Generated.
  if (base.endsWith(".tsbuildinfo")) return true;

  return false;
}

function codeFenceLang(relPath: string): string {
  if (relPath.endsWith(".d.ts")) return "ts";
  const ext = path.posix.extname(relPath);
  if (ext === ".ts") return "ts";
  if (ext === ".tsx") return "tsx";
  if (ext === ".js") return "js";
  if (ext === ".css") return "css";
  if (ext === ".md") return "md";
  if (ext === ".json") return "json";
  if (ext === ".yaml" || ext === ".yml") return "yaml";
  return "";
}

function walkFiles(repoRoot: string, relDir: string): string[] {
  const absDir = path.resolve(repoRoot, relDir);
  if (!fs.existsSync(absDir)) return [];

  const out: string[] = [];
  const entries = fs.readdirSync(absDir, { withFileTypes: true });
  for (const ent of entries) {
    if (ent.isDirectory()) {
      if (EXCLUDED_DIRS.has(ent.name)) continue;
      out.push(...walkFiles(repoRoot, path.posix.join(relDir, ent.name)));
      continue;
    }

    if (!ent.isFile()) continue;
    const relPath = path.posix.join(relDir, ent.name);
    if (isExcludedFile(relPath)) continue;

    const ext = ent.name.endsWith(".d.ts") ? ".d.ts" : path.posix.extname(ent.name);
    if (!ALLOWED_EXTS.has(ext)) continue;

    out.push(relPath);
  }
  return out;
}

function readUtf8(repoRoot: string, relPath: string): string {
  const abs = path.resolve(repoRoot, relPath);
  return fs.readFileSync(abs, "utf8");
}

function renderBundle(repoRoot: string, opts: BundleOpts, files: string[]): string {
  const fence = "`````";

  const sections: string[] = [];
  sections.push("[SYSTEM]");
  sections.push("You are Oracle, a focused one-shot problem solver. Emphasize direct answers and cite any files referenced.");
  sections.push("");
  sections.push("[USER]");
  sections.push(opts.prompt.trim());
  sections.push("");

  for (const relPath of files) {
    const lang = codeFenceLang(relPath);
    const body = readUtf8(repoRoot, relPath);
    sections.push(`### File: ${relPath}`);
    sections.push(`${fence}${lang}`);
    sections.push(body);
    if (!body.endsWith("\n")) sections.push("");
    sections.push(fence);
    sections.push("");
  }

  return sections.join("\n");
}

function collectDefaultFiles(repoRoot: string): string[] {
  const fixed = [
    "AGENTS.md",
    "README.md",
    "package.json",
    "pnpm-workspace.yaml",
    "apps/web/AGENTS.md",
    "apps/web/package.json",
    "apps/web/next.config.js",
    "apps/web/middleware.ts",
    "apps/web/tailwind.config.ts",
    "apps/web/tailwind.preset.ts",
    "apps/web/postcss.config.js",
    "apps/web/.eslintrc.json",
    "apps/web/vitest.config.ts",
    "apps/web/tsconfig.json",
    "packages/core/package.json",
    "packages/core/tsconfig.json",
    "packages/core/tsconfig.build.json",
  ].filter((p) => fs.existsSync(path.resolve(repoRoot, p)));

  const walked = [
    ...walkFiles(repoRoot, "apps/web/app"),
    ...walkFiles(repoRoot, "apps/web/lib"),
    ...walkFiles(repoRoot, "apps/web/scripts"),
    ...walkFiles(repoRoot, "packages/core/src"),
  ];

  const seen = new Set<string>();
  const all = [...fixed, ...walked]
    .map((p) => p.split(path.sep).join("/"))
    .filter((p) => !isExcludedFile(p))
    .filter((p) => {
      if (seen.has(p)) return false;
      seen.add(p);
      return true;
    })
    .sort((a, b) => a.localeCompare(b));

  return all;
}

function main(): void {
  const repoRoot = process.cwd();

  const outPath = "docs/98-tmp/oracle/oracle-bundle_code-simplicity_2026-02-10.md";
  const prompt =
    "Ruthless code simplicity review (YAGNI) for orbital-poc. Focus on apps/web (Next.js App Router) and packages/core. Identify unnecessary abstractions, duplicate logic, dead/spike code that can be deleted or moved, and propose specific refactors with file references + estimated LOC reduction. Keep behaviour; prefer deleting code over adding deps. Output: Core purpose; Unnecessary complexity; Code to remove; Recommendations; YAGNI violations.";

  const files = collectDefaultFiles(repoRoot);
  const rendered = renderBundle(repoRoot, { prompt, outPath }, files);

  fs.mkdirSync(path.dirname(path.resolve(repoRoot, outPath)), { recursive: true });
  fs.writeFileSync(path.resolve(repoRoot, outPath), rendered, "utf8");

  // eslint-disable-next-line no-console
  console.log(`Wrote ${outPath} (${files.length} files).`);
}

main();

