import { describe, expect, it } from "vitest";

import { deriveFixtureContextBanner } from "../app/(app)/matters/[id]/fixtureContextBanner";

describe("fixture context banner mapping", () => {
  it("surfaces active pack and ready guidance", () => {
    const banner = deriveFixtureContextBanner({
      matterName: "DEMO: pack_01_clean 2026-02-11T170000Z",
      readiness: {
        state: "ready",
        reason: "1 indexed-ready document available. Run Quick Start now.",
      },
    });

    expect(banner).toEqual({
      activePack: "pack_01_clean",
      loadedAt: "2026-02-11T170000Z",
      loadState: "ready",
      nextStep: "1 indexed-ready document available. Run Quick Start now.",
      variant: "success",
    });
  });

  it("maps blocked readiness to warning state with action hint", () => {
    const banner = deriveFixtureContextBanner({
      matterName: "DEMO: pack_02_missing_rea 2026-02-11T170000Z",
      readiness: {
        state: "blocked",
        reason: "No indexed documents yet. Upload a source PDF and click Refresh readiness.",
      },
    });

    expect(banner.loadState).toBe("blocked");
    expect(banner.variant).toBe("warning");
    expect(banner.nextStep).toContain("Upload a source PDF");
  });

  it("keeps explicit fallback when pack cannot be parsed", () => {
    const banner = deriveFixtureContextBanner({
      matterName: "Acme Matter",
      readiness: {
        state: "already-complete",
        reason: "Latest Quick Start already completed.",
      },
    });

    expect(banner.activePack).toBe("not detected");
    expect(banner.loadedAt).toBe("not detected");
    expect(banner.loadState).toBe("already complete");
    expect(banner.variant).toBe("info");
  });
});
