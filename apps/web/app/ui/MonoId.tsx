import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type MonoIdVariant = "default" | "inverted";

export type MonoIdProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: MonoIdVariant;
};

const variantClasses: Record<MonoIdVariant, string> = {
  default: "bg-muted text-muted-foreground",
  inverted: "bg-foreground text-background",
};

export function MonoId({ className, variant = "default", ...props }: MonoIdProps) {
  return (
    <span
      className={cn("rounded-ui-sm px-2 py-0.5 font-mono text-xs", variantClasses[variant], className)}
      {...props}
    />
  );
}
