"use client";

import { useEffect, useState, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

export type ToastVariant = "success" | "error" | "warning" | "info";

export type ToastProps = HTMLAttributes<HTMLDivElement> & {
  variant?: ToastVariant;
  title?: ReactNode;
  description?: ReactNode;
  icon?: ReactNode;
  onClose?: () => void;
  /** Auto-dismiss after this many ms. Set to 0 to disable. Default 5000. */
  duration?: number;
};

const iconBgClasses: Record<ToastVariant, string> = {
  success: "bg-success/10 text-success",
  error: "bg-destructive/10 text-destructive",
  warning: "bg-warning/10 text-warning",
  info: "bg-info/10 text-info",
};

function DefaultToastIcon({ variant }: { variant: ToastVariant }) {
  const cls = "shrink-0";
  if (variant === "success") {
    return (
      <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m5 12 5 5L20 7" />
      </svg>
    );
  }
  if (variant === "error") {
    return (
      <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m18 6-12 12" /><path d="m6 6 12 12" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M12 9v4" /><path d="M12 17h.01" />
      </svg>
    );
  }
  return (
    <svg className={cls} width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 16v-4" /><path d="M12 8h.01" />
    </svg>
  );
}

export function Toast({
  className,
  variant = "info",
  title,
  description,
  icon,
  onClose,
  duration = 5000,
  ...props
}: ToastProps) {
  const [exiting, setExiting] = useState(false);

  useEffect(() => {
    if (duration <= 0 || !onClose) return;
    const timer = setTimeout(() => {
      setExiting(true);
    }, duration);
    return () => clearTimeout(timer);
  }, [duration, onClose]);

  useEffect(() => {
    if (!exiting) return;
    const timer = setTimeout(() => onClose?.(), 200);
    return () => clearTimeout(timer);
  }, [exiting, onClose]);

  const handleClose = () => {
    setExiting(true);
  };

  return (
    <div
      role="alert"
      className={cn(
        "flex items-start gap-3 rounded-ui-lg border border-border bg-card p-4 shadow-ui-md",
        exiting ? "animate-fade-out" : "animate-fade-in",
        className,
      )}
      {...props}
    >
      <div
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
          iconBgClasses[variant],
        )}
      >
        {icon ?? <DefaultToastIcon variant={variant} />}
      </div>
      <div className="min-w-0 flex-1">
        {title && <div className="text-sm font-semibold">{title}</div>}
        {description && (
          <div className={cn("text-sm text-muted-foreground", title && "mt-0.5")}>
            {description}
          </div>
        )}
      </div>
      {onClose && (
        <button
          type="button"
          onClick={handleClose}
          className="shrink-0 rounded-ui-sm text-muted-foreground hover:text-foreground transition-colors duration-micro focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          aria-label="Dismiss"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m18 6-12 12" /><path d="m6 6 12 12" />
          </svg>
        </button>
      )}
    </div>
  );
}

/* ── ToastStack (container for multiple toasts) ── */

export function ToastStack({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      aria-live="polite"
      className={cn("fixed bottom-4 right-4 z-[100] flex flex-col gap-2.5 max-w-sm w-full", className)}
      {...props}
    />
  );
}
