import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("skeleton rounded-ui-md", className)} aria-hidden {...props} />;
}

export function SkeletonLine({
  width,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { width?: string }) {
  return (
    <Skeleton
      className={cn("h-3.5 mb-2 last:mb-0", className)}
      style={width ? { width } : undefined}
      {...props}
    />
  );
}

export function SkeletonCircle({
  size = "2.5rem",
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { size?: string }) {
  return (
    <Skeleton
      className={cn("rounded-full", className)}
      style={{ width: size, height: size }}
      {...props}
    />
  );
}
