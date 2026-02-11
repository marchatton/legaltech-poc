"use client";

import { FormEvent, useMemo, useRef, useState } from "react";

import { Button } from "../../../ui/Button";
import { EmptyState } from "../../../ui/EmptyState";
import { MonoId } from "../../../ui/MonoId";
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

function statusClassName(status: DocumentStatus): string {
  if (status === "indexed-ready") {
    return "rounded-full bg-success/15 px-2 py-0.5 text-xs font-medium text-success ring-1 ring-inset ring-success/30";
  }
  if (status === "failed") {
    return "rounded-full bg-destructive/15 px-2 py-0.5 text-xs font-medium text-destructive ring-1 ring-inset ring-destructive/30";
  }
  if (status === "ingesting") {
    return "rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary ring-1 ring-inset ring-primary/30";
  }
  return "rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60";
}

function parseErrorMessage(json: unknown, fallback: string): string {
  if (!isRecord(json)) return fallback;
  const error = json.error;
  if (!isRecord(error)) return fallback;

  const message = error.message;
  if (typeof message === "string" && message.trim().length > 0) return message.trim();

  const code = error.code;
  if (typeof code === "string" && code.trim().length > 0) return `Request failed (${code.trim()}).`;

  return fallback;
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

export function SetupDocumentsPanel(props: {
  folderId: string;
  folderState: string;
  initialDocuments: SetupDocumentRow[];
  initialCapabilities: UploadCapabilities;
}) {
  const [documents, setDocuments] = useState<SetupDocumentRow[]>(props.initialDocuments);
  const [capabilities, setCapabilities] = useState<UploadCapabilities>(props.initialCapabilities);
  const [notice, setNotice] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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

  async function handleUpload(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (isUploading) return;

    const file = fileRef.current?.files?.[0] ?? null;
    if (!file) {
      setError("Choose a PDF to upload.");
      setNotice(null);
      return;
    }

    const fallbackMime = file.name.toLowerCase().endsWith(".pdf") ? "application/pdf" : "";
    const mime = (file.type || fallbackMime).trim();
    if (!capabilities.accepted_mime.includes(mime)) {
      setError(`Unsupported file type. Accepted: ${capabilities.accepted_mime.join(", ")}.`);
      setNotice(null);
      return;
    }

    if (file.size > capabilities.max_bytes) {
      setError(`File is too large. Maximum size is ${formatBytes(capabilities.max_bytes)}.`);
      setNotice(null);
      return;
    }

    setIsUploading(true);
    setError(null);
    setNotice("Starting upload...");

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
        setError(parseErrorMessage(initJson, "Failed to initialize upload."));
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
        setError(parseErrorMessage(uploadJson, "Upload failed."));
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
        setError(parseErrorMessage(completeJson, "Failed to complete upload."));
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

      setNotice("Upload complete. Indexing in progress; readiness will update automatically.");
      await refreshDocuments();
      await pollUntilTerminal(initJson.document.id);
      if (fileRef.current) fileRef.current.value = "";
    } catch {
      setError("Upload failed due to an unexpected error.");
      setNotice(null);
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <section>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <SectionTitle>Setup documents</SectionTitle>
          <p className="mt-1 text-xs text-muted-foreground">
            Upload source documents and watch readiness move from queued through indexing.
          </p>
        </div>
        <div className="rounded-ui-md bg-muted px-3 py-2 text-right text-xs text-muted-foreground ring-1 ring-inset ring-border/60">
          <div>
            accepted MIME: <span className="font-mono">{capabilities.accepted_mime.join(", ")}</span>
          </div>
          <div>
            max size: <span className="font-mono">{formatBytes(capabilities.max_bytes)}</span>
          </div>
        </div>
      </div>

      <form onSubmit={handleUpload} className="mt-4 grid gap-2 rounded-ui-md border border-border bg-muted p-3">
        <label className="text-xs font-medium text-foreground" htmlFor={`upload-${props.folderId}`}>
          Upload PDF
        </label>
        <input
          id={`upload-${props.folderId}`}
          ref={fileRef}
          type="file"
          accept={capabilities.accepted_mime.join(",")}
          className="block w-full cursor-pointer rounded-ui-md border border-input bg-background px-3 py-2 text-sm text-foreground file:mr-3 file:rounded-ui-md file:border-0 file:bg-muted file:px-2.5 file:py-1.5 file:text-xs file:font-medium"
          disabled={isUploading}
        />
        <div className="flex flex-wrap items-center gap-2">
          <Button type="submit" loading={isUploading} loadingLabel="Uploading">
            Upload and index
          </Button>
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => void refreshDocuments()}
            disabled={isUploading}
          >
            Refresh readiness
          </Button>
          {notice ? <span className="text-xs text-muted-foreground">{notice}</span> : null}
        </div>
        {error ? <p className="text-xs text-destructive" role="alert">{error}</p> : null}
      </form>

      <div className="mt-3 text-xs text-muted-foreground">
        {indexedReadyCount > 0 ? (
          <span>
            {indexedReadyCount} document{indexedReadyCount === 1 ? "" : "s"} indexed-ready. Continue to review or run
            Quick Start below.
          </span>
        ) : (
          <span>
            Matter state is <span className="font-mono">{props.folderState}</span>. Upload and index at least one
            document before starting Quick Start.
          </span>
        )}
      </div>

      {documents.length === 0 ? (
        <div className="mt-4">
          <EmptyState title="No documents yet" description="Upload a PDF to start indexing this matter." />
        </div>
      ) : (
        <div className="mt-4 grid gap-2">
          {documents.map((doc) => (
            <article key={doc.id} className="rounded-ui-md border border-border bg-card p-3">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <MonoId variant="inverted">{doc.id}</MonoId>
                  <div className="text-sm font-medium text-foreground">{doc.filename}</div>
                  <span className={statusClassName(doc.status)}>{statusLabel(doc.status)}</span>
                  <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground ring-1 ring-inset ring-border/60">
                    {doc.parse_status}/{doc.ocr_status}
                  </span>
                  {typeof doc.page_count === "number" ? (
                    <span className="text-xs text-muted-foreground">pages: {doc.page_count}</span>
                  ) : null}
                  {typeof doc.extraction_quality === "number" ? (
                    <span className="text-xs text-muted-foreground">
                      quality: {Math.round(doc.extraction_quality * 100)}%
                    </span>
                  ) : null}
                </div>

                {doc.open_pdf_url ? (
                  <a
                    className="text-xs font-medium text-muted-foreground underline hover:text-foreground"
                    href={doc.open_pdf_url}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open PDF
                  </a>
                ) : (
                  <span className="text-xs text-muted-foreground">PDF not ready</span>
                )}
              </div>

              {doc.error_json ? (
                <pre className="mt-2 whitespace-pre-wrap text-xs text-destructive">
                  {JSON.stringify(doc.error_json, null, 2)}
                </pre>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
