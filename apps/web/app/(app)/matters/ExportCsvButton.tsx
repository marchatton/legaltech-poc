"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../lib/safeErrorDisplay";

import { Button } from "../../ui/Button";
import { ErrorBanner } from "../../ui/ErrorBanner";
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
  | { kind: "blocked"; error: SafeErrorDisplay }
  | { kind: "error"; error: SafeErrorDisplay }
  | { kind: "downloaded"; message: string };

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

export function ExportCsvButton(props: Props) {
  const router = useRouter();
  const [state, setState] = useState<ExportState>({ kind: "idle" });

  async function run() {
    if (!props.runId) {
      setState({
        kind: "error",
        error: {
          code: "VALIDATION_ERROR",
          message: "Select a completed run before exporting.",
          retryable: false,
        },
      });
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
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message, retryable: true } });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = parseSafeErrorEnvelope(json);
      const error = env ?? {
        code: `HTTP_${res.status}`,
        message: `Request failed (${res.status}).`,
        retryable: res.status >= 500,
      };
      setState({ kind: error.code === "EXPORT_BLOCKED" ? "blocked" : "error", error });
      return;
    }

    const json: unknown = await res.json().catch(() => null);
    const artefact = isRecord(json) && isRecord(json.artefact) ? json.artefact : null;
    const downloadUrl = artefact && typeof artefact.download_url === "string" ? artefact.download_url : null;
    if (!downloadUrl) {
      setState({
        kind: "error",
        error: {
          code: "BAD_RESPONSE",
          message: "Export response was missing a download URL.",
          retryable: false,
        },
      });
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
        disabled={!props.runId}
        loading={state.kind === "loading"}
      >
        {props.label ?? "Export CSV"}
      </Button>

      {state.kind === "blocked" || state.kind === "error" ? (
        <ErrorBanner
          title={state.kind === "blocked" ? "Export blocked" : "Export failed"}
          code={state.error.code}
          message={state.error.message}
          traceId={state.error.traceId}
          supportRoute="/matters"
          retryable={state.error.retryable}
          onRetry={state.kind === "error" ? run : undefined}
          className="w-full max-w-md"
        />
      ) : null}

      <InlineStatus kind={state.kind === "downloaded" ? "success" : "idle"}>
        {state.kind === "downloaded" ? state.message : null}
      </InlineStatus>
    </div>
  );
}
