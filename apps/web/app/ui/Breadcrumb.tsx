import type { HTMLAttributes } from "react";

import Link from "next/link";

import { cn } from "./cn";

/* ── Breadcrumb (wrapper nav) ── */

export function Breadcrumb({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return (
    <nav
      aria-label="Breadcrumb"
      className={cn("flex items-center gap-1.5 text-sm text-muted-foreground", className)}
      {...props}
    />
  );
}

/* ── BreadcrumbItem ── */

export type BreadcrumbItemProps = HTMLAttributes<HTMLSpanElement> & {
  href?: string;
  current?: boolean;
};

export function BreadcrumbItem({
  className,
  href,
  current,
  children,
  ...props
}: BreadcrumbItemProps) {
  const inner = href && !current ? (
    <Link
      href={href}
      className="text-muted-foreground hover:text-primary transition-colors duration-micro"
    >
      {children}
    </Link>
  ) : (
    <span className={current ? "text-foreground font-medium" : undefined}>
      {children}
    </span>
  );

  return (
    <span
      className={cn("inline-flex items-center", className)}
      aria-current={current ? "page" : undefined}
      {...props}
    >
      {inner}
    </span>
  );
}

/* ── BreadcrumbSeparator ── */

export function BreadcrumbSeparator({
  className,
  children,
  ...props
}: HTMLAttributes<HTMLSpanElement>) {
  return (
    <span
      className={cn("text-foreground/20 select-none", className)}
      aria-hidden="true"
      {...props}
    >
      {children ?? "/"}
    </span>
  );
}
