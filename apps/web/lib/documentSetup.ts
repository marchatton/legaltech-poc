export const DOCUMENT_UPLOAD_ACCEPTED_MIME = ["application/pdf"] as const;

export type DocumentUploadMime = (typeof DOCUMENT_UPLOAD_ACCEPTED_MIME)[number];

export const DOCUMENT_UPLOAD_MAX_BYTES = 50 * 1024 * 1024;

export type DocumentParseStatus = "queued" | "parsing" | "parsed" | "failed";
export type DocumentOcrStatus = "queued" | "running" | "done" | "failed";
export type DocumentReadinessStatus = "queued" | "ingesting" | "indexed-ready" | "failed";

export function deriveDocumentReadinessStatus(input: {
  uploadCompletedAt: Date | string | null;
  parseStatus: DocumentParseStatus;
  ocrStatus: DocumentOcrStatus;
}): DocumentReadinessStatus {
  if (input.parseStatus === "failed" || input.ocrStatus === "failed") return "failed";
  if (input.parseStatus === "parsed" && input.ocrStatus === "done") return "indexed-ready";
  if (!input.uploadCompletedAt) return "queued";
  return "ingesting";
}

export function buildDocumentUploadCapabilities(): {
  accepted_mime: DocumentUploadMime[];
  max_bytes: number;
} {
  return {
    accepted_mime: [...DOCUMENT_UPLOAD_ACCEPTED_MIME],
    max_bytes: DOCUMENT_UPLOAD_MAX_BYTES,
  };
}
