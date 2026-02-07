import { describe, expect, it } from "vitest";

import { bboxFromCssPolygons, mapNormPointToPdfPoint, mapNormPolygonsToViewportCss } from "./mapToViewport";

describe("mapNormPointToPdfPoint", () => {
  it("maps top-left normalised points to PDF points with Y inversion", () => {
    const viewBox: [number, number, number, number] = [0, 0, 100, 100];

    expect(mapNormPointToPdfPoint([0, 0], viewBox)).toEqual([0, 100]);
    expect(mapNormPointToPdfPoint([0, 1], viewBox)).toEqual([0, 0]);
    expect(mapNormPointToPdfPoint([1, 0], viewBox)).toEqual([100, 100]);
    expect(mapNormPointToPdfPoint([1, 1], viewBox)).toEqual([100, 0]);
  });
});

describe("mapNormPolygonsToViewportCss", () => {
  it("maps via viewport.convertToViewportPoint()", () => {
    const viewBox: [number, number, number, number] = [0, 0, 100, 100];
    const viewport = {
      width: 100,
      height: 100,
      convertToViewportPoint: (x: number, y: number) => [x, y] as [number, number],
    };

    const mapped = mapNormPolygonsToViewportCss({
      polygons: [
        [
          [0.1, 0.2],
          [0.2, 0.2],
          [0.2, 0.3],
          [0.1, 0.3],
        ],
      ],
      viewBox,
      viewport,
    });

    // yPdf = 100 - yNorm*100
    expect(mapped[0][0]).toEqual([10, 80]);
    expect(mapped[0][1]).toEqual([20, 80]);
    expect(mapped[0][2]).toEqual([20, 70]);
    expect(mapped[0][3]).toEqual([10, 70]);

    const bbox = bboxFromCssPolygons(mapped);
    expect(bbox).toEqual({ minX: 10, minY: 70, maxX: 20, maxY: 80, width: 10, height: 10 });
  });
});

