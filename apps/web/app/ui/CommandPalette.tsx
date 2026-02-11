"use client";

import { forwardRef, type HTMLAttributes, type InputHTMLAttributes, type ReactNode } from "react";

import { cn } from "./cn";

/* ── CommandPalette (outer shell) ── */

export function CommandPalette({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="dialog"
      className={cn(
        "w-full max-w-[520px] overflow-hidden rounded-ui-xl border border-border bg-popover shadow-ui-lg",
        "animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

/* ── CommandInput ── */

export const CommandInput = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  function CommandInput({ className, ...props }, ref) {
    return (
      <input
        ref={ref}
        className={cn(
          "w-full border-0 border-b border-border bg-transparent px-5 py-4 text-base text-foreground outline-none",
          "placeholder:text-muted-foreground",
          className,
        )}
        {...props}
      />
    );
  },
);

/* ── CommandGroup (section within palette) ── */

export type CommandGroupProps = HTMLAttributes<HTMLDivElement> & {
  heading?: string;
};

export function CommandGroup({ heading, className, children, ...props }: CommandGroupProps) {
  return (
    <div className={cn("p-2", className)} {...props}>
      {heading && (
        <div className="px-3 py-1.5 font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground">
          {heading}
        </div>
      )}
      {children}
    </div>
  );
}

/* ── CommandItem ── */

export type CommandItemProps = HTMLAttributes<HTMLDivElement> & {
  icon?: ReactNode;
  shortcut?: string;
  active?: boolean;
};

export function CommandItem({
  className,
  icon,
  shortcut,
  active,
  children,
  ...props
}: CommandItemProps) {
  return (
    <div
      role="option"
      aria-selected={active}
      className={cn(
        "flex items-center gap-2.5 rounded-ui-md px-3 py-2 cursor-pointer",
        "transition-colors duration-micro ease-brand-standard",
        "hover:bg-muted",
        active && "bg-muted",
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex h-[18px] w-[18px] shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      )}
      <span className="flex-1 text-sm">{children}</span>
      {shortcut && (
        <span className="font-mono text-2xs text-muted-foreground">{shortcut}</span>
      )}
    </div>
  );
}
