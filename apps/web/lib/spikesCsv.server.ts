import "server-only";

import type { ResolvedSeedSnapshot } from "./fixtureSeed.server";

import { csvEscape } from "./csvEscape.server";

export function spikesSnapshotToCsv(snapshot: ResolvedSeedSnapshot | null): string {
  const header = ["question_id", "question", "answer", "status", "citation_ids"].join(",");
  const lines = (snapshot?.rows ?? []).map((r) =>
    [
      csvEscape(r.question_id),
      csvEscape(r.question),
      csvEscape(r.answer),
      csvEscape(r.status),
      csvEscape((r.citation_ids ?? []).join(" ")),
    ].join(","),
  );
  return [header, ...lines].join("\n") + "\n";
}

