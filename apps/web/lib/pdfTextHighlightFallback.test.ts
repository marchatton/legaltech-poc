import { describe, expect, it } from "vitest";

import type { NormPolygons, PdfJsViewportLike } from "@orbital-poc/core";

import { deriveTextOverlayFromSnippet, isFullPageFallbackPolygons } from "./overlayHighlight";

function identityViewport(): PdfJsViewportLike {
  return {
    width: 600,
    height: 800,
    convertToViewportPoint: (xPdf: number, yPdf: number) => [xPdf, yPdf],
  };
}

describe("isFullPageFallbackPolygons", () => {
  it("returns true for the deterministic page-level placeholder polygon", () => {
    const polygons: NormPolygons = [
      [
        [0, 0],
        [1, 0],
        [1, 1],
        [0, 1],
      ],
    ];

    expect(isFullPageFallbackPolygons(polygons)).toBe(true);
  });

  it("returns false for regular snippet-sized polygons", () => {
    const polygons: NormPolygons = [
      [
        [0.1, 0.2],
        [0.4, 0.2],
        [0.4, 0.25],
        [0.1, 0.25],
      ],
    ];

    expect(isFullPageFallbackPolygons(polygons)).toBe(false);
  });
});

describe("deriveTextOverlayFromSnippet", () => {
  it("derives compact line overlays from matching text items", () => {
    const viewport = identityViewport();
    const items = [
      {
        str: "Proposed",
        transform: [1, 0, 0, 1, 80, 620],
        width: 58,
        height: 12,
      },
      {
        str: "Insured:",
        transform: [1, 0, 0, 1, 144, 620],
        width: 54,
        height: 12,
      },
      {
        str: "18W18",
        transform: [1, 0, 0, 1, 205, 620],
        width: 42,
        height: 12,
      },
      {
        str: "Acquisition",
        transform: [1, 0, 0, 1, 252, 620],
        width: 78,
        height: 12,
      },
      {
        str: "LLC",
        transform: [1, 0, 0, 1, 336, 620],
        width: 24,
        height: 12,
      },
      {
        str: "Unrelated footer text",
        transform: [1, 0, 0, 1, 60, 80],
        width: 130,
        height: 12,
      },
    ];

    const polygons = deriveTextOverlayFromSnippet({
      items,
      snippet: "The Proposed Insured is 18W18 Acquisition LLC.",
      viewport,
    });

    expect(polygons).toBeTruthy();
    expect(polygons?.length).toBeGreaterThan(0);

    const allX = (polygons ?? []).flatMap((poly) => poly.map(([x]) => x));
    const allY = (polygons ?? []).flatMap((poly) => poly.map(([, y]) => y));
    const width = Math.max(...allX) - Math.min(...allX);
    const height = Math.max(...allY) - Math.min(...allY);

    // Guard against page-flood overlays.
    expect(width).toBeLessThan(380);
    expect(height).toBeLessThan(120);
  });
});
