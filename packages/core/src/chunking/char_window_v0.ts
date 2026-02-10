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

  for (let start = 0; start < len; start += step) {
    const end = Math.min(len, start + maxChars);
    spans.push({ char_start: start, char_end: end });
    if (end === len) break;
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

