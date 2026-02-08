import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../lib/db.server";
import { newId } from "../../../lib/ids";

export const runtime = "nodejs";

const CreateFolderSchema = z.object({
  name: z.string().trim().min(1),
});

export async function GET(): Promise<Response> {
  await ensureSchema();

  const folders = await sql<
    Array<{
      id: string;
      name: string;
      state: string;
      latest_index_version: string;
      created_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at
    FROM folders
    ORDER BY created_at DESC
  `;

  return Response.json({
    folders: folders.map((f) => ({
      id: f.id,
      name: f.name,
      state: f.state,
      latest_index_version: f.latest_index_version,
      created_at: f.created_at.toISOString(),
    })),
  });
}

export async function POST(req: Request): Promise<Response> {
  await ensureSchema();

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body." }), {
      status: 400,
    });
  }

  const parsed = CreateFolderSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Body did not match schema.",
        details: parsed.error.flatten(),
      }),
      { status: 400 },
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
    { status: 200 },
  );
}

