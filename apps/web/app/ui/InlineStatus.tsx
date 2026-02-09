import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type InlineStatusKind = "idle" | "loading" | "success" | "error" | "warning";

export type InlineStatusProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  kind: InlineStatusKind;
  children?: ReactNode;
};

export function InlineStatus({ kind, className, children, ...props }: InlineStatusProps) {
  if (kind === "idle") return null;

  const isError = kind === "error";

  return (
    <div
      role={isError ? "alert" : "status"}
      aria-live={isError ? "assertive" : "polite"}
      className={cn(
        "text-xs font-medium",
        kind === "loading" && "text-muted-foreground",
        kind === "success" && "text-success",
        kind === "error" && "text-destructive",
        kind === "warning" && "text-warning",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
