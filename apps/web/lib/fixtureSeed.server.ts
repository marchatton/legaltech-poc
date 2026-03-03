import "server-only";

import fs from "node:fs";
import path from "node:path";

import { z } from "zod";

import { fixtureDocumentId } from "@legaltech-poc/core/fixtures/fixtureIds";

const SeedStatusSchema = z.enum(["needs_review", "reviewed", "missing_input", "citation_failed"]);

export const SeedCitationSchema = z.object({
  // Back-compat: older snapshots may not include document_id yet.
  document_id: z.string().min(1).optional(),
  document_filename: z
    .string()
    .min(1)
    .regex(/^[A-Za-z0-9_-]+\.pdf$/i, "Invalid document filename"),
  page_number: z.number().int().positive(),
  polygons: z
    .array(
      z
        .array(z.tuple([z.number().min(0).max(1), z.number().min(0).max(1)]).readonly())
        .min(3),
    )
    .min(1),
  snippet: z.string(),
  snippet_hash: z.string().min(1),
  doc_version: z.string().trim().min(1).nullable().optional(),
  verified_at: z.string().trim().min(1).nullable().optional(),
  loaded_state: z.string().trim().min(1).nullable().optional(),
});

export type SeedCitation = z.infer<typeof SeedCitationSchema>;

export type ResolvedSeedCitation = Omit<SeedCitation, "document_id"> & { document_id: string };

export const SeedSnapshotSchema = z.object({
  meta: z
    .object({
      pack_id: z.string().min(1),
    })
    .passthrough(),
  rows: z.array(
    z
      .object({
        question_id: z.string().min(1),
        question: z.string().min(1),
        answer: z.string(),
        status: SeedStatusSchema,
        citation_ids: z.array(z.string().min(1)),
        notes: z.string().nullable().optional(),
      })
      .passthrough(),
  ),
  citations: z.record(z.string().min(1), SeedCitationSchema),
});

export type SeedSnapshot = z.infer<typeof SeedSnapshotSchema>;
export type ResolvedSeedSnapshot = Omit<SeedSnapshot, "citations"> & { citations: Record<string, ResolvedSeedCitation> };

function seedRoot(): string {
  // In Next dev, `process.cwd()` resolves to `apps/web`.
  return path.resolve(process.cwd(), "../../tmp/fixture-seed");
}

export function listSeededPackIds(): string[] {
  const root = seedRoot();
  if (!fs.existsSync(root)) return [];

  const entries = fs.readdirSync(root, { withFileTypes: true });
  return entries
    .filter((e) => e.isDirectory() && /^pack_\d{2}_[a-z0-9_]+$/i.test(e.name))
    .map((e) => e.name)
    .sort();
}

export function seedSnapshotPath(packId: string): string {
  return path.join(seedRoot(), packId, "snapshot.json");
}

export function loadSeedSnapshot(packId: string): ResolvedSeedSnapshot | null {
  const filePath = seedSnapshotPath(packId);
  if (!fs.existsSync(filePath)) return null;

  const raw = fs.readFileSync(filePath, "utf8");
  const parsed = SeedSnapshotSchema.safeParse(JSON.parse(raw));
  if (!parsed.success) {
    // Keep errors explicit in dev; this is a dev-only tracer bullet.
    throw new Error(`Invalid seed snapshot (${filePath}): ${parsed.error.message}`);
  }

  const citations: Record<string, ResolvedSeedCitation> = {};
  for (const [citationId, cit] of Object.entries(parsed.data.citations ?? {})) {
    citations[citationId] = {
      ...cit,
      document_id: cit.document_id ?? fixtureDocumentId({ packId, filename: cit.document_filename }),
    };
  }

  return { ...parsed.data, citations };
}

export function saveSeedSnapshot(packId: string, snapshot: SeedSnapshot): void {
  // Keep this dev-only tracer bullet strict: refuse to persist invalid snapshots.
  const parsed = SeedSnapshotSchema.safeParse(snapshot);
  if (!parsed.success) {
    throw new Error(`Refusing to save invalid seed snapshot (${packId}): ${parsed.error.message}`);
  }

  const filePath = seedSnapshotPath(packId);
  const dir = path.dirname(filePath);
  fs.mkdirSync(dir, { recursive: true });

  // Best-effort atomic write on POSIX: write temp file then rename.
  const tmpPath = path.join(dir, `.snapshot.tmp.${process.pid}.${Date.now()}`);
  fs.writeFileSync(tmpPath, JSON.stringify(parsed.data, null, 2) + "\n", "utf8");
  fs.renameSync(tmpPath, filePath);
}
