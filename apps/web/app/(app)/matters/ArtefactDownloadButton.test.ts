import { afterEach, describe, expect, it, vi } from "vitest";

import { parseFreshnessState, resolveDownloadFailureMessage } from "./ArtefactDownloadButton";

describe("ArtefactDownloadButton helpers", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("marks links as stale when expires is in the past", () => {
    vi.spyOn(Date, "now").mockReturnValue(2_000_000);
    const freshness = parseFreshnessState("/artefacts/art_demo/download?expires=1000000&sig=test");
    expect(freshness).toEqual({
      kind: "stale",
      hint: "This download link expired. Refresh to request a new link.",
    });
  });

  it("maps expired safe envelopes to a deterministic stale hint", () => {
    const message = resolveDownloadFailureMessage({
      status: 403,
      payload: {
        error: {
          code: "UNAUTHORISED",
          message: "Download URL expired.",
        },
      },
    });

    expect(message).toBe("This download link expired. Refresh to request a new link.");
  });

  it("falls back to HTTP-derived messages when payload is unknown", () => {
    expect(resolveDownloadFailureMessage({ status: 404, payload: null })).toBe(
      "Artefact was not found. Re-run export if needed.",
    );
    expect(resolveDownloadFailureMessage({ status: 500, payload: null })).toBe("Download failed (500).");
  });
});
