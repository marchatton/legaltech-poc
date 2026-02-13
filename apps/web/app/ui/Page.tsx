import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

/* ── Page (outer container) ── */

export type PageWidth = "sm" | "md" | "lg" | "xl" | "full";

const widthClasses: Record<PageWidth, string> = {
  sm: "max-w-3xl",
  md: "max-w-5xl",
  lg: "max-w-6xl",
  xl: "max-w-7xl",
  full: "",
};

export function Page({
  children,
  width = "md",
  className,
  ...props
}: HTMLAttributes<HTMLElement> & { width?: PageWidth }) {
  return (
    <main
      id="main-content"
      className={cn("mx-auto w-full px-6 py-10 sm:px-8 animate-fade-in", widthClasses[width], className)}
      {...props}
    >
      {children}
    </main>
  );
}

/* ── PageHeader (title + optional subtitle + right slot) ── */

export function PageHeader({
  title,
  subtitle,
  right,
  className,
}: {
  title: ReactNode;
  subtitle?: ReactNode;
  right?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-wrap items-end justify-between gap-4", className)}>
      <div>
        <h1 className="font-serif text-heading-lg font-normal">{title}</h1>
        {subtitle ? <div className="mt-2 text-sm text-muted-foreground">{subtitle}</div> : null}
      </div>
      {right}
    </div>
  );
}

/* ── PageSection (spacing between blocks) ── */

export function PageSection({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <section className={cn("mt-8", className)} {...props} />;
}

/* ── SectionTitle (in-card heading with accent bar) ── */

export function SectionTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn(
        "relative pl-3 text-sm font-semibold text-foreground before:absolute before:left-0 before:top-0 before:h-full before:w-1 before:rounded-full before:bg-primary",
        className,
      )}
      {...props}
    />
  );
}

/* ── SectionLabel (mono overline label like in the design system) ── */

export function SectionLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "font-mono text-2xs font-semibold uppercase tracking-widest text-primary",
        className,
      )}
      {...props}
    />
  );
}
