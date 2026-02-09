import type { NormPolygons } from "@orbital-poc/core";

export function validateNormPolygons(polygons: NormPolygons): string | null {
  if (!polygons.length) return "NO_POLYGONS";
  for (const poly of polygons) {
    if (poly.length < 3) return "POLYGON_TOO_SMALL";
    for (const [x, y] of poly) {
      if (!Number.isFinite(x) || !Number.isFinite(y)) return "NON_FINITE";
      if (x < 0 || x > 1 || y < 0 || y > 1) return "OUT_OF_RANGE";
    }
  }
  return null;
}

