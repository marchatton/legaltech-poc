import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
};

export function alertClassName(args?: { variant?: AlertVariant; className?: string }) {
  const variant = args?.variant ?? "info";
  return cn(
    "flex gap-3 items-start rounded-ui-md border p-4 text-sm",
    variant === "success"
      ? "bg-success/[0.06] border-success/20"
      : variant === "warning"
        ? "bg-warning/[0.06] border-warning/20"
        : variant === "destructive"
          ? "bg-destructive/[0.06] border-destructive/20"
          : "bg-info/[0.06] border-info/20",
    args?.className,
  );
}

export function Alert({ className, variant, title, children, ...props }: AlertProps) {
  return (
    <div className={alertClassName({ variant, className })} role="alert" {...props}>
      <div>
        {title ? <div className="font-semibold">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1", "text-xs text-muted-foreground")}>{children}</div> : null}
      </div>
    </div>
  );
}
