"use client";

import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

export type RadioProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
};

export const Radio = forwardRef<HTMLInputElement, RadioProps>(
  function Radio({ className, label, id, ...props }, ref) {
    return (
      <label
        htmlFor={id}
        className={cn("inline-flex items-center gap-2 cursor-pointer text-sm", className)}
      >
        <input
          ref={ref}
          id={id}
          type="radio"
          className={cn(
            "peer h-[18px] w-[18px] shrink-0 appearance-none rounded-full border-2 border-foreground/20 bg-transparent cursor-pointer",
            "transition-colors duration-micro ease-brand-standard",
            "checked:border-primary",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
            "disabled:cursor-not-allowed disabled:opacity-60",
            "relative",
          )}
          {...props}
        />
        {label}
      </label>
    );
  },
);
