import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../../lib/db.server";
import { assertDevOrDemoProdApi } from "../../../../../lib/devOnlyApi.server";
import { createSignedGetHeaders } from "../../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../../lib/trace.server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type ArtefactRow = {
  id: string;
  folder_id: string;
  type: string;
  kind: string;
  filename: string;
  storage_key: string;
  source_run_id: string | null;
  created_at: Date;
};

export async function GET(req: Request, ctx: { params: Promise<Record<string, string | string[] | undefined>> }) {
  const { traceId, headers } = createTraceContext();
  headers.set("Cache-Control", "no-store, no-cache");

  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  await ensureSchema();

  const rawParams = await ctx.params;
  const parsedParams = ParamsSchema.safeParse(rawParams);
  if (!parsedParams.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid route params.",
        details: parsedParams.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = parsedParams.data.id;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Folder not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, folder_id, type, kind, filename, storage_key, source_run_id, created_at
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  return Response.json(
    {
      artefacts: artefacts.map((a) => {
        const signed = createSignedGetHeaders({ storageKey: a.storage_key });
        const downloadUrl = `/artefacts/${a.id}/download?${new URLSearchParams({
          expires: String(signed.expires_at_ms),
          sig: signed.signature,
          issued: traceId,
        }).toString()}`;

        return {
          id: a.id,
          type: a.type,
          kind: a.kind,
          filename: a.filename,
          storage_key: a.storage_key,
          source_run_id: a.source_run_id,
          created_at: a.created_at.toISOString(),
          download_url: downloadUrl,
        };
      }),
    },
    { status: 200, headers },
  );
}
