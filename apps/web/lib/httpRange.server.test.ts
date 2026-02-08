import { describe, expect, it } from "vitest";

import { parseSingleRangeHeader } from "./httpRange.server";

describe("parseSingleRangeHeader", () => {
  it("returns null when size <= 0", () => {
    expect(parseSingleRangeHeader("bytes=0-10", 0)).toBeNull();
    expect(parseSingleRangeHeader("bytes=0-10", -1)).toBeNull();
  });

  it("rejects non-bytes ranges", () => {
    expect(parseSingleRangeHeader("items=0-10", 100)).toBeNull();
  });

  it("rejects multi-range", () => {
    expect(parseSingleRangeHeader("bytes=0-10,20-30", 100)).toBeNull();
  });

  it("rejects multiple dashes", () => {
    expect(parseSingleRangeHeader("bytes=0-10-20", 100)).toBeNull();
  });

  it("rejects non-integer ranges", () => {
    expect(parseSingleRangeHeader("bytes=0.5-10", 100)).toBeNull();
    expect(parseSingleRangeHeader("bytes=0-10.5", 100)).toBeNull();
    expect(parseSingleRangeHeader("bytes=-10.5", 100)).toBeNull();
  });

  it("parses an explicit start/end", () => {
    expect(parseSingleRangeHeader("bytes=0-10", 100)).toEqual({ start: 0, end: 10 });
  });

  it("parses an open-ended range (start-)", () => {
    expect(parseSingleRangeHeader("bytes=5-", 10)).toEqual({ start: 5, end: 9 });
  });

  it("parses a suffix range (-N)", () => {
    expect(parseSingleRangeHeader("bytes=-5", 10)).toEqual({ start: 5, end: 9 });
    expect(parseSingleRangeHeader("bytes=-50", 10)).toEqual({ start: 0, end: 9 });
  });

  it("clamps end to size-1", () => {
    expect(parseSingleRangeHeader("bytes=0-999", 10)).toEqual({ start: 0, end: 9 });
  });

  it("rejects start >= size", () => {
    expect(parseSingleRangeHeader("bytes=10-", 10)).toBeNull();
  });

  it("rejects start > end", () => {
    expect(parseSingleRangeHeader("bytes=5-4", 10)).toBeNull();
  });

  it("rejects bytes=-", () => {
    expect(parseSingleRangeHeader("bytes=-", 10)).toBeNull();
  });
});

