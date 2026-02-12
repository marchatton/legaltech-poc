import { randomUUID } from "node:crypto";

import { describe, expect, it } from "vitest";

import { ensureSchema, sql } from "../lib/db.server";
import type { FolderState } from "../lib/folderState.server";
import { listMatters, parseMatterListFilters } from "../lib/mattersList.server";

type SeededMatter = {
  id: string;
  name: string;
  state: FolderState;
  createdAt: string;
};

async function seedMatters(seedTag: string): Promise<SeededMatter[]> {
  await ensureSchema();

  const matters: SeededMatter[] = [
    {
      id: `fld_${seedTag}_alpha`,
      name: `${seedTag}-focus alpha`,
      state: "indexed",
      createdAt: "2026-02-02T10:00:00.000Z",
    },
    {
      id: `fld_${seedTag}_beta`,
      name: `${seedTag}-focus beta`,
      state: "ready",
      createdAt: "2026-02-02T10:00:00.000Z",
    },
    {
      id: `fld_${seedTag}_attention`,
      name: `${seedTag}-needs-attention`,
      state: "failed",
      createdAt: "2026-02-01T10:00:00.000Z",
    },
    {
      id: `fld_${seedTag}_demo`,
      name: `DEMO: ${seedTag}-pack`,
      state: "ready",
      createdAt: "2026-02-03T10:00:00.000Z",
    },
  ];

  await sql`
    INSERT INTO folders (id, name, state, latest_index_version, created_at, updated_at)
    VALUES
      (${matters[0].id}, ${matters[0].name}, ${matters[0].state}, 'v1', ${matters[0].createdAt}, ${matters[0].createdAt}),
      (${matters[1].id}, ${matters[1].name}, ${matters[1].state}, 'v1', ${matters[1].createdAt}, ${matters[1].createdAt}),
      (${matters[2].id}, ${matters[2].name}, ${matters[2].state}, 'v1', ${matters[2].createdAt}, ${matters[2].createdAt}),
      (${matters[3].id}, ${matters[3].name}, ${matters[3].state}, 'v1', ${matters[3].createdAt}, ${matters[3].createdAt})
  `;

  return matters;
}

async function cleanupSeededMatters(seedTag: string): Promise<void> {
  const ids = [
    `fld_${seedTag}_alpha`,
    `fld_${seedTag}_beta`,
    `fld_${seedTag}_attention`,
    `fld_${seedTag}_demo`,
  ];
  await sql`DELETE FROM folders WHERE id = ANY(${sql.array(ids)})`;
}

describe("US-002 matter discovery filtering determinism", () => {
  it("applies filters in sequence with stable subsets across refresh", async () => {
    const seedTag = `us002_${randomUUID().replaceAll("-", "").slice(0, 10)}`;
    const seeded = await seedMatters(seedTag);
    const seededById = new Set(seeded.map((matter) => matter.id));

    try {
      const broad = await listMatters(parseMatterListFilters({ q: seedTag }));
      const active = await listMatters(parseMatterListFilters({ q: seedTag, view: "active" }));
      const focusedFilters = parseMatterListFilters({ q: `${seedTag}-focus`, view: "active" });
      const focusedFirst = await listMatters(focusedFilters);
      const focusedSecond = await listMatters(focusedFilters);

      expect(broad.map((matter) => matter.id)).toEqual([
        `fld_${seedTag}_demo`,
        `fld_${seedTag}_beta`,
        `fld_${seedTag}_alpha`,
        `fld_${seedTag}_attention`,
      ]);
      expect(broad.every((matter) => seededById.has(matter.id))).toBe(true);

      expect(active.map((matter) => matter.id)).toEqual([
        `fld_${seedTag}_demo`,
        `fld_${seedTag}_beta`,
        `fld_${seedTag}_alpha`,
      ]);
      expect(focusedFirst.map((matter) => matter.id)).toEqual([`fld_${seedTag}_beta`, `fld_${seedTag}_alpha`]);
      expect(focusedSecond).toEqual(focusedFirst);
    } finally {
      await cleanupSeededMatters(seedTag);
    }
  });

  it("keeps saved-view + query deterministic, including reversible empty conflicts", async () => {
    const seedTag = `us002_${randomUUID().replaceAll("-", "").slice(0, 10)}`;
    await seedMatters(seedTag);

    try {
      const demoView = await listMatters(parseMatterListFilters({ q: seedTag, view: "demo_packs" }));
      const needsAttention = await listMatters(parseMatterListFilters({ q: seedTag, view: "needs_attention" }));
      const conflict = await listMatters(
        parseMatterListFilters({
          q: seedTag,
          view: "needs_attention",
          state: "ready",
        }),
      );

      expect(demoView.map((matter) => matter.id)).toEqual([`fld_${seedTag}_demo`]);
      expect(needsAttention.map((matter) => matter.id)).toEqual([`fld_${seedTag}_attention`]);
      expect(conflict).toEqual([]);
    } finally {
      await cleanupSeededMatters(seedTag);
    }
  });
});
