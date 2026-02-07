import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { z } from "zod";

import { verifyRow } from "../verify/verifier";
import { VerifyInputSchema } from "../verify/verifier.schemas";

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

const DatasetCaseSchema = VerifyInputSchema.extend({
  expected: z.enum(["pass", "fail"]),
  expected_reason_code: z.string().optional(),
});
type DatasetCase = z.infer<typeof DatasetCaseSchema>;

const DatasetSchema = z.array(DatasetCaseSchema);

function percentile(values: number[], p: number): number | null {
  if (values.length === 0) return null;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.max(0, Math.floor((p / 100) * sorted.length)));
  return sorted[idx];
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const datasetPath =
    args.get("dataset") ??
    "docs/04-projects/02-features/0001_trust-substrate/fixtures/rh4_verification_cases.json";
  const mode = (args.get("mode") ?? "deterministic-only") as "deterministic-only" | "entailment";
  const outDir = args.get("outDir") ?? "docs/97-throwaway/spike-evidence/rh4";

  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../../..");
  const raw = fs.readFileSync(path.join(root, datasetPath), "utf8");
  const dataset = DatasetSchema.parse(JSON.parse(raw)) as DatasetCase[];

  const results: Array<{
    case_id: string;
    expected: "pass" | "fail";
    got: "pass" | "fail";
    reason_code: string;
    timings_ms: unknown;
  }> = [];

  for (const row of dataset) {
    const input = VerifyInputSchema.parse(row);
    const res = await verifyRow(input, { mode });
    results.push({
      case_id: row.case_id,
      expected: row.expected,
      got: res.verdict,
      reason_code: res.reason_code,
      timings_ms: res.timings_ms,
    });
  }

  const fp = results.filter((r) => r.expected === "fail" && r.got === "pass").length;
  const fn = results.filter((r) => r.expected === "pass" && r.got === "fail").length;
  const tp = results.filter((r) => r.expected === "pass" && r.got === "pass").length;
  const tn = results.filter((r) => r.expected === "fail" && r.got === "fail").length;

  const latencies = results
    .map((r) => (r.timings_ms as any)?.total)
    .filter((n): n is number => typeof n === "number" && Number.isFinite(n));

  const summary = [
    `# RH4 verification harness summary`,
    ``,
    `- Mode: \`${mode}\``,
    `- Dataset: \`${datasetPath}\``,
    ``,
    `## Confusion matrix`,
    ``,
    `- True pass: ${tp}`,
    `- True fail: ${tn}`,
    `- False pass: ${fp}`,
    `- False fail: ${fn}`,
    ``,
    `## Latency (ms)`,
    ``,
    `- p50: ${percentile(latencies, 50) ?? "n/a"}`,
    `- p95: ${percentile(latencies, 95) ?? "n/a"}`,
    `- max: ${latencies.length ? Math.max(...latencies) : "n/a"}`,
    ``,
  ].join("\n");

  const outRoot = path.join(root, outDir);
  fs.mkdirSync(outRoot, { recursive: true });
  fs.writeFileSync(path.join(outRoot, "results.json"), JSON.stringify({ results }, null, 2) + "\n", "utf8");
  fs.writeFileSync(path.join(outRoot, "summary.md"), summary, "utf8");

  process.stdout.write(`Wrote ${path.join(outRoot, "results.json")}\n`);
  process.stdout.write(`Wrote ${path.join(outRoot, "summary.md")}\n`);
}

await main();
