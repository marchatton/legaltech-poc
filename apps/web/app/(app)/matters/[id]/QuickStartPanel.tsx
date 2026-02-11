"use client";

import { useState } from "react";

import { Alert, type AlertVariant } from "../../../ui/Alert";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";

export type QuickStartReadinessState = "ready" | "blocked" | "already-complete";

export type QuickStartReadiness = {
  state: QuickStartReadinessState;
  reason: string;
};

type Props = {
  folderId: string;
  readiness: QuickStartReadiness;
};

type StructuredError = {
  code: string;
  message: string;
  retryable: boolean;
};

type QuickStartState =
  | { kind: "idle" }
  | { kind: "loading" }
  | { kind: "error"; error: StructuredError }
  | { kind: "started"; runId: string; runState: string };

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

function readinessLabel(state: QuickStartReadinessState): string {
  if (state === "ready") return "Ready";
  if (state === "already-complete") return "Already complete";
  return "Blocked";
}

const readinessAlertVariant: Record<QuickStartReadinessState, AlertVariant> = {
  ready: "success",
  "already-complete": "info",
  blocked: "warning",
};

export function QuickStartPanel(props: Props) {
  const [state, setState] = useState<QuickStartState>({ kind: "idle" });

  async function start() {
    if (props.readiness.state !== "ready") return;
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
      setState({ kind: "error", error: { code: "NETWORK_ERROR", message, retryable: true } });
      return;
    }

    const json: unknown = await res.json().catch(() => null);

    if (!res.ok) {
      const env = readSafeError(json);
      const retryable = res.status >= 500 || res.status === 429;
      if (env) {
        setState({ kind: "error", error: { code: env.code, message: env.message, retryable } });
        return;
      }
      setState({ kind: "error", error: { code: `HTTP_${res.status}`, message: `Request failed (${res.status}).`, retryable } });
      return;
    }

    const run = isRecord(json) && isRecord(json.run) ? json.run : null;
    const runId = run && typeof run.id === "string" ? run.id : null;
    const runState = run && typeof run.state === "string" ? run.state : "running";
    if (!runId) {
      setState({ kind: "error", error: { code: "INVALID_RESPONSE", message: "Missing run.id in response.", retryable: false } });
      return;
    }

    setState({ kind: "started", runId, runState });
  }

  function handleRetry() {
    setState({ kind: "idle" });
  }

  return (
    <div className="grid gap-3">
      <Alert variant={readinessAlertVariant[props.readiness.state]} title={readinessLabel(props.readiness.state)}>
        {props.readiness.reason}
      </Alert>

      <Button size="sm" onClick={start} disabled={props.readiness.state !== "ready"} loading={state.kind === "loading"}>
        Run Quick Start
      </Button>

      {state.kind === "error" ? (
        <ErrorBanner
          code={state.error.code}
          message={state.error.message}
          retryable={state.error.retryable}
          onRetry={state.error.retryable ? handleRetry : undefined}
        />
      ) : null}

      {state.kind === "started" ? (
        <div className="grid gap-1 text-xs text-muted-foreground">
          <div>
            run: <span className="font-mono">{state.runId}</span> ({state.runState})
          </div>
          <div className="flex flex-wrap gap-3">
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
