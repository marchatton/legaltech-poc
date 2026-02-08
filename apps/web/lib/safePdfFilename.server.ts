import "server-only";

const DEFAULT_FILENAME = "document.pdf";

export function safePdfFilename(val: unknown): string {
  if (typeof val !== "string") return DEFAULT_FILENAME;
  const s = val.trim();
  if (!s) return DEFAULT_FILENAME;
  if (s.length > 200) return DEFAULT_FILENAME;
  if (!/^[A-Za-z0-9_.-]+\.pdf$/i.test(s)) return DEFAULT_FILENAME;
  return s;
}

