import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import {
  objectExists,
  readObject,
  validateArtefactCsvStorageKey,
  validateArtefactMetadataStorageKey,
} from "../../../../../lib/objectStore.server";

export const runtime = "nodejs";

const QuerySchema = z.object({
  folder_id: z
    .string()
    .min(1)
    .regex(/^pack_\d{2}_[a-z0-9_]+$/i, "Invalid folder_id"),
  artefact_id: z
    .string()
    .min(1)
    .max(200)
    .regex(/^art_[0-9a-f-]+$/i, "Invalid artefact_id"),
});

function safeFilename(val: unknown): string | null {
  if (typeof val !== "string") return null;
  const s = val.trim();
  if (!s) return null;
  if (s.length > 200) return null;
  if (!/^[A-Za-z0-9_.-]+\.csv$/.test(s)) return null;
  return s;
}

export async function GET(req: Request): Promise<Response> {
  const url = new URL(req.url);
  const parsed = QuerySchema.safeParse(Object.fromEntries(url.searchParams));
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid query params.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
    );
  }

  const folderId = parsed.data.folder_id;
  const artefactId = parsed.data.artefact_id;

  const storageKey = `folders/${folderId}/artefacts/${artefactId}.csv`;
  const keyOk = validateArtefactCsvStorageKey(storageKey);
  if (!keyOk.ok) {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid storage key." }), {
      status: 400,
    });
  }

  if (!objectExists(storageKey)) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Artefact not found." }), { status: 404 });
  }

  const metaKey = `folders/${folderId}/artefacts/${artefactId}.meta.json`;
  const metaOk = validateArtefactMetadataStorageKey(metaKey);

  let filename: string = `${artefactId}.csv`;
  if (metaOk.ok && objectExists(metaKey)) {
    try {
      const metaBytes = await readObject(metaKey);
      const meta = JSON.parse(Buffer.from(metaBytes).toString("utf8")) as unknown;
      if (meta && typeof meta === "object" && !Array.isArray(meta)) {
        filename = safeFilename((meta as { filename?: unknown }).filename) ?? filename;
      }
    } catch {
      // ignore metadata parse failures; downloads should still work.
    }
  }

  const bytes = await readObject(storageKey);
  return new Response(Buffer.from(bytes), {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "no-store",
    },
  });
}
