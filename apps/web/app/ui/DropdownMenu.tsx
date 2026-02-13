import { useCallback, type HTMLAttributes, type KeyboardEvent } from "react";

import { cn } from "./cn";

/* ── DropdownMenu (the menu container) ── */

export type DropdownMenuProps = HTMLAttributes<HTMLDivElement> & {
  closing?: boolean;
};

export function DropdownMenu({ className, closing, onKeyDown, ...props }: DropdownMenuProps) {
  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      onKeyDown?.(e);
      if (e.defaultPrevented) return;
      const items = Array.from(
        e.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]:not([aria-disabled="true"])'),
      );
      if (!items.length) return;
      const current = items.indexOf(document.activeElement as HTMLElement);
      let next = -1;
      if (e.key === "ArrowDown") {
        next = current < items.length - 1 ? current + 1 : 0;
      } else if (e.key === "ArrowUp") {
        next = current > 0 ? current - 1 : items.length - 1;
      } else if (e.key === "Home") {
        next = 0;
      } else if (e.key === "End") {
        next = items.length - 1;
      }
      if (next >= 0) {
        e.preventDefault();
        items[next].focus();
      }
    },
    [onKeyDown],
  );

  return (
    <div
      role="menu"
      className={cn(
        "min-w-[200px] rounded-ui-lg border border-border bg-popover p-1 shadow-ui-lg",
        closing ? "animate-fade-out" : "animate-fade-in",
        className,
      )}
      onKeyDown={handleKeyDown}
      {...props}
    />
  );
}

/* ── DropdownItem ── */

export type DropdownItemProps = HTMLAttributes<HTMLButtonElement> & {
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
    <button
      type="button"
      role="menuitem"
      disabled={disabled}
      className={cn(
        "flex w-full items-center gap-2 rounded-ui-md px-3 py-2 text-sm text-left cursor-pointer",
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
    </button>
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
