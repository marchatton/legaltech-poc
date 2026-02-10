import { describe, expect, it } from "vitest";

import { spikesSnapshotToCsv } from "./spikesCsv.server";
import type { ResolvedSeedSnapshot } from "./fixtureSeed.server";

describe("spikesSnapshotToCsv", () => {
  it("prefixes formula-like cells to prevent CSV injection", () => {
    const snapshot: ResolvedSeedSnapshot = {
      meta: { pack_id: "pack_01_clean" },
      rows: [
        {
          question_id: "Q1",
          question: "=HYPERLINK(\"http://evil\")",
          answer: "+SUM(1,1)",
          status: "reviewed",
          citation_ids: ["cit_1"],
        },
      ],
      citations: {},
    };

    const csv = spikesSnapshotToCsv(snapshot);

    const lines = csv.trimEnd().split("\n");
    expect(lines[0]).toBe("question_id,question,answer,status,citation_ids");
    expect(lines[1]).toContain("\"'=HYPERLINK(\"\"http://evil\"\")\"");
    expect(lines[1]).toContain("\"'+SUM(1,1)\"");
  });
});
