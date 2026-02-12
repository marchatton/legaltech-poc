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
    <div
      className={cn(
        "flex min-h-[calc(100dvh-var(--app-topbar-height,3rem))] w-full bg-background overflow-x-hidden",
        className,
      )}
    >
      {sidebar}
      <div className="flex min-w-0 flex-1 flex-col">{children}</div>
    </div>
  );
}

/* ── Context bar: sticky header with breadcrumb + metadata ── */

export function WorkspaceContextBar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <header
      className={cn(
        "sticky top-[var(--app-topbar-height,3rem)] z-30 flex h-14 shrink-0 items-center justify-between border-b border-border bg-card/95 px-6 backdrop-blur",
        className,
      )}
      {...props}
    />
  );
}

export function WorkspaceContextBarBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full items-center gap-3", className)} {...props} />;
}
