import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { safeErrorEnvelope } from "@orbital-poc/core";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { assertDemoModeEnabledApi } from "../../../../lib/demoMode.server";
import { assertDevOrDemoProdApi } from "../../../../lib/devOnlyApi.server";
import { assertJsonContentType } from "../../../../lib/jsonContentType";
import { orbitalMode } from "../../../../lib/runtimeMode";
import { refreshFolderState } from "../../../../lib/folderState.server";
import { enqueueDocumentIngest } from "../../../../lib/ingest/ingestQueue.server";
import { newId } from "../../../../lib/ids";
import { DEMO_PACK_ALLOWLIST } from "../../../../lib/demoPackAllowlist";
import { putObjectWriteOnce, validateStorageKey } from "../../../../lib/objectStore.server";
import { createTraceContext } from "../../../../lib/trace.server";

export const runtime = "nodejs";

const BodySchema = z.object({
  pack_id: z.enum(DEMO_PACK_ALLOWLIST),
});

const PACK_JURISDICTION: Record<string, string> = {
  pack_01_clean: "NY",
  pack_02_missing_rea: "TX",
  pack_09_bad_citation: "NY",
};

const PDF_FILENAME_RE = /^[A-Za-z0-9_-]+\.pdf$/i;

function packsRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../docs/08-example-data");
}

function listPackPdfFiles(packId: string): Array<{ filename: string; absPath: string; bytes: number }> {
  const root = packsRoot();
  const packDir = path.resolve(root, packId);
  if (!packDir.startsWith(root + path.sep)) throw new Error("PATH_TRAVERSAL");

  const docsDir = path.resolve(packDir, "docs");
  if (!docsDir.startsWith(packDir + path.sep)) throw new Error("PATH_TRAVERSAL");

  if (!fs.existsSync(docsDir)) return [];

  const entries = fs.readdirSync(docsDir, { withFileTypes: true });
  const pdfs = entries
    .filter((e) => e.isFile() && PDF_FILENAME_RE.test(e.name))
    .map((e) => {
      const absPath = path.join(docsDir, e.name);
      const st = fs.statSync(absPath);
      return { filename: e.name, absPath, bytes: st.size };
    })
    .filter((f) => f.bytes > 0)
    .sort((a, b) => a.filename.localeCompare(b.filename));

  return pdfs;
}

function demoFolderName(packId: string): string {
  const now = new Date();
  const year = now.getUTCFullYear();
  const month = now.toLocaleString("en-US", { month: "short", timeZone: "UTC" });
  const day = String(now.getUTCDate()).padStart(2, "0");
  const hour = String(now.getUTCHours()).padStart(2, "0");
  const minute = String(now.getUTCMinutes()).padStart(2, "0");
  const ts = `${year}-${month}-${day} ${hour}:${minute}`;
  return `DEMO: ${packId} ${ts}`;
}

export async function POST(req: Request): Promise<Response> {
  const { traceId, headers } = createTraceContext();
  const devGate = assertDevOrDemoProdApi(traceId, headers);
  if (devGate) return devGate;

  // Demo toolbar remains dev-only, but pack loading is allowed in demo-prod.
  if (orbitalMode() === "dev") {
    const demoGate = assertDemoModeEnabledApi(traceId, headers);
    if (demoGate) return demoGate;
  }

  const ctGate = assertJsonContentType({ req, traceId, headers });
  if (ctGate) return ctGate;

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return Response.json(safeErrorEnvelope({ code: "VALIDATION_ERROR", message: "Invalid JSON body.", traceId }), {
      status: 400,
      headers,
    });
  }

  const parsed = BodySchema.safeParse(body);
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

  const packId = parsed.data.pack_id;

  let files: Array<{ filename: string; absPath: string; bytes: number }>;
  try {
    files = listPackPdfFiles(packId);
  } catch {
    return Response.json(
      safeErrorEnvelope({
        code: "VALIDATION_ERROR",
        message: "Invalid pack path.",
        details: { pack_id: packId },
        traceId,
      }),
      { status: 400, headers },
    );
  }

  if (files.length === 0) {
    return Response.json(safeErrorEnvelope({ code: "NOT_FOUND", message: "Pack docs not found.", traceId }), {
      status: 404,
      headers,
    });
  }

  await ensureSchema();

  const folderId = newId("fld");
  const folderName = demoFolderName(packId);

  try {
    const jurisdictionState = PACK_JURISDICTION[packId] ?? null;
    await sql`
      INSERT INTO folders (id, name, state, latest_index_version, jurisdiction_state, created_at, updated_at)
      VALUES (${folderId}, ${folderName}, 'empty', 'v1', ${jurisdictionState}, now(), now())
    `;

    const seededDocIds: string[] = [];
    for (const f of files) {
      const documentId = newId("doc");
      const storageKey = `folders/${folderId}/documents/${documentId}.pdf`;
      const keyValid = validateStorageKey(storageKey);
      if (!keyValid.ok) {
        throw new Error("INVALID_STORAGE_KEY");
      }

      await sql`
        INSERT INTO documents (
          id,
          folder_id,
          filename,
          mime,
          bytes,
          storage_key,
          parse_status,
          ocr_status,
          created_at,
          updated_at
        )
        VALUES (
          ${documentId},
          ${folderId},
          ${f.filename},
          'application/pdf',
          ${f.bytes},
          ${storageKey},
          'queued',
          'queued',
          now(),
          now()
        )
      `;

      const bytes = await fs.promises.readFile(f.absPath);
      const result = await putObjectWriteOnce({ storageKey, bytes: new Uint8Array(bytes) });

      await sql`
        UPDATE documents
        SET upload_completed_at = now(),
            sha256 = ${result.sha256},
            updated_at = now()
        WHERE id = ${documentId}
          AND upload_completed_at IS NULL
      `;

      seededDocIds.push(documentId);
    }

    await refreshFolderState(folderId);

    for (const docId of seededDocIds) {
      enqueueDocumentIngest(docId, { traceId });
    }
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error("demo.load-pack failed", {
      trace_id: traceId,
      pack_id: packId,
      folder_id: folderId,
      message: err instanceof Error ? err.message : String(err),
    });
    return Response.json(safeErrorEnvelope({ code: "INTERNAL", message: "Failed to load demo pack.", traceId }), {
      status: 500,
      headers,
    });
  }

  return Response.json(
    {
      folder: {
        id: folderId,
        name: folderName,
      },
    },
    { status: 200, headers },
  );
}
