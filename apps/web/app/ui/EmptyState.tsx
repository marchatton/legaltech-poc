import type { ReactNode } from "react";

import { cn } from "./cn";

export type EmptyStateVariant = "default" | "compact" | "large";

type EmptyStateProps = {
  icon?: ReactNode;
  title: string;
  description?: ReactNode;
  action?: ReactNode;
  variant?: EmptyStateVariant;
  animate?: boolean;
  className?: string;
  iconContainerClassName?: string;
};

const variantClasses: Record<EmptyStateVariant, { wrapper: string; icon: string; title: string; description: string }> = {
  default: {
    wrapper: "py-10 px-6",
    icon: "h-14 w-14 rounded-ui-lg",
    title: "font-serif text-heading-sm font-medium",
    description: "text-sm",
  },
  compact: {
    wrapper: "py-6 px-4",
    icon: "h-10 w-10 rounded-ui-md",
    title: "text-sm font-medium",
    description: "text-xs",
  },
  large: {
    wrapper: "py-16 px-8",
    icon: "h-16 w-16 rounded-ui-xl",
    title: "font-serif text-heading-md font-medium",
    description: "text-sm",
  },
};

export function emptyStateClassName(args?: { variant?: EmptyStateVariant; animate?: boolean; className?: string }) {
  const variant = args?.variant ?? "default";
  const animate = args?.animate ?? true;
  return cn("text-center", variantClasses[variant].wrapper, animate && "animate-fade-in-up", args?.className);
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  variant = "default",
  animate = true,
  className,
  iconContainerClassName,
}: EmptyStateProps) {
  const v = variantClasses[variant];
  return (
    <div className={emptyStateClassName({ variant, animate, className })}>
      {icon ? (
        <div className={cn("mx-auto mb-4 flex items-center justify-center bg-muted text-muted-foreground", v.icon, iconContainerClassName)}>
          {icon}
        </div>
      ) : null}
      <p className={v.title}>{title}</p>
      {description ? (
        <p className={cn("mx-auto mt-1.5 max-w-xs text-muted-foreground", v.description)}>{description}</p>
      ) : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}
