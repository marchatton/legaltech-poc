import { describe, expect, it } from "vitest";

import { fixtureDocumentId, parseFixtureDocumentId } from "./fixtureIds";

describe("fixtureIds", () => {
  it("roundtrips fixtureDocumentId -> parseFixtureDocumentId", () => {
    const id = fixtureDocumentId({ packId: "pack_07_scans_rotated_low_quality", filename: "TitleCommitment.pdf" });
    const parsed = parseFixtureDocumentId(id);
    expect(parsed.ok).toBe(true);
    if (!parsed.ok) return;
    expect(parsed.packId).toBe("pack_07_scans_rotated_low_quality");
    expect(parsed.stem).toBe("TitleCommitment");
    expect(parsed.filename).toBe("TitleCommitment.pdf");
  });

  it("returns ok:false for non-fixture document ids", () => {
    expect(parseFixtureDocumentId("doc_123").ok).toBe(false);
    expect(parseFixtureDocumentId("").ok).toBe(false);
  });
});

