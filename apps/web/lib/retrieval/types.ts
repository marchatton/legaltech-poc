// PR0 retrieval contract: IDs-only posture.
// This file must stay free of DB/AI imports so chat can compile independently.

export type HybridSearchHit = {
  chunk_id: string;
  document_id: string;
  page_start: number | null;
  page_end: number | null;
  score: number;
  lex_score?: number;
  sem_score?: number;
};

export type HybridSearchOpts = {
  kLex?: number;
  kSem?: number;
  kFinal?: number;
  lexWeight?: number;
  semWeight?: number;
  probes?: number;
};

export async function hybridSearch(
  folderId: string,
  indexVersion: string,
  queryText: string,
  opts?: HybridSearchOpts,
): Promise<HybridSearchHit[]>;
export async function hybridSearch(args: {
  folderId: string;
  indexVersion: string;
  queryText: string;
  opts?: HybridSearchOpts;
}): Promise<HybridSearchHit[]>;
export async function hybridSearch(): Promise<HybridSearchHit[]> {
  throw new Error("hybridSearch() is not implemented (PR0 placeholder).");
}

