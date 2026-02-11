import type { ReactNode } from "react";

import { cn } from "./cn";

export type BlockedStateVariant = "warning" | "destructive";

type BlockedStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  secondaryInfo?: ReactNode;
  variant?: BlockedStateVariant;
  className?: string;
};

const variantClasses: Record<BlockedStateVariant, { iconBg: string; iconColor: string }> = {
  warning: { iconBg: "bg-warning/10", iconColor: "text-warning" },
  destructive: { iconBg: "bg-destructive/10", iconColor: "text-destructive" },
};

function DefaultIcon({ variant }: { variant: BlockedStateVariant }) {
  if (variant === "destructive") {
    return (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="12" cy="12" r="10" />
        <path d="m15 9-6 6" />
        <path d="m9 9 6 6" />
      </svg>
    );
  }
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
    </svg>
  );
}

export function BlockedState({ icon, title, description, action, secondaryInfo, variant = "warning", className }: BlockedStateProps) {
  const v = variantClasses[variant];
  return (
    <div className={cn("text-center py-10 px-6 animate-fade-in-up", className)}>
      <div className={cn("mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-ui-lg", v.iconBg, v.iconColor)}>
        {icon ?? <DefaultIcon variant={variant} />}
      </div>
      <p className="font-serif text-heading-sm font-medium">{title}</p>
      {description ? (
        <p className="mx-auto mt-1.5 max-w-xs text-sm text-muted-foreground">{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
      {secondaryInfo ? <div className="mt-3 text-xs text-muted-foreground">{secondaryInfo}</div> : null}
    </div>
  );
}
