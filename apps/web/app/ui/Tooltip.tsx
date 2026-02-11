"use client";

import { useState, type HTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

export type TooltipPosition = "top" | "bottom" | "left" | "right";

export type TooltipProps = HTMLAttributes<HTMLDivElement> & {
  content: ReactNode;
  position?: TooltipPosition;
  delayMs?: number;
};

const positionClasses: Record<TooltipPosition, string> = {
  top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left: "right-full top-1/2 -translate-y-1/2 mr-2",
  right: "left-full top-1/2 -translate-y-1/2 ml-2",
};

const arrowClasses: Record<TooltipPosition, string> = {
  top: "top-full left-1/2 -translate-x-1/2 border-t-foreground border-x-transparent border-b-transparent",
  bottom: "bottom-full left-1/2 -translate-x-1/2 border-b-foreground border-x-transparent border-t-transparent",
  left: "left-full top-1/2 -translate-y-1/2 border-l-foreground border-y-transparent border-r-transparent",
  right: "right-full top-1/2 -translate-y-1/2 border-r-foreground border-y-transparent border-l-transparent",
};

export function Tooltip({
  content,
  position = "top",
  delayMs = 200,
  className,
  children,
  ...props
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [timeoutId, setTimeoutId] = useState<ReturnType<typeof setTimeout>>();

  function handleEnter() {
    const id = setTimeout(() => setOpen(true), delayMs);
    setTimeoutId(id);
  }

  function handleLeave() {
    clearTimeout(timeoutId);
    setOpen(false);
  }

  return (
    <div
      className={cn("relative inline-block", className)}
      onMouseEnter={handleEnter}
      onMouseLeave={handleLeave}
      onFocus={handleEnter}
      onBlur={handleLeave}
      {...props}
    >
      {children}
      {open && (
        <div
          role="tooltip"
          className={cn(
            "absolute z-50 px-3 py-1.5 bg-foreground text-background text-xs font-medium rounded-ui-md whitespace-nowrap shadow-ui-md",
            "animate-fade-in pointer-events-none",
            positionClasses[position],
          )}
        >
          {content}
          <span
            className={cn("absolute border-4", arrowClasses[position])}
            aria-hidden="true"
          />
        </div>
      )}
    </div>
  );
}
