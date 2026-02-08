import { readFile, writeFile } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import { hashSnippet } from "../../packages/core/src/citations/snippet.ts";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type ManifestDoc = {
  filename: string;
  layout_file?: string;
  anchors_file?: string;
};

type Manifest = {
  pack_id: string;
  documents: ManifestDoc[];
};

type LayoutFile = {
  pages: Array<{ page: number }>;
};

type IntegrityError = {
  code: string; // canonical taxonomy code
  kind: string;
  question_id?: string;
  citation_id?: string;
  message: string;
  details?: unknown;
};

function repoRoot(): string {
  return process.cwd();
}

function packRoot(packId: string): string {
  return path.resolve(repoRoot(), "docs/08-example-data", packId);
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  return JSON.parse(await readFile(filePath, "utf8")) as T;
}

function asNonEmptyString(val: unknown): string | null {
  return typeof val === "string" && val.trim() ? val.trim() : null;
}

function asPositiveInt(val: unknown): number | null {
  if (typeof val !== "number" || !Number.isFinite(val)) return null;
  if (!Number.isInteger(val) || val <= 0) return null;
  return val;
}

function validatePolygons(polygons: unknown): { ok: true } | { ok: false; message: string } {
  if (!Array.isArray(polygons) || polygons.length < 1) return { ok: false, message: "polygons must be a non-empty array" };
  for (const poly of polygons) {
    if (!Array.isArray(poly) || poly.length < 3) return { ok: false, message: "each polygon must have >= 3 points" };
    for (const pt of poly) {
      if (!Array.isArray(pt) || pt.length !== 2) return { ok: false, message: "each point must be a [x,y] tuple" };
      const [x, y] = pt;
      if (typeof x !== "number" || typeof y !== "number") return { ok: false, message: "polygon points must be numbers" };
      if (!Number.isFinite(x) || !Number.isFinite(y)) return { ok: false, message: "polygon points must be finite numbers" };
      if (x < 0 || x > 1 || y < 0 || y > 1) return { ok: false, message: "polygon points must be in [0..1]" };
    }
  }
  return { ok: true };
}

function loadManifest(packId: string): Manifest {
  const manifestPath = path.resolve(packRoot(packId), "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json not found for pack: ${packId}`);
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
  if (!isRecord(raw)) throw new Error(`manifest.json must be an object: ${manifestPath}`);

  const pid = asNonEmptyString(raw.pack_id) ?? packId;
  const docsRaw = raw.documents;
  if (!Array.isArray(docsRaw)) throw new Error(`manifest.json documents must be an array: ${manifestPath}`);

  const documents: ManifestDoc[] = [];
  for (const d of docsRaw) {
    if (!isRecord(d)) continue;
    const filename = asNonEmptyString(d.filename);
    if (!filename) continue;
    const layout_file = asNonEmptyString(d.layout_file) ?? undefined;
    const anchors_file = asNonEmptyString(d.anchors_file) ?? undefined;
    documents.push({ filename, layout_file, anchors_file });
  }

  return { pack_id: pid, documents };
}

function findDoc(manifest: Manifest, filename: string): ManifestDoc | null {
  return manifest.documents.find((d) => d.filename === filename) ?? null;
}

function layoutPathFor(manifest: Manifest, packRootDir: string, filename: string): string | null {
  const doc = findDoc(manifest, filename);
  if (!doc?.layout_file) return null;
  return path.join(packRootDir, doc.layout_file);
}

async function pageExists(args: { packId: string; manifest: Manifest; docFilename: string; pageNumber: number }): Promise<boolean> {
  const root = packRoot(args.packId);
  const layoutPath = layoutPathFor(args.manifest, root, args.docFilename);
  if (layoutPath && fs.existsSync(layoutPath)) {
    const layout = await readJsonFile<LayoutFile>(layoutPath);
    const pages = Array.isArray((layout as any)?.pages) ? (layout as any).pages : [];
    return pages.some((p: any) => typeof p?.page === "number" && p.page === args.pageNumber);
  }

  const producedDocsPath = path.resolve(root, "produced", "documents.json");
  if (fs.existsSync(producedDocsPath)) {
    const docs = await readJsonFile<Array<{ filename: string; page_count: number }>>(producedDocsPath);
    const found = docs.find((d) => d.filename === args.docFilename);
    if (found && typeof found.page_count === "number" && Number.isFinite(found.page_count) && found.page_count > 0) {
      return args.pageNumber >= 1 && args.pageNumber <= found.page_count;
    }
  }

  // No layout/documents index to validate against.
  throw new Error(`No layout_file or produced/documents.json to validate page for doc=${args.docFilename}`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = path.resolve(requireStringArg(args, "snapshot"));
  const outPath = getStringArg(args, "out") ? path.resolve(getStringArg(args, "out")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);
  const packId = snapshot.meta.pack_id;
  const manifest = loadManifest(packId);

  const errors: IntegrityError[] = [];

  const checked: Array<{ question_id: string; citation_id: string }> = [];

  for (const row of snapshot.rows) {
    if (!row || typeof row !== "object") continue;
    if (row.status !== "needs_review" && row.status !== "reviewed") continue;

    const qid = row.question_id;
    const cids = Array.isArray(row.citation_ids) ? row.citation_ids.filter((x) => typeof x === "string" && x.trim()) : [];

    for (const cid of cids) {
      checked.push({ question_id: qid, citation_id: cid });

      const cit = (snapshot.citations as any)[cid];
      if (!cit || typeof cit !== "object") {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "citation_missing",
          question_id: qid,
          citation_id: cid,
          message: "citation_id did not resolve in snapshot.citations",
        });
        continue;
      }

      const docFilename = asNonEmptyString(cit.document_filename);
      const pageNumber = asPositiveInt(cit.page_number);
      const snippet = typeof cit.snippet === "string" ? cit.snippet : null;
      const snippetHash = asNonEmptyString(cit.snippet_hash);

      if (!docFilename || !pageNumber || snippet === null || !snippetHash) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "citation_invalid",
          question_id: qid,
          citation_id: cid,
          message: "citation must include document_filename, page_number, snippet, and snippet_hash",
          details: { document_filename: cit.document_filename, page_number: cit.page_number },
        });
        continue;
      }

      try {
        const ok = await pageExists({ packId, manifest, docFilename, pageNumber });
        if (!ok) {
          errors.push({
            code: "VALIDATION_ERROR",
            kind: "page_out_of_bounds",
            question_id: qid,
            citation_id: cid,
            message: `cited page does not exist in document (doc=${docFilename} page=${pageNumber})`,
          });
        }
      } catch (err) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "page_validation_unavailable",
          question_id: qid,
          citation_id: cid,
          message: `could not validate cited page exists (doc=${docFilename} page=${pageNumber})`,
          details: { error: String((err as any)?.message ?? err) },
        });
      }

      const polyCheck = validatePolygons(cit.polygons);
      if (!polyCheck.ok) {
        errors.push({
          code: "VALIDATION_ERROR",
          kind: "missing_polygons",
          question_id: qid,
          citation_id: cid,
          message: `polygons invalid: ${polyCheck.message}`,
        });
      }

      const computed = hashSnippet(snippet);
      if (computed !== snippetHash) {
        errors.push({
          code: "CITATION_MISMATCH",
          kind: "snippet_hash_mismatch",
          question_id: qid,
          citation_id: cid,
          message: "snippet_hash did not match the canonical hash of snippet",
          details: { expected: computed, actual: snippetHash },
        });
      }
    }
  }

  const result = {
    pass: errors.length === 0,
    snapshot_path: snapshotPath,
    pack_id: packId,
    checked_citations: checked.length,
    error_count: errors.length,
    errors,
  };

  if (outPath) await writeFile(outPath, JSON.stringify(result, null, 2) + "\n", "utf8");

  if (result.pass) {
    process.stdout.write(`PASS citation integrity (${packId}) citations=${checked.length}\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL citation integrity (${packId}) - ${errors.length} error(s)\n`);
  for (const e of errors.slice(0, 20)) {
    process.stdout.write(`- ${e.question_id ?? "(no question_id)"}: ${e.code} ${e.kind}: ${e.message}\n`);
  }
  if (errors.length > 20) process.stdout.write(`(showing first 20)\n`);
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String((err as any)?.stack ?? err) + "\n");
  process.exit(2);
});
