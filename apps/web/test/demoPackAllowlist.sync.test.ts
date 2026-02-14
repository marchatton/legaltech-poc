import { describe, expect, it } from "vitest";

import { DEMO_PACK_ALLOWLIST } from "../lib/demoPackAllowlist";

describe("demo pack allowlist contract", () => {
  it("keeps the operator allowlist scoped to fixture packs under docs/08-example-data", () => {
    expect(DEMO_PACK_ALLOWLIST).toEqual([
      "pack_01_clean",
      "pack_02_missing_rea",
      "pack_03_mismatch_and_cert_gap",
      "pack_04_multi_parcel",
      "pack_05_partial_release",
      "pack_06_overlapping_easements",
      "pack_07_scans_rotated_low_quality",
      "pack_08_defined_terms_and_cross_refs",
      "pack_09_bad_citation",
    ]);
    expect(new Set(DEMO_PACK_ALLOWLIST).size).toBe(DEMO_PACK_ALLOWLIST.length);
  });
});
