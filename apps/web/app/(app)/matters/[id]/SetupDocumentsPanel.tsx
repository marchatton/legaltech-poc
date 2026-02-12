"use client";

import { type ChangeEvent, useMemo, useRef, useState } from "react";

import { useRouter } from "next/navigation";

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

function parseServerErrorCode(json: unknown): { code: string; message: string } | null {
  if (!isRecord(json)) return null;
  const error = json.error;
  if (!isRecord(error)) return null;

  const message = typeof error.message === "string" && error.message.trim().length > 0 ? error.message.trim() : null;
  const code = typeof error.code === "string" && error.code.trim().length > 0 ? error.code.trim() : null;

  if (message) return { code: code ?? "SERVER_ERROR", message };
  if (code) return { code, message: `Request failed (${code}).` };
  return null;
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
  const fileRef = useRef<HTMLInputElement | null>(null);

  const indexedReadyCount = useMemo(
    () => documents.filter((doc) => doc.status === "indexed-ready").length,
    [documents],
  );

  async function refreshDocuments(): Promise<SetupDocumentRow[] | null> {
    const res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/documents`, {
      method: "GET",
      cache: "no-store",
    });
    const json = await parseJson<DocumentsReadinessResponse>(res);
    if (!res.ok || !json) return null;

    setDocuments(json.documents);
    setCapabilities(json.capabilities);
    return json.documents;
  }

  async function pollUntilTerminal(documentId: string): Promise<void> {
    for (let i = 0; i < 8; i += 1) {
      await sleep(1200);
      const next = await refreshDocuments();
      if (!next) return;

      const target = next.find((doc) => doc.id === documentId);
      if (!target) return;
      if (target.status === "indexed-ready" || target.status === "failed") return;
    }
  }

  async function startUpload(file: File): Promise<void> {
    if (isUploading) return;

    const fallbackMime = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";
    const mime = (file.type || fallbackMime).trim();
    if (!capabilities.accepted_mime.includes(mime)) {
      setError({ code: "UNSUPPORTED_MIME", message: `Unsupported file type. Accepted: ${capabilities.accepted_mime.join(", ")}.` });
      setNotice(null);
      return;
    }

    if (file.size > capabilities.max_bytes) {
      setError({ code: "FILE_TOO_LARGE", message: `File is too large. Maximum size is ${formatBytes(capabilities.max_bytes)}.` });
      setNotice(null);
      return;
    }

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
        const parsed = parseServerErrorCode(initJson);
        setError({
          code: parsed?.code ?? "UPLOAD_INIT_FAILED",
          message: parsed?.message ?? "Failed to initialize upload.",
          retryable: true,
        });
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
        const parsed = parseServerErrorCode(uploadJson);
        setError({
          code: parsed?.code ?? "UPLOAD_PUT_FAILED",
          message: parsed?.message ?? "Upload failed.",
          retryable: true,
        });
        setNotice(null);
        return;
      }

      const completeRes = await fetch(`/documents/${encodeURIComponent(initJson.document.id)}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ storage_key: initJson.upload.storage_key }),
      });
      const completeJson = await parseJson<UploadCompleteResponse>(completeRes);
      if (!completeRes.ok || !completeJson) {
        const parsed = parseServerErrorCode(completeJson);
        setError({
          code: parsed?.code ?? "UPLOAD_COMPLETE_FAILED",
          message: parsed?.message ?? "Failed to complete upload.",
          retryable: true,
        });
        setNotice(null);
        return;
      }

      setDocuments((prev) =>
        prev.map((row) =>
          row.id === completeJson.document.id
            ? {
                ...row,
                upload_completed_at: new Date().toISOString(),
                parse_status: completeJson.document.parse_status,
                ocr_status: completeJson.document.ocr_status,
                status: completeJson.document.status,
              }
            : row,
        ),
      );

      setNotice(`Upload complete. Indexing ${file.name}...`);
      await refreshDocuments();
      await pollUntilTerminal(initJson.document.id);
      await refreshDocuments();
      router.refresh();
      setNotice(`${file.name} uploaded.`);
    } catch {
      setError({ code: "UNEXPECTED_ERROR", message: "Upload failed due to an unexpected error.", retryable: true });
      setNotice(null);
    } finally {
      setIsUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function handleRetry() {
    setError(null);
  }

  async function refreshReadiness(): Promise<void> {
    const refreshed = await refreshDocuments();
    if (refreshed) router.refresh();
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
          <SectionTitle>Setup documents</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload source documents and continue once at least one is indexed-ready.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <input
            id={`upload-${props.folderId}`}
            ref={fileRef}
            type="file"
            accept={capabilities.accepted_mime.join(",")}
            className="sr-only"
            onChange={onFileSelected}
            disabled={isUploading}
          />
          <Button
            type="button"
            onClick={() => fileRef.current?.click()}
            loading={isUploading}
            loadingLabel="Uploading"
          >
            Upload documents
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refreshReadiness()}
            disabled={isUploading}
          >
            Refresh readiness
          </Button>
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
            retryLabel="Dismiss"
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
