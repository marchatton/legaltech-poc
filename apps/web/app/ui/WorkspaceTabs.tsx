import Link from "next/link";
import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type WorkspaceTabItem = {
  id: string;
  label: string;
  href: string;
  count?: number | null;
  icon?: ReactNode;
};

type WorkspaceTabsProps = HTMLAttributes<HTMLElement> & {
  items: WorkspaceTabItem[];
  activeId: string;
  ariaLabel: string;
};

export function WorkspaceTabs({ items, activeId, ariaLabel, className, ...props }: WorkspaceTabsProps) {
  return (
    <nav
      aria-label={ariaLabel}
      className={cn("flex gap-1 -mb-px overflow-x-auto", className)}
      {...props}
    >
      {items.map((item) => {
        const isActive = item.id === activeId;
        return (
          <Link
            key={item.id}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            className={cn(
              "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium",
              "transition-colors duration-micro ease-brand-standard",
              isActive
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground hover:border-border",
            )}
          >
            {item.icon ? <span className="shrink-0">{item.icon}</span> : null}
            {item.label}
            {typeof item.count === "number" ? (
              <span
                className={cn(
                  "rounded-full px-1.5 py-0.5 text-2xs font-semibold tabular-nums",
                  isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground",
                )}
              >
                {item.count}
              </span>
            ) : null}
          </Link>
        );
      })}
    </nav>
  );
}
