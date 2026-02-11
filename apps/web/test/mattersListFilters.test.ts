import { describe, expect, it } from "vitest";

import { parseMatterListFilters, resolveEffectiveStateFilter } from "../lib/mattersList.server";

describe("matters list filter parsing", () => {
  it("defaults invalid query inputs to an unfiltered state", () => {
    const parsed = parseMatterListFilters({ q: 123, state: "INVALID", view: "UNKNOWN" });

    expect(parsed).toEqual({
      q: "",
      state: null,
      view: null,
    });
  });

  it("keeps deterministic state mapping for needs_attention view", () => {
    const parsed = parseMatterListFilters({ q: "acme", view: "needs_attention" });

    expect(parsed).toEqual({
      q: "acme",
      state: null,
      view: "needs_attention",
    });
    expect(resolveEffectiveStateFilter(parsed)).toEqual(["empty", "ingesting", "failed"]);
  });

  it("returns an empty effective state set for conflicting state + view", () => {
    const parsed = parseMatterListFilters({ state: "ready", view: "needs_attention" });
    expect(resolveEffectiveStateFilter(parsed)).toEqual([]);
  });

  it("treats empty state query as unset and preserves q/view", () => {
    const parsed = parseMatterListFilters({ q: "US002", state: "", view: "needs_attention" });

    expect(parsed).toEqual({
      q: "US002",
      state: null,
      view: "needs_attention",
    });
  });
});
