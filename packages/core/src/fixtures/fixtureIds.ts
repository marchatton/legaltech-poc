const PACK_ID_RE = /^pack_\d{2}_[a-z0-9_]+$/i;
const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;
const STEM_RE = /^[A-Za-z0-9_-]+$/;

export function fixtureDocumentId(args: { packId: string; filename: string }): string {
  const packId = args.packId.trim();
  if (!PACK_ID_RE.test(packId)) throw new Error("INVALID_PACK_ID");

  const filename = args.filename.trim();
  if (!PDF_FILENAME_RE.test(filename)) throw new Error("INVALID_PDF_FILENAME");

  const stem = filename.replace(/\.pdf$/i, "");
  if (!STEM_RE.test(stem)) throw new Error("INVALID_PDF_STEM");

  // Fixture docs are addressed via a deterministic id so the viewer can use the
  // canonical /documents/:id/* contract without depending on DB ingestion.
  return `fx_${packId}__${stem}`;
}

export function parseFixtureDocumentId(
  documentId: string,
):
  | { ok: true; packId: string; filename: string; stem: string }
  | { ok: false } {
  if (typeof documentId !== "string") return { ok: false };
  if (!documentId.startsWith("fx_")) return { ok: false };

  const rest = documentId.slice("fx_".length);
  const parts = rest.split("__");
  if (parts.length !== 2) return { ok: false };

  const [packId, stem] = parts;
  if (!packId || !PACK_ID_RE.test(packId)) return { ok: false };
  if (!stem || !STEM_RE.test(stem)) return { ok: false };

  return { ok: true, packId, stem, filename: `${stem}.pdf` };
}

