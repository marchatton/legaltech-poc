import Link from "next/link";
import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type WorkspaceTabItem = {
  id: string;
  label: string;
  href: string;
  count?: number | null;
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
      className={cn("overflow-x-auto rounded-ui-lg border border-border/80 bg-card/95 p-2 backdrop-blur", className)}
      {...props}
    >
      <ul className="flex min-w-max items-center gap-0" role="list">
        {items.map((item) => {
          const isActive = item.id === activeId;
          return (
            <li key={item.id}>
              <Link
                href={item.href}
                aria-current={isActive ? "page" : undefined}
                className={cn(
                  "inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-5 py-2.5 text-sm font-medium",
                  "transition-colors duration-micro ease-brand-standard",
                  isActive
                    ? "border-b-primary text-primary"
                    : "border-b-transparent text-muted-foreground hover:text-foreground",
                )}
              >
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
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
