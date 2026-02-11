import { describe, expect, it } from "vitest";

import { formatDemoLoadedAtLabel, parseDemoMatterMetadata } from "../lib/demoMatterMetadata";

describe("demo matter metadata", () => {
  it("parses pack and timestamp from demo matter names", () => {
    expect(parseDemoMatterMetadata("DEMO: pack_01_clean 2026-02-11T170000Z")).toEqual({
      packId: "pack_01_clean",
      loadedAt: "2026-02-11T170000Z",
    });
  });

  it("returns null when the matter is not demo-formatted", () => {
    expect(parseDemoMatterMetadata("Acme Matter")).toBeNull();
  });

  it("formats valid timestamps and preserves opaque labels", () => {
    expect(formatDemoLoadedAtLabel("2026-02-11T17:00:00.000Z")).toBe("2026-02-11 17:00");
    expect(formatDemoLoadedAtLabel("Yesterday")).toBe("Yesterday");
  });
});
