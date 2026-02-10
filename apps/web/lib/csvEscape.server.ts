import "server-only";

// Escape a single CSV cell, including formula-injection hardening for Excel/Sheets.
export function csvEscape(val: unknown): string {
  let s = val === null || val === undefined ? "" : String(val);

  // Prevent CSV formula injection. Quoting is not sufficient in Excel/Sheets.
  // Prefix when the first non-whitespace character is a formula sentinel.
  if (/^[\t\r\n ]*[=+\-@]/.test(s)) s = `'${s}`;

  const needsQuotes = /[",\n\r]/.test(s);
  const escaped = s.replace(/"/g, '""');
  return needsQuotes ? `"${escaped}"` : escaped;
}

