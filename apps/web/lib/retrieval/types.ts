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
export async function hybridSearch(
  folderIdOrArgs: string | { folderId: string; indexVersion: string; queryText: string; opts?: HybridSearchOpts },
  indexVersion?: string,
  queryText?: string,
  opts?: HybridSearchOpts,
): Promise<HybridSearchHit[]> {
  // This contract module intentionally avoids DB/AI imports so chat can compile
  // independently. The runtime implementation lives in a server-only module.
  if (typeof window !== "undefined") {
    throw new Error("hybridSearch() is server-only.");
  }

  const args =
    typeof folderIdOrArgs === "string"
      ? { folderId: folderIdOrArgs, indexVersion: indexVersion ?? "", queryText: queryText ?? "", opts }
      : folderIdOrArgs;

  const mod = await import("./hybridSearch.server");
  return mod.hybridSearch(args);
}
