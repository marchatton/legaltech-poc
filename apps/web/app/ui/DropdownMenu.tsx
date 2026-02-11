import type { HTMLAttributes } from "react";

import { cn } from "./cn";

/* ── DropdownMenu (the menu container) ── */

export function DropdownMenu({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="menu"
      className={cn(
        "min-w-[200px] rounded-ui-lg border border-border bg-popover p-1 shadow-ui-lg",
        "animate-fade-in",
        className,
      )}
      {...props}
    />
  );
}

/* ── DropdownItem ── */

export type DropdownItemProps = HTMLAttributes<HTMLDivElement> & {
  destructive?: boolean;
  icon?: React.ReactNode;
  shortcut?: string;
  disabled?: boolean;
};

export function DropdownItem({
  className,
  destructive,
  icon,
  shortcut,
  disabled,
  children,
  ...props
}: DropdownItemProps) {
  return (
    <div
      role="menuitem"
      tabIndex={disabled ? -1 : 0}
      aria-disabled={disabled}
      className={cn(
        "flex items-center gap-2 rounded-ui-md px-3 py-2 text-sm cursor-pointer",
        "transition-colors duration-micro ease-brand-standard",
        "hover:bg-muted",
        "focus-visible:outline-none focus-visible:bg-muted",
        destructive && "text-destructive hover:text-destructive",
        disabled && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {icon && <span className="shrink-0 text-muted-foreground">{icon}</span>}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="ml-auto font-mono text-2xs text-muted-foreground">{shortcut}</span>
      )}
    </div>
  );
}

/* ── DropdownSeparator ── */

export function DropdownSeparator({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="separator"
      className={cn("my-1 h-px bg-border", className)}
      {...props}
    />
  );
}

/* ── DropdownLabel (group heading) ── */

export function DropdownLabel({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "px-3 py-1.5 font-mono text-2xs font-semibold uppercase tracking-widest text-muted-foreground",
        className,
      )}
      {...props}
    />
  );
}
