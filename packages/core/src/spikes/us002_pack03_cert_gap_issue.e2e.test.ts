import { execFileSync } from "node:child_process";
import { readFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";

import { describe, expect, it } from "vitest";

function repoRootFromCoreCwd(): string {
  // When invoked via `pnpm -r test`, vitest runs with cwd at the package root.
  return path.resolve(process.cwd(), "../..");
}

function runNode(repoRoot: string, args: string[]): string {
  return execFileSync(process.execPath, args, {
    cwd: repoRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function loadJson(filePath: string): any {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

describe("US-002 pack_03_mismatch_and_cert_gap structured cert gap issue", () => {
  it("seeds survey_issues payload with CERT_MISSING_LENDER and evidence", () => {
    const repoRoot = repoRootFromCoreCwd();
    const outRoot = path.join(os.tmpdir(), `legaltech-poc-us002-${process.pid}-${Date.now()}`);

    runNode(repoRoot, [
      "--experimental-strip-types",
      "scripts/fixtures/seed.ts",
      "pack_03_mismatch_and_cert_gap",
      "--out-root",
      outRoot,
      "--overwrite",
      "--no-bad-citation",
    ]);

    const snapshotPath = path.join(outRoot, "pack_03_mismatch_and_cert_gap", "snapshot.json");

    expect(() =>
      runNode(repoRoot, ["--experimental-strip-types", "scripts/fixtures/assert_row_invariants.ts", "--snapshot", snapshotPath]),
    ).not.toThrow();

    // Comparator should confirm description fields and citation->anchor overlap for survey issues.
    expect(() =>
      runNode(repoRoot, [
        "--experimental-strip-types",
        "scripts/fixtures/compare_truth.ts",
        "--snapshot",
        snapshotPath,
        "--datasets",
        "survey_issues",
      ]),
    ).not.toThrow();
    const snapshot = loadJson(snapshotPath);
    const surveyIssuesRow = (snapshot.rows as any[]).find((r) => r?.payload_json?.kind === "survey_issues");
    expect(surveyIssuesRow).toBeTruthy();

    const items = (surveyIssuesRow.payload_json.items as any[]).filter((it) => it?.kind === "survey_issue_item");
    const certGap = items.find((it) => it.issue_type === "survey_certification_gap");
    expect(certGap?.issue_code).toBe("CERT_MISSING_LENDER");
    expect(Array.isArray(certGap?.citation_ids) && certGap.citation_ids.length > 0).toBe(true);
  });
});
