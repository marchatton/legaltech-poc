import { describe, expect, it } from "vitest";

import { csvFromSourceRow } from "./exportCsv.server";

describe("csvFromSourceRow", () => {
  it("emits locked requirements_tracker headers + deterministic ordering", () => {
    const csv = csvFromSourceRow({
      kind: "requirements_tracker",
      sourceRow: {
        source_question_id: "TS-03",
        row_status: "needs_review",
        source_answer: "Extracted requirements tracker (see payload).",
        failure_code: "",
        notes: null,
      },
      payloadSchemaVersion: "list_payload_v0",
      payloadJson: {
        kind: "requirements_tracker",
        items: [
          {
            kind: "requirements_tracker_item",
            item_id: "bi:10",
            citation_ids: ["cit_2"],
            bi_item: 10,
            requirement: "R10",
            owner: "Seller",
            item_status: "open",
          },
          {
            kind: "requirements_tracker_item",
            item_id: "bi:2",
            citation_ids: ["cit_1"],
            bi_item: 2,
            requirement: "R2",
            owner: "Buyer",
            item_status: "open",
          },
        ],
      },
      citationById: new Map([
        ["cit_1", { filename: "A.pdf", page: 2 }],
        ["cit_2", { filename: "A.pdf", page: 1 }],
      ]),
    });

    expect(csv).toBe(
      [
        "requirement_id,requirement_text,source_question_id,row_status,source_answer,failure_code,citations,citation_ids,notes",
        "bi:2,R2,TS-03,needs_review,Extracted requirements tracker (see payload).,,A.pdf:2,cit_1,",
        "bi:10,R10,TS-03,needs_review,Extracted requirements tracker (see payload).,,A.pdf:1,cit_2,",
        "",
      ].join("\n"),
    );
  });

  it("renders citations as unique filename:page sorted deterministically", () => {
    const csv = csvFromSourceRow({
      kind: "survey_issues",
      sourceRow: {
        source_question_id: "TS-09",
        row_status: "needs_review",
        source_answer: "Extracted survey issues (see payload).",
        failure_code: "",
        notes: null,
      },
      payloadSchemaVersion: "list_payload_v0",
      payloadJson: {
        kind: "survey_issues",
        items: [
          {
            kind: "survey_issue_item",
            item_id: "issue:encroachment:1",
            citation_ids: ["cit_b", "cit_a", "cit_c"],
            issue_type: "encroachment",
            issue_code: "ENCROACHMENT",
            description: "Fence encroaches",
            impact: null,
            suggested_fix: null,
          },
        ],
      },
      citationById: new Map([
        ["cit_a", { filename: "B.pdf", page: 2 }],
        ["cit_b", { filename: "A.pdf", page: 10 }],
        // Same filename:page as cit_a: should de-dupe in citations column.
        ["cit_c", { filename: "B.pdf", page: 2 }],
      ]),
    });

    expect(csv).toBe(
      [
        "issue_id,issue_text,source_question_id,row_status,source_answer,failure_code,citations,citation_ids,notes",
        "issue:encroachment:1,Fence encroaches,TS-09,needs_review,Extracted survey issues (see payload).,,A.pdf:10; B.pdf:2,cit_a; cit_b; cit_c,",
        "",
      ].join("\n"),
    );
  });

  it("emits locked exceptions_table headers", () => {
    const csv = csvFromSourceRow({
      kind: "exceptions_table",
      sourceRow: {
        source_question_id: "TS-04",
        row_status: "needs_review",
        source_answer: "Extracted exceptions table (see payload).",
        failure_code: "",
        notes: null,
      },
      payloadSchemaVersion: "list_payload_v0",
      payloadJson: {
        kind: "exceptions_table",
        items: [
          {
            kind: "exceptions_table_item",
            item_id: "bii:12",
            citation_ids: ["cit_x"],
            bii_item: 12,
            type: "Utility Easement",
            item_status: "needs_review",
            match_status: "matched",
          },
        ],
      },
      citationById: new Map([["cit_x", { filename: "Title.pdf", page: 1 }]]),
    });

    expect(csv).toBe(
      [
        "exception_id,exception_text,source_question_id,row_status,source_answer,failure_code,citations,citation_ids,notes",
        "bii:12,Utility Easement,TS-04,needs_review,Extracted exceptions table (see payload).,,Title.pdf:1,cit_x,",
        "",
      ].join("\n"),
    );
  });

  it("prefixes formula-like cells to prevent CSV injection", () => {
    const csv = csvFromSourceRow({
      kind: "requirements_tracker",
      sourceRow: {
        source_question_id: "TS-03",
        row_status: "needs_review",
        source_answer: "ok",
        failure_code: "",
        notes: null,
      },
      payloadSchemaVersion: "list_payload_v0",
      payloadJson: {
        kind: "requirements_tracker",
        items: [
          {
            kind: "requirements_tracker_item",
            item_id: "bi:1",
            citation_ids: [],
            bi_item: 1,
            requirement: "=HYPERLINK(\"http://evil\")",
            owner: "+SUM(1,1)",
            item_status: "open",
          },
        ],
      },
      citationById: new Map(),
    });

    const lines = csv.trimEnd().split("\n");
    expect(lines[0]).toContain("requirement_text");
    // requirement_text should be prefixed.
    expect(lines[1]).toContain(",\"'=HYPERLINK(\"\"http://evil\"\")\"");
  });
});
