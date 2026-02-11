"use client";

import { useEffect, useState } from "react";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../lib/safeErrorDisplay";

import { Button } from "../../ui/Button";
import { ErrorBanner } from "../../ui/ErrorBanner";
import { InlineStatus } from "../../ui/InlineStatus";
import { Input } from "../../ui/Input";

type Props = {
  folderId: string;
  runId: string | null;
};

type ExportState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; error: SafeErrorDisplay }
  | { kind: "downloaded"; message: string };

export function ExportTraceButton(props: Props) {
  const [state, setState] = useState<ExportState>({ kind: "idle" });
  const [runIdInput, setRunIdInput] = useState<string>(props.runId ?? "");

  useEffect(() => {
    setRunIdInput(props.runId ?? "");
  }, [props.runId]);

  async function run() {
    const runId = runIdInput.trim();
    if (!runId) {
      setState({ kind: "error", error: { code: "VALIDATION_ERROR", message: "Missing run_id." } });
      return;
    }

    setState({ kind: "loading" });

    const url = `/runs/${encodeURIComponent(runId)}/trace?${new URLSearchParams({ pack: props.folderId }).toString()}`;

    let res: Response;
    try {
      res = await fetch(url, { method: "GET" });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message } });
      return;
    }

    if (!res.ok) {
      const json: unknown = await res.json().catch(() => null);
      const env = parseSafeErrorEnvelope(json);
      setState({
        kind: "error",
        error:
          env ?? {
            code: `HTTP_${res.status}`,
            message: `Request failed (${res.status}).`,
          },
      });
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
        <Input
          className="w-44 font-mono"
          uiSize="sm"
          type="text"
          value={runIdInput}
          placeholder="run_id"
          onChange={(e) => setRunIdInput(e.target.value)}
          aria-label="Run id"
        />
        <Button
          variant="secondary"
          size="sm"
          onClick={run}
          loading={state.kind === "loading"}
        >
          Export trace
        </Button>
      </div>

      {state.kind === "error" ? (
        <ErrorBanner
          title="Trace export failed"
          code={state.error.code}
          message={state.error.message}
          traceId={state.error.traceId}
          retryable={state.error.retryable}
          onRetry={run}
          className="w-full max-w-md"
        />
      ) : null}

      <InlineStatus kind={state.kind === "downloaded" ? "success" : "idle"}>
        {state.kind === "downloaded" ? state.message : null}
      </InlineStatus>
    </div>
  );
}
