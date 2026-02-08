import "server-only";

export function parseSingleRangeHeader(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const [startStr, endStr] = range.split("-");
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = Number(endStr);
    if (!Number.isFinite(suffixLen) || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    start = Number(startStr);
    end = hasEnd ? Number(endStr) : size - 1;

    if (!Number.isFinite(start) || start < 0) return null;
    if (!Number.isFinite(end) || end < 0) return null;
    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}

