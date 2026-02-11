import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type AlertVariant = "info" | "success" | "warning" | "destructive";

export type AlertProps = HTMLAttributes<HTMLDivElement> & {
  variant?: AlertVariant;
  title?: ReactNode;
  icon?: ReactNode;
  hideIcon?: boolean;
  action?: ReactNode;
};

const variantClasses: Record<AlertVariant, string> = {
  info: "bg-info/[0.06] border-info/20",
  success: "bg-success/[0.06] border-success/20",
  warning: "bg-warning/[0.06] border-warning/20",
  destructive: "bg-destructive/[0.06] border-destructive/20",
};

const iconColorClasses: Record<AlertVariant, string> = {
  info: "text-info",
  success: "text-success",
  warning: "text-warning",
  destructive: "text-destructive",
};

function DefaultIcon({ variant }: { variant: AlertVariant }) {
  const cls = cn("shrink-0 mt-0.5", iconColorClasses[variant]);
  if (variant === "success") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <path d="m9 11 3 3L22 4" />
      </svg>
    );
  }
  if (variant === "warning") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }
  if (variant === "destructive") {
    return (
      <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }
  // info (default)
  return (
    <svg className={cls} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4" />
      <path d="M12 8h.01" />
    </svg>
  );
}

export function alertClassName(args?: { variant?: AlertVariant; className?: string }) {
  const variant = args?.variant ?? "info";
  return cn(
    "flex gap-3 items-start rounded-ui-md border p-4 text-sm",
    variantClasses[variant],
    args?.className,
  );
}

export function Alert({ className, variant = "info", title, icon, hideIcon, action, children, ...props }: AlertProps) {
  return (
    <div className={alertClassName({ variant, className })} role="alert" {...props}>
      {!hideIcon && (icon ?? <DefaultIcon variant={variant} />)}
      <div className="min-w-0">
        {title ? <div className="font-semibold text-foreground">{title}</div> : null}
        {children ? <div className={cn(title && "mt-1", "text-xs text-muted-foreground")}>{children}</div> : null}
        {action ? <div className="mt-3 flex items-center gap-2">{action}</div> : null}
      </div>
    </div>
  );
}
