import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

import { getBoolArg, getStringArg, parseArgs } from "./lib/args.ts";
import { assertIsSnapshot, isRecord, type SpikeSnapshot } from "./lib/snapshot.ts";

type GateStatus = "pass" | "fail" | "skipped";

type SchemaValidityGate = {
  status: GateStatus;
  out_path: string;
  error_count: number;
  errors: Array<{ kind: string; question_id?: string; message: string }>;
};

type CitationIntegrityGate = {
  status: GateStatus;
  out_path: string;
  checked_citations: number;
  error_count: number;
  errors: Array<{ code: string; kind: string; question_id?: string; citation_id?: string; message: string }>;
  error?: string;
};

type CompareTruthGate = {
  status: GateStatus;
  out_result_path: string;
  out_diff_path: string;
  datasets: string[];
  failed_datasets: string[];
  summary?: {
    pass: boolean;
    diffs: Array<{
      dataset: string;
      pass: boolean;
      expected_count: number;
      actual_count: number;
      missing: number;
      extra: number;
      field_mismatches: number;
      citation_mismatches: number;
    }>;
  };
  error?: string;
};

type FailureJourneysGate = {
  status: GateStatus;
  expected_path: string;
  total_expected: number;
  failures: Array<{
    question_id: string;
    message: string;
    expected_status?: string;
    actual_status?: string;
    expected_failure_code?: string | null;
    actual_failure_code?: string | null;
  }>;
  journeys: Array<{
    question_id: string;
    expected_status: string;
    actual_status: string | null;
    expected_failure_code: string | null;
    actual_failure_code: string | null;
  }>;
};

type ExportTruthMatchGate = {
  status: GateStatus;
  out_path: string;
  exports_dir?: string;
  datasets: string[];
  failed_datasets: string[];
  failures: Array<{ code: string; kind: string; dataset: string; message: string }>;
  error?: string;
};

type PackEvalReport = {
  pack_id: string;
  snapshot: { path: string; source: "produced" | "seed" };
  hard_gates: {
    schema_validity: SchemaValidityGate;
    citation_integrity: CitationIntegrityGate;
    failure_journeys: FailureJourneysGate;
    export_truth_match: ExportTruthMatchGate;
  };
  checks?: {
    compare_truth?: CompareTruthGate;
  };
  counts: {
    status: Record<string, number>;
    reason_code: Record<string, number>;
  };
  pass: boolean;
};

const DEFAULT_PACKS_ALL = ["pack_01_clean", "pack_02_missing_rea", "pack_09_bad_citation"] as const;

function repoRoot(): string {
  return process.cwd();
}

function packRoot(packId: string): string {
  return path.resolve(repoRoot(), "docs/08-example-data", packId);
}

function readJsonFile(filePath: string): unknown {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as unknown;
}

function writeTextFile(filePath: string, contents: string) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const normalized = contents.endsWith("\n") ? contents : contents + "\n";
  fs.writeFileSync(filePath, normalized, "utf8");
}

function writeJsonFile(filePath: string, value: unknown) {
  writeTextFile(filePath, JSON.stringify(value, null, 2));
}

function runNodeTsScript(args: { scriptRel: string; argv: string[] }) {
  const res = spawnSync(process.execPath, ["--experimental-strip-types", args.scriptRel, ...args.argv], {
    cwd: repoRoot(),
    stdio: "pipe",
    encoding: "utf8",
  });
  return {
    code: res.status ?? 0,
    stdout: res.stdout ?? "",
    stderr: res.stderr ?? "",
  };
}

function extractReasonCode(provenance: unknown): string | null {
  if (!provenance) return null;
  if (!isRecord(provenance)) return null;

  const direct = provenance.reason_code;
  if (typeof direct === "string" && direct.trim()) return direct.trim();

  const verify = provenance.verify;
  if (isRecord(verify) && typeof verify.reason_code === "string" && verify.reason_code.trim()) return verify.reason_code.trim();

  const v = provenance.verification;
  if (isRecord(v) && typeof v.reason_code === "string" && v.reason_code.trim()) return v.reason_code.trim();

  return null;
}

function countStatus(snapshot: SpikeSnapshot): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of snapshot.rows ?? []) {
    const key = String((r as any)?.status ?? "unknown");
    out[key] = (out[key] ?? 0) + 1;
  }
  return out;
}

function countReasonCodes(snapshot: SpikeSnapshot): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of snapshot.rows ?? []) {
    if (!r || typeof r !== "object") continue;
    if ((r as any).status !== "citation_failed") continue;
    const code = extractReasonCode((r as any).provenance_json) ?? "UNKNOWN";
    out[code] = (out[code] ?? 0) + 1;
  }
  return out;
}

function pickSnapshotForPack(packId: string, snapshotsOutRoot: string): { snapshotPath: string; source: "produced" | "seed" } {
  const producedPath = path.resolve(packRoot(packId), "produced", "snapshot.json");
  if (fs.existsSync(producedPath)) return { snapshotPath: producedPath, source: "produced" };

  const seedOutRoot = path.resolve(repoRoot(), snapshotsOutRoot);
  const seededPath = path.resolve(seedOutRoot, packId, "snapshot.json");

  // Always overwrite seed snapshots for deterministic evals without requiring a separate seed step.
  const seedRes = runNodeTsScript({
    scriptRel: "scripts/fixtures/seed.ts",
    argv: [packId, "--out-root", snapshotsOutRoot, "--overwrite", "--no-bad-citation"],
  });
  if (seedRes.code !== 0) {
    throw new Error(`Failed to seed snapshot for ${packId} (exit=${seedRes.code}):\n${seedRes.stderr || seedRes.stdout}`);
  }
  if (!fs.existsSync(seededPath)) {
    throw new Error(`Seeded snapshot missing: ${seededPath}`);
  }

  return { snapshotPath: seededPath, source: "seed" };
}

function evalSchemaValidity(packId: string, snapshotPath: string, outPath: string): SchemaValidityGate {
  const res = runNodeTsScript({
    scriptRel: "scripts/fixtures/assert_row_invariants.ts",
    argv: ["--snapshot", snapshotPath, "--out", outPath, "--strict-reason-codes"],
  });

  let parsed: any = null;
  try {
    if (fs.existsSync(outPath)) parsed = readJsonFile(outPath);
  } catch {
    // ignore; fall back to default structure
  }

  const error_count = typeof parsed?.error_count === "number" ? parsed.error_count : -1;
  const errors = Array.isArray(parsed?.errors)
    ? parsed.errors
        .map((e: any) => ({
          kind: String(e?.kind ?? "unknown"),
          question_id: typeof e?.question_id === "string" ? e.question_id : undefined,
          message: String(e?.message ?? ""),
        }))
        .filter((e: any) => e.kind && e.message)
    : [];

  if (res.code === 0) return { status: "pass", out_path: outPath, error_count: Math.max(0, error_count), errors: [] };

  // Non-zero: treat as fail and include parsed errors when available.
  return { status: "fail", out_path: outPath, error_count: error_count >= 0 ? error_count : errors.length, errors };
}

function evalCitationIntegrity(packId: string, snapshotPath: string, outPath: string): CitationIntegrityGate {
  const res = runNodeTsScript({
    scriptRel: "scripts/fixtures/assert_citation_integrity.ts",
    argv: ["--snapshot", snapshotPath, "--out", outPath],
  });

  let parsed: any = null;
  try {
    if (fs.existsSync(outPath)) parsed = readJsonFile(outPath);
  } catch {
    // ignore; fall back to default structure
  }

  const checked_citations = typeof parsed?.checked_citations === "number" ? parsed.checked_citations : 0;
  const error_count = typeof parsed?.error_count === "number" ? parsed.error_count : -1;
  const errors = Array.isArray(parsed?.errors)
    ? parsed.errors
        .map((e: any) => ({
          code: String(e?.code ?? "VALIDATION_ERROR"),
          kind: String(e?.kind ?? "unknown"),
          question_id: typeof e?.question_id === "string" ? e.question_id : undefined,
          citation_id: typeof e?.citation_id === "string" ? e.citation_id : undefined,
          message: String(e?.message ?? ""),
        }))
        .filter((e: any) => e.code && e.kind && e.message)
    : [];

  if (res.code === 0) {
    return { status: "pass", out_path: outPath, checked_citations, error_count: Math.max(0, error_count), errors: [] };
  }

  if (res.code === 1) {
    return {
      status: "fail",
      out_path: outPath,
      checked_citations,
      error_count: error_count >= 0 ? error_count : errors.length,
      errors,
    };
  }

  // res.code === 2 (error): provide message, but keep it safe and short.
  return {
    status: "fail",
    out_path: outPath,
    checked_citations,
    error_count: error_count >= 0 ? error_count : errors.length,
    errors,
    error: String(res.stderr || res.stdout || "CITATION_INTEGRITY_ERROR").split("\n")[0] || "CITATION_INTEGRITY_ERROR",
  };
}

function evalCompareTruth(packId: string, snapshotPath: string, outResultPath: string, outDiffPath: string): CompareTruthGate {
  const res = runNodeTsScript({
    scriptRel: "scripts/fixtures/compare_truth.ts",
    argv: ["--snapshot", snapshotPath, "--out-result", outResultPath, "--out-diff", outDiffPath],
  });

  const noComparable = res.code === 2 && /No comparable datasets found in snapshot\./.test(res.stderr + res.stdout);
  if (noComparable) {
    return {
      status: "skipped",
      out_result_path: outResultPath,
      out_diff_path: outDiffPath,
      datasets: [],
      failed_datasets: [],
      error: "NO_COMPARABLE_DATASETS",
    };
  }

  let result: any = null;
  let diff: any = null;
  try {
    if (fs.existsSync(outResultPath)) result = readJsonFile(outResultPath);
    if (fs.existsSync(outDiffPath)) diff = readJsonFile(outDiffPath);
  } catch {
    // ignore
  }

  const datasets = Array.isArray(result?.datasets) ? result.datasets.map((d: any) => String(d)) : [];
  const diffsSummary = Array.isArray(result?.diffs)
    ? result.diffs.map((d: any) => ({
        dataset: String(d?.dataset ?? ""),
        pass: Boolean(d?.pass),
        expected_count: Number(d?.expected_count ?? 0),
        actual_count: Number(d?.actual_count ?? 0),
        missing: Number(d?.missing ?? 0),
        extra: Number(d?.extra ?? 0),
        field_mismatches: Number(d?.field_mismatches ?? 0),
        citation_mismatches: Number(d?.citation_mismatches ?? 0),
      }))
    : [];
  const failed_datasets = diffsSummary.filter((d: any) => !d.pass).map((d: any) => d.dataset);

  const gate: CompareTruthGate = {
    status: res.code === 0 ? "pass" : "fail",
    out_result_path: outResultPath,
    out_diff_path: outDiffPath,
    datasets,
    failed_datasets,
    summary: result?.pass !== undefined ? { pass: Boolean(result.pass), diffs: diffsSummary } : undefined,
    error: res.code === 2 ? "COMPARE_TRUTH_ERROR" : undefined,
  };

  // Include diff summary even on internal errors when available.
  if (diff && Array.isArray((diff as any).diffs)) {
    if (!gate.summary) gate.summary = { pass: false, diffs: diffsSummary };
  }

  if (res.code === 0 || res.code === 1) return gate;

  // res.code === 2 (error): provide the message for debugging, but do not leak stack details into JSON.
  gate.error = String(res.stderr || res.stdout || "COMPARE_TRUTH_ERROR").split("\n")[0] || "COMPARE_TRUTH_ERROR";
  return gate;
}

function evalExportTruthMatch(
  packId: string,
  snapshotPath: string,
  outPath: string,
  outExportsDir: string,
): ExportTruthMatchGate {
  const res = runNodeTsScript({
    scriptRel: "scripts/fixtures/export_truth_match.ts",
    argv: ["--snapshot", snapshotPath, "--out", outPath, "--out-exports-dir", outExportsDir],
  });

  const noExportable = res.code === 2 && /No exportable datasets found in snapshot\./.test(res.stderr + res.stdout);
  if (noExportable) {
    return {
      status: "skipped",
      out_path: outPath,
      exports_dir: outExportsDir,
      datasets: [],
      failed_datasets: [],
      failures: [],
      error: "NO_EXPORTABLE_DATASETS",
    };
  }

  let parsed: any = null;
  try {
    if (fs.existsSync(outPath)) parsed = readJsonFile(outPath);
  } catch {
    // ignore
  }

  const datasets = Array.isArray(parsed?.datasets) ? parsed.datasets.map((d: any) => String(d)) : [];
  const failures = Array.isArray(parsed?.failures)
    ? parsed.failures
        .map((f: any) => ({
          code: String(f?.code ?? "EXPORT_FAIL"),
          kind: String(f?.kind ?? "mismatch"),
          dataset: String(f?.dataset ?? ""),
          message: String(f?.message ?? ""),
        }))
        .filter((f: any) => f.code && f.kind && f.dataset)
    : [];
  const failed_datasets = failures.map((f: any) => f.dataset);

  const gate: ExportTruthMatchGate = {
    status: res.code === 0 ? "pass" : "fail",
    out_path: outPath,
    exports_dir: typeof parsed?.exports_dir === "string" ? parsed.exports_dir : outExportsDir,
    datasets,
    failed_datasets,
    failures,
    error: res.code === 2 ? "EXPORT_TRUTH_MATCH_ERROR" : undefined,
  };

  if (res.code === 0 || res.code === 1) return gate;

  gate.error = String(res.stderr || res.stdout || "EXPORT_TRUTH_MATCH_ERROR").split("\n")[0] || "EXPORT_TRUTH_MATCH_ERROR";
  return gate;
}

function evalFailureJourneys(packId: string, snapshot: SpikeSnapshot): FailureJourneysGate {
  const expectedPath = path.resolve(packRoot(packId), "truth", "expected_failure_journeys.json");
  if (!fs.existsSync(expectedPath)) {
    return { status: "skipped", expected_path: expectedPath, total_expected: 0, failures: [], journeys: [] };
  }

  const raw = readJsonFile(expectedPath);
  if (!Array.isArray(raw)) {
    return {
      status: "fail",
      expected_path: expectedPath,
      total_expected: 0,
      failures: [{ question_id: "(file)", message: "expected_failure_journeys.json must be an array" }],
      journeys: [],
    };
  }

  const failures: FailureJourneysGate["failures"] = [];
  const journeys: FailureJourneysGate["journeys"] = [];

  const rowById = new Map<string, any>();
  for (const r of snapshot.rows ?? []) {
    if (!r || typeof r !== "object") continue;
    if (typeof (r as any).question_id !== "string") continue;
    rowById.set((r as any).question_id, r);
  }

  for (const item of raw) {
    const question_id = typeof (item as any)?.question_id === "string" ? String((item as any).question_id) : "";
    const expected_status = typeof (item as any)?.expected_status === "string" ? String((item as any).expected_status) : "";
    const expected_failure_code =
      (item as any)?.expected_failure_code === null || (item as any)?.expected_failure_code === undefined
        ? null
        : String((item as any).expected_failure_code);

    if (!question_id || !expected_status) {
      failures.push({
        question_id: question_id || "(unknown)",
        message: "Invalid expected failure journey item (missing question_id or expected_status)",
      });
      continue;
    }

    const row = rowById.get(question_id);
    if (!row) {
      failures.push({
        question_id,
        message: "Expected journey question_id not found in snapshot",
        expected_status,
        actual_status: null,
        expected_failure_code,
        actual_failure_code: null,
      });
      journeys.push({
        question_id,
        expected_status,
        actual_status: null,
        expected_failure_code,
        actual_failure_code: null,
      });
      continue;
    }

    const actual_status = typeof (row as any).status === "string" ? String((row as any).status) : null;
    const actual_failure_code = extractReasonCode((row as any).provenance_json);
    journeys.push({
      question_id,
      expected_status,
      actual_status,
      expected_failure_code,
      actual_failure_code,
    });

    if (actual_status !== expected_status) {
      failures.push({
        question_id,
        message: `Status mismatch`,
        expected_status,
        actual_status: actual_status ?? null,
        expected_failure_code,
        actual_failure_code,
      });
      continue;
    }

    if (expected_failure_code) {
      if (!actual_failure_code) {
        failures.push({
          question_id,
          message: `Missing failure reason_code`,
          expected_status,
          actual_status,
          expected_failure_code,
          actual_failure_code: null,
        });
        continue;
      }
      if (actual_failure_code !== expected_failure_code) {
        failures.push({
          question_id,
          message: `Failure reason_code mismatch`,
          expected_status,
          actual_status,
          expected_failure_code,
          actual_failure_code,
        });
      }
    }
  }

  journeys.sort((a, b) => a.question_id.localeCompare(b.question_id));
  failures.sort((a, b) => a.question_id.localeCompare(b.question_id));

  return {
    status: failures.length === 0 ? "pass" : "fail",
    expected_path: expectedPath,
    total_expected: raw.length,
    failures,
    journeys,
  };
}

function formatGateBadge(status: GateStatus): string {
  if (status === "pass") return "PASS";
  if (status === "skipped") return "SKIP";
  return "FAIL";
}

function formatSummaryTable(reports: PackEvalReport[]): string {
  const header = [
    "| Pack | Overall | Schema validity | Citation integrity | Failure journeys | Export truth match | missing_input | citation_failed |",
  ];
  const sep = ["|---|---|---|---|---|---|---:|---:|"];

  const rows = reports.map((r) => {
    const missingInput = r.counts.status.missing_input ?? 0;
    const citationFailed = r.counts.status.citation_failed ?? 0;
    return [
      `| \`${r.pack_id}\` | ${r.pass ? "PASS" : "FAIL"} | ${formatGateBadge(r.hard_gates.schema_validity.status)} | ${formatGateBadge(
        r.hard_gates.citation_integrity.status,
      )} | ${formatGateBadge(r.hard_gates.failure_journeys.status)} | ${formatGateBadge(r.hard_gates.export_truth_match.status)} | ${missingInput} | ${citationFailed} |`,
    ].join("");
  });

  return [header[0]!, sep[0]!, ...rows].join("\n");
}

function formatPackReportMarkdown(report: PackEvalReport): string {
  const lines: string[] = [];
  lines.push(`# Fixture Eval Report: ${report.pack_id}`);
  lines.push("");
  lines.push(`Snapshot: \`${path.relative(repoRoot(), report.snapshot.path)}\` (${report.snapshot.source})`);
  lines.push("");
  lines.push(`Overall: **${report.pass ? "PASS" : "FAIL"}**`);
  lines.push("");
  lines.push("## Hard gates");
  lines.push(`- Schema validity: ${formatGateBadge(report.hard_gates.schema_validity.status)}`);
  lines.push(`- Citation integrity: ${formatGateBadge(report.hard_gates.citation_integrity.status)}`);
  lines.push(`- Failure journeys: ${formatGateBadge(report.hard_gates.failure_journeys.status)}`);
  lines.push(`- Export truth match: ${formatGateBadge(report.hard_gates.export_truth_match.status)}`);
  lines.push("");

  lines.push("## Counts");
  lines.push("");
  lines.push("| Status | Count |");
  lines.push("|---|---:|");
  const statusKeys = Object.keys(report.counts.status).sort();
  for (const k of statusKeys) lines.push(`| \`${k}\` | ${report.counts.status[k]} |`);
  lines.push("");

  const reasonKeys = Object.keys(report.counts.reason_code).sort();
  if (reasonKeys.length) {
    lines.push("| reason_code | Count |");
    lines.push("|---|---:|");
    for (const k of reasonKeys) lines.push(`| \`${k}\` | ${report.counts.reason_code[k]} |`);
    lines.push("");
  }

  if (report.hard_gates.schema_validity.status === "fail") {
    lines.push("## Schema validity failures");
    for (const e of report.hard_gates.schema_validity.errors.slice(0, 20)) {
      const q = e.question_id ? `\`${e.question_id}\`` : "`(no question_id)`";
      lines.push(`- ${q}: \`${e.kind}\` ${e.message}`);
    }
    if (report.hard_gates.schema_validity.errors.length > 20) lines.push(`(showing first 20)`);
    lines.push("");
  }

  if (report.hard_gates.citation_integrity.status === "fail") {
    lines.push("## Citation integrity failures");
    for (const e of report.hard_gates.citation_integrity.errors.slice(0, 20)) {
      const q = e.question_id ? `\`${e.question_id}\`` : "`(no question_id)`";
      const cid = e.citation_id ? `\`${e.citation_id}\`` : "`(no citation_id)`";
      lines.push(`- ${q} ${cid}: \`${e.code}\` \`${e.kind}\` ${e.message}`);
    }
    if (report.hard_gates.citation_integrity.errors.length > 20) lines.push(`(showing first 20)`);
    lines.push("");
  }

  if (report.hard_gates.failure_journeys.status === "fail") {
    lines.push("## Failure journeys mismatches");
    for (const f of report.hard_gates.failure_journeys.failures) {
      lines.push(
        `- \`${f.question_id}\`: ${f.message} (expected=${f.expected_status ?? "?"} actual=${f.actual_status ?? "?"}${
          f.expected_failure_code ? ` code=${f.expected_failure_code}` : ""
        }${f.actual_failure_code ? ` actual_code=${f.actual_failure_code}` : ""})`,
      );
    }
    lines.push("");
  }

  if (report.hard_gates.export_truth_match.status === "fail") {
    lines.push("## Export truth mismatches");
    const failed = report.hard_gates.export_truth_match.failed_datasets;
    lines.push(`Failed datasets: ${failed.length ? failed.map((d) => `\`${d}\``).join(", ") : "(unknown)"}`);
    for (const f of report.hard_gates.export_truth_match.failures.slice(0, 20)) {
      lines.push(`- \`${f.dataset}\`: \`${f.code}\` \`${f.kind}\` ${f.message}`);
    }
    if (report.hard_gates.export_truth_match.failures.length > 20) lines.push(`(showing first 20)`);
    lines.push("");
  }

  if (report.checks?.compare_truth) {
    lines.push("## Report-only checks");
    lines.push(`- Compare truth: ${formatGateBadge(report.checks.compare_truth.status)}`);
    if (report.checks.compare_truth.status === "fail") {
      const failed = report.checks.compare_truth.failed_datasets;
      lines.push(`Failed datasets: ${failed.length ? failed.map((d) => `\`${d}\``).join(", ") : "(unknown)"}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

function evalPack(args: { packId: string; outRoot: string; snapshotsOutRoot: string }): PackEvalReport {
  const packId = args.packId;
  const root = packRoot(packId);
  if (!fs.existsSync(root)) throw new Error(`Pack not found: ${packId} (${path.relative(repoRoot(), root)})`);

  const { snapshotPath, source } = pickSnapshotForPack(packId, args.snapshotsOutRoot);

  const snapshotRaw = readJsonFile(snapshotPath);
  const snapshot = assertIsSnapshot(snapshotRaw);

  const outDir = path.resolve(repoRoot(), args.outRoot, packId);
  fs.mkdirSync(outDir, { recursive: true });

  // Gate 1: schema validity
  const schemaOut = path.resolve(outDir, "schema_validity.json");
  const schemaValidity = evalSchemaValidity(packId, snapshotPath, schemaOut);

  // Gate 2: citation integrity
  const citationOut = path.resolve(outDir, "citation_integrity.json");
  const citationIntegrity = evalCitationIntegrity(packId, snapshotPath, citationOut);

  // Gate 3: expected failure journeys (when defined in truth/)
  const failureJourneys = evalFailureJourneys(packId, snapshot);

  // Gate 4: export truth match (optional; skipped when snapshot has no exportable datasets)
  const exportOut = path.resolve(outDir, "export_truth_match.json");
  const exportsDir = path.resolve(outDir, "exports");
  const exportTruthMatch = evalExportTruthMatch(packId, snapshotPath, exportOut, exportsDir);

  // Report-only: semantic comparator (does not affect hard gates)
  const compareOutResult = path.resolve(outDir, "compare_truth_result.json");
  const compareOutDiff = path.resolve(outDir, "compare_truth_diffs.json");
  const compareTruth = evalCompareTruth(packId, snapshotPath, compareOutResult, compareOutDiff);

  const counts = {
    status: countStatus(snapshot),
    reason_code: countReasonCodes(snapshot),
  };

  const pass =
    schemaValidity.status === "pass" &&
    citationIntegrity.status === "pass" &&
    (failureJourneys.status === "pass" || failureJourneys.status === "skipped") &&
    (exportTruthMatch.status === "pass" || exportTruthMatch.status === "skipped");

  const report: PackEvalReport = {
    pack_id: packId,
    snapshot: { path: snapshotPath, source },
    hard_gates: {
      schema_validity: schemaValidity,
      citation_integrity: citationIntegrity,
      failure_journeys: failureJourneys,
      export_truth_match: exportTruthMatch,
    },
    checks: { compare_truth: compareTruth },
    counts,
    pass,
  };

  writeJsonFile(path.resolve(outDir, "report.json"), report);
  writeTextFile(path.resolve(outDir, "report.md"), formatPackReportMarkdown(report));

  return report;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const outRoot = getStringArg(args, "out-root") ?? "tmp/fixture-eval";
  const snapshotsOutRoot = getStringArg(args, "snapshots-out-root") ?? path.join(outRoot, "snapshots");
  const runAll = getBoolArg(args, "all");

  const packIds = runAll ? [...DEFAULT_PACKS_ALL] : args._.filter(Boolean);
  if (!packIds.length) {
    process.stderr.write(
      [
        "Usage:",
        "  pnpm fixture:eval <pack_id...> [--out-root tmp/fixture-eval]",
        "  pnpm fixture:eval:all",
        "",
        "Notes:",
        "- Uses docs/08-example-data/<pack_id>/produced/snapshot.json when present.",
        "- Otherwise generates a deterministic seed snapshot under tmp/ (no separate seed step required).",
      ].join("\n") + "\n",
    );
    process.exit(1);
  }

  const reports: PackEvalReport[] = [];
  let anyFail = false;

  for (const packId of packIds) {
    const report = evalPack({ packId, outRoot, snapshotsOutRoot });
    reports.push(report);
    if (!report.pass) anyFail = true;
  }

  reports.sort((a, b) => a.pack_id.localeCompare(b.pack_id));

  const summary = {
    pass: !anyFail,
    packs: reports.map((r) => ({
      pack_id: r.pack_id,
      pass: r.pass,
      snapshot_source: r.snapshot.source,
      gates: {
        schema_validity: r.hard_gates.schema_validity.status,
        citation_integrity: r.hard_gates.citation_integrity.status,
        failure_journeys: r.hard_gates.failure_journeys.status,
        export_truth_match: r.hard_gates.export_truth_match.status,
      },
      counts: r.counts,
    })),
  };

  const outDir = path.resolve(repoRoot(), outRoot);
  writeJsonFile(path.resolve(outDir, "summary.json"), summary);
  writeTextFile(path.resolve(outDir, "summary.md"), formatSummaryTable(reports));

  process.stdout.write(formatSummaryTable(reports) + "\n");
  process.stdout.write(`Reports: ${path.relative(repoRoot(), outDir)}\n`);

  process.exit(anyFail ? 1 : 0);
}

main();
