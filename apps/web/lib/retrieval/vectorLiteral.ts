export const EMBEDDING_DIMENSIONS = 1536;

export function vectorLiteral(embedding: unknown): string {
  if (!Array.isArray(embedding)) throw new Error("Embedding is not an array.");
  if (embedding.length !== EMBEDDING_DIMENSIONS) {
    throw new Error(`Embedding length must be ${EMBEDDING_DIMENSIONS} (got ${embedding.length}).`);
  }

  const parts: string[] = [];
  for (const n of embedding) {
    const v = typeof n === "number" ? n : Number(n);
    if (!Number.isFinite(v)) throw new Error("Embedding contains a non-finite value.");
    parts.push(String(v));
  }

  return `[${parts.join(",")}]`;
}
