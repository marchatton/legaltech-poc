"use client";

import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* ── TabList (the container with bottom border) ── */

export function TabList({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn("flex gap-0 border-b border-border", className)}
      {...props}
    />
  );
}

/* ── Tab (individual tab trigger) ── */

export type TabProps = HTMLAttributes<HTMLButtonElement> & {
  active?: boolean;
  icon?: ReactNode;
};

export function Tab({ className, active, icon, children, ...props }: TabProps) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      className={cn(
        "inline-flex items-center gap-2 px-5 py-2.5 text-sm font-medium -mb-px",
        "border-b-2 border-transparent cursor-pointer",
        "transition-colors duration-micro ease-brand-standard",
        "hover:text-foreground",
        active
          ? "text-primary border-b-primary"
          : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {icon}
      {children}
    </button>
  );
}

/* ── TabPanel (content panel) ── */

export function TabPanel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div role="tabpanel" className={cn("mt-4", className)} {...props} />;
}
