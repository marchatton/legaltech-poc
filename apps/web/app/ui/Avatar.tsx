import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type AvatarSize = "sm" | "md" | "lg";
export type AvatarVariant = "primary" | "muted" | "secondary" | "accent";

export type AvatarProps = HTMLAttributes<HTMLSpanElement> & {
  size?: AvatarSize;
  variant?: AvatarVariant;
};

const sizeClasses: Record<AvatarSize, string> = {
  sm: "h-7 w-7 text-2xs",
  md: "h-9 w-9 text-sm",
  lg: "h-12 w-12 text-[17px]",
};

const variantClasses: Record<AvatarVariant, string> = {
  primary: "bg-primary text-primary-foreground",
  muted: "bg-muted text-muted-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  accent: "bg-accent text-accent-foreground",
};

export function avatarClassName(args?: {
  size?: AvatarSize;
  variant?: AvatarVariant;
  className?: string;
}) {
  const size = args?.size ?? "md";
  const variant = args?.variant ?? "muted";
  return cn(
    "inline-flex items-center justify-center rounded-full font-semibold shrink-0",
    sizeClasses[size],
    variantClasses[variant],
    args?.className,
  );
}

export function Avatar({ className, size, variant, ...props }: AvatarProps) {
  return <span className={avatarClassName({ size, variant, className })} {...props} />;
}

/* ── AvatarGroup ── */

export function AvatarGroup({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "flex [&>*]:-ml-2 [&>*]:border-2 [&>*]:border-card [&>*:first-child]:ml-0",
        className,
      )}
      {...props}
    />
  );
}
