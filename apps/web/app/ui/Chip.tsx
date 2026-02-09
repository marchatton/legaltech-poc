import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type ChipVariant = "filter" | "citation";
export type ChipDot = "success" | "warning" | "destructive" | "muted";

export type ChipProps = HTMLAttributes<HTMLElement> & {
  variant?: ChipVariant;
  active?: boolean;
  dot?: ChipDot;
  as?: "span" | "button" | "a";
  href?: string;
};

const dotColors: Record<ChipDot, string> = {
  success: "bg-success",
  warning: "bg-warning",
  destructive: "bg-destructive",
  muted: "bg-muted-foreground",
};

export function chipClassName(args?: {
  variant?: ChipVariant;
  active?: boolean;
  className?: string;
}) {
  const variant = args?.variant ?? "filter";
  return cn(
    "inline-flex items-center gap-2 rounded-pill border border-border bg-card font-medium transition-colors duration-micro ease-brand-standard hover:border-foreground/20",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    variant === "citation" ? "font-mono text-2xs px-2.5 py-0.5" : "text-sm px-3 py-1",
    args?.active && "bg-primary/10 border-primary text-primary font-semibold",
    args?.className,
  );
}

export function Chip({ className, variant, active, dot, as = "span", href, children, ...props }: ChipProps) {
  const Tag = as as "span";
  return (
    <Tag
      className={chipClassName({ variant, active, className })}
      {...(as === "a" && href ? { href } : {})}
      {...props}
    >
      {dot ? <span className={cn("h-1.5 w-1.5 shrink-0 rounded-full", dotColors[dot])} aria-hidden="true" /> : null}
      {children}
    </Tag>
  );
}
