export const MISSING_EVIDENCE_TEXT = "Not found in provided documents." as const;

export type ChatSource = {
  document_id: string;
  page_number: number;
  anchor_state: "ready" | "unavailable";
  anchor_reason?: string;
};

export type ChatStreamEvent =
  | { type: "meta"; trace_id: string }
  | { type: "token"; token: string }
  | { type: "sources"; sources: ChatSource[] }
  | { type: "done"; status: "complete" }
  | { type: "error"; status: "citation_failed"; code: string; message: string; trace_id: string; retryable: boolean };

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isChatSource(value: unknown): value is ChatSource {
  if (!isRecord(value)) return false;
  if (!isString(value.document_id) || typeof value.page_number !== "number" || !Number.isInteger(value.page_number)) return false;
  if (value.anchor_state !== "ready" && value.anchor_state !== "unavailable") return false;
  if (value.anchor_state === "unavailable") {
    return isString(value.anchor_reason) && value.anchor_reason.trim().length > 0;
  }
  return value.anchor_reason === undefined || isString(value.anchor_reason);
}

export function parseChatStreamEvent(line: string): ChatStreamEvent | null {
  let json: unknown;
  try {
    json = JSON.parse(line);
  } catch {
    return null;
  }

  if (!isRecord(json) || !isString(json.type)) return null;

  if (json.type === "meta") {
    if (!isString(json.trace_id)) return null;
    return { type: "meta", trace_id: json.trace_id };
  }

  if (json.type === "token") {
    if (!isString(json.token)) return null;
    return { type: "token", token: json.token };
  }

  if (json.type === "sources") {
    if (!Array.isArray(json.sources)) return null;
    const sources = json.sources.filter(isChatSource);
    // Fail closed: require all sources to pass validation.
    if (sources.length !== json.sources.length) return null;
    return { type: "sources", sources };
  }

  if (json.type === "done") {
    if (json.status !== "complete") return null;
    return { type: "done", status: "complete" };
  }

  if (json.type === "error") {
    if (json.status !== "citation_failed") return null;
    if (!isString(json.code) || !isString(json.message) || !isString(json.trace_id)) return null;
    if (typeof json.retryable !== "boolean") return null;
    return {
      type: "error",
      status: "citation_failed",
      code: json.code,
      message: json.message,
      trace_id: json.trace_id,
      retryable: json.retryable,
    };
  }

  return null;
}
