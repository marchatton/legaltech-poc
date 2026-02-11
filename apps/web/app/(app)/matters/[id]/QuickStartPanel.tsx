"use client";

import { useState } from "react";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";

type Props = {
  folderId: string;
  disabledReason: string | null;
};

type QuickStartState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; error: SafeErrorDisplay }
  | { kind: "started"; runId: string; runState: string };

function isRecord(value: unknown): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value);
}

export function QuickStartPanel(props: Props) {
  const [state, setState] = useState<QuickStartState>({ kind: "idle" });

  async function start() {
    if (props.disabledReason) return;
    setState({ kind: "loading" });

    let res: Response;
    try {
      res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "demo-quick-start",
        },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      });
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message } });
      return;
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const env = parseSafeErrorEnvelope(json);
      if (env) {
        setState({ kind: "error", error: env });
        return;
      }
      setState({
        kind: "error",
        error: {
          code: `HTTP_${res.status}`,
          message: `Request failed (${res.status}).`,
        },
      });
      return;
    }

    const run = isRecord(json) && isRecord(json.run) ? json.run : null;
    const runId = run && typeof run.id === "string" ? run.id : null;
    const runState = run && typeof run.state === "string" ? run.state : "running";
    if (!runId) {
      setState({ kind: "error", error: { code: "BAD_RESPONSE", message: "Missing run.id in response." } });
      return;
    }

    setState({ kind: "started", runId, runState });
  }

  return (
    <div className="grid justify-items-end gap-2">
      <Button
        size="sm"
        onClick={start}
        disabled={Boolean(props.disabledReason)}
        loading={state.kind === "loading"}
      >
        Run Quick Start
      </Button>

      {props.disabledReason ? <div className="text-xs text-muted-foreground">{props.disabledReason}</div> : null}

      {state.kind === "error" ? (
        <ErrorBanner
          title="Quick Start failed"
          code={state.error.code}
          message={state.error.message}
          traceId={state.error.traceId}
          retryable={state.error.retryable}
          onRetry={start}
          className="w-full max-w-md"
        />
      ) : null}

      {state.kind === "started" ? (
        <div className="grid gap-1 text-right text-xs text-muted-foreground">
          <div>
            run: <span className="font-mono">{state.runId}</span> ({state.runState})
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <a
              className="underline hover:text-foreground"
              href={`/runs/${encodeURIComponent(state.runId)}`}
              target="_blank"
              rel="noreferrer"
            >
              Run JSON
            </a>
            <a
              className="underline hover:text-foreground"
              href={`/folders/${encodeURIComponent(props.folderId)}/report?${new URLSearchParams({
                run_id: state.runId,
              }).toString()}`}
              target="_blank"
              rel="noreferrer"
            >
              Report JSON
            </a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
