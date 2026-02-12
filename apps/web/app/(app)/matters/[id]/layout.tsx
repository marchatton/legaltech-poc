import type { ReactNode } from "react";

import { z } from "zod";

import Link from "next/link";

import { ensureSchema, sql } from "../../../../lib/db.server";
import { isDemoModeEnabled } from "../../../../lib/demoMode.server";

import { Badge } from "../../../ui/Badge";
import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "../../../ui/Breadcrumb";
import { MonoId } from "../../../ui/MonoId";
import { WorkspaceContextBar, WorkspaceContextBarBody } from "../../../ui/WorkspaceShell";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type FolderShellContextRow = {
  id: string;
  name: string;
};

type RunShellContextRow = {
  id: string;
};

async function loadFolderShellContext(folderId: string): Promise<FolderShellContextRow | null> {
  await ensureSchema();

  const folders = await sql<FolderShellContextRow[]>`
    SELECT id, name
    FROM folders
    WHERE id = ${folderId}
    LIMIT 1
  `;

  return folders[0] ?? null;
}

export default async function MatterDetailLayout(props: {
  children: ReactNode;
  params: Promise<Record<string, string | string[] | undefined>>;
}) {
  const rawParams = await props.params;
  const parsed = ParamsSchema.safeParse(rawParams);

  const folderId = parsed.success ? parsed.data.id : "unknown";
  const folder = parsed.success ? await loadFolderShellContext(parsed.data.id) : null;
  const folderName = folder?.name ?? "Unknown matter";
  const latestRuns =
    parsed.success && folder
      ? await sql<RunShellContextRow[]>`
          SELECT id
          FROM runs
          WHERE folder_id = ${folderId}
            AND type = 'quick_start_title_survey'
          ORDER BY created_at DESC
          LIMIT 1
        `
      : [];
  const latestRunId = latestRuns[0]?.id ?? null;
  const demoModeEnabled = isDemoModeEnabled();
  const environmentLabel = demoModeEnabled ? "demo-dev" : "production";
  const environmentBadgeVariant = demoModeEnabled ? "warning" : "muted";

  return (
    <>
      <WorkspaceContextBar>
        <WorkspaceContextBarBody>
          <Breadcrumb className="min-w-0 text-xs">
            <BreadcrumbItem>
              <Link href="/matters" className="font-medium text-muted-foreground hover:text-primary transition-colors duration-micro">
                Matters
              </Link>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem current className="truncate">
              {folderName}
            </BreadcrumbItem>
          </Breadcrumb>

          <div className="ml-auto flex items-center gap-2">
            {latestRunId ? (
              <Badge variant="info" size="sm" className="font-mono">
                {latestRunId}
              </Badge>
            ) : null}
            <Badge variant={environmentBadgeVariant} size="sm">
              {environmentLabel}
            </Badge>
            <MonoId>{folderId}</MonoId>
          </div>
        </WorkspaceContextBarBody>
      </WorkspaceContextBar>

      {props.children}
    </>
  );
}
