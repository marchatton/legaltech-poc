"use client";

import { useState } from "react";

type Props = {
  packId: string;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "blocked"; message: string }
  | { kind: "error"; message: string }
  | { kind: "downloaded"; message: string };

export function ExportCsvButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/spikes/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pack_id: props.packId }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", message });
      return;
    }

    if (!res.ok) {
      const json = await res.json().catch(() => null);
      const code = json?.error?.code ? String(json.error.code) : "UNKNOWN_ERROR";
      const message = json?.error?.message ? String(json.error.message) : `Request failed (${res.status})`;
      setState({ kind: code === "EXPORT_BLOCKED" ? "blocked" : "error", message: `${code}: ${message}` });
      return;
    }

    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${props.packId}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    setState({ kind: "downloaded", message: "Downloaded CSV." });
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
