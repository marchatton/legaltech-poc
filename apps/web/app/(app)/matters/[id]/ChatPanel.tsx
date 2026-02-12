"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";

import { parseSafeErrorEnvelope } from "../../../../lib/safeErrorDisplay";

import { Button } from "../../../ui/Button";
import { Chip } from "../../../ui/Chip";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { EmptyState } from "../../../ui/EmptyState";
import { Input } from "../../../ui/Input";
import { Spinner } from "../../../ui/Spinner";

import { MISSING_EVIDENCE_TEXT, parseChatStreamEvent, type ChatSource, type ChatStreamEvent } from "../../../../lib/chat/protocol";

type MessageStatus = "streaming" | "complete" | "citation_failed";

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
  }
  return true;
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

export function ChatPanel(props: { folderId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const lastUserMessageRef = useRef<string | null>(null);

  const canSend = useMemo(() => !busy && input.trim().length > 0, [busy, input]);

  const updateMessage = useCallback((id: string, updater: (m: ChatMessage) => ChatMessage) => {
    setMessages((prev) => prev.map((m) => (m.id === id ? updater(m) : m)));
  }, []);

  const sendMessage = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed) return;

      const userId = safeRandomId("usr");
      const assistantId = safeRandomId("ast");

      lastUserMessageRef.current = trimmed;
      setBusy(true);
      setMessages((prev) => [
        ...prev,
        { id: userId, role: "user", content: trimmed },
        { id: assistantId, role: "assistant", content: "", status: "streaming", sources: [] },
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
              updateMessage(assistantId, (m) => ({ ...m, content: m.content + evt.token }));
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
        }
      } finally {
        setBusy(false);
      }
    },
    [props.folderId, updateMessage],
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
      <div className="px-4 py-2 border-b border-border bg-cyan-50/40 flex items-center gap-2">
        <div className="w-6 h-6 rounded-md bg-cyan-100 flex items-center justify-center text-cyan-600 text-xs font-bold" aria-hidden="true">⬡</div>
        <span className="text-sm font-medium text-foreground">Matter Assistant</span>
        <span className="ml-auto text-2xs text-muted-foreground">Evidence-first — unanswerable queries return &ldquo;{MISSING_EVIDENCE_TEXT}&rdquo;</span>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <EmptyState
            title="Ask about this matter"
            description="Get answers grounded in the indexed documents. All responses include source citations."
            action={
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-w-lg mx-auto">
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <Chip
                    key={prompt}
                    as="button"
                    className="text-left text-xs leading-relaxed"
                    onClick={() => {
                      setInput(prompt);
                    }}
                  >
                    {prompt}
                  </Chip>
                ))}
              </div>
            }
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
                <div className={`max-w-[80%] rounded-2xl border border-border px-4 py-3 shadow-ui-sm transition-colors duration-micro ease-brand-standard ${bubbleCls}`}>
                  <div className="whitespace-pre-wrap text-sm leading-relaxed">
                    {m.content || (m.status === "streaming" ? (
                      <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                        <Spinner size="xs" /> Thinking&hellip;
                      </span>
                    ) : null)}
                  </div>
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
                      {m.sources.map((s, idx) => (
                        <Chip
                          key={`${s.document_id}:${s.page_number}:${idx}`}
                          variant="citation"
                          title={`${s.document_id} p.${s.page_number} (jump-to-evidence coming soon)`}
                        >
                          {s.document_id} p.{s.page_number}
                        </Chip>
                      ))}
                    </div>
                  </section>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>

      {/* Input area */}
      <div className="p-3 border-t border-border">
        <form className="relative" onSubmit={onSubmit}>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={busy ? "Waiting for response..." : "Ask a question about this matter..."}
            disabled={busy}
            className="w-full bg-muted/30 pr-14"
          />
          <Button type="submit" disabled={!canSend} className="absolute right-1.5 top-1/2 -translate-y-1/2">
            Send
          </Button>
        </form>
      </div>
    </div>
  );
}
