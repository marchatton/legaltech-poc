"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { Button } from "../../ui/Button";
import { InlineStatus } from "../../ui/InlineStatus";

type Props = {
  folderId: string;
  runId: string | null;
  kind: "requirements_tracker" | "exceptions_table" | "survey_issues";
  label?: string;
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
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    if (!props.runId) {
      setState({ kind: "error", message: "Missing run_id." });
      return;
    }

    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch("/export/csv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          folder_id: props.folderId,
          run_id: props.runId,
          kind: props.kind,
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
    router.refresh();
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        variant="secondary"
        size="sm"
        onClick={run}
        disabled={state.kind === "loading" || !props.runId}
      >
        {state.kind === "loading" ? "Exporting…" : (props.label ?? "Export CSV")}
      </Button>

      <InlineStatus kind={state.kind === "blocked" || state.kind === "error" ? "error" : state.kind === "downloaded" ? "success" : "idle"}>
        {state.kind === "blocked" || state.kind === "error" ? state.message : state.kind === "downloaded" ? state.message : null}
      </InlineStatus>
    </div>
  );
}
