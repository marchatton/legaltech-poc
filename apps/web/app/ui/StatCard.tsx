import type { HTMLAttributes, ReactNode } from "react";

import { cn } from "./cn";

export type StatChange = "up" | "down" | "neutral";

export type StatCardProps = HTMLAttributes<HTMLDivElement> & {
  value: ReactNode;
  label: string;
  change?: string;
  changeDirection?: StatChange;
};

const changeClasses: Record<StatChange, string> = {
  up: "text-success",
  down: "text-destructive",
  neutral: "text-muted-foreground",
};

export function StatCard({
  className,
  value,
  label,
  change,
  changeDirection = "neutral",
  ...props
}: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-ui-lg border border-border bg-card p-6 text-center",
        "transition-[transform,box-shadow] duration-standard ease-brand-standard",
        "hover:-translate-y-0.5 hover:shadow-ui-md",
        className,
      )}
      {...props}
    >
      <div className="font-serif text-heading-xl font-normal">{value}</div>
      <div className="mt-1 text-sm text-muted-foreground">{label}</div>
      {change && (
        <div className={cn("mt-1.5 text-xs font-semibold", changeClasses[changeDirection])}>
          {changeDirection === "up" && "\u2191 "}
          {changeDirection === "down" && "\u2193 "}
          {change}
        </div>
      )}
    </div>
  );
}
