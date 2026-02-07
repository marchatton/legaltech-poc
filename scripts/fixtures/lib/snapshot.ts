import type { NormPolygons } from "./geometry.ts";

export type SnapshotMeta = {
  pack_id: string;
  run_id?: string;
  index_version?: string;
  agent_bundle_version?: string;
  question_set_version?: string;
  generated_at?: string;
};

export type SnapshotRow = {
  id?: string;
  question_id: string;
  question?: string;
  answer: string;
  status: "needs_review" | "reviewed" | "missing_input" | "citation_failed";
  citation_ids: string[];
  notes?: string | null;
  payload_schema_version?: string | null;
  payload_json?: unknown;
  provenance_json?: unknown;
};

export type SnapshotCitation = {
  document_filename: string;
  page_number: number;
  polygons: NormPolygons;
  snippet: string;
  snippet_hash: string;
};

export type SpikeSnapshot = {
  meta: SnapshotMeta;
  rows: SnapshotRow[];
  citations: Record<string, SnapshotCitation>;
};

export function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function assertIsSnapshot(val: unknown): SpikeSnapshot {
  if (!isRecord(val)) throw new Error("Snapshot must be an object");
  const meta = val.meta;
  if (!isRecord(meta)) throw new Error("Snapshot.meta must be an object");
  if (typeof meta.pack_id !== "string" || !meta.pack_id) throw new Error("Snapshot.meta.pack_id must be a string");

  const rows = val.rows;
  if (!Array.isArray(rows)) throw new Error("Snapshot.rows must be an array");

  const citations = val.citations;
  if (!isRecord(citations)) throw new Error("Snapshot.citations must be an object map");

  // We do light validation here; deeper validation happens in invariant/comparator scripts.
  return val as SpikeSnapshot;
}
