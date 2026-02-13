import type { ReactNode } from "react";

import { z } from "zod";

import Link from "next/link";

import { ensureSchema, sql } from "../../../../lib/db.server";

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
      <div className="flex items-center border-b border-border bg-card/95 px-6 py-2 backdrop-blur">
        <div className="flex min-w-0 items-center text-sm text-muted-foreground">
          <Link
            href="/matters"
            className="flex shrink-0 items-center gap-2 font-medium transition-colors duration-micro hover:text-foreground"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            Matters
          </Link>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="mx-2 size-4 shrink-0 text-border" aria-hidden="true">
            <polyline points="9 18 15 12 9 6" />
          </svg>
          <span className="truncate font-medium text-foreground">{folderName}</span>
        </div>
      </div>

      <main id="main-content" className="flex-1 overflow-auto">{props.children}</main>
    </>
  );
}
