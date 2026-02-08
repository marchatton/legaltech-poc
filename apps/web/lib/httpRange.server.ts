import "server-only";

export function parseSingleRangeHeader(
  rangeHeader: string,
  size: number,
): { start: number; end: number } | null {
  if (!Number.isSafeInteger(size) || size <= 0) return null;
  if (!rangeHeader.startsWith("bytes=")) return null;
  const range = rangeHeader.slice("bytes=".length).trim();

  // pdf.js typically uses single-range requests. Reject multi-range.
  if (range.includes(",")) return null;

  const firstDash = range.indexOf("-");
  if (firstDash === -1) return null;
  if (range.indexOf("-", firstDash + 1) !== -1) return null;

  const startStr = range.slice(0, firstDash).trim();
  const endStr = range.slice(firstDash + 1).trim();
  const hasStart = startStr !== "";
  const hasEnd = endStr !== "";

  if (!hasStart && !hasEnd) return null;

  function parseNonNegativeInt(val: string): number | null {
    if (!/^[0-9]+$/.test(val)) return null;
    const n = Number(val);
    if (!Number.isSafeInteger(n) || n < 0) return null;
    return n;
  }

  let start: number;
  let end: number;

  if (!hasStart && hasEnd) {
    // suffix bytes: "-500"
    const suffixLen = parseNonNegativeInt(endStr);
    if (suffixLen === null || suffixLen <= 0) return null;
    start = Math.max(0, size - suffixLen);
    end = size - 1;
  } else {
    const parsedStart = parseNonNegativeInt(startStr);
    if (parsedStart === null) return null;
    start = parsedStart;

    if (!hasEnd) {
      end = size - 1;
    } else {
      const parsedEnd = parseNonNegativeInt(endStr);
      if (parsedEnd === null) return null;
      end = parsedEnd;
    }

    if (start > end) return null;
    if (start >= size) return null;
    end = Math.min(end, size - 1);
  }

  return { start, end };
}
