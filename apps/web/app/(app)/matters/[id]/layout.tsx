import type { ReactNode } from "react";

import { z } from "zod";

import Link from "next/link";

import { ensureSchema, sql } from "../../../../lib/db.server";

import { Breadcrumb, BreadcrumbItem, BreadcrumbSeparator } from "../../../ui/Breadcrumb";
import { MonoId } from "../../../ui/MonoId";

const ParamsSchema = z.object({
  id: z.string().min(1),
});

type FolderShellContextRow = {
  id: string;
  name: string;
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

  return (
    <>
      <section className="sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur animate-fade-in">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-6 py-2 sm:px-8">
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
            <span className="font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
              Matter ID
            </span>
            <MonoId>{folderId}</MonoId>
          </div>
        </div>
      </section>

      {props.children}
    </>
  );
}
