import { describe, expect, it } from "vitest";

import { DEMO_PACK_ALLOWLIST } from "../lib/demoPackAllowlist";

describe("demo pack allowlist contract", () => {
  it("keeps the operator allowlist scoped to packs 01, 02, and 09", () => {
    expect(DEMO_PACK_ALLOWLIST).toEqual(["pack_01_clean", "pack_02_missing_rea", "pack_09_bad_citation"]);
    expect(new Set(DEMO_PACK_ALLOWLIST).size).toBe(DEMO_PACK_ALLOWLIST.length);
  });
});
