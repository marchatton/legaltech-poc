import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type InlineStatusKind = "idle" | "loading" | "success" | "error" | "warning";

export type InlineStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  kind: InlineStatusKind;
  dot?: boolean;
  icon?: ReactNode;
  children?: ReactNode;
};

const kindClasses: Record<InlineStatusKind, string> = {
  idle: "",
  loading: "text-muted-foreground",
  success: "text-success",
  error: "text-destructive",
  warning: "text-warning",
};

const dotClasses: Record<InlineStatusKind, string> = {
  idle: "",
  loading: "bg-muted-foreground",
  success: "bg-success",
  error: "bg-destructive",
  warning: "bg-warning",
};

export function InlineStatus({ kind, dot, icon, className, children, ...props }: InlineStatusProps) {
  if (kind === "idle") return null;

  const isError = kind === "error";
  const hasLeading = dot || icon;

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "text-xs font-medium",
        hasLeading ? "inline-flex items-center gap-1.5" : false,
        kindClasses[kind],
        className,
      )}
      {...props}
    >
      {icon ? icon : dot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotClasses[kind])} aria-hidden="true" /> : null}
      {children}
    </div>
  );
}
