"use client";

import { useEffect, useState } from "react";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function parseErrorEnvelope(json: unknown): { code: string; message: string; traceId?: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  const traceId = typeof env.trace_id === "string" && env.trace_id.trim() ? env.trace_id.trim() : undefined;
  if (!code || !message) return null;
  return { code, message, traceId };
}

export function ExportTraceButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [runIdInput, setRunIdInput] = useState<string>(props.runId ?? "");

  useEffect(() => {
    setRunIdInput(props.runId ?? "");
  }, [props.runId]);

  async function run() {
    const runId = runIdInput.trim();
    if (!runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    const url = `/runs/${encodeURIComponent(runId)}/trace?${new URLSearchParams({ pack: props.folderId }).toString()}`;

    let res: Response;
    try {
      res = await fetch(url, { method: "GET" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = parseErrorEnvelope(json);
      const code = env?.code ?? "UNKNOWN_ERROR";
      const message = env?.message ?? `Request failed (${res.status})`;
      const trace = env?.traceId ? ` (trace_id: ${env.traceId})` : "";
      setState({ kind: "error", message: `${code}: ${message}${trace}` });
      return;
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = objectUrl;
    a.download = `trace_${runId}.json`;
    a.click();
    URL.revokeObjectURL(objectUrl);
    setState({ kind: "downloaded", message: "Trace download started." });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <div className="flex flex-wrap items-center justify-end gap-2">
        <input
          className="h-9 w-44 rounded border border-slate-200 bg-white px-2 text-xs text-slate-900 placeholder:text-slate-400"
          type="text"
          value={runIdInput}
          placeholder="run_id"
          onChange={(e) => setRunIdInput(e.target.value)}
          aria-label="Run id"
        />
        <button
          className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          type="button"
          onClick={run}
          disabled={state.kind === "loading"}
        >
          {state.kind === "loading" ? "Downloading…" : "Export trace"}
        </button>
      </div>

      {state.kind === "error" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "downloaded" ? (
        <div className="text-xs font-medium text-emerald-700">{state.message}</div>
      ) : null}
    </div>
  );
}

