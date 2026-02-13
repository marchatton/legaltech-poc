"use client";

import { useCallback, useRef, useState } from "react";

import { useTheme, type Theme } from "./ThemeProvider";
import { DropdownMenu } from "./DropdownMenu";
import { cn } from "./cn";
import { useClickOutside } from "./useClickOutside";
import { useEscapeKey } from "./useEscapeKey";

const options: { value: Theme; label: string }[] = [
  { value: "light", label: "Light" },
  { value: "system", label: "System" },
  { value: "dark", label: "Dark" },
];

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);
  const close = useCallback(() => setOpen(false), []);

  useClickOutside(rootRef, close);
  useEscapeKey(close, open);

  const active = options.find((opt) => opt.value === theme) ?? options[1];

  return (
    <div
      ref={rootRef}
      className={cn(
        "relative inline-flex items-center",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        aria-label="Theme"
        aria-haspopup="true"
        aria-expanded={open}
        className={cn(
          "inline-flex items-center gap-2 rounded-pill border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground shadow-ui-sm transition-colors duration-micro ease-brand-standard hover:bg-muted",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
        )}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
          <path d="M12 3v2" />
          <path d="M12 19v2" />
          <path d="M3 12h2" />
          <path d="M19 12h2" />
          <path d="m5.6 5.6 1.4 1.4" />
          <path d="m17 17 1.4 1.4" />
          <path d="m5.6 18.4 1.4-1.4" />
          <path d="m17 7 1.4-1.4" />
          <circle cx="12" cy="12" r="3.5" />
        </svg>
        <span>{active.label}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>

      {open ? (
        <DropdownMenu className="absolute right-0 top-[calc(100%+0.375rem)] min-w-[9rem] p-1">
          {options.map((opt) => {
            const selected = theme === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                role="menuitemradio"
                aria-checked={selected}
                onClick={() => {
                  setTheme(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex w-full items-center justify-between rounded-ui-md px-2.5 py-2 text-left text-xs font-medium transition-colors duration-micro ease-brand-standard",
                  selected ? "bg-muted text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <span>{opt.label}</span>
                {selected ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-3.5" aria-hidden="true">
                    <path d="m5 13 4 4L19 7" />
                  </svg>
                ) : null}
              </button>
            );
          })}
        </DropdownMenu>
      ) : null}
    </div>
  );
}
