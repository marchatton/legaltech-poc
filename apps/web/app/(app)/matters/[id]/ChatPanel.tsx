"use client";

import { useCallback, useMemo, useRef, useState, type FormEvent } from "react";

import { parseSafeErrorEnvelope } from "../../../../lib/safeErrorDisplay";

import { Button } from "../../../ui/Button";
import { Chip } from "../../../ui/Chip";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { Input } from "../../../ui/Input";

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
          let message = "Chat request failed. Please retry.";
          let traceId: string | undefined;
          let retryable = true;
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
    <div className="grid gap-4">
      <div className="grid gap-3">
        {messages.length === 0 ? (
          <div className="text-xs text-muted-foreground">
            Ask a question about the documents in this matter. Answers are evidence-first. If retrieval finds no supporting chunks, the response is{" "}
            <span className="font-mono">{MISSING_EVIDENCE_TEXT}</span>.
          </div>
        ) : null}

        <div className="grid gap-3">
          {messages.map((m) => {
            const isUser = m.role === "user";
            const bubbleCls = isUser
              ? "bg-user-bubble text-user-bubble-foreground justify-self-end"
              : "bg-card text-foreground justify-self-start";

            return (
              <div key={m.id} className="grid gap-2">
                <div className={`max-w-[min(70ch,100%)] rounded-ui-lg border border-border px-3 py-2 shadow-ui-sm ${bubbleCls}`}>
                  <div className="whitespace-pre-wrap text-sm">
                    {m.content || (m.status === "streaming" ? <span className="text-muted-foreground">(streaming)</span> : null)}
                  </div>
                </div>

                {!isUser && m.status === "citation_failed" ? (
                  <ErrorBanner
                    title="Chat failed"
                    className="max-w-[min(70ch,100%)]"
                    code={m.error?.code ?? "CHAT_FAILED"}
                    message={m.error?.message ?? "Chat failed. Please retry."}
                    traceId={m.error?.traceId}
                    retryable={m.error?.retryable}
                    onRetry={m.error?.retryable === false || busy ? undefined : onRetryLast}
                  >
                    <div className="text-2xs text-muted-foreground">If this keeps failing, refresh the page.</div>
                  </ErrorBanner>
                ) : null}

                {!isUser && m.status === "complete" && m.sources?.length ? (
                  <section className="max-w-[min(70ch,100%)]">
                    <div className="text-2xs font-semibold text-foreground">Sources</div>
                    <div className="mt-2 flex flex-wrap items-center gap-2">
                      {m.sources.map((s, idx) => (
                        <Chip key={`${s.document_id}:${s.page_number}:${idx}`} variant="citation" title={`${s.document_id} p.${s.page_number}`}>
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

      <form className="flex flex-wrap items-center gap-2" onSubmit={onSubmit}>
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={busy ? "Waiting for response..." : "Ask a question..."}
          disabled={busy}
          className="flex-1 min-w-[220px]"
        />
        <Button type="submit" disabled={!canSend}>
          Send
        </Button>
      </form>
    </div>
  );
}
