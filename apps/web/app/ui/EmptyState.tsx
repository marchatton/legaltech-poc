import type { ReactNode } from "react";

import { cn } from "./cn";

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("text-center py-10 px-6", className)}>
      {icon ? (
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-ui-lg bg-muted text-muted-foreground">
          {icon}
        </div>
      ) : null}
      <p className="font-serif text-heading-sm font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
