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

const DEFAULT_LINE_WIDTHS = ["80%", "100%", "60%"];

export function SkeletonBlock({
  lines = 3,
  circle = false,
  className,
  ...props
}: HTMLAttributes<HTMLDivElement> & { lines?: number; circle?: boolean }) {
  return (
    <div className={cn("rounded-ui-lg border border-border bg-card p-5", className)} aria-hidden {...props}>
      <div className={cn(circle && "flex items-start gap-4")}>
        {circle ? <SkeletonCircle /> : null}
        <div className="flex-1">
          {Array.from({ length: lines }, (_, i) => (
            <SkeletonLine
              key={i}
              width={DEFAULT_LINE_WIDTHS[i % DEFAULT_LINE_WIDTHS.length]}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
