"use client";

import { useState } from "react";

import { useRouter } from "next/navigation";

import { parseSafeErrorEnvelope, type SafeErrorDisplay } from "../../../../lib/safeErrorDisplay";

import { QUICK_START_IDEMPOTENCY_KEY, type QuickStartReadiness } from "./QuickStartPanel";
import { Button } from "../../../ui/Button";
import { ErrorBanner } from "../../../ui/ErrorBanner";
import { Tooltip } from "../../../ui/Tooltip";
import { cn } from "../../../ui/cn";

export type QuickStartActionButtonAppearance = "icon" | "button";

type Props = {
  folderId: string;
  readiness: QuickStartReadiness;
  appearance?: QuickStartActionButtonAppearance;
  align?: "end" | "center";
};

function RunAnalysisIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-4" aria-hidden="true">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
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
  const appearance = props.appearance ?? "icon";
  const align = props.align ?? "end";
  const iconOnly = appearance === "icon";
  const disabled = blocked || pending;

  return (
    <div
      className={cn(
        "grid gap-2",
        align === "center" ? "justify-items-center" : "justify-items-end",
      )}
    >
      {iconOnly ? (
        <Tooltip content="Run analysis" position="bottom" className="inline-flex">
          <span className="inline-flex">
            <Button
              type="button"
              onClick={start}
              disabled={disabled}
              className="size-10 p-0"
              title={disabledReason}
              aria-label="Run analysis"
            >
              <RunAnalysisIcon />
            </Button>
          </span>
        </Tooltip>
      ) : (
        <Button
          type="button"
          onClick={start}
          loading={pending}
          disabled={disabled}
          className="h-10 px-5 text-sm"
          title={disabledReason}
        >
          Run analysis
        </Button>
      )}
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
      ) : null}
    </div>
  );
}
