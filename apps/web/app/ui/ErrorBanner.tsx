"use client";

import React, { type ReactNode } from "react";

import { Button } from "./Button";
import { cn } from "./cn";

const DEFAULT_SUPPORT_MAILTO_TARGET = process.env.NEXT_PUBLIC_SUPPORT_ESCALATION_MAILTO;

export type ErrorBannerProps = {
  code: string;
  message: string;
  title?: ReactNode;
  traceId?: string;
  retryable?: boolean;
  onRetry?: () => void;
  retryLabel?: string;
  showSupportAction?: boolean;
  supportLabel?: string;
  supportRoute?: string;
  supportTarget?: string;
  className?: string;
  children?: ReactNode;
};

function toNonEmptyString(value: string | undefined): string | null {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
}

function supportContextValue(value: string | undefined): string {
  return toNonEmptyString(value) ?? "n/a";
}

function looksLikeEmailAddress(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function currentRouteFromWindow(): string | undefined {
  if (typeof window === "undefined") return undefined;
  const path = `${window.location.pathname}${window.location.search}`;
  return toNonEmptyString(path) ?? undefined;
}

export function resolveSupportMailtoTarget(value: string | undefined): string | null {
  const trimmed = toNonEmptyString(value);
  if (!trimmed) return null;

  if (trimmed.startsWith("mailto:")) {
    return toNonEmptyString(trimmed.slice("mailto:".length)) ? trimmed : null;
  }

  return looksLikeEmailAddress(trimmed) ? `mailto:${trimmed}` : null;
}

export function buildSupportMailtoHref(args: {
  target: string;
  code: string;
  traceId?: string;
  route?: string;
}): string {
  const subject = `Orbital support request: ${supportContextValue(args.code)}`;
  const body = [
    "Please help investigate this Orbital error.",
    "",
    `code: ${supportContextValue(args.code)}`,
    `trace_id: ${supportContextValue(args.traceId)}`,
    `route: ${supportContextValue(args.route)}`,
  ].join("\n");

  const separator = args.target.includes("?") ? "&" : "?";
  return `${args.target}${separator}subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

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
  showSupportAction = true,
  supportLabel = "Need help?",
  supportRoute,
  supportTarget,
  className,
  children,
}: ErrorBannerProps) {
  const showRetry = Boolean(onRetry) && retryable === true;
  const routeContext = toNonEmptyString(supportRoute) ?? undefined;
  const resolvedSupportTarget = resolveSupportMailtoTarget(supportTarget ?? DEFAULT_SUPPORT_MAILTO_TARGET);
  const showSupportCta = showSupportAction && Boolean(resolvedSupportTarget);
  const showSupportFallback = showSupportAction && !resolvedSupportTarget;

  const openSupportChannel = React.useCallback(() => {
    if (!resolvedSupportTarget || typeof window === "undefined") return;
    const href = buildSupportMailtoHref({
      target: resolvedSupportTarget,
      code,
      traceId,
      route: routeContext ?? currentRouteFromWindow(),
    });
    window.location.assign(href);
  }, [code, resolvedSupportTarget, routeContext, traceId]);

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

          {showRetry || showSupportCta ? (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              {showRetry ? (
                <Button type="button" size="sm" variant="secondary" onClick={onRetry}>
                  {retryLabel}
                </Button>
              ) : null}
              {showSupportCta ? (
                <Button type="button" size="sm" variant="secondary" onClick={openSupportChannel}>
                  {supportLabel}
                </Button>
              ) : null}
            </div>
          ) : null}

          {showSupportFallback ? (
            <div className="mt-3 rounded-ui-sm border border-border/60 bg-card p-2 text-2xs text-muted-foreground">
              <div>Support channel is not configured. Share these identifiers with your support contact:</div>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span className="rounded-ui-sm bg-destructive/10 px-2 py-0.5 font-mono text-destructive">code: {code}</span>
                <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-muted-foreground">
                  trace_id: {supportContextValue(traceId)}
                </span>
                <span className="rounded-ui-sm bg-muted px-2 py-0.5 font-mono text-muted-foreground">
                  route: {supportContextValue(routeContext ?? "current page route")}
                </span>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
