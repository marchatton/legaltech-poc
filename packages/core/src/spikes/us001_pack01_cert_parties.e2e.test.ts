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

describe("US-001 pack_01_clean survey certification parties", () => {
  it("seeds certification parties payload with locked citations", () => {
    const repoRoot = repoRootFromCoreCwd();
    const outRoot = path.join(os.tmpdir(), `legaltech-poc-us001-${process.pid}-${Date.now()}`);

    runNode(repoRoot, [
      "--experimental-strip-types",
      "scripts/fixtures/seed.ts",
      "pack_01_clean",
      "--out-root",
      outRoot,
      "--overwrite",
      "--no-bad-citation",
    ]);

    const snapshotPath = path.join(outRoot, "pack_01_clean", "snapshot.json");

    expect(() =>
      runNode(repoRoot, ["--experimental-strip-types", "scripts/fixtures/assert_row_invariants.ts", "--snapshot", snapshotPath]),
    ).not.toThrow();

    expect(() =>
      runNode(repoRoot, [
        "--experimental-strip-types",
        "scripts/fixtures/compare_truth.ts",
        "--snapshot",
        snapshotPath,
        "--datasets",
        "survey_certification_parties,golden_scalar",
      ]),
    ).not.toThrow();

    const snapshot = loadJson(snapshotPath);
    const certRow = (snapshot.rows as any[]).find((r) => r?.payload_json?.kind === "survey_certification_parties");
    expect(certRow).toBeTruthy();

    const items = (certRow.payload_json.items as any[]).filter((it) => it?.kind === "survey_certification_party_item");
    expect(items.length).toBeGreaterThanOrEqual(1);
    for (const it of items) {
      expect(typeof it.party_name).toBe("string");
      expect(Array.isArray(it.citation_ids) && it.citation_ids.length > 0).toBe(true);
    }
  });
});

