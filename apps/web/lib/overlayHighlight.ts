import type { SVGProps } from "react";
import type { CssPolygons, NormPolygons, PdfJsViewportLike } from "@orbital-poc/core";

export const overlayHighlightPolygonProps = {
  fill: "rgb(var(--secondary) / 0.35)",
  stroke: "rgb(var(--secondary) / 0.7)",
  strokeWidth: 2,
} satisfies Pick<SVGProps<SVGPolygonElement>, "fill" | "stroke" | "strokeWidth">;

type PdfTextItemLike = {
  str?: string;
  transform?: unknown;
  width?: number;
  height?: number;
};

type Rect = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
};

type MatchedRect = Rect & {
  centerY: number;
  height: number;
  score: number;
};

type MatchedGroup = {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  centerY: number;
  maxHeight: number;
  score: number;
};

const STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "from",
  "that",
  "this",
  "with",
  "into",
  "such",
  "there",
  "here",
  "where",
  "shall",
  "would",
  "could",
  "should",
  "made",
  "make",
  "your",
  "ours",
  "they",
  "them",
  "their",
  "about",
  "after",
  "before",
  "between",
  "under",
  "over",
  "also",
  "only",
  "both",
  "each",
  "any",
  "all",
  "has",
  "have",
  "had",
  "was",
  "were",
  "are",
  "is",
  "be",
  "to",
  "of",
  "in",
  "on",
  "by",
  "or",
  "a",
  "an",
]);

function normalizeForMatch(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function uniqueInOrder(values: string[]): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function tokensFromSnippet(snippet: string): string[] {
  const normalized = normalizeForMatch(snippet);
  if (!normalized) return [];

  const rawTokens = normalized
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STOP_WORDS.has(token));

  const withDigits = rawTokens.filter((token) => /\d/.test(token));
  const longTokens = rawTokens.filter((token) => token.length >= 7);
  const mediumTokens = rawTokens.filter((token) => token.length >= 5);

  return uniqueInOrder([...withDigits, ...longTokens, ...mediumTokens, ...rawTokens]).slice(0, 12);
}

function finiteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function parseTransform(value: unknown): readonly [number, number, number, number, number, number] | null {
  if (!Array.isArray(value) || value.length < 6) return null;
  const [a, b, c, d, e, f] = value;
  if (!finiteNumber(a) || !finiteNumber(b) || !finiteNumber(c) || !finiteNumber(d) || !finiteNumber(e) || !finiteNumber(f)) {
    return null;
  }
  return [a, b, c, d, e, f] as const;
}

function matchScore(text: string, tokens: string[]): number {
  let score = 0;
  for (const token of tokens) {
    if (text.includes(token)) score += 1;
  }
  return score;
}

function toMatchedRect(item: PdfTextItemLike, viewport: PdfJsViewportLike, tokens: string[]): MatchedRect | null {
  const text = typeof item.str === "string" ? item.str : "";
  if (!text.trim()) return null;

  const normalizedText = normalizeForMatch(text);
  if (!normalizedText) return null;

  const score = matchScore(normalizedText, tokens);
  if (score <= 0) return null;

  const transform = parseTransform(item.transform);
  if (!transform) return null;

  const xPdf = transform[4];
  const yPdf = transform[5];
  const widthPdf = finiteNumber(item.width) && Math.abs(item.width) > 0 ? Math.abs(item.width) : Math.max(Math.abs(transform[0]), 1);
  const heightPdf =
    finiteNumber(item.height) && Math.abs(item.height) > 0 ? Math.abs(item.height) : Math.max(Math.abs(transform[3]), 8);

  const [xA, yA] = viewport.convertToViewportPoint(xPdf, yPdf);
  const [xB, yB] = viewport.convertToViewportPoint(xPdf + widthPdf, yPdf + heightPdf);

  const minX = Math.min(xA, xB);
  const minY = Math.min(yA, yB);
  const maxX = Math.max(xA, xB);
  const maxY = Math.max(yA, yB);

  if (!finiteNumber(minX) || !finiteNumber(minY) || !finiteNumber(maxX) || !finiteNumber(maxY)) return null;
  if (maxX - minX < 0.5 || maxY - minY < 0.5) return null;

  const height = maxY - minY;
  return {
    minX,
    minY,
    maxX,
    maxY,
    height,
    centerY: minY + height / 2,
    score,
  };
}

function mergeIntoLines(rects: MatchedRect[]): MatchedGroup[] {
  const sorted = [...rects].sort((a, b) => (a.centerY === b.centerY ? a.minX - b.minX : a.centerY - b.centerY));
  const groups: MatchedGroup[] = [];

  for (const rect of sorted) {
    const last = groups[groups.length - 1];
    if (!last) {
      groups.push({
        minX: rect.minX,
        minY: rect.minY,
        maxX: rect.maxX,
        maxY: rect.maxY,
        centerY: rect.centerY,
        maxHeight: rect.height,
        score: rect.score,
      });
      continue;
    }

    const maxLineDrift = Math.max(8, last.maxHeight * 0.8, rect.height * 0.8);
    if (Math.abs(rect.centerY - last.centerY) > maxLineDrift) {
      groups.push({
        minX: rect.minX,
        minY: rect.minY,
        maxX: rect.maxX,
        maxY: rect.maxY,
        centerY: rect.centerY,
        maxHeight: rect.height,
        score: rect.score,
      });
      continue;
    }

    last.minX = Math.min(last.minX, rect.minX);
    last.minY = Math.min(last.minY, rect.minY);
    last.maxX = Math.max(last.maxX, rect.maxX);
    last.maxY = Math.max(last.maxY, rect.maxY);
    last.maxHeight = Math.max(last.maxHeight, rect.height);
    last.score += rect.score;
    last.centerY = (last.minY + last.maxY) / 2;
  }

  return groups;
}

function groupToPolygon(group: MatchedGroup, viewport: PdfJsViewportLike): CssPolygons[number] | null {
  const padX = 6;
  const padY = 3;
  const minX = Math.max(0, group.minX - padX);
  const minY = Math.max(0, group.minY - padY);
  const maxX = Math.min(viewport.width, group.maxX + padX);
  const maxY = Math.min(viewport.height, group.maxY + padY);

  if (maxX - minX < 1 || maxY - minY < 1) return null;

  return [
    [minX, minY],
    [maxX, minY],
    [maxX, maxY],
    [minX, maxY],
  ] as const;
}

function normPolygonBbox(polygons: NormPolygons): Rect | null {
  let minX = Number.POSITIVE_INFINITY;
  let minY = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  let maxY = Number.NEGATIVE_INFINITY;
  let points = 0;

  for (const poly of polygons) {
    for (const [x, y] of poly) {
      if (!finiteNumber(x) || !finiteNumber(y)) return null;
      minX = Math.min(minX, x);
      minY = Math.min(minY, y);
      maxX = Math.max(maxX, x);
      maxY = Math.max(maxY, y);
      points += 1;
    }
  }

  if (points === 0) return null;
  return { minX, minY, maxX, maxY };
}

export function isFullPageFallbackPolygons(polygons: NormPolygons): boolean {
  if (polygons.length !== 1) return false;
  const bbox = normPolygonBbox(polygons);
  if (!bbox) return false;

  const width = bbox.maxX - bbox.minX;
  const height = bbox.maxY - bbox.minY;
  return bbox.minX <= 0.02 && bbox.minY <= 0.02 && bbox.maxX >= 0.98 && bbox.maxY >= 0.98 && width >= 0.95 && height >= 0.95;
}

export function deriveTextOverlayFromSnippet(args: {
  items: unknown[];
  snippet: string;
  viewport: PdfJsViewportLike;
  maxLines?: number;
}): CssPolygons | null {
  if (!Array.isArray(args.items) || args.items.length === 0) return null;
  if (!finiteNumber(args.viewport.width) || !finiteNumber(args.viewport.height) || args.viewport.width <= 0 || args.viewport.height <= 0) {
    return null;
  }

  const tokens = tokensFromSnippet(args.snippet);
  if (tokens.length === 0) return null;

  const rects: MatchedRect[] = [];
  for (const rawItem of args.items) {
    const rect = toMatchedRect(rawItem as PdfTextItemLike, args.viewport, tokens);
    if (rect) rects.push(rect);
  }
  if (rects.length === 0) return null;

  const grouped = mergeIntoLines(rects);
  if (grouped.length === 0) return null;

  const maxLines = args.maxLines ?? 4;
  const selected = grouped
    .sort((a, b) => (a.score === b.score ? a.minY - b.minY : b.score - a.score))
    .slice(0, maxLines)
    .sort((a, b) => a.minY - b.minY);

  const polygons = selected
    .map((group) => groupToPolygon(group, args.viewport))
    .filter((poly): poly is CssPolygons[number] => Array.isArray(poly) && poly.length >= 3);

  return polygons.length > 0 ? polygons : null;
}
