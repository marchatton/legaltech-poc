import type { HTMLAttributes } from "react";

import { cn } from "./cn";

export type StepStatus = "pending" | "active" | "complete";

export type StepItem = {
  label: string;
  status: StepStatus;
};

export type StepsProps = HTMLAttributes<HTMLDivElement> & {
  items: StepItem[];
};

export function Steps({ items, className, ...props }: StepsProps) {
  return (
    <div className={cn("flex items-start", className)} {...props}>
      {items.map((step, i) => (
        <div key={step.label} className="relative flex flex-1 flex-col items-center gap-1.5">
          {/* Connector line */}
          {i < items.length - 1 && (
            <div
              className={cn(
                "absolute top-3.5 left-[calc(50%+20px)] right-[calc(-50%+20px)] h-0.5",
                step.status === "complete" ? "bg-primary" : "bg-border",
              )}
              aria-hidden="true"
            />
          )}
          {/* Dot */}
          <div
            className={cn(
              "relative z-10 flex h-7 w-7 items-center justify-center rounded-full border-2 text-xs font-semibold",
              step.status === "complete" &&
                "border-primary bg-primary text-primary-foreground",
              step.status === "active" &&
                "border-primary bg-card text-primary",
              step.status === "pending" &&
                "border-foreground/20 bg-card text-muted-foreground",
            )}
          >
            {step.status === "complete" ? (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m5 12 5 5L20 7" />
              </svg>
            ) : (
              i + 1
            )}
          </div>
          {/* Label */}
          <span
            className={cn(
              "text-xs text-center",
              step.status === "complete" && "text-primary",
              step.status === "active" && "text-primary font-semibold",
              step.status === "pending" && "text-muted-foreground",
            )}
          >
            {step.label}
          </span>
        </div>
      ))}
    </div>
  );
}
