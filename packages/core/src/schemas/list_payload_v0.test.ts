import { describe, expect, test } from "vitest";

import { LIST_PAYLOAD_V0_SCHEMA_VERSION, ListPayloadV0Schema, emptyListPayloadV0 } from "./list_payload_v0";

describe("list_payload_v0", () => {
  test("empty payload parses for each kind", () => {
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("requirements_tracker"))).toEqual({ kind: "requirements_tracker", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("exceptions_table"))).toEqual({ kind: "exceptions_table", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("survey_issues"))).toEqual({ kind: "survey_issues", items: [] });
    expect(ListPayloadV0Schema.parse(emptyListPayloadV0("survey_certification_parties"))).toEqual({
      kind: "survey_certification_parties",
      items: [],
    });
    expect(LIST_PAYLOAD_V0_SCHEMA_VERSION).toBe("list_payload_v0");
  });

  test("items require stable item_id and citation_ids[]", () => {
    const bad = {
      kind: "requirements_tracker",
      items: [
        {
          kind: "requirements_tracker_item",
          bi_item: 1,
          requirement: "Do the thing",
          owner: "Buyer",
          item_status: "open",
          // item_id missing
          citation_ids: [],
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });

  test("unknown keys are rejected (strict contract)", () => {
    const bad = {
      kind: "exceptions_table",
      items: [
        {
          kind: "exceptions_table_item",
          item_id: "bii:1",
          citation_ids: ["cit_123"],
          bii_item: 1,
          type: "REA",
          item_status: "needs_review",
          match_status: "matched",
          // must not smuggle report-row statuses into the item contract
          status: "needs_review",
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });

  test("exceptions items require item_status", () => {
    const bad = {
      kind: "exceptions_table",
      items: [
        {
          kind: "exceptions_table_item",
          item_id: "bii:1",
          citation_ids: ["cit_123"],
          bii_item: 1,
          type: "REA",
          match_status: "matched",
        },
      ],
    };
    expect(ListPayloadV0Schema.safeParse(bad).success).toBe(false);
  });
});
