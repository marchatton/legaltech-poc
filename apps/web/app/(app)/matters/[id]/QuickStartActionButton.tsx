"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { QUICK_START_IDEMPOTENCY_KEY, type QuickStartReadiness } from "./QuickStartPanel";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";

type Props = {
  folderId: string;
  readiness: QuickStartReadiness;
};

function readinessReasonClass(state: QuickStartReadiness["state"]): string {
  if (state === "ready") return "max-w-64 text-right text-2xs text-success";
  if (state === "already-complete") return "max-w-64 text-right text-2xs text-primary";
  return "max-w-64 text-right text-2xs text-muted-foreground";
}
export function QuickStartActionButton(props: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<SafeErrorDisplay | null>(null);

  async function start() {
    if (props.readiness.state !== "ready") return;
    setPending(true);
    setError(null);

    try {
      const res = await fetch(`/folders/${encodeURIComponent(props.folderId)}/runs`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": QUICK_START_IDEMPOTENCY_KEY,
        },
        body: JSON.stringify({ type: "quick_start_title_survey" }),
      });
      const json: unknown = await res.json().catch(() => null);
      if (!res.ok) {
        const env = parseSafeErrorEnvelope(json);
        const retryable = res.status >= 500 || res.status === 429;
        setError(env ? { ...env, retryable: env.retryable ?? retryable } : { code: `HTTP_${res.status}`, message: `Run analysis failed (${res.status}).`, retryable });
        return;
      }

      router.refresh();
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError({ code: "NETWORK_ERROR", message, retryable: true });
    } finally {
      setPending(false);
    }
  }

  const blocked = props.readiness.state !== "ready";
  const disabledReason = blocked ? props.readiness.reason : undefined;
  const showInlineReason = blocked && props.readiness.state !== "already-complete";

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
        Run analysis
      </Button>
      {error ? (
        <ErrorBanner
          code={error.code}
          message={error.message}
          traceId={error.traceId}
          supportRoute={`/matters/${props.folderId}`}
          retryable={error.retryable}
          onRetry={error.retryable === true ? start : undefined}
          className="w-full max-w-md text-left"
        />
      ) : showInlineReason ? (
        <div className={readinessReasonClass(props.readiness.state)}>{props.readiness.reason}</div>
      ) : null}
    </div>
  );
}
