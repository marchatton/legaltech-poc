"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { type QuickStartReadiness } from "./QuickStartPanel";
import { Button } from "../../../ui/Button";

type Props = {
  folderId: string;
  readiness: QuickStartReadiness;
};

type StructuredError = {
  code: string;
  message: string;
};

function readinessReasonClass(state: QuickStartReadiness["state"]): string {
  if (state === "ready") return "max-w-64 text-right text-2xs text-success";
  if (state === "already-complete") return "max-w-64 text-right text-2xs text-primary";
  return "max-w-64 text-right text-2xs text-muted-foreground";
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return !!val && typeof val === "object" && !Array.isArray(val);
}

function readSafeError(json: unknown): StructuredError | null {
  const env = isRecord(json) && isRecord(json.error) ? json.error : null;
  if (!env) return null;
  const code = typeof env.code === "string" && env.code.trim() ? env.code.trim() : null;
  const message = typeof env.message === "string" && env.message.trim() ? env.message.trim() : null;
  if (!code || !message) return null;
  return { code, message };
}

export function QuickStartActionButton(props: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<StructuredError | null>(null);

  async function start() {
    if (props.readiness.state !== "ready") return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": "demo-quick-start",
        },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const env = readSafeError(json);
        setError(env ?? { code: `HTTP_${res.status}`, message: `Quick Start failed (${res.status}).` });
        return;
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError({ code: "NETWORK_ERROR", message });
    } finally {
      setPending(false);
    }
  }

  const blocked = props.readiness.state !== "ready";
  const disabledReason = blocked ? props.readiness.reason : undefined;

  return (
    <div className="grid justify-items-end gap-1">
      <Button
        type="button"
        onClick={start}
        loading={pending}
        disabled={blocked}
        className="h-10 px-5 text-sm"
        title={disabledReason}
      >
        Quick Start
      </Button>
      {error ? (
        <div className="text-right font-mono text-2xs text-destructive">
          {error.code}: {error.message}
        </div>
      ) : (
        <div className={readinessReasonClass(props.readiness.state)}>{props.readiness.reason}</div>
      )}
    </div>
  );
}
