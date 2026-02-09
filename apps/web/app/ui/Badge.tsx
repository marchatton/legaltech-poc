import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type BadgeVariant = "muted" | "success" | "warning" | "destructive" | "info";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

export function badgeClassName(args?: { variant?: BadgeVariant; className?: string }) {
  const variant = args?.variant ?? "muted";
  return cn(
    "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset",
    variant === "success"
      ? "bg-success/10 text-success ring-success/20"
      : variant === "warning"
        ? "bg-warning/10 text-warning ring-warning/20"
        : variant === "destructive"
          ? "bg-destructive/10 text-destructive ring-destructive/20"
          : variant === "info"
            ? "bg-info/10 text-info ring-info/20"
            : "bg-muted text-muted-foreground ring-border/60",
    args?.className,
  );
}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={badgeClassName({ variant, className })} {...props} />;
}

