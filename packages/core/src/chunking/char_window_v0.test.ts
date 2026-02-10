import { describe, expect, it } from "vitest";

import {
  CHAR_WINDOW_V0_CHUNKER_ID,
  CHAR_WINDOW_V0_DEFAULT_PARAMS,
  charWindowV0Spans,
  chunkPageCharWindowV0,
} from "./char_window_v0";

describe("char_window_v0", () => {
  it("returns zero chunks for empty text", () => {
    expect(charWindowV0Spans("")).toEqual([]);
    const chunks = chunkPageCharWindowV0({ page_number: 1, text: "" });
    expect(chunks).toEqual([]);
  });

  it("returns a single chunk when text fits under maxChars", () => {
    const text = "hello world";
    const chunks = chunkPageCharWindowV0({ page_number: 2, text });
    expect(chunks).toHaveLength(1);
    expect(chunks[0]?.char_start).toBe(0);
    expect(chunks[0]?.char_end).toBe(text.length);
    expect(chunks[0]?.text).toBe(text);
  });

  it("produces deterministic overlapping windows", () => {
    const text = "x".repeat(3000);
    const spans = charWindowV0Spans(text, CHAR_WINDOW_V0_DEFAULT_PARAMS);

    expect(spans).toEqual([
      { char_start: 0, char_end: 1500 },
      { char_start: 1300, char_end: 2800 },
      { char_start: 2600, char_end: 3000 },
    ]);
  });

  it("prefers whitespace boundaries when available", () => {
    const text = "abc def ghi jkl";
    const spans = charWindowV0Spans(text, { maxChars: 10, overlapChars: 2 });

    expect(spans).toEqual([
      { char_start: 0, char_end: 7 },
      { char_start: 4, char_end: 11 },
      { char_start: 8, char_end: text.length },
    ]);

    for (const s of spans) {
      if (s.char_start > 0) {
        expect(/\s/.test(text[s.char_start - 1] ?? "")).toBe(true);
      }
      if (s.char_end < text.length) {
        expect(/\s/.test(text[s.char_end] ?? "")).toBe(true);
      }
    }
  });

  it("validates params", () => {
    expect(() => charWindowV0Spans("x", { maxChars: 0, overlapChars: 0 })).toThrow(/maxChars/);
    expect(() => charWindowV0Spans("x", { maxChars: 10, overlapChars: -1 })).toThrow(/overlapChars/);
    expect(() => charWindowV0Spans("x", { maxChars: 10, overlapChars: 10 })).toThrow(/overlapChars/);

    // Validation runs even for empty text.
    expect(() => charWindowV0Spans("", { maxChars: 0, overlapChars: 0 })).toThrow(/maxChars/);
    expect(() => charWindowV0Spans("", { maxChars: 10, overlapChars: 10 })).toThrow(/overlapChars/);
  });
});
