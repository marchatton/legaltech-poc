import { readFile, writeFile } from "node:fs/promises";
import { basename, resolve } from "node:path";

import { parseArgs, getStringArg, requireStringArg } from "./lib/args.ts";
import { parseCsv } from "./lib/csv.ts";
import { bboxCenter, bboxContainsPoint, polygonsToBBox } from "./lib/geometry.ts";
import { assertIsSnapshot, isRecord } from "./lib/snapshot.ts";

type AnchorBox = {
  page: number;
  bbox: readonly [number, number, number, number];
};

type AnchorFile = Record<string, AnchorBox>;

type DiffItem = {
  key: string;
  field: string;
  expected: string | null;
  actual: string | null;
};

type CitationMismatch = {
  key: string;
  expected_doc: string;
  expected_anchor: string;
  message: string;
  checked_citation_ids: string[];
};

type DatasetDiff = {
  dataset: string;
  pass: boolean;
  expected_count: number;
  actual_count: number;
  missing_keys: string[];
  extra_keys: string[];
  field_mismatches: DiffItem[];
  citation_mismatches: CitationMismatch[];
};

function norm_ws(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

function norm_instrument_no(input: string): string {
  return input.toUpperCase().replace(/\s+/g, "").replace(/[^A-Z0-9-]/g, "");
}

const MONTHS: Record<string, number> = {
  january: 1,
  february: 2,
  march: 3,
  april: 4,
  may: 5,
  june: 6,
  july: 7,
  august: 8,
  september: 9,
  october: 10,
  november: 11,
  december: 12,
};

function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n);
}

function norm_date(input: string): string | null {
  const s = norm_ws(input);
  if (!s) return null;

  // ISO
  const iso = s.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) return `${iso[1]}-${iso[2]}-${iso[3]}`;

  // MM/DD/YYYY
  const mdY = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (mdY) {
    const mm = Number(mdY[1]);
    const dd = Number(mdY[2]);
    const yyyy = Number(mdY[3]);
    if (!mm || !dd || !yyyy) return null;
    return `${yyyy}-${pad2(mm)}-${pad2(dd)}`;
  }

  // "Month DD, YYYY"
  const m = s.match(/^([A-Za-z]+)\s+(\d{1,2}),\s*(\d{4})$/);
  if (m) {
    const month = MONTHS[m[1].toLowerCase()];
    const day = Number(m[2]);
    const year = Number(m[3]);
    if (!month || !day || !year) return null;
    return `${year}-${pad2(month)}-${pad2(day)}`;
  }

  return null;
}

function norm_tags(input: string): string {
  const parts = input
    .split(";")
    .map((p) => p.trim().toLowerCase())
    .filter(Boolean)
    .sort();
  return parts.join(";");
}

async function readJson<T>(path: string): Promise<T> {
  return JSON.parse(await readFile(path, "utf8")) as T;
}

function docToAnchorsFilename(docFilename: string): string {
  const base = docFilename.replace(/\.pdf$/i, "");
  return `${base}.anchors.json`;
}

async function loadAnchors(packId: string, docFilename: string): Promise<AnchorFile> {
  const anchorsPath = resolve(`docs/08-example-data/${packId}/layout/${docToAnchorsFilename(docFilename)}`);
  return await readJson<AnchorFile>(anchorsPath);
}

async function citationOverlapsAnchor(args: {
  pack_id: string;
  expected_doc: string;
  expected_anchor: string;
  citation_ids: string[];
  citations: Record<string, any>;
}): Promise<{ ok: true } | { ok: false; mismatch: CitationMismatch }> {
  const anchors = await loadAnchors(args.pack_id, args.expected_doc);
  const anchor = anchors[args.expected_anchor];
  if (!anchor) {
    return {
      ok: false,
      mismatch: {
        key: "",
        expected_doc: args.expected_doc,
        expected_anchor: args.expected_anchor,
        message: `Anchor not found in anchors file for doc`,
        checked_citation_ids: args.citation_ids,
      },
    };
  }

  for (const cid of args.citation_ids) {
    const cit = args.citations[cid];
    if (!cit) continue;
    if (cit.document_filename !== args.expected_doc) continue;
    if (cit.page_number !== anchor.page) continue;

    const bbox = polygonsToBBox(cit.polygons ?? []);
    if (!bbox) continue;
    const center = bboxCenter(bbox);
    if (bboxContainsPoint(anchor.bbox, center)) return { ok: true };
  }

  return {
    ok: false,
    mismatch: {
      key: "",
      expected_doc: args.expected_doc,
      expected_anchor: args.expected_anchor,
      message: `No citation overlapped expected anchor (doc=${args.expected_doc} anchor=${args.expected_anchor} page=${anchor.page})`,
      checked_citation_ids: args.citation_ids,
    },
  };
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

function asString(val: unknown): string | null {
  if (val === null || val === undefined) return null;
  return String(val);
}

async function diffRequirements(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_requirements_tracker.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "requirements_tracker");
  if (!row) {
    return {
      dataset: "requirements_tracker",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `bi:${t.bi_item}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "requirements_tracker_item") : [];

  const byBi = new Map<number, any>();
  for (const it of items) {
    if (typeof it?.bi_item === "number") byBi.set(it.bi_item, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const bi = Number(t.bi_item);
    const key = `bi:${t.bi_item}`;
    const it = byBi.get(bi);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.requirement) ?? "") !== norm_ws(t.requirement)) {
      fieldMismatches.push({ key, field: "requirement", expected: t.requirement, actual: asString(it.requirement) });
    }
    if (norm_ws(asString(it.owner) ?? "") !== norm_ws(t.owner)) {
      fieldMismatches.push({ key, field: "owner", expected: t.owner, actual: asString(it.owner) });
    }
    if (norm_ws(asString(it.item_status) ?? "") !== norm_ws(t.status)) {
      fieldMismatches.push({ key, field: "item_status", expected: t.status, actual: asString(it.item_status) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => Number(t.bi_item)));
  const extraKeys = Array.from(byBi.keys())
    .filter((bi) => !expectedKeySet.has(bi))
    .map((bi) => `bi:${bi}`);

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "requirements_tracker",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffExceptions(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_exceptions_table.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "exceptions_table");
  if (!row) {
    return {
      dataset: "exceptions_table",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `bii:${t.bii_item}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "exceptions_table_item") : [];

  const byBii = new Map<number, any>();
  for (const it of items) {
    if (typeof it?.bii_item === "number") byBii.set(it.bii_item, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const bii = Number(t.bii_item);
    const key = `bii:${t.bii_item}`;
    const it = byBii.get(bii);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.type) ?? "") !== norm_ws(t.type)) {
      fieldMismatches.push({ key, field: "type", expected: t.type, actual: asString(it.type) });
    }
    if (norm_instrument_no(asString(it.instrument_no) ?? "") !== norm_instrument_no(t.instrument_no)) {
      fieldMismatches.push({ key, field: "instrument_no", expected: t.instrument_no, actual: asString(it.instrument_no) });
    }
    const truthDate = norm_date(t.recorded);
    const actualDate = norm_date(asString(it.recorded_date) ?? "");
    if (truthDate !== actualDate) {
      fieldMismatches.push({ key, field: "recorded_date", expected: truthDate, actual: actualDate });
    }
    if (norm_ws(asString(it.doc) ?? "") !== norm_ws(t.doc)) {
      fieldMismatches.push({ key, field: "doc", expected: t.doc, actual: asString(it.doc) });
    }

    const truthTags = norm_tags(t.risk_tags);
    const actualTags = Array.isArray(it.risk_tags) ? norm_tags(it.risk_tags.join(";")) : norm_tags(asString(it.risk_tags) ?? "");
    if (truthTags !== actualTags) {
      fieldMismatches.push({ key, field: "risk_tags", expected: truthTags, actual: actualTags });
    }

    if (norm_ws(asString(it.item_status) ?? "") !== norm_ws(t.status)) {
      fieldMismatches.push({ key, field: "item_status", expected: t.status, actual: asString(it.item_status) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => Number(t.bii_item)));
  const extraKeys = Array.from(byBii.keys())
    .filter((bii) => !expectedKeySet.has(bii))
    .map((bii) => `bii:${bii}`);

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "exceptions_table",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffSurveyIssues(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_survey_issues.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "survey_issues");
  if (!row) {
    return {
      dataset: "survey_issues",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => `${t.issue_type}:${norm_ws(t.description)}`),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items) ? payload.items.filter((i: any) => i?.kind === "survey_issue_item") : [];

  const keyForTruth = (t: any) => `${t.issue_type}:${norm_ws(t.description)}`;
  const keyForItem = (it: any) => `${String(it.issue_type ?? "")}:${norm_ws(String(it.description ?? ""))}`;

  const byKey = new Map<string, any>();
  for (const it of items) {
    const k = keyForItem(it);
    if (k !== ":") byKey.set(k, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const key = keyForTruth(t);
    const it = byKey.get(key);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.description) ?? "") !== norm_ws(t.description)) {
      fieldMismatches.push({ key, field: "description", expected: t.description, actual: asString(it.description) });
    }
    if (norm_ws(asString(it.impact) ?? "") !== norm_ws(t.impact)) {
      fieldMismatches.push({ key, field: "impact", expected: t.impact, actual: asString(it.impact) });
    }
    if (norm_ws(asString(it.suggested_fix) ?? "") !== norm_ws(t.suggested_fix)) {
      fieldMismatches.push({ key, field: "suggested_fix", expected: t.suggested_fix, actual: asString(it.suggested_fix) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: t.citation_doc,
      expected_anchor: t.citation_anchor,
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => keyForTruth(t)));
  const extraKeys = Array.from(byKey.keys()).filter((k) => !expectedKeySet.has(k));

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "survey_issues",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffSurveyCertificationParties(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/expected_survey_certification_parties.csv`);
  const truth = parseCsv(await readFile(truthPath, "utf8")).rows;

  const row = findPayloadRow(snapshot, "survey_certification_parties");
  if (!row) {
    return {
      dataset: "survey_certification_parties",
      pass: false,
      expected_count: truth.length,
      actual_count: 0,
      missing_keys: truth.map((t) => norm_ws(String(t.party_name ?? ""))),
      extra_keys: [],
      field_mismatches: [],
      citation_mismatches: [],
    };
  }

  const payload = row.payload_json as any;
  const items = Array.isArray(payload.items)
    ? payload.items.filter((i: any) => i?.kind === "survey_certification_party_item")
    : [];

  const keyForTruth = (t: any) => norm_ws(String(t.party_name ?? ""));
  const keyForItem = (it: any) => norm_ws(String(it.party_name ?? ""));

  const byKey = new Map<string, any>();
  for (const it of items) {
    const k = keyForItem(it);
    if (k) byKey.set(k, it);
  }

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const t of truth) {
    const key = keyForTruth(t);
    const it = byKey.get(key);
    if (!it) {
      missingKeys.push(key);
      continue;
    }

    if (norm_ws(asString(it.party_name) ?? "") !== norm_ws(String(t.party_name ?? ""))) {
      fieldMismatches.push({ key, field: "party_name", expected: asString(t.party_name), actual: asString(it.party_name) });
    }

    const overlap = await citationOverlapsAnchor({
      pack_id: packId,
      expected_doc: String(t.citation_doc ?? ""),
      expected_anchor: String(t.citation_anchor ?? ""),
      citation_ids: Array.isArray(it.citation_ids) ? it.citation_ids : [],
      citations: snapshot.citations,
    });
    if (!overlap.ok) {
      citationMismatches.push({ ...overlap.mismatch, key });
    }
  }

  const expectedKeySet = new Set(truth.map((t) => keyForTruth(t)));
  const extraKeys = Array.from(byKey.keys()).filter((k) => !expectedKeySet.has(k));

  const pass =
    missingKeys.length === 0 &&
    extraKeys.length === 0 &&
    fieldMismatches.length === 0 &&
    citationMismatches.length === 0 &&
    items.length === truth.length;

  return {
    dataset: "survey_certification_parties",
    pass,
    expected_count: truth.length,
    actual_count: items.length,
    missing_keys: missingKeys,
    extra_keys: extraKeys,
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function diffScalarGoldenQuestions(packId: string, snapshot: any): Promise<DatasetDiff> {
  const truthPath = resolve(`docs/08-example-data/${packId}/truth/golden_questions.json`);
  const golden = await readJson<any[]>(truthPath);

  const scalarQs = golden.filter((q) => typeof q?.question_id === "string" && !["TS-03", "TS-04", "TS-09"].includes(q.question_id));
  const byQid = new Map<string, any>();
  for (const row of snapshot.rows) byQid.set(row.question_id, row);

  const missingKeys: string[] = [];
  const fieldMismatches: DiffItem[] = [];
  const citationMismatches: CitationMismatch[] = [];

  for (const q of scalarQs) {
    const qid = q.question_id;
    const row = byQid.get(qid);
    if (!row) {
      missingKeys.push(qid);
      continue;
    }

    const answer = norm_ws(String(row.answer ?? ""));
    const expectedContains = Array.isArray(q.expected_answer_contains) ? q.expected_answer_contains : [];
    for (const frag of expectedContains) {
      const f = String(frag);
      if (!answer.toLowerCase().includes(f.toLowerCase())) {
        fieldMismatches.push({ key: qid, field: "answer_contains", expected: f, actual: answer });
      }
    }

    const expectedCits = Array.isArray(q.expected_citations) ? q.expected_citations : [];
    for (const ec of expectedCits) {
      const overlap = await citationOverlapsAnchor({
        pack_id: packId,
        expected_doc: ec.doc,
        expected_anchor: ec.anchor,
        citation_ids: Array.isArray(row.citation_ids) ? row.citation_ids : [],
        citations: snapshot.citations,
      });
      if (!overlap.ok) {
        citationMismatches.push({ ...overlap.mismatch, key: qid });
      }
    }
  }

  const pass = missingKeys.length === 0 && fieldMismatches.length === 0 && citationMismatches.length === 0;
  return {
    dataset: "golden_questions_scalar",
    pass,
    expected_count: scalarQs.length,
    actual_count: scalarQs.length - missingKeys.length,
    missing_keys: missingKeys,
    extra_keys: [],
    field_mismatches: fieldMismatches,
    citation_mismatches: citationMismatches,
  };
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const snapshotPath = resolve(requireStringArg(args, "snapshot"));
  const packArg = getStringArg(args, "pack");
  const datasetsArg = getStringArg(args, "datasets");

  const outResult = getStringArg(args, "out-result") ? resolve(getStringArg(args, "out-result")!) : undefined;
  const outDiff = getStringArg(args, "out-diff") ? resolve(getStringArg(args, "out-diff")!) : undefined;

  const snapshotRaw = JSON.parse(await readFile(snapshotPath, "utf8")) as unknown;
  const snapshot = assertIsSnapshot(snapshotRaw);
  const packId = packArg ?? snapshot.meta.pack_id;

  const diffs: DatasetDiff[] = [];

  const requested = datasetsArg
    ? new Set(
        datasetsArg
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      )
    : null;
  const autoMode = requested === null;

  const want = (name: string) => (requested ? requested.has(name) : true);

  // Auto mode (default): only compare datasets that are present in the snapshot, so spike snapshots can be partial.
  if (want("requirements") && (!autoMode || findPayloadRow(snapshot, "requirements_tracker"))) {
    diffs.push(await diffRequirements(packId, snapshot));
  }
  if (want("exceptions") && (!autoMode || findPayloadRow(snapshot, "exceptions_table"))) {
    diffs.push(await diffExceptions(packId, snapshot));
  }
  if (want("survey_issues") && (!autoMode || findPayloadRow(snapshot, "survey_issues"))) {
    diffs.push(await diffSurveyIssues(packId, snapshot));
  }
  if (want("survey_certification_parties") && (!autoMode || findPayloadRow(snapshot, "survey_certification_parties"))) {
    diffs.push(await diffSurveyCertificationParties(packId, snapshot));
  }
  if (want("golden_scalar")) {
    const truthPath = resolve(`docs/08-example-data/${packId}/truth/golden_questions.json`);
    const golden = await readJson<any[]>(truthPath);
    const scalarIds = new Set(
      golden
        .filter((q) => typeof q?.question_id === "string" && !["TS-03", "TS-04", "TS-09"].includes(q.question_id))
        .map((q) => q.question_id),
    );
    const hasAnyScalar = snapshot.rows.some((r: any) => scalarIds.has(String(r?.question_id ?? "")));
    if (!autoMode || hasAnyScalar) diffs.push(await diffScalarGoldenQuestions(packId, snapshot));
  }

  if (diffs.length === 0) {
    throw new Error(
      `No comparable datasets found in snapshot. Provide list payload rows (payload_schema_version=list_payload_v0) or pass --datasets requirements,exceptions,survey_issues,survey_certification_parties,golden_scalar`,
    );
  }

  const pass = diffs.every((d) => d.pass);

  const result = {
    pass,
    pack_id: packId,
    snapshot_path: snapshotPath,
    datasets: diffs.map((d) => d.dataset),
    diffs: diffs.map((d) => ({
      dataset: d.dataset,
      pass: d.pass,
      expected_count: d.expected_count,
      actual_count: d.actual_count,
      missing: d.missing_keys.length,
      extra: d.extra_keys.length,
      field_mismatches: d.field_mismatches.length,
      citation_mismatches: d.citation_mismatches.length,
    })),
  };

  const diffOut = { diffs };

  if (outResult) await writeFile(outResult, JSON.stringify(result, null, 2) + "\n", "utf8");
  if (outDiff) await writeFile(outDiff, JSON.stringify(diffOut, null, 2) + "\n", "utf8");

  const label = basename(snapshotPath);
  if (pass) {
    process.stdout.write(`PASS compare_truth (${packId}) snapshot=${label}\n`);
    process.exit(0);
  }

  process.stdout.write(`FAIL compare_truth (${packId}) snapshot=${label}\n`);
  for (const d of diffs.filter((x) => !x.pass)) {
    process.stdout.write(
      `- ${d.dataset}: expected=${d.expected_count} actual=${d.actual_count} missing=${d.missing_keys.length} extra=${d.extra_keys.length} field_mismatches=${d.field_mismatches.length} citation_mismatches=${d.citation_mismatches.length}\n`,
    );
  }
  process.exit(1);
}

main().catch((err) => {
  process.stderr.write(String(err?.stack ?? err) + "\n");
  process.exit(2);
});
