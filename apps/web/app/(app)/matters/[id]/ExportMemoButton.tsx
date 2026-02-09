"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

type Props = {
  folderId: string;
  runId: string | null;
  runState: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; message: string }
  | { kind: "done"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): { code: string; message: string } | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message };
}

function disabledReason(props: Props): string | null {
  if (!props.runId) return "Export is disabled until a run exists.";
  if (props.runState !== "completed") return `Export is disabled until the run completes (current: ${props.runState ?? "unknown"}).`;
  return null;
}

export function ExportMemoButton(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  const disabled = disabledReason(props);

  async function run() {
    if (disabled) return;
    if (!props.runId) return;

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/export/docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: "memo",
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    if (!res.ok) {
      const env = readSafeError(json);
      if (env) {
        setState({ kind: "error", message: `${env.code}: ${env.message}` });
        return;
      }
      setState({ kind: "error", message: `Request failed (${res.status}).` });
      return;
    }

    setState({ kind: "done", message: "Memo exported. See Artefacts for download." });
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      <button
        className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={run}
        disabled={Boolean(disabled) || state.kind === "loading"}
      >
        {state.kind === "loading" ? "Exporting…" : "Export memo (Word)"}
      </button>

      {disabled ? <div className="text-xs text-slate-600">{disabled}</div> : null}

      {state.kind === "error" ? <div className="text-xs font-medium text-red-700">{state.message}</div> : null}
      {state.kind === "done" ? <div className="text-xs font-medium text-emerald-700">{state.message}</div> : null}
    </div>
  );
}

