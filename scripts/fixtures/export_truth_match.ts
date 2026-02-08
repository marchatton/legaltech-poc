import { readFile, writeFile, mkdir } from "node:fs/promises";
import fs from "node:fs";
import path from "node:path";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { bboxCenter, bboxContainsPoint, polygonsToBBox } from "./lib/geometry.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type AnchorBox = {
  page: number;
  bbox: readonly [number, number, number, number];
};

type AnchorFile = Record<string, AnchorBox>;

type ManifestDoc = {
  filename: string;
  anchors_file?: string;
};

type Manifest = {
  pack_id: string;
  documents: ManifestDoc[];
};

type ExportMismatch = {
  code: string; // canonical taxonomy code
  kind: string;
  dataset: string;
  message: string;
  expected_path: string;
  actual_path: string;
  details?: unknown;
};

type DatasetResult = {
  dataset: string;
  status: "pass" | "fail";
  expected_path: string;
  actual_path: string;
  mismatch?: ExportMismatch;
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

function normaliseLf(text: string): string {
  const lf = text.replace(/\r\n/g, "\n");
  const lines = lf.split("\n");
  // Treat trailing blank lines as non-semantic noise; keep exactly one trailing LF.
  while (lines.length && lines[lines.length - 1]?.trim() === "") lines.pop();
  return lines.join("\n") + "\n";
}

function escapeCsvField(val: string): string {
  const needsQuotes = /[",\n\r]/.test(val);
  if (!needsQuotes) return val;
  return `"${val.replace(/"/g, "\"\"")}"`;
}

function writeCsv(headers: string[], rows: Array<Record<string, string>>): string {
  const lines: string[] = [];
  lines.push(headers.join(","));
  for (const r of rows) {
    const fields = headers.map((h) => escapeCsvField(String(r[h] ?? "")));
    lines.push(fields.join(","));
  }
  return lines.join("\n") + "\n";
}

const MONTHS = [
  "",
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

function formatMonthDayYear(iso: string): string | null {
  const m = iso.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!m) return null;
  const yyyy = Number(m[1]);
  const mm = Number(m[2]);
  const dd = Number(m[3]);
  if (!Number.isFinite(yyyy) || !Number.isFinite(mm) || !Number.isFinite(dd)) return null;
  if (mm < 1 || mm > 12) return null;
  if (dd < 1 || dd > 31) return null;
  const monthName = MONTHS[mm] ?? null;
  if (!monthName) return null;
  return `${monthName} ${String(dd).padStart(2, "0")}, ${String(yyyy)}`;
}

function loadManifest(packId: string): Manifest {
  const manifestPath = path.resolve(packRoot(packId), "manifest.json");
  if (!fs.existsSync(manifestPath)) throw new Error(`manifest.json not found for pack: ${packId}`);
  const raw = JSON.parse(fs.readFileSync(manifestPath, "utf8")) as unknown;
  if (!isRecord(raw)) throw new Error(`manifest.json must be an object: ${manifestPath}`);
  const docsRaw = raw.documents;
  if (!Array.isArray(docsRaw)) throw new Error(`manifest.json documents must be an array: ${manifestPath}`);
  const documents: ManifestDoc[] = [];
  for (const d of docsRaw) {
    if (!isRecord(d)) continue;
    const filename = typeof d.filename === "string" ? d.filename : "";
    if (!filename.trim()) continue;
    const anchors_file = typeof d.anchors_file === "string" && d.anchors_file.trim() ? d.anchors_file.trim() : undefined;
    documents.push({ filename, anchors_file });
  }
  const pid = typeof raw.pack_id === "string" && raw.pack_id.trim() ? raw.pack_id.trim() : packId;
  return { pack_id: pid, documents };
}

function anchorsPathFor(manifest: Manifest, packRootDir: string, docFilename: string): string | null {
  const doc = manifest.documents.find((d) => d.filename === docFilename) ?? null;
  if (!doc?.anchors_file) return null;
  return path.join(packRootDir, doc.anchors_file);
}

function inferAnchorsPath(packRootDir: string, docFilename: string): string {
  const base = docFilename.replace(/\.[^.]+$/, "");
  return path.join(packRootDir, "layout", `${base}.anchors.json`);
}

async function anchorIdForCitation(args: {
  packId: string;
  manifest: Manifest;
  docFilename: string;
  pageNumber: number;
  polygons: unknown;
}): Promise<string | null> {
  const root = packRoot(args.packId);
  const anchorsPath = anchorsPathFor(args.manifest, root, args.docFilename) ?? inferAnchorsPath(root, args.docFilename);
  if (!fs.existsSync(anchorsPath)) return null;

  const anchors = await readJsonFile<AnchorFile>(anchorsPath);
  if (!isRecord(anchors)) return null;

  const bbox = polygonsToBBox(Array.isArray(args.polygons) ? (args.polygons as any) : []);
  if (!bbox) return null;
  const center = bboxCenter(bbox);

  const matches: string[] = [];
  for (const [anchorId, box] of Object.entries(anchors)) {
    if (!box || typeof box !== "object") continue;
    const page = (box as any).page;
    const bboxVal = (box as any).bbox;
    if (page !== args.pageNumber) continue;
    if (!Array.isArray(bboxVal) || bboxVal.length !== 4) continue;
    const [x0, y0, x1, y1] = bboxVal;
    if (![x0, y0, x1, y1].every((n) => typeof n === "number" && Number.isFinite(n))) continue;
    if (bboxContainsPoint([x0, y0, x1, y1] as const, center)) matches.push(anchorId);
  }

  if (!matches.length) return null;
  matches.sort();
  return matches[0]!;
}

function findPayloadRow(snapshot: any, kind: string) {
  for (const row of snapshot.rows) {
    if (!row) continue;
    if (row.payload_schema_version !== "list_payload_v0") continue;
    if (!row.payload_json || !isRecord(row.payload_json)) continue;
    if (row.payload_json.kind === kind) return row;
  }
  return null;
}

function pickPrimaryCitationId(citationIds: unknown): string | null {
  const ids = Array.isArray(citationIds) ? citationIds.filter((x) => typeof x === "string" && x.trim()) : [];
  if (!ids.length) return null;
  ids.sort();
  return ids[0]!;
}

async function exportRequirements(args: {
  packId: string;
  manifest: Manifest;
  snapshot: any;
}): Promise<{ headers: string[]; rows: Array<Record<string, string>> }> {
  const row = findPayloadRow(args.snapshot, "requirements_tracker");
  if (!row) throw new Error("requirements_tracker payload not found in snapshot");

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "requirements_tracker_item") : [];

  items.sort((a: any, b: any) => Number(a?.bi_item ?? 0) - Number(b?.bi_item ?? 0));

  const headers = ["bi_item", "requirement", "owner", "status", "citation_doc", "citation_anchor"];
  const rows: Array<Record<string, string>> = [];

  for (const it of items) {
    const cid = pickPrimaryCitationId(it.citation_ids);
    if (!cid) throw new Error(`requirements_tracker_item missing citation_ids (bi_item=${String(it?.bi_item ?? "?")})`);
    const cit = args.snapshot.citations?.[cid];
    if (!cit) throw new Error(`requirements_tracker_item citation missing: ${cid}`);

    const docFilename = String(cit.document_filename ?? "");
    const pageNumber = Number(cit.page_number ?? 0);
    const anchorId =
      docFilename && Number.isFinite(pageNumber)
        ? await anchorIdForCitation({ packId: args.packId, manifest: args.manifest, docFilename, pageNumber, polygons: cit.polygons })
        : null;
    if (!anchorId) throw new Error(`requirements_tracker_item could not resolve anchor for citation: ${cid}`);

    rows.push({
      bi_item: String(it.bi_item ?? ""),
      requirement: String(it.requirement ?? ""),
      owner: String(it.owner ?? ""),
      status: String(it.item_status ?? ""),
      citation_doc: docFilename,
      citation_anchor: anchorId,
    });
  }

  return { headers, rows };
}

async function exportExceptions(args: {
  packId: string;
  manifest: Manifest;
  snapshot: any;
}): Promise<{ headers: string[]; rows: Array<Record<string, string>> }> {
  const row = findPayloadRow(args.snapshot, "exceptions_table");
  if (!row) throw new Error("exceptions_table payload not found in snapshot");

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "exceptions_table_item") : [];

  items.sort((a: any, b: any) => Number(a?.bii_item ?? 0) - Number(b?.bii_item ?? 0));

  const headers = [
    "bii_item",
    "type",
    "instrument_no",
    "recorded",
    "doc",
    "risk_tags",
    "status",
    "citation_doc",
    "citation_anchor",
  ];

  const rows: Array<Record<string, string>> = [];

  for (const it of items) {
    const cid = pickPrimaryCitationId(it.citation_ids);
    if (!cid) throw new Error(`exceptions_table_item missing citation_ids (bii_item=${String(it?.bii_item ?? "?")})`);
    const cit = args.snapshot.citations?.[cid];
    if (!cit) throw new Error(`exceptions_table_item citation missing: ${cid}`);

    const docFilename = String(cit.document_filename ?? "");
    const pageNumber = Number(cit.page_number ?? 0);
    const anchorId =
      docFilename && Number.isFinite(pageNumber)
        ? await anchorIdForCitation({ packId: args.packId, manifest: args.manifest, docFilename, pageNumber, polygons: cit.polygons })
        : null;
    if (!anchorId) throw new Error(`exceptions_table_item could not resolve anchor for citation: ${cid}`);

    const recordedIso = typeof it.recorded_date === "string" ? it.recorded_date : "";
    const recorded = recordedIso ? formatMonthDayYear(recordedIso) ?? "" : "";

    const tags = Array.isArray(it.risk_tags)
      ? it.risk_tags
          .map((t: any) => String(t ?? "").trim())
          .filter(Boolean)
          .sort()
          .join(";")
      : "";

    rows.push({
      bii_item: String(it.bii_item ?? ""),
      type: String(it.type ?? ""),
      instrument_no: it.instrument_no ? String(it.instrument_no) : "",
      recorded,
      doc: it.doc ? String(it.doc) : "",
      risk_tags: tags,
      status: String(it.item_status ?? ""),
      citation_doc: docFilename,
      citation_anchor: anchorId,
    });
  }

  return { headers, rows };
}

async function exportSurveyIssues(args: {
  packId: string;
  manifest: Manifest;
  snapshot: any;
}): Promise<{ headers: string[]; rows: Array<Record<string, string>> }> {
  const row = findPayloadRow(args.snapshot, "survey_issues");
  if (!row) throw new Error("survey_issues payload not found in snapshot");

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "survey_issue_item") : [];

  // Keep a stable sort; only the truth-match packs are in scope for this harness slice.
  items.sort((a: any, b: any) => String(a?.item_id ?? "").localeCompare(String(b?.item_id ?? "")));

  const headers = ["issue_type", "description", "impact", "suggested_fix", "citation_doc", "citation_anchor"];
  const rows: Array<Record<string, string>> = [];

  for (const it of items) {
    const cid = pickPrimaryCitationId(it.citation_ids);
    if (!cid) throw new Error(`survey_issue_item missing citation_ids (issue_type=${String(it?.issue_type ?? "?")})`);
    const cit = args.snapshot.citations?.[cid];
    if (!cit) throw new Error(`survey_issue_item citation missing: ${cid}`);

    const docFilename = String(cit.document_filename ?? "");
    const pageNumber = Number(cit.page_number ?? 0);
    const anchorId =
      docFilename && Number.isFinite(pageNumber)
        ? await anchorIdForCitation({ packId: args.packId, manifest: args.manifest, docFilename, pageNumber, polygons: cit.polygons })
        : null;
    if (!anchorId) throw new Error(`survey_issue_item could not resolve anchor for citation: ${cid}`);

    rows.push({
      issue_type: String(it.issue_type ?? ""),
      description: String(it.description ?? ""),
      impact: it.impact ? String(it.impact) : "",
      suggested_fix: it.suggested_fix ? String(it.suggested_fix) : "",
      citation_doc: docFilename,
      citation_anchor: anchorId,
    });
  }

  return { headers, rows };
}

async function exportSurveyCertParties(args: {
  packId: string;
  manifest: Manifest;
  snapshot: any;
}): Promise<{ headers: string[]; rows: Array<Record<string, string>> }> {
  const row = findPayloadRow(args.snapshot, "survey_certification_parties");
  if (!row) throw new Error("survey_certification_parties payload not found in snapshot");

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items)
    ? payload.items.filter((i: any) => i?.kind === "survey_certification_party_item")
    : [];

  items.sort((a: any, b: any) => String(a?.party_name ?? "").localeCompare(String(b?.party_name ?? "")));

  const headers = ["party_name", "citation_doc", "citation_anchor"];
  const rows: Array<Record<string, string>> = [];

  for (const it of items) {
    const cid = pickPrimaryCitationId(it.citation_ids);
    if (!cid) throw new Error(`survey_certification_party_item missing citation_ids (party_name=${String(it?.party_name ?? "?")})`);
    const cit = args.snapshot.citations?.[cid];
    if (!cit) throw new Error(`survey_certification_party_item citation missing: ${cid}`);

    const docFilename = String(cit.document_filename ?? "");
    const pageNumber = Number(cit.page_number ?? 0);
    const anchorId =
      docFilename && Number.isFinite(pageNumber)
        ? await anchorIdForCitation({ packId: args.packId, manifest: args.manifest, docFilename, pageNumber, polygons: cit.polygons })
        : null;
    if (!anchorId) throw new Error(`survey_certification_party_item could not resolve anchor for citation: ${cid}`);

    rows.push({
      party_name: String(it.party_name ?? ""),
      citation_doc: docFilename,
      citation_anchor: anchorId,
    });
  }

  return { headers, rows };
}

type DatasetExporter = (args: { packId: string; manifest: Manifest; snapshot: any }) => Promise<{ headers: string[]; rows: Array<Record<string, string>> }>;

const DATASETS: Array<{
  dataset: string;
  truth_filename: string;
  hasPayload: (snapshot: any) => boolean;
  export: DatasetExporter;
}> = [
  {
    dataset: "requirements_tracker_csv",
    truth_filename: "expected_requirements_tracker.csv",
    hasPayload: (s) => Boolean(findPayloadRow(s, "requirements_tracker")),
    export: exportRequirements,
  },
  {
    dataset: "exceptions_table_csv",
    truth_filename: "expected_exceptions_table.csv",
    hasPayload: (s) => Boolean(findPayloadRow(s, "exceptions_table")),
    export: exportExceptions,
  },
  {
    dataset: "survey_issues_csv",
    truth_filename: "expected_survey_issues.csv",
    hasPayload: (s) => Boolean(findPayloadRow(s, "survey_issues")),
    export: exportSurveyIssues,
  },
  {
    dataset: "survey_certification_parties_csv",
    truth_filename: "expected_survey_certification_parties.csv",
    hasPayload: (s) => Boolean(findPayloadRow(s, "survey_certification_parties")),
    export: exportSurveyCertParties,
  },
];

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = path.resolve(requireStringArg(args, "snapshot"));
  const outPath = getStringArg(args, "out") ? path.resolve(getStringArg(args, "out")!) : undefined;
  const outExportsDir = getStringArg(args, "out-exports-dir") ? path.resolve(getStringArg(args, "out-exports-dir")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);
  const packId = snapshot.meta.pack_id;
  const root = packRoot(packId);
  const manifest = loadManifest(packId);

  const active = DATASETS.filter((d) => d.hasPayload(snapshot));
  if (!active.length) {
    throw new Error(
      "No exportable datasets found in snapshot. Provide list payload rows (payload_schema_version=list_payload_v0) for requirements_tracker, exceptions_table, survey_issues, or survey_certification_parties.",
    );
  }

  if (outExportsDir) await mkdir(outExportsDir, { recursive: true });

  const results: DatasetResult[] = [];

  for (const d of active) {
    const expectedPath = path.resolve(root, "truth", d.truth_filename);
    const actualPath = outExportsDir ? path.resolve(outExportsDir, d.truth_filename.replace(/^expected_/, "")) : path.resolve(root, "tmp");

    if (!fs.existsSync(expectedPath)) {
      results.push({
        dataset: d.dataset,
        status: "fail",
        expected_path: expectedPath,
        actual_path: actualPath,
        mismatch: {
          code: "EXPORT_FAIL",
          kind: "truth_missing",
          dataset: d.dataset,
          message: `truth file missing: ${path.relative(repoRoot(), expectedPath)}`,
          expected_path: expectedPath,
          actual_path: actualPath,
        },
      });
      continue;
    }

    try {
      const exported = await d.export({ packId, manifest, snapshot });
      const csv = writeCsv(exported.headers, exported.rows);

      if (outExportsDir) {
        await writeFile(actualPath, csv, "utf8");
      }

      const expectedText = normaliseLf(await readFile(expectedPath, "utf8"));
      const actualText = normaliseLf(csv);

      if (expectedText === actualText) {
        results.push({
          dataset: d.dataset,
          status: "pass",
          expected_path: expectedPath,
          actual_path: actualPath,
        });
        continue;
      }

      const expectedLines = expectedText.split("\n");
      const actualLines = actualText.split("\n");
      const expectedHeader = expectedLines[0] ?? "";
      const actualHeader = actualLines[0] ?? "";

      const mismatch: ExportMismatch =
        expectedHeader !== actualHeader
          ? {
              code: "EXPORT_FAIL",
              kind: "csv_header_mismatch",
              dataset: d.dataset,
              message: "CSV header mismatch (order or columns drift)",
              expected_path: expectedPath,
              actual_path: actualPath,
              details: { expected: expectedHeader, actual: actualHeader },
            }
          : {
              code: "EXPORT_FAIL",
              kind: "csv_content_mismatch",
              dataset: d.dataset,
              message: "CSV contents did not match expected truth (after LF normalization)",
              expected_path: expectedPath,
              actual_path: actualPath,
              details: (() => {
                const max = Math.max(expectedLines.length, actualLines.length);
                for (let i = 0; i < max; i++) {
                  const e = expectedLines[i] ?? "";
                  const a = actualLines[i] ?? "";
                  if (e !== a) return { first_diff_line: i + 1, expected: e, actual: a };
                }
                return { first_diff_line: null };
              })(),
            };

      results.push({
        dataset: d.dataset,
        status: "fail",
        expected_path: expectedPath,
        actual_path: actualPath,
        mismatch,
      });
    } catch (err) {
      results.push({
        dataset: d.dataset,
        status: "fail",
        expected_path: expectedPath,
        actual_path: actualPath,
        mismatch: {
          code: "EXPORT_FAIL",
          kind: "export_error",
          dataset: d.dataset,
          message: String((err as any)?.message ?? err),
          expected_path: expectedPath,
          actual_path: actualPath,
        },
      });
    }
  }

  const pass = results.every((r) => r.status === "pass");

  const out = {
    pass,
    pack_id: packId,
    snapshot_path: snapshotPath,
    datasets: results.map((r) => r.dataset),
    failures: results.filter((r) => r.status === "fail").map((r) => r.mismatch),
    exports_dir: outExportsDir,
    results,
  };

  if (outPath) await writeFile(outPath, JSON.stringify(out, null, 2) + "\n", "utf8");

  const label = path.basename(snapshotPath);
  if (pass) {
    process.stdout.write(`PASS export_truth_match (${packId}) snapshot=${label}\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL export_truth_match (${packId}) snapshot=${label}\n`);
  for (const r of results.filter((x) => x.status === "fail").slice(0, 20)) {
    const m = r.mismatch;
    process.stdout.write(`- ${r.dataset}: ${m?.code ?? "EXPORT_FAIL"} ${m?.kind ?? "mismatch"}\n`);
  }
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String((err as any)?.stack ?? err) + "\n");
  process.exit(2);
});
