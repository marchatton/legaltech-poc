export const QUICK_START_NO_EVIDENCE_REASON_CODES = [
  "NO_EVIDENCE_NO_READY_DOCUMENTS",
  "NO_EVIDENCE_RETRIEVAL_EMPTY",
  "NO_EVIDENCE_ANCHOR_UNRESOLVED",
  "NO_EVIDENCE_DRAFT_UNSUPPORTED",
] as const;

export type QuickStartNoEvidenceReasonCode = (typeof QUICK_START_NO_EVIDENCE_REASON_CODES)[number];

export const QUICK_START_FAILURE_REASON_CODES = [
  "VALIDATION_ERROR",
  "RETRIEVAL_FAILED",
  "DRAFT_FAILED",
  "ROW_WRITE_FAILED",
  "PROGRESS_UPDATE_FAILED",
] as const;

export type QuickStartFailureReasonCode = (typeof QUICK_START_FAILURE_REASON_CODES)[number];

export type QuickStartReasonCode = QuickStartNoEvidenceReasonCode | QuickStartFailureReasonCode;

export const QUICK_START_REASON_CODE_PATTERN = /^[A-Z0-9_]{3,64}$/;

const NO_EVIDENCE_SET = new Set<string>(QUICK_START_NO_EVIDENCE_REASON_CODES);
const FAILURE_SET = new Set<string>(QUICK_START_FAILURE_REASON_CODES);

export function isQuickStartNoEvidenceReasonCode(value: string): value is QuickStartNoEvidenceReasonCode {
  return NO_EVIDENCE_SET.has(value);
}

export function isQuickStartFailureReasonCode(value: string): value is QuickStartFailureReasonCode {
  return FAILURE_SET.has(value);
}

export function normalizeQuickStartReasonCode(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const normalized = value.trim().toUpperCase();
  if (!normalized) return null;
  return QUICK_START_REASON_CODE_PATTERN.test(normalized) ? normalized : null;
}
