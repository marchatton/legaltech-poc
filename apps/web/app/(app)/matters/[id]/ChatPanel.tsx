"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";

import { parseSafeErrorEnvelope } from "../../../../lib/safeErrorDisplay";

import { Button } from "../../../ui/Button";
import { Chip } from "../../../ui/Chip";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { EmptyState } from "../../../ui/EmptyState";
import { Input } from "../../../ui/Input";
import { Prose } from "../../../ui/Prose";
import { Spinner } from "../../../ui/Spinner";

import { parseChatStreamEvent, type ChatSource, type ChatStreamEvent } from "../../../../lib/chat/protocol";

type MessageStatus = "sending" | "streaming" | "complete" | "citation_failed";

type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  content: string;
  status?: MessageStatus;
  sources?: ChatSource[];
  error?: { code: string; message: string; traceId?: string; retryable?: boolean };
};

function safeRandomId(prefix: string): string {
  const id = typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : String(Date.now());
  return `${prefix}_${id}`;
}

function sourcesEqual(a: ChatSource[] | undefined, b: ChatSource[] | undefined): boolean {
  if (!a && !b) return true;
  if (!a || !b) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    if (a[i]!.document_id !== b[i]!.document_id) return false;
    if (a[i]!.page_number !== b[i]!.page_number) return false;
    if (a[i]!.anchor_state !== b[i]!.anchor_state) return false;
    if ((a[i]!.anchor_reason ?? "") !== (b[i]!.anchor_reason ?? "")) return false;
  }
  return true;
}

function parseRenderUrl(json: unknown): string | null {
  if (!json || typeof json !== "object" || Array.isArray(json)) return null;
  const url = (json as { render_url?: unknown }).render_url;
  return typeof url === "string" && url.trim().length > 0 ? url : null;
}

async function readNdjsonStream(args: {
  body: ReadableStream<Uint8Array>;
  onEvent: (event: ChatStreamEvent) => void;
}): Promise<void> {
  const reader = args.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  while (true) {
    const { value, done } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });

    while (true) {
      const idx = buffer.indexOf("\n");
      if (idx === -1) break;
      const line = buffer.slice(0, idx).trim();
      buffer = buffer.slice(idx + 1);
      if (!line) continue;
      const evt = parseChatStreamEvent(line);
      if (evt) args.onEvent(evt);
    }
  }

  const tail = buffer.trim();
  if (tail) {
    const evt = parseChatStreamEvent(tail);
    if (evt) args.onEvent(evt);
  }
}

const SUGGESTED_PROMPTS = [
  "Summarise the key obligations in these documents",
  "Are there any unrecorded easements?",
  "List all parties and their roles",
];

export function ChatPanel(props: {
  folderId: string;
  contextReady: boolean;
  contextGuidance: string;
  sourceLabelByDocumentId: Record<string, string>;
}) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sourceOpenError, setSourceOpenError] = useState<string | null>(null);
  const [openingSourceKey, setOpeningSourceKey] = useState<string | null>(null);
  const lastUserMessageRef = useRef<string | null>(null);

  const composerDisabled = !props.contextReady || busy;
  const canSend = useMemo(() => !composerDisabled && input.trim().length > 0, [composerDisabled, input]);

  const updateMessage = useCallback((id: string, updater: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }, []);

  const openSource = useCallback(async (source: ChatSource) => {
    if (source.anchor_state !== "ready") return;

    const sourceKey = `${source.document_id}:${source.page_number}`;
    setOpeningSourceKey(sourceKey);
    setSourceOpenError(null);

    try {
      const res = await fetch(
        `/documents/${encodeURIComponent(source.document_id)}/render?${new URLSearchParams({
          page: String(source.page_number),
        }).toString()}`,
        { cache: "no-store" },
      );
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const env = parseSafeErrorEnvelope(json);
        throw new Error(env?.message ?? `Source viewer failed (${res.status}).`);
      }

      const renderUrl = parseRenderUrl(json);
      if (!renderUrl) {
        throw new Error("Source viewer payload was invalid.");
      }

      const target = renderUrl.includes("#") ? renderUrl : `${renderUrl}#page=${source.page_number}`;
      window.open(target, "_blank", "noopener,noreferrer");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unable to open this source.";
      setSourceOpenError(message);
    } finally {
      setOpeningSourceKey(null);
    }
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || !props.contextReady) return;

      const userId = safeRandomId("usr");
      const assistantId = safeRandomId("ast");

      lastUserMessageRef.current = trimmed;
      setBusy(true);
      setSourceOpenError(null);
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: trimmed },
        { id: assistantId, role: "assistant", content: "", status: "sending", sources: [] },
      ]);
      setInput("");

      try {
        const res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/chat`, {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({ message: trimmed }),
        });

        if (!res.ok) {
          let code = `HTTP_${res.status}`;
          let message =
            res.status >= 500 || res.status === 429
              ? "Chat request failed. Please retry."
              : "Chat request was rejected. Check your question and try again.";
          let traceId: string | undefined;
          let retryable = res.status >= 500 || res.status === 429;
          try {
            const json: unknown = await res.json();
            const env = parseSafeErrorEnvelope(json);
            if (env) {
              code = env.code;
              message = env.message;
              traceId = env.traceId;
              retryable = env.retryable ?? retryable;
            }
          } catch {
            // ignore parse failures
          }

          updateMessage(assistantId, (m) => ({
            ...m,
            status: "citation_failed",
            error: { code, message, traceId, retryable },
          }));
          return;
        }

        const body = res.body;
        if (!body) {
          updateMessage(assistantId, (m) => ({
            ...m,
            status: "citation_failed",
            error: { code: "NO_STREAM", message: "Chat response stream is missing. Please retry.", retryable: true },
          }));
          return;
        }

        let terminalSeen = false;
        await readNdjsonStream({
          body,
          onEvent: (evt) => {
            if (evt.type === "token") {
              updateMessage(assistantId, (m) => ({ ...m, status: "streaming", content: m.content + evt.token }));
              return;
            }

            if (evt.type === "sources") {
              updateMessage(assistantId, (m) => (sourcesEqual(m.sources, evt.sources) ? m : { ...m, sources: evt.sources }));
              return;
            }

            if (evt.type === "done") {
              terminalSeen = true;
              updateMessage(assistantId, (m) => ({ ...m, status: "complete" }));
              return;
            }

            if (evt.type === "error") {
              terminalSeen = true;
              updateMessage(assistantId, (m) => ({
                ...m,
                status: "citation_failed",
                error: { code: evt.code, message: evt.message, traceId: evt.trace_id, retryable: evt.retryable },
              }));
              return;
            }

            // meta: ignore
          },
        });

        if (!terminalSeen) {
          updateMessage(assistantId, (m) => ({
            ...m,
            status: "citation_failed",
            error: { code: "STREAM_ENDED", message: "Chat response ended unexpectedly. Please retry.", retryable: true },
          }));
          return;
        }
      } catch (err) {
        const message =
          err instanceof Error && err.message === "Failed to fetch"
            ? "Unable to reach chat service. Check your connection and retry."
            : "Chat request failed unexpectedly. Please retry.";
        updateMessage(assistantId, (m) => ({
          ...m,
          status: "citation_failed",
          error: { code: "CHAT_REQUEST_FAILED", message, retryable: true },
        }));
      } finally {
        setBusy(false);
      }
    },
    [props.contextReady, props.folderId, updateMessage],
  );

  const onSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (!canSend) return;
      await sendMessage(input);
    },
    [canSend, input, sendMessage],
  );

  const onRetryLast = useCallback(async () => {
    const last = lastUserMessageRef.current;
    if (!last) return;
    await sendMessage(last);
  }, [sendMessage]);

  return (
    <div className="flex flex-col bg-card border border-border rounded-ui-lg shadow-ui-sm overflow-hidden">
      {/* Header bar */}
      <div className="px-4 py-2.5 border-b border-border bg-muted/30 flex items-center gap-2">
        <div className="w-6 h-6 rounded-ui-md bg-primary/10 flex items-center justify-center text-primary text-xs font-bold" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <span className="text-sm font-medium text-foreground">Matter Assistant</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState
            title="Ask about this matter"
            description="Answers are grounded in indexed documents with sources."
          />
        ) : null}

        <div className="grid gap-3">
          {messages.map((m) => {
            const isUser = m.role === "user";
            const bubbleCls = isUser
              ? "bg-user-bubble text-user-bubble-foreground justify-self-end"
              : "bg-card text-foreground justify-self-start";

            return (
              <div key={m.id} className="grid gap-2 animate-fade-in">
                <div className={`max-w-[80%] rounded-ui-2xl border border-border px-4 py-3 shadow-ui-sm transition-colors duration-micro ease-brand-standard ${bubbleCls}`}>
                  {m.content ? (
                    isUser ? (
                      <div className="whitespace-pre-wrap text-sm leading-relaxed">
                        {m.content}
                      </div>
                    ) : (
                      <div>
                        <Prose content={m.content} />
                        {m.status === "streaming" ? (
                          <span className="ml-0.5 inline-block animate-pulse text-muted-foreground" aria-hidden="true">
                            |
                          </span>
                        ) : null}
                      </div>
                    )
                  ) : m.status === "sending" || m.status === "streaming" ? (
                    <div className="text-sm leading-relaxed">
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Spinner size="xs" /> {m.status === "sending" ? "Sending..." : "Streaming..."}
                      </span>
                    </div>
                  ) : null}
                </div>


                {!isUser && m.status === "citation_failed" ? (
                  <ErrorBanner
                    title="Chat failed"
                    className="max-w-[80%]"
                    code={m.error?.code ?? "CHAT_FAILED"}
                    message={m.error?.message ?? "Chat failed. Please retry."}
                    traceId={m.error?.traceId}
                    supportRoute={`/matters/${props.folderId}`}
                    retryable={m.error?.retryable}
                    onRetry={m.error?.retryable === true && !busy ? onRetryLast : undefined}
                  >
                    <div className="text-2xs text-muted-foreground">
                      {m.error?.code === "VALIDATION_ERROR"
                        ? "Check the question format and submit again."
                        : m.error?.retryable === true
                          ? "Retry sends the same question again."
                          : "If this keeps failing, refresh the page."}
                    </div>
                  </ErrorBanner>
                ) : null}

                {!isUser && m.status === "complete" && m.sources?.length ? (
                  <section className="max-w-[80%] rounded-ui-md bg-muted/50 p-3">
                    <div className="text-2xs font-semibold uppercase tracking-wide text-foreground">Sources</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {m.sources.map((s, idx) => {
                        const sourceKey = `${s.document_id}:${s.page_number}:${idx}`;
                        const sourceReady = s.anchor_state === "ready";
                        const sourceLabel = props.sourceLabelByDocumentId[s.document_id] ?? s.document_id;
                        const title = sourceReady
                          ? `Open ${sourceLabel} page ${s.page_number}`
                          : s.anchor_reason ?? "Source anchor is unavailable.";
                        const opening = openingSourceKey === `${s.document_id}:${s.page_number}`;
                        return sourceReady ? (
                          <Chip
                            key={sourceKey}
                            as="button"
                            variant="citation"
                            title={title}
                            className={opening ? "opacity-70" : undefined}
                            onClick={() => {
                              void openSource(s);
                            }}
                          >
                            {sourceLabel} p.{s.page_number}
                          </Chip>
                        ) : (
                          <Chip
                            key={sourceKey}
                            variant="citation"
                            className="cursor-not-allowed opacity-55"
                            title={title}
                            aria-disabled="true"
                          >
                            {sourceLabel} p.{s.page_number} unavailable
                          </Chip>
                        );
                      })}
                    </div>
                  </section>
                ) : null}

                {!isUser && sourceOpenError ? (
                  <div className="max-w-[80%] text-2xs text-destructive">{sourceOpenError}</div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Suggested prompts */}
      {messages.length === 0 && props.contextReady ? (
        <div className="flex flex-wrap gap-2 border-t border-border px-4 py-3">
          {SUGGESTED_PROMPTS.map((prompt) => (
            <Chip
              key={prompt}
              as="button"
              className="text-left text-xs leading-relaxed"
              onClick={() => {
                if (!props.contextReady) return;
                void sendMessage(prompt);
              }}
            >
              {prompt}
            </Chip>
          ))}
        </div>
      ) : null}

      {/* Input area */}
      <div className="p-3 border-t border-border">
        {!props.contextReady ? (
          <div className="mb-2 rounded-ui-md border border-warning/30 bg-warning/10 px-3 py-2 text-xs text-warning">
            {props.contextGuidance}
          </div>
        ) : null}
        <form className="flex items-end gap-2.5" onSubmit={onSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={!props.contextReady ? "Chat is disabled until indexed context is available." : busy ? "Waiting for response..." : "Ask about your documents..."}
            disabled={composerDisabled}
            className="w-full flex-1 bg-muted/30"
          />
          <Button
            type="submit"
            variant="primary"
            size="md"
            disabled={!canSend}
            className="size-9 shrink-0 p-0 disabled:opacity-40"
            aria-label="Send message"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4" aria-hidden="true">
              <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" />
            </svg>
          </Button>
        </form>
      </div>
    </div>
  );
}
