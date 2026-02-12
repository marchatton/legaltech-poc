import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

type WorkspaceShellFrameProps = {
  sidebar: ReactNode;
  children: ReactNode;
  className?: string;
};

export function WorkspaceShellFrame({ sidebar, children, className }: WorkspaceShellFrameProps) {
  return (
    <div className={cn("min-h-dvh bg-background", className)}>
      <div className="flex min-h-dvh w-full">
        {sidebar}
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}

export function WorkspaceContextBar({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <section
      className={cn("sticky top-0 z-20 border-b border-border/80 bg-background/95 backdrop-blur", className)}
      {...props}
    />
  );
}

export function WorkspaceContextBarBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex w-full items-center gap-3 px-6 py-2 lg:px-8", className)} {...props} />;
}
