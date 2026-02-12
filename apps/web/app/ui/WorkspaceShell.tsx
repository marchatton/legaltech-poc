import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* ── Shell frame: sidebar + main content column ── */

type WorkspaceShellFrameProps = {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WorkspaceShellFrame({ sidebar, children, className }: WorkspaceShellFrameProps) {
  return (
    <div className={cn("flex min-h-dvh w-full bg-background overflow-hidden", className)}>
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">{children}</div>
    </div>
  );
}

/* ── Context bar: sticky header with breadcrumb + metadata ── */

export function WorkspaceContextBar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "sticky top-0 z-20 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card px-6",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceContextBarBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full items-center gap-3", className)} {...props} />;
}
