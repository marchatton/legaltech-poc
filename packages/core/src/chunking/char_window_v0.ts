export const CHAR_WINDOW_V0_CHUNKER_ID = "char_window_v0" as const;

export type CharWindowV0Params = {
  maxChars: number;
  overlapChars: number;
};

export const CHAR_WINDOW_V0_DEFAULT_PARAMS: CharWindowV0Params = {
  maxChars: 1500,
  overlapChars: 200,
};

export type CharWindowV0Span = {
  // 0-based, end-exclusive offsets into the page text used for chunking.
  char_start: number;
  char_end: number;
};

const WHITESPACE_RE = /\s/;

function isWhitespace(ch: string | undefined): boolean {
  if (!ch) return false;
  return WHITESPACE_RE.test(ch);
}

function alignStartToWhitespaceBoundary(args: { text: string; start: number; maxBacktrack: number }): number {
  if (args.start <= 0) return 0;
  if (args.start >= args.text.length) return args.text.length;

  // Already at a boundary if we're on whitespace or preceded by whitespace.
  if (isWhitespace(args.text[args.start]) || isWhitespace(args.text[args.start - 1])) return args.start;

  const searchStart = Math.max(0, args.start - Math.max(0, Math.trunc(args.maxBacktrack)));
  for (let i = args.start - 1; i >= searchStart; i--) {
    if (isWhitespace(args.text[i])) return i + 1;
  }

  // No whitespace boundary found nearby (e.g., long unbroken tokens); keep determinism by not shifting.
  return args.start;
}

function alignEndToWhitespaceBoundary(args: {
  text: string;
  start: number;
  nominalEnd: number;
  minEnd: number;
}): number {
  const len = args.text.length;
  if (args.nominalEnd >= len) return len;

  const minEnd = Math.max(args.start + 1, Math.trunc(args.minEnd));
  if (minEnd > args.nominalEnd) return args.nominalEnd;

  // Prefer cutting at whitespace (end points at the whitespace index, so it is excluded).
  for (let i = args.nominalEnd; i >= minEnd; i--) {
    if (isWhitespace(args.text[i])) return i;
  }

  return args.nominalEnd;
}

export function charWindowV0Spans(text: string, params: CharWindowV0Params = CHAR_WINDOW_V0_DEFAULT_PARAMS): CharWindowV0Span[] {
  const len = text.length;
  if (len === 0) return [{ char_start: 0, char_end: 0 }];

  const maxChars = Math.trunc(params.maxChars);
  const overlapChars = Math.trunc(params.overlapChars);

  if (!Number.isFinite(maxChars) || maxChars <= 0) throw new Error("char_window_v0: maxChars must be > 0");
  if (!Number.isFinite(overlapChars) || overlapChars < 0) throw new Error("char_window_v0: overlapChars must be >= 0");
  if (overlapChars >= maxChars) throw new Error("char_window_v0: overlapChars must be < maxChars");

  const step = maxChars - overlapChars;
  const spans: CharWindowV0Span[] = [];

  let start = 0;
  // Defensive: spans should always advance; this protects against logic regressions.
  let safety = 0;

  while (start < len) {
    if (spans.length > 0) {
      // Prefer starting on a whitespace boundary to avoid mid-word chunk starts when overlap lands inside a token.
      // Backtrack is bounded so the chunker always makes progress even with small params.
      const maxBacktrack = Math.min(overlapChars + 50, Math.max(0, step - 1));
      const lastStart = spans[spans.length - 1]?.char_start ?? 0;
      const nominalStart = start;
      const aligned = alignStartToWhitespaceBoundary({ text, start, maxBacktrack });
      start = aligned > lastStart ? aligned : nominalStart;
    }

    // Skip leading whitespace so chunk text starts on meaningful content. This can reduce overlap slightly but is
    // safe: any skipped characters are whitespace and deterministically determined by the page text.
    while (start < len && isWhitespace(text[start])) start += 1;
    if (start >= len) break;

    const nominalEnd = Math.min(len, start + maxChars);
    const end =
      nominalEnd >= len
        ? len
        : alignEndToWhitespaceBoundary({
            text,
            start,
            nominalEnd,
            // Ensure chunks advance: the chosen boundary must keep the span longer than the overlap.
            minEnd: start + overlapChars + 1,
          });

    spans.push({ char_start: start, char_end: end });
    if (end >= len) break;

    start = end - overlapChars;

    safety += 1;
    if (safety > 1_000_000) {
      throw new Error("char_window_v0: span generation did not terminate");
    }
  }

  return spans;
}

export type CharWindowV0PageChunk = {
  chunker_id: typeof CHAR_WINDOW_V0_CHUNKER_ID;
  page_number: number;
  char_start: number;
  char_end: number;
  text: string;
};

export function chunkPageCharWindowV0(args: {
  page_number: number;
  text: string;
  params?: CharWindowV0Params;
}): CharWindowV0PageChunk[] {
  const spans = charWindowV0Spans(args.text, args.params);
  return spans.map((s) => ({
    chunker_id: CHAR_WINDOW_V0_CHUNKER_ID,
    page_number: args.page_number,
    char_start: s.char_start,
    char_end: s.char_end,
    text: args.text.slice(s.char_start, s.char_end),
  }));
}
