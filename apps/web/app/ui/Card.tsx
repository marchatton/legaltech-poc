import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type CardVariant = "default" | "muted" | "interactive";

export type CardProps = HTMLAttributes<HTMLDivElement> & {
  variant?: CardVariant;
};

const variantClasses: Record<CardVariant, string> = {
  default: "bg-card shadow-ui-sm",
  muted: "bg-muted shadow-none",
  interactive:
    "bg-card shadow-ui-sm transition-[transform,box-shadow,border-color] duration-micro ease-brand-standard hover:-translate-y-0.5 hover:shadow-ui-md hover:border-foreground/15",
};

export function Card({ className, variant = "default", ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-ui-lg border border-border text-card-foreground",
        "transition-[background-color,border-color] duration-standard ease-brand-standard",
        variantClasses[variant],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-start justify-between gap-3", className)} {...props} />;
}

export function CardTitle({ className, ...props }: HTMLAttributes<HTMLHeadingElement>) {
  return <h3 className={cn("font-serif text-[17px] font-medium", className)} {...props} />;
}

export function CardBody({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("text-sm text-muted-foreground leading-relaxed", className)} {...props} />;
}

export function CardFooter({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("mt-4 pt-3 border-t border-border flex gap-4 font-mono text-xs text-muted-foreground", className)}
      {...props}
    />
  );
}
