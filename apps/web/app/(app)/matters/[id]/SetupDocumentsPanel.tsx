"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorLike } from "../../../../lib/safeErrorDisplay";

import { Badge, type BadgeVariant } from "../../../ui/Badge";
import { Button } from "../../../ui/Button";
import { EmptyState } from "../../../ui/EmptyState";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { SectionTitle } from "../../../ui/Page";

type UploadCapabilities = {
  accepted_mime: string[];
  max_bytes: number;
};

type DocumentStatus = "queued" | "ingesting" | "indexed-ready" | "failed";

export type SetupDocumentRow = {
  id: string;
  folder_id: string;
  filename: string;
  upload_completed_at: string | null;
  parse_status: string;
  ocr_status: string;
  status: DocumentStatus;
  extraction_quality: number | null;
  page_count: number | null;
  error_json: unknown | null;
  created_at: string;
  open_pdf_url: string | null;
};

type DocumentsReadinessResponse = {
  documents: SetupDocumentRow[];
  capabilities: UploadCapabilities;
};

type UploadInitResponse = {
  document: {
    id: string;
    folder_id: string;
    filename: string;
    upload_completed_at: string | null;
    parse_status: string;
    ocr_status: string;
    status: DocumentStatus;
  };
  upload: {
    storage_key: string;
    url: string;
    method: "PUT";
    headers: Record<string, string>;
  };
  capabilities?: UploadCapabilities;
};

type UploadCompleteResponse = {
  document: {
    id: string;
    parse_status: string;
    ocr_status: string;
    status: DocumentStatus;
  };
};

type StructuredError = {
  code: string;
  message: string;
  retryable?: boolean;
  retryLabel?: string;
  recoveryAction?: RecoveryAction;
};

type ParsedServerError = {
  code: string;
  message: string;
  retryable?: boolean;
};

type RecoveryAction = "retry-upload" | "retry-complete" | "retry-refresh" | "dismiss";

type RefreshDocumentsResult =
  | { ok: true; documents: SetupDocumentRow[] }
  | { ok: false; status: number | null; parsed: ParsedServerError | null };

type CompleteUploadResult =
  | { ok: true; payload: UploadCompleteResponse }
  | { ok: false; status: number; parsed: ParsedServerError | null };

type PollResult = "terminal" | "timeout" | "refresh-failed" | "document-missing";

type CompleteRetryRequest = {
  documentId: string;
  storageKey: string;
  filename: string;
};

function isRecord(input: unknown): input is Record<string, unknown> {
  return !!input && typeof input === "object" && !Array.isArray(input);
}

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 102.4) / 10} KB`;
  return `${Math.round(bytes / (1024 * 102.4)) / 10} MB`;
}

function statusLabel(status: DocumentStatus): string {
  if (status === "indexed-ready") return "Indexed Ready";
  if (status === "ingesting") return "Ingesting";
  if (status === "failed") return "Failed";
  return "Queued";
}

const docStatusVariant: Record<DocumentStatus, BadgeVariant> = {
  "indexed-ready": "success",
  ingesting: "primary",
  failed: "destructive",
  queued: "muted",
};

function parseServerError(json: unknown): ParsedServerError | null {
  const parsed = parseSafeErrorLike(json);
  if (!parsed) return null;
  return {
    code: parsed.code,
    message: parsed.message,
    retryable: parsed.retryable,
  };
}

function toRetryableSetupError(args: {
  parsed: ParsedServerError | null;
  fallbackCode: string;
  fallbackMessage: string;
  recoveryAction: RecoveryAction;
  retryLabel: string;
}): StructuredError {
  return {
    code: args.parsed?.code ?? args.fallbackCode,
    message: args.parsed?.message ?? args.fallbackMessage,
    retryable: args.parsed?.retryable ?? true,
    recoveryAction: args.recoveryAction,
    retryLabel: args.retryLabel,
  };
}

function parseDocErrorJson(json: unknown): { code: string; message: string } | null {
  if (!isRecord(json)) return null;
  const error = json.error;
  if (isRecord(error)) {
    const message = typeof error.message === "string" && error.message.trim() ? error.message.trim() : null;
    const code = typeof error.code === "string" && error.code.trim() ? error.code.trim() : null;
    if (message || code) return { code: code ?? "DOC_ERROR", message: message ?? `Document error (${code}).` };
  }
  const message = typeof json.message === "string" && json.message.trim() ? json.message.trim() : null;
  if (message) return { code: "DOC_ERROR", message };
  return null;
}

async function parseJson<T>(res: Response): Promise<T | null> {
  try {
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

async function sleep(ms: number): Promise<void> {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, ms);
  });
}

function DocumentIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
    </svg>
  );
}

export function SetupDocumentsPanel(props: {
  folderId: string;
  folderState: string;
  initialDocuments: SetupDocumentRow[];
  initialCapabilities: UploadCapabilities;
}) {
  const router = useRouter();
  const [documents, setDocuments] = useState<SetupDocumentRow[]>(props.initialDocuments);
  const [capabilities, setCapabilities] = useState<UploadCapabilities>(props.initialCapabilities);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<StructuredError | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [retryUploadFile, setRetryUploadFile] = useState<File | null>(null);
  const [completeRetryRequest, setCompleteRetryRequest] = useState<CompleteRetryRequest | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const busy = isUploading || isRefreshing;

  const indexedReadyCount = useMemo(
    () => documents.filter((doc) => doc.status === "indexed-ready").length,
    [documents],
  );

  async function refreshDocuments(): Promise<RefreshDocumentsResult> {
    try {
      const res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/documents`, {
        method: "GET",
        cache: "no-store",
      });
      const json = await parseJson<DocumentsReadinessResponse>(res);
      if (!res.ok || !json) {
        return {
          ok: false,
          status: res.status,
          parsed: parseServerError(json),
        };
      }

      setDocuments(json.documents);
      setCapabilities(json.capabilities);
      return { ok: true, documents: json.documents };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Network request failed while refreshing readiness.";
      return {
        ok: false,
        status: null,
        parsed: { code: "NETWORK_ERROR", message, retryable: true },
      };
    }
  }

  async function pollUntilTerminal(documentId: string): Promise<PollResult> {
    for (let i = 0; i < 8; i += 1) {
      await sleep(1200);
      const next = await refreshDocuments();
      if (!next.ok) return "refresh-failed";

      const target = next.documents.find((doc) => doc.id === documentId);
      if (!target) return "document-missing";
      if (target.status === "indexed-ready" || target.status === "failed") return "terminal";
    }
    return "timeout";
  }

  async function completeUpload(args: { documentId: string; storageKey: string }): Promise<CompleteUploadResult> {
    const completeRes = await fetch(`/documents/${encodeURIComponent(args.documentId)}/complete`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ storage_key: args.storageKey }),
    });
    const completeJson = await parseJson<UploadCompleteResponse>(completeRes);
    if (!completeRes.ok || !completeJson) {
      return {
        ok: false,
        status: completeRes.status,
        parsed: parseServerError(completeJson),
      };
    }

    return {
      ok: true,
      payload: completeJson,
    };
  }

  function applyCompletedUpload(document: UploadCompleteResponse["document"]): void {
    setDocuments((prev) =>
      prev.map((row) =>
        row.id === document.id
          ? {
              ...row,
              upload_completed_at: new Date().toISOString(),
              parse_status: document.parse_status,
              ocr_status: document.ocr_status,
              status: document.status,
            }
          : row,
      ),
    );
  }

  async function finalizeUploadSuccess(args: { documentId: string; filename: string }): Promise<void> {
    setNotice(`Upload complete. Indexing ${args.filename}...`);

    const firstRefresh = await refreshDocuments();
    if (!firstRefresh.ok) {
      setError(
        toRetryableSetupError({
          parsed: firstRefresh.parsed,
          fallbackCode: "READINESS_RECOMPUTE_FAILED",
          fallbackMessage: "Could not recompute readiness after upload. Retry refresh readiness.",
          recoveryAction: "retry-refresh",
          retryLabel: "Retry refresh",
        }),
      );
      setNotice(null);
      return;
    }

    const pollResult = await pollUntilTerminal(args.documentId);
    if (pollResult === "refresh-failed" || pollResult === "document-missing") {
      setError({
        code: "READINESS_RECOMPUTE_FAILED",
        message: "Could not recompute readiness after upload. Retry refresh readiness.",
        retryable: true,
        recoveryAction: "retry-refresh",
        retryLabel: "Retry refresh",
      });
      setNotice(null);
      return;
    }

    if (pollResult === "timeout") {
      router.refresh();
      setNotice(`${args.filename} uploaded. Indexing is still in progress. Refresh readiness to check status.`);
      return;
    }

    const finalRefresh = await refreshDocuments();
    if (!finalRefresh.ok) {
      setError(
        toRetryableSetupError({
          parsed: finalRefresh.parsed,
          fallbackCode: "READINESS_RECOMPUTE_FAILED",
          fallbackMessage: "Could not recompute readiness after upload. Retry refresh readiness.",
          recoveryAction: "retry-refresh",
          retryLabel: "Retry refresh",
        }),
      );
      setNotice(null);
      return;
    }

    router.refresh();
    setNotice(`${args.filename} uploaded.`);
  }

  async function retryCompleteUpload(request: CompleteRetryRequest): Promise<void> {
    if (busy) return;

    setIsUploading(true);
    setError(null);
    setNotice(`Retrying completion for ${request.filename}...`);

    try {
      const completeResult = await completeUpload({
        documentId: request.documentId,
        storageKey: request.storageKey,
      });
      if (!completeResult.ok) {
        setError(
          toRetryableSetupError({
            parsed: completeResult.parsed,
            fallbackCode: "UPLOAD_COMPLETE_FAILED",
            fallbackMessage: "Upload finished but completion failed. Retry completion to start indexing.",
            recoveryAction: "retry-complete",
            retryLabel: "Retry completion",
          }),
        );
        setNotice(null);
        return;
      }

      setCompleteRetryRequest(null);
      applyCompletedUpload(completeResult.payload.document);
      await finalizeUploadSuccess({
        documentId: request.documentId,
        filename: request.filename,
      });
    } catch {
      setError({
        code: "UPLOAD_COMPLETE_FAILED",
        message: "Upload completion retry failed. Retry completion to start indexing.",
        retryable: true,
        recoveryAction: "retry-complete",
        retryLabel: "Retry completion",
      });
      setNotice(null);
    } finally {
      setIsUploading(false);
    }
  }

  async function startUpload(file: File): Promise<void> {
    if (busy) return;

    const fallbackMime = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";
    const mime = (file.type || fallbackMime).trim();
    if (!capabilities.accepted_mime.includes(mime)) {
      setError({
        code: "UNSUPPORTED_MIME",
        message: `Unsupported file type. Accepted: ${capabilities.accepted_mime.join(", ")}.`,
        recoveryAction: "dismiss",
      });
      setNotice(null);
      return;
    }

    if (file.size > capabilities.max_bytes) {
      setError({
        code: "FILE_TOO_LARGE",
        message: `File is too large. Maximum size is ${formatBytes(capabilities.max_bytes)}.`,
        recoveryAction: "dismiss",
      });
      setNotice(null);
      return;
    }

    setRetryUploadFile(file);
    setCompleteRetryRequest(null);
    setIsUploading(true);
    setError(null);
    setNotice(`Uploading ${file.name}...`);

    try {
      const initRes = await fetch(`/folders/${encodeURIComponent(props.folderId)}/documents`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          mime,
          bytes: file.size,
        }),
      });
      const initJson = await parseJson<UploadInitResponse>(initRes);
      if (!initRes.ok || !initJson) {
        const parsed = parseServerError(initJson);
        setError(
          toRetryableSetupError({
            parsed,
            fallbackCode: "UPLOAD_INIT_FAILED",
            fallbackMessage: "Could not initialize upload. Retry upload.",
            recoveryAction: "retry-upload",
            retryLabel: "Retry upload",
          }),
        );
        setNotice(null);
        return;
      }

      if (initJson.capabilities) {
        setCapabilities(initJson.capabilities);
      }

      setDocuments((prev) => {
        const withoutNew = prev.filter((row) => row.id !== initJson.document.id);
        return [
          {
            id: initJson.document.id,
            folder_id: initJson.document.folder_id,
            filename: initJson.document.filename,
            upload_completed_at: initJson.document.upload_completed_at,
            parse_status: initJson.document.parse_status,
            ocr_status: initJson.document.ocr_status,
            status: initJson.document.status,
            extraction_quality: null,
            page_count: null,
            error_json: null,
            created_at: new Date().toISOString(),
            open_pdf_url: null,
          },
          ...withoutNew,
        ];
      });

      const uploadRes = await fetch(initJson.upload.url, {
        method: initJson.upload.method,
        headers: initJson.upload.headers,
        body: await file.arrayBuffer(),
      });
      if (!uploadRes.ok) {
        const uploadJson = await parseJson<unknown>(uploadRes);
        const parsed = parseServerError(uploadJson);
        setError(
          toRetryableSetupError({
            parsed,
            fallbackCode: "UPLOAD_PUT_FAILED",
            fallbackMessage: "Could not transfer upload bytes. Retry upload.",
            recoveryAction: "retry-upload",
            retryLabel: "Retry upload",
          }),
        );
        setNotice(null);
        return;
      }

      const completeResult = await completeUpload({
        documentId: initJson.document.id,
        storageKey: initJson.upload.storage_key,
      });
      if (!completeResult.ok) {
        setCompleteRetryRequest({
          documentId: initJson.document.id,
          storageKey: initJson.upload.storage_key,
          filename: file.name,
        });
        setError(
          toRetryableSetupError({
            parsed: completeResult.parsed,
            fallbackCode: "UPLOAD_COMPLETE_FAILED",
            fallbackMessage: "Upload finished but completion failed. Retry completion to start indexing.",
            recoveryAction: "retry-complete",
            retryLabel: "Retry completion",
          }),
        );
        setNotice(null);
        return;
      }

      setCompleteRetryRequest(null);
      applyCompletedUpload(completeResult.payload.document);
      await finalizeUploadSuccess({
        documentId: initJson.document.id,
        filename: file.name,
      });
    } catch {
      setError({
        code: "UNEXPECTED_ERROR",
        message: "Upload failed due to an unexpected error. Retry upload.",
        retryable: true,
        recoveryAction: "retry-upload",
        retryLabel: "Retry upload",
      });
      setNotice(null);
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleRetry() {
    if (!error?.retryable) return;

    if (error.recoveryAction === "retry-upload") {
      if (!retryUploadFile) {
        setError({
          code: "RETRY_CONTEXT_MISSING",
          message: "Retry file is unavailable. Choose the file again and upload.",
          recoveryAction: "dismiss",
        });
        return;
      }
      void startUpload(retryUploadFile);
      return;
    }

    if (error.recoveryAction === "retry-complete") {
      if (!completeRetryRequest) {
        setError({
          code: "RETRY_CONTEXT_MISSING",
          message: "Retry context is unavailable. Select the file again and upload.",
          recoveryAction: "dismiss",
        });
        return;
      }
      void retryCompleteUpload(completeRetryRequest);
      return;
    }

    if (error.recoveryAction === "retry-refresh") {
      void refreshReadiness();
      return;
    }

    setError(null);
  }

  async function refreshReadiness(): Promise<void> {
    if (busy) return;
    setIsRefreshing(true);
    setError(null);
    setNotice("Refreshing readiness...");

    const refreshed = await refreshDocuments();
    if (!refreshed.ok) {
      setError(
        toRetryableSetupError({
          parsed: refreshed.parsed,
          fallbackCode: "READINESS_RECOMPUTE_FAILED",
          fallbackMessage: "Could not recompute readiness. Retry refresh readiness.",
          recoveryAction: "retry-refresh",
          retryLabel: "Retry refresh",
        }),
      );
      setNotice(null);
      setIsRefreshing(false);
      return;
    }

    router.refresh();
    setNotice("Readiness refreshed.");
    setIsRefreshing(false);
  }

  function onFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0] ?? null;
    if (!file) return;
    void startUpload(file);
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionTitle>Documents</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload source PDFs, then run Quick Start once at least one is indexed-ready.
          </p>
        </div>

        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-2">
            <input
              id={`upload-${props.folderId}`}
              ref={fileRef}
              type="file"
              accept={capabilities.accepted_mime.join(",")}
              className="sr-only"
              onChange={onFileSelected}
              disabled={busy}
            />
            <Button
              type="button"
              size="sm"
              onClick={() => fileRef.current?.click()}
              loading={isUploading}
              loadingLabel="Uploading"
              disabled={isRefreshing}
            >
              Upload documents
            </Button>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={() => void refreshReadiness()}
              disabled={isUploading}
              loading={isRefreshing}
              loadingLabel="Refreshing"
            >
              Check status
            </Button>
          </div>
          <span className="text-2xs text-muted-foreground">
            PDF only · max {formatBytes(capabilities.max_bytes)}
          </span>
        </div>
      </div>

      {notice ? <div className="mt-3 text-xs text-muted-foreground">{notice}</div> : null}
      {error ? (
        <div className="mt-3">
          <ErrorBanner
            code={error.code}
            message={error.message}
            retryable={error.retryable}
            onRetry={error.retryable ? handleRetry : undefined}
            retryLabel={error.retryLabel ?? "Retry"}
            supportRoute={`/matters/${props.folderId}?tab=documents`}
          />
        </div>
      ) : null}

      <div className="mt-3 text-xs text-muted-foreground">
        {indexedReadyCount > 0 ? (
          <span>
            {indexedReadyCount} document{indexedReadyCount === 1 ? "" : "s"} indexed-ready.
          </span>
        ) : (
          <span>
            Matter state is <span className="font-mono">{props.folderState}</span>. Upload at least one PDF before
            starting Quick Start.
          </span>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="mt-4">
          <EmptyState
            icon={<DocumentIcon />}
            title="No documents yet"
            description="Upload a PDF to start indexing this matter."
          />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {documents.map((doc, i) => {
            const delay = Math.min(i * 30, 300);
            const docError = parseDocErrorJson(doc.error_json);
            return (
              <article
                key={doc.id}
                className="animate-fade-in rounded-ui-md border border-border bg-card p-3"
                style={{ animationDelay: `${delay}ms` }}
              >
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <div className="max-w-[28rem] truncate text-sm font-medium text-foreground" title={`ID: ${doc.id}`}>
                        {doc.filename}
                      </div>
                      <Badge variant={docStatusVariant[doc.status]}>{statusLabel(doc.status)}</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <span className="font-mono">{doc.parse_status}/{doc.ocr_status}</span>
                      {typeof doc.page_count === "number" ? <span>pages: {doc.page_count}</span> : null}
                      {typeof doc.extraction_quality === "number" ? (
                        <span>quality: {Math.round(doc.extraction_quality * 100)}%</span>
                      ) : null}
                    </div>
                  </div>

                  {doc.open_pdf_url ? (
                    <a
                      className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                      href={doc.open_pdf_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open document
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">Processing</span>
                  )}
                </div>

                {docError ? (
                  <div className="mt-2">
                    <ErrorBanner code={docError.code} message={docError.message} />
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
