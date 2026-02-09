import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type BadgeVariant = "muted" | "primary" | "success" | "warning" | "destructive" | "info";
export type BadgeSize = "sm" | "md";

export type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
  size?: BadgeSize;
};

const variantClasses: Record<BadgeVariant, string> = {
  muted: "bg-muted text-muted-foreground ring-border/60",
  primary: "bg-primary/10 text-primary ring-primary/20",
  success: "bg-success/10 text-success ring-success/20",
  warning: "bg-warning/10 text-warning ring-warning/20",
  destructive: "bg-destructive/10 text-destructive ring-destructive/20",
  info: "bg-info/10 text-info ring-info/20",
};

const sizeClasses: Record<BadgeSize, string> = {
  sm: "text-2xs px-1.5 py-px",
  md: "text-xs px-2 py-0.5",
};

export function badgeClassName(args?: { variant?: BadgeVariant; size?: BadgeSize; className?: string }) {
  const variant = args?.variant ?? "muted";
  const size = args?.size ?? "md";
  return cn(
    "inline-flex items-center rounded-full font-medium ring-1 ring-inset",
    sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export function Badge({ className, variant, size, ...props }: BadgeProps) {
  return <span className={badgeClassName({ variant, size, className })} {...props} />;
}
