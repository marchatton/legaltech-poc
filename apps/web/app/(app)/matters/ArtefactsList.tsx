import { z } from "zod";

import { Badge } from "../../ui/Badge";
import { buttonClassName } from "../../ui/Button";
import { Card } from "../../ui/Card";
import { ErrorBanner } from "../../ui/ErrorBanner";
import { Select } from "../../ui/Input";
import { SectionTitle } from "../../ui/Page";
import { Table, TableFrame, TD, TH, TR } from "../../ui/Table";

import { ensureSchema, sql } from "../../../lib/db.server";
import { createSignedGetHeaders } from "../../../lib/objectStore.server";
import {
  ARTEFACT_KIND_PARAM,
  ARTEFACT_SAFETY_PARAM,
  ARTEFACT_TYPE_PARAM,
  applyArtefactFilters,
  buildPassthroughSearchEntries,
  isUnsafeArtefact,
  parseArtefactFilters,
  searchFromEntries,
  uniqueFilterValues,
  type ArtefactFilterSearchParams,
} from "./artefactsFilters";

type Props = {
  folderId: string;
  searchParams?: ArtefactFilterSearchParams;
  supportRoute?: string;
};

const FolderIdSchema = z.string().trim().min(1).max(200).regex(/^[A-Za-z0-9_-]+$/);

type ArtefactRow = {
  id: string;
  kind: string;
  type: string;
  filename: string;
  created_at: Date;
  storage_key: string;
  source_run_id: string | null;
  metadata_json: unknown;
};

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
      <ErrorBanner
        title="Artefacts unavailable"
        code="VALIDATION_ERROR"
        message="Invalid folder id."
        supportRoute={props.supportRoute}
      />
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
        <SectionTitle>Artefacts</SectionTitle>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  const artefacts = await sql<ArtefactRow[]>`
    SELECT id, kind, type, filename, created_at, storage_key, source_run_id, metadata_json
    FROM artefacts
    WHERE folder_id = ${folderId}
    ORDER BY created_at DESC
  `;

  if (!artefacts.length) {
    return (
      <Card className="p-4">
        <SectionTitle>Artefacts</SectionTitle>
        <div className="mt-2 text-xs text-muted-foreground">No artefacts yet.</div>
      </Card>
    );
  }

  const availableKinds = uniqueFilterValues(artefacts.map((artefact) => artefact.kind));
  const availableTypes = uniqueFilterValues(artefacts.map((artefact) => artefact.type));
  const selectedFilters = parseArtefactFilters({
    searchParams: props.searchParams,
    availableKinds,
    availableTypes,
  });
  const filteredArtefacts = applyArtefactFilters(artefacts, selectedFilters);
  const passthroughEntries = buildPassthroughSearchEntries(props.searchParams);
  const clearHref = searchFromEntries(passthroughEntries) || "?";
  const hasActiveFilters =
    selectedFilters.kind !== null || selectedFilters.type !== null || selectedFilters.safety !== "all";

  return (
    <Card className="p-4">
      <div className="flex items-baseline justify-between gap-3">
        <SectionTitle>Artefacts</SectionTitle>
        <div className="text-xs text-muted-foreground">
          {filteredArtefacts.length}
          {hasActiveFilters ? ` of ${artefacts.length}` : ""}
          {" "}item(s)
        </div>
      </div>

      <form method="get" className="mt-3 flex flex-wrap items-end gap-3 rounded-ui-md border border-border bg-muted/20 p-3">
        {passthroughEntries.map(([key, value], idx) => (
          <input key={`${key}-${idx}`} type="hidden" name={key} value={value} />
        ))}

        <label className="grid min-w-40 gap-1 text-xs text-muted-foreground">
          Kind
          <Select
            name={ARTEFACT_KIND_PARAM}
            uiSize="sm"
            defaultValue={selectedFilters.kind ?? ""}
            aria-label="Filter artefacts by kind"
          >
            <option value="">All kinds</option>
            {availableKinds.map((kind) => (
              <option key={kind} value={kind}>
                {kind}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid min-w-32 gap-1 text-xs text-muted-foreground">
          Type
          <Select
            name={ARTEFACT_TYPE_PARAM}
            uiSize="sm"
            defaultValue={selectedFilters.type ?? ""}
            aria-label="Filter artefacts by type"
          >
            <option value="">All types</option>
            {availableTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </Select>
        </label>

        <label className="grid min-w-32 gap-1 text-xs text-muted-foreground">
          Safety
          <Select
            name={ARTEFACT_SAFETY_PARAM}
            uiSize="sm"
            defaultValue={selectedFilters.safety}
            aria-label="Filter artefacts by safety"
          >
            <option value="all">All outputs</option>
            <option value="safe">Safe only</option>
            <option value="unsafe">Unsafe only</option>
          </Select>
        </label>

        <button type="submit" className={buttonClassName({ variant: "secondary", size: "sm" })}>
          Apply
        </button>

        {hasActiveFilters ? (
          <a className={buttonClassName({ variant: "ghost", size: "sm" })} href={clearHref}>
            Clear
          </a>
        ) : null}
      </form>

      <TableFrame className="mt-3">
        <Table>
          <thead>
            <tr>
              <TH>Filename</TH>
              <TH>Kind</TH>
              <TH>Type</TH>
              <TH>Safety</TH>
              <TH>Source run</TH>
              <TH>Created</TH>
              <TH className="text-right">Action</TH>
            </tr>
          </thead>
          <tbody>
            {filteredArtefacts.length === 0 ? (
              <TR>
                <TD colSpan={7}>
                  <div className="py-2 text-xs text-muted-foreground">No artefacts matched the current filters.</div>
                </TD>
              </TR>
            ) : null}

            {filteredArtefacts.map((artefact) => {
              const unsafe = isUnsafeArtefact(artefact);
              let downloadHref: string;
              try {
                downloadHref = signedArtefactDownloadHref({
                  artefactId: artefact.id,
                  storageKey: artefact.storage_key,
                  issued: "rsc",
                });
              } catch {
                return (
                  <TR key={artefact.id}>
                    <TD colSpan={7}>
                      <ErrorBanner
                        title="Artefact download unavailable"
                        code="ARTEFACT_SIGN_FAILED"
                        message="Failed to sign artefact download."
                        supportRoute={props.supportRoute}
                      />
                    </TD>
                  </TR>
                );
              }
              return (
                <TR key={artefact.id}>
                  <TD>
                    <div className="flex flex-wrap items-center gap-2">
                      {unsafe ? (
                        <Badge variant="destructive" size="sm">
                          UNSAFE
                        </Badge>
                      ) : null}
                      <span className="font-mono">{artefact.filename}</span>
                    </div>
                  </TD>
                  <TD>
                    <Badge variant="muted" size="sm" className="font-mono">
                      {artefact.kind}
                    </Badge>
                  </TD>
                  <TD>
                    <Badge variant="muted" size="sm" className="font-mono">
                      {artefact.type}
                    </Badge>
                  </TD>
                  <TD>
                    {unsafe ? (
                      <Badge variant="destructive" size="sm">
                        unsafe
                      </Badge>
                    ) : (
                      <Badge variant="success" size="sm">
                        safe
                      </Badge>
                    )}
                  </TD>
                  <TD>
                    <span className="font-mono">{artefact.source_run_id ?? "—"}</span>
                  </TD>
                  <TD>
                    <span className="font-mono">
                      {artefact.created_at.toISOString().replace("T", " ").replace(".000Z", "Z")}
                    </span>
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
