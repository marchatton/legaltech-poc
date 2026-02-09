import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* -------------------------------------------------------------------------- */
/*  AccordionGroup                                                            */
/* -------------------------------------------------------------------------- */

export function AccordionGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("rounded-ui-lg border border-border overflow-hidden divide-y divide-border", className)}
      {...props}
    />
  );
}

/* -------------------------------------------------------------------------- */
/*  AccordionItem                                                             */
/* -------------------------------------------------------------------------- */

export type AccordionItemProps = Omit<HTMLAttributes<HTMLDetailsElement>, "children"> & {
  trigger: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
};

export function AccordionItem({ className, trigger, children, defaultOpen, ...props }: AccordionItemProps) {
  return (
    <details className={cn("group", className)} open={defaultOpen || undefined} {...props}>
      <summary className="flex cursor-pointer list-none items-center justify-between gap-2 px-4 py-3.5 font-semibold text-sm text-foreground hover:bg-muted [&::-webkit-details-marker]:hidden">
        <span>{trigger}</span>
        <svg
          className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-standard ease-brand-standard group-open:rotate-180"
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </summary>
      <div className="px-4 pb-3.5 text-sm text-muted-foreground">{children}</div>
    </details>
  );
}
