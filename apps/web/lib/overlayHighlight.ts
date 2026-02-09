import type { SVGProps } from "react";

export const overlayHighlightPolygonProps = {
  fill: "rgb(var(--secondary) / 0.35)",
  stroke: "rgb(var(--secondary) / 0.7)",
  strokeWidth: 2,
} satisfies Pick<SVGProps<SVGPolygonElement>, "fill" | "stroke" | "strokeWidth">;

