import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn("rounded-ui-lg border border-border bg-card text-card-foreground shadow-ui-sm", className)}
      {...props}
    />
  );
}

