import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../lib/db.server";
import { assertDevOnlyApi } from "../../../lib/devOnlyApi.server";
import { newId } from "../../../lib/ids";
import { listMatters, parseMatterListFilters } from "../../../lib/mattersList.server";
import { createTraceContext } from "../../../lib/trace.server";

export const runtime = "nodejs";

const CreateFolderSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;

  const url = new URL(req.url);
  const filters = parseMatterListFilters(Object.fromEntries(url.searchParams));
  const folders = await listMatters(filters);

  return Response.json(
    {
      filters,
      folders,
    },
    { status: 200, headers },
  );
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOnlyApi(traceId, headers);
  if (devGate) return devGate;
  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = CreateFolderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
        traceId,
      }),
      { status: 400, headers },
    );
  }

  const folderId = newId("fld");
  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES (${folderId}, ${parsed.data.name}, 'empty', 'v1', now(), now())
  `;

  return Response.json(
    {
      folder: {
        id: folderId,
        name: parsed.data.name,
        state: "empty",
        latest_index_version: "v1",
      },
    },
    { status: 200, headers },
  );
}
