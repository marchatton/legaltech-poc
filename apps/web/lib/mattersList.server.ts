import "server-only";

import { z } from "zod";

import { ensureSchema, sql } from "./db.server";
import type { FolderState } from "./folderState.server";

const FolderStateSchema = z.enum(["empty", "ingesting", "indexed", "ready", "failed"]);
const MatterSavedViewSchema = z.enum(["active", "needs_attention", "demo_packs"]);

const MatterListFiltersSchema = z.object({
  q: z.string().trim().max(200).optional(),
  state: FolderStateSchema.optional(),
  view: MatterSavedViewSchema.optional(),
});

const VIEW_STATE_FILTERS: Record<Exclude<MatterSavedView, "demo_packs">, FolderState[]> = {
  active: ["indexed", "ready"],
  needs_attention: ["empty", "ingesting", "failed"],
};

export type MatterSavedView = z.infer<typeof MatterSavedViewSchema>;

export type MatterListFilters = {
  q: string;
  state: FolderState | null;
  view: MatterSavedView | null;
};

export type MatterListItem = {
  id: string;
  name: string;
  state: FolderState;
  latest_index_version: string;
  created_at: string;
  updated_at: string;
};

function firstString(value: unknown): string | undefined {
  if (typeof value === "string") return value;
  if (Array.isArray(value) && typeof value[0] === "string") return value[0];
  return undefined;
}

function escapeLike(input: string): string {
  return input.replace(/([%_\\])/g, "\\$1");
}

export function parseMatterListFilters(raw: Record<string, unknown>): MatterListFilters {
  const q = firstString(raw.q);
  const state = firstString(raw.state);
  const view = firstString(raw.view);

  const candidate = {
    q,
    state: state && state.length > 0 ? state : undefined,
    view: view && view.length > 0 ? view : undefined,
  };

  const parsed = MatterListFiltersSchema.safeParse(candidate);
  if (!parsed.success) {
    return { q: "", state: null, view: null };
  }

  return {
    q: parsed.data.q ?? "",
    state: parsed.data.state ?? null,
    view: parsed.data.view ?? null,
  };
}

export function resolveEffectiveStateFilter(filters: MatterListFilters): FolderState[] | null {
  const viewStates =
    filters.view && filters.view !== "demo_packs" ? VIEW_STATE_FILTERS[filters.view] : null;

  if (!filters.state && !viewStates) return null;
  if (filters.state && !viewStates) return [filters.state];
  if (!filters.state && viewStates) return [...viewStates];

  if (!filters.state || !viewStates) return null;
  return viewStates.includes(filters.state) ? [filters.state] : [];
}

export async function listMatters(filters: MatterListFilters): Promise<MatterListItem[]> {
  await ensureSchema();

  const effectiveStates = resolveEffectiveStateFilter(filters);
  if (effectiveStates && effectiveStates.length === 0) {
    return [];
  }
  const stateArray = effectiveStates ?? [];

  const q = filters.q.trim();
  const searchPattern = q.length > 0 ? `%${escapeLike(q)}%` : null;
  const demoOnly = filters.view === "demo_packs";

  const rows = await sql<
    Array<{
      id: string;
      name: string;
      state: FolderState;
      latest_index_version: string;
      created_at: Date;
      updated_at: Date;
    }>
  >`
    SELECT id, name, state, latest_index_version, created_at, updated_at
    FROM folders
    WHERE (
      ${searchPattern === null}
      OR name ILIKE ${searchPattern} ESCAPE '\\'
      OR id ILIKE ${searchPattern} ESCAPE '\\'
    )
      AND (${effectiveStates === null} OR state = ANY(${sql.array(stateArray)}))
      AND (${!demoOnly} OR name ILIKE 'DEMO:%')
    ORDER BY created_at DESC, id DESC
  `;

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    state: row.state,
    latest_index_version: row.latest_index_version,
    created_at: row.created_at.toISOString(),
    updated_at: row.updated_at.toISOString(),
  }));
}
