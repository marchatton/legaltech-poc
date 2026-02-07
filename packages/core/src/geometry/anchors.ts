import { z } from "zod";

export const AnchorBoxSchema = z.object({
  page: z.number().int().positive(),
  bbox: z.tuple([
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
    z.number().min(0).max(1),
  ]),
}).superRefine((val, ctx) => {
  const [xMin, yMin, xMax, yMax] = val.bbox;
  if (xMin > xMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox xMin > xMax", path: ["bbox"] });
  if (yMin > yMax) ctx.addIssue({ code: z.ZodIssueCode.custom, message: "bbox yMin > yMax", path: ["bbox"] });
});

export type AnchorBox = z.infer<typeof AnchorBoxSchema>;

export const AnchorFileSchema = z.record(z.string().min(1), AnchorBoxSchema);
export type AnchorFile = z.infer<typeof AnchorFileSchema>;

export type NormPoint = readonly [xNorm: number, yNorm: number];
export type NormPolygon = readonly NormPoint[];
export type NormPolygons = readonly NormPolygon[];

export function anchorBoxToPolygons(anchor: AnchorBox): NormPolygons {
  const [xMin, yMin, xMax, yMax] = anchor.bbox;

  // Canonical spec: normalised [0..1], origin top-left.
  const polygon: NormPolygon = [
    [xMin, yMin],
    [xMax, yMin],
    [xMax, yMax],
    [xMin, yMax],
  ];

  return [polygon];
}
