"use client";

import React, { type ReactNode } from "react";

import { Button } from "./Button";
import { cn } from "./cn";

export type ErrorBannerProps = {
  code: string;
  message: string;
  title?: ReactNode;
  traceId?: string;
  retryable?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  className?: string;
  children?: ReactNode;
};

function ErrorIcon() {
  return (
    <svg
      className="mt-0.5 shrink-0 text-destructive"
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="m15 9-6 6" />
      <path d="m9 9 6 6" />
    </svg>
  );
}

export function ErrorBanner({
  code,
  message,
  title = "Operation failed",
  traceId,
  retryable,
  onRetry,
  retryLabel = "Retry",
  className,
  children,
}: ErrorBannerProps) {
  const showRetry = Boolean(onRetry) && retryable !== false;

  return (
    <div className={cn("rounded-ui-md border border-destructive/20 bg-destructive/[0.06] p-3", className)} role="alert">
      <div className="flex items-start gap-2">
        <ErrorIcon />
        <div className="min-w-0 flex-1">
          <div className="text-sm font-semibold text-foreground">{title}</div>
          <div className="mt-1 text-xs text-muted-foreground">{message}</div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-2xs">
            <span className="rounded-ui-sm bg-destructive/10 px-2 py-0.5 font-mono text-destructive">
              code: {code}
            </span>
            {traceId ? (
              <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-muted-foreground">
                trace_id: {traceId}
              </span>
            ) : null}
          </div>

          {children ? <div className="mt-3">{children}</div> : null}

          {showRetry ? (
            <div className="mt-3">
              <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
                {retryLabel}
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
