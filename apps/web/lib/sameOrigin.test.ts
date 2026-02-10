import { describe, expect, it } from "vitest";

import { isSameOriginMutationRequest } from "./sameOrigin";

describe("isSameOriginMutationRequest", () => {
  const expected = "https://demo.example.com";

  it("rejects when no browser signals are present", () => {
    expect(isSameOriginMutationRequest({ expectedOrigin: expected, headers: new Headers() })).toBe(false);
  });

  it("accepts when Origin matches expected origin", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ Origin: expected }),
      }),
    ).toBe(true);
  });

  it("rejects when Origin mismatches expected origin", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ Origin: "https://evil.example" }),
      }),
    ).toBe(false);
  });

  it("accepts when Referer origin matches expected origin", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ Referer: `${expected}/matters` }),
      }),
    ).toBe(true);
  });

  it("rejects when Referer mismatches expected origin", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ Referer: "https://evil.example/path" }),
      }),
    ).toBe(false);
  });

  it("accepts when Sec-Fetch-Site is same-origin", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ "Sec-Fetch-Site": "same-origin" }),
      }),
    ).toBe(true);
  });

  it("rejects when Sec-Fetch-Site is cross-site", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ "Sec-Fetch-Site": "cross-site" }),
      }),
    ).toBe(false);
  });

  it("rejects on contradictory signals", () => {
    expect(
      isSameOriginMutationRequest({
        expectedOrigin: expected,
        headers: new Headers({ Origin: expected, "Sec-Fetch-Site": "cross-site" }),
      }),
    ).toBe(false);
  });
});

