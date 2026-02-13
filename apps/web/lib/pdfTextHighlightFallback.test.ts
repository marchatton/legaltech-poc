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

  it("prefers answer-focused highlights over broad header matches", () => {
    const viewport = identityViewport();
    const items = [
      {
        str: "COMMITMENT FOR TITLE INSURANCE",
        transform: [1, 0, 0, 1, 60, 720],
        width: 320,
        height: 12,
      },
      {
        str: "Commitment Date: January 12, 2026 Order No.: OW-an-5568",
        transform: [1, 0, 0, 1, 60, 700],
        width: 420,
        height: 12,
      },
      {
        str: "SCHEDULE A",
        transform: [1, 0, 0, 1, 60, 630],
        width: 120,
        height: 12,
      },
      {
        str: "1. Proposed Insured: 18W18 Acquisition LLC",
        transform: [1, 0, 0, 1, 60, 612],
        width: 330,
        height: 12,
      },
      {
        str: "2. Policy Amount: $75,000,000",
        transform: [1, 0, 0, 1, 60, 596],
        width: 260,
        height: 12,
      },
    ];

    const polygons = deriveTextOverlayFromSnippet({
      items,
      snippet:
        "COMMITMENT FOR TITLE INSURANCE Commitment Date: January 12, 2026 Order No.: OW-an-5568 " +
        "SCHEDULE A 1. Proposed Insured: 18W18 Acquisition LLC 2. Policy Amount: $75,000,000",
      focusText:
        "Based on the provided evidence, the Proposed Insured is 18W18 Acquisition LLC. " +
        "This is stated in Schedule A, Section 1.",
      viewport,
    });

    expect(polygons).toBeTruthy();
    expect(polygons?.length).toBeGreaterThan(0);

    const allY = (polygons ?? []).flatMap((poly) => poly.map(([, y]) => y));

    // Focused matching should stay in the Schedule A region rather than the top-page header.
    expect(Math.max(...allY)).toBeLessThan(660);
    expect(Math.min(...allY)).toBeGreaterThan(580);
  });
});
