import "server-only";

import type { FolderState } from "./folderState.server";
import { parseDemoMatterMetadata } from "./demoMatterMetadata";

export type CanonicalReadinessState = "runnable" | "blocked";

export type CanonicalReadinessReasonCode =
  | "RUNNABLE"
  | "MISSING_PREREQUISITE_DOCUMENT"
  | "NO_INDEXED_DOCUMENTS"
  | "INGEST_IN_PROGRESS"
  | "INGEST_FAILED"
  | "FOLDER_STATE_BLOCKED";

export type CanonicalReadiness = {
  state: CanonicalReadinessState;
  reason_code: CanonicalReadinessReasonCode;
  reason: string;
  missing_documents: string[];
};

const DEMO_PACK_REQUIRED_DOCUMENTS: Record<string, string[]> = {
  pack_02_missing_rea: ["REA.pdf"],
};

function normalizeFilename(filename: string): string {
  return filename.trim().toLowerCase();
}

function findMissingPrerequisiteDocuments(args: {
  folderName: string;
  documentFilenames: string[];
}): string[] {
  const metadata = parseDemoMatterMetadata(args.folderName);
  if (!metadata) return [];

  const required = DEMO_PACK_REQUIRED_DOCUMENTS[metadata.packId] ?? [];
  if (required.length === 0) return [];

  const actual = new Set(args.documentFilenames.map((filename) => normalizeFilename(filename)));
  return required.filter((filename) => !actual.has(normalizeFilename(filename)));
}

function runnableReason(indexedReadyCount: number | null): string {
  if (typeof indexedReadyCount === "number" && indexedReadyCount > 0) {
    return `${indexedReadyCount} document${indexedReadyCount === 1 ? "" : "s"} ready. Run Quick Start now.`;
  }
  return "Ready to run Quick Start.";
}

export function resolveCanonicalReadiness(args: {
  folderState: string;
  folderName: string;
  documentFilenames: string[];
  indexedReadyCount?: number | null;
}): CanonicalReadiness {
  const missingDocuments = findMissingPrerequisiteDocuments({
    folderName: args.folderName,
    documentFilenames: args.documentFilenames,
  });

  if (missingDocuments.length > 0) {
    return {
      state: "blocked",
      reason_code: "MISSING_PREREQUISITE_DOCUMENT",
      reason: `Blocked: required document missing (${missingDocuments.join(", ")}). Upload the missing document and refresh readiness.`,
      missing_documents: missingDocuments,
    };
  }

  if (args.folderState === "indexed" || args.folderState === "ready") {
    return {
      state: "runnable",
      reason_code: "RUNNABLE",
      reason: runnableReason(args.indexedReadyCount ?? null),
      missing_documents: [],
    };
  }

  if (args.folderState === "failed") {
    return {
      state: "blocked",
      reason_code: "INGEST_FAILED",
      reason: "Folder ingest failed. Retry ingest or re-index.",
      missing_documents: [],
    };
  }

  if (args.folderState === "empty") {
    return {
      state: "blocked",
      reason_code: "NO_INDEXED_DOCUMENTS",
      reason: "No indexed documents yet. Upload a source PDF and refresh readiness.",
      missing_documents: [],
    };
  }

  if (args.folderState === "ingesting") {
    return {
      state: "blocked",
      reason_code: "INGEST_IN_PROGRESS",
      reason: "Folder is ingesting. Wait for indexing to complete, then refresh readiness.",
      missing_documents: [],
    };
  }

  return {
    state: "blocked",
    reason_code: "FOLDER_STATE_BLOCKED",
    reason: `Folder is not runnable yet (state: ${args.folderState}).`,
    missing_documents: [],
  };
}

export function isRunnableFolderState(state: string): state is Extract<FolderState, "indexed" | "ready"> {
  return state === "indexed" || state === "ready";
}
