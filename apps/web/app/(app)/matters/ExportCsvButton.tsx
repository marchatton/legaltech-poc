"use client";

import { useState } from "react";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function ExportCsvButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    if (!props.runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/spikes/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: "requirements_tracker",
          unsafe_override: false,
        }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = isRecord(json) && isRecord(json.error) ? json.error : null;
      const code = env && typeof env.code === "string" ? env.code : "UNKNOWN_ERROR";
      const message = env && typeof env.message === "string" ? env.message : `Request failed (${res.status})`;
      setState({ kind: code === "EXPORT_BLOCKED" ? "blocked" : "error", message: `${code}: ${message}` });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const artefact = isRecord(json) && isRecord(json.artefact) ? json.artefact : null;
    const downloadUrl = artefact && typeof artefact.download_url === "string" ? artefact.download_url : null;
    if (!downloadUrl) {
      setState({ kind: "error", message: "Missing artefact.download_url." });
      return;
    }

    const a = document.createElement("a");
    a.href = downloadUrl;
    a.click();
    setState({ kind: "downloaded", message: "Export created. Download started." });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <button
        className="rounded bg-slate-900 px-3 py-2 text-xs font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        type="button"
        onClick={run}
        disabled={state.kind === "loading"}
      >
        {state.kind === "loading" ? "Exporting…" : "Export CSV"}
      </button>

      {state.kind === "blocked" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "error" ? (
        <div className="text-xs font-medium text-red-700">{state.message}</div>
      ) : state.kind === "downloaded" ? (
        <div className="text-xs font-medium text-emerald-700">{state.message}</div>
      ) : null}
    </div>
  );
}
