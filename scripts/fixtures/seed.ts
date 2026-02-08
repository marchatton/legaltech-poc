import fs from "node:fs";
import path from "node:path";

import { AnchorFileSchema, anchorBoxToPolygons, type AnchorBox } from "../../packages/core/src/geometry/anchors.ts";
import { hashSnippet } from "../../packages/core/src/citations/snippet.ts";
import { detectMissingDocs } from "../../packages/core/src/missing-docs/detectMissingDocs.ts";

import { parseArgs, getBoolArg, getStringArg } from "./lib/args.ts";

type FixtureManifest = {
  pack_id: string;
  expected_question_set_version?: string;
  documents: Array<{
    filename: string;
    role?: string;
    layout_file?: string;
    anchors_file?: string;
  }>;
};

type GoldenQuestion = {
  question_id: string;
  question: string;
  expected_answer_contains: string[];
  expected_citations: Array<{ doc: string; anchor: string }>;
};

type SeedSnapshot = {
  meta: {
    pack_id: string;
    run_id: string;
    index_version: string;
    agent_bundle_version: string;
    question_set_version?: string;
    generated_at: string;
  };
  rows: Array<{
    question_id: string;
    question: string;
    answer: string;
    status: "needs_review" | "reviewed" | "missing_input" | "citation_failed";
    citation_ids: string[];
    notes: string | null;
    payload_schema_version: string | null;
    payload_json: unknown;
    provenance_json: unknown;
  }>;
  citations: Record<
    string,
    {
      document_filename: string;
      page_number: number;
      polygons: ReturnType<typeof anchorBoxToPolygons>;
      snippet: string;
      snippet_hash: string;
    }
  >;
};

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function asNonEmptyString(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  return s ? s : null;
}

function readJsonFile(filePath: string): unknown {
  const raw = fs.readFileSync(filePath, "utf8");
  return JSON.parse(raw);
}

function writeJsonFile(filePath: string, value: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
}

function loadManifest(packRoot: string): FixtureManifest {
  const manifestPath = path.join(packRoot, "manifest.json");
  const raw = readJsonFile(manifestPath);
  if (!isRecord(raw)) throw new Error(`Invalid manifest.json (expected object): ${manifestPath}`);

  const pack_id = asNonEmptyString(raw.pack_id);
  if (!pack_id) throw new Error(`Invalid manifest.json (missing pack_id): ${manifestPath}`);

  const expected_question_set_version = asNonEmptyString(raw.expected_question_set_version) ?? undefined;

  const docsRaw = raw.documents;
  if (!Array.isArray(docsRaw)) throw new Error(`Invalid manifest.json (documents must be an array): ${manifestPath}`);

  const documents: FixtureManifest["documents"] = [];
  for (const d of docsRaw) {
    if (!isRecord(d)) continue;
    const filename = asNonEmptyString(d.filename);
    if (!filename) continue;
    const role = asNonEmptyString(d.role) ?? undefined;
    const layout_file = asNonEmptyString(d.layout_file) ?? undefined;
    const anchors_file = asNonEmptyString(d.anchors_file) ?? undefined;
    documents.push({ filename, role, layout_file, anchors_file });
  }

  return { pack_id, expected_question_set_version, documents };
}

function loadGoldenQuestions(packRoot: string): GoldenQuestion[] {
  const goldenPath = path.join(packRoot, "truth", "golden_questions.json");
  const raw = readJsonFile(goldenPath);
  if (!Array.isArray(raw)) throw new Error(`Invalid golden_questions.json (expected array): ${goldenPath}`);

  const out: GoldenQuestion[] = [];
  for (const q of raw) {
    if (!isRecord(q)) continue;
    const question_id = asNonEmptyString(q.question_id);
    const question = asNonEmptyString(q.question);
    if (!question_id || !question) continue;

    const expected_answer_contains: string[] = Array.isArray(q.expected_answer_contains)
      ? q.expected_answer_contains.map((s) => String(s)).filter(Boolean)
      : [];

    const expected_citations: Array<{ doc: string; anchor: string }> = [];
    if (Array.isArray(q.expected_citations)) {
      for (const c of q.expected_citations) {
        if (!isRecord(c)) continue;
        const doc = asNonEmptyString(c.doc);
        const anchor = asNonEmptyString(c.anchor);
        if (!doc || !anchor) continue;
        expected_citations.push({ doc, anchor });
      }
    }

    out.push({ question_id, question, expected_answer_contains, expected_citations });
  }

  return out;
}

function anchorsPathFor(manifest: FixtureManifest, packRoot: string, docFilename: string): string | null {
  const doc = manifest.documents.find((d) => d.filename === docFilename);
  if (!doc?.anchors_file) return null;
  return path.join(packRoot, doc.anchors_file);
}

type LayoutFile = {
  pages: Array<{
    page: number;
    lines: Array<{ text: string; anchor?: string }>;
  }>;
};

function pickTitleCommitmentDoc(manifest: FixtureManifest): FixtureManifest["documents"][number] | null {
  return (
    manifest.documents.find((d) => d.role === "title_commitment") ??
    manifest.documents.find((d) => /TitleCommitment\.pdf$/i.test(d.filename)) ??
    null
  );
}

function layoutPathFor(manifest: FixtureManifest, packRoot: string, docFilename: string): string | null {
  const doc = manifest.documents.find((d) => d.filename === docFilename);
  if (!doc?.layout_file) return null;
  return path.join(packRoot, doc.layout_file);
}

function loadScheduleBiiReference(args: {
  manifest: FixtureManifest;
  packRoot: string;
}): { ok: true; referenceText: string; referenceSource: { source: string; page: number } } | { ok: false; reason: string } {
  const title = pickTitleCommitmentDoc(args.manifest);
  if (!title) return { ok: false, reason: "NO_TITLE_COMMITMENT" };

  const layoutPath = layoutPathFor(args.manifest, args.packRoot, title.filename);
  if (!layoutPath) return { ok: false, reason: "NO_LAYOUT_FILE" };
  if (!fs.existsSync(layoutPath)) return { ok: false, reason: "LAYOUT_FILE_NOT_FOUND" };

  const layout = readJsonFile(layoutPath) as LayoutFile;
  const pages = Array.isArray((layout as any)?.pages) ? (layout as any).pages : null;
  if (!pages) return { ok: false, reason: "INVALID_LAYOUT_FILE" };

  // Prefer the anchored Schedule B-II header if present; fall back to page 3 (per RH5 harness).
  let pageNumber: number | null = null;
  for (const p of layout.pages) {
    for (const l of p.lines ?? []) {
      if (l?.anchor === "SCHEDULE_BII_HEADER") {
        pageNumber = p.page;
        break;
      }
    }
    if (pageNumber) break;
  }

  if (!pageNumber) {
    const fromAnchors = loadAnchorBbox({
      manifest: args.manifest,
      packRoot: args.packRoot,
      docFilename: title.filename,
      anchorId: "SCHEDULE_BII_HEADER",
    });
    pageNumber = fromAnchors.ok ? fromAnchors.anchor.page : 3;
  }

  const page = layout.pages.find((p) => p.page === pageNumber);
  if (!page) return { ok: false, reason: "SCHEDULE_BII_PAGE_NOT_FOUND" };

  const referenceText = page.lines.map((l) => String(l?.text ?? "")).filter(Boolean).join(" ");

  return {
    ok: true,
    referenceText,
    referenceSource: { source: title.filename, page: pageNumber },
  };
}

function loadAnchorBbox(args: {
  manifest: FixtureManifest;
  packRoot: string;
  docFilename: string;
  anchorId: string;
}): { ok: true; anchor: AnchorBox } | { ok: false; reason: string } {
  const anchorsPath = anchorsPathFor(args.manifest, args.packRoot, args.docFilename);
  if (!anchorsPath) return { ok: false, reason: "NO_ANCHORS_FILE" };

  const anchors = AnchorFileSchema.parse(readJsonFile(anchorsPath)) as Record<string, AnchorBox>;
  const anchor = anchors[args.anchorId];
  if (!anchor) return { ok: false, reason: "ANCHOR_NOT_FOUND" };
  return { ok: true, anchor };
}

function snippetFor(q: GoldenQuestion, c: { doc: string; anchor: string }): string {
  const expected = q.expected_answer_contains.length ? q.expected_answer_contains.join(" | ") : "(no expected text)";
  return `${c.doc}#${c.anchor}: ${expected}`;
}

function seedPack(packId: string, opts: { outRoot: string; overwrite: boolean; includeBadCitationRow: boolean }) {
  const repoRoot = process.cwd();
  const packRoot = path.resolve(repoRoot, "docs/08-example-data", packId);

  if (!fs.existsSync(packRoot)) {
    throw new Error(`Pack not found: ${packId} (expected ${packRoot})`);
  }

  const manifest = loadManifest(packRoot);
  const golden = loadGoldenQuestions(packRoot);

  const snapshot: SeedSnapshot = {
    meta: {
      pack_id: packId,
      run_id: "run_tracer_bullet",
      index_version: "v1",
      agent_bundle_version: "git:seed",
      question_set_version: manifest.expected_question_set_version,
      generated_at: new Date().toISOString(),
    },
    rows: [],
    citations: {},
  };

  // If the pack references missing documents (high-confidence), seed a canonical missing_input row with a structured checklist.
  // This is a tracer bullet for the missing-doc journey (US-007) and must satisfy missing_input invariants.
  const providedFilenames = manifest.documents.map((d) => d.filename).filter((f) => /\.pdf$/i.test(f));
  const ref = loadScheduleBiiReference({ manifest, packRoot });
  if (ref.ok) {
    const missing = detectMissingDocs({
      packId,
      providedFilenames,
      referenceText: ref.referenceText,
      referenceSource: ref.referenceSource,
    });

    if (missing.missing_docs.length > 0) {
      snapshot.rows.push({
        question_id: "TB-MISSING-INPUT",
        question: "Tracer bullet: missing docs -> missing_input with checklist",
        answer: "Not found in provided documents.",
        status: "missing_input",
        citation_ids: [],
        notes: null,
        payload_schema_version: null,
        payload_json: null,
        provenance_json: {
          missing_docs_pack_id: missing.pack_id,
          missing_docs_checklist: missing.missing_docs,
          missing_docs_candidates_low_confidence: missing.candidates_low_confidence ?? undefined,
        },
      });
    }
  }

  for (const q of golden) {
    const row = {
      question_id: q.question_id,
      question: q.question,
      answer: q.expected_answer_contains[0] ?? "(seeded answer)",
      status: "needs_review" as const,
      citation_ids: [] as string[],
      notes: null,
      payload_schema_version: null,
      payload_json: null,
      provenance_json: {},
    };

    for (let i = 0; i < q.expected_citations.length; i++) {
      const c = q.expected_citations[i]!;
      const cid = `cit_${q.question_id}_${i + 1}`;

      const anchorResult = loadAnchorBbox({
        manifest,
        packRoot,
        docFilename: c.doc,
        anchorId: c.anchor,
      });

      if (!anchorResult.ok) {
        row.status = "citation_failed";
        row.answer = "Citation verification failed.";
        row.provenance_json = { reason_code: anchorResult.reason };
        continue;
      }

      const polygons = anchorBoxToPolygons(anchorResult.anchor);
      const snippet = snippetFor(q, c);
      snapshot.citations[cid] = {
        document_filename: c.doc,
        page_number: anchorResult.anchor.page,
        polygons,
        snippet,
        snippet_hash: hashSnippet(snippet),
      };
      row.citation_ids.push(cid);
    }

    snapshot.rows.push(row);
  }

  if (opts.includeBadCitationRow) {
    const base = golden.find((q) => q.expected_citations.length)?.expected_citations[0];
    if (base) {
      const badId = "cit_TB_BAD_1";
      const anchorResult = loadAnchorBbox({
        manifest,
        packRoot,
        docFilename: base.doc,
        anchorId: base.anchor,
      });

      if (anchorResult.ok) {
        const snippet = `${base.doc}#${base.anchor}: (intentionally corrupted snippet_hash for fail-closed UX)`;
        snapshot.citations[badId] = {
          document_filename: base.doc,
          page_number: anchorResult.anchor.page,
          polygons: anchorBoxToPolygons(anchorResult.anchor),
          snippet,
          // Mismatch on purpose: this should deterministically fail citation verification.
          snippet_hash: hashSnippet(snippet + "x"),
        };

        snapshot.rows.push({
          question_id: "TB-BAD-CITATION",
          question: "Tracer bullet: corrupted citation should fail closed (no overlay)",
          answer: "Citation verification failed.",
          status: "citation_failed",
          citation_ids: [badId],
          notes: null,
          payload_schema_version: null,
          payload_json: null,
          provenance_json: { reason_code: "CITATION_MISMATCH" },
        });
      }
    }
  }

  const outDir = path.resolve(repoRoot, opts.outRoot, packId);
  const outPath = path.join(outDir, "snapshot.json");
  if (!opts.overwrite && fs.existsSync(outPath)) {
    throw new Error(`Refusing to overwrite existing seed snapshot: ${outPath} (pass --overwrite)`);
  }

  writeJsonFile(outPath, snapshot);
  process.stdout.write(`Seeded ${packId} -> ${path.relative(repoRoot, outPath)}\n`);
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const packIds = args._.filter(Boolean);
  if (!packIds.length) {
    process.stderr.write(
      [
        "Usage:",
        "  pnpm fixture:seed <pack_id...> [--out-root tmp/fixture-seed] [--overwrite] [--no-bad-citation]",
        "",
        "Examples:",
        "  pnpm fixture:seed pack_01_clean",
        "  pnpm fixture:seed pack_01_clean pack_02_missing_rea --overwrite",
        "",
      ].join("\n"),
    );
    process.exit(1);
  }

  const outRoot = getStringArg(args, "out-root") ?? "tmp/fixture-seed";
  const overwrite = getBoolArg(args, "overwrite");
  const includeBadCitationRow = !getBoolArg(args, "no-bad-citation");

  for (const packId of packIds) {
    seedPack(packId, { outRoot, overwrite, includeBadCitationRow });
  }
}

main();
