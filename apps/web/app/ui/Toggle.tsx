"use client";

import { forwardRef, useId, type ButtonHTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

export type ToggleProps = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "onChange"> & {
  pressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  label?: ReactNode;
};

export const Toggle = forwardRef<HTMLButtonElement, ToggleProps>(
  function Toggle({ className, pressed, onPressedChange, label, ...props }, ref) {
    const labelId = useId();
    return (
      <div className={cn("inline-flex items-center gap-2 cursor-pointer text-sm", className)}>
        <button
          ref={ref}
          type="button"
          role="switch"
          aria-checked={pressed}
          aria-labelledby={label ? labelId : undefined}
          className={cn(
            "relative inline-flex h-6 w-11 shrink-0 items-center rounded-pill border-none cursor-pointer",
            "transition-colors duration-micro ease-brand-standard",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            pressed ? "bg-primary" : "bg-muted",
          )}
          onClick={() => onPressedChange?.(!pressed)}
          {...props}
        >
          <span
            className={cn(
              "pointer-events-none block h-[18px] w-[18px] rounded-full bg-card shadow-ui-sm",
              "transition-transform duration-standard ease-brand-standard",
              pressed ? "translate-x-[22px]" : "translate-x-[3px]",
            )}
          />
        </button>
        {label ? <span id={labelId}>{label}</span> : null}
      </div>
    );
  },
);
