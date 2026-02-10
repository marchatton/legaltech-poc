import { z } from "zod";

import { Badge } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { Table, TableFrame, TD, TH, TR } from "../../ui/Table";

import { ensureSchema, sql } from "../../../lib/db.server";
import { createSignedGetHeaders } from "../../../lib/objectStore.server";

type Props = {
  folderId: string;
};

const FolderIdSchema = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);

type ArtefactRow = {
  id: string;
  kind: string;
  filename: string;
  created_at: Date;
  storage_key: string;
};

function formatCreatedAt(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toISOString().replace("T", " ").replace(".000Z", "Z");
}

function isUnsafeFilename(filename: string): boolean {
  return filename.toUpperCase().includes(".UNSAFE.");
}

function signedArtefactDownloadHref(args: { artefactId: string; storageKey: string; issued: string }): string {
  const signed = createSignedGetHeaders({ storageKey: args.storageKey });
  return `/artefacts/${encodeURIComponent(args.artefactId)}/download?${new URLSearchParams({
    expires: String(signed.expires_at_ms),
    sig: signed.signature,
    issued: args.issued,
  }).toString()}`;
}

export async function ArtefactsList(props: Props) {
  const parsedId = FolderIdSchema.safeParse(props.folderId);
  if (!parsedId.success) {
    return (
      <section className="rounded-ui-lg border border-destructive/30 bg-destructive/10 p-4">
        <div className="text-sm font-semibold text-destructive">Artefacts</div>
        <div className="mt-2 text-xs text-destructive">Invalid folder id.</div>
      </section>
    );
  }

  await ensureSchema();

  const folderId = parsedId.data;
  const found = await sql<{ id: string }[]>`
    SELECT id
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;
  if (!found[0]) {
    return (
      <Card className="p-4">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, kind, filename, created_at, storage_key
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  if (!artefacts.length) {
    return (
      <Card className="p-4">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <div className="text-sm font-semibold text-foreground">Artefacts</div>
        <div className="text-xs text-muted-foreground">{artefacts.length} item(s)</div>
      </div>

      <TableFrame className="mt-3">
        <Table>
          <thead>
            <tr>
              <TH>Filename</TH>
              <TH>Kind</TH>
              <TH>Created</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {artefacts.map((a) => {
              const unsafe = isUnsafeFilename(a.filename);
              let downloadHref: string;
              try {
                downloadHref = signedArtefactDownloadHref({
                  artefactId: a.id,
                  storageKey: a.storage_key,
                  issued: "rsc",
                });
              } catch (err) {
                const message = err instanceof Error ? err.message : String(err);
                return (
                  <TR key={a.id}>
                    <TD colSpan={4}>
                      <div className="text-xs text-destructive">
                        Failed to sign artefact download: <span className="font-mono">{message}</span>
                      </div>
                    </TD>
                  </TR>
                );
              }
              return (
                <TR key={a.id}>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? (
                        <Badge variant="destructive" size="sm">
                          UNSAFE
                        </Badge>
                      ) : null}
                      <span className="font-mono">{a.filename}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="muted" size="sm" className="font-mono">
                      {a.kind}
                    </Badge>
                  </TD>
                  <TD>
                    <span className="font-mono">{formatCreatedAt(a.created_at.toISOString())}</span>
                  </TD>
                  <TD className="text-right">
                    <a className={buttonClassName({ variant: "secondary", size: "sm" })} href={downloadHref}>
                      Download
                    </a>
                  </TD>
                </TR>
              );
            })}
          </tbody>
        </Table>
      </TableFrame>
    </Card>
  );
}
