import { describe, expect, it } from "vitest";

import { mergeHybridHits } from "../lib/retrieval/mergeHybridHits";

describe("mergeHybridHits()", () => {
  it("is deterministic and uses chunk_id tie-breaks", () => {
    const lexHits = [
      { chunk_id: "chk_b", document_id: "doc_1", page_start: 1, page_end: 1, lex_score: 1 },
      { chunk_id: "chk_a", document_id: "doc_1", page_start: 1, page_end: 1, lex_score: 1 },
    ];

    const a = mergeHybridHits({ lexHits, semHits: [], kFinal: 10, lexWeight: 1, semWeight: 0 });
    const b = mergeHybridHits({ lexHits, semHits: [], kFinal: 10, lexWeight: 1, semWeight: 0 });

    expect(a.map((h) => h.chunk_id)).toEqual(["chk_a", "chk_b"]);
    expect(b).toEqual(a);
  });

  it("combines lexical + semantic scores with weights", () => {
    const lexHits = [
      { chunk_id: "chk_1", document_id: "doc_1", page_start: 1, page_end: 1, lex_score: 1.0 },
      { chunk_id: "chk_2", document_id: "doc_1", page_start: 1, page_end: 1, lex_score: 0.2 },
    ];

    const semHits = [
      { chunk_id: "chk_2", document_id: "doc_1", page_start: 1, page_end: 1, sem_score: 1.0 },
      { chunk_id: "chk_3", document_id: "doc_2", page_start: 2, page_end: 2, sem_score: 0.9 },
    ];

    const out = mergeHybridHits({ lexHits, semHits, kFinal: 10, lexWeight: 0.55, semWeight: 0.45 });

    // chk_2 gets both branches: 0.55*0.2 + 0.45*1.0 = 0.56
    // chk_1 lex-only: 0.55*1.0 + 0.45*0 = 0.55
    expect(out.map((h) => h.chunk_id).slice(0, 2)).toEqual(["chk_2", "chk_1"]);
  });
});

