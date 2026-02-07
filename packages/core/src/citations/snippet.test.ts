import { describe, expect, it } from "vitest";

import { hashSnippet, normaliseSnippet } from "./snippet";

describe("normaliseSnippet", () => {
  it("trims, normalises CRLF to LF, and collapses whitespace runs", () => {
    expect(normaliseSnippet("  A\r\nB   C\tD  ")).toBe("A B C D");
  });
});

describe("hashSnippet", () => {
  it("is invariant to whitespace variants (per canonical rule)", () => {
    const a = hashSnippet("A\r\nB");
    const b = hashSnippet("A\nB");
    const c = hashSnippet("A    B");
    const d = hashSnippet("A\tB");
    const e = hashSnippet("  A  B  ");

    expect(a).toBe(b);
    expect(b).toBe(c);
    expect(c).toBe(d);
    expect(d).toBe(e);
  });
});

