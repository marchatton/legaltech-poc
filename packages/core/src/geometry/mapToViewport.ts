import type { NormPolygons } from "./anchors";

export type ViewBox = readonly [xMin: number, yMin: number, xMax: number, yMax: number];

export type CssPoint = readonly [x: number, y: number];
export type CssPolygon = readonly CssPoint[];
export type CssPolygons = readonly CssPolygon[];

export interface PdfJsViewportLike {
  readonly width: number;
  readonly height: number;
  convertToViewportPoint(xPdf: number, yPdf: number): [number, number];
}

export function mapNormPointToPdfPoint(point: readonly [number, number], viewBox: ViewBox): [number, number] {
  const [xNorm, yNorm] = point;
  const [xMin, yMin, xMax, yMax] = viewBox;

  const xPdf = xMin + xNorm * (xMax - xMin);
  const yPdf = yMax - yNorm * (yMax - yMin);

  return [xPdf, yPdf];
}

export function mapNormPolygonsToViewportCss(args: {
  polygons: NormPolygons;
  viewBox: ViewBox;
  viewport: PdfJsViewportLike;
}): CssPolygons {
  const { polygons, viewBox, viewport } = args;

  return polygons.map((poly) =>
    poly.map((p) => {
      const [xPdf, yPdf] = mapNormPointToPdfPoint(p, viewBox);
      const [xCss, yCss] = viewport.convertToViewportPoint(xPdf, yPdf);
      return [xCss, yCss] as const;
    }),
  );
}

export function bboxFromCssPolygons(polygons: CssPolygons): {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  width: number;
  height: number;
} | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;

  let points = 0;
  for (const poly of polygons) {
    for (const [x, y] of poly) {
      points += 1;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
    }
  }

  if (points === 0) return null;

  return { minX, minY, maxX, maxY, width: maxX - minX, height: maxY - minY };
}

