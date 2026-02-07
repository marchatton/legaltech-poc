import { createHash } from "node:crypto";

export function normaliseSnippet(input: string): string {
  return input.replace(/\r\n/g, "\n").trim().replace(/\s+/g, " ");
}

export function hashSnippet(snippet: string): string {
  const normalised = normaliseSnippet(snippet);
  const bytes = new TextEncoder().encode(normalised);
  const hashHex = createHash("sha256").update(bytes).digest("hex");
  return `sha256:${hashHex}`;
}

